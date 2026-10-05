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
      error: 'Supabase backend is not configured yet. Please configure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.'
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

// ====================================================================
// GENERATION JOBS PIPELINE (Real AI + Atomic Credit Ledger)
// ====================================================================

// Create and trigger AI generation job
app.post('/api/generations', requireAuth, async (req: AuthRequest, res) => {
  const { templateId, userPhotoUrl, aspectRatio } = req.body;
  const userId = req.user!.id;

  if (!templateId) {
    return res.status(400).json({ error: 'Parametrul templateId este obligatoriu.' });
  }

  if (!userPhotoUrl) {
    return res.status(400).json({ error: 'Fotografia utilizatorului este obligatorie.' });
  }

  // 1. Fetch template from database to obtain genuine cost and prompt
  const { data: template, error: tmplError } = await supabaseAdmin
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (tmplError || !template) {
    return res.status(404).json({ error: 'Șablonul specificat nu există.' });
  }

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
        current_step_message: 'Verificare credite și autorizare...',
        provider_id: 'gemini-genai',
        credit_cost: template.credit_cost,
        aspect_ratio: aspectRatio || template.aspect_ratio || '3:4'
      })
      .select('id')
      .single();

    if (jobCreateError || !jobRecord) {
      throw new Error('Eroare la crearea înregistrării generării: ' + jobCreateError?.message);
    }

    jobId = jobRecord.id;

    // 3. ATOMICALLY DEDUCT CREDITS using PostgreSQL stored procedure
    const { data: newBalance, error: deductError } = await supabaseAdmin
      .rpc('deduct_credits_for_generation', {
        p_user_id: userId,
        p_amount: template.credit_cost,
        p_template_id: template.id,
        p_template_name: template.name_ro,
        p_job_id: jobId
      });

    if (deductError) {
      // If insufficient credits or failed, update job to failed
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: 'Credite insuficiente pentru această generare.'
        })
        .eq('id', jobId);

      return res.status(402).json({
        error: 'Credite insuficiente. Încarcă-ți contul pentru a genera această fotografie.',
        required: template.credit_cost
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

    const fullPrompt = `${template.prompt}. High-end professional portrait, pristine European aesthetic, cinematic 85mm lens, natural facial details, 4k ultra-hd photography.`;

    const contentsParts: any[] = [{ text: fullPrompt }];

    // If userPhoto is dataURL, parse inlineData
    if (userPhotoUrl.startsWith('data:image/')) {
      const match = userPhotoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        contentsParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const genResponse = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: contentsParts
      },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio === '9:16' || aspectRatio === '16:9' || aspectRatio === '4:3' || aspectRatio === '3:4') ? aspectRatio : '3:4'
        }
      }
    });

    const candidates = genResponse.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64Data = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/jpeg';
          break;
        }
      }
    }

    if (!imageBase64Data) {
      throw new Error('Modelul Gemini nu a returnat date vizuale pentru imagine.');
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

    // 8. Update job to completed
    await supabaseAdmin
      .from('generation_jobs')
      .update({
        status: 'completed',
        progress: 100,
        current_step_message: 'Portret finalizat cu succes!',
        completed_at: new Date().toISOString()
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

    // 10. ATOMIC REFUND ON FAILURE (Refunds credits exactly once!)
    if (jobId) {
      try {
        await supabaseAdmin.rpc('refund_credits_for_failed_job', {
          p_job_id: jobId,
          p_error_message: genErr?.message || 'Eroare necunoscută la generare.'
        });
      } catch (refundErr) {
        console.error('Refund procedure notice:', refundErr);
      }
    }

    return res.status(500).json({
      error: 'Generarea a eșuat. Creditele au fost restituite automat pe contul tău: ' + (genErr?.message || '')
    });
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
