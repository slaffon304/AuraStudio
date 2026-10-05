import { AspectRatio, PhotoTemplate, AIProviderMeta } from '../../types';

export interface ProviderGenerateParams {
  jobId: string;
  template: PhotoTemplate;
  userPhotoUrl: string;
  aspectRatio: AspectRatio;
  authToken?: string;
  onProgress?: (progress: number, stepMessage: string) => void;
}

export interface ProviderGenerateResult {
  resultImageUrl: string;
  providerId: string;
  providerJobId?: string;
  isAsync?: boolean;
  metadata?: Record<string, any>;
}

export interface IAIProvider {
  meta: AIProviderMeta;
  generate(params: ProviderGenerateParams): Promise<ProviderGenerateResult>;
  validateHealth(): Promise<boolean>;
  checkJobStatus?(providerJobId: string): Promise<{ isComplete: boolean; resultUrl?: string; error?: string }>;
}

export class ProviderConfigurationError extends Error {
  constructor(providerName: string, missingKey: string) {
    super(`Furnizorul AI "${providerName}" nu este configurat. Cheia "${missingKey}" lipsește din variabilele de mediu ale serverului.`);
    this.name = 'ProviderConfigurationError';
  }
}

/**
 * Google Gemini Generative AI Provider (Real Server-side AI Provider)
 * Connects to Google GenAI server-side for real multimodal photo synthesis.
 */
export class GeminiGenAIProvider implements IAIProvider {
  meta: AIProviderMeta = {
    id: 'gemini-genai',
    name: 'Google Gemini Image',
    type: 'image',
    description: 'Server-side Google GenAI model (gemini-3.1-flash-lite-image) for authentic high-fidelity photo generation.',
    isConfigured: true,
    isDefault: true,
    modelIdentifier: 'gemini-3.1-flash-lite-image',
    averageLatencySeconds: 6,
  };

  async validateHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.geminiConfigured);
    } catch {
      return false;
    }
  }

  async generate(params: ProviderGenerateParams): Promise<ProviderGenerateResult> {
    const { template, userPhotoUrl, aspectRatio, authToken, onProgress } = params;

    if (onProgress) {
      onProgress(15, 'Trimitere cerere securizată către server...');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch('/api/generations', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        templateId: template.id,
        userPhotoUrl,
        aspectRatio,
        providerHint: this.meta.id,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Generarea a eșuat pe server.');
    }

    return {
      resultImageUrl: data.resultImageUrl,
      providerId: this.meta.id,
      providerJobId: data.jobId,
      metadata: {
        model: this.meta.modelIdentifier,
        jobId: data.jobId
      }
    };
  }
}

/**
 * Replicate FLUX.1 Dev LoRA Adapter (Ready for REPLICATE_API_TOKEN)
 */
export class ReplicateFluxProvider implements IAIProvider {
  meta: AIProviderMeta = {
    id: 'replicate-flux',
    name: 'Replicate FLUX.1 Dev (FaceID)',
    type: 'image',
    description: 'FLUX.1 Dev model cu InstantID facial conditioning adapter.',
    isConfigured: false,
    isDefault: false,
    modelIdentifier: 'black-forest-labs/flux-1-dev',
    averageLatencySeconds: 9,
  };

  async validateHealth(): Promise<boolean> {
    return false;
  }

  async generate(): Promise<ProviderGenerateResult> {
    throw new ProviderConfigurationError(this.meta.name, 'REPLICATE_API_TOKEN');
  }
}

/**
 * Fal.ai Fast Portrait Adapter (Ready for FAL_KEY)
 */
export class FalAiProvider implements IAIProvider {
  meta: AIProviderMeta = {
    id: 'fal-ai-pulid',
    name: 'Fal.ai PuLID Flux Studio',
    type: 'image',
    description: 'Serverless GPU cloud running PuLID facial identity preservation.',
    isConfigured: false,
    isDefault: false,
    modelIdentifier: 'fal-ai/flux-pulid',
    averageLatencySeconds: 3,
  };

  async validateHealth(): Promise<boolean> {
    return false;
  }

  async generate(): Promise<ProviderGenerateResult> {
    throw new ProviderConfigurationError(this.meta.name, 'FAL_KEY');
  }
}

/**
 * Google Veo Video Provider (Ready for future cinematic video generation)
 */
export class VeoVideoProvider implements IAIProvider {
  meta: AIProviderMeta = {
    id: 'veo-video',
    name: 'Google Veo Video',
    type: 'video',
    description: 'Generare buclă video portret 4 secunde (veo-3.1-lite-generate-preview).',
    isConfigured: false,
    isDefault: false,
    modelIdentifier: 'veo-3.1-lite-generate-preview',
    averageLatencySeconds: 24,
  };

  async validateHealth(): Promise<boolean> {
    return false;
  }

  async generate(): Promise<ProviderGenerateResult> {
    throw new ProviderConfigurationError(this.meta.name, 'GEMINI_API_KEY (Veo video model access)');
  }
}

/**
 * Provider Router & Registry Service
 * Selects provider based on:
 * 1. template provider hint
 * 2. provider availability / configuration
 * 3. default provider
 */
class ProviderRouterService {
  private providers: Map<string, IAIProvider> = new Map();
  private defaultProviderId: string = 'gemini-genai';

  constructor() {
    this.register(new GeminiGenAIProvider());
    this.register(new ReplicateFluxProvider());
    this.register(new FalAiProvider());
    this.register(new VeoVideoProvider());
  }

  register(provider: IAIProvider) {
    this.providers.set(provider.meta.id, provider);
  }

  getAllProviders(): AIProviderMeta[] {
    return Array.from(this.providers.values()).map(p => ({
      ...p.meta,
      isDefault: p.meta.id === this.defaultProviderId
    }));
  }

  resolveProvider(hint?: string): IAIProvider {
    if (hint && this.providers.has(hint)) {
      const p = this.providers.get(hint)!;
      if (p.meta.isConfigured) return p;
    }

    const defaultP = this.providers.get(this.defaultProviderId);
    if (defaultP && defaultP.meta.isConfigured) return defaultP;

    // First configured provider
    for (const p of this.providers.values()) {
      if (p.meta.isConfigured) return p;
    }

    // Default provider even if unconfigured (so it throws clear configuration error)
    return defaultP || this.providers.values().next().value!;
  }

  setDefaultProvider(id: string): boolean {
    if (this.providers.has(id)) {
      this.defaultProviderId = id;
      return true;
    }
    return false;
  }

  getDefaultProviderId(): string {
    return this.defaultProviderId;
  }

  getActiveProviderId(): string {
    return this.defaultProviderId;
  }
}

export const providerRegistry = new ProviderRouterService();
