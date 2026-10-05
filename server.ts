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
const MAX_SOURCE_PHOTO_BYTES = 10 * 1024 * 1024;
const SUPPORTED_SOURCE_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif'
};
const SUPPORTED_ASPECT_RATIOS = new Set(['1:1', '3:4', '4:3', '9:16', '16:9']);

// 10 MB source photos arrive as base64 (~13.4 MB), so leave a small JSON envelope margin.
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

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

// Credit packages (public)
app.get('/api/credit-packages', async (req, res) => {
  if (!isServerSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('credits', { ascending: true });

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

// Upload a user photo (to the private 'user-photos' storage bucket).
app.post('/api/photos', requireAuth, async (req: AuthRequest, res) => {
  const { dataUrl, filename } = req.body || {};
  const dataUrlMatch = typeof dataUrl === 'string'
    ? dataUrl.match(/^data:(image\/(?:jpeg|png|webp|heic|heif));base64,([A-Za-z0-9+/=\r\n]+)$/i)
    : null;

  if (!dataUrlMatch) {
    return res.status(400).json({ error: 'Se acceptă imagini JPEG, PNG, WebP, HEIC sau HEIF codificate în Base64.' });
  }

  const mimeType = dataUrlMatch[1].toLowerCase();
  const extension = SUPPORTED_SOURCE_PHOTO_TYPES[mimeType];
  const base64Data = dataUrlMatch[2].replace(/\s/g, '');
  const buffer = Buffer.from(base64Data, 'base64');

  if (!buffer.length) {
    return res.status(400).json({ error: 'Fișierul imagine este gol sau invalid.' });
  }
  if (buffer.length > MAX_SOURCE_PHOTO_BYTES) {
    return res.status(413).json({ error: 'Fotografia trebuie să aibă maximum 10 MB.' });
  }

  const userId = req.user!.id;
  const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const storagePath = `${userId}/${photoId}.${extension}`;
  const safeFilename = typeof filename === 'string' && filename.trim()
    ? path.basename(filename.trim()).replace(/\0/g, '').slice(0, 255)
    : `my_photo.${extension}`;

  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from('user-photos')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: record, error: dbError } = await supabaseAdmin
      .from('user_photos')
      .insert({
        user_id: userId,
        storage_path: storagePath,
        filename: safeFilename,
        mime_type: mimeType,
        file_size: buffer.length
      })
      .select('*')
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from('user-photos').remove([storagePath]);
      throw dbError;
    }

    const { data: signedData, error: signedUrlError } = await supabaseAdmin.storage
      .from('user-photos')
      .createSignedUrl(storagePath, 3600);

    if (signedUrlError) throw signedUrlError;

    return res.json({
      id: record.id,
      userId: record.user_id,
      url: signedData?.signedUrl || '',
      filename: record.filename,
      uploadedAt: record.created_at
    });
  } catch (err: any) {
    console.error('Error uploading photo:', err);
    return res.status(500).json({ error: 'Încărcarea fotografiei a eșuat: ' + err.message });
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

type GenerationPhotoPart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

type OwnedPhotoPartResult =
  | { ok: true; part: GenerationPhotoPart }
  | { ok: false; status: number; error: string };

// Load a private photo only through its authenticated database record. Client-supplied URLs
// are deliberately not accepted for generation inputs.
async function loadOwnedPhotoPart(userId: string, photoId: string): Promise<OwnedPhotoPartResult> {
  const { data: photo, error: photoError } = await supabaseAdmin
    .from('user_photos')
    .select('id, user_id, storage_path, mime_type, file_size')
    .eq('id', photoId)
    .eq('user_id', userId)
    .maybeSingle();

  if (photoError || !photo) {
    return { ok: false, status: 404, error: 'Fotografia nu a fost găsită în biblioteca ta.' };
  }

  const mimeType = String(photo.mime_type || '').toLowerCase();
  if (!SUPPORTED_SOURCE_PHOTO_TYPES[mimeType]) {
    return { ok: false, status: 415, error: 'Formatul fotografiei nu este acceptat. Folosește JPEG, PNG, WebP, HEIC sau HEIF.' };
  }
  if (Number(photo.file_size) > MAX_SOURCE_PHOTO_BYTES) {
    return { ok: false, status: 413, error: 'Fotografia trebuie să aibă maximum 10 MB.' };
  }

  const { data: blob, error: storageError } = await supabaseAdmin.storage
    .from('user-photos')
    .download(photo.storage_path);

  if (storageError || !blob) {
    console.error('Could not load private source photo:', storageError);
    return { ok: false, status: 422, error: 'Nu am putut citi fotografia selectată. Încarc-o din nou și încearcă iar.' };
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  if (!buffer.length) {
    return { ok: false, status: 422, error: 'Fotografia selectată este goală sau invalidă.' };
  }
  if (buffer.length > MAX_SOURCE_PHOTO_BYTES) {
    return { ok: false, status: 413, error: 'Fotografia trebuie să aibă maximum 10 MB.' };
  }

  return {
    ok: true,
    part: { inlineData: { mimeType, data: buffer.toString('base64') } }
  };
}

// ====================================================================
// GENERATION JOBS PIPELINE (Real AI + Atomic Credit Ledger)
// ====================================================================

// Create and trigger AI generation job
app.post('/api/generations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const templateId = typeof body.templateId === 'string' ? body.templateId.trim() : '';
    const userPhotoId = typeof body.userPhotoId === 'string' ? body.userPhotoId.trim() : '';
    const requestedMode = body.mode;
    const mode: 'template' | 'pinterest' | 'couple' | null = requestedMode == null || requestedMode === 'template'
      ? 'template'
      : requestedMode === 'pinterest' || requestedMode === 'couple'
        ? requestedMode
        : null;
    const customReferencePhotoId = typeof body.customReferencePhotoId === 'string' ? body.customReferencePhotoId.trim() : '';
    const partnerPhotoId = typeof body.partnerPhotoId === 'string' ? body.partnerPhotoId.trim() : '';
    const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio : '';
    const userId = req.user!.id;

    if (!mode) {
      return res.status(400).json({ error: 'Modul de generare nu este valid.' });
    }
    if (!templateId) {
      return res.status(400).json({ error: 'Parametrul templateId este obligatoriu.' });
    }
    if (!userPhotoId) {
      return res.status(400).json({ error: 'Încarcă o fotografie înainte de generare.' });
    }
    if (mode === 'pinterest' && !customReferencePhotoId) {
      return res.status(400).json({ error: 'Încarcă o fotografie de referință înainte de generare.' });
    }
    if (mode === 'couple' && !partnerPhotoId) {
      return res.status(400).json({ error: 'Încarcă fotografia celeilalte persoane înainte de generare.' });
    }

    // The job schema references a real active template; Pinterest and couple modes customize
    // its prompt at runtime without adding columns or storing extra photo IDs in the job row.
    const { data: template, error: templateError } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Could not load generation template:', templateError);
      return res.status(500).json({ error: 'Șablonul nu a putut fi încărcat. Încearcă din nou.' });
    }
    if (!template) {
      return res.status(404).json({ error: 'Șablonul specificat nu există sau nu mai este activ.' });
    }

    const effectiveCreditCost = Number(template.credit_cost);
    if (!Number.isInteger(effectiveCreditCost) || effectiveCreditCost < 1) {
      return res.status(500).json({ error: 'Costul șablonului nu este configurat corect.' });
    }

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      return res.status(503).json({
        error: 'Generarea AI nu este configurată pe server: GEMINI_API_KEY lipsește în Secrets. Te rugăm să configurezi cheia Gemini în panoul de Secrets.'
      });
    }

    const primaryPhotoResult = await loadOwnedPhotoPart(userId, userPhotoId);
    if (!primaryPhotoResult.ok) {
      return res.status(primaryPhotoResult.status).json({ error: primaryPhotoResult.error });
    }

    let secondaryPhotoPart: GenerationPhotoPart | null = null;
    if (mode === 'pinterest') {
      const referencePhotoResult = await loadOwnedPhotoPart(userId, customReferencePhotoId);
      if (!referencePhotoResult.ok) {
        return res.status(referencePhotoResult.status).json({ error: referencePhotoResult.error });
      }
      secondaryPhotoPart = referencePhotoResult.part;
    } else if (mode === 'couple') {
      const partnerPhotoResult = await loadOwnedPhotoPart(userId, partnerPhotoId);
      if (!partnerPhotoResult.ok) {
        return res.status(partnerPhotoResult.status).json({ error: partnerPhotoResult.error });
      }
      secondaryPhotoPart = partnerPhotoResult.part;
    }

    const requestedAspectRatio = SUPPORTED_ASPECT_RATIOS.has(aspectRatio)
      ? aspectRatio
      : (SUPPORTED_ASPECT_RATIOS.has(template.aspect_ratio) ? template.aspect_ratio : '3:4');

    let jobId: string | null = null;
    let creditsDeducted = false;

    try {
      const { data: jobRecord, error: jobCreateError } = await supabaseAdmin
        .from('generation_jobs')
        .insert({
          user_id: userId,
          template_id: template.id,
          user_photo_id: userPhotoId,
          status: 'queued',
          progress: 10,
          current_step_message: 'Verificare credite și autorizare...',
          provider_id: 'gemini-genai',
          credit_cost: effectiveCreditCost,
          aspect_ratio: requestedAspectRatio
        })
        .select('id')
        .single();

      if (jobCreateError || !jobRecord) {
        throw new Error('Eroare la crearea înregistrării generării: ' + jobCreateError?.message);
      }

      jobId = jobRecord.id;

      const { data: newBalance, error: deductError } = await supabaseAdmin
        .rpc('deduct_credits_for_generation', {
          p_user_id: userId,
          p_amount: effectiveCreditCost,
          p_template_id: template.id,
          p_template_name: template.name_ro || 'Photo Shoot',
          p_job_id: jobId
        });

      if (deductError) {
        await supabaseAdmin
          .from('generation_jobs')
          .update({ status: 'failed', error_message: 'Credite insuficiente pentru această generare.' })
          .eq('id', jobId);

        return res.status(402).json({
          error: 'Credite insuficiente. Încarcă-ți contul pentru a genera această fotografie.',
          required: effectiveCreditCost
        });
      }
      creditsDeducted = true;

      const { error: processingUpdateError } = await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'processing',
          progress: 35,
          current_step_message: 'Sinteză portret fotorealist prin Google Gemini...',
          started_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (processingUpdateError) throw processingUpdateError;

      const templatePrompt = String(template.prompt || '');
      const negativePrompt = template.negative_prompt
        ? ` Avoid these visual artifacts: ${template.negative_prompt}.`
        : '';
      let fullPrompt: string;

      if (mode === 'pinterest') {
        fullPrompt = `Use the first image as the identity source and the second image only as a visual reference. Preserve the exact identity, facial structure, skin tone, hair, and age of the person in the first image. Transfer the reference's wardrobe, pose, lighting, composition, and setting without copying the reference person's identity. Create a high-end, photorealistic editorial portrait. ${templatePrompt}${negativePrompt}`;
      } else if (mode === 'couple') {
        fullPrompt = `Create a romantic editorial couple portrait using the first image as person one and the second image as person two. Preserve both people's distinct facial identities and natural features. Place them together in a believable, elegant pose and setting. Style direction: ${templatePrompt}. Use cinematic, natural lighting and photorealistic detail.${negativePrompt}`;
      } else {
        fullPrompt = `${templatePrompt} Create a high-end professional portrait while preserving the identity and facial features of the person in the provided source photo. Use a pristine European aesthetic, cinematic 85mm lens, natural facial details, and 4K ultra-HD photography.${negativePrompt}`;
      }

      const contentParts: any[] = [
        { text: fullPrompt },
        primaryPhotoResult.part
      ];
      if (secondaryPhotoPart) contentParts.push(secondaryPhotoPart);

      const genResponse = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts: contentParts },
        config: { imageConfig: { aspectRatio: requestedAspectRatio } }
      });

      let imageBase64Data: string | null = null;
      let outputMimeType = 'image/jpeg';
      const candidates = genResponse.candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content?.parts || []) {
          if (part.inlineData?.data) {
            imageBase64Data = part.inlineData.data;
            outputMimeType = part.inlineData.mimeType || 'image/jpeg';
            break;
          }
        }
      }

      if (!imageBase64Data) {
        throw new Error('Modelul Gemini nu a returnat date vizuale pentru imagine.');
      }

      const storagePath = `${userId}/${jobId}.jpg`;
      const imageBuffer = Buffer.from(imageBase64Data, 'base64');
      const { error: storageError } = await supabaseAdmin.storage
        .from('generated-images')
        .upload(storagePath, imageBuffer, { contentType: outputMimeType, upsert: true });
      if (storageError) throw storageError;

      const { error: generatedImageError } = await supabaseAdmin
        .from('generated_images')
        .insert({ job_id: jobId, user_id: userId, storage_path: storagePath, mime_type: outputMimeType });
      if (generatedImageError) throw generatedImageError;

      const { data: signedData, error: signedUrlError } = await supabaseAdmin.storage
        .from('generated-images')
        .createSignedUrl(storagePath, 7200);
      if (signedUrlError) throw signedUrlError;

      const { error: completedUpdateError } = await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'completed',
          progress: 100,
          current_step_message: 'Portret finalizat cu succes!',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);
      if (completedUpdateError) throw completedUpdateError;

      return res.json({ jobId, status: 'completed', resultImageUrl: signedData?.signedUrl || '', newBalance });
    } catch (generationError: any) {
      console.error('Generation error:', generationError);

      if (jobId && creditsDeducted) {
        try {
          await supabaseAdmin.rpc('refund_credits_for_failed_job', {
            p_job_id: jobId,
            p_error_message: generationError?.message || 'Eroare necunoscută la generare.'
          });
        } catch (refundError) {
          console.error('Refund procedure notice:', refundError);
        }
      }

      return res.status(500).json({
        error: creditsDeducted
          ? 'Generarea a eșuat. Creditele au fost restituite automat pe contul tău: ' + (generationError?.message || '')
          : 'Generarea nu a putut fi pornită: ' + (generationError?.message || '')
      });
    }
  } catch (requestError: any) {
    console.error('Could not start generation request:', requestError);
    return res.status(500).json({ error: 'Generarea nu a putut fi pornită. Încearcă din nou.' });
  }
});

// List generation jobs for current user
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
          creditCost: job.credit_cost,
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

// User Credit Transactions Ledger
app.get('/api/credit-transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('credit_transactions')
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
// ====================================================================

app.post('/api/payments/checkout', requireAuth, async (req: AuthRequest, res) => {
  const { packageId, currency } = req.body;

  if (!paymentGateway.isConfigured()) {
    return res.status(400).json({
      isConfigured: false,
      message: 'Modulul de plată online este în curs de configurare. Pentru creditare de test, folosește panoul de administrare.'
    });
  }

  // If configured, delegate to payment provider
  const result = await paymentGateway.createCheckout({
    packageId,
    userId: req.user!.id,
    userEmail: req.user!.email,
    amount: 100,
    currency: currency || 'MDL',
    returnUrl: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/success`
  });

  res.json(result);
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

// Admin adjust credits
app.post('/api/admin/credits/adjust', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { targetUserId, amount, reason } = req.body;

  if (!targetUserId || typeof amount !== 'number') {
    return res.status(400).json({ error: 'targetUserId și amount sunt obligatorii.' });
  }

  try {
    const { data: newBalance, error } = await supabaseAdmin.rpc('admin_adjust_credits', {
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
      .from('credit_transactions')
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
