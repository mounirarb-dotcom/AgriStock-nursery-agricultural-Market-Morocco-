import React, { useState, useEffect, useMemo } from 'react';
import { NurseryLot, ProduceListing } from '../types';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { BatchQRCodeSvg, getQRCodeDataURL } from './BatchQRCodeSvg';
import {
  QrCode,
  Printer,
  X,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Share2,
  Package,
  Sprout,
  MapPin,
  Calendar,
  Layers,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Tag,
  Eye,
  FileText,
  ExternalLink,
  Smartphone,
  Phone,
  MessageCircle,
} from 'lucide-react';

export interface BatchItemData {
  type: 'nursery' | 'produce';
  id: string;
  batchNumber: string;
  title: string;
  variety: string;
  speciesOrCategory: string;
  region: string;
  quantityAvailable: number;
  unit: string;
  unitPriceMAD: number;
  location: string;
  healthOrCertifications: string[];
  phytosanitaryPassport?: string;
  onssaStatus?: string;
  stageOrCalibre?: string;
  harvestOrSeedingDate?: string;
  sellerName?: string;
  sellerPhone?: string;
  notes?: string;
  rootstock?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batchData?: BatchItemData | null;
  lot?: NurseryLot | null;
  produceListing?: ProduceListing | null;
  onQuickStockAdjust?: (change: number) => void;
}

