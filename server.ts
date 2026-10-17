import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  supabaseAdmin,
  authenticateRequest,
  isServerSupabaseConfigured,
  AuthenticatedUser
} from './src/lib/supabase-server.js';
import { DEFAULT_GENERATION_PROMPTS } from './serverPrompts.js';
import { pool } from './src/lib/db.js';
import { paymentGateway } from './src/services/payments/index.js';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Guard against ECONNREFUSED 127.0.0.1:5432 when DATABASE_URL is unset or local
const rawDbUrl = (process.env.DATABASE_URL || '').trim();
let directDbAvailable = Boolean(
  pool &&
  rawDbUrl &&
  !rawDbUrl.includes('127.0.0.1') &&
  !rawDbUrl.includes('localhost') &&
  !rawDbUrl.includes('::1')
);

function handleDirectDbError(context: string, err: any) {
  const code = err?.code || err?.errors?.[0]?.code || '';
  if (code === 'ECONNREFUSED' || String(err).includes('ECONNREFUSED')) {
    if (directDbAvailable) {
      console.warn(`[${context}] Direct Postgres connection refused. Switching to supabaseAdmin.`);
      directDbAvailable = false;
    }
    return;
  }
  console.warn(`[${context}] direct db query failed, falling back to supabaseAdmin:`, dbErrMessage(err));
}

function dbErrMessage(err: any): string {
  return err?.message || String(err);
}

// Initialize Google GenAI Client
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Custom request with authenticated user
interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Authentication Middleware
async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!isServerSupabaseConfigured()) {
    return res.status(503).json({
      error: 'Supabase is not configured. Please configure SUPABASE_URL and SUPABASE_SECRET_KEY in .env.'
    });
  }

  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Autentificare necesară. Token invalid sau expirat.' });
  }

  req.user = user;
  next();
}

// Admin Authorization Middleware
async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acces interzis. Rolul de administrator este necesar.' });
  }
  next();
}

// ====================================================================
// PUBLIC ENDPOINTS
// ====================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supabaseConfigured: isServerSupabaseConfigured()
  });
});

