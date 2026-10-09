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

export type StudioMode = 'template' | 'pinterest' | 'couple' | 'enhance';
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
  photoCost: number;
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
  label?: string;
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
  isPack?: boolean;
  status: JobStatus;
  progress: number;
  currentStepMessage?: string;
  resultImageUrl?: string;
  resultImagesPack?: string[];
  errorMessage?: string;
  providerId: string;
  providerName: string;
  photoCost: number;
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
  photoBalance: number;
  preferredLanguage: Language;
  preferredCurrency: Currency;
  country: 'Moldova' | 'Romania' | 'Other';
  createdAt: string;
}

export type TransactionType =
  | 'purchase'
  | 'generation_spend'
  | 'generation_refund'
  | 'admin_grant'
  | 'admin_deduct'
  | 'welcome_bonus';

export interface PhotoTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

/** @deprecated use PhotoTransaction */
export type CreditTransaction = PhotoTransaction;

export interface PhotoPackage {
  id: string;
  name: LocalizedString;
  photos: number;
  priceEUR: number;
  isPopular?: boolean;
  isBestValue?: boolean;
}

/** @deprecated use PhotoPackage */
export type CreditPackage = PhotoPackage & {
  credits?: number;
  bonusCredits?: number;
  priceMDL?: number;
  priceRON?: number;
};

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
  userPhotoUrl: string;
  userPhotoId?: string;
  aspectRatio?: AspectRatio;
  customPromptOverride?: string;
  mode?: StudioMode;
  customReferenceUrl?: string;
  partnerPhotoUrl?: string;
  isPack?: boolean;
  quality4k?: boolean;
}
