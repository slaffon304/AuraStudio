import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { providerRegistry } from '../services/providers';
import { PhotoTemplate, TemplateCategory, AspectRatio, RequiredInputType } from '../types';
import { CATEGORIES_LIST } from '../data/initialTemplates';
import {
  Users,
  Layers,
  Sparkles,
  Cpu,
  TrendingUp,
  Coins,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Shield,
  CreditCard
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    t,
    language,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    jobs,
    retryJob,
    allUsers,
    adjustPhotos,
    formatPrice,
    currentUser,
    authToken
  } = useApp();

  const L = (ro: string, ru: string, en: string) =>
    language === 'ru' ? ru : language === 'en' ? en : ro;


  const [activeTab, setActiveTab] = useState<'stats' | 'templates' | 'jobs' | 'users' | 'providers'>('stats');

  // Provider switcher state
  const [providers, setProviders] = useState(() => providerRegistry.getAllProviders());
  const [activeProviderId, setActiveProviderId] = useState(() => providerRegistry.getActiveProviderId());

  // Real payment transactions from server
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);

  // User credit adjust modal
  const [selectedUserForPhotos, setSelectedUserForCredit] = useState<string | null>(null);
  const [photoAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(10);
  const [photoAdjustmentReason, setCreditAdjustmentReason] = useState<string>('Bonus acordat de administrator');

  // Template edit modal
  const [editingTemplate, setEditingTemplate] = useState<PhotoTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({
    nameRo: '',
    nameRu: '',
    nameEn: '',
    descRo: '',
    category: 'Trending' as TemplateCategory,
    previewImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    prompt: '',
    negativePrompt: '',
    aspectRatio: '3:4' as AspectRatio,
    photoCost: 2,
    requiredInputType: 'single_portrait' as RequiredInputType,
    isActive: true,
    displayOrder: 1
  });

  // Load real transactions for admin stats
  useEffect(() => {
    if (authToken && currentUser?.role === 'admin') {
      fetch('/api/admin/transactions', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setPaymentTransactions(data);
          }
        })
        .catch(() => {});
    }
  }, [authToken, currentUser?.role]);

  // Real statistics based strictly on verified database records (NO invented numbers)
  const totalGenerations = jobs.length;
  const completedGenerations = jobs.filter((j) => j.status === 'completed').length;
  const failedGenerations = jobs.filter((j) => j.status === 'failed').length;
  const totalPhotosSpent = jobs.reduce((acc, j) => acc + (j.status === 'completed' ? j.photoCost : 0), 0);
  
  // Real verified revenue strictly from completed payment transactions
  const verifiedRevenueMDL = paymentTransactions
    .filter((tx) => tx.status === 'paid' && tx.currency === 'MDL')
    .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
  const verifiedRevenueRON = paymentTransactions
    .filter((tx) => tx.status === 'paid' && tx.currency === 'RON')
    .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
  const verifiedRevenueEUR = paymentTransactions
    .filter((tx) => tx.status === 'paid' && tx.currency === 'EUR')
    .reduce((acc, tx) => acc + Number(tx.amount || 0), 0);

  const handleSetProvider = (providerId: string) => {
    providerRegistry.setDefaultProvider(providerId);
    setActiveProviderId(providerId);
    setProviders(providerRegistry.getAllProviders());
  };

  const handleSaveNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTemplate({
      name: {
        ro: newTemplateForm.nameRo,
        ru: newTemplateForm.nameRu || newTemplateForm.nameRo,
        en: newTemplateForm.nameEn || newTemplateForm.nameRo
      },
      description: {
        ro: newTemplateForm.descRo,
        ru: newTemplateForm.descRo,
        en: newTemplateForm.descRo
      },
      category: newTemplateForm.category,
      previewImage: newTemplateForm.previewImage,
      prompt: newTemplateForm.prompt,
      negativePrompt: newTemplateForm.negativePrompt,
      aspectRatio: newTemplateForm.aspectRatio,
      photoCost: Number(newTemplateForm.photoCost),
      requiredInputType: newTemplateForm.requiredInputType,
      isActive: newTemplateForm.isActive,
      displayOrder: Number(newTemplateForm.displayOrder)
    });
    setIsCreatingTemplate(false);
  };

  const handleUpdateTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    await updateTemplate(editingTemplate);
    setEditingTemplate(null);
  };

  const handleAdjustPhotosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPhotos) return;
    await adjustPhotos(selectedUserForPhotos, photoAdjustmentAmount, photoAdjustmentReason);
    setSelectedUserForCredit(null);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="relative z-10 w-full min-h-[50vh] bg-[#0c0e14] max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 mx-auto mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">{L('Acces restricționat', 'Доступ ограничен', 'Access restricted')}</h2>
        <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto">
          {L(
            'Această zonă este rezervată administratorilor AuraStudio. Rolul se configurează în tabela profiles din PostgreSQL.',
            'Этот раздел только для администраторов AuraStudio. Роль задаётся в таблице profiles в PostgreSQL.',
            'This area is for AuraStudio admins only. The admin role is set in the profiles table in PostgreSQL.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full min-h-[70vh] bg-[#0c0e14] text-slate-100">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Admin Console · Supabase Connected
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Studio Operations Hub</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.adminTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {t.adminSub}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-white/[0.04] p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'stats' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{L('Statistici', 'Статистика', 'Stats')}</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'templates' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t.tabTemplates} ({templates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'jobs' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.tabJobs} ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'users' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{t.tabUsers} ({allUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'providers' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>{t.tabProviders}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USAGE AND REVENUE STATISTICS (Strictly Real Data) */}
      {activeTab === 'stats' && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#12141c] p-5">
              <span className="text-xs font-medium text-slate-400">{t.totalGenerations}</span>
              <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                {totalGenerations}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-emerald-400 font-semibold">{completedGenerations} {L('finalizate', 'успешно', 'done')}</span>
                <span>·</span>
                <span className="text-rose-400">{failedGenerations} {L('eșuate', 'ошибки', 'failed')}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#12141c] p-5">
              <span className="text-xs font-medium text-slate-400">{t.activeUsers}</span>
              <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                {allUsers.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {L('Înregistrați în baza Supabase', 'В базе Supabase', 'Registered in Supabase')}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#12141c] p-5">
              <span className="text-xs font-medium text-slate-400">{L('Foto consumate', 'Фото списано', 'Photos used')}</span>
              <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-amber-400 tabular-nums">
                {totalPhotosSpent}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {L('Generări finalizate cu succes', 'Успешные генерации', 'Successful generations')}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#12141c] p-5">
              <span className="text-xs font-medium text-slate-400">{t.totalRevenue} ({L('Încasări reale', 'Реальные поступления', 'Verified revenue')})</span>
              <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-emerald-400 tabular-nums">
                {formatPrice(verifiedRevenueMDL, verifiedRevenueRON, verifiedRevenueEUR)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {L('Tranzacții plătite verificate', 'Проверенные оплаты', 'Verified paid transactions')}
              </div>
            </div>
          </div>

          {/* Quick Engine Status Banner */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">{t.activeProviderLabel}</div>
                <div className="text-sm font-bold text-white">
                  {providers.find((p) => p.isDefault)?.name}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('providers')}
              className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110"
            >
              <span>{L('Gestionează Furnizori AI', 'Управление AI-провайдерами', 'Manage AI providers')}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES MANAGEMENT (PostgreSQL Source of Truth) */}
      {activeTab === 'templates' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">
              {L('Șabloane din baza de date', 'Шаблоны из базы', 'Templates in database')} ({templates.length})
            </h2>

            <button
              onClick={() => setIsCreatingTemplate(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addNewTemplate}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#12141c]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">{L('Previzualizare', 'Превью', 'Preview')}</th>
                  <th className="py-3 px-4">{L('Nume', 'Название', 'Name')}</th>
                  <th className="py-3 px-4">{L('Categorie', 'Категория', 'Category')}</th>
                  <th className="py-3 px-4">{L('Aspect', 'Формат', 'Aspect')}</th>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">{L('Status', 'Статус', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{L('Acțiuni', 'Действия', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-slate-300">
                {templates.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-4">
                      <img
                        src={tmpl.previewImage}
                        alt="Preview"
                        className="h-10 w-8 rounded-lg object-cover border border-white/10"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-white">
                      {tmpl.name.ro}
                    </td>
                    <td className="py-2.5 px-4 text-amber-400 font-medium">
                      {tmpl.category}
                    </td>
                    <td className="py-2.5 px-4">{tmpl.aspectRatio}</td>
                    <td className="py-2.5 px-4 font-semibold text-white">
                      {tmpl.photoCost} {'foto'}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() =>
                          updateTemplate({ ...tmpl, isActive: !tmpl.isActive })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tmpl.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {tmpl.isActive ? t.templateActive : t.templateInactive}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingTemplate(tmpl)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/15"
                          title={t.editTemplate}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(tmpl.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          title={t.deleteTemplate}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REAL JOBS MONITOR */}
      {activeTab === 'jobs' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">
              {L('Joburi de generare din PostgreSQL', 'Задачи генерации (PostgreSQL)', 'Generation jobs (PostgreSQL)')} ({jobs.length})
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#12141c]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">{L('Șablon', 'Шаблон', 'Template')}</th>
                  <th className="py-3 px-4">{L('Status', 'Статус', 'Status')}</th>
                  <th className="py-3 px-4">Engine AI</th>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">{L('Data', 'Дата', 'Date')}</th>
                  <th className="py-3 px-4 text-right">{L('Acțiuni', 'Действия', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-slate-300">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nicio generare înregistrată în baza de date.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                        {job.id.substring(0, 8)}...
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {job.templateName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            job.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : job.status === 'failed'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {job.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {job.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                          <span>{job.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-400">
                        {job.providerId}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-amber-400 font-semibold">
                        {job.photoCost}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-400">
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {job.status === 'failed' && (
                          <button
                            onClick={() => retryJob(job.id)}
                            className="text-[11px] text-amber-400 hover:underline font-semibold"
                          >
                            Reîncearcă
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ATOMIC CREDITS ADJUSTMENT */}
      {activeTab === 'users' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">
              Utilizatori Înregistrați & Balanță Credite ({allUsers.length})
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#12141c]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Utilizator</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Țară</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Sold Credite</th>
                  <th className="py-3 px-4 text-right">Ajustare Credite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-slate-300">
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Niciun utilizator găsit. Înregistrează un cont nou pentru a testa.
                    </td>
                  </tr>
                ) : (
                  allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {u.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">{u.email}</td>
                      <td className="py-2.5 px-4">{u.country}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-amber-300 text-sm tabular-nums">
                        {u.creditBalance}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedUserForCredit(u.id)}
                          className="rounded-lg bg-amber-400/10 border border-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-400/20"
                        >
                          {t.adjustPhotos}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI PROVIDERS ABSTRACTION LAYER */}
      {activeTab === 'providers' && (
        <div className="mt-8 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-base font-bold text-white font-display">
              Arhitectura Stratului de Abstracție AI (Image & Video Providers)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              AuraStudio folosește un strat decuplat de generare AI care permite comutarea instantanee între furnizori fără rescrierea aplicației.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => {
              const isActive = p.id === activeProviderId;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isActive
                      ? 'border-amber-400 bg-amber-400/[0.06] shadow-xl'
                      : 'border-white/10 bg-[#12141c]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{p.name}</h3>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                          {p.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3" />
                        <span>Activ</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Latență medie: <strong className="text-white">{p.averageLatencySeconds}s</strong>
                    </span>

                    {!isActive && (
                      <button
                        onClick={() => handleSetProvider(p.id)}
                        className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 hover:text-slate-950 transition-colors"
                      >
                        {t.switchProvider}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADJUST USER CREDITS */}
      {selectedUserForPhotos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-display">
              {t.adjustPhotos}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adaugă sau scade credite în mod atomic prin funcția securizată din PostgreSQL.
            </p>

            <form onSubmit={handleAdjustPhotosSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Valoare credite (+ sau -)
                </label>
                <input
                  type="number"
                  value={photoAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {t.reasonLabel}
                </label>
                <input
                  type="text"
                  value={photoAdjustmentReason}
                  onChange={(e) => setCreditAdjustmentReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCredit(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 hover:brightness-110"
                >
                  Salvează Ajustarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW TEMPLATE */}
      {isCreatingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl my-auto rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-display">
              {t.addNewTemplate}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inserează un șablon nou în tabela PostgreSQL <code>templates</code>.
            </p>

            <form onSubmit={handleSaveNewTemplate} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nume (Română)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTemplateForm.nameRo}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, nameRo: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Categorie
                  </label>
                  <select
                    value={newTemplateForm.category}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, category: e.target.value as TemplateCategory })}
                    className="w-full rounded-xl border border-white/10 bg-[#171a25] px-3 py-2 text-xs text-white"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Descriere Scurtă
                </label>
                <textarea
                  rows={2}
                  required
                  value={newTemplateForm.descRo}
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, descRo: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {t.promptLabel} (AI Prompt)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTemplateForm.prompt}
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, prompt: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white font-mono"
                  placeholder="e.g. Cinematic editorial fashion portrait..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Raport Aspect
                  </label>
                  <select
                    value={newTemplateForm.aspectRatio}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, aspectRatio: e.target.value as AspectRatio })}
                    className="w-full rounded-xl border border-white/10 bg-[#171a25] px-3 py-2 text-xs text-white"
                  >
                    <option value="3:4">3:4 (Portret)</option>
                    <option value="1:1">1:1 (Pătrat)</option>
                    <option value="9:16">9:16 (Story)</option>
                    <option value="4:3">4:3 (Peisaj)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Cost Credite
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newTemplateForm.photoCost}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, photoCost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Ordine Afișare
                  </label>
                  <input
                    type="number"
                    value={newTemplateForm.displayOrder}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, displayOrder: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreatingTemplate(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110"
                >
                  Salvează în Baza de Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl my-auto rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-display">
              {t.editTemplate}: {editingTemplate.name.ro}
            </h3>

            <form onSubmit={handleUpdateTemplateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nume (Română)
                </label>
                <input
                  type="text"
                  required
                  value={editingTemplate.name.ro}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name: { ...editingTemplate.name, ro: e.target.value }
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {t.promptLabel}
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingTemplate.prompt}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      prompt: e.target.value
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Cost Credite
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingTemplate.photoCost}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        photoCost: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={editingTemplate.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        isActive: e.target.value === 'active'
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#171a25] px-3 py-2 text-xs text-white"
                  >
                    <option value="active">Activ</option>
                    <option value="inactive">Inactiv</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110"
                >
                  Salvează în Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
