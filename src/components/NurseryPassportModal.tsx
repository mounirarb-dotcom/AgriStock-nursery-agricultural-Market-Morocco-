import React from 'react';
import { NurseryLot } from '../types';
import { useApp } from '../context/AppContext';
import { AppLogoIcon } from './AppLogo';
import { BatchQRCodeSvg } from './BatchQRCodeSvg';
import { ShieldCheck, QrCode, Printer, X, Award, CheckCircle2, Mail } from 'lucide-react';

interface Props {
  lot: NurseryLot | null;
  onClose: () => void;
  isOpen?: boolean;
}

export const NurseryPassportModal: React.FC<Props> = ({ lot, onClose, isOpen = true }) => {
  const { setActiveTab, openComposeModal } = useApp();

  if (!isOpen || !lot) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendViaGmail = () => {
    const lotBatch = lot.batchNumber || 'N/A';
    const subject = `Passeport Phytosanitaire ONSSA — Lot ${lotBatch} (${lot.variety})`;
    const body =
      `Salam alaykoum / Bonjour,\n\n` +
      `Veuillez trouver ci-dessous les détails officiels du passeport phytosanitaire pour le lot de pépinière :\n\n` +
      `• Numéro de Lot : ${lotBatch}\n` +
      `• Numéro Passeport ONSSA : ${lot.phytosanitaryPassportNumber || 'En cours de délivrance'}\n` +
      `• Espèce & Variété : ${lot.species} — ${lot.variety}\n` +
      `• Statut Homologation ONSSA : ${lot.onssaStatus}\n` +
      `• Porte-greffe : ${lot.rootstock || 'Non spécifié'}\n` +
      `• Quantité disponible : ${lot.quantityAvailable} plants (Catégorie : ${lot.category})\n` +
      `• État sanitaire : ${lot.healthStatus}\n` +
      `• Localisation Serre : ${lot.greenhouseLocation || 'Parcelle principale'}\n\n` +
      `Certificat émis conformément aux normes sanitaires nationales de l'ONSSA (Royaume du Maroc).\n\n` +
      `Salutations respectueuses.`;

    onClose();
    setActiveTab('gmail');
    openComposeModal({
      subject,
      body,
      sourceContext: `Passeport Lot ${lotBatch}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-stone-900">
              Passeport Phytosanitaire & Étiquette ONSSA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Passport Tag */}
        <div
          id="printable-plant-passport"
          className="mt-4 p-5 rounded-xl border-2 border-dashed border-emerald-800 bg-emerald-50/40 relative overflow-hidden"
        >
          {/* Top header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <AppLogoIcon size={34} />
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block leading-tight">
                  Royaume du Maroc — ONSSA
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  Passeport Phytosanitaire / Plant Passport
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold border border-emerald-300">
                {lot.onssaStatus}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                A : Espèce Botanique
              </span>
              <p className="font-bold text-stone-900">{lot.species}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                B : N° Enregistrement / ONSSA
              </span>
              <p className="font-mono font-bold text-emerald-800">
                {lot.phytosanitaryPassportNumber || 'ONSSA-MA-2025-HOM-001'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                C : N° de Lot de Traçabilité
              </span>
              <p className="font-mono font-bold text-stone-900">{lot.batchNumber}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                D : Pays d'origine / Région
              </span>
              <p className="font-bold text-stone-900">Maroc (MA) - {lot.region.split('(')[0]}</p>
            </div>
          </div>

          {/* Plant Specification Details */}
          <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-stone-500 block">Variété / Cultivar</span>
              <span className="font-bold text-stone-800">{lot.variety}</span>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-stone-500 block">
                {lot.category.includes('Ornement') || lot.ornamentalDetails
                  ? 'Silhouette / Forme'
                  : 'Porte-greffe'}
              </span>
              <span className="font-bold text-stone-800">
                {lot.category.includes('Ornement') || lot.ornamentalDetails
                  ? lot.ornamentalDetails?.plantForm || 'Port paysager'
                  : lot.rootstock || 'Franc de semis'}
              </span>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-stone-500 block">
                {lot.category.includes('Ornement') || lot.ornamentalDetails
                  ? 'Hauteur / Calibre'
                  : 'Stade Végétatif'}
              </span>
              <span className="font-semibold text-emerald-800">
                {lot.category.includes('Ornement') || lot.ornamentalDetails
                  ? lot.ornamentalDetails?.palmStipeHeight ||
                    lot.ornamentalDetails?.trunkCircumference ||
                    lot.ornamentalDetails?.plantHeight ||
                    lot.stage
                  : lot.stage}
              </span>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-stone-500 block">Conditionnement / Emplacement</span>
              <span className="font-semibold text-stone-800">
                {lot.containerType} — {lot.greenhouseLocation}
              </span>
            </div>
          </div>

          {/* QR Code & Barcode Section */}
          <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white rounded-lg border border-stone-300 shadow-xs flex items-center justify-center">
                <BatchQRCodeSvg
                  value={`https://agristock.ma/track/${lot.batchNumber}`}
                  size={64}
                  fgColor="#062817"
                />
              </div>
              <div className="text-[11px] text-stone-600">
                <p className="font-mono font-bold text-stone-800">{lot.batchNumber}</p>
                <p className="text-[10px] text-stone-500">Scan QR pour historique phytosanitaire & inventaire</p>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[10px] mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Conforme Normes ONSSA
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-600/40 flex flex-col items-center justify-center text-center p-1 bg-white/70">
                <Award className="w-5 h-5 text-emerald-700" />
                <span className="text-[8px] font-black uppercase text-emerald-900 leading-tight">
                  AGRÉÉ ONSSA
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-stone-500 italic text-center">
          Ce passeport atteste de la conformité sanitaire des végétaux selon la législation phytosanitaire marocaine (Loi n° 76-17 et textes d'application ONSSA).
        </p>

        {/* Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Imprimer l'Étiquette
          </button>
          <button
            onClick={handleSendViaGmail}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <Mail className="w-4 h-4" />
            Envoyer par Gmail
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
