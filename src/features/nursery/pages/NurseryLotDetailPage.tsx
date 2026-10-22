import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { SmartImage } from '../../../components/SmartImage';
import {
  ArrowLeft,
  Sprout,
  ShieldCheck,
  QrCode,
  Calendar,
  Layers,
  MapPin,
  FileCheck,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { NurseryLot } from '../../../types';

export const NurseryLotDetailPage: React.FC = () => {
  const {
    language,
    selectedOfferForDetail,
    nurseryLots,
    setActiveTab,
    openFieldQRScannerModal,
  } = useApp();

  const lot: NurseryLot = selectedOfferForDetail || nurseryLots[0];

  if (!lot) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <p className="text-stone-500 text-sm">
          {tr(language, 'Aucun lot sélectionné.', 'لم يتم تحديد أي دفعة شتائل.', 'No nursery lot selected.')}
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('nursery_inventory')}
          className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
        >
          {tr(language, 'Retour aux lots', 'العودة للدليل', 'Back to Nursery Lots')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('nursery_inventory')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à l’inventaire pépinière', 'العودة للمخزون', 'Back to Nursery Inventory')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        {/* Header Lot */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <SmartImage src={lot.imageUrl || ''} alt={lot.variety} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                  {lot.species}
                </span>
                {lot.batchNumber && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold">
                    Lot #{lot.batchNumber}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">{lot.variety}</h1>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{lot.region}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-teal-900">
              {lot.unitPriceMAD.toLocaleString('fr-FR')} MAD
            </span>
            <span className="text-[10px] text-stone-500 block">Prix unitaire HT / plant</span>
          </div>
        </div>

        {/* Fiche technique ONSSA & Caractéristiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[10px] text-stone-400 block font-semibold">Porte-greffe</span>
            <span className="font-bold text-stone-800">{lot.rootstock || 'Franc / Direct'}</span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[10px] text-stone-400 block font-semibold">Stade de croissance</span>
            <span className="font-bold text-stone-800">{lot.stage || (lot as any).growthStage}</span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[10px] text-stone-400 block font-semibold">Statut sanitaire ONSSA</span>
            <span className="font-bold text-teal-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lot.onssaStatus}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
            <span className="text-[10px] text-stone-400 block font-semibold">Stock disponible</span>
            <span className="font-bold text-stone-800">
              {lot.quantityAvailable.toLocaleString('fr-FR')} plants
            </span>
          </div>
        </div>

        {/* Historique des traitements phytosanitaires */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Traçabilité Phytosanitaire & Traitements Enregistrés</span>
            </h3>
          </div>

          {(!lot.treatments || lot.treatments.length === 0) ? (
            <p className="text-xs text-stone-400 p-4 rounded-xl bg-stone-50 border border-stone-100 text-center">
              Aucun traitement chimique consigné sur ce lot pour le moment (Culture saine sous abri).
            </p>
          ) : (
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-xs">
              {lot.treatments.map((t) => (
                <div key={t.id} className="p-3.5 bg-white hover:bg-stone-50 transition flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900">{t.product} ({t.dose})</span>
                    <div className="text-[11px] text-stone-500">Cible : {t.targetPest} • Opérateur : {t.technician}</div>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">{t.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions QR Code & Traçabilité */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => openFieldQRScannerModal(lot.batchNumber)}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>Générer / Scanner QR Code Passeport</span>
          </button>

          <span className="text-[11px] text-stone-500">
            Conforme aux normes ONSSA pour la circulation des végétaux au Maroc.
          </span>
        </div>
      </div>
    </div>
  );
};