// Templates list (public)
app.get('/api/templates', async (req, res) => {
  if (!isServerSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Photo packages (public)
app.get('/api/photo-packages', async (req, res) => {
  if (!isServerSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('photo_packages')
      .select('*')
      .eq('is_active', true)
      .order('photos', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// AUTHENTICATED USER ENDPOINTS
// ====================================================================

// Get current profile
app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (directDbAvailable && pool) {
      try {
        const { rows } = await pool.query(
          'SELECT id, email, name, avatar_url, role, photo_balance, credit_balance, country, preferred_language, preferred_currency, created_at FROM public.profiles WHERE id = $1',
          [req.user!.id]
        );
        if (rows && rows.length > 0) {
          const p = rows[0];
          return res.json({
            id: p.id,
            email: p.email || req.user!.email,
            name: p.name || (p.email || 'User').split('@')[0],
            avatar_url: p.avatar_url || '',
            role: p.role || 'user',
            photo_balance: p.photo_balance ?? p.credit_balance ?? 0,
            credit_balance: p.photo_balance ?? p.credit_balance ?? 0,
            country: p.country || 'Moldova',
            preferred_language: p.preferred_language || 'ru',
            preferred_currency: p.preferred_currency || 'EUR',
            created_at: p.created_at
          });
        }
      } catch (dbErr) {
        handleDirectDbError('api/me', dbErr);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error || !data) {
      return res.json({
        id: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
        photo_balance: req.user!.creditBalance,
        credit_balance: req.user!.creditBalance,
        country: 'Moldova',
        preferred_language: 'ru',
        preferred_currency: 'EUR'
      });
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Uploads a buffer to Supabase Storage with automatic retry and exponential backoff.
 */
async function uploadToStorageWithRetry(
  bucket: string,
  storagePath: string,
  buffer: Buffer,
  contentType: string,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> {
  let lastError = '';
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: contentType || 'image/jpeg',
          upsert: true
        });

      if (!error) {
        console.log(`[storage] Successfully uploaded ${storagePath} to ${bucket} on attempt ${attempt}`);
        return { success: true };
      }
      lastError = error.message;
      console.warn(`[storage] Upload attempt ${attempt}/${maxRetries} failed for ${storagePath}: ${error.message}`);
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[storage] Upload attempt ${attempt}/${maxRetries} exception for ${storagePath}: ${lastError}`);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  return { success: false, error: lastError };
}

// Upload a user photo (to 'user-photos' storage bucket)
app.post('/api/photos', requireAuth, async (req: AuthRequest, res) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Imagine invalidă. Se acceptă doar fișiere de tip imagine.' });
  }

  const userId = req.user!.id;
  const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const storagePath = `${userId}/${photoId}.jpg`;

  try {
    // Convert Base64 dataURL to binary Buffer for Supabase Storage
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Upload to Supabase Storage 'user-photos' bucket with retry
    const uploadRes = await uploadToStorageWithRetry(
      'user-photos',
      storagePath,
      buffer,
      'image/jpeg',
      3
    );

    if (!uploadRes.success) {
      throw new Error(uploadRes.error || 'Upload error');
    }

    // 2. Insert metadata record in user_photos
    let record: any = null;
    try {
      const { data, error: dbError } = await supabaseAdmin
        .from('user_photos')
        .insert({
          user_id: userId,
          storage_path: storagePath,
          filename: filename || 'my_photo.jpg',
          mime_type: 'image/jpeg',
          file_size: buffer.length
        })
        .select('*')
        .single();

      if (!dbError && data) {
        record = data;
      }
    } catch {}

    if (!record && directDbAvailable && pool) {
      try {
        const { rows } = await pool.query(
          'INSERT INTO public.user_photos (user_id, storage_path, filename, mime_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [userId, storagePath, filename || 'my_photo.jpg', 'image/jpeg', buffer.length]
        );
        record = rows[0];
      } catch (dbErr) {
        handleDirectDbError('api/photos:insert', dbErr);
      }
    }

    // 3. Create URL for frontend display
    let url = '';
    try {
      const { data: signedData } = await supabaseAdmin.storage
        .from('user-photos')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
      url = signedData?.signedUrl || '';
    } catch {}
    if (!url) {
      const { data: pubData } = supabaseAdmin.storage
        .from('user-photos')
        .getPublicUrl(storagePath);
      url = pubData.publicUrl;
    }

    res.json({
      ...record,
      url
    });
  } catch (err: any) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Încărcarea fotografiei a eșuat: ' + err.message });
  }
});

// List user photos
app.get('/api/photos', requireAuth, async (req: AuthRequest, res) => {
  try {
    let photos: any[] = [];
    if (directDbAvailable && pool) {
      try {
        const { rows } = await pool.query(
          'SELECT * FROM public.user_photos WHERE user_id = $1 ORDER BY created_at DESC',
          [req.user!.id]
        );
        photos = rows || [];
      } catch (dbErr) {
        handleDirectDbError('api/photos', dbErr);
      }
    }

    if (!photos || photos.length === 0) {
      const { data, error } = await supabaseAdmin
        .from('user_photos')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });
      if (error && !photos) throw error;
      photos = data || [];
    }

    // Generate URLs for images
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        let url = '';
        try {
          const { data: signedData } = await supabaseAdmin.storage
            .from('user-photos')
            .createSignedUrl(photo.storage_path, 60 * 60 * 24 * 7);
          url = signedData?.signedUrl || '';
        } catch {}
        if (!url) {
          const { data: pubData } = supabaseAdmin.storage
            .from('user-photos')
            .getPublicUrl(photo.storage_path);
          url = pubData.publicUrl;
        }
        return {
          id: photo.id,
          userId: photo.user_id,
          url,
          filename: photo.filename,
          uploadedAt: photo.created_at,
          storagePath: photo.storage_path
        };
      })
    );

    res.json(photosWithUrls);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user selfie: bucket user-photos + DB row (jobs.user_photo_id -> NULL via FK)
app.delete('/api/photos/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('user_photos')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !photo) {
      return res.status(404).json({ error: 'Fotografia nu a fost găsită.' });
    }

    if (photo.storage_path) {
      const { error: rmErr } = await supabaseAdmin.storage
        .from('user-photos')
        .remove([photo.storage_path]);
      if (rmErr) console.warn('[photos/delete] storage', rmErr.message);
    }

    const { error: dbErr } = await supabaseAdmin
      .from('user_photos')
      .delete()
      .eq('id', photo.id)
      .eq('user_id', req.user!.id);

    if (dbErr) throw dbErr;

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to convert dataURL or fetch image buffer to Gemini inlineData
async function urlToGenerativePart(rawUrl: string) {
  if (!rawUrl) return null;
  let url = String(rawUrl).trim();

  const normalizeMime = (raw: string | null | undefined): string => {
    const base = (raw || 'image/jpeg').split(';')[0].trim().toLowerCase();
    if (base === 'image/jpg' || base === 'image/pjpeg') return 'image/jpeg';
    if (base === 'application/octet-stream') return 'image/jpeg';
    if (base.startsWith('image/')) return base;
    return 'image/jpeg';
  };

  if (url.startsWith('data:image/')) {
    const match = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=\s]+)$/);
    if (match && match[2].replace(/\s/g, '').length > 100) {
      return {
        inlineData: {
          mimeType: normalizeMime(match[1]),
          data: match[2].replace(/\s/g, '')
        }
      };
    }
    console.warn('[urlToGenerativePart] bad data-url');
    return null;
  }

  if (url.startsWith('/')) {
    url = `http://127.0.0.1:${PORT}${url}`;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://127.0.0.1:${PORT}/${url}`;
  }

  try {
    const resp = await fetch(url, {
      redirect: 'follow',
      headers: { Accept: 'image/*,*/*' }
    });
    if (!resp.ok) {
      console.warn('[urlToGenerativePart] fetch failed', resp.status, url.slice(0, 140));
      return null;
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    if (buffer.length < 100) {
      console.warn('[urlToGenerativePart] too small', buffer.length, url.slice(0, 140));
      return null;
    }
    const head = buffer.slice(0, 32).toString('utf8').toLowerCase();
    if (head.includes('<!doctype') || head.includes('<html')) {
      console.warn('[urlToGenerativePart] HTML instead of image', url.slice(0, 140));
      return null;
    }
    let mime = normalizeMime(resp.headers.get('content-type'));
    if (buffer[0] === 0xff && buffer[1] === 0xd8) mime = 'image/jpeg';
    else if (buffer[0] === 0x89 && buffer[1] === 0x50) mime = 'image/png';
    else if (buffer[0] === 0x52 && buffer[1] === 0x49) mime = 'image/webp';
    else if (buffer[0] === 0x47 && buffer[1] === 0x49) mime = 'image/gif';

    console.log('[urlToGenerativePart] ok', mime, buffer.length, 'bytes');
    return {
      inlineData: {
        mimeType: mime,
        data: buffer.toString('base64')
      }
    };
  } catch (err) {
    console.warn('[urlToGenerativePart] error', err);
  }
  return null;
}

async function loadPromptFromDb(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('generation_prompts')
      .select('body')
      .eq('key', key)
      .maybeSingle();
    if (error || !data?.body) return null;
    return String(data.body).trim() || null;
  } catch {
    return null;
  }
}

/** Replace {{placeholders}} in prompt body. Unknown keys become empty string. */
function fillPrompt(
  template: string,
  vars: Record<string, string | undefined | null>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    const v = vars[key];
    return v == null ? '' : String(v);
  }).replace(/\n{3,}/g, '\n\n').trim();
}

// ====================================================================
// GENERATION JOBS PIPELINE (Real AI + Atomic Photo Ledger)
// ====================================================================

// Create and trigger AI generation job
app.post('/api/generations', requireAuth, async (req: AuthRequest, res) => {
  const {
    templateId,
    userPhotoUrl,
    aspectRatio,
    mode = 'template',
    customReferenceUrl,
    partnerPhotoUrl,
    isPack = false,
    age,
    age2,
    heightCm,
    weightKg,
    extraPhotoUrls,
    partnerExtraPhotoUrls,
    editInstruction
  } = req.body;
  const userId = req.user!.id;

  if (
    !templateId &&
    !customReferenceUrl &&
    mode !== 'enhance' &&
    mode !== 'pinterest' &&
    mode !== 'refine'
  ) {
    return res.status(400).json({ error: 'Parametrul templateId sau customReferenceUrl este obligatoriu.' });
  }

  if (!userPhotoUrl) {
    return res.status(400).json({ error: 'Fotografia utilizatorului este obligatorie.' });
  }

  // 1. Fetch template from database or create dynamic Pinterest reference config
  let template: any = null;
  if (templateId) {
    const { data: tmpl, error: tmplError } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();
    if (!tmplError && tmpl) {
      template = tmpl;
    }
  }

  // Virtual modes (pinterest / enhance / refine) are not rows in templates table.
  // Keep in-memory config for names/cost; never write fake ids into generation_jobs.template_id (FK).
  let templateIsVirtual = false;
  if (!template) {
    templateIsVirtual = true;
    if (mode === 'refine' || mode === 'enhance') {
      template = {
        id: mode === 'refine' ? 'refine-edit' : 'enhance-quality',
        name_ro: mode === 'refine' ? 'Editare foto' : 'Îmbunătățire',
        name_ru: mode === 'refine' ? 'Правка фото' : 'Улучшение',
        name_en: mode === 'refine' ? 'Photo edit' : 'Enhance',
        photo_cost: 1,
        aspect_ratio: aspectRatio || '3:4',
        prompt: ''
      };
    } else {
      template = {
        id: 'custom-pinterest',
        name_ro: 'Referință Pinterest Personalizată',
        name_ru: 'Кастомный референс из Pinterest',
        name_en: 'Custom Pinterest Reference',
        photo_cost: 1,
        aspect_ratio: aspectRatio || '3:4',
        prompt: 'High-end Pinterest fashion editorial, cinematic studio lighting, elegant wardrobe and pose transferred from reference photo, 85mm lens portrait, European luxury aesthetic.'
      };
    }
  }

  // Resolution: accept quality ('1K'|'2K'|'4K') or legacy quality4k boolean
  const rawQuality = String(req.body.quality || '').toUpperCase();
  let imageQuality: '1K' | '2K' | '4K' =
    rawQuality === '1K' || rawQuality === '2K' || rawQuality === '4K'
      ? (rawQuality as '1K' | '2K' | '4K')
      : Boolean(req.body.quality4k)
        ? '4K'
        : '2K';
  const quality4k = imageQuality === '4K';
  const baseCost = Number(template.photo_cost ?? template.credit_cost ?? 1) || 1;
  // 1 photo for 1K/2K; 2 photos for 4K upgrade
  const effectivePhotoCost = imageQuality === '4K' ? Math.max(2, baseCost * 2) : baseCost;

  // Check if AI provider is configured
  if (!process.env.GEMINI_API_KEY || !aiClient) {
    return res.status(503).json({
      error: 'Generarea AI nu este configurată pe server: GEMINI_API_KEY lipsește în Secrets. Te rugăm să configurezi cheia Gemini în panoul de Secrets.'
    });
  }

  let jobId: string | null = null;

  try {
    // 2. Create job record in queued state
    const { data: jobRecord, error: jobCreateError } = await supabaseAdmin
      .from('generation_jobs')
      .insert({
        user_id: userId,
        // null for virtual modes — avoids FK generation_jobs_template_id_fkey
        template_id: templateIsVirtual ? null : template.id,
        status: 'queued',
        progress: 10,
        current_step_message: 'Verificare foto și autorizare...',
        provider_id: 'gemini-genai',
        photo_cost: effectivePhotoCost,
        aspect_ratio: aspectRatio || template.aspect_ratio || '3:4'
      })
      .select('id')
      .single();

    if (jobCreateError || !jobRecord) {
      throw new Error('Eroare la crearea înregistrării generării: ' + jobCreateError?.message);
    }

    jobId = jobRecord.id;

    // 3. ATOMICALLY DEDUCT PHOTOS using PostgreSQL stored procedure
    const { data: newBalance, error: deductError } = await supabaseAdmin
      .rpc('deduct_photos_for_generation', {
        p_user_id: userId,
        p_amount: effectivePhotoCost,
        p_template_id: templateIsVirtual ? null : template.id,
        p_template_name: template.name_ro || 'Photo Shoot',
        p_job_id: jobId
      });

    if (deductError) {
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: 'Foto insuficiente pentru această generare.'
        })
        .eq('id', jobId);

      return res.status(402).json({
        error: 'Foto insuficiente. Cumpără un pachet pentru a genera această fotografie.',
        required: effectivePhotoCost
      });
    }

    // 4. Update job to processing
    await supabaseAdmin
      .from('generation_jobs')
      .update({
        status: 'processing',
        progress: 35,
        current_step_message: 'Sinteză portret fotorealist prin Google Gemini...',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // 5. Execute REAL server-side AI generation with Gemini SDK
    let imageBase64Data: string | null = null;
    let mimeType = 'image/jpeg';
    /** Intermediate PASS1 (1K) — saved for debugging / gallery inspection */
    let pass1Base64: string | null = null;
    let pass1Mime = 'image/jpeg';
    let pass1SignedUrl: string | null = null;

    function recordPass1Intermediate(data: string, mime: string, label: string) {
      pass1Base64 = data;
      pass1Mime = mime || 'image/jpeg';
      console.log(`[generate] ${label} captured in memory (${data?.length || 0} chars). Upload deferred to end.`);
    }

    const SCENE_ANALYZE_PROMPT = `You are a photography director writing a scene brief for an AI image generator.

Analyze the reference photograph in extreme detail. Output ONLY a single dense English paragraph (no bullet lists, no markdown, no preamble).

Describe the COMPLETE scene so another model can recreate the same shot WITHOUT seeing this image and WITHOUT copying any person's face:
- Camera: exact framing (head-and-shoulders / waist-up / full body), camera height, angle (eye-level / slight low / high), approximate focal length feel (e.g. 35mm, 50mm, 85mm), depth of field
- Pose & Head/Neck Geometry: body orientation, torso lean, shoulder angle, exact neck tilt, head turn, chin height, gaze direction, arm and hand placement, weight distribution
- Wardrobe: garments, collar style, colors, fabrics, fit, accessories, shoes if visible
- Environment: location type, architecture, furniture, props, what is left/right/behind the subject
- Lighting: key light direction and quality (soft/hard), fill, rim, color temperature, time of day, reflections
- Color grade and mood: overall palette, contrast, atmosphere
- Composition: subject placement in frame, leading lines, background blur amount

STRICT RULES:
- Do NOT describe facial features, beard/mustache/stubble, age, gender presentation, skin, hair style/color, or identity of any person.
- Do NOT invent objects that are not visible.
- Prefer concrete visual facts over vague adjectives.
- Write as an executable scene prompt for photorealistic generation.`;

    async function analyzeSceneFromImage(url: string): Promise<string> {
      const part = await urlToGenerativePart(url);
      if (!part?.inlineData?.data) {
        throw new Error('Nu s-a putut încărca imaginea de referință pentru analiză.');
      }
      // Text+vision model for scene breakdown (not the image generator)
      const analysisModel =
        process.env.GEMINI_ANALYSIS_MODEL || 'gemini-2.5-flash';
      const promptText =
        (await loadPromptFromDb('scene_analyze')) ||
        DEFAULT_GENERATION_PROMPTS['scene_analyze'] ||
        SCENE_ANALYZE_PROMPT;
      try {
        const resp = await aiClient!.models.generateContent({
          model: analysisModel,
          contents: {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: part.inlineData.mimeType || 'image/jpeg',
                  data: part.inlineData.data
                }
              }
            ]
          }
        });
        const text =
          (resp as any)?.text ||
          (resp as any)?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text)
            .filter(Boolean)
            .join(' ') ||
          '';
        const cleaned = String(text).trim().replace(/\s+/g, ' ');
        if (cleaned.length < 40) {
          throw new Error('Analiza scenei a returnat un text prea scurt.');
        }
        return cleaned.slice(0, 2500);
      } catch (err: any) {
        console.error('[scene-analyze]', err?.message || err);
        throw new Error(
          'Nu s-a putut analiza referința Pinterest: ' + (err?.message || 'unknown')
        );
      }
    }

    const effectiveMode =
      mode === 'couple' || (mode === 'template' && partnerPhotoUrl)
        ? 'couple'
        : mode === 'pinterest' || customReferenceUrl
          ? 'pinterest'
          : mode === 'enhance'
            ? 'enhance'
            : mode === 'refine'
              ? 'refine'
              : 'template';

    const ageProvided = age !== undefined && age !== null && age !== '';
    const age2Provided = age2 !== undefined && age2 !== null && age2 !== '';
    const ageNum = ageProvided ? Number(age) : NaN;
    const age2Num = age2Provided ? Number(age2) : NaN;

    const age1Line =
      effectiveMode === 'couple'
        ? Number.isFinite(ageNum) && ageNum >= 1 && ageNum <= 120
          ? `Apparent age of Person A (left, [IDENTITY_A_PHOTOS]): strictly around ${Math.round(ageNum)} years. Preserve fresh, youthful skin elasticity, natural hair/beard color without unrequested gray hair, and a well-rested complexion; absolutely no premature aging, heavy eye bags, or exaggerated wrinkles.`
          : 'Apparent age of Person A (left, [IDENTITY_A_PHOTOS]): strictly preserve the exact natural biological age, hair/beard color, and youthful vitality seen in the IDENTITY photos. Render a fresh, well-rested complexion without premature aging, unrequested gray hair/beard, exaggerated skin folds, or eye bags.'
        : Number.isFinite(ageNum) && ageNum >= 1 && ageNum <= 120
          ? `Apparent age of the user [USER_IDENTITY_PHOTOS]: strictly around ${Math.round(ageNum)} years. Preserve fresh, youthful skin elasticity, natural hair/beard color without unrequested gray hair, and a well-rested complexion; absolutely no premature aging, heavy eye bags, or exaggerated wrinkles.`
          : 'Apparent age of the user [USER_IDENTITY_PHOTOS]: strictly preserve the exact natural biological age, hair/beard color, and youthful vitality seen in [USER_IDENTITY_PHOTOS]. Render a fresh, well-rested complexion without premature aging, unrequested gray hair/beard, exaggerated skin folds, or eye bags.';

    const age2Line =
      Number.isFinite(age2Num) && age2Num >= 1 && age2Num <= 120
        ? `Apparent age of Person B (right, [IDENTITY_B_PHOTOS]): strictly around ${Math.round(age2Num)} years. Preserve fresh, youthful skin elasticity, natural hair/beard color without unrequested gray hair, and a well-rested complexion; absolutely no premature aging, heavy eye bags, or exaggerated wrinkles.`
        : 'Apparent age of Person B (right, [IDENTITY_B_PHOTOS]): strictly preserve the exact natural biological age, hair/beard color, and youthful vitality seen in the IDENTITY photos. Render a fresh, well-rested complexion without premature aging, unrequested gray hair/beard, exaggerated skin folds, or eye bags.';

    const h = Number(heightCm);
    const w = Number(weightKg);
    const bodyLine = [
      Number.isFinite(h) && h >= 100 && h <= 250
        ? `If full body is visible, height about ${Math.round(h)} cm.`
        : '',
      Number.isFinite(w) && w >= 30 && w <= 250
        ? `Body build consistent with about ${Math.round(w)} kg (do not distort the face).`
        : ''
    ]
      .filter(Boolean)
      .join(' ');

    const antiAgingTokens =
      'wax figure face, Madame Tussauds wax look, silicone skin, plastic mannequin skin, airbrushed blur, beauty filter smoothing, porcelain doll face, oversized head, bobblehead proportions, missing neck, premature aging, exaggerated wrinkles, deep nasolabial folds, artificial eye bags, exaggerated under-eye puffiness, fake dark circles under eyes, tired exhausted eyes, muddy blotchy skin tone, unrequested hair color change, altered hair color, darkening blonde hair, bleaching hair, dyeing hair, wrong hair color, hair color mismatch with identity photos, altered hair texture, straightening curly or wavy hair, unrequested gray hair, gray beard, altered beard shape, shaving off beard, stubble instead of full beard, wrong beard color, altered eye color, double chin';

    // DB PROMPT 'avoid_default' HAS STRICT PRIORITY. Always load and preserve it!
    const avoidDefaultFromDb = await loadPromptFromDb('avoid_default');
    const baseAvoid = avoidDefaultFromDb
      ? (avoidDefaultFromDb.trim().startsWith('Avoid') || avoidDefaultFromDb.trim().startsWith('Избег')
          ? avoidDefaultFromDb.trim()
          : `Avoid: ${avoidDefaultFromDb.trim()}`)
      : (DEFAULT_GENERATION_PROMPTS['avoid_default'] ||
          `Avoid: ${antiAgingTokens}, distorted anatomy, extra fingers, unnatural hands, watermarks, logos, text overlays, and any face that does not match the IDENTITY photos.`);

    const negFromDb = (template.negative_prompt || template.negativePrompt || '').trim();
    const avoidLine = negFromDb ? `${baseAvoid}, ${negFromDb}` : baseAvoid;

    function formatExpression(exprRaw: string): string {
      const raw = exprRaw.trim();
      if (!raw) {
        return 'Естественное, живое и гармоничное выражение лица, точно передающее атмосферу и настроение сцены.';
      }
      const lower = raw.toLowerCase();
      let desc = raw;
      if (lower.includes('soft') && lower.includes('smile')) {
        desc = 'Мягкая естественная улыбка с сомкнутыми губами (Soft closed-mouth smile): живой теплый взгляд, уголки губ мягко приподняты, лицо расслаблено.';
      } else if (lower.includes('wide smile') || lower.includes('laugh')) {
        desc = 'Широкая открытая и жизнерадостная улыбка (Wide smile / laughing): открытый взгляд, сияющие глаза, естественная мимика без искажения формы челюсти и скул.';
      } else if (lower.includes('light smile')) {
        desc = 'Легкая естественная полуулыбка (Light smile): приятный, доброжелательный взгляд, расслабленная мимика.';
      } else if (lower.includes('open smile')) {
        desc = 'Открытая естественная улыбка с видимыми зубами (Open smile showing teeth): живые сияющие глаза, привлекательный уверенный вид, естественная линия губ без перенапряжения.';
      } else if (lower.includes('neutral') || lower.includes('no smile') || lower.includes('calm')) {
        desc = 'Спокойное, уверенное и сосредоточенное нейтральное выражение лица с закрытым ртом (Calm, neutral expression): расслабленные губы, прямой ясный взгляд.';
      }
      return `${desc} КРИТИЧЕСКИ ВАЖНО: Эмоция шаблона применяется строго к индивидуальной анатомии лица пользователя, без растягивания рта, без деформации челюсти, подбородка, носа или разреза глаз, и без добавления искусственных морщин.`;
    }

    const expressionRaw = String(template.expression || template.expression_text || '').trim();
    const expressionLine = formatExpression(expressionRaw);

    const qualityLine =
      imageQuality === '4K'
        ? 'Максимальная чёткость и детализация (4K).'
        : imageQuality === '1K'
          ? 'Базовая детализация (1K).'
          : 'Высокая детализация (2K).';

    const editText = String(editInstruction || '').trim();

    // Resolve SCENE TEXT
    let sceneText = '';
    if (effectiveMode === 'enhance' || effectiveMode === 'refine') {
      sceneText = '';
    } else if (effectiveMode === 'pinterest') {
      const ref = String(customReferenceUrl || '');
      if (!ref) {
        throw new Error('Referința Pinterest lipsește.');
      }
      sceneText = await analyzeSceneFromImage(ref);
      console.log('[scene-analyze] pinterest chars:', sceneText.length, sceneText.slice(0, 200));
    } else {
      // template / couple — detailed prompt from DB
      sceneText = String(template.prompt || '').trim();
      if (!sceneText) {
        throw new Error('Template prompt lipsește în baza de date.');
      }
    }

    // Shared vars for DB prompt templates
    const promptVars: Record<string, string> = {
      scene: sceneText || '',
      age1: age1Line || '',
      age2: age2Line || '',
      body: bodyLine || '',
      avoid: avoidLine || '',
      expression: expressionLine || '',
      edit: editText || '',
      quality: qualityLine || ''
    };

    async function promptOrFallback(key: string, customFallback?: string): Promise<string> {
      const fromDb = await loadPromptFromDb(key);
      const fallback = customFallback || DEFAULT_GENERATION_PROMPTS[key] || '';
      // If DB has an older version of pass2 prompt missing {{expression}}, prefer the updated fallback
      if (fromDb && (key.startsWith('pass2') ? fromDb.includes('{{expression}}') : true)) {
        console.log('[prompt] using DB key=', key, 'chars=', fromDb.length);
        return fillPrompt(fromDb, promptVars);
      }
      if (fallback) {
        console.log('[prompt] using updated code prompt key=', key, 'chars=', fallback.length);
        return fillPrompt(fallback, promptVars);
      }
      return fillPrompt(fromDb || '', promptVars);
    }

    let promptContext = '';
    if (effectiveMode === 'enhance') {
      promptContext = await promptOrFallback('pass1_enhance');
    } else if (effectiveMode === 'refine') {
      if (!editText) {
        throw new Error('editInstruction is required for refine mode.');
      }
      promptContext = await promptOrFallback('refine');
    } else if (effectiveMode === 'pinterest') {
      promptContext = await promptOrFallback('pass1_pinterest');
    } else if (effectiveMode === 'couple') {
      promptContext = await promptOrFallback('pass1_couple');
    } else {
      promptContext = await promptOrFallback('pass1_template');
    }

    const targetRatio =
      aspectRatio === '9:16' ||
      aspectRatio === '16:9' ||
      aspectRatio === '4:3' ||
      aspectRatio === '3:4'
        ? aspectRatio
        : '3:4';

    const maskUrl = String(
      template.mask_image_url || template.maskImageUrl || ''
    ).trim();

    async function runImagePass(
      input: any[],
      imageSize: '1K' | '2K' | '4K',
      passLabel: string
    ): Promise<{ data: string; mimeType: string }> {
      console.log(`[generate] ${passLabel}`, {
        parts: input.length,
        aspect: targetRatio,
        imageSize,
        model: 'gemini-nano-banana-2.1'
      });
      console.log(`======== ${passLabel} INPUT ========`);
      for (let i = 0; i < input.length; i++) {
        const p = input[i] as any;
        if (p.type === 'text' || typeof p.text === 'string') {
          const t = String(p.text || '');
          console.log(`[${i}] TEXT (${t.length} chars):`, t.slice(0, 600));
        } else if (p.type === 'image' || p.data) {
          const b64 = String(p.data || '');
          console.log(
            `[${i}] IMAGE mime=${p.mime_type || p.mimeType || '?'} ~${Math.round((b64.length * 3) / 4)} bytes`
          );
        } else {
          console.log(`[${i}] OTHER:`, JSON.stringify(p).slice(0, 200));
        }
      }
      console.log(`======== END ${passLabel} ========`);

      const interaction = await aiClient!.interactions.create({
        model: 'gemini-nano-banana-2.1',
        input,
        response_format: {
          type: 'image',
          aspect_ratio: targetRatio,
          image_size: imageSize
        }
      });

      let data: string | null = null;
      let mime = 'image/png';

      if (interaction?.output_image?.data) {
        data = interaction.output_image.data;
        mime =
          (interaction.output_image as any)?.mime_type ||
          (interaction.output_image as any)?.mimeType ||
          'image/png';
      } else {
        const steps = (interaction as any)?.steps || [];
        for (const step of steps) {
          const blocks = step?.content || step?.images || [];
          for (const block of blocks) {
            if (
              (block?.type === 'image' || block?.inlineData) &&
              (block?.data || block?.inlineData?.data)
            ) {
              data = block.data || block.inlineData.data;
              mime =
                block.mime_type ||
                block.mimeType ||
                block.inlineData?.mimeType ||
                'image/png';
              break;
            }
          }
          if (data) break;
        }
      }

      if (!data) {
        console.warn(
          `[generate] ${passLabel} no image`,
          JSON.stringify(interaction)?.slice(0, 600)
        );
        throw new Error(
          `${passLabel}: model did not return an image. Check GEMINI_API_KEY / model availability.`
        );
      }

      console.log(`[generate] ${passLabel} ok`, {
        mime,
        bytesApprox: Math.round((data.length * 3) / 4)
      });
      return { data, mimeType: mime };
    }

    const pushText = (arr: any[], t: string) => {
      if (t && String(t).trim()) arr.push({ type: 'text', text: String(t).trim() });
    };
    const pushImageFromUrl = async (arr: any[], url: string, label = 'image') => {
      if (!url) {
        throw new Error(`Missing ${label} URL`);
      }
      const part = await urlToGenerativePart(url);
      if (!part?.inlineData?.data) {
        throw new Error(
          `Unable to load ${label} for the model. Check that the URL is a reachable image (JPEG/PNG/WEBP).`
        );
      }
      const mime = (part.inlineData.mimeType || 'image/jpeg').split(';')[0].trim();
      arr.push({
        type: 'image',
        mime_type: mime,
        data: part.inlineData.data
      });
    };

    // ── TWO-PASS when mask_image_url is set ───────────────────────────
    // template and couple are SEPARATE prompt contracts (no shared text)
    const useTwoPass =
      (effectiveMode === 'template' || effectiveMode === 'couple') && Boolean(maskUrl);

    if (useTwoPass && effectiveMode === 'template') {
      // ========== SINGLE: PASS 1 ==========
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 45,
          current_step_message: 'Pass 1/2: identity + scene (1K)...'
        })
        .eq('id', jobId);

      const pass1Input: any[] = [];
      {
        const p1 = await promptOrFallback('pass1_template');
        pushText(pass1Input, p1);
      }
      pushText(
        pass1Input,
        '[USER_IDENTITY_PHOTOS] — PRIMARY USER PHOTOS (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache shape and color to preserve):'
      );
      await pushImageFromUrl(pass1Input, userPhotoUrl, 'user selfie');
      if (Array.isArray(extraPhotoUrls)) {
        for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(pass1Input, u, 'user selfie extra');
      }

      // Prefer masked layout so Pass 1 does not see foreign faces on the preview
      const poseRefUrl = String(
        maskUrl ||
          template.preview_image_url ||
          template.previewImageUrl ||
          template.image_url ||
          ''
      ).trim();
      if (poseRefUrl) {
        pushText(
          pass1Input,
          '[POSE_AND_LIGHTING_REFERENCE] — POSE & LIGHTING REFERENCE (match body pose, 3D head turn, neck angle, gaze angle, and lighting scheme from this masked layout; do not copy any facial features since faces are masked):'
        );
        try {
          await pushImageFromUrl(pass1Input, poseRefUrl, 'template pose reference');
        } catch (e) {
          console.warn('[pass1] could not load poseRefUrl:', e);
        }
      }

      pushText(
        pass1Input,
        `FINAL PASS 1: Generate a single photorealistic portrait with the exact face, eye color, hair (exact natural color, texture, curls/waves, length, and volume), and facial hair (beard/mustache) of the user strictly from [USER_IDENTITY_PHOTOS] without unrequested hair color change, gray hair or aging. Match head/neck angle and lighting from the pose reference. Keep the user's authentic facial bone structure, jaw and features without distortion. Do not force a fixed smile or reshape the jaw/cheeks for expression. Keep under-eye area natural as on the selfie (do not invent bags or force an artificially smooth under-eye zone). SKIN TONE: Face, neck, and any other exposed skin visible on this frame must match [USER_IDENTITY_PHOTOS]. If full body or legs are visible (e.g. dress slits), harmonize their skin tone to the user's authentic tone from identity photos; if legs are not visible, ignore leg-related rules.`
      );

      const pass1 = await runImagePass(pass1Input, '1K', 'PASS1-single');
      recordPass1Intermediate(pass1.data, pass1.mimeType, 'PASS1-single');

      // ========== SINGLE: PASS 2 ==========
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 70,
          current_step_message: 'Pass 2/2: composite on masked scene (2K/4K)...'
        })
        .eq('id', jobId);

      const pass2Input: any[] = [];
      {
        const p2 = await promptOrFallback('pass2_template');
        pushText(pass2Input, p2);
      }
      pushText(pass2Input, '[SCENE_IMAGE] — BASE SCENE TO PRESERVE (costume, body, hands, environment; only head/neck/hair area masked):');
      await pushImageFromUrl(pass2Input, maskUrl, 'masked scene');
      pushText(
        pass2Input,
        '[USER_IDENTITY_PHOTOS] — PRIMARY USER IDENTITY (exact real face, hair, and facial hair/beard/mustache to embed; primary selfie and extra angles):'
      );
      await pushImageFromUrl(pass2Input, userPhotoUrl, 'user identity selfie');
      if (Array.isArray(extraPhotoUrls)) {
        for (const u of extraPhotoUrls.slice(0, 3)) {
          await pushImageFromUrl(pass2Input, u, 'user identity extra');
        }
      }
      pushText(pass2Input, '[POSE_GUIDE_IMAGE] — PASS 1 RESULT (head pose, neck angle, lighting, and neat natural emotion to polish):');
      pass2Input.push({
        type: 'image',
        mime_type: pass1.mimeType || 'image/png',
        data: pass1.data
      });
      pushText(
        pass2Input,
        `FINAL PASS 2: Seamlessly composite the user head from [POSE_GUIDE_IMAGE] and [USER_IDENTITY_PHOTOS] into the masked scene [SCENE_IMAGE]. Preserve 100% facial likeness, eye color, exact hair color and texture (do not alter, darken or dye the hair color; preserve curls/waves/volume as in [USER_IDENTITY_PHOTOS]), and exact beard/mustache shape and color without unrequested gray. Keep head pose and expression from [POSE_GUIDE_IMAGE] without pulling or deforming jaw, cheeks or facial features. Keep under-eye area natural as on the selfie (do not invent bags or force an artificially smooth under-eye zone; no wax look). Maintain anatomical head scale and visible neck, matching ambient light. SKIN TONE: Face, neck, chest, arms and hands must match [USER_IDENTITY_PHOTOS]. If full body or legs are visible in the scene (e.g. dress slits), harmonize their skin tone to the user's authentic tone from identity photos; if legs are not visible, ignore leg-related rules. Never leave mismatched face vs body skin tone. Output one single photorealistic image.`
      );

      const pass2 = await runImagePass(pass2Input, imageQuality, 'PASS2-single');
      imageBase64Data = pass2.data;
      mimeType = pass2.mimeType;
    } else if (useTwoPass && effectiveMode === 'couple') {
      // ========== COUPLE: PASS 1 (two identities) ==========
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 45,
          current_step_message: 'Pass 1/2: two identities + scene (1K)...'
        })
        .eq('id', jobId);

      const pass1Input: any[] = [];
      {
        const p1 = await promptOrFallback('pass1_couple');
        pushText(pass1Input, p1);
      }
      pushText(
        pass1Input,
        '[IDENTITY_A_PHOTOS] — LEFT PERSON (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache to preserve):'
      );
      await pushImageFromUrl(pass1Input, userPhotoUrl, 'user identity A');
      if (Array.isArray(extraPhotoUrls)) {
        for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(pass1Input, u, 'user identity A extra');
      }
      pushText(
        pass1Input,
        '[IDENTITY_B_PHOTOS] — RIGHT PERSON (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache to preserve):'
      );
      if (partnerPhotoUrl) await pushImageFromUrl(pass1Input, partnerPhotoUrl, 'partner identity B');
      if (Array.isArray(partnerExtraPhotoUrls)) {
        for (const u of partnerExtraPhotoUrls.slice(0, 4))
          await pushImageFromUrl(pass1Input, u, 'partner identity B extra');
      }
      // Prefer masked layout so Pass 1 does not see foreign faces on the preview
      const poseRefUrlCouple = String(
        maskUrl ||
          template.preview_image_url ||
          template.previewImageUrl ||
          template.image_url ||
          ''
      ).trim();
      if (poseRefUrlCouple) {
        pushText(
          pass1Input,
          '[POSE_AND_LIGHTING_REFERENCE] — POSE & LIGHTING REFERENCE (match composition, body poses, 3D head turns, neck angles, gaze angles, and lighting from this masked layout; do not copy any facial features since faces are masked):'
        );
        try {
          await pushImageFromUrl(pass1Input, poseRefUrlCouple, 'couple template pose reference');
        } catch (e) {
          console.warn('[pass1-couple] could not load poseRefUrl:', e);
        }
      }
      pushText(
        pass1Input,
        `FINAL PASS 1: Two distinct people in one image. Left person strictly matches [IDENTITY_A_PHOTOS], right person strictly matches [IDENTITY_B_PHOTOS] (including exact hair and facial hair/beard without unrequested gray). Match head/neck poses and lighting from the pose reference. Keep each person's authentic facial bone structure, jawline and features without distortion. Do not force a fixed smile or reshape jaws/cheeks for expression. Keep under-eye areas natural as on the selfies (do not invent bags or force an artificially smooth under-eye zone). SKIN TONE: Face, neck, and any other exposed skin visible on this frame must match that person's identity photos. If full body or legs are visible (e.g. dress slits), harmonize their skin tone to each person's authentic tone; if legs are not visible, ignore leg-related rules.`
      );

      const pass1 = await runImagePass(pass1Input, '1K', 'PASS1-couple');
      recordPass1Intermediate(pass1.data, pass1.mimeType, 'PASS1-couple');

      // ========== COUPLE: PASS 2 (two masked heads) ==========
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 70,
          current_step_message: 'Pass 2/2: composite both heads on masked scene (2K/4K)...'
        })
        .eq('id', jobId);

      const pass2Input: any[] = [];
      {
        const p2 = await promptOrFallback('pass2_couple');
        pushText(pass2Input, p2);
      }
      pushText(pass2Input, '[SCENE_IMAGE] — BASE SCENE TO PRESERVE (costumes, body, hands, environment; head/neck/hair areas masked):');
      await pushImageFromUrl(pass2Input, maskUrl, 'masked couple scene');
      pushText(pass2Input, '[IDENTITY_A_PHOTOS] — LEFT PERSON (exact real face, hair, and facial hair/beard to embed):');
      await pushImageFromUrl(pass2Input, userPhotoUrl, 'user identity A');
      if (Array.isArray(extraPhotoUrls)) {
        for (const u of extraPhotoUrls.slice(0, 2)) await pushImageFromUrl(pass2Input, u, 'user identity A extra');
      }
      if (partnerPhotoUrl) {
        pushText(pass2Input, '[IDENTITY_B_PHOTOS] — RIGHT PERSON (exact real face, hair, and facial hair/beard to embed):');
        await pushImageFromUrl(pass2Input, partnerPhotoUrl, 'partner identity B');
        if (Array.isArray(partnerExtraPhotoUrls)) {
          for (const u of partnerExtraPhotoUrls.slice(0, 2))
            await pushImageFromUrl(pass2Input, u, 'partner identity B extra');
        }
      }
      pushText(pass2Input, '[POSE_GUIDE_IMAGE] — PASS 1 INTERMEDIATE RESULT (head poses, neck angles, lighting, and neat expressions to polish):');
      pass2Input.push({
        type: 'image',
        mime_type: pass1.mimeType || 'image/png',
        data: pass1.data
      });
      pushText(
        pass2Input,
        `FINAL PASS 2: Seamlessly composite both heads from [POSE_GUIDE_IMAGE], [IDENTITY_A_PHOTOS] (left) and [IDENTITY_B_PHOTOS] (right) onto the two masked people in [SCENE_IMAGE]. Preserve 100% facial likeness, eye colors, exact hair colors and textures, and beard/mustache shape and color without unrequested gray for both persons. Keep head poses and expressions from [POSE_GUIDE_IMAGE] without pulling or deforming jaws, cheeks or facial features. Keep under-eye areas natural as on the selfies (do not invent bags or force an artificially smooth under-eye zone; no wax look). Maintain proportional head scale and visible neck (do not stretch heads to fill the mask), matching 3D head turn and ambient light. SKIN TONE: For each person, face, neck, arms and hands must match that person's identity photos. If full body or legs are visible (e.g. dress slits), harmonize their skin tone to that person's authentic tone; if legs are not visible, ignore leg-related rules. Never leave mismatched face vs body skin tone. Output one single photorealistic image.`
      );

      const pass2 = await runImagePass(pass2Input, imageQuality, 'PASS2-couple');
      imageBase64Data = pass2.data;
      mimeType = pass2.mimeType;
    } else if (effectiveMode === 'pinterest') {
      // ========== PINTEREST multi-pass ==========
      // 1) sceneText already from analyzeSceneFromImage(ref) — «атомы»
      // 2) MASK 1K: reference with faces/hair covered
      // 3) PASS1 1K: IDENTITY + mask as pose/lighting reference
      // 4) PASS2 user quality: mask + PASS1 result
      const refUrl = String(customReferenceUrl || '').trim();
      if (!refUrl) {
        throw new Error('Referința Pinterest lipsește.');
      }

      const isCouplePinterest = Boolean(partnerPhotoUrl);
      const pass1Key = isCouplePinterest ? 'pass1_pinterest_couple' : 'pass1_pinterest';
      const maskKey = isCouplePinterest ? 'mask_pinterest_couple' : 'mask_pinterest';
      const pass2Key = isCouplePinterest ? 'pass2_pinterest_couple' : 'pass2_pinterest';

      // Order: (sceneText already done) → MASK → PASS1 (pose from mask) → PASS2
      // --- 1) MASK reference faces/hair at 1K ---
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 40,
          current_step_message: 'Pinterest 1/4: маска лиц/волос на референсе (1K)...'
        })
        .eq('id', jobId);

      const maskInput: any[] = [];
      const maskPromptText = await promptOrFallback(maskKey);
      pushText(maskInput, maskPromptText);
      pushText(maskInput, '[ORIGINAL_REFERENCE] — PINTEREST PHOTO TO MASK:');
      await pushImageFromUrl(maskInput, refUrl, 'pinterest reference');
      pushText(
        maskInput,
        isCouplePinterest
          ? 'FINAL MASK: Output the exact same photo with faces, ears, neck and hair of both persons uniformly painted over with solid light gray. Do not alter clothing, background or poses.'
          : 'FINAL MASK: Output the exact same photo with face, ears, neck and hair uniformly painted over with solid light gray. Do not alter clothing, background or poses.'
      );

      const maskPass = await runImagePass(maskInput, '1K', 'MASK-pinterest');

      // --- 2) PASS1 1K: identity + mask as pose/lighting (no foreign faces) ---
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 58,
          current_step_message: 'Pinterest 2/4: PASS1 identity + masked pose (1K)...'
        })
        .eq('id', jobId);

      const pass1Input: any[] = [];
      {
        const p1 = await promptOrFallback(pass1Key);
        pushText(pass1Input, p1);
      }

      if (isCouplePinterest) {
        pushText(
          pass1Input,
          '[IDENTITY_A_PHOTOS] — LEFT PERSON (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache to preserve):'
        );
        await pushImageFromUrl(pass1Input, userPhotoUrl, 'pinterest identity A');
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(pass1Input, u, 'pinterest identity A extra');
        }
        if (partnerPhotoUrl) {
          pushText(
            pass1Input,
            '[IDENTITY_B_PHOTOS] — RIGHT PERSON (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache to preserve):'
          );
          await pushImageFromUrl(pass1Input, partnerPhotoUrl, 'pinterest identity B');
          if (Array.isArray(partnerExtraPhotoUrls)) {
            for (const u of partnerExtraPhotoUrls.slice(0, 4)) await pushImageFromUrl(pass1Input, u, 'pinterest identity B extra');
          }
        }
      } else {
        pushText(
          pass1Input,
          '[USER_IDENTITY_PHOTOS] — PRIMARY USER PHOTOS (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache shape and color to preserve):'
        );
        await pushImageFromUrl(pass1Input, userPhotoUrl, 'pinterest identity selfie');
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 4)) {
            await pushImageFromUrl(pass1Input, u, 'pinterest identity extra');
          }
        }
      }

      // Pose/light from MASK (faces already covered) — not from original ref with foreign faces
      pushText(
        pass1Input,
        '[POSE_AND_LIGHTING_REFERENCE] — POSE & LIGHTING REFERENCE from masked Pinterest layout (match body pose, 3D head turn, neck angle, gaze angle, framing and lighting; do not invent facial features — faces on this image are masked):'
      );
      pass1Input.push({
        type: 'image',
        mime_type: maskPass.mimeType || 'image/jpeg',
        data: maskPass.data
      });

      if (isCouplePinterest) {
        pushText(
          pass1Input,
          'FINAL PASS 1: Two distinct people in one image. Left person strictly matches [IDENTITY_A_PHOTOS], right person strictly matches [IDENTITY_B_PHOTOS] (including exact hair and facial hair/beard without unrequested gray). Match head/neck poses and lighting from the masked pose reference. Natural expressions without forcing a smile or deforming jaw/cheeks. Under-eye area as on selfies.'
        );
      } else {
        pushText(
          pass1Input,
          'FINAL PASS 1: Generate a single photorealistic portrait with the exact face, hair, and facial hair (beard/mustache) of the user [USER_IDENTITY_PHOTOS] without unrequested gray hair or aging. Match head/neck angle and lighting from the masked pose reference. Natural expression without forcing a smile or deforming jaw/cheeks. Under-eye area as on the selfie.'
        );
      }

      const pass1 = await runImagePass(pass1Input, '1K', 'PASS1-pinterest');
      recordPass1Intermediate(pass1.data, pass1.mimeType, 'PASS1-pinterest');

      // --- 3) PASS2 composite at user quality ---
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 78,
          current_step_message: 'Pinterest 3/4: композит маска + PASS1...'
        })
        .eq('id', jobId);

      const pass2Input: any[] = [];
      {
        const p2 = await promptOrFallback(pass2Key);
        pushText(pass2Input, p2);
      }
      pushText(pass2Input, '[SCENE_IMAGE] — SCENE TO PRESERVE (costumes, body, hands, environment; head/neck/hair area masked):');
      pass2Input.push({
        type: 'image',
        mime_type: maskPass.mimeType || 'image/jpeg',
        data: maskPass.data
      });
      if (isCouplePinterest) {
        pushText(pass2Input, '[IDENTITY_A_PHOTOS] — LEFT PERSON (exact real face, hair, and facial hair/beard to embed):');
        await pushImageFromUrl(pass2Input, userPhotoUrl, 'pinterest selfie A');
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 2)) await pushImageFromUrl(pass2Input, u, 'pinterest extra A');
        }
        if (partnerPhotoUrl) {
          pushText(pass2Input, '[IDENTITY_B_PHOTOS] — RIGHT PERSON (exact real face, hair, and facial hair/beard to embed):');
          await pushImageFromUrl(pass2Input, partnerPhotoUrl, 'pinterest partner B');
          if (Array.isArray(partnerExtraPhotoUrls)) {
            for (const u of partnerExtraPhotoUrls.slice(0, 2)) await pushImageFromUrl(pass2Input, u, 'pinterest extra B');
          }
        }
      } else {
        pushText(pass2Input, '[USER_IDENTITY_PHOTOS] — PRIMARY USER IDENTITY (exact real face, hair, and facial hair/beard/mustache to embed):');
        await pushImageFromUrl(pass2Input, userPhotoUrl, 'pinterest selfie identity');
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 3)) await pushImageFromUrl(pass2Input, u, 'pinterest extra identity');
        }
      }
      pushText(pass2Input, '[POSE_GUIDE_IMAGE] — PASS 1 INTERMEDIATE RESULT (head pose, neck angle, lighting, and neat expression to polish):');
      pass2Input.push({
        type: 'image',
        mime_type: pass1.mimeType || 'image/jpeg',
        data: pass1.data
      });
      pushText(
        pass2Input,
        isCouplePinterest
          ? "FINAL PASS 2: Seamlessly polish and composite both heads from [POSE_GUIDE_IMAGE], [IDENTITY_A_PHOTOS] (left) and [IDENTITY_B_PHOTOS] (right) onto the masked scene [SCENE_IMAGE]. Preserve 100% facial likeness, hair, and exact beard/mustache shape and color without unrequested gray. Flawless collar/neck seams, all exposed skin (neck, hands, and if legs are visible in the frame) harmonized to match users' authentic skin tones from identity photos; if legs are not visible, ignore leg-related rules. Natural expressions, high-end editorial skin. Output one single photorealistic image."
          : "FINAL PASS 2: Seamlessly polish and composite the user head from [POSE_GUIDE_IMAGE] and [USER_IDENTITY_PHOTOS] onto the masked scene [SCENE_IMAGE]. Preserve 100% facial likeness, hair, and exact beard/mustache shape and color without unrequested gray. Flawless neck/collar seams and hair, neat natural expression, all exposed skin (neck, chest, arms, hands, and if legs are visible in the frame) harmonized to match the user's authentic skin tone from [USER_IDENTITY_PHOTOS]; if legs are not visible, ignore leg-related rules. Magazine retouching. Output one single photorealistic image."
      );

      const pass2 = await runImagePass(pass2Input, imageQuality, 'PASS2-pinterest');
      imageBase64Data = pass2.data;
      mimeType = pass2.mimeType;
    } else {
      // ── SINGLE PASS (enhance / refine / template|couple without mask) ───
      const interactionInput: any[] = [];
      pushText(interactionInput, promptContext);

      if (effectiveMode === 'enhance') {
        pushText(interactionInput, '[IMAGE_TO_ENHANCE] — PHOTO TO ENHANCE:');
        await pushImageFromUrl(interactionInput, userPhotoUrl, 'enhance photo');
      } else if (effectiveMode === 'refine') {
        pushText(interactionInput, '[IMAGE_TO_EDIT] — PHOTO TO EDIT (base image):');
        await pushImageFromUrl(interactionInput, userPhotoUrl, 'refine base');
        pushText(interactionInput, 'Apply the USER INSTRUCTION only to [IMAGE_TO_EDIT]. Output one edited photorealistic image.');
      } else if (effectiveMode === 'couple') {
        pushText(
          interactionInput,
          '[IDENTITY_A_PHOTOS] — LEFT PERSON (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache to preserve):'
        );
        await pushImageFromUrl(interactionInput, userPhotoUrl, 'identity A');
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(interactionInput, u, 'identity A extra');
        }
        pushText(
          interactionInput,
          '[IDENTITY_B_PHOTOS] — RIGHT PERSON (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache to preserve):'
        );
        if (partnerPhotoUrl) await pushImageFromUrl(interactionInput, partnerPhotoUrl, 'identity B');
        if (Array.isArray(partnerExtraPhotoUrls)) {
          for (const u of partnerExtraPhotoUrls.slice(0, 4))
            await pushImageFromUrl(interactionInput, u, 'identity B extra');
        }
      } else {
        pushText(
          interactionInput,
          '[USER_IDENTITY_PHOTOS] — PRIMARY USER IDENTITY (exact real face, multi-angle facial anatomy, facial bone structure, hair texture and color, and exact facial hair/beard/mustache shape and color to preserve):'
        );
        await pushImageFromUrl(interactionInput, userPhotoUrl, 'user identity');
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(interactionInput, u, 'user identity extra');
        }
      }

      // If single pass with a template (single or couple), provide POSE_AND_LIGHTING_REFERENCE if available
      let singlePassHasPoseRef = false;
      if (effectiveMode === 'template' || effectiveMode === 'couple') {
        const templatePreviewUrl = String(
          template.preview_image_url || template.previewImageUrl || template.image_url || ''
        ).trim();
        if (templatePreviewUrl) {
          try {
            const refPart = await urlToGenerativePart(templatePreviewUrl);
            if (refPart?.inlineData?.data) {
              pushText(
                interactionInput,
                '[POSE_AND_LIGHTING_REFERENCE] — TEMPLATE REFERENCE (match composition, pose, head tilt, neck angle, gaze angle, lighting scheme, and natural neat expression; do not copy this person\'s facial bone structure, hair, or beard):'
              );
              interactionInput.push({
                type: 'image',
                mime_type: (refPart.inlineData.mimeType || 'image/jpeg').split(';')[0].trim(),
                data: refPart.inlineData.data
              });
              singlePassHasPoseRef = true;
            }
          } catch (e) {
            console.warn('[single-pass] could not load templatePreviewUrl:', e);
          }
        }
      }

      pushText(
        interactionInput,
        effectiveMode === 'enhance'
          ? 'FINAL: Output an enhanced version of [IMAGE_TO_ENHANCE] with restored micro-details, sharp eyes, natural skin texture, preserved facial hair/beard and hair, and cinematic lighting.'
          : effectiveMode === 'refine'
            ? 'FINAL: Apply the USER INSTRUCTION only to [IMAGE_TO_EDIT] while preserving 100% facial identity, hair, and beard/mustache. Output one edited photorealistic image.'
            : effectiveMode === 'couple'
              ? singlePassHasPoseRef
                ? 'FINAL: Faces, eye colors, exact hair colors and textures, and facial hair/beard strictly from [IDENTITY_A_PHOTOS] (left) and [IDENTITY_B_PHOTOS] (right) without unrequested hair color change, gray hair or aging. Embody head/neck poses and lighting from [POSE_AND_LIGHTING_REFERENCE]. Environment and styling from the scene prompt. No other faces.'
                : 'FINAL: Faces, eye colors, exact hair colors and textures, and facial hair/beard strictly from [IDENTITY_A_PHOTOS] (left) and [IDENTITY_B_PHOTOS] (right) without unrequested hair color change, gray hair or aging. Environment and styling from the scene prompt. No other faces.'
              : singlePassHasPoseRef
                ? 'FINAL: Face, eye color, exact hair color and texture (do not alter, darken or dye hair), and exact facial hair/beard strictly from [USER_IDENTITY_PHOTOS] without unrequested gray hair or aging. Embody head/neck pose and lighting from [POSE_AND_LIGHTING_REFERENCE]. Environment and styling from the scene prompt. No other face.'
                : 'FINAL: Face, eye color, exact hair color and texture (do not alter, darken or dye hair), and exact facial hair/beard strictly from [USER_IDENTITY_PHOTOS] without unrequested gray hair or aging. Environment and styling from the scene prompt. No other face.'
      );

      const imageSize: '1K' | '2K' | '4K' = imageQuality;
      const single = await runImagePass(interactionInput, imageSize, 'SINGLE');
      imageBase64Data = single.data;
      mimeType = single.mimeType;
    }

    if (!imageBase64Data) {
      throw new Error('Model did not return image data.');
    }

    // 6. Save FINAL (pass2) image & optional pass1 image to 'generated-images' ONLY AT THE END, with retries
    const storagePath = `${userId}/${jobId}.jpg`;
    const imageBuffer = Buffer.from(imageBase64Data, 'base64');

    // Upload PASS 2 (final result) with retry
    const pass2UploadResult = await uploadToStorageWithRetry(
      'generated-images',
      storagePath,
      imageBuffer,
      mimeType || 'image/jpeg',
      3
    );

    if (!pass2UploadResult.success) {
      throw new Error(`Upload final image to storage failed after retries: ${pass2UploadResult.error}`);
    }
    console.log('[generate] pass2 saved to storage', storagePath, 'bytes', imageBuffer.length);

    // Upload PASS 1 (intermediate) with retry ONLY AT THE END (if pass1 exists)
    let pass1SavedPath: string | null = null;
    pass1SignedUrl = null;

    if (pass1Base64) {
      const p1Path = `${userId}/${jobId}_pass1.jpg`;
      const p1Buffer = Buffer.from(pass1Base64, 'base64');
      const pass1UploadResult = await uploadToStorageWithRetry(
        'generated-images',
        p1Path,
        p1Buffer,
        pass1Mime || 'image/jpeg',
        3
      );

      if (pass1UploadResult.success) {
        pass1SavedPath = p1Path;
        console.log('[generate] pass1 saved to storage at end', p1Path, 'bytes', p1Buffer.length);
        try {
          const { data: signed } = await supabaseAdmin.storage
            .from('generated-images')
            .createSignedUrl(p1Path, 60 * 60 * 24 * 7);
          pass1SignedUrl = signed?.signedUrl || supabaseAdmin.storage.from('generated-images').getPublicUrl(p1Path).data.publicUrl;
        } catch {
          pass1SignedUrl = supabaseAdmin.storage.from('generated-images').getPublicUrl(p1Path).data.publicUrl;
        }
      } else {
        console.warn(`[generate] pass1 upload failed after retries: ${pass1UploadResult.error}`);
      }
    }

    // 7. Path в базу — ТОЛЬКО после успешной заливки в Storage!
    const completedPayload: Record<string, unknown> = {
      status: 'completed',
      progress: 100,
      current_step_message: 'Portret finalizat cu succes!',
      completed_at: new Date().toISOString(),
      result_storage_path: storagePath // Записан в базу ТОЛЬКО после успешной заливки!
    };

    if (pass1SavedPath) {
      completedPayload.pass1_storage_path = pass1SavedPath; // Записан в базу ТОЛЬКО после успешной заливки pass1!
    }

    let jobUpdate = await supabaseAdmin
      .from('generation_jobs')
      .update(completedPayload)
      .eq('id', jobId);

    if (jobUpdate.error) {
      console.warn('[generate] job complete with optional paths failed:', jobUpdate.error.message);
      if (completedPayload.pass1_storage_path) {
        delete completedPayload.pass1_storage_path;
        jobUpdate = await supabaseAdmin
          .from('generation_jobs')
          .update(completedPayload)
          .eq('id', jobId);
      }
      if (jobUpdate.error) {
        delete completedPayload.result_storage_path;
        await supabaseAdmin
          .from('generation_jobs')
          .update(completedPayload)
          .eq('id', jobId);
      }
    }

    // 8. Signed URL 7 days — save on job so gallery does not re-sign every visit
    const SIGNED_TTL = 60 * 60 * 24 * 7;
    let resultImageUrl = '';
    try {
      const { data: signedData } = await supabaseAdmin.storage
        .from('generated-images')
        .createSignedUrl(storagePath, SIGNED_TTL);
      resultImageUrl = signedData?.signedUrl || '';
    } catch {}
    if (!resultImageUrl) {
      const { data: pubData } = supabaseAdmin.storage
        .from('generated-images')
        .getPublicUrl(storagePath);
      resultImageUrl = pubData.publicUrl;
    }

    const expiresAt = new Date(Date.now() + SIGNED_TTL * 1000).toISOString();
    if (resultImageUrl) {
      const { error: urlErr } = await supabaseAdmin
        .from('generation_jobs')
        .update({
          result_signed_url: resultImageUrl,
          result_signed_expires_at: expiresAt
        } as any)
        .eq('id', jobId);
      if (urlErr) console.warn('[generate] cache signed url', urlErr.message);
    }

    return res.json({
      jobId,
      status: 'completed',
      resultImageUrl,
      newBalance,
      pass1ImageUrl: pass1SignedUrl || undefined
    });

  } catch (genErr: any) {
    console.error('Generation error:', genErr);

    // 10. ATOMIC REFUND ON FAILURE (Refunds photos exactly once!)
    if (jobId) {
      try {
        await supabaseAdmin.rpc('refund_photos_for_failed_job', {
          p_job_id: jobId,
          p_error_message: genErr?.message || 'Eroare necunoscută la generare.'
        });
      } catch (refundErr) {
        console.error('Refund procedure notice:', refundErr);
      }
    }

    return res.status(500).json({
      error: 'Generarea a eșuat. Foto au fost restituite automat pe contul tău: ' + (genErr?.message || '')
    });
  }
});

