import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GenerationJob } from '../types';
import {
  Download,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Sliders,
  X,
  Coins,
  LogIn
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const {
    jobs,
    t,
    retryJob,
    quickSelectTemplate,
    templates,
    setIsCreateModalOpen,
    currentUser,
    setIsAuthModalOpen
  } = useApp();

  const [comparingJob, setComparingJob] = useState<GenerationJob | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 mx-auto">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">
          Galeria Ta Privată de Creații
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Autentifică-te pentru a vizualiza fotografiile generate salvate pe contul tău.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95"
        >
          <LogIn className="h-4 w-4" />
          <span>Autentifică-te în cont</span>
        </button>
      </div>
    );
  }

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'completed') return j.status === 'completed';
    if (filter === 'failed') return j.status === 'failed';
    return true;
  });

  const handleDownload = (imageUrl: string, templateName: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `AuraStudio_${templateName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.galleryTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {t.gallerySub}
          </p>
        </div>

        {/* Filter Controls (Segmented Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toate ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Finalizate ({jobs.filter((j) => j.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'failed'
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Eșuate ({jobs.filter((j) => j.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">
            {t.emptyGalleryTitle}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            {t.emptyGallerySub}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.createPhotoAction}</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJobs.map((job) => {
            const isCompleted = job.status === 'completed';
            const isFailed = job.status === 'failed';
            const isProcessing = job.status === 'processing' || job.status === 'queued';
            const displayImage = job.resultImageUrl || job.templatePreview;
            const template = templates.find((t) => t.id === job.templateId);

            return (
              <div
                key={job.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141c] hover:border-amber-500/30 transition-all duration-300"
              >
                {/* Visual Image Slot */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
                  <img
                    src={displayImage}
                    alt={job.templateName}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isProcessing ? 'filter blur-sm opacity-60' : ''
                    }`}
                  />

                  {/* Top Bar on Image: Status & Date */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                    <span className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      {isCompleted && (
                        <>
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                          <span>{t.completed}</span>
                        </>
                      )}
                      {isFailed && (
                        <>
                          <AlertCircle className="h-3 w-3 text-rose-400" />
                          <span>{t.failed}</span>
                        </>
                      )}
                      {isProcessing && (
                        <>
                          <RefreshCw className="h-3 w-3 text-amber-400 animate-spin" />
                          <span>{job.progress}%</span>
                        </>
                      )}
                    </span>

                    <span className="rounded-lg bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Processing Overlay if ongoing */}
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="h-10 w-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-2" />
                      <span className="text-xs font-semibold text-white">
                        {job.currentStepMessage || t.processing}
                      </span>
                    </div>
                  )}

                  {/* Hover Quick Actions */}
                  {isCompleted && job.resultImageUrl && (
                    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setComparingJob(job)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 py-2 px-3 text-xs font-semibold text-white hover:bg-black/95 active:scale-95"
                      >
                        <Sliders className="h-3.5 w-3.5 text-amber-400" />
                        <span>Compară</span>
                      </button>

                      <button
                        onClick={() => handleDownload(job.resultImageUrl!, job.templateName)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-bold hover:brightness-110 active:scale-95 shadow-md"
                        title={t.downloadPhoto}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Failed retry button */}
                  {isFailed && (
                    <div className="absolute inset-x-3 bottom-3 flex items-center">
                      <button
                        onClick={() => retryJob(job.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/30 py-2 px-3 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>{t.retryJob}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-display text-sm font-bold text-white line-clamp-1">
                      {job.templateName}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{job.aspectRatio}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-amber-400" />
                        <span>{job.creditCost} {t.credits}</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    {job.resultImageUrl ? (
                      <button
                        onClick={() => setComparingJob(job)}
                        className="text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        Vezi detalii
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">Fără rezultat</span>
                    )}

                    {template && (
                      <button
                        onClick={() => quickSelectTemplate(template)}
                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Variație</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BEFORE / AFTER COMPARISON MODAL */}
      {comparingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {comparingJob.templateName}
                </h3>
                <p className="text-xs text-slate-400">
                  {t.compareBeforeAfter}
                </p>
              </div>

              <button
                onClick={() => setComparingJob(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split Slider Preview */}
            <div className="relative mt-5 aspect-[3/4] max-h-[60vh] mx-auto rounded-2xl overflow-hidden border border-white/10 select-none bg-slate-900">
              {/* After Image (Background) */}
              <img
                src={comparingJob.resultImageUrl || comparingJob.templatePreview}
                alt="AI Result"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Before Image (Clipped Left by Slider if available) */}
              {comparingJob.userPhotoUrl ? (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={comparingJob.userPhotoUrl}
                    alt="Original"
                    className="absolute inset-0 h-full w-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              ) : null}

              {/* Slider Line Divider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold shadow-lg">
                  <Sliders className="h-4 w-4" />
                </div>
              </div>

              {/* Slider input range overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Badges */}
              <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-black/70 px-2.5 py-1 rounded-lg text-slate-300 backdrop-blur-md pointer-events-none">
                {t.showOriginal}
              </span>
              <span className="absolute bottom-3 right-3 text-[11px] font-bold bg-amber-500 px-2.5 py-1 rounded-lg text-slate-950 shadow-lg pointer-events-none">
                {t.showResult}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Trage cursorul pentru a compara transformarea
              </span>

              {comparingJob.resultImageUrl && (
                <button
                  onClick={() => handleDownload(comparingJob.resultImageUrl!, comparingJob.templateName)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>{t.downloadPhoto}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
