import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { SAMPLE_USER_PORTRAITS } from '../data/samplePhotos';
import { providerRegistry } from '../services/providers';
import { TRANSLATIONS, TranslationSchema } from '../i18n/translations';

interface AppContextType {
  // Localization & Currency
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: TranslationSchema;

  // Current view & navigation
  currentView: 'explore' | 'create' | 'gallery' | 'library' | 'admin';
  setCurrentView: (view: 'explore' | 'create' | 'gallery' | 'library' | 'admin') => void;

  // User & Auth
  currentUser: UserAccount;
  allUsers: UserAccount[];
  switchUser: (role: 'user' | 'admin') => void;
  loginUser: (email: string, name: string, country: 'Moldova' | 'Romania') => void;

  // Templates
  templates: PhotoTemplate[];
  selectedCategory: TemplateCategory | 'All';
  setSelectedCategory: (cat: TemplateCategory | 'All') => void;
  selectedTemplate: PhotoTemplate | null;
  setSelectedTemplate: (tmpl: PhotoTemplate | null) => void;
  addTemplate: (template: Omit<PhotoTemplate, 'id'>) => void;
  updateTemplate: (template: PhotoTemplate) => void;
  deleteTemplate: (id: string) => void;

  // User Photos
  userPhotos: UserPhoto[];
  uploadPhoto: (dataUrl: string, filename?: string) => Promise<UserPhoto>;
  deletePhoto: (id: string) => void;

  // Generation Jobs
  jobs: GenerationJob[];
  activeJob: GenerationJob | null;
  createGenerationJob: (templateId: string, userPhotoUrl: string, userPhotoId: string) => Promise<GenerationJob>;
  retryJob: (jobId: string) => Promise<void>;

  // Credits & Purchases
  creditPackages: CreditPackage[];
  creditTransactions: CreditTransaction[];
  purchaseCredits: (packageId: string, paymentMethod: string) => Promise<boolean>;
  adjustCredits: (userId: string, amount: number, reason: string) => void;

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

const DEFAULT_USER: UserAccount = {
  id: 'usr_moldova_01',
  name: 'Alexandru Popescu',
  email: 'alex.popescu@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'user',
  creditBalance: 12,
  preferredLanguage: 'ro',
  preferredCurrency: 'MDL',
  country: 'Moldova',
  createdAt: '2026-03-15T10:00:00.000Z'
};

const DEFAULT_ADMIN: UserAccount = {
  id: 'usr_admin_01',
  name: 'Elena Rădulescu (Admin)',
  email: 'admin@aurastudio.ai',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  creditBalance: 500,
  preferredLanguage: 'ro',
  preferredCurrency: 'RON',
  country: 'Romania',
  createdAt: '2026-01-01T08:00:00.000Z'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language & Currency
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

  // Users
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('aurastudio_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [allUsers, setAllUsers] = useState<UserAccount[]>([
    DEFAULT_USER,
    DEFAULT_ADMIN,
    {
      id: 'usr_bucharest_02',
      name: 'Ion Munteanu',
      email: 'ion.munteanu@yahoo.ro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      creditBalance: 5,
      preferredLanguage: 'ro',
      preferredCurrency: 'RON',
      country: 'Romania',
      createdAt: '2026-03-20T14:30:00.000Z'
    }
  ]);

