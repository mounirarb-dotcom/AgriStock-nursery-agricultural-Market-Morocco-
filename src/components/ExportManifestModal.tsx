import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ProduceExportManifest,
  ProduceManifestItem,
  ExportManifestStatus,
  ExportDestinationType,
  MoroccanRegion,
} from '../types';
import { downloadExportManifestPdf } from '../utils/exportManifestPdf';
import { COMMON_MOROCCAN_PRODUCE_HS_CODES, ProduceHSCodeInfo } from '../data/exportComplianceData';
import { BatchQRCodeSvg } from './BatchQRCodeSvg';
import { AppLogoIcon } from './AppLogo';
import {
  FileText,
  Printer,
  Download,
  Mail,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Thermometer,
  Boxes,
  Globe,
  ArrowRight,
  X,
  Edit3,
  Trash2,
  FileCheck,
  AlertTriangle,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const ExportManifestModal: React.FC = () => {
  const {
    isExportManifestModalOpen,
    setIsExportManifestModalOpen,
    exportManifests,
    activeExportManifestId,
    setActiveExportManifestId,
    prepopulatedListingForManifest,
    createExportManifest,
    updateExportManifest,
    deleteExportManifest,
    produceListings,
    openComposeModal,
    setActiveTab,
  } = useApp();

  // Mode: 'dashboard' | 'preview' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'dashboard' | 'preview' | 'form'>(() => {
    return activeExportManifestId ? 'preview' : 'dashboard';
  });

  // Language for document preview (FR / EN for international customs / AR)
  const [docLanguage, setDocLanguage] = useState<'fr' | 'en' | 'ar'>('fr');

  // Search & Filters in Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDestination, setFilterDestination] = useState<'all' | 'international' | 'inter_regional'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ExportManifestStatus>('all');

  // Active Manifest for Preview / Edit
  const activeManifest = useMemo(() => {
    if (activeExportManifestId) {
      const found = exportManifests.find(m => m.id === activeExportManifestId);
      if (found) return found;
    }
    return exportManifests[0] || null;
  }, [activeExportManifestId, exportManifests]);

  // Form State
  const [formData, setFormData] = useState<Partial<ProduceExportManifest>>({});
  const [formItems, setFormItems] = useState<ProduceManifestItem[]>([]);
  const [editingManifestId, setEditingManifestId] = useState<string | null>(null);

  // Initialize form when opening 'create' or 'edit'
  const initForm = (manifest?: ProduceExportManifest) => {
    if (manifest) {
      setEditingManifestId(manifest.id);
      setFormData({ ...manifest });
      setFormItems([...manifest.items]);
    } else {
      setEditingManifestId(null);
      const today = new Date().toISOString().split('T')[0];
      const dep = new Date();
      dep.setDate(dep.getDate() + 1);
      const arr = new Date();
      arr.setDate(arr.getDate() + 3);

      const defaultHS = COMMON_MOROCCAN_PRODUCE_HS_CODES[0];

      setFormData({
        status: 'inspected',
        destinationType: 'international',
        issueDate: today,
        departureDate: dep.toISOString().split('T')[0],
        estimatedArrivalDate: arr.toISOString().split('T')[0],

        exporterName: 'Station de Conditionnement Souss Export S.A.',
        exporterICE: '001894218000042',
        exporterRC: 'RC 48210 Agadir',
        exporterAddress: 'Zone Industrielle Aït Melloul, Voie B4',
        exporterCity: 'Aït Melloul / Agadir',
        originRegion: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
        onssaApprovalNumber: 'ST-ONSSA-SM-2024-0088',
        foodexApprovalNumber: 'EACCE-EXP-4412-MA',
        contactPerson: 'M. Rachid Bennani (Directeur Export)',
        contactPhone: '+212 661 448 821',
        contactEmail: 'export@agrisouss.ma',

        consigneeName: 'Saint-Charles Primeurs Import SAS',
        consigneeAddress: 'Grand Marché Saint-Charles International',
        consigneeCity: 'Perpignan',
        consigneeCountry: 'France',
        consigneeVatEori: 'FR88492019482',
        notifyParty: 'Trans-Douane Algeciras Forwarding S.L.',

        transportMode: 'road_reefer',
        carrierName: 'AgriFret Frigo International',
        truckPlateNumber: '78412-A-33',
        trailerPlateNumber: 'REM-FRIGO-9921',
        sealNumber: `BADR-PL-${Math.floor(100000 + Math.random() * 899999)}`,
        temperatureSetpointC: defaultHS.recommendedTempC,
        temperatureMinC: defaultHS.tempToleranceC.min,
        temperatureMaxC: defaultHS.tempToleranceC.max,
        dataloggerNumber: 'USB-SENSITECH-9941',
        portOfLoading: 'Port Tanger Med Passagers/Fret',
        portOfDischarge: 'Port d\'Algésiras (Espagne) / Plateforme Saint-Charles',
        customsOffice: 'Bureau Douanier Port Tanger Med (Code 400)',
        dumNumber: `DUM-2026-400-098231-${Math.floor(10 + Math.random() * 89)}`,
        cmrNumber: 'CMR-MA-FR-2026-4401',

        phytosanitaryCertificateNumber: `ONSSA-PHYTO-EXP-2026-${Math.floor(1000 + Math.random() * 8999)}`,
        foodexInspectionCertificate: `FOODEX-CERT-2026-${Math.floor(1000 + Math.random() * 8999)}`,
        eur1CertificateNumber: `MA-EUR1-2026-${Math.floor(1000 + Math.random() * 8999)}`,
        isGlobalGapCertified: true,
        isOrganicBio: false,
        isResidueCompliant: true,
        quarantinePestFree: true,
        specialHandlingNotes: 'Contrôle continu de la chaîne du froid à température dirigée. Palettes filmées aérées.',

        qualityManagerName: 'Dr. Tariq El Fassi (Ingénieur Qualité Agréé)',
        driverSignatureName: 'Youssef El Amrani (Chauffeur Fret TIR)',
        inspectorName: 'Poste Contrôle Frontalier ONSSA / Foodex',
      });

      setFormItems([
        {
          id: `item-${Date.now()}`,
          commodity: 'Tomates Rondes Grappe Lisses',
          variety: 'Torry F1',
          hsCode: '0702.00.00',
          qualityClass: 'Catégorie I',
          calibre: 'Calibre 57-67mm (M)',
          lotNumber: 'LOT-2026-TOM-CHT-01',
          packagingType: 'Cartons télescopiques 6kg',
          packagesCount: 3000,
          palletsCount: 20,
          netWeightKg: 18000,
          grossWeightKg: 19440,
          globalGapGgn: '4052899482103',
          originPlot: 'Serre P4 - Chtouka Aït Baha',
        },
      ]);
    }
    setViewMode('form');
  };

  // Prepopulate form if a produce listing was passed
  React.useEffect(() => {
    if (prepopulatedListingForManifest && isExportManifestModalOpen) {
      // Find matching manifest or create from listing
      const existing = exportManifests.find(m => m.linkedProduceListingId === prepopulatedListingForManifest.id);
      if (existing) {
        setActiveExportManifestId(existing.id);
        setViewMode('preview');
      }
    }
  }, [prepopulatedListingForManifest, isExportManifestModalOpen, exportManifests, setActiveExportManifestId]);

  if (!isExportManifestModalOpen) return null;

  // Filtered manifests for Dashboard
  const filteredManifests = exportManifests.filter(m => {
    const matchesSearch =
      m.manifestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.exporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.consigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.consigneeCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.items.some(i => i.commodity.toLowerCase().includes(searchQuery.toLowerCase()) || i.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDest =
      filterDestination === 'all' || m.destinationType === filterDestination;

    const matchesStatus =
      filterStatus === 'all' || m.status === filterStatus;

    return matchesSearch && matchesDest && matchesStatus;
  });

  // KPI Calculations
  const totalTonnage = exportManifests.reduce((acc, m) => acc + (m.totalNetWeightKg / 1000), 0);
  const activeReefers = exportManifests.filter(m => m.status === 'in_transit').length;
  const clearedManifests = exportManifests.filter(m => m.status === 'customs_cleared').length;

  const handlePrint = () => {
    window.print();
  };

  const handleSendViaGmail = (manifest: ProduceExportManifest) => {
    const subject = `Manifeste d'Expédition Officiel [${manifest.manifestNumber}] — ${manifest.items.map(i => i.commodity).join(', ')} (${(manifest.totalNetWeightKg / 1000).toFixed(1)} T)`;
    const body =
      `Salam alaykoum / Bonjour,\n\n` +
      `Veuillez trouver ci-dessous les références du Manifeste d'Expédition Standardisé pour le chargement de produits agricoles marocains :\n\n` +
      `📋 RÉFÉRENCES DU MANIFESTE :\n` +
      `• N° Manifeste : ${manifest.manifestNumber}\n` +
      `• Date d'émission : ${manifest.issueDate}\n` +
      `• Statut : ${String(manifest?.status || 'DRAFT').toUpperCase()}\n` +
      `• Destination : ${manifest.consigneeCity}, ${manifest.consigneeCountry} (${manifest.destinationType === 'international' ? 'Export International' : 'Transit National'})\n` +
      `• Déclaration Unique Douane (DUM BADR) : ${manifest.dumNumber || 'En cours'}\n\n` +
      `🏢 EXPÉDITEUR (STATION AGRÉÉE) :\n` +
      `• Station : ${manifest.exporterName}\n` +
      `• ICE : ${manifest.exporterICE} | Agrément ONSSA : ${manifest.onssaApprovalNumber}\n` +
      `• Agrément Morocco Foodex (EACCE) : ${manifest.foodexApprovalNumber}\n\n` +
      `🚛 LOGISTIQUE FRIGORIFIQUE & ROUTE :\n` +
      `• Transporteur : ${manifest.carrierName}\n` +
      `• Camion / Remorque : ${manifest.truckPlateNumber} / ${manifest.trailerPlateNumber || 'N/A'}\n` +
      `• N° Plomb / Scellé Douane : ${manifest.sealNumber}\n` +
      `• Température de consigne : ${manifest.temperatureSetpointC}°C (Plage : ${manifest.temperatureMinC}°C à ${manifest.temperatureMaxC}°C)\n` +
      `• Port d'embarquement : ${manifest.portOfLoading} -> Déchargement : ${manifest.portOfDischarge}\n\n` +
      `📦 CHARGEMENT & TRAÇABILITÉ :\n` +
      `• Palettes : ${manifest.totalPallets} | Colis : ${manifest.totalPackages.toLocaleString()}\n` +
      `• Poids Net Total : ${(manifest.totalNetWeightKg / 1000).toFixed(2)} Tonnes (${manifest.totalNetWeightKg.toLocaleString()} kg)\n` +
      `• Produits : ${manifest.items.map(i => `${i.commodity} (Code SH ${i.hsCode}, Lot ${i.lotNumber}, ${i.netWeightKg} kg)`).join('; ')}\n\n` +
      `🛡️ CONFORMITÉ SANITAIRE & CERTIFICATS :\n` +
      `• Certificat Phyto ONSSA : ${manifest.phytosanitaryCertificateNumber}\n` +
      `• Certificat Foodex : ${manifest.foodexInspectionCertificate}\n` +
      `• Certificat EUR.1 : ${manifest.eur1CertificateNumber || 'N/A'}\n` +
      `• Conformité LMR UE & Absence Ravageurs : Validé\n\n` +
      `Le fichier PDF officiel a été généré via le module AgriStock Export Compliance.\n\n` +
      `Salutations respectueuses.`;

    setIsExportManifestModalOpen(false);
    setActiveTab('gmail');
    openComposeModal({
      to: manifest.contactEmail || 'douane.export@tangermed.ma',
      subject,
      body,
      sourceContext: `Manifeste ${manifest.manifestNumber}`,
    });
  };

  // Form handlers
  const handleAddItem = () => {
    const defaultHS = COMMON_MOROCCAN_PRODUCE_HS_CODES[0];
    const newItem: ProduceManifestItem = {
      id: `item-${Date.now()}`,
      commodity: defaultHS.commodityFr.split('(')[0].trim(),
      variety: 'Standard',
      hsCode: defaultHS.hsCode,
      qualityClass: 'Catégorie I',
      calibre: 'Calibre 1',
      lotNumber: `LOT-2026-PRD-${Math.floor(100 + Math.random() * 899)}`,
      packagingType: defaultHS.standardPackaging,
      packagesCount: 1000,
      palletsCount: 10,
      netWeightKg: 10000,
      grossWeightKg: 10800,
      globalGapGgn: '4052899482103',
      originPlot: 'Parcelle A1',
    };
    setFormItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length <= 1) return;
    setFormItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ProduceManifestItem, val: any) => {
    setFormItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          // Auto recalcul gross weight if net weight changed
          if (field === 'netWeightKg') {
            const num = Number(val) || 0;
            updated.grossWeightKg = Math.round(num * 1.075);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleHSCodeSelect = (itemId: string, hsCode: string) => {
    const found = COMMON_MOROCCAN_PRODUCE_HS_CODES.find(h => h.hsCode === hsCode);
    if (!found) return;

    handleItemChange(itemId, 'hsCode', hsCode);
    handleItemChange(itemId, 'commodity', found.commodityFr.split('(')[0].trim());
    handleItemChange(itemId, 'packagingType', found.standardPackaging);
    if (found.defaultCalibres.length > 0) {
      handleItemChange(itemId, 'calibre', found.defaultCalibres[0]);
    }

    // Set recommended temperature in form if this is the first item
    setFormData(prev => ({
      ...prev,
      temperatureSetpointC: found.recommendedTempC,
      temperatureMinC: found.tempToleranceC.min,
      temperatureMaxC: found.tempToleranceC.max,
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPallets = formItems.reduce((acc, i) => acc + (Number(i.palletsCount) || 0), 0);
    const totalPackages = formItems.reduce((acc, i) => acc + (Number(i.packagesCount) || 0), 0);
    const totalNetWeightKg = formItems.reduce((acc, i) => acc + (Number(i.netWeightKg) || 0), 0);
    const totalGrossWeightKg = formItems.reduce((acc, i) => acc + (Number(i.grossWeightKg) || 0), 0);

    const baseData = {
      status: formData.status || 'inspected',
      destinationType: formData.destinationType || 'international',
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      departureDate: formData.departureDate || new Date().toISOString().split('T')[0],
      estimatedArrivalDate: formData.estimatedArrivalDate || new Date().toISOString().split('T')[0],

      exporterName: formData.exporterName || 'Station Maraîchère Agréée',
      exporterICE: formData.exporterICE || '001894218000042',
      exporterRC: formData.exporterRC || 'RC 48210 Agadir',
      exporterAddress: formData.exporterAddress || 'Zone Industrielle',
      exporterCity: formData.exporterCity || 'Agadir',
      originRegion: (formData.originRegion as MoroccanRegion) || 'Souss-Massa (Agadir, Taroudant, Chtouka)',
      onssaApprovalNumber: formData.onssaApprovalNumber || 'ST-ONSSA-SM-2024-0088',
      foodexApprovalNumber: formData.foodexApprovalNumber || 'EACCE-EXP-4412-MA',
      contactPerson: formData.contactPerson || 'Responsable Export',
      contactPhone: formData.contactPhone || '+212 661 000 000',
      contactEmail: formData.contactEmail || '',

      consigneeName: formData.consigneeName || 'Destinataire Importateur',
      consigneeAddress: formData.consigneeAddress || 'Marché de Gros',
      consigneeCity: formData.consigneeCity || 'Rungis',
      consigneeCountry: formData.consigneeCountry || 'France',
      consigneeVatEori: formData.consigneeVatEori || 'FR99482019482',
      notifyParty: formData.notifyParty || '',

      transportMode: formData.transportMode || 'road_reefer',
      carrierName: formData.carrierName || 'AgriFret Frigo Maroc',
      truckPlateNumber: formData.truckPlateNumber || '12345-A-33',
      trailerPlateNumber: formData.trailerPlateNumber || 'REM-1234',
      sealNumber: formData.sealNumber || 'BADR-PL-000000',
      temperatureSetpointC: Number(formData.temperatureSetpointC) || 8.0,
      temperatureMinC: Number(formData.temperatureMinC) || 7.0,
      temperatureMaxC: Number(formData.temperatureMaxC) || 10.0,
      dataloggerNumber: formData.dataloggerNumber || 'USB-LOGGER-01',
      portOfLoading: formData.portOfLoading || 'Port Tanger Med',
      portOfDischarge: formData.portOfDischarge || 'Port d\'Algésiras',
      customsOffice: formData.customsOffice || 'Bureau Douane Tanger Med (Code 400)',
      dumNumber: formData.dumNumber || 'DUM-2026-400-000000-X',
      cmrNumber: formData.cmrNumber || 'CMR-MA-001',

      items: formItems,

      phytosanitaryCertificateNumber: formData.phytosanitaryCertificateNumber || 'ONSSA-PHYTO-EXP-2026-001',
      foodexInspectionCertificate: formData.foodexInspectionCertificate || 'FOODEX-CERT-2026-001',
      eur1CertificateNumber: formData.eur1CertificateNumber || '',
      isGlobalGapCertified: formData.isGlobalGapCertified ?? true,
      isOrganicBio: formData.isOrganicBio ?? false,
      isResidueCompliant: formData.isResidueCompliant ?? true,
      quarantinePestFree: formData.quarantinePestFree ?? true,
      specialHandlingNotes: formData.specialHandlingNotes || '',

      totalPallets,
      totalPackages,
      totalNetWeightKg,
      totalGrossWeightKg,

      qualityManagerName: formData.qualityManagerName || 'Responsable Qualité',
      driverSignatureName: formData.driverSignatureName || 'Chauffeur TIR',
      inspectorName: formData.inspectorName || 'Contrôleur ONSSA / Foodex',
      notes: formData.notes || '',
    };

    if (editingManifestId) {
      updateExportManifest(editingManifestId, baseData);
      setActiveExportManifestId(editingManifestId);
    } else {
      const created = createExportManifest(baseData);
      setActiveExportManifestId(created.id);
    }
    setViewMode('preview');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-800/80 border border-emerald-700 text-emerald-300">
              <FileText className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-200 border border-emerald-700 uppercase tracking-wider">
                  Conformité Export & Douane
                </span>
                <span className="text-[11px] text-emerald-300 font-medium">
                  Morocco Foodex • ONSSA • Douane BADR
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                Générateur de Manifestes d'Expédition & Export (PDF A4 Officiel)
              </h2>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-emerald-950/60 p-1 border border-emerald-800">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'dashboard'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Manifestes ({exportManifests.length})
              </button>
              {activeManifest && (
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === 'preview'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  Aperçu Document
                </button>
              )}
              <button
                onClick={() => initForm()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'form'
                    ? 'bg-amber-500 text-stone-900 shadow-xs'
                    : 'text-amber-300 hover:text-amber-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau
              </button>
            </div>

            <button
              onClick={() => setIsExportManifestModalOpen(false)}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800/80 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto bg-stone-50/50 p-4 sm:p-6">
          
          {/* =========================================================================
              VIEW 1: DASHBOARD / LISTE DES MANIFESTES
          ========================================================================= */}
          {viewMode === 'dashboard' && (
            <div className="space-y-5">
              
              {/* Metric Banners */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">Total Manifestes Émis</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-stone-900">{exportManifests.length}</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">expéditions</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">Tonnage Total Traçé</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-emerald-700">{totalTonnage.toFixed(1)}</span>
                    <span className="text-[11px] text-stone-600 font-semibold">Tonnes</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">En Route Frigorifique</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-blue-700">{activeReefers}</span>
                    <span className="text-[11px] text-blue-600 font-semibold">camions TIR</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <span className="text-[11px] text-stone-500 font-medium block">Dédouanés Port Tanger Med</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-amber-700">{clearedManifests}</span>
                    <span className="text-[11px] text-amber-600 font-semibold">BADR DUM</span>
                  </div>
                </div>
              </div>

              {/* Action & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par n° manifeste, produit, station, importateur, code SH..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterDestination}
                    onChange={e => setFilterDestination(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-hidden"
                  >
                    <option value="all">Toutes destinations</option>
                    <option value="international">Export International</option>
                    <option value="inter_regional">Transit Inter-Régional (Maroc)</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium focus:outline-hidden"
                  >
                    <option value="all">Tous statuts</option>
                    <option value="customs_cleared">Validé Douane (BADR)</option>
                    <option value="in_transit">En Transit</option>
                    <option value="inspected">Inspecté Foodex/ONSSA</option>
                    <option value="draft">Brouillon</option>
                  </select>

                  <button
                    onClick={() => initForm()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    Créer Manifeste
                  </button>
                </div>
              </div>

              {/* Manifests Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredManifests.map(manifest => {
                  const statusColors: Record<ExportManifestStatus, string> = {
                    draft: 'bg-stone-100 text-stone-700 border-stone-200',
                    inspected: 'bg-blue-50 text-blue-800 border-blue-200',
                    customs_cleared: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    in_transit: 'bg-amber-50 text-amber-800 border-amber-200',
                    delivered: 'bg-purple-50 text-purple-800 border-purple-200',
                  };

                  const statusLabels: Record<ExportManifestStatus, string> = {
                    draft: 'Brouillon',
                    inspected: 'Inspecté ONSSA / Foodex',
                    customs_cleared: 'Dédouané BADR',
                    in_transit: 'En Transit Frigo',
                    delivered: 'Livré & Conforme',
                  };

                  return (
                    <div
                      key={manifest.id}
                      className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-stone-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {manifest.manifestNumber}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  statusColors[manifest.status]
                                }`}
                              >
                                {statusLabels[manifest.status]}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-stone-900 mt-1">
                              {manifest.items.map(i => i.commodity).join(', ')}
                            </h3>
                          </div>

                          <span className="text-[11px] text-stone-500 font-medium">
                            {manifest.issueDate}
                          </span>
                        </div>

                        {/* Origin -> Destination Route */}
                        <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-stone-600">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                              {manifest.exporterName.slice(0, 32)}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {manifest.originRegion.split('(')[0]}
                            </span>
                          </div>
                          <div className="flex items-center justify-center text-stone-400">
                            <div className="h-px bg-stone-200 flex-1" />
                            <span className="px-2 text-[10px] font-mono text-stone-500 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-stone-500" />
                              {manifest.carrierName} ({manifest.truckPlateNumber})
                            </span>
                            <div className="h-px bg-stone-200 flex-1" />
                          </div>
                          <div className="flex items-center justify-between text-stone-800 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-blue-600" />
                              {manifest.consigneeName.slice(0, 32)}
                            </span>
                            <span className="text-[11px] text-blue-700 font-bold">
                              {manifest.consigneeCity}, {manifest.consigneeCountry}
                            </span>
                          </div>
                        </div>

                        {/* Cargo Metrics Grid */}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">Poids Net</span>
                            <span className="font-bold text-emerald-800 font-mono">
                              {(manifest.totalNetWeightKg / 1000).toFixed(2)} T
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">Colis / Palettes</span>
                            <span className="font-bold text-stone-800">
                              {manifest.totalPackages} ({manifest.totalPallets} P)
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">T° Consigne</span>
                            <span className="font-bold text-amber-700 font-mono">
                              +{manifest.temperatureSetpointC}°C
                            </span>
                          </div>
                        </div>

                        {/* Badges / Compliance tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Phyto ONSSA
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-medium border border-blue-100 flex items-center gap-1">
                            <FileCheck className="w-3 h-3 text-blue-600" />
                            Morocco Foodex
                          </span>
                          {manifest.dumNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono font-medium border border-amber-100">
                              BADR {manifest.dumNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveExportManifestId(manifest.id);
                            setViewMode('preview');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Consulter / Imprimer
                        </button>

                        <button
                          onClick={() => downloadExportManifestPdf(manifest)}
                          title="Télécharger le fichier PDF officiel"
                          className="flex items-center justify-center p-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => initForm(manifest)}
                          title="Modifier le manifeste"
                          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer le manifeste ${manifest.manifestNumber} ?`)) {
                              deleteExportManifest(manifest.id);
                            }
                          }}
                          title="Supprimer"
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredManifests.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200 p-6">
                  <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700">Aucun manifeste ne correspond à vos filtres</p>
                  <p className="text-xs text-stone-500 mt-1">Vous pouvez réinitialiser la recherche ou créer une nouvelle expédition.</p>
                  <button
                    onClick={() => initForm()}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un nouveau Manifeste
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 2: APERÇU A4 OFFICIEL / PRINT / DOWNLOAD / SHARE
          ========================================================================= */}
          {viewMode === 'preview' && activeManifest && (
            <div className="space-y-4">
              {/* Action Toolbar */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition"
                  >
                    ← Liste Manifestes
                  </button>
                  <span className="text-xs font-bold text-stone-900 font-mono px-2 py-1 bg-stone-100 rounded-md">
                    {activeManifest.manifestNumber}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Language Selector */}
                  <div className="flex items-center rounded-lg bg-stone-100 p-0.5 border border-stone-200 text-xs font-medium">
                    <button
                      onClick={() => setDocLanguage('fr')}
                      className={`px-2 py-1 rounded-md transition ${
                        docLanguage === 'fr' ? 'bg-white shadow-2xs font-bold text-emerald-900' : 'text-stone-600'
                      }`}
                    >
                      FR
                    </button>
                    <button
                      onClick={() => setDocLanguage('en')}
                      className={`px-2 py-1 rounded-md transition ${
                        docLanguage === 'en' ? 'bg-white shadow-2xs font-bold text-emerald-900' : 'text-stone-600'
                      }`}
                    >
                      EN (Douanes UE)
                    </button>
                    <button
                      onClick={() => setDocLanguage('ar')}
                      className={`px-2 py-1 rounded-md transition ${
                        docLanguage === 'ar' ? 'bg-white shadow-2xs font-bold text-emerald-900' : 'text-stone-600'
                      }`}
                    >
                      العربية
                    </button>
                  </div>

                  {/* Direct PDF Download Button */}
                  <button
                    onClick={() => downloadExportManifestPdf(activeManifest)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger PDF (.pdf)
                  </button>

                  {/* Print / Save as PDF Button */}
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimer (A4)
                  </button>

                  {/* Gmail Share Button */}
                  <button
                    onClick={() => handleSendViaGmail(activeManifest)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    Envoyer par Gmail
                  </button>

                  {/* Edit Form */}
                  <button
                    onClick={() => initForm(activeManifest)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-900 font-bold">Changer le statut :</span>
                  <select
                    value={activeManifest.status}
                    onChange={e => updateExportManifest(activeManifest.id, { status: e.target.value as ExportManifestStatus })}
                    className="px-2.5 py-1 rounded-md bg-white border border-emerald-300 text-emerald-900 font-semibold text-xs focus:outline-hidden"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="inspected">Inspecté ONSSA / Foodex</option>
                    <option value="customs_cleared">Validé Douane (BADR)</option>
                    <option value="in_transit">En Transit Frigorifique</option>
                    <option value="delivered">Livre / Réceptionné</option>
                  </select>
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  Numéro DUM BADR : <span className="font-mono font-bold">{activeManifest.dumNumber || 'DUM-EN-COURS'}</span>
                </div>
              </div>

              {/* PRINTABLE A4 SHEET CONTAINER */}
              <div className="flex justify-center">
                <div
                  id="printable-export-manifest"
                  className="w-full max-w-[210mm] bg-white border border-stone-300 shadow-xl p-6 sm:p-8 rounded-xl relative text-stone-900 font-sans"
                  style={{ minHeight: '297mm' }}
                >
                  {/* Top Green Banner */}
                  <div className="bg-emerald-900 text-white p-4 rounded-lg flex items-center justify-between border-l-8 border-red-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                        <AppLogoIcon size={38} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block">
                          ROYAUME DU MAROC — MINISTÈRE DE L'AGRICULTURE
                        </span>
                        <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                          {docLanguage === 'en'
                            ? 'PRODUCE EXPORT & SHIPPING MANIFEST'
                            : docLanguage === 'ar'
                            ? 'بيان الشحن والتصدير للمنتجات الفلاحية'
                            : 'MANIFESTE D\'EXPÉDITION & EXPORT PRODUITS AGRICOLES'}
                        </h1>
                        <span className="text-[10px] text-emerald-300 font-medium">
                          ONSSA (Sécurité Sanitaire) • Morocco Foodex (EACCE) • Douane Marocaine (Port BADR)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md bg-white text-emerald-950 uppercase border border-emerald-300">
                        {String(activeManifest?.status || 'DRAFT').replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-[9px] text-emerald-300 mt-1">
                        {activeManifest.destinationType === 'international' ? 'EXPORTATION INTERNATIONALE' : 'TRANSIT NATIONAL INTER-RÉGIONAL'}
                      </p>
                    </div>
                  </div>

                  {/* Manifest Reference Block */}
                  <div className="mt-4 p-3 rounded-lg bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">N° MANIFESTE</span>
                      <p className="font-mono font-bold text-emerald-900 text-sm">{activeManifest.manifestNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">DATE ÉMISSION</span>
                      <p className="font-semibold text-stone-900">{activeManifest.issueDate}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">DÉPART PRÉVU</span>
                      <p className="font-semibold text-stone-900">{activeManifest.departureDate}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">ARRIVÉE ESTIMÉE</span>
                      <p className="font-semibold text-stone-900">{activeManifest.estimatedArrivalDate}</p>
                    </div>
                  </div>

                  {/* 2-Columns : Exporter & Consignee */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Exporter Box */}
                    <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-200 text-emerald-900 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>1. EXPÉDITEUR / STATION AGRÉÉE (MAROC)</span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm">{activeManifest.exporterName}</p>
                      <p className="text-stone-600 font-mono text-[11px]">
                        ICE : {activeManifest.exporterICE} • RC : {activeManifest.exporterRC}
                      </p>
                      <p className="text-stone-600">
                        Agrément Station ONSSA : <span className="font-semibold text-emerald-900">{activeManifest.onssaApprovalNumber}</span>
                      </p>
                      <p className="text-stone-600">
                        Agrément Morocco Foodex : <span className="font-semibold text-emerald-900">{activeManifest.foodexApprovalNumber}</span>
                      </p>
                      <p className="text-stone-600">{activeManifest.exporterAddress}, {activeManifest.exporterCity}</p>
                      <p className="text-stone-600">Région : {activeManifest.originRegion}</p>
                      <p className="text-stone-600 font-medium">Contact : {activeManifest.contactPerson} ({activeManifest.contactPhone})</p>
                    </div>

                    {/* Consignee Box */}
                    <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/30 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-blue-200 text-blue-900 font-bold">
                        <Globe className="w-3.5 h-3.5 text-blue-700" />
                        <span>2. DESTINATAIRE / IMPORTATEUR CONSIGNÉ</span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm">{activeManifest.consigneeName}</p>
                      <p className="text-stone-600">
                        Pays : <span className="font-bold text-stone-900">{activeManifest.consigneeCountry}</span> • Ville : {activeManifest.consigneeCity}
                      </p>
                      <p className="text-stone-600 font-mono text-[11px]">
                        EORI / N° TVA : <span className="font-bold text-blue-900">{activeManifest.consigneeVatEori}</span>
                      </p>
                      <p className="text-stone-600">Adresse : {activeManifest.consigneeAddress}</p>
                      {activeManifest.notifyParty && (
                        <p className="text-stone-600">Transitaire notifié : {activeManifest.notifyParty}</p>
                      )}
                      <p className="text-stone-600">Port / Déchargement : {activeManifest.portOfDischarge}</p>
                      <p className="text-blue-800 font-medium">Régime Douanier : Dédouanement à destination</p>
                    </div>
                  </div>

                  {/* Transport & Refrigeration Specifications */}
                  <div className="mt-4 p-3.5 rounded-lg border border-stone-200 bg-stone-50/70 text-xs">
                    <div className="flex items-center gap-1.5 pb-1.5 border-b border-stone-200 font-bold text-stone-900">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>3. SPÉCIFICATIONS TRANSPORT, FRIGO & PASSAGE PORTUAIRE</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Transporteur</span>
                        <p className="font-bold text-stone-900">{activeManifest.carrierName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Tracteur / Remorque</span>
                        <p className="font-mono font-bold text-stone-800">
                          {activeManifest.truckPlateNumber} / {activeManifest.trailerPlateNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Température Consigne</span>
                        <p className="font-bold text-emerald-800 font-mono flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                          +{activeManifest.temperatureSetpointC}°C ({activeManifest.temperatureMinC}°C à {activeManifest.temperatureMaxC}°C)
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Plomb Douane BADR</span>
                        <p className="font-mono font-bold text-red-700">{activeManifest.sealNumber}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 pt-2 border-t border-stone-200/60">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Port Embarquement</span>
                        <p className="font-medium text-stone-800">{activeManifest.portOfLoading}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Bureau Douanier</span>
                        <p className="font-medium text-stone-800">{activeManifest.customsOffice}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Datalogger USB</span>
                        <p className="font-mono font-medium text-stone-800">{activeManifest.dataloggerNumber || 'Actif'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Lettre CMR / B/L</span>
                        <p className="font-mono font-medium text-stone-800">{activeManifest.cmrNumber || 'CMR-DIRECT'}</p>
                      </div>
                    </div>
                  </div>

                  {/* CARGO TABLE */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between pb-1 text-xs font-bold text-stone-900">
                      <span className="flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-emerald-700" />
                        4. DÉSIGNATION DES MARCHANDISES, LOTS & POIDS
                      </span>
                      <span className="text-[11px] text-stone-500 font-normal">
                        Règlements CEE-ONU & Normes d'Emballage Export
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-stone-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-emerald-900 text-white text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-2">Produit & Variété</th>
                            <th className="p-2">Code SH</th>
                            <th className="p-2">Calibre / Cat.</th>
                            <th className="p-2">N° Lot & Parcelle</th>
                            <th className="p-2">Emballage</th>
                            <th className="p-2 text-right">Colis</th>
                            <th className="p-2 text-right">Palettes</th>
                            <th className="p-2 text-right">Poids Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {activeManifest.items.map((item, idx) => (
                            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                              <td className="p-2">
                                <p className="font-bold text-stone-900">{item.commodity}</p>
                                <p className="text-[10px] text-stone-500">Var. {item.variety}</p>
                              </td>
                              <td className="p-2 font-mono font-bold text-emerald-900 text-[11px]">
                                {item.hsCode}
                              </td>
                              <td className="p-2">
                                <span className="font-semibold text-stone-800">{item.qualityClass}</span>
                                <span className="block text-[10px] text-stone-500">{item.calibre}</span>
                              </td>
                              <td className="p-2">
                                <span className="font-mono font-bold text-amber-800">{item.lotNumber}</span>
                                <span className="block text-[10px] text-stone-500">{item.originPlot || 'Station'}</span>
                              </td>
                              <td className="p-2 text-stone-700 text-[11px]">{item.packagingType}</td>
                              <td className="p-2 text-right font-bold text-stone-900">{item.packagesCount.toLocaleString()}</td>
                              <td className="p-2 text-right font-bold text-stone-900">{item.palletsCount}</td>
                              <td className="p-2 text-right font-mono font-bold text-emerald-900">
                                {item.netWeightKg.toLocaleString()} kg
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-emerald-50 border-t-2 border-emerald-300 font-bold text-xs text-emerald-950">
                          <tr>
                            <td colSpan={5} className="p-2 uppercase tracking-wide">
                              TOTAUX CHARGEMENT :
                            </td>
                            <td className="p-2 text-right">{activeManifest.totalPackages.toLocaleString()}</td>
                            <td className="p-2 text-right">{activeManifest.totalPallets}</td>
                            <td className="p-2 text-right font-mono text-sm text-emerald-900">
                              {(activeManifest.totalNetWeightKg / 1000).toFixed(2)} T ({activeManifest.totalNetWeightKg.toLocaleString()} kg)
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Certifications & Declarations Box */}
                  <div className="mt-4 p-3 rounded-lg border border-stone-200 bg-stone-50 text-xs">
                    <span className="font-bold text-stone-900 block pb-1 border-b border-stone-200">
                      5. CERTIFICATIONS SANITAIRES, AGRÉMENTS & DÉCLARATIONS DE CONFORMITÉ
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-emerald-900">✓ Certificat Phytosanitaire ONSSA : </span>
                        <span className="font-mono font-bold">{activeManifest.phytosanitaryCertificateNumber}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-900">✓ Certificat d'Inspection Foodex : </span>
                        <span className="font-mono font-bold">{activeManifest.foodexInspectionCertificate}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-900">✓ Certificat d'Origine EUR.1 : </span>
                        <span className="font-mono font-bold">{activeManifest.eur1CertificateNumber || 'Non requis (Marché local)'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-900">✓ GlobalG.A.P / Bonnes Pratiques : </span>
                        <span className="font-semibold text-stone-800">Conforme (GGN Validé)</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-stone-600 space-y-0.5 pt-1.5 border-t border-stone-200/60">
                      <p>• Résidus phytosanitaires : Produits conformes aux LMR de l'Union Européenne et à la loi 28-07.</p>
                      <p>• Organismes de quarantaine : Envoi contrôlé et exempt de Tuta absoluta, Bactrocera dorsalis et ToBRFV.</p>
                      {activeManifest.specialHandlingNotes && (
                        <p className="font-medium text-amber-800">• Note particulière : {activeManifest.specialHandlingNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Signatures & Official Stamps (3 columns) */}
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                    {/* Quality Assurance */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">VISA RESP. QUALITÉ</span>
                      <p className="font-bold text-stone-900 mt-1">{activeManifest.qualityManagerName}</p>
                      <p className="text-[10px] text-stone-500">Signature & Visa Station :</p>
                      <div className="mt-3 text-center py-2 border border-dashed border-emerald-300 rounded-md bg-emerald-50/50 text-[10px] text-emerald-800 font-mono font-bold">
                        [Cachet Numérique Validé]
                      </div>
                    </div>

                    {/* Carrier Driver */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">CHAUFFEUR / FRET TIR</span>
                      <p className="font-bold text-stone-900 mt-1">{activeManifest.driverSignatureName || 'Chauffeur Agréé'}</p>
                      <p className="text-[10px] text-stone-500">Marchandise prise en charge :</p>
                      <div className="mt-3 text-center py-2 border border-dashed border-stone-300 rounded-md bg-stone-50 text-[10px] text-stone-700 font-mono">
                        T° départ : +{activeManifest.temperatureSetpointC}°C
                      </div>
                    </div>

                    {/* Customs / Foodex Stamp */}
                    <div className="p-2.5 rounded-lg border border-stone-200 bg-white flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stone-500 block">DOUANE / MOROCCO FOODEX</span>
                        <p className="text-[10px] text-stone-600 mt-0.5">{activeManifest.customsOffice}</p>
                      </div>
                      <div className="my-1 border-2 border-red-700 rounded-md p-1.5 text-center bg-red-50/50">
                        <span className="text-[9px] font-black uppercase text-red-800 block">BON POUR EMBARQUEMENT</span>
                        <span className="text-[8px] font-mono text-red-700 block">PORT TANGER MED</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Legal Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-md bg-white border border-stone-300 shadow-2xs">
                        <BatchQRCodeSvg
                          value={`https://agristock.ma/manifest/${activeManifest.manifestNumber}`}
                          size={46}
                          fgColor="#062817"
                        />
                      </div>
                      <div className="text-[10px] text-stone-500">
                        <p className="font-mono font-bold text-stone-800">{activeManifest.manifestNumber}</p>
                        <p>Scannez pour vérification douanière en temps réel (DUM & Badging BADR).</p>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-stone-400">
                      <p>Système Intégré de Traçabilité Agricole AgriStock Maroc</p>
                      <p className="font-mono text-[9px] text-emerald-800">
                        SHA-256 : [ONSSA-{activeManifest.manifestNumber.replace(/[^A-Z0-9]/g, '')}-MA]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: CRÉATION / MODIFICATION D'UN MANIFESTE D'EXPORTATION
          ========================================================================= */}
          {viewMode === 'form' && (
            <form onSubmit={handleSaveForm} className="space-y-5 bg-white p-5 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-stone-900">
                    {editingManifestId ? 'Modifier le Manifeste d\'Expédition' : 'Créer un Nouveau Manifeste d\'Exportation'}
                  </h3>
                </div>

                {/* Pre-fill from Produce Listings dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Préremplir depuis une annonce :</span>
                  <select
                    onChange={e => {
                      const selected = produceListings.find(l => l.id === e.target.value);
                      if (selected) {
                        setFormData(prev => ({
                          ...prev,
                          exporterName: selected.sellerName,
                          exporterAddress: `Périmètre de ${selected.locationCity}`,
                          exporterCity: selected.locationCity,
                          originRegion: selected.region,
                          contactPerson: selected.sellerName,
                          contactPhone: selected.phone,
                          onssaApprovalNumber: selected.phytosanitaryPassport || 'ST-ONSSA-SM-2024-0088',
                        }));

                        // Match HS Code
                        const matchedHS = COMMON_MOROCCAN_PRODUCE_HS_CODES.find(h =>
                          selected.title.toLowerCase().includes(h.category.toLowerCase()) ||
                          selected.variety.toLowerCase().includes(h.commodityFr.toLowerCase())
                        ) || COMMON_MOROCCAN_PRODUCE_HS_CODES[0];

                        let netWeight = 20000;
                        if (selected.unit === 'Tonnes') netWeight = selected.quantityAvailable * 1000;
                        else if (selected.unit === 'Kg') netWeight = selected.quantityAvailable;

                        setFormItems([
                          {
                            id: `item-${Date.now()}`,
                            commodity: selected.title,
                            variety: selected.variety,
                            hsCode: matchedHS.hsCode,
                            qualityClass: 'Catégorie I',
                            calibre: selected.calibre || 'Calibre 1',
                            lotNumber: selected.batchNumber || `LOT-2026-PRD-${Math.floor(100 + Math.random() * 899)}`,
                            packagingType: selected.packaging || matchedHS.standardPackaging,
                            packagesCount: Math.round(netWeight / 6),
                            palletsCount: Math.min(30, Math.round(netWeight / 700)),
                            netWeightKg: netWeight,
                            grossWeightKg: Math.round(netWeight * 1.075),
                            globalGapGgn: '4052899482103',
                            originPlot: `Parcelle ${selected.locationCity}`,
                          },
                        ]);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 focus:outline-hidden"
                  >
                    <option value="">Sélectionner une annonce...</option>
                    {produceListings.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.quantityAvailable} {l.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 1 : Destination & Type */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  1. Destination & Calendrier d'Expédition
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-stone-600 block mb-1">Type d'expédition *</label>
                    <select
                      value={formData.destinationType || 'international'}
                      onChange={e => setFormData({ ...formData, destinationType: e.target.value as ExportDestinationType })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-medium"
                    >
                      <option value="international">Export International (UE / UK / Golfe / US)</option>
                      <option value="inter_regional">Transit Inter-Régional (National Maroc)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-stone-600 block mb-1">Date d'émission *</label>
                    <input
                      type="date"
                      value={formData.issueDate || ''}
                      onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-stone-600 block mb-1">Date départ prévu *</label>
                    <input
                      type="date"
                      value={formData.departureDate || ''}
                      onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-stone-600 block mb-1">Date arrivée estimée *</label>
                    <input
                      type="date"
                      value={formData.estimatedArrivalDate || ''}
                      onChange={e => setFormData({ ...formData, estimatedArrivalDate: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 : Exporter & Consignee */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  2. Expéditeur (Station Marocaine) & Destinataire (Importateur)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Exporter Fields */}
                  <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-2.5">
                    <span className="font-bold text-emerald-900 block">Station de Conditionnement / Expéditeur</span>
                    <div>
                      <label className="text-stone-600 block mb-0.5">Raison Sociale *</label>
                      <input
                        type="text"
                        value={formData.exporterName || ''}
                        onChange={e => setFormData({ ...formData, exporterName: e.target.value })}
                        className="w-full p-2 rounded-lg bg-white border border-stone-200 font-semibold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-600 block mb-0.5">ICE (15 chiffres) *</label>
                        <input
                          type="text"
                          value={formData.exporterICE || ''}
                          onChange={e => setFormData({ ...formData, exporterICE: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-600 block mb-0.5">Agrément Station ONSSA *</label>
                        <input
                          type="text"
                          value={formData.onssaApprovalNumber || ''}
                          onChange={e => setFormData({ ...formData, onssaApprovalNumber: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200 font-mono"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-600 block mb-0.5">N° EACCE / Foodex</label>
                        <input
                          type="text"
                          value={formData.foodexApprovalNumber || ''}
                          onChange={e => setFormData({ ...formData, foodexApprovalNumber: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-600 block mb-0.5">Ville d'implantation *</label>
                        <input
                          type="text"
                          value={formData.exporterCity || ''}
                          onChange={e => setFormData({ ...formData, exporterCity: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consignee Fields */}
                  <div className="p-3 rounded-lg bg-blue-50/40 border border-blue-200 space-y-2.5">
                    <span className="font-bold text-blue-900 block">Destinataire / Importateur Consigné</span>
                    <div>
                      <label className="text-stone-600 block mb-0.5">Raison Sociale / Entité réceptrice *</label>
                      <input
                        type="text"
                        value={formData.consigneeName || ''}
                        onChange={e => setFormData({ ...formData, consigneeName: e.target.value })}
                        className="w-full p-2 rounded-lg bg-white border border-stone-200 font-semibold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-600 block mb-0.5">Pays de destination *</label>
                        <input
                          type="text"
                          value={formData.consigneeCountry || ''}
                          onChange={e => setFormData({ ...formData, consigneeCountry: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-600 block mb-0.5">Ville de livraison *</label>
                        <input
                          type="text"
                          value={formData.consigneeCity || ''}
                          onChange={e => setFormData({ ...formData, consigneeCity: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-600 block mb-0.5">N° EORI / TVA Intracommunautaire</label>
                        <input
                          type="text"
                          value={formData.consigneeVatEori || ''}
                          onChange={e => setFormData({ ...formData, consigneeVatEori: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-600 block mb-0.5">Port / Hub déchargement</label>
                        <input
                          type="text"
                          value={formData.portOfDischarge || ''}
                          onChange={e => setFormData({ ...formData, portOfDischarge: e.target.value })}
                          className="w-full p-2 rounded-lg bg-white border border-stone-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 : Transport & Reefer */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  3. Logistique Frigorifique & Contrôles Douaniers
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-stone-600 block mb-1">Transporteur Fret *</label>
                    <input
                      type="text"
                      value={formData.carrierName || ''}
                      onChange={e => setFormData({ ...formData, carrierName: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">Matricule Camion Tracteur *</label>
                    <input
                      type="text"
                      value={formData.truckPlateNumber || ''}
                      onChange={e => setFormData({ ...formData, truckPlateNumber: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">Semi-Remorque Frigo</label>
                    <input
                      type="text"
                      value={formData.trailerPlateNumber || ''}
                      onChange={e => setFormData({ ...formData, trailerPlateNumber: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">N° Plomb Douane (Scellé BADR) *</label>
                    <input
                      type="text"
                      value={formData.sealNumber || ''}
                      onChange={e => setFormData({ ...formData, sealNumber: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-mono font-bold text-red-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-stone-600 block mb-1">Température Consigne (°C) *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.temperatureSetpointC ?? 8.0}
                      onChange={e => setFormData({ ...formData, temperatureSetpointC: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-mono font-bold text-emerald-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">N° DUM Douane (BADR)</label>
                    <input
                      type="text"
                      value={formData.dumNumber || ''}
                      onChange={e => setFormData({ ...formData, dumNumber: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200 font-mono font-bold text-amber-800"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">Port Embarquement *</label>
                    <input
                      type="text"
                      value={formData.portOfLoading || ''}
                      onChange={e => setFormData({ ...formData, portOfLoading: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">Bureau Douanier Sortie *</label>
                    <input
                      type="text"
                      value={formData.customsOffice || ''}
                      onChange={e => setFormData({ ...formData, customsOffice: e.target.value })}
                      className="w-full p-2 rounded-lg bg-stone-50 border border-stone-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 4 : Produits & Lots */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    4. Lots de Produits, Codes SH & Emballage ({formItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un lot
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, index) => (
                    <div key={item.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                        <span className="font-bold text-stone-800">Lot #{index + 1}</span>
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-[11px] font-medium"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-stone-500 block mb-0.5">Code SH Standardisé *</label>
                          <select
                            value={item.hsCode}
                            onChange={e => handleHSCodeSelect(item.id, e.target.value)}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200 font-mono font-bold text-emerald-900"
                          >
                            {COMMON_MOROCCAN_PRODUCE_HS_CODES.map(h => (
                              <option key={h.hsCode} value={h.hsCode}>
                                {h.hsCode} - {h.commodityFr.split('(')[0]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Désignation Produit *</label>
                          <input
                            type="text"
                            value={item.commodity}
                            onChange={e => handleItemChange(item.id, 'commodity', e.target.value)}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200 font-semibold"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Variété</label>
                          <input
                            type="text"
                            value={item.variety}
                            onChange={e => handleItemChange(item.id, 'variety', e.target.value)}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200"
                          />
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Calibre</label>
                          <input
                            type="text"
                            value={item.calibre}
                            onChange={e => handleItemChange(item.id, 'calibre', e.target.value)}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="text-stone-500 block mb-0.5">N° de Lot Traçabilité *</label>
                          <input
                            type="text"
                            value={item.lotNumber}
                            onChange={e => handleItemChange(item.id, 'lotNumber', e.target.value)}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200 font-mono font-bold text-amber-800"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Type Emballage</label>
                          <input
                            type="text"
                            value={item.packagingType}
                            onChange={e => handleItemChange(item.id, 'packagingType', e.target.value)}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200"
                          />
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Nbre Colis / Caisses</label>
                          <input
                            type="number"
                            value={item.packagesCount}
                            onChange={e => handleItemChange(item.id, 'packagesCount', Number(e.target.value))}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Nbre Palettes</label>
                          <input
                            type="number"
                            value={item.palletsCount}
                            onChange={e => handleItemChange(item.id, 'palletsCount', Number(e.target.value))}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-stone-500 block mb-0.5">Poids Net (kg) *</label>
                          <input
                            type="number"
                            value={item.netWeightKg}
                            onChange={e => handleItemChange(item.id, 'netWeightKg', Number(e.target.value))}
                            className="w-full p-1.5 rounded-md bg-white border border-stone-200 font-mono font-bold text-emerald-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('dashboard')}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  {editingManifestId ? 'Enregistrer les modifications' : 'Générer le Manifeste PDF'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