// List generation jobs for current user

// Delete a generation job + storage object
app.delete('/api/generations/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: job, error: fetchError } = await supabaseAdmin
      .from('generation_jobs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // All possible objects for this job in generated-images bucket
    const paths = new Set<string>();
    if (job.result_storage_path) paths.add(job.result_storage_path);
    if (job.pass1_storage_path) paths.add(job.pass1_storage_path);
    // Legacy fixed names (in case columns were empty)
    paths.add(`${job.user_id}/${job.id}.jpg`);
    paths.add(`${job.user_id}/${job.id}_pass1.jpg`);

    if (paths.size > 0) {
      const { error: rmErr } = await supabaseAdmin.storage
        .from('generated-images')
        .remove([...paths]);
      if (rmErr) console.warn('[generations/delete] storage', rmErr.message);
    }

    const { error: dbErr } = await supabaseAdmin
      .from('generation_jobs')
      .delete()
      .eq('id', job.id)
      .eq('user_id', req.user!.id);

    if (dbErr) throw dbErr;

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/generations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '30'), 10) || 30, 1), 100);
    const offset = Math.max(parseInt(String(req.query.offset || '0'), 10) || 0, 0);
    // 7 days — gallery must not die after one hour
    const SIGNED_TTL = 60 * 60 * 24 * 7;

    let jobs: any[] = [];
    if (directDbAvailable && pool) {
      try {
        const { rows } = await pool.query(
          `SELECT j.*, 
                  json_build_object('name_ro', t.name_ro, 'preview_image_url', t.preview_image_url) as templates
           FROM public.generation_jobs j
           LEFT JOIN public.templates t ON t.id = j.template_id
           WHERE j.user_id = $1
           ORDER BY j.created_at DESC
           LIMIT $2 OFFSET $3`,
          [req.user!.id, limit, offset]
        );
        jobs = rows || [];
      } catch (dbErr) {
        handleDirectDbError('api/generations', dbErr);
      }
    }

    if (!jobs || jobs.length === 0) {
      const { data, error } = await supabaseAdmin
        .from('generation_jobs')
        .select('*, templates(name_ro, preview_image_url)')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error && !jobs) throw error;
      jobs = data || [];
    }

    const refreshBeforeMs = 60 * 60 * 1000; // refresh if < 1h left

    const jobsOut = await Promise.all(
      (jobs || []).map(async (job) => {
        const storagePath =
          job.result_storage_path ||
          (job.status === 'completed' ? `${job.user_id}/${job.id}.jpg` : null);

        let resultImageUrl: string | undefined = undefined;

        if (storagePath && job.status === 'completed') {
          const cached = job.result_signed_url as string | null | undefined;
          const exp = job.result_signed_expires_at
            ? new Date(job.result_signed_expires_at).getTime()
            : 0;
          const stillGood = cached && exp - Date.now() > refreshBeforeMs;

          if (stillGood) {
            resultImageUrl = cached;
          } else {
            try {
              const { data: signed } = await supabaseAdmin.storage
                .from('generated-images')
                .createSignedUrl(storagePath, SIGNED_TTL);
              if (signed?.signedUrl) {
                resultImageUrl = signed.signedUrl;
              }
            } catch {}
            if (!resultImageUrl) {
              const { data: pubData } = supabaseAdmin.storage
                .from('generated-images')
                .getPublicUrl(storagePath);
              resultImageUrl = pubData.publicUrl;
            }
            if (resultImageUrl) {
              const expiresAt = new Date(Date.now() + SIGNED_TTL * 1000).toISOString();
              // fire-and-forget cache update
              void supabaseAdmin
                .from('generation_jobs')
                .update({
                  result_signed_url: resultImageUrl,
                  result_signed_expires_at: expiresAt
                } as any)
                .eq('id', job.id)
                .then(({ error }) => {
                  if (error) console.warn('[generations] cache url', error.message);
                });
            }
          }
        }

        return {
          id: job.id,
          userId: job.user_id,
          templateId: job.template_id,
          templateName: job.templates?.name_ro || 'Șablon',
          templatePreview: job.templates?.preview_image_url || '',
          userPhotoId: job.user_photo_id || '',
          userPhotoUrl: '',
          status: job.status,
          progress: job.progress,
          currentStepMessage: job.current_step_message,
          resultImageUrl,
          resultStoragePath: storagePath || undefined,
          errorMessage: job.error_message,
          providerId: job.provider_id,
          photoCost: job.photo_cost,
          aspectRatio: job.aspect_ratio,
          createdAt: job.created_at,
          completedAt: job.completed_at
        };
      })
    );

    res.json(jobsOut);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Retry a failed job