  // Templates
  const [templates, setTemplates] = useState<PhotoTemplate[]>(() => {
    const saved = localStorage.getItem('aurastudio_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(null);

  // User Photos
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>(() => {
    const saved = localStorage.getItem(`aurastudio_photos_${currentUser.id}`);
    if (saved) return JSON.parse(saved);
    // Seed with two demo photos for immediate seamless experience
    return [
      {
        id: 'photo_demo_1',
        userId: currentUser.id,
        url: SAMPLE_USER_PORTRAITS[0].url,
        filename: 'Alexandra_Selfie_Studio.jpg',
        uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'photo_demo_2',
        userId: currentUser.id,
        url: SAMPLE_USER_PORTRAITS[1].url,
        filename: 'Mihai_Portrait_Clean.jpg',
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
  });

  // Generation Jobs
  const [jobs, setJobs] = useState<GenerationJob[]>(() => {
    const saved = localStorage.getItem(`aurastudio_jobs_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);

  // Transactions
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem(`aurastudio_tx_${currentUser.id}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'tx_init_bonus',
        userId: currentUser.id,
        type: 'welcome_bonus',
        amount: 12,
        balanceAfter: 12,
        description: 'Cadou de bun venit AuraStudio (12 credite)',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('aurastudio_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aurastudio_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(`aurastudio_photos_${currentUser.id}`, JSON.stringify(userPhotos));
  }, [userPhotos, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`aurastudio_jobs_${currentUser.id}`, JSON.stringify(jobs));
  }, [jobs, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`aurastudio_tx_${currentUser.id}`, JSON.stringify(creditTransactions));
  }, [creditTransactions, currentUser.id]);

  // Quick switch role
  const switchUser = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setCurrentUser(DEFAULT_ADMIN);
      setCurrentView('admin');
    } else {
      setCurrentUser(DEFAULT_USER);
      setCurrentView('explore');
    }
  };

  const loginUser = (email: string, name: string, country: 'Moldova' | 'Romania') => {
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      creditBalance: 15,
      preferredLanguage: language,
      preferredCurrency: country === 'Moldova' ? 'MDL' : 'RON',
      country,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    setAllUsers(prev => [newUser, ...prev]);

    // Initial transaction
    const bonusTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      userId: newUser.id,
      type: 'welcome_bonus',
      amount: 15,
      balanceAfter: 15,
      description: 'Cadou de bun venit (15 credite)',
      createdAt: new Date().toISOString()
    };
    setCreditTransactions([bonusTx]);
    setIsAuthModalOpen(false);
  };

  // Upload user photo
  const uploadPhoto = async (dataUrl: string, filename = 'My_Photo.jpg'): Promise<UserPhoto> => {
    const newPhoto: UserPhoto = {
      id: `photo_${Date.now()}`,
      userId: currentUser.id,
      url: dataUrl,
      filename,
      uploadedAt: new Date().toISOString()
    };
    setUserPhotos(prev => [newPhoto, ...prev]);
    return newPhoto;
  };

  // Delete user photo
  const deletePhoto = (id: string) => {
    setUserPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Quick select template helper
  const quickSelectTemplate = (template: PhotoTemplate) => {
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
  };

  // Asynchronous generation job runner
  const createGenerationJob = async (
    templateId: string,
    userPhotoUrl: string,
    userPhotoId: string
  ): Promise<GenerationJob> => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    if (currentUser.creditBalance < template.creditCost) {
      setIsCreditModalOpen(true);
      throw new Error(t.insufficientCredits);
    }

    // Deduct credits & record transaction
    const newBalance = currentUser.creditBalance - template.creditCost;
    setCurrentUser(prev => ({ ...prev, creditBalance: newBalance }));

    const spendTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'generation_spend',
      amount: -template.creditCost,
      balanceAfter: newBalance,
      description: `Generare foto: ${template.name[language] || template.name.ro}`,
      createdAt: new Date().toISOString()
    };
    setCreditTransactions(prev => [spendTx, ...prev]);

    const activeProvider = providerRegistry.getActiveProvider();

    // Create queued job
    const newJob: GenerationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      templateId: template.id,
      templateName: template.name[language] || template.name.ro,
      templatePreview: template.previewImage,
      userPhotoId,
      userPhotoUrl,
      status: 'queued',
      progress: 5,
      currentStepMessage: t.queued,
      providerId: activeProvider.meta.id,
      providerName: activeProvider.meta.name,
      creditCost: template.creditCost,
      aspectRatio: template.aspectRatio,
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);
    setActiveJob(newJob);

    // Asynchronous Execution via Provider Abstraction Layer
    (async () => {
      try {
        // Transition to processing
        setJobs(prev =>
          prev.map(j => (j.id === newJob.id ? { ...j, status: 'processing', progress: 15, currentStepMessage: t.processing } : j))
        );
        setActiveJob(prev => (prev?.id === newJob.id ? { ...prev, status: 'processing', progress: 15 } : prev));

        const result = await activeProvider.generate({
          jobId: newJob.id,
          template,
          userPhotoUrl,
          aspectRatio: template.aspectRatio,
          onProgress: (progress, message) => {
            setJobs(prev =>
              prev.map(j => (j.id === newJob.id ? { ...j, progress, currentStepMessage: message } : j))
            );
            setActiveJob(prev => (prev?.id === newJob.id ? { ...prev, progress, currentStepMessage: message } : prev));
          }
        });

        // Completed
        const completedAt = new Date().toISOString();
        setJobs(prev =>
          prev.map(j =>
            j.id === newJob.id
              ? {
                  ...j,
                  status: 'completed',
                  progress: 100,
                  currentStepMessage: t.completed,
                  resultImageUrl: result.resultImageUrl,
                  completedAt
                }
              : j
          )
        );
        setActiveJob(prev =>
          prev?.id === newJob.id
            ? { ...prev, status: 'completed', progress: 100, resultImageUrl: result.resultImageUrl, completedAt }
            : prev
        );
      } catch (err: any) {
        // Failed -> Refund credits
        const refundedBalance = currentUser.creditBalance; // already deducted, now refund
        setCurrentUser(prev => ({ ...prev, creditBalance: prev.creditBalance + template.creditCost }));

        const refundTx: CreditTransaction = {
          id: `tx_refund_${Date.now()}`,
          userId: currentUser.id,
          type: 'generation_refund',
          amount: template.creditCost,
          balanceAfter: refundedBalance + template.creditCost,
          description: `Restituire credite (eroare generare): ${template.name[language] || template.name.ro}`,
          referenceId: newJob.id,
          createdAt: new Date().toISOString()
        };
        setCreditTransactions(prev => [refundTx, ...prev]);

        setJobs(prev =>
          prev.map(j =>
            j.id === newJob.id
              ? {
                  ...j,
                  status: 'failed',
                  progress: 0,
                  currentStepMessage: t.failed,
                  errorMessage: err?.message || 'Eroare necunoscută la generare'
                }
              : j
          )
        );
        setActiveJob(prev =>
          prev?.id === newJob.id
            ? { ...prev, status: 'failed', errorMessage: err?.message || 'Eroare necunoscută' }
            : prev
        );
      }
    })();

    return newJob;
  };

