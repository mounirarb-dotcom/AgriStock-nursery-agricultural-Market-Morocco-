import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Package,
} from 'lucide-react';
import { SmartImage } from '../../../components/SmartImage';
import { RoleAccessRestrictedNotice } from '../../../components/RoleAccessRestrictedNotice';

export const AdminModerationPage: React.FC = () => {
  const {
    language,
    produceListings,
    nurseryLots,
    farmStandingListings,
    moderateListing,
    adminSession,
    setActiveTab,
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'all' | 'produce' | 'nursery'>('all');

  if (!adminSession || !adminSession.token) {
    return (
      <RoleAccessRestrictedNotice
        requiredRole="admin"
        title="Accès Administrateur Requis"
        description="La modération des annonces est réservée au superviseur de la plateforme."
      />
    );
  }

  const allItems = [
    ...produceListings.map((p) => ({ ...p, itemType: 'produce' as const })),
    ...nurseryLots.map((n) => ({ ...n, itemType: 'nursery_lot' as const, title: `${n.species} - ${n.variety}` })),
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('admin_dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à la supervision', 'العودة للإدارة', 'Back to Admin')}</span>
      </button>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>MODÉRATION & CONFORMITÉ DU MARCHÉ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Validation des Annonces & Lots ({allItems.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit des fiches de lots, vérification des photos conformes et approbation des offres.
          </p>
        </div>
      </div>

      {/* Grille des annonces à modérer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allItems.map((item: any) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-100 mb-3">
                <SmartImage src={item.imageUrl || ''} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-bold">
                  {item.itemType === 'nursery_lot' ? 'Pépinière' : 'Récolte'}
                </span>
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.moderationStatus === 'VALIDÉ'
                      ? 'bg-emerald-600 text-white'
                      : item.moderationStatus === 'REFUSÉ'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {item.moderationStatus || 'EN ATTENTE'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{item.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{item.locationCity || item.region}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => moderateListing(item.id, item.title, item.itemType, 'VALIDÉ')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approuver</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const reason = prompt('Motif de refus de conformité :');
                  if (reason) moderateListing(item.id, item.title, item.itemType, 'REFUSÉ', reason);
                }}
                className="py-1.5 px-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Refuser</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