app.post('/api/generations/:id/retry', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: job, error } = await supabaseAdmin
      .from('generation_jobs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: 'Jobul nu a fost găsit.' });
    }

    // Trigger new generation
    res.json({ message: 'Reîncearcă din interfață cu șablonul selectat', templateId: job.template_id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Photo Transactions Ledger
app.get('/api/photo-transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (directDbAvailable && pool) {
      try {
        const { rows } = await pool.query(
          'SELECT * FROM public.photo_transactions WHERE user_id = $1 ORDER BY created_at DESC',
          [req.user!.id]
        );
        if (rows) {
          return res.json(rows);
        }
      } catch (dbErr) {
        handleDirectDbError('api/photo-transactions', dbErr);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('photo_transactions')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// PAYMENTS ENDPOINTS
// Fulfill path: checkout → provider → confirm/webhook → grant photos + level spend
// ====================================================================

/**
 * Idempotent fulfillment after successful payment.
 * 1) grant_photos_from_purchase
 * 2) record_purchase_spend (levels by EUR total)
 */
async function fulfillPhotoPurchase(opts: {
  userId: string;
  packageId: string;
  photos: number;
  amountEur: number;
  externalId: string;
  provider?: string;
}): Promise<{ ok: boolean; balance?: number; level?: any; error?: string }> {
  const { userId, packageId, photos, amountEur, externalId, provider = 'standard-gateway' } = opts;

  // Idempotency: skip if this external payment already completed
  const { data: existing } = await supabaseAdmin
    .from('payment_transactions')
    .select('id, status')
    .eq('external_id', externalId)
    .maybeSingle();

  if (existing?.status === 'completed') {
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('photo_balance')
      .eq('id', userId)
      .single();
    return { ok: true, balance: prof?.photo_balance };
  }

  // Upsert pending/completed row
  await supabaseAdmin.from('payment_transactions').upsert(
    {
      user_id: userId,
      package_id: packageId,
      amount_eur: amountEur,
      photos,
      external_id: externalId,
      provider,
      status: 'processing',
      updated_at: new Date().toISOString()
    },
    { onConflict: 'external_id' }
  );

  const { data: newBalance, error: grantErr } = await supabaseAdmin.rpc('grant_photos_from_purchase', {
    p_user_id: userId,
    p_amount: photos,
    p_package_id: packageId,
    p_payment_ref: externalId
  });

  if (grantErr) {
    await supabaseAdmin
      .from('payment_transactions')
      .update({ status: 'failed', error_message: grantErr.message })
      .eq('external_id', externalId);
    return { ok: false, error: grantErr.message };
  }

  // Levels: add EUR spend + one-time level bonuses
  let levelResult: any = null;
  try {
    const { data: lvl } = await supabaseAdmin.rpc('record_purchase_spend', {
      p_user_id: userId,
      p_amount_eur: amountEur
    });
    levelResult = lvl;
  } catch (e: any) {
    console.error('record_purchase_spend failed (photos already granted):', e?.message || e);
  }

  await supabaseAdmin
    .from('payment_transactions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      error_message: null
    })
    .eq('external_id', externalId);

  return { ok: true, balance: newBalance as number, level: levelResult };
}

// Start checkout — package price from DB, amount always EUR
app.post('/api/payments/checkout', requireAuth, async (req: AuthRequest, res) => {
  const { packageId } = req.body;
  const userId = req.user!.id;

  if (!packageId) {
    return res.status(400).json({ error: 'packageId is required' });
  }

  try {
    const { data: pkg, error: pkgErr } = await supabaseAdmin
      .from('photo_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (pkgErr || !pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const amountEur = Number(pkg.price_eur ?? pkg.priceEUR ?? 0);
    const photos = Number(pkg.photos ?? 0);
    if (amountEur <= 0 || photos <= 0) {
      return res.status(400).json({ error: 'Invalid package pricing' });
    }

    const externalId = `pay_${userId.slice(0, 8)}_${packageId}_${Date.now()}`;

    // Record pending payment
    await supabaseAdmin.from('payment_transactions').insert({
      user_id: userId,
      package_id: packageId,
      amount_eur: amountEur,
      photos,
      external_id: externalId,
      provider: 'standard-gateway',
      status: 'pending'
    });

    if (!paymentGateway.isConfigured()) {
      return res.status(400).json({
        isConfigured: false,
        message:
          'Modulul de plată online este în curs de configurare. Pentru adăugare foto de test, folosește panoul de administrare.'
      });
    }

    const result = await paymentGateway.createCheckout({
      packageId,
      userId,
      userEmail: req.user!.email,
      amount: amountEur,
      currency: 'EUR',
      returnUrl: `${process.env.APP_URL || 'https://studio.labupgrade.ai'}/app/profile?payment=${externalId}`
    });

    // Attach our external id for confirm step
    res.json({
      ...result,
      externalId,
      amountEur,
      photos
    });
  } catch (err: any) {
    console.error('checkout error', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Confirm payment after return from gateway (or manual/test confirm with admin).
 * Body: { externalId } — must belong to current user and be paid at provider OR
 * when PAYMENT_TEST_MODE=1 allows complete without provider.
 */
app.post('/api/payments/confirm', requireAuth, async (req: AuthRequest, res) => {
  const externalId = String(req.body?.externalId || '').trim();
  if (!externalId) {
    return res.status(400).json({ error: 'externalId required' });
  }

  try {
    const { data: tx, error } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('external_id', externalId)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !tx) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (tx.status === 'completed') {
      return res.json({ success: true, alreadyCompleted: true });
    }

    // Verify with provider when configured
    if (paymentGateway.isConfigured() && process.env.PAYMENT_TEST_MODE !== '1') {
      const verification = await paymentGateway.verifyPayment(externalId);
      if (!verification.isSuccess || verification.status !== 'paid') {
        return res.status(402).json({
          error: verification.error || 'Payment not confirmed by provider',
          status: verification.status
        });
      }
    } else if (process.env.PAYMENT_TEST_MODE !== '1' && !paymentGateway.isConfigured()) {
      return res.status(400).json({
        error: 'Payment gateway not configured. Set PAYMENT_TEST_MODE=1 only for staging tests.'
      });
    }

    const result = await fulfillPhotoPurchase({
      userId: req.user!.id,
      packageId: tx.package_id,
      photos: Number(tx.photos),
      amountEur: Number(tx.amount_eur),
      externalId: tx.external_id,
      provider: tx.provider || 'standard-gateway'
    });

    if (!result.ok) {
      return res.status(500).json({ error: result.error || 'Fulfillment failed' });
    }

    res.json({
      success: true,
      newBalance: result.balance,
      level: result.level
    });
  } catch (err: any) {
    console.error('confirm payment', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Provider webhook — signature checked inside paymentGateway.handleWebhook.
 * Expects payload to identify externalId / package / user after provider adapter parses it.
 * For now: body.externalId + body.status === 'paid' (adapter can normalize).
 */
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = String(req.headers['x-payment-signature'] || req.headers['stripe-signature'] || '');
    const handled = await paymentGateway.handleWebhook(req.body, signature);

    if (handled.error && !handled.handled) {
      return res.status(400).json({ error: handled.error });
    }

    const externalId = String(req.body?.externalId || req.body?.sessionId || '').trim();
    const status = String(req.body?.status || '').toLowerCase();

    if (!externalId || (status && status !== 'paid' && status !== 'completed' && status !== 'success')) {
      return res.json({ received: true, fulfilled: false });
    }

    const { data: tx } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('external_id', externalId)
      .maybeSingle();

    if (!tx) {
      return res.status(404).json({ error: 'Unknown payment' });
    }

    if (tx.status === 'completed') {
      return res.json({ received: true, fulfilled: true, alreadyCompleted: true });
    }

    const result = await fulfillPhotoPurchase({
      userId: tx.user_id,
      packageId: tx.package_id,
      photos: Number(tx.photos),
      amountEur: Number(tx.amount_eur),
      externalId: tx.external_id,
      provider: tx.provider || 'standard-gateway'
    });

    res.json({ received: true, fulfilled: result.ok, error: result.error });
  } catch (err: any) {
    console.error('webhook', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// ADMIN ENDPOINTS (Role = 'admin' strictly verified)
// ====================================================================

// List all users
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin adjust photos
app.post('/api/admin/photos/adjust', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { targetUserId, amount, reason } = req.body;

  if (!targetUserId || typeof amount !== 'number') {
    return res.status(400).json({ error: 'targetUserId și amount sunt obligatorii.' });
  }

  try {
    const { data: newBalance, error } = await supabaseAdmin.rpc('admin_adjust_photos', {
      p_admin_id: req.user!.id,
      p_target_user_id: targetUserId,
      p_amount: amount,
      p_reason: reason || 'Ajustare administrator'
    });

    if (error) throw error;
    res.json({ success: true, newBalance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin change user role (Enforced through protected server procedure)
app.post('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { role } = req.body;
  const targetUserId = req.params.id;

  if (!role || (role !== 'user' && role !== 'admin')) {
    return res.status(400).json({ error: 'Rol invalid. Valori acceptate: user sau admin.' });
  }

  // Prevent admin from accidentally demoting themselves
  if (targetUserId === req.user!.id && role !== 'admin') {
    return res.status(400).json({ error: 'Nu vă puteți retrage propriul rol de administrator.' });
  }

  try {
    const { data: updatedRole, error } = await supabaseAdmin.rpc('admin_set_user_role', {
      p_admin_id: req.user!.id,
      p_target_user_id: targetUserId,
      p_new_role: role
    });

    if (error) throw error;
    res.json({ success: true, role: updatedRole });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list all jobs
app.get('/api/admin/jobs', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('generation_jobs')
      .select('*, templates(name_ro), profiles(email, name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list all transactions
app.get('/api/admin/transactions', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('photo_transactions')
      .select('*, profiles(email, name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin manage templates
app.post('/api/admin/templates', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('templates')
      .insert(req.body)
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/templates/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('templates')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/templates/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('templates')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list providers
app.get('/api/admin/providers', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_providers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User level (spend-based)
app.get('/api/me/levels', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('level, total_spent_eur, level_rewards_claimed')
      .eq('id', req.user!.id)
      .single();
    if (error) throw error;
    res.json({
      level: data?.level ?? 1,
      totalSpentEur: Number(data?.total_spent_eur) || 0,
      rewardsClaimed: data?.level_rewards_claimed || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// ACCOUNT: delete, referral, profile extras
// ====================================================================

app.get('/api/me/referral', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('referral_code, referral_photos_earned, level, completed_generations, photo_balance')
      .eq('id', userId)
      .single();
    if (error) throw error;

    const { count: invitedCount } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    res.json({
      referralCode: profile?.referral_code,
      invited: invitedCount || 0,
      photosEarned: profile?.referral_photos_earned || 0,
      level: profile?.level || 1,
      completedGenerations: profile?.completed_generations || 0,
      photoBalance: profile?.photo_balance || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/me/referral', requireAuth, async (req: AuthRequest, res) => {
  const code = String(req.body?.code || '').trim();
  if (!code) {
    return res.status(400).json({ error: 'Missing referral code' });
  }
  try {
    const { data, error } = await supabaseAdmin.rpc('apply_referral', {
      p_referred_id: req.user!.id,
      p_code: code
    });
    if (error) throw error;
    if (data && data.ok === false) {
      return res.status(400).json({ error: data.error || 'referral_failed', data });
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/account/delete', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  try {
    // 1. List and remove storage objects
    for (const bucket of ['user-photos', 'generated-images'] as const) {
      const { data: files } = await supabaseAdmin.storage.from(bucket).list(userId, { limit: 1000 });
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from(bucket).remove(paths);
      }
    }

    // 2. DB wipe via RPC
    const { data: delResult, error: delErr } = await supabaseAdmin.rpc('delete_user_account', {
      p_user_id: userId
    });
    if (delErr) throw delErr;

    // 3. Auth user
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error('Auth deleteUser:', authErr);
      // profile already gone; report partial
      return res.status(200).json({ success: true, warning: authErr.message, db: delResult });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Account delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// STATIC & VITE MIDDLEWARE
// ====================================================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraStudio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