export const BatchQRCodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  batchData,
  lot,
  produceListing,
  onQuickStockAdjust,
}) => {
  const { language } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [labelFormat, setLabelFormat] = useState<'standard' | 'pot_stake' | 'crate' | 'full_sheet'>('standard');
  const [qrPayloadType, setQrPayloadType] = useState<'url' | 'field_text' | 'json'>('url');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);
  const [isDownloadingPNG, setIsDownloadingPNG] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const effectiveBatchData: BatchItemData | null = useMemo(() => {
    if (batchData) return batchData;
    if (lot) {
      return {
        type: 'nursery',
        id: lot.id,
        batchNumber: lot.batchNumber || `LOT-PEP-${lot.id.toUpperCase()}`,
        title: `${lot.species || ''} — ${lot.variety || ''}`,
        variety: lot.variety || '',
        speciesOrCategory: lot.species || 'Plants & Arbres',
        region: lot.region || '',
        quantityAvailable: lot.quantityAvailable || 0,
        unit: 'plants',
        unitPriceMAD: lot.unitPriceMAD || 0,
        location: lot.greenhouseLocation || 'Serre pépinière',
        healthOrCertifications: [lot.onssaStatus, lot.healthStatus].filter(Boolean),
        phytosanitaryPassport: lot.phytosanitaryPassportNumber || `ONSSA-PEP-${new Date().getFullYear()}-412`,
        onssaStatus: lot.onssaStatus,
        stageOrCalibre: lot.stage,
        harvestOrSeedingDate: lot.seedingOrGraftDate,
        sellerName: lot.sellerName || 'Pépinière Agréée',
        sellerPhone: '+212661000000',
        notes: lot.notes,
        rootstock: lot.rootstock,
      };
    }
    if (produceListing) {
      return {
        type: 'produce',
        id: produceListing.id,
        batchNumber: produceListing.batchNumber || `LOT-PRD-${(produceListing.id || 'ITEM').toUpperCase()}`,
        title: produceListing.title,
        variety: produceListing.variety,
        speciesOrCategory: produceListing.category,
        region: produceListing.region,
        quantityAvailable: produceListing.quantityAvailable,
        unit: produceListing.unit,
        unitPriceMAD: produceListing.pricePerUnitMAD,
        location: `${produceListing.locationCity} (${produceListing.region.split('(')[0].trim()})`,
        healthOrCertifications: produceListing.certifications || [],
        phytosanitaryPassport: produceListing.phytosanitaryPassport || 'ONSSA-ST-AGR-2025',
        onssaStatus: produceListing.certifications?.includes('ONSSA Homologué') ? 'ONSSA Homologué' : 'Standard',
        stageOrCalibre: produceListing.calibre,
        harvestOrSeedingDate: produceListing.harvestDate,
        sellerName: produceListing.sellerName,
        sellerPhone: produceListing.phone,
        notes: produceListing.description,
      };
    }
    return null;
  }, [batchData, lot, produceListing]);

  if (!isOpen || !effectiveBatchData) return null;

  // Direct Mobile Verification URL (scannable by any smartphone camera)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://agristock.ma';
  const directVerificationUrl = `${baseUrl}/?verify_batch=${encodeURIComponent(effectiveBatchData.batchNumber)}`;

  // Human-readable field text payload (readable on phones even offline in rural farms)
  const fieldTextPayload = `[AGRISTOCK MAROC — TRAÇABILITÉ OFFICIELLE]
Lot N°: ${effectiveBatchData.batchNumber}
Produit: ${effectiveBatchData.variety} (${effectiveBatchData.speciesOrCategory})
${effectiveBatchData.rootstock ? `Porte-greffe: ${effectiveBatchData.rootstock}\n` : ''}Passeport ONSSA: ${effectiveBatchData.phytosanitaryPassport || 'En cours'}
Volume: ${effectiveBatchData.quantityAvailable} ${effectiveBatchData.unit}
Station/Ferme: ${effectiveBatchData.sellerName}
Région: ${effectiveBatchData.region}
Date: ${effectiveBatchData.harvestOrSeedingDate || 'N/A'}
Lien vérif: ${directVerificationUrl}`;

  // Structured JSON payload
  const jsonPayload = JSON.stringify({
    app: 'AgriStock Maroc',
    type: effectiveBatchData.type,
    batch: effectiveBatchData.batchNumber,
    id: effectiveBatchData.id,
    variety: effectiveBatchData.variety,
    species: effectiveBatchData.speciesOrCategory,
    rootstock: effectiveBatchData.rootstock,
    qty: effectiveBatchData.quantityAvailable,
    unit: effectiveBatchData.unit,
    priceMAD: effectiveBatchData.unitPriceMAD,
    passport: effectiveBatchData.phytosanitaryPassport || 'N/A',
    onssa: effectiveBatchData.onssaStatus || 'Certifié',
    region: effectiveBatchData.region,
    date: effectiveBatchData.harvestOrSeedingDate,
    url: directVerificationUrl,
  });

  // Selected QR Code content based on user choice
  const activeQrPayload =
    qrPayloadType === 'url' ? directVerificationUrl : qrPayloadType === 'field_text' ? fieldTextPayload : jsonPayload;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directVerificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(activeQrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgWrapper = document.getElementById('printable-qr-code-svg');
    const svgElement = svgWrapper?.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-AGRISTOCK-${effectiveBatchData.batchNumber}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = async () => {
    try {
      setIsDownloadingPNG(true);
      const dataUrl = await getQRCodeDataURL(activeQrPayload, { width: 800, margin: 2 });
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR-AGRISTOCK-${effectiveBatchData.batchNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download PNG failed:', err);
    } finally {
      setIsDownloadingPNG(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌿 *Traçabilité & Fiche Lot AgriStock Maroc*\n` +
        `📦 *Lot N° :* ${effectiveBatchData.batchNumber}\n` +
        `🌱 *Variété :* ${effectiveBatchData.variety} (${effectiveBatchData.speciesOrCategory})\n` +
        `🏷️ *Volume :* ${effectiveBatchData.quantityAvailable} ${effectiveBatchData.unit}\n` +
        `🛡️ *Passeport ONSSA :* ${effectiveBatchData.phytosanitaryPassport || 'Homologué'}\n` +
        `📍 *Origine :* ${effectiveBatchData.region}\n\n` +
        `📲 *Vérifier en direct avec QR Code :*\n${directVerificationUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const triggerAdjust = (change: number) => {
    if (onQuickStockAdjust) {
      onQuickStockAdjust(change);
      setAdjustSuccessMsg(
        change > 0
          ? `+${change} ${effectiveBatchData.unit} ajoutés au stock (Scan Entrée)`
          : `${change} ${effectiveBatchData.unit} déduits du stock (Scan Sortie)`
      );
      setTimeout(() => setAdjustSuccessMsg(null), 3000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header Institutionnel AgriStock */}
        <div className="bg-gradient-to-r from-[#061a0f] via-[#0d2e1b] to-[#123822] text-white p-4 sm:p-5 relative border-b border-emerald-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-stone-950">
                  {effectiveBatchData.type === 'nursery'
                    ? tr(language, 'Pépinière & Plants Certifiés', 'شتلات ونباتات معتمدة', 'Certified Nursery Lot')
                    : tr(language, 'Récolte & Primeurs de Marché', 'محصول وخضر وفواكه', 'Harvest & Field Produce')}
                </span>
                <span className="font-mono text-xs text-emerald-300 font-bold hidden sm:inline">
                  {effectiveBatchData.batchNumber}
                </span>
              </div>
              <h2 id="qr-modal-title" className="text-base sm:text-xl font-black text-white mt-1">
                {tr(
                  language,
                  'QR Code de Traçabilité Champ-au-Marché',
                  'رمز الاستجابة السريعة (QR) لتتبع الشحنة من الحقل إلى السوق',
                  'Field-to-Market Traceability QR Code'
                )}
              </h2>
              <p className="text-xs text-emerald-100/80">
                {effectiveBatchData.title} — {effectiveBatchData.variety}
              </p>
            </div>
          </div>
        </div>

        {/* Payload & Label Controls Toolbar */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Format selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
              Format :
            </span>
            <button
              type="button"
              onClick={() => setLabelFormat('standard')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                labelFormat === 'standard'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              🏷️ {tr(language, 'Standard', 'قياسي', 'Standard')}
            </button>
            <button
              type="button"
              onClick={() => setLabelFormat('pot_stake')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                labelFormat === 'pot_stake'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              🪴 {tr(language, 'Piquet / Pot', 'ملصق الحوض', 'Pot Tag')}
            </button>
            <button
              type="button"
              onClick={() => setLabelFormat('crate')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                labelFormat === 'crate'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              📦 {tr(language, 'Caisse / Palette', 'ملصق الصندوق', 'Crate Label')}
            </button>
            <button
              type="button"
              onClick={() => setLabelFormat('full_sheet')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                labelFormat === 'full_sheet'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              📄 {tr(language, 'Fiche A4', 'شهادة A4', 'Full Sheet')}
            </button>
          </div>

          {/* QR Content mode */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-stone-400 font-semibold uppercase">Scan :</span>
            <select
              value={qrPayloadType}
              onChange={(e) => setQrPayloadType(e.target.value as any)}
              className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              <option value="url">📱 Lien Direct Smartphone</option>
              <option value="field_text">📋 Fiche Terrain Hors-Ligne</option>
              <option value="json">💻 Données Brutes JSON / API</option>
            </select>
          </div>
        </div>

        {/* Corps principal : Étiquette & QR interactif */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Étiquette d'inventaire imprimable */}
          <div
            id="printable-inventory-label"
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
              labelFormat === 'pot_stake'
                ? 'bg-emerald-50/40 border-emerald-600 max-w-sm mx-auto shadow-sm'
                : labelFormat === 'crate'
                ? 'bg-amber-50/30 border-amber-600/80 shadow-sm'
                : labelFormat === 'full_sheet'
                ? 'bg-white border-stone-400 shadow-md'
                : 'bg-[#fafaf7] border-emerald-900/40 shadow-xs'
            }`}
          >
            {/* Tag Brand Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  🌱
                </div>
                <div>
                  <span className="font-black text-xs tracking-wider text-emerald-950 uppercase block">
                    AGRISTOCK MAROC — TRAÇABILITÉ OFFICIELLE
                  </span>
                  <span className="text-[9px] text-stone-500 block">
                    Homologation ONSSA & Contrôle Sanitaire Royaume du Maroc
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                {effectiveBatchData.onssaStatus || 'Agréé ONSSA'}
              </span>
            </div>

            {/* Layout QR Code + Specs */}
            <div className={`flex ${labelFormat === 'pot_stake' ? 'flex-col items-center text-center' : 'flex-col sm:flex-row items-center sm:items-start'} gap-4`}>
              {/* Le QR Code Vectoriel Standard */}
              <div className="flex flex-col items-center shrink-0">
                <div className="p-2.5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center">
                  <div id="printable-qr-code-svg">
                    <BatchQRCodeSvg
                      value={activeQrPayload}
                      size={labelFormat === 'pot_stake' ? 140 : labelFormat === 'crate' ? 160 : 150}
                      fgColor="#062817"
                      bgColor="#FFFFFF"
                      title={`QR Code de traçabilité ${effectiveBatchData.batchNumber}`}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-700 mt-1.5 tracking-wider bg-stone-100 px-2 py-0.5 rounded">
                  {effectiveBatchData.batchNumber}
                </span>
                <span className="text-[9px] text-emerald-800 font-bold mt-0.5 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  {tr(language, 'Scannable appareil photo', 'امسح بالهاتف', 'Scan with camera')}
                </span>
              </div>

              {/* Métadonnées du lot scanné */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200/90 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                      {tr(language, 'Variété / Cultivar', 'الصنف', 'Variety / Cultivar')}
                    </span>
                    <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                      {effectiveBatchData.variety}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 font-medium">
                    {effectiveBatchData.speciesOrCategory}
                  </div>
                  {effectiveBatchData.rootstock && (
                    <div className="text-[11px] font-bold text-emerald-800 pt-1 border-t border-stone-100 flex items-center justify-between">
                      <span>Porte-Greffe (PG) :</span>
                      <span>{effectiveBatchData.rootstock}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-stone-200/80 shadow-2xs">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      {tr(language, 'Volume Référencé', 'الكمية المتوفرة', 'Stock Quantity')}
                    </span>
                    <span className="font-black text-emerald-800 text-sm">
                      {effectiveBatchData.quantityAvailable.toLocaleString('fr-FR')} {effectiveBatchData.unit}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-stone-200/80 shadow-2xs">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      {tr(language, 'Prix Indicatif', 'السعر للوحدة', 'Unit Price')}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">
                      {effectiveBatchData.unitPriceMAD.toLocaleString('fr-FR')} MAD
                      <span className="text-[10px] font-normal text-stone-500"> / {effectiveBatchData.unit}</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {tr(language, 'Emplacement / Origine :', 'الموقع / المصدر :', 'Location / Origin :')}
                    </span>
                    <span className="font-semibold text-stone-800">{effectiveBatchData.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      {effectiveBatchData.type === 'nursery' ? 'Date de Semis/Greffe :' : 'Date de Récolte :'}
                    </span>
                    <span className="font-semibold text-stone-800">
                      {effectiveBatchData.harvestOrSeedingDate || 'Non renseignée'}
                    </span>
                  </div>
                  {effectiveBatchData.stageOrCalibre && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-sky-600" />
                        {effectiveBatchData.type === 'nursery' ? 'Stade Végétatif :' : 'Calibre & Tri :'}
                      </span>
                      <span className="font-semibold text-stone-800">{effectiveBatchData.stageOrCalibre}</span>
                    </div>
                  )}
                  {effectiveBatchData.phytosanitaryPassport && (
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-100">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Passeport ONSSA :
                      </span>
                      <span className="font-mono font-bold text-emerald-950">
                        {effectiveBatchData.phytosanitaryPassport}
                      </span>
                    </div>
                  )}
                </div>

                {/* Seller & Verification Footer */}
                <div className="flex items-center justify-between px-1 text-[10px] text-stone-500">
                  <span>Producteur : <strong>{effectiveBatchData.sellerName}</strong></span>
                  <span className="text-emerald-700 font-semibold">Traçabilité Sécurisée ✓</span>
                </div>
              </div>
            </div>

            {/* Direct Link Banner */}
            <div className="mt-3 pt-2.5 border-t border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-stone-600">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-xs font-mono text-[10px] text-stone-500">
                  {directVerificationUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Lien copié !' : 'Copier lien direct'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stock Terminal (Scan Entrée / Sortie) */}
          {onQuickStockAdjust && (
            <div className="p-3.5 rounded-2xl bg-stone-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Terminal de Scan Terrain (Ajustement Rapide Stock)
                </span>
                <span className="font-mono text-stone-400 text-[11px]">
                  En stock : {effectiveBatchData.quantityAvailable} {effectiveBatchData.unit}
                </span>
              </div>

              {adjustSuccessMsg && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold animate-in fade-in">
                  ✓ {adjustSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => triggerAdjust(-10)}
                  className="px-2 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => triggerAdjust(-1)}
                  className="px-2 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => triggerAdjust(1)}
                  className="px-2 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => triggerAdjust(10)}
                  className="px-2 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  +10
                </button>
              </div>
            </div>
          )}

          {/* Action Export Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                title="Imprimer l'étiquette directement"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>{tr(language, 'Imprimer Étiquette', 'طباعة الملصق', 'Print Label')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={isDownloadingPNG}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                title="Télécharger l'image PNG haute résolution du QR Code"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingPNG ? 'Export...' : 'Image PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-bold text-xs transition cursor-pointer"
                title="Télécharger le fichier vectoriel SVG pour imprimerie"
              >
                <FileText className="w-4 h-4 text-stone-500" />
                <span>Vectoriel SVG</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                title="Partager les détails et le QR par WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer"
                title="Copier les données du QR Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
