import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  Camera,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  Building2,
  FileCheck,
  ArrowRight,
  Phone,
  MessageCircle,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Printer,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { NurseryLot, ProduceListing } from '../types';
import { BatchQRCodeSvg } from './BatchQRCodeSvg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialBatchNumber?: string;
  onSelectLotToOrder?: (lot: NurseryLot | ProduceListing) => void;
  onOpenBatchQRModal?: (item: NurseryLot | ProduceListing) => void;
}

export const FieldQRScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialBatchNumber,
  onSelectLotToOrder,
  onOpenBatchQRModal,
}) => {
  const {
    language,
    nurseryLots,
    produceListings,
    openContactModal,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(initialBatchNumber || '');
  const [activeTabMode, setActiveTabMode] = useState<'search' | 'camera'>('search');
  const [matchedItem, setMatchedItem] = useState<{
    type: 'nursery' | 'produce';
    data: NurseryLot | ProduceListing;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Suggested demo batches for quick testing by buyers
  const suggestedBatches = [
    { code: 'LOT-2025-TOM-CHT-01', label: 'Tomates Souss' },
    { code: 'LOT-2025-CLM-BRK-02', label: 'Clémentines Berkane' },
    { code: 'LOT-2025-OLV-01', label: 'Oliviers Picholine' },
    { code: 'LOT-2025-CIT-02', label: 'Citrus Carrizo' },
    { code: 'LOT-2025-DAT-ZAG-03', label: 'Dattes Mejhoul' },
    { code: 'LOT-2025-AVO-LOU-05', label: 'Avocats Loukkos' },
  ];

  // Look up lot when search query changes or on initial open
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchedItem(null);
      return;
    }

    const query = searchQuery.trim().toLowerCase();

    // 1. Try matching nursery lots by batchNumber, phytosanitary passport or id
    const foundNursery = nurseryLots.find(
      (l) =>
        (l.batchNumber && l.batchNumber.toLowerCase().includes(query)) ||
        (l.phytosanitaryPassportNumber && l.phytosanitaryPassportNumber.toLowerCase().includes(query)) ||
        l.id.toLowerCase() === query
    );

    if (foundNursery) {
      setMatchedItem({ type: 'nursery', data: foundNursery });
      setScanError(null);
      return;
    }

    // 2. Try matching produce listings by batchNumber, passport or id
    const foundProduce = produceListings.find(
      (p) =>
        (p.batchNumber && p.batchNumber.toLowerCase().includes(query)) ||
        (p.phytosanitaryPassport && p.phytosanitaryPassport.toLowerCase().includes(query)) ||
        p.id.toLowerCase() === query
    );

    if (foundProduce) {
      setMatchedItem({ type: 'produce', data: foundProduce });
      setScanError(null);
      return;
    }

    setMatchedItem(null);
  }, [searchQuery, nurseryLots, produceListings]);

  // Set initial batch if provided
  useEffect(() => {
    if (initialBatchNumber) {
      setSearchQuery(initialBatchNumber);
    }
  }, [initialBatchNumber]);

  // Handle escape key
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

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setScanError(null);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraActive(false);
      setScanError(
        tr(
          language,
          'Accès caméra non disponible. Utilisez la recherche par N° de lot ou saisissez le code.',
          'تعذر الوصول للكاميرا، يرجى إدخال رقم الدفعة يدوياً.',
          'Camera access not available. Please enter the batch number manually.'
        )
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="modal-field-qr-scanner"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06180e] via-[#0d2a1b] to-[#143924] text-white p-5 relative border-b border-emerald-500/30">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Scan className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-stone-950">
                  {tr(language, 'Vérificateur Terrain', 'فاحص الحقل والسوق', 'Field Verifier')}
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold hidden sm:inline">
                  ONSSA AgriStock Track
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {tr(
                  language,
                  'Identification & Scan QR Champ-au-Marché',
                  'التحقق ومسح الرمز الشريطي من الحقل إلى السوق',
                  'Field-to-Market Identification & QR Scan'
                )}
              </h2>
              <p className="text-xs text-emerald-100/80">
                {tr(
                  language,
                  'Vérifiez instantanément l’authenticité d’un lot de plants ou de récolte en scannant son étiquette ou en saisissant son code.',
                  'تحقق فوراً من صحة دفعة الشتلات أو المحصول عبر مسح الملصق أو إدخال رقم الدفعة.',
                  'Instantly verify plant or harvest batch authenticity by scanning its label or entering its code.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTabMode('search');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTabMode === 'search'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{tr(language, 'Code Lot & Recherche', 'البحث برقم الدفعة', 'Batch Search')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTabMode('camera');
                startCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                activeTabMode === 'camera'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{tr(language, 'Scanner avec Caméra', 'مسح بالكاميرا', 'Camera Scan')}</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-emerald-800 hidden sm:inline">
            ✓ Traçabilité 100% Officielle
          </span>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* CAMERA SCANNER TAB */}
          {activeTabMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border-2 border-emerald-500 shadow-inner">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    {/* Viewfinder crosshairs */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative animate-pulse">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-stone-400 space-y-2">
                    <Camera className="w-10 h-10 text-stone-600 mx-auto" />
                    <p className="text-xs">
                      {tr(
                        language,
                        'Pointez votre appareil photo vers le QR code de l’étiquette de caisse ou de piquet.',
                        'وجه كاميرا هاتفك نحو رمز QR على صندوق المحصول أو حوض الشتلات.',
                        'Point your camera at the QR code on the crate or pot tag.'
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                    >
                      {tr(language, 'Activer la Caméra', 'تشغيل الكاميرا', 'Activate Camera')}
                    </button>
                  </div>
                )}
              </div>

              {scanError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          )}

          {/* SEARCH INPUT BAR */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              {tr(
                language,
                'Saisissez le N° de Lot ou le N° de Passeport Phytosanitaire ONSSA :',
                'أدخل رقم الدفعة أو رقم جواز المرور الصحي أونسا :',
                'Enter Batch Number or ONSSA Phyto Passport :'
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ex: LOT-2025-TOM-CHT-01, LOT-2025-OLV-01..."
                className="w-full pl-10 pr-24 py-3 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono text-xs sm:text-sm font-bold focus:border-emerald-600 focus:bg-white focus:outline-hidden transition shadow-2xs"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Quick Demo Batch Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Lots démo :</span>
              {suggestedBatches.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => setSearchQuery(b.code)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition cursor-pointer border ${
                    searchQuery === b.code
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS: OFFICIAL FIELD-TO-MARKET CERTIFICATE CARD */}
          {matchedItem ? (
            <div className="rounded-2xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/50 via-white to-stone-50 p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
              {/* Authenticity Banner */}
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide block">
                      {tr(
                        language,
                        'Lot Authentifié & Vérifié Conforme',
                        'دفعة موثقة ومطابقة للمعايير',
                        'Authenticated & Compliant Lot'
                      )}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Enregistré au Registre Central AgriStock Maroc
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {matchedItem.type === 'nursery' ? (matchedItem.data as NurseryLot).batchNumber : (matchedItem.data as ProduceListing).batchNumber}
                </span>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      {matchedItem.type === 'nursery' ? 'Variété & Espèce Pépinière' : 'Produit & Variété Maraîchère'}
                    </span>
                    <h3 className="text-base font-black text-stone-900">
                      {matchedItem.type === 'nursery'
                        ? `${(matchedItem.data as NurseryLot).species} — ${(matchedItem.data as NurseryLot).variety}`
                        : `${(matchedItem.data as ProduceListing).title}`}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {matchedItem.type === 'nursery'
                        ? `Stade : ${(matchedItem.data as NurseryLot).stage}`
                        : `Calibre : ${(matchedItem.data as ProduceListing).calibre || 'Non spécifié'}`}
                    </p>
                  </div>

                  {matchedItem.type === 'nursery' && (matchedItem.data as NurseryLot).rootstock && (
                    <div className="p-2 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs">
                      <span className="text-emerald-900 font-bold">Porte-Greffe Homologué : </span>
                      <span className="font-mono text-emerald-950 font-semibold">
                        {(matchedItem.data as NurseryLot).rootstock}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-stone-700 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Exploitation / Station : <strong>{(matchedItem.data as any).sellerName || 'Station Agréée'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Région : <strong>{matchedItem.data.region}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        {matchedItem.type === 'nursery' ? 'Date Greffe/Semis : ' : 'Date de Récolte : '}
                        <strong>
                          {matchedItem.type === 'nursery'
                            ? (matchedItem.data as NurseryLot).seedingOrGraftDate
                            : (matchedItem.data as ProduceListing).harvestDate}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Preview & Specs */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-stone-200 shadow-xs text-center space-y-2">
                  <BatchQRCodeSvg
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://agristock.ma'}/?verify_batch=${
                      (matchedItem.data as any).batchNumber || matchedItem.data.id
                    }`}
                    size={110}
                    fgColor="#062817"
                    bgColor="#FFFFFF"
                  />
                  <span className="text-[10px] font-mono font-bold text-stone-600">
                    {(matchedItem.data as any).batchNumber || matchedItem.data.id}
                  </span>
                  <div className="text-center">
                    <span className="text-[10px] font-semibold text-stone-500 block">Stock Disponible</span>
                    <span className="text-sm font-black text-emerald-800">
                      {matchedItem.data.quantityAvailable.toLocaleString('fr-FR')}{' '}
                      {matchedItem.type === 'nursery' ? 'plants' : (matchedItem.data as ProduceListing).unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phyto & Sanitary Passport Verification Box */}
              <div className="p-3 rounded-xl bg-emerald-950 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">
                      Passeport Phytosanitaire Officiel ONSSA
                    </span>
                    <span className="font-mono text-emerald-300 text-[11px]">
                      {(matchedItem.data as any).phytosanitaryPassportNumber ||
                        (matchedItem.data as any).phytosanitaryPassport ||
                        'ONSSA-ST-HOMOLOGUE-2025'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold">
                  Conforme Sécurité Sanitaire ✓
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenBatchQRModal) {
                        onOpenBatchQRModal(matchedItem.data);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr(language, 'Voir / Imprimer QR Étiquette', 'طباعة الباركود والملصق', 'View / Print QR Label')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (matchedItem.type === 'produce') {
                        openContactModal(matchedItem.data as ProduceListing);
                      } else {
                        setActiveTab('nursery');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{tr(language, 'Contacter l’Exploitant', 'تواصل مع المنتج', 'Contact Producer')}</span>
                  </button>
                </div>

                {onSelectLotToOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectLotToOrder(matchedItem.data);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                  >
                    <span>{tr(language, 'Commander avec Séquestre', 'طلب بالضمان البنكي', 'Order with Escrow')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : searchQuery.trim() ? (
            <div className="text-center p-8 rounded-2xl border border-dashed border-stone-300 space-y-2">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
              <h4 className="text-sm font-bold text-stone-700">
                {tr(language, 'Aucun lot trouvé pour ce code', 'لم يتم العثور على دفعة بهذا الرقم', 'No batch found for this code')}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {tr(
                  language,
                  'Vérifiez le numéro de lot imprimé sur votre étiquette de caisse ou sélectionnez un lot suggéré ci-dessus.',
                  'تأكد من رقم الدفعة المطبوع على الملصق أو اختر أحد النماذج أعلاه.',
                  'Verify the batch number printed on the crate label or select a sample batch above.'
                )}
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
              <QrCode className="w-8 h-8 text-emerald-700 mx-auto" />
              <h4 className="text-xs font-bold text-stone-800">
                {tr(language, 'Recherche Instantanée de Traçabilité', 'فحص مباشر للشفافية والتتبع', 'Instant Traceability Lookup')}
              </h4>
              <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                {tr(
                  language,
                  'Chaque produit référencé sur AgriStock Maroc (plants de pépinières, récoltes de primeurs, fruits et légumes) dispose d’un identifiant unique garantissant son origine, son agrément ONSSA et son historique.',
                  'تتوفر كل شحنة على رقم موحد يضمن مصدرها واعتمادها الصحي.',
                  'Every listing has a unique identifier guaranteeing its Moroccan agricultural origin and official sanitary clearance.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
