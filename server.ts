import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High limit for base64 photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI Server-Side Client
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

// Server Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Server-side AI Generation Endpoint
app.post('/api/generate-ai', async (req, res) => {
  const { prompt, negativePrompt, userPhotoUrl, aspectRatio } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // If Gemini API Key is present, attempt server-side generation with gemini-3.1-flash-lite-image
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        let contentsParts: any[] = [{ text: prompt }];

        if (userPhotoUrl && userPhotoUrl.startsWith('data:image')) {
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

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: contentsParts
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio === '9:16' || aspectRatio === '16:9' || aspectRatio === '4:3' || aspectRatio === '3:4') ? aspectRatio : '1:1'
            }
          }
        });

        // Search for generated image part
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              return res.json({ imageUrl, provider: 'gemini-3.1-flash-lite-image' });
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini generateContent notice (falling back to studio engine):', geminiErr?.message);
      }
    }

    // Return fallback acknowledgement to client provider engine
    return res.json({
      status: 'fallback_ready',
      message: 'Server processed generation request. Client provider engine synthesizing final output.'
    });
  } catch (error: any) {
    console.error('API Error in /api/generate-ai:', error);
    res.status(500).json({ error: error.message || 'Generation failed on server' });
  }
});

// Mount Vite in development or serve static in production
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
