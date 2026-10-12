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
import { paymentGateway } from './src/services/payments/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
    // Return empty array or notify
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
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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

    // 1. Upload to Supabase Storage 'user-photos' bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('user-photos')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2. Insert metadata record in user_photos
    const { data: record, error: dbError } = await supabaseAdmin
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

    if (dbError) throw dbError;

    // 3. Create signed URL for frontend display
    const { data: signedData } = await supabaseAdmin.storage
      .from('user-photos')
      .createSignedUrl(storagePath, 3600);

    res.json({
      ...record,
      url: signedData?.signedUrl || ''
    });
  } catch (err: any) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ error: 'Încărcarea fotografiei a eșuat: ' + err.message });
  }
});

// List user photos
app.get('/api/photos', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: photos, error } = await supabaseAdmin
      .from('user_photos')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Generate signed URLs for private images
    const photosWithUrls = await Promise.all(
      (photos || []).map(async (photo) => {
        const { data: signedData } = await supabaseAdmin.storage
          .from('user-photos')
          .createSignedUrl(photo.storage_path, 3600);
        return {
          id: photo.id,
          userId: photo.user_id,
          url: signedData?.signedUrl || '',
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

// Delete user photo
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

    // Delete from storage
    await supabaseAdmin.storage
      .from('user-photos')
      .remove([photo.storage_path]);

    // Delete from database
    await supabaseAdmin
      .from('user_photos')
      .delete()
      .eq('id', photo.id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to convert dataURL or fetch image buffer to Gemini inlineData
async function urlToGenerativePart(url: string) {
  if (!url) return null;

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

  if (!template) {
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
        template_id: template.id,
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
        p_template_id: template.id,
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

    // ── Prompt + images: IDENTITY selfies + SCENE TEXT (no style image) ──
    // Templates: scene from templates.prompt
    // Pinterest: scene from on-the-fly vision analysis of the reference
    // Blur / style-image face transfer removed on purpose.

    const SCENE_ANALYZE_PROMPT = `You are a photography director writing a scene brief for an AI image generator.

Analyze the reference photograph in extreme detail. Output ONLY a single dense English paragraph (no bullet lists, no markdown, no preamble).

Describe the COMPLETE scene so another model can recreate the same shot WITHOUT seeing this image and WITHOUT copying any person's face:
- Camera: exact framing (head-and-shoulders / waist-up / full body), camera height, angle (eye-level / slight low / high), approximate focal length feel (e.g. 35mm, 50mm, 85mm), depth of field
- Pose: body orientation, head turn, gaze direction, arm and hand placement, weight distribution
- Wardrobe: garments, colors, fabrics, fit, accessories, shoes if visible
- Environment: location type, architecture, furniture, props, what is left/right/behind the subject
- Lighting: key light direction and quality (soft/hard), fill, rim, color temperature, time of day, reflections
- Color grade and mood: overall palette, contrast, atmosphere
- Composition: subject placement in frame, leading lines, background blur amount

STRICT RULES:
- Do NOT describe facial features, age, gender presentation, skin, hair style/color, or identity of any person.
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
      try {
        const resp = await aiClient!.models.generateContent({
          model: analysisModel,
          contents: {
            parts: [
              { text: SCENE_ANALYZE_PROMPT },
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

    const ageProvided = age !== undefined && age !== null && age !== '';
    const age2Provided = age2 !== undefined && age2 !== null && age2 !== '';
    const ageNum = ageProvided ? Number(age) : NaN;
    const age2Num = age2Provided ? Number(age2) : NaN;
    const age1Line =
      Number.isFinite(ageNum) && ageNum >= 1 && ageNum <= 120
        ? `Apparent age of Person A should be about ${Math.round(ageNum)} years (only if consistent with the identity photos).`
        : '';
    const age2Line =
      Number.isFinite(age2Num) && age2Num >= 1 && age2Num <= 120
        ? `Apparent age of Person B should be about ${Math.round(age2Num)} years (only if consistent with the identity photos).`
        : '';
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

    const negFromDb = (template.negative_prompt || template.negativePrompt || '').trim();
    const avoidLine = negFromDb
      ? `Avoid: ${negFromDb}`
      : 'Avoid: distorted anatomy, extra fingers, plastic skin, watermarks, logos, text overlays.';

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

    const editText = String(editInstruction || '').trim();

    // Resolve SCENE TEXT (never send style/template image to the image model)
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

    let promptContext = '';
    if (effectiveMode === 'enhance') {
      promptContext = [
        'TASK: Improve technical quality of this photo only.',
        'Preserve exact identity, face, expression, pose, clothing, composition, background.',
        'Do not restyle, beautify into another person, or change age.',
        quality4k ? 'Maximum clarity and detail.' : 'Clean high detail.',
        avoidLine
      ].join('\n');
    } else if (effectiveMode === 'refine') {
      if (!editText) {
        throw new Error('editInstruction is required for refine mode.');
      }
      const fromDb = await loadPromptFromDb('refine');
      if (fromDb) {
        promptContext = fromDb
          .replace(/\{\{edit\}\}/g, editText)
          .replace(/\{\{edit_instruction\}\}/g, editText)
          .replace(/\{\{avoid_line\}\}/g, avoidLine);
      } else {
        promptContext = [
          'TASK: Edit the supplied photograph according to the user instruction below.',
          'Change ONLY what the instruction asks. Keep identity, face structure, pose, clothing, background, and composition unless the instruction explicitly changes them.',
          'Do not invent a different person. Do not age the subject. Light natural skin is ok; no plastic beautify.',
          'USER INSTRUCTION:',
          editText,
          avoidLine
        ].join('\n');
      }
    } else if (effectiveMode === 'couple') {
      promptContext = [
        'TASK: Create ONE photorealistic photo of TWO real people together.',
        'PERSON A appears on the LEFT. PERSON B appears on the RIGHT.',
        'Faces must match the IDENTITY photos for A and B only. Do not invent or swap faces.',
        'Follow the SCENE description exactly for setting, wardrobe, pose intent, camera angle, lighting, and framing.',
        'Do not invent a different camera angle than the scene describes.',
        'SCENE:',
        sceneText,
        age1Line,
        age2Line,
        avoidLine
      ]
        .filter(Boolean)
        .join('\n');
    } else if (effectiveMode === 'pinterest') {
      promptContext = [
        'TASK: Create ONE photorealistic photo of the IDENTITY person in the SCENE below.',
        'The face must match the IDENTITY photo(s) exactly (bone structure, eyes, nose, lips, skin, hairline).',
        'Recreate the SCENE as described: same camera angle, framing, pose, wardrobe, lighting, and environment.',
        'Do not invent a different viewpoint than the scene specifies.',
        'SCENE (from reference analysis — no face identity in this text):',
        sceneText,
        age1Line,
        bodyLine,
        avoidLine
      ]
        .filter(Boolean)
        .join('\n');
    } else {
      // template single
      promptContext = [
        'TASK: Create ONE photorealistic photo of the IDENTITY person in the SCENE below.',
        'The face must match the IDENTITY photo(s) exactly (bone structure, eyes, nose, lips, skin, hairline, age signs).',
        'Follow the SCENE description closely for environment, wardrobe, pose, camera angle, focal length feel, lighting, and framing.',
        'Do not change the camera angle or crop style described in the scene.',
        'If the scene text mentions a generic person, ignore their face/identity — use only the IDENTITY photos for the face.',
        'SCENE:',
        sceneText,
        age1Line,
        avoidLine
      ]
        .filter(Boolean)
        .join('\n');
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
    const expressionText = String(template.expression || '').trim() ||
      'calm neutral expression, closed mouth, no smile';

    // Helper: one Interactions image call
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
          interaction.output_image.mime_type ||
          interaction.output_image.mimeType ||
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
      pushText(
        pass1Input,
        [
          'TASK: Create ONE photorealistic photo of the IDENTITY person in the SCENE below.',
          'The face must match the IDENTITY photo(s) exactly (bone structure, eyes, nose, lips, skin).',
          'Hair: take color, length and texture only from the IDENTITY photo; ignore any hair described in the scene.',
          'Follow the SCENE for environment, wardrobe, pose, camera angle, lighting, and framing.',
          'Scene accuracy is secondary to a correct, well-scaled face and head.',
          'SCENE:',
          sceneText,
          age1Line,
          bodyLine,
          avoidLine
        ]
          .filter(Boolean)
          .join('\n')
      );
      pushText(pass1Input, 'IDENTITY — the only face that must appear:');
      await pushImageFromUrl(pass1Input, userPhotoUrl);
      if (Array.isArray(extraPhotoUrls)) {
        for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(pass1Input, u);
      }
      pushText(
        pass1Input,
        'FINAL: Face and hair from IDENTITY only. Output a single photorealistic image.'
      );

      const pass1 = await runImagePass(pass1Input, '1K', 'PASS1-single');

      // ========== SINGLE: PASS 2 ==========
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 70,
          current_step_message: 'Pass 2/2: composite on masked scene (2K/4K)...'
        })
        .eq('id', jobId);

      const pass2Input: any[] = [];
      pushText(
        pass2Input,
        [
          'Image 1 is the SCENE. The person\'s face and hair on it are covered by a mask.',
          'Image 2 is a photograph of the person whose head must be used.',
          '',
          'Generate a photorealistic photo: keep the scene from Image 1 unchanged (background, pose, hands, clothing, props, light, camera angle) and replace the masked region with the head from Image 2: same face, same hair, beard or stubble if present, eye color. Match head size, rotation and tilt to the pose on Image 1.',
          '',
          'Skin color: use the skin tone from the head in Image 2 everywhere it belongs on that person — face, ears, neck, and any visible skin that is part of the head/neck area. Do not use the skin tone of the original person in Image 1. The whole head-and-neck skin must match Image 2; do not leave a different skin tone on the neck or jawline.',
          '',
          `Facial expression: ${expressionText}. Do not change anything else about the face: do not add wrinkles or under-eye bags, do not age or de-age.`,
          '',
          'Keep the same identity, but apply a subtle natural finish: slightly fresher look (soften under-eye heaviness and deep wrinkles only a little), healthy skin with real texture — no plastic blur, no beauty-filter face. Do not change bone structure, eye shape, nose, lips, or make the person look like someone else. Do not age the person. Sharpness and grain should still match the rest of the frame.',
          avoidLine
        ]
          .filter(Boolean)
          .join('\n')
      );
      pushText(pass2Input, 'IMAGE 1 — SCENE (face and hair masked):');
      await pushImageFromUrl(pass2Input, maskUrl);
      pushText(pass2Input, 'IMAGE 2 — HEAD / IDENTITY source:');
      pass2Input.push({
        type: 'image',
        mime_type: pass1.mimeType || 'image/png',
        data: pass1.data
      });
      pushText(
        pass2Input,
        'FINAL: Composite the head from Image 2 onto the masked scene of Image 1. One photorealistic image. Skin tone of the head matches Image 2.'
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
      pushText(
        pass1Input,
        [
          'TASK: Create ONE photorealistic photo of TWO people together in the SCENE below.',
          'PERSON A appears on the LEFT side of the frame. PERSON B appears on the RIGHT side of the frame.',
          'Each face must match that person\'s IDENTITY photos only. Do not invent faces. Do not swap A and B.',
          'Hair for each person: take color, length and texture only from that person\'s own IDENTITY photos; ignore any hair described in the scene text.',
          'Follow the SCENE for environment, wardrobe, poses, camera angle, lighting, and framing.',
          'Scene accuracy is secondary to correct, well-scaled faces and heads for both people.',
          'SCENE:',
          sceneText,
          age1Line,
          age2Line,
          avoidLine
        ]
          .filter(Boolean)
          .join('\n')
      );
      pushText(pass1Input, 'IDENTITY A (LEFT) — photos of the person who must appear on the LEFT:');
      await pushImageFromUrl(pass1Input, userPhotoUrl);
      if (Array.isArray(extraPhotoUrls)) {
        for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(pass1Input, u);
      }
      pushText(pass1Input, 'IDENTITY B (RIGHT) — photos of the person who must appear on the RIGHT:');
      if (partnerPhotoUrl) await pushImageFromUrl(pass1Input, partnerPhotoUrl);
      if (Array.isArray(partnerExtraPhotoUrls)) {
        for (const u of partnerExtraPhotoUrls.slice(0, 4))
          await pushImageFromUrl(pass1Input, u);
      }
      pushText(
        pass1Input,
        'FINAL: Two people in one image. Faces and hair from IDENTITY A and IDENTITY B only. Do not merge or swap them.'
      );

      const pass1 = await runImagePass(pass1Input, '1K', 'PASS1-couple');

      // ========== COUPLE: PASS 2 (two masked heads) ==========
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          progress: 70,
          current_step_message: 'Pass 2/2: composite both heads on masked scene (2K/4K)...'
        })
        .eq('id', jobId);

      const pass2Input: any[] = [];
      pushText(
        pass2Input,
        [
          'Image 1 is the SCENE with TWO people. Both faces and both heads of hair are covered by masks.',
          'Image 2 is a photograph of the SAME two people whose heads must be used (left person and right person already placed correctly in Image 2).',
          '',
          'Generate one photorealistic photo: keep the scene from Image 1 unchanged (background, both body poses, hands, clothing, props, light, camera angle). Replace EACH masked head with the matching head from Image 2.',
          'Left masked person ← head of the left person in Image 2. Right masked person ← head of the right person in Image 2. Do not swap them. Do not put the same face on both. Do not invent a third person.',
          'For each head: same face, same hair, beard or stubble if present, eye color. Match head size, rotation and tilt to each pose on Image 1.',
          '',
          'Skin color: for EACH person, use the skin tone from that person\'s head in Image 2 on their face, ears, neck, and any visible skin in the head/neck area. Do not use the skin tones of the original people in Image 1. Do not leave a different skin tone on the neck or jawline.',
          '',
          `Facial expressions: ${expressionText}. Apply a natural expression to each person. Do not add wrinkles or under-eye bags; do not age or de-age either person.`,
          '',
          'Keep the same identity, but apply a subtle natural finish: slightly fresher look (soften under-eye heaviness and deep wrinkles only a little), healthy skin with real texture — no plastic blur, no beauty-filter face. Do not change bone structure, eye shape, nose, lips, or make the person look like someone else. Do not age the person. Sharpness and grain should still match the rest of the frame.',
          avoidLine
        ]
          .filter(Boolean)
          .join('\n')
      );
      pushText(pass2Input, 'IMAGE 1 — SCENE (both faces and hair masked):');
      await pushImageFromUrl(pass2Input, maskUrl);
      pushText(pass2Input, 'IMAGE 2 — both HEADS / IDENTITY sources (left and right as already composed):');
      pass2Input.push({
        type: 'image',
        mime_type: pass1.mimeType || 'image/png',
        data: pass1.data
      });
      pushText(
        pass2Input,
        'FINAL: Composite both heads from Image 2 onto the two masked people in Image 1. One photorealistic image. Do not swap left and right. Each person\'s skin tone matches their own head in Image 2.'
      );

      const pass2 = await runImagePass(pass2Input, imageQuality, 'PASS2-couple');
      imageBase64Data = pass2.data;
      mimeType = pass2.mimeType;
    } else {
      // ── SINGLE PASS (enhance / pinterest / no mask) ───────────────────
      const interactionInput: any[] = [];
      pushText(interactionInput, promptContext);

      if (effectiveMode === 'enhance') {
        pushText(interactionInput, 'PHOTO TO ENHANCE:');
        await pushImageFromUrl(interactionInput, userPhotoUrl);
      } else if (effectiveMode === 'refine') {
        pushText(interactionInput, 'PHOTO TO EDIT (base image):');
        await pushImageFromUrl(interactionInput, userPhotoUrl, 'refine base');
        pushText(interactionInput, 'Apply the USER INSTRUCTION only. Output one edited photorealistic image.');
      } else if (effectiveMode === 'couple') {
        pushText(interactionInput, 'IDENTITY A (LEFT) — face source for the person on the LEFT:');
        await pushImageFromUrl(interactionInput, userPhotoUrl);
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(interactionInput, u);
        }
        pushText(interactionInput, 'IDENTITY B (RIGHT) — face source for the person on the RIGHT:');
        if (partnerPhotoUrl) await pushImageFromUrl(interactionInput, partnerPhotoUrl);
        if (Array.isArray(partnerExtraPhotoUrls)) {
          for (const u of partnerExtraPhotoUrls.slice(0, 4))
            await pushImageFromUrl(interactionInput, u);
        }
      } else {
        pushText(interactionInput, 'IDENTITY — the only face that must appear in the result:');
        await pushImageFromUrl(interactionInput, userPhotoUrl);
        if (Array.isArray(extraPhotoUrls)) {
          for (const u of extraPhotoUrls.slice(0, 4)) await pushImageFromUrl(interactionInput, u);
        }
      }

      pushText(
        interactionInput,
        effectiveMode === 'enhance'
          ? 'Output an enhanced version of the same photo.'
          : effectiveMode === 'refine'
            ? 'Output one edited photorealistic image following the USER INSTRUCTION.'
            : 'FINAL: Face from IDENTITY photos only. Scene from the SCENE text only. No other face.'
      );

      const imageSize: '1K' | '2K' | '4K' = imageQuality;
      const single = await runImagePass(interactionInput, imageSize, 'SINGLE');
      imageBase64Data = single.data;
      mimeType = single.mimeType;
    }

    if (!imageBase64Data) {
      throw new Error('Model did not return image data.');
    }

        // 6. Save generated image to private Supabase Storage bucket 'generated-images'
    const storagePath = `${userId}/${jobId}.jpg`;
    const imageBuffer = Buffer.from(imageBase64Data, 'base64');

    const { error: storageError } = await supabaseAdmin.storage
      .from('generated-images')
      .upload(storagePath, imageBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (storageError) throw storageError;

    // 7. Insert record in generated_images table
    await supabaseAdmin
      .from('generated_images')
      .insert({
        job_id: jobId,
        user_id: userId,
        storage_path: storagePath,
        mime_type: mimeType
      });

    // 8. Update job to completed (persist storage path so DELETE can clean the bucket)
    await supabaseAdmin
      .from('generation_jobs')
      .update({
        status: 'completed',
        progress: 100,
        current_step_message: 'Portret finalizat cu succes!',
        completed_at: new Date().toISOString(),
        result_storage_path: storagePath
      })
      .eq('id', jobId);

    // 9. Generate secure signed URL for frontend
    const { data: signedData } = await supabaseAdmin.storage
      .from('generated-images')
      .createSignedUrl(storagePath, 7200);

    return res.json({
      jobId,
      status: 'completed',
      resultImageUrl: signedData?.signedUrl || '',
      newBalance
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

    // Collect all storage paths for this job (column + generated_images table + fallback path)
    const paths = new Set<string>();
    if (job.result_storage_path) paths.add(job.result_storage_path);
    const fallbackPath = `${job.user_id}/${job.id}.jpg`;
    paths.add(fallbackPath);

    const { data: genRows } = await supabaseAdmin
      .from('generated_images')
      .select('storage_path')
      .eq('job_id', job.id);
    for (const row of genRows || []) {
      if (row.storage_path) paths.add(row.storage_path);
    }

    if (paths.size > 0) {
      await supabaseAdmin.storage.from('generated-images').remove([...paths]);
    }

    await supabaseAdmin.from('generated_images').delete().eq('job_id', job.id);

    await supabaseAdmin
      .from('generation_jobs')
      .delete()
      .eq('id', job.id)
      .eq('user_id', req.user!.id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/generations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('generation_jobs')
      .select('*, templates(name_ro, preview_image_url)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Resolve signed URLs for generated images
    const jobsWithSignedUrls = await Promise.all(
      (jobs || []).map(async (job) => {
        let resultImageUrl: string | undefined = undefined;
        if (job.status === 'completed') {
          const storagePath = `${job.user_id}/${job.id}.jpg`;
          const { data: signed } = await supabaseAdmin.storage
            .from('generated-images')
            .createSignedUrl(storagePath, 3600);
          resultImageUrl = signed?.signedUrl;
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
          errorMessage: job.error_message,
          providerId: job.provider_id,
          photoCost: job.photo_cost,
          aspectRatio: job.aspect_ratio,
          createdAt: job.created_at,
          completedAt: job.completed_at
        };
      })
    );

    res.json(jobsWithSignedUrls);
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
    const { data, error } = await supabaseAdmin
      .from('photo_transactions')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
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

// Extended /api/me already returns profile columns (level, referral_code, etc.)

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