  const retryJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    await createGenerationJob(job.templateId, job.userPhotoUrl, job.userPhotoId);
  };

  // Purchase credits
  const purchaseCredits = async (packageId: string, paymentMethod: string): Promise<boolean> => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return false;

    const totalCredits = pkg.credits + pkg.bonusCredits;
    const newBalance = currentUser.creditBalance + totalCredits;

    setCurrentUser(prev => ({ ...prev, creditBalance: newBalance }));

    const purchaseTx: CreditTransaction = {
      id: `tx_buy_${Date.now()}`,
      userId: currentUser.id,
      type: 'purchase',
      amount: totalCredits,
      balanceAfter: newBalance,
      description: `Achiziție ${pkg.name[language] || pkg.name.ro} (${paymentMethod})`,
      referenceId: pkg.id,
      createdAt: new Date().toISOString()
    };

    setCreditTransactions(prev => [purchaseTx, ...prev]);
    setIsCreditModalOpen(false);
    return true;
  };

  // Admin adjust credits
  const adjustCredits = (userId: string, amount: number, reason: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const newBal = Math.max(0, u.creditBalance + amount);
          return { ...u, creditBalance: newBal };
        }
        return u;
      })
    );

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        creditBalance: Math.max(0, prev.creditBalance + amount)
      }));
    }

    const tx: CreditTransaction = {
      id: `tx_adj_${Date.now()}`,
      userId,
      type: amount >= 0 ? 'admin_grant' : 'admin_deduct',
      amount,
      balanceAfter: Math.max(0, currentUser.creditBalance + amount),
      description: `Ajustare administrator: ${reason}`,
      createdAt: new Date().toISOString()
    };
    setCreditTransactions(prev => [tx, ...prev]);
  };

  // Admin template management
  const addTemplate = (newTmplData: Omit<PhotoTemplate, 'id'>) => {
    const newTmpl: PhotoTemplate = {
      ...newTmplData,
      id: `custom_tmpl_${Date.now()}`
    };
    setTemplates(prev => [newTmpl, ...prev]);
  };

  const updateTemplate = (updated: PhotoTemplate) => {
    setTemplates(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
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
        currentView,
        setCurrentView,
        currentUser,
        allUsers,
        switchUser,
        loginUser,
        templates,
        selectedCategory,
        setSelectedCategory,
        selectedTemplate,
        setSelectedTemplate,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        userPhotos,
        uploadPhoto,
        deletePhoto,
        jobs,
        activeJob,
        createGenerationJob,
        retryJob,
        creditPackages: CREDIT_PACKAGES,
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
