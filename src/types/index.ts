export type Language = 'ro' | 'ru' | 'en';
export type Currency = 'MDL' | 'RON' | 'EUR';
export type Theme = 'light' | 'dark';

export type TemplateCategory =
  | 'Trending'
  | 'Fashion'
  | 'Business'
  | 'Instagram'
  | 'Couple'
  | 'Family'
  | 'Birthday'
  | 'Travel'
  | 'Lifestyle'
  | 'Heritage'
  | 'Editorial';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type RequiredInputType =
  | 'single_portrait'
  | 'couple_portrait'
  | 'full_body'
  | 'group_family'
  | 'any';

export interface LocalizedString {
  ro: string;
  ru: string;
  en: string;
}

export type StudioMode = 'template' | 'pinterest' | 'couple';
export type GenderCategory = 'all' | 'women' | 'men' | 'couples';

export interface PhotoTemplate {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: TemplateCategory;
  gender?: 'women' | 'men' | 'unisex' | 'couple';
  previewImage: string;
  beforeImage?: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  creditCost: number;
  requiredInputType: RequiredInputType;
  isActive: boolean;
  displayOrder: number;
  tags?: string[];
  providerHint?: string;
}

export interface UserPhoto {
  id: string;
  userId: string;
  url: string;
  filename: string;
  uploadedAt: string;
  width?: number;
  height?: number;
  label?: string; // e.g. "Me", "Partner"
}

export interface SavedFace {
  id: string;
  label: string;
  photoUrl: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  userId: string;
  templateId: string;
  templateName: string;
  templatePreview: string;
  userPhotoId: string;
  userPhotoUrl: string;
  customReferenceUrl?: string;
  partnerPhotoUrl?: string;
  status: JobStatus;
  progress: number; // 0 - 100
  currentStepMessage?: string;
  resultImageUrl?: string;
  resultImagesPack?: string[];
  errorMessage?: string;
  providerId: string;
  providerName: string;
  creditCost: number;
  aspectRatio: AspectRatio;
  createdAt: string;
  completedAt?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  creditBalance: number;
  preferredLanguage: Language;
  preferredCurrency: Currency;
  country: 'Moldova' | 'Romania' | 'Other';
  createdAt: string;
}

export interface AIProviderMeta {
  id: string;
  name: string;
  type: 'image' | 'video';
  description: string;
  isConfigured: boolean;
  isDefault: boolean;
  modelIdentifier: string;
  averageLatencySeconds: number;
}

export interface GenerationRequestPayload {
  templateId: string;
  userPhotoId: string;
  aspectRatio?: AspectRatio;
  mode?: StudioMode;
  customReferencePhotoId?: string;
  partnerPhotoId?: string;
}
