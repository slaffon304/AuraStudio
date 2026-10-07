import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Camera,
  CreditCard,
  ShieldCheck,
  History,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface PhotoPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Kept export name for existing imports */
export const CreditPurchaseModal: React.FC<PhotoPurchaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    t,
    language,
    currentUser,
    photoPackages,
    photoTransactions,
    purchasePhotos,
    setIsAuthModalOpen
  } = useApp();

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    photoPackages.find((p) => p.isPopular)?.id || photoPackages[0]?.id || 'pack10'
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen) return null;

  const selectedPackage = photoPackages.find((p) => p.id === selectedPackageId) || photoPackages[0];
  const pkgName = (pkg: typeof selectedPackage) =>
    pkg?.name?.[language] || pkg?.name?.ro || pkg?.id || '';

  const handleCheckout = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setNoticeMessage(null);

    try {
      const res = await purchasePhotos(selectedPackage.id, 'card');
      if (!res.success && res.message) {
        setNoticeMessage(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                {t.creditShopTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.creditShopSub}</p>
            </div>
          </div>

          <div className="text-right mr-7 sm:mr-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              {t.currentBalance}
            </span>
            <span className="text-base font-bold text-amber-300 tabular-nums">
              {currentUser?.photoBalance || 0} {language === 'ru' ? 'фото' : language === 'en' ? 'photos' : 'foto'}
            </span>
          </div>
        </div>

        {noticeMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Notificare:</div>
              <p className="mt-0.5 text-amber-200/90">{noticeMessage}</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end">
          {currentUser && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              <History className="h-3.5 w-3.5" />
              <span>{t.transactionHistoryTitle}</span>
            </button>
          )}
        </div>

        {!showHistory ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {photoPackages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`relative cursor-pointer rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/[0.08] ring-2 ring-amber-400/20 shadow-xl'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-md">
                        {t.popularBadge}
                      </span>
                    )}
                    {pkg.isBestValue && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider bg-violet-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-md">
                        {t.bestValueBadge}
                      </span>
                    )}

                    <div className="text-center pt-2">
                      <h4 className="text-xs font-semibold text-slate-300">{pkgName(pkg)}</h4>
                      <div className="mt-2 flex items-baseline justify-center gap-1">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                          {pkg.photos}
                        </span>
                        <span className="text-xs text-amber-300 font-semibold">
                          {language === 'ru' ? 'фото' : language === 'en' ? 'photos' : 'foto'}
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 text-sm font-bold text-slate-200">
                        {pkg.priceEUR.toFixed(2)}€
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t.payWith}
              </label>
              <div className="flex items-center gap-3 rounded-xl p-3 border border-amber-400 bg-white/[0.08] text-white">
                <CreditCard className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-white">Card (Visa / Mastercard)</div>
                  <div className="text-[11px] text-slate-400">EUR · 3D Secure</div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Tranzacție securizată AuraStudio.</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || !selectedPackage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isProcessing
                    ? 'Procesare...'
                    : `${t.instantCheckout} (${selectedPackage?.priceEUR.toFixed(2)}€)`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {photoTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">{t.noTransactionsYet}</p>
              ) : (
                photoTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {tx.balanceAfter}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PhotoPurchaseModal = CreditPurchaseModal;
