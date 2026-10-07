import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  X,
  CreditCard,
  Building2,
  Percent,
  Layers,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProCertificationModal: React.FC = () => {
  const { isProModalOpen, setIsProModalOpen, userProfile, upgradeToPro } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'monthly_pro' | 'annual_pro'>('monthly_pro');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isProModalOpen) return null;

  const handleSubscribe = () => {
    upgradeToPro(selectedPlan);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsProModalOpen(false);
    }, 1500);
  };

  return (
    <div
      id="pro-certification-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="pro-certification-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Abonnement Vendeur Pro & Certifié
                </h3>
                <span className="text-xs bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full">
                  PRO VIP
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Obtenez le badge officiel « Producteur Certifié », catalogue illimité et commission réduite
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-bounce">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-stone-900">
              Félicitations ! Vous êtes désormais Producteur Certifié Pro !
            </h4>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Votre badge doré « <strong>Producteur Certifié PRO</strong> » est actif sur l'ensemble de vos lots. Votre commission de vente est réduite à <strong>3.5%</strong>.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status notice */}
            {userProfile.isProCertified ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Votre compte est déjà certifié PRO
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Abonnement actif jusqu'au {userProfile.proExpiresAt || '2027-01-01'}. Commission réduite à 3.5%.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  Actif
                </span>
              </div>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Multipliez par 4 la confiance des acheteurs</strong> : Les grossistes et exploitants privilégient systématiquement les vendeurs certifiés pour leurs achats en gros et paiements séquestres.
                </p>
              </div>
            )}

            {/* Plan selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedPlan('monthly_pro')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'monthly_pro'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-900">Formule Mensuelle</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded">
                    Sans engagement
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-black text-stone-900">190</span>
                  <span className="text-xs font-bold text-stone-500 ml-1">MAD / mois</span>
                  <span className="text-[11px] text-stone-400 block">(~19 € / mois)</span>
                </div>
                <p className="text-xs text-stone-600">
                  Idéal pour tester la visibilité pro durant la haute saison de récolte.
                </p>
              </div>

              <div
                onClick={() => setSelectedPlan('annual_pro')}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'annual_pro'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <span className="absolute -top-2.5 right-3 text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  2 mois offerts (-18%)
                </span>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-900">Formule Annuelle</span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-black text-stone-900">1 800</span>
                  <span className="text-xs font-bold text-stone-500 ml-1">MAD / an</span>
                  <span className="text-[11px] text-emerald-800 block font-semibold">
                    (soit 150 MAD/mois seulement)
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Recommandé pour pépinières permanentes et coopératives de primeurs.
                </p>
              </div>
            </div>

            {/* Included PRO benefits */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Avantages exclusifs inclus avec le compte PRO :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                <div className="flex items-start space-x-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Badge « Producteur Certifié »</strong> doré affiché sur toutes vos annonces</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Percent className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Commission réduite à 3.5%</strong> (au lieu de 5.0% standard) sur le séquestre</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Catalogue illimité</strong> sans aucune restriction de volume</span>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Statistiques de ventes</strong> et historique des acheteurs qualifiés</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsProModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
              >
                Fermer
              </button>
              <button
                id="activate-pro-btn"
                onClick={handleSubscribe}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center space-x-2 transition-all"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>
                  {userProfile.isProCertified
                    ? 'Prolonger mon Abonnement PRO'
                    : `Souscrire à la formule (${selectedPlan === 'monthly_pro' ? '190 MAD' : '1 800 MAD'})`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
