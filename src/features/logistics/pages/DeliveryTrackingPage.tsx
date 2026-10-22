import React from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  ThermometerSnowflake,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const DeliveryTrackingPage: React.FC = () => {
  const { language, setActiveTab } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('logistics')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à la logistique', 'العودة لصفحة النقل', 'Back to Logistics')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>EXPÉDITION EN COURS • SUIVI SATELLITE GPS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Trajet Agadir Hub → Casablanca Marché de Gros
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Camion Frigo Semi-remorque • Immat : <strong>54921-A-33</strong> • Chauffeur : <strong>Rachid El Amrani</strong>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Température Conforme : 4.2°C</span>
            </span>
            <span className="text-[11px] text-emerald-800 block mt-0.5">Sonde USB enregistreuse active</span>
          </div>
        </div>

        {/* Timeline des étapes */}
        <div className="space-y-4 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-stone-400">Chronologie de l’acheminement</h3>

          <div className="relative pl-6 border-l-2 border-emerald-600 space-y-6">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-600 absolute -left-[31px] top-0.5 ring-4 ring-emerald-100" />
              <div className="font-bold text-stone-900">Chargement & Contrôle Qualité Récolte</div>
              <p className="text-stone-500 text-[11px]">Station de conditionnement Chtouka • 06:30</p>
            </div>

            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-600 absolute -left-[31px] top-0.5 ring-4 ring-emerald-100" />
              <div className="font-bold text-stone-900">Départ Convoi & Plombage BADR</div>
              <p className="text-stone-500 text-[11px]">Scellé N° PL-849201 apposé • 08:15</p>
            </div>

            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse absolute -left-[31px] top-0.5 ring-4 ring-blue-100" />
              <div className="font-bold text-blue-900">En transit autoroute A3 (Zone Chichaoua / Marrakech)</div>
              <p className="text-stone-500 text-[11px]">Vitesse 82 km/h • Température consigne stabilisée • En cours</p>
            </div>

            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-stone-300 absolute -left-[31px] top-0.5" />
              <div className="font-bold text-stone-400">Arrivée estimée & Déchargement Casablanca</div>
              <p className="text-stone-400 text-[11px]">Aujourd’hui vers 16:30</p>
            </div>
          </div>
        </div>

        {/* Contact rapide chauffeur */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-700">
              R
            </div>
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">Rachid El Amrani (Chauffeur Fret Frigo)</span>
              <span className="text-stone-500">+212 661 84 92 01</span>
            </div>
          </div>

          <a
            href="tel:+212661849201"
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5 transition hover:bg-stone-800"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Appeler</span>
          </a>
        </div>
      </div>
    </div>
  );
};
