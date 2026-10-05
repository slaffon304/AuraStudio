import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserAccount,
  UserPhoto,
  PhotoTemplate,
  GenerationJob,
  CreditTransaction,
  Language,
  Currency,
  TemplateCategory,
  CreditPackage
} from '../types';
import { INITIAL_TEMPLATES } from '../data/initialTemplates';
import { CREDIT_PACKAGES } from '../data/creditPackages';
import { TRANSLATIONS, TranslationSchema } from '../i18n/translations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
  // Localization & Currency (Only harmless client preferences in localStorage)
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: TranslationSchema;

  // Supabase Backend Status
  isBackendConnected: boolean;
  session: Session | null;
  authToken: string | null;

  // Current view & navigation
  currentView: 'explore' | 'create' | 'gallery' | 'library' | 'admin';
  setCurrentView: (view: 'explore' | 'create' | 'gallery' | 'library' | 'admin') => void;

  // User & Real Supabase Auth
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, country: 'Moldova' | 'Romania') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Templates (Database is source of truth)
  templates: PhotoTemplate[];
  selectedCategory: TemplateCategory | 'All';
  setSelectedCategory: (cat: TemplateCategory | 'All') => void;
  selectedTemplate: PhotoTemplate | null;
  setSelectedTemplate: (tmpl: PhotoTemplate | null) => void;
  addTemplate: (template: Omit<PhotoTemplate, 'id'>) => Promise<void>;
  updateTemplate: (template: PhotoTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;

  // User Photos (Private Supabase Storage)
  userPhotos: UserPhoto[];
  uploadPhoto: (dataUrl: string, filename?: string) => Promise<UserPhoto>;
  deletePhoto: (id: string) => Promise<void>;

  // Generation Jobs (Real PostgreSQL asynchronous pipeline)
  jobs: GenerationJob[];
  activeJob: GenerationJob | null;
  createGenerationJob: (templateId: string, userPhotoUrl: string, userPhotoId: string) => Promise<GenerationJob>;
  retryJob: (jobId: string) => Promise<void>;

  // Credits & Transactions
  creditPackages: CreditPackage[];
  creditTransactions: CreditTransaction[];
  purchaseCredits: (packageId: string, paymentMethod: string) => Promise<{ success: boolean; message?: string }>;
  adjustCredits: (userId: string, amount: number, reason: string) => Promise<void>;

  // Modals state
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isCreditModalOpen: boolean;
  setIsCreditModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  quickSelectTemplate: (template: PhotoTemplate) => void;

  // Formatters
  formatPrice: (mdl: number, ron: number, eur: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Harmless client preferences in localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('aurastudio_lang') as Language) || 'ro';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('aurastudio_curr') as Currency) || 'MDL';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aurastudio_lang', lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('aurastudio_curr', curr);
  };

  const t = TRANSLATIONS[language];

  // Navigation
  const [currentView, setCurrentView] = useState<'explore' | 'create' | 'gallery' | 'library' | 'admin'>('explore');

  // Supabase Auth Session
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const isBackendConnected = isSupabaseConfigured();

  // Templates from Database
  const [templates, setTemplates] = useState<PhotoTemplate[]>(INITIAL_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(null);

  // User Photos & Jobs
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);

  // Credits & Packages
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(CREDIT_PACKAGES);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const authToken = session?.access_token || null;

  // Helper: authenticated API fetch
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }
      return fetch(url, { ...options, headers });
    },
    [authToken]
  );

  // Load Templates from Database / API
  const refreshTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const dbTemplates = await res.json();
        if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
          const mapped: PhotoTemplate[] = dbTemplates.map((item: any) => ({
            id: item.id,
            category: item.category_id,
            name: { ro: item.name_ro, ru: item.name_ru, en: item.name_en },
            description: { ro: item.description_ro, ru: item.description_ru, en: item.description_en },
            previewImage: item.preview_image_url,
            prompt: item.prompt,
            negativePrompt: item.negative_prompt,
            aspectRatio: item.aspect_ratio,
            creditCost: item.credit_cost,
            requiredInputType: item.required_input_type,
            providerHint: item.provider_hint,
            tags: item.tags || [],
            isActive: item.is_active,
            displayOrder: item.display_order
          }));
          setTemplates(mapped);
          return;
        }
      }
    } catch {
      // Keep initial reference templates if network fails
    }
  }, []);

  // Fetch Current User Profile
  const fetchUserProfile = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await authFetch('/api/me');
      if (res.ok) {
        const profile = await res.json();
        if (profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar_url || '',
            role: profile.role,
            creditBalance: profile.credit_balance,
            preferredLanguage: profile.preferred_language || 'ro',
            preferredCurrency: profile.preferred_currency || 'MDL',
            country: profile.country || 'Moldova',
            createdAt: profile.created_at
          });
        }
      }
    } catch (err) {
      console.warn('Notice: Could not load user profile from server:', err);
    }
  }, [authToken, authFetch]);

  // Fetch User Photos from Storage / DB
  const fetchUserPhotos = useCallback(async () => {
    if (!authToken) {
      setUserPhotos([]);
      return;
    }
    try {
      const res = await authFetch('/api/photos');
      if (res.ok) {
        const photos = await res.json();
        if (Array.isArray(photos)) {
          setUserPhotos(photos);
        }
      }
    } catch (err) {
      console.warn('Notice: Could not fetch user photos:', err);
    }
  }, [authToken, authFetch]);

  // Fetch Generation Jobs
  const fetchJobs = useCallback(async () => {
    if (!authToken) {
      setJobs([]);
      return;
    }
    try {
      const res = await authFetch('/api/generations');
      if (res.ok) {
        const dbJobs = await res.json();
        if (Array.isArray(dbJobs)) {
          setJobs(dbJobs);
        }
      }
    } catch (err) {
      console.warn('Notice: Could not fetch generation jobs:', err);
    }
  }, [authToken, authFetch]);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    if (!authToken) {
      setCreditTransactions([]);
      return;
    }
    try {
      const res = await authFetch('/api/credit-transactions');
      if (res.ok) {
        const txs = await res.json();
        if (Array.isArray(txs)) {
          setCreditTransactions(
            txs.map((t: any) => ({
              id: t.id,
              userId: t.user_id,
              type: t.type,
              amount: t.amount,
              balanceAfter: t.balance_after,
              description: t.description,
              referenceId: t.reference_id,
              createdAt: t.created_at
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Notice: Could not fetch credit transactions:', err);
    }
  }, [authToken, authFetch]);

  // Load Admin Data (If admin)
  const fetchAdminData = useCallback(async () => {
    if (!authToken || currentUser?.role !== 'admin') return;
    try {
      const [usersRes] = await Promise.all([authFetch('/api/admin/users')]);
      if (usersRes.ok) {
        const users = await usersRes.json();
        if (Array.isArray(users)) {
          setAllUsers(
            users.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              avatar: u.avatar_url || '',
              role: u.role,
              creditBalance: u.credit_balance,
              preferredLanguage: u.preferred_language,
              preferredCurrency: u.preferred_currency,
              country: u.country,
              createdAt: u.created_at
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Notice: Could not fetch admin data:', err);
    }
  }, [authToken, currentUser?.role, authFetch]);

  // Initialize Supabase Auth Listener on Mount
  useEffect(() => {
    if (!isBackendConnected) {
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
    });

    // 2. Listen to real-time auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (!currentSession) {
        setCurrentUser(null);
        setUserPhotos([]);
        setJobs([]);
        setCreditTransactions([]);
      }
    });

    refreshTemplates();

    return () => {
      subscription.unsubscribe();
    };
  }, [isBackendConnected, refreshTemplates]);

  // When session changes, fetch user data
  useEffect(() => {
    if (session) {
      fetchUserProfile();
      fetchUserPhotos();
      fetchJobs();
      fetchTransactions();
    }
  }, [session, fetchUserProfile, fetchUserPhotos, fetchJobs, fetchTransactions]);

  // When user role is admin, load admin data
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser?.role, fetchAdminData]);

  // REAL SUPABASE AUTH METHODS
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isBackendConnected) {
      return {
        success: false,
        error: 'Supabase is not configured. Configurează VITE_SUPABASE_URL și VITE_SUPABASE_PUBLISHABLE_KEY.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setSession(data.session);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Eroare la autentificare.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    country: 'Moldova' | 'Romania'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isBackendConnected) {
      return {
        success: false,
        error: 'Supabase is not configured. Configurează VITE_SUPABASE_URL și VITE_SUPABASE_PUBLISHABLE_KEY.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            country,
            preferred_language: language,
            preferred_currency: country === 'Romania' ? 'RON' : 'MDL'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Eroare la crearea contului.' };
    }
  };

  const signOut = async () => {
    if (isBackendConnected) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setCurrentUser(null);
    setUserPhotos([]);
    setJobs([]);
    setCreditTransactions([]);
    setCurrentView('explore');
  };

  // Upload user photo to real Supabase Storage via backend
  const uploadPhoto = async (dataUrl: string, filename = 'My_Photo.jpg'): Promise<UserPhoto> => {
    if (!session) {
      setIsAuthModalOpen(true);
      throw new Error('Autentificare necesară.');
    }

    const res = await authFetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Eroare la încărcarea fotografiei.');
    }

    const newPhoto = await res.json();
    setUserPhotos((prev) => [newPhoto, ...prev]);
    return newPhoto;
  };

  // Delete user photo
  const deletePhoto = async (id: string) => {
    if (!session) return;
    try {
      const res = await authFetch(`/api/photos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUserPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete photo error:', err);
    }
  };

  // Quick select template
  const quickSelectTemplate = (template: PhotoTemplate) => {
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
  };

  // REAL ASYNCHRONOUS GENERATION PIPELINE
  const createGenerationJob = async (
    templateId: string,
    userPhotoUrl: string,
    userPhotoId: string
  ): Promise<GenerationJob> => {
    if (!session || !currentUser) {
      setIsAuthModalOpen(true);
      throw new Error('Te rugăm să te autentifici pentru a genera fotografii.');
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Șablonul nu a fost găsit.');

    if (currentUser.creditBalance < template.creditCost) {
      setIsCreditModalOpen(true);
      throw new Error(t.insufficientCredits);
    }

    // Call secure backend endpoint
    const res = await authFetch('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        userPhotoUrl,
        userPhotoId,
        aspectRatio: template.aspectRatio
      })
    });

    const data = await res.json();

    if (!res.ok) {
      // Refresh balance in case of refund
      await fetchUserProfile();
      await fetchTransactions();
      throw new Error(data.error || 'Generarea a eșuat pe server.');
    }

    // Refresh profile balance, transactions, and jobs
    await Promise.all([fetchUserProfile(), fetchJobs(), fetchTransactions()]);

    const createdJob: GenerationJob = {
      id: data.jobId,
      userId: currentUser.id,
      templateId: template.id,
      templateName: template.name[language] || template.name.ro,
      templatePreview: template.previewImage,
      userPhotoId,
      userPhotoUrl,
      status: 'completed',
      progress: 100,
      currentStepMessage: t.completed,
      resultImageUrl: data.resultImageUrl,
      providerId: 'gemini-genai',
      providerName: 'Google Gemini Image',
      creditCost: template.creditCost,
      aspectRatio: template.aspectRatio,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    setActiveJob(createdJob);
    return createdJob;
  };

  const retryJob = async (jobId: string) => {
    if (!session) return;
    await authFetch(`/api/generations/${jobId}/retry`, { method: 'POST' });
    await fetchJobs();
  };

  // Real purchase initiation (No fake payment success!)
  const purchaseCredits = async (
    packageId: string,
    _paymentMethod: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!session) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'Autentificare necesară.' };
    }

    try {
      const res = await authFetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, currency })
      });

      const data = await res.json();

      if (!res.ok || data.isConfigured === false) {
        return {
          success: false,
          message:
            data.message ||
            'Gateway-ul de plată online este în curs de configurare. Pentru creditare de test, folosește Panoul de Administrare.'
        };
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Plata nu a putut fi procesată.'
      };
    }
  };

  // Admin adjust credits
  const adjustCredits = async (userId: string, amount: number, reason: string) => {
    if (!session || currentUser?.role !== 'admin') return;

    const res = await authFetch('/api/admin/credits/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: userId, amount, reason })
    });

    if (res.ok) {
      await Promise.all([fetchUserProfile(), fetchTransactions(), fetchAdminData()]);
    }
  };

  // Admin template management
  const addTemplate = async (newTmplData: Omit<PhotoTemplate, 'id'>) => {
    if (!session || currentUser?.role !== 'admin') return;

    const res = await authFetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `tmpl_${Date.now()}`,
        category_id: newTmplData.category,
        name_ro: newTmplData.name.ro,
        name_ru: newTmplData.name.ru,
        name_en: newTmplData.name.en,
        description_ro: newTmplData.description.ro,
        description_ru: newTmplData.description.ru,
        description_en: newTmplData.description.en,
        preview_image_url: newTmplData.previewImage,
        prompt: newTmplData.prompt,
        negative_prompt: newTmplData.negativePrompt || '',
        aspect_ratio: newTmplData.aspectRatio,
        credit_cost: newTmplData.creditCost,
        required_input_type: newTmplData.requiredInputType,
        provider_hint: newTmplData.providerHint || 'gemini-genai',
        tags: newTmplData.tags || [],
        is_active: newTmplData.isActive,
        display_order: newTmplData.displayOrder
      })
    });

    if (res.ok) {
      await refreshTemplates();
    }
  };

  const updateTemplate = async (updated: PhotoTemplate) => {
    if (!session || currentUser?.role !== 'admin') return;

    const res = await authFetch(`/api/admin/templates/${updated.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: updated.category,
        name_ro: updated.name.ro,
        name_ru: updated.name.ru,
        name_en: updated.name.en,
        description_ro: updated.description.ro,
        description_ru: updated.description.ru,
        description_en: updated.description.en,
        preview_image_url: updated.previewImage,
        prompt: updated.prompt,
        negative_prompt: updated.negativePrompt || '',
        aspect_ratio: updated.aspectRatio,
        credit_cost: updated.creditCost,
        required_input_type: updated.requiredInputType,
        is_active: updated.isActive,
        display_order: updated.displayOrder
      })
    });

    if (res.ok) {
      await refreshTemplates();
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!session || currentUser?.role !== 'admin') return;
    const res = await authFetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await refreshTemplates();
    }
  };

  // Price formatting
  const formatPrice = (mdl: number, ron: number, eur: number): string => {
    if (currency === 'MDL') return `${mdl} MDL`;
    if (currency === 'RON') return `${ron} RON`;
    return `€${eur.toFixed(2)}`;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        t,
        isBackendConnected,
        session,
        authToken,
        currentView,
        setCurrentView,
        currentUser,
        allUsers,
        signIn,
        signUp,
        signOut,
        templates,
        selectedCategory,
        setSelectedCategory,
        selectedTemplate,
        setSelectedTemplate,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        refreshTemplates,
        userPhotos,
        uploadPhoto,
        deletePhoto,
        jobs,
        activeJob,
        createGenerationJob,
        retryJob,
        creditPackages,
        creditTransactions,
        purchaseCredits,
        adjustCredits,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isCreditModalOpen,
        setIsCreditModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        quickSelectTemplate,
        formatPrice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
