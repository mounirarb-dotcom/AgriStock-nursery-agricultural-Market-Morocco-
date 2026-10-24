import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  Settings,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { RoleAccessRestrictedNotice } from '../../../components/RoleAccessRestrictedNotice';

export const AdminSettingsPage: React.FC = () => {
  const {
    language,
    platformSettings,
    updatePlatformSettings,
    adminSession,
    setActiveTab,
  } = useApp();

  const [sellerRate, setSellerRate] = useState((platformSettings.defaultSellerCommissionRate * 100).toString());
  const [transportRate, setTransportRate] = useState(((platformSettings.defaultTransportCommissionRate ?? 0.08) * 100).toFixed(1));
  const [escrowFeeMAD, setEscrowFeeMAD] = useState(platformSettings.minEscrowFeeMAD.toString());
  const [maintenance, setMaintenance] = useState(platformSettings.maintenanceMode || false);
  const [isSaved, setIsSaved] = useState(false);

  if (!adminSession || !adminSession.token) {
    return (
      <RoleAccessRestrictedNotice
        requiredRole="admin"
        title="Accès Administrateur Requis"
        description="La configuration globale de la plateforme est réservée à l'administrateur principal."
      />
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      defaultSellerCommissionRate: parseFloat(sellerRate) / 100 || 0.05,
      defaultTransportCommissionRate: parseFloat(transportRate) / 100 || 0.08,
      minEscrowFeeMAD: parseFloat(escrowFeeMAD) || 50,
      maintenanceMode: maintenance,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('admin_dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à la supervision', 'العودة للإدارة', 'Back to Admin')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 mb-2">
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span>PARAMÈTRES SYSTÈME & COMMISSIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            Configuration Globale de la Plateforme
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Ajustez les taux de commission, les barèmes séquestre et le mode maintenance.
          </p>
        </div>

        {isSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Paramètres enregistrés avec succès.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Taux de commission standard vendeur (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={sellerRate}
                onChange={(e) => setSellerRate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold focus:border-purple-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Taux de commission transport & fret (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={transportRate}
                onChange={(e) => setTransportRate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-hidden text-cyan-800"
                required
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Prélèvement plateforme sur les réservations de transport frigorifique
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Frais minimum de séquestre bancaire (MAD)
              </label>
              <input
                type="number"
                min="0"
                value={escrowFeeMAD}
                onChange={(e) => setEscrowFeeMAD(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold focus:border-purple-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">Mode Maintenance de la Plateforme</span>
              <span className="text-stone-500 text-[11px]">
                Suspend temporairement les nouvelles transactions publiques
              </span>
            </div>
            <input
              type="checkbox"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
