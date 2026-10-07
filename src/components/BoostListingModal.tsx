import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  TrendingUp,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Clock,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BOOST_PACKAGES } from '../data/monetizationData';
import { BoostPackageId } from '../types';

export const BoostListingModal: React.FC = () => {
  const { isBoostModalOpen, closeBoostModal, boostTarget, boostListing } = useApp();
  const [selectedPackage, setSelectedPackage] = useState<BoostPackageId>('flash_3d');
  const [paymentMethod, setPaymentMethod] = useState<'carte_cmi' | 'solde_compte'>('carte_cmi');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isBoostModalOpen || !boostTarget) return null;

  const currentPkg = BOOST_PACKAGES.find((p) => p.id === selectedPackage) || BOOST_PACKAGES[0];

  const handleApplyBoost = () => {
    boostListing(boostTarget.type, boostTarget.id, selectedPackage);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      closeBoostModal();
    }, 1500);
  };

  return (
    <div
      id="boost-listing-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="boost-listing-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
              <Zap className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Booster la Visibilité de l'Annonce</span>
                <span className="text-xs bg-amber-900/40 text-amber-100 px-2 py-0.5 rounded-full border border-amber-300/30">
                  En Tête des Résultats
                </span>
              </h3>
              <p className="text-xs text-amber-100/90">
                Écoulez vos stocks agricoles et lots de pépinière jusqu'à 3× plus vite
              </p>
            </div>
          </div>
          <button
            onClick={closeBoostModal}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-amber-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-stone-900">
              Annonce Propulsée en Tête !
            </h4>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Votre annonce « <strong>{boostTarget.title}</strong> » est désormais épinglée en position N°1 avec le badge prioritaire.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Target item indicator */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Annonce à mettre en avant
                </span>
                <h4 className="text-sm font-bold text-stone-900">
                  {boostTarget.title}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                Stock actif
              </span>
            </div>

            {/* Package selector cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Choisissez votre formule de boost :
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOOST_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative rounded-xl p-4 border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      {pkg.id === 'flash_3d' && (
                        <span className="absolute -top-2.5 right-3 text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                          Recommandé Déstockage
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-stone-900">
                            {pkg.name}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-2xl font-black text-stone-900">
                            {pkg.priceMAD}
                          </span>
                          <span className="text-xs font-bold text-stone-500 ml-1">
                            MAD
                          </span>
                          <span className="text-[11px] text-stone-400 block">
                            (soit ~{(pkg.priceMAD / 10).toFixed(0)} € pour {pkg.durationDays}j)
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mb-3">
                          {pkg.description}
                        </p>
                      </div>

                      <div className="border-t border-stone-200/60 pt-2.5 space-y-1 text-[11px] text-stone-600">
                        {pkg.features.slice(0, 2).map((feat, idx) => (
                          <div key={idx} className="flex items-start space-x-1.5">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live badge preview */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 block font-medium">Aperçu en direct du badge :</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${currentPkg.badgeClass} shadow-sm`}>
                  {currentPkg.badgeLabel}
                </span>
              </div>
              <div className="text-xs text-stone-300 text-right">
                Durée : <strong className="text-white">{currentPkg.durationDays} jours consécutifs</strong> en haut de liste
              </div>
            </div>

            {/* Payment simulation */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                Mode de règlement du forfait :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('carte_cmi')}
                  className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center space-x-2.5 ${
                    paymentMethod === 'carte_cmi'
                      ? 'border-amber-600 bg-amber-50/50 text-amber-950 font-bold'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Carte Bancaire CMI / Visa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('solde_compte')}
                  className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center space-x-2.5 ${
                    paymentMethod === 'solde_compte'
                      ? 'border-amber-600 bg-amber-50/50 text-amber-950 font-bold'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Déduire de mes ventes séquestres</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={closeBoostModal}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                id="confirm-boost-btn"
                onClick={handleApplyBoost}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center space-x-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Activer le Boost ({currentPkg.priceMAD} MAD)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
