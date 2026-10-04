import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Coins,
  CheckCircle,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  History,
  Sparkles
} from 'lucide-react';
import { Currency } from '../types';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    t,
    currency,
    setCurrency,
    currentUser,
    creditPackages,
    creditTransactions,
    purchaseCredits,
    formatPrice
  } = useApp();

  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    creditPackages.find((p) => p.isPopular)?.id || creditPackages[0].id
  );

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_md' | 'bank_ro' | 'apple_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen) return null;

  const selectedPackage = creditPackages.find((p) => p.id === selectedPackageId) || creditPackages[0];

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const methodName =
        paymentMethod === 'card'
          ? 'Card Bancar Visa/Mastercard'
          : paymentMethod === 'bank_md'
          ? 'MAIB / VictoriaBank (Moldova)'
          : paymentMethod === 'bank_ro'
          ? 'Banca Transilvania / BCR / Revolut'
          : 'Apple Pay';

      await new Promise((r) => setTimeout(r, 800));
      await purchaseCredits(selectedPackage.id, methodName);
      setSuccessMessage(t.purchaseSuccessTitle);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto overflow-hidden rounded-3xl border border-white/10 bg-[#12141c] p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                {t.creditShopTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.creditShopSub}
              </p>
            </div>
          </div>

          {/* Current Balance Note */}
          <div className="text-right mr-7 sm:mr-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              {t.currentBalance}
            </span>
            <span className="text-base font-bold text-amber-300 tabular-nums">
              {currentUser.creditBalance} {t.credits}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Toggle between Package Shop & Transaction History */}
        <div className="mt-5 flex items-center justify-between">
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
            {(['MDL', 'RON', 'EUR'] as Currency[]).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  currency === curr
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Transaction History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>{t.transactionHistoryTitle}</span>
          </button>
        </div>

        {/* VIEW A: PACKAGES AND CHECKOUT */}
        {!showHistory ? (
          <div className="mt-6 space-y-6">
            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {creditPackages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const totalCredits = pkg.credits + pkg.bonusCredits;
                const price = formatPrice(pkg.priceMDL, pkg.priceRON, pkg.priceEUR);

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
                    {/* Badge if Popular or Value */}
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
                      <h4 className="text-xs font-semibold text-slate-300">
                        {pkg.name.ro}
                      </h4>

                      <div className="mt-2 flex items-baseline justify-center gap-1">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
                          {totalCredits}
                        </span>
                        <span className="text-xs text-amber-300 font-semibold">{t.credits}</span>
                      </div>

                      {pkg.bonusCredits > 0 && (
                        <span className="mt-1 inline-block text-[10px] text-emerald-400 font-medium">
                          +{pkg.bonusCredits} {t.bonusText}
                        </span>
                      )}

                      <div className="mt-4 pt-3 border-t border-white/5 text-sm font-bold text-slate-200">
                        {price}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t.payWith}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left border transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-400 bg-white/[0.08] text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-amber-400 shrink-0" />
                  <div className="overflow-hidden text-xs">
                    <div className="font-semibold text-white">Card Bancar (Visa / MC)</div>
                    <div className="text-[11px] text-slate-400">MDL, RON, EUR · Securizat 3D</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank_md')}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left border transition-all ${
                    paymentMethod === 'bank_md'
                      ? 'border-amber-400 bg-white/[0.08] text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <div className="overflow-hidden text-xs">
                    <div className="font-semibold text-white">Moldova Banking</div>
                    <div className="text-[11px] text-slate-400">MAIB, VictoriaBank, RunPay</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank_ro')}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left border transition-all ${
                    paymentMethod === 'bank_ro'
                      ? 'border-amber-400 bg-white/[0.08] text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <div className="overflow-hidden text-xs">
                    <div className="font-semibold text-white">România Banking</div>
                    <div className="text-[11px] text-slate-400">BT, BCR, Revolut Pay</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left border transition-all ${
                    paymentMethod === 'apple_pay'
                      ? 'border-amber-400 bg-white/[0.08] text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-amber-400 shrink-0" />
                  <div className="overflow-hidden text-xs">
                    <div className="font-semibold text-white">Apple Pay / Google Pay</div>
                    <div className="text-[11px] text-slate-400">Plată rapidă cu un click</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Checkout CTA */}
            <div className="border-t border-white/[0.08] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Creditele sunt adăugate instant pe cont.</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isProcessing
                    ? 'Procesare plată...'
                    : `${t.instantCheckout} (${formatPrice(
                        selectedPackage.priceMDL,
                        selectedPackage.priceRON,
                        selectedPackage.priceEUR
                      )})`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW B: TRANSACTION HISTORY */
          <div className="mt-6 space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {creditTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">{t.noTransactionsYet}</p>
              ) : (
                creditTransactions.map((tx) => (
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
                        Sold: {tx.balanceAfter}
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
              Înapoi la Pachete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
