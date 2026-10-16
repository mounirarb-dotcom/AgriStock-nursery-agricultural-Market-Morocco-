import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  Sprout,
  Trees,
  Flower2,
  ShieldCheck,
  Package,
  Plus,
  QrCode,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  RefreshCw,
  Eye,
  Sliders,
  Calendar,
  FileSpreadsheet,
  Database,
  Smartphone,
} from 'lucide-react';
import { NurseryLot, GrowthStage, ONSSAStatus } from '../types';
import { NurseryLotFormModal } from './NurseryLotFormModal';
import { BatchQRCodeModal } from './BatchQRCodeModal';
import { TreatmentModal } from './TreatmentModal';
import { RoleAccessRestrictedNotice } from './RoleAccessRestrictedNotice';
import { RealTimeDataDashboard } from './RealTimeDataDashboard';

interface NurseryDashboardContentProps {
  // Can be extended if needed
}

const NurseryDashboardContent: React.FC<NurseryDashboardContentProps> = () => {
  const {
    language,
    userProfile,
    nurseryLots,
    addNurseryLot,
    escrowTransactions,
    setIsQuickSyncModalOpen,
    setActiveTab,
    addTreatmentLog,
    openExcelStockModal,
    openNurserySetupModal,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [nurseryDatabaseFilter, setNurseryDatabaseFilter] = useState<'ALL' | 'FRUIT_TREES' | 'ORNAMENTAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLotForQR, setSelectedLotForQR] = useState<NurseryLot | null>(null);
  const [selectedLotForTreatment, setSelectedLotForTreatment] = useState<NurseryLot | null>(null);
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);

  // Commandes de plants via séquestre
  const nurseryOrders = escrowTransactions.filter(tx => tx.itemType === 'nursery_lot');

  // Filtrage des lots pépinières
  const filteredLots = nurseryLots.filter(lot => {
    const catLower = (lot.category || '').toLowerCase();
    const isOrnamental = catLower.includes('ornement') || !!lot.ornamentalDetails;
    if (nurseryDatabaseFilter === 'ORNAMENTAL' && !isOrnamental) return false;
    if (nurseryDatabaseFilter === 'FRUIT_TREES' && isOrnamental) return false;

    const matchesCategory = categoryFilter === 'ALL' || catLower.includes(categoryFilter.toLowerCase());
    const matchesSearch =
      lot.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.rootstock && lot.rootstock.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lot.batchNumber && lot.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculs statistiques
  const totalPlantsAvailable = nurseryLots.reduce((acc, l) => acc + l.quantityAvailable, 0);
  const totalPlantsReserved = nurseryLots.reduce((acc, l) => acc + l.quantityReserved, 0);
  const totalLotsCount = nurseryLots.length;
  const certifiedONSSACount = nurseryLots.filter(l => l.onssaStatus.includes('ONSSA')).length;
  const totalInventoryValueMAD = nurseryLots.reduce((acc, l) => acc + (l.quantityAvailable * l.unitPriceMAD), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER PÉPINIÉRISTE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e331b] via-[#144224] to-[#1c552f] p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                {tr(language, 'Espace Pépiniériste Agréé ONSSA', 'فضاء صاحب المشتل المعتمد', 'Certified Nursery Dashboard')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
                🛡️ {tr(language, 'Agrément Sanitaire & Traçabilité Lots', 'شهادة السلامة الصحية والتتبع', 'Sanitary Approval & Lot Traceability')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30 text-[11px] font-semibold flex items-center gap-1.5">
                <span>
                  {userProfile.nurseryDetails?.orientation === 'ornamental'
                    ? '🪴 ' + tr(language, 'Orientation : Pépinière Ornementale', 'التخصص : مشتل نباتات الزينة', 'Specialty: Ornamental Nursery')
                    : userProfile.nurseryDetails?.orientation === 'arboriculture'
                    ? '🌳 ' + tr(language, 'Orientation : Arboriculture Fruitière', 'التخصص : أشجار مثمرة وأغراس', 'Specialty: Fruit Trees & Orchards')
                    : '🌿 ' + tr(language, 'Orientation : Pépinière Polyvalente', 'التخصص : مشتل متعدد التخصصات', 'Specialty: Mixed / Polyvalent Nursery')}
                </span>
                <button
                  type="button"
                  onClick={openNurserySetupModal}
                  className="hover:underline text-teal-300 font-bold ml-1 cursor-pointer"
                  title={tr(language, 'Modifier la configuration de la pépinière', 'تعديل إعدادات وتخصص المشتل', 'Edit nursery setup')}
                >
                  ⚙️ {tr(language, 'Modifier', 'تعديل', 'Edit')}
                </button>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{userProfile.companyName || userProfile.displayName || tr(language, 'Pépinière Agricole Moderne', 'المشتل الفلاحي الحديث', 'Modern Plant Nursery')}</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              {tr(
                language,
                'Pilotez votre station pépinière, vos variétés et porte-greffes certifiés, vos passeports phytosanitaires ONSSA et vos livraisons de plants sous séquestre sécurisé.',
                'إدارة محطة المشتل، الأصناف وحوامل الطعوم المعتمدة، جوازات المرور الصحية وتتبع طلبيات تسليم الشتلات المؤمنة.',
                'Manage your certified nursery station, rootstocks, ONSSA phytosanitary passports, and plant deliveries with secured escrow.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {userProfile.region}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {tr(language, 'Agrément ONSSA : Catégorie Bleue / Jaune', 'اعتماد أونسا : الصنف الأزرق / الأصفر', 'ONSSA Approval: Blue/Yellow Category')}
              </span>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              id="btn-nursery-add-new-lot"
              type="button"
              onClick={() => setIsAddLotModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition shadow-lg cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{tr(language, 'Nouveau Lot de Plants', 'إضافة دفعة شتلات جديدة', 'New Plant Lot')}</span>
            </button>

            <div className="flex items-center gap-1.5 w-full">
              <button
                id="btn-nursery-excel-ornamental"
                type="button"
                onClick={() => openExcelStockModal('nursery_ornamental')}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-100 font-bold text-[11px] border border-emerald-400/30 transition cursor-pointer backdrop-blur-xs"
                title="Excel spécifique Pépinière Ornementale (Sans porte-greffes, Hauteur, Silhouette, Floraison, Conteneur)"
              >
                <span>🌸</span>
                <span>{tr(language, 'Excel Ornemental', 'إكسيل نباتات الزينة', 'Ornamental Excel')}</span>
              </button>

              <button
                id="btn-nursery-excel-bulk"
                type="button"
                onClick={() => openExcelStockModal('nursery')}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-[11px] border border-emerald-400/40 transition cursor-pointer backdrop-blur-xs"
                title="Excel Pépinière Arboriculture & Fruitiers (Porte-greffes, Greffage, Passeport ONSSA)"
              >
                <span>🌱</span>
                <span>{tr(language, 'Excel Arboricole', 'إكسيل أشجار مثمرة', 'Fruit Tree Excel')}</span>
              </button>
            </div>

            <button
              id="btn-nursery-sync-stock"
              type="button"
              onClick={() => setIsQuickSyncModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer backdrop-blur-xs"
            >
              <RefreshCw className="w-4 h-4 text-emerald-300" />
              <span>{tr(language, 'Sync Stock Journalière', 'تحديث المخزون اليومي', 'Daily Stock Sync')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS DU PÉPINIÉRISTE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 : Total Plants disponibles */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Plants Disponibles', 'الشتلات المتوفرة', 'Available Plants')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Trees className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalPlantsAvailable.toLocaleString()}</div>
          <p className="text-[11px] text-stone-500">
            + {totalPlantsReserved.toLocaleString()} {tr(language, 'réservés / sous contrat', 'محجوزة مسبقاً', 'reserved')}
          </p>
        </div>

        {/* Metric 2 : Lots certifiés ONSSA */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Lots Certifiés ONSSA', 'دفعات معتمدة أونسا', 'Certified ONSSA Lots')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{certifiedONSSACount} <span className="text-xs font-bold text-stone-500">/ {totalLotsCount} lots</span></div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {tr(language, 'Passeports sanitaires valides', 'جوازات صحية سارية', 'Valid sanitary passports')}
          </p>
        </div>

        {/* Metric 3 : Valeur marchande du stock */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Valeur du Stock', 'قيمة المخزون', 'Stock Inventory Value')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalInventoryValueMAD.toLocaleString()} <span className="text-xs font-bold text-stone-500">MAD</span></div>
          <p className="text-[11px] text-stone-500">
            {tr(language, 'Arboriculture, Maraîchage & Baies', 'أشجار، خضر ونباتات', 'Fruit trees & seedlings')}
          </p>
        </div>

        {/* Metric 4 : Commandes Séquestre Reçues */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Commandes Séquestre', 'طلبيات الزبناء المضمونة', 'Escrow Orders')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{nurseryOrders.length}</div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {tr(language, 'Paiements acheteurs consignés', 'دفعات المشترين محجوزة بنكياً', 'Buyer payments secured')}
          </p>
        </div>
      </div>

      {/* DASHBOARD DONNÉES TEMPS RÉEL (BOURSE CLIMAT, ONSSA, CMI ESCROW) */}
      <RealTimeDataDashboard nurseryId={userProfile.id || 'nurs-active-01'} region={userProfile.region} />

      {/* CONTENU PRINCIPAL : LOTS & STOCKS DE LA PÉPINIÈRE */}
      <div className="space-y-4">
        {/* Barre de recherche et filtre de catégorie */}
        <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={tr(
                language,
                'Rechercher par variété, espèce, porte-greffe, N° de lot...',
                'بحث حسب الصنف، النوع، حامل الطعم أو رقم الدفعة...',
                'Search by variety, rootstock, batch number...'
              )}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Arbres', 'Maraîch', 'Ornementale'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat === 'ALL'
                  ? tr(language, 'Toutes Catégories', 'كل الفئات', 'All Categories')
                  : cat}
              </button>
            ))}
          </div>
        </div>

          {/* SÉLECTEUR DE BASE DE DONNÉES PÉPINIÈRE (OPTIMISÉ MOBILE & TABLETTE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-emerald-500/40 text-white shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  {tr(language, 'Bases de Données Stocks Pépinière Agréée', 'قواعد بيانات مخزون المشاتل المعتمدة', 'Certified Nursery Stock Databases')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Pépinières ONSSA Uniquement
              </span>
            </div>

            {/* Boutons de sélection de Base Pépinière */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNurseryDatabaseFilter('ALL')}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                  nurseryDatabaseFilter === 'ALL'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm font-bold'
                    : 'bg-stone-850/80 border-stone-700/70 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Toutes Bases Pépinière</div>
                  <div className="text-[10px] text-stone-300">Inventaire Global</div>
                </div>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-black/30">
                  {nurseryLots.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setNurseryDatabaseFilter('FRUIT_TREES')}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                  nurseryDatabaseFilter === 'FRUIT_TREES'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm font-bold'
                    : 'bg-stone-850/80 border-stone-700/70 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">🌱 Base Arboricole & Fruitiers</div>
                  <div className="text-[10px] text-stone-300">Agrumes, Oliviers, Rosacées</div>
                </div>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-black/30">
                  {nurseryLots.filter(l => !l.category?.toLowerCase().includes('ornement') && !l.ornamentalDetails).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setNurseryDatabaseFilter('ORNAMENTAL')}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                  nurseryDatabaseFilter === 'ORNAMENTAL'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm font-bold'
                    : 'bg-stone-850/80 border-stone-700/70 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">🌸 Base Ornementale & Paysage</div>
                  <div className="text-[10px] text-stone-300">Palmiers, Bougainvilliers</div>
                </div>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-black/30">
                  {nurseryLots.filter(l => l.category?.toLowerCase().includes('ornement') || !!l.ornamentalDetails).length}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-900/60 text-xs">
              <span className="text-[11px] text-stone-300">
                Accès direct aux tables Excel & imports certifiés :
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openExcelStockModal(nurseryDatabaseFilter === 'ORNAMENTAL' ? 'nursery_ornamental' : 'nursery')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ouvrir Base en Plein Écran (Mobile)</span>
                </button>
              </div>
            </div>
          </div>

          {/* VUE CARTES MOBILES (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredLots.map(lot => (
              <div key={lot.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{lot.variety}</h4>
                    <p className="text-xs text-stone-500">{lot.species}</p>
                    {lot.batchNumber && (
                      <span className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold">
                        Lot: {lot.batchNumber}
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                    lot.onssaStatus.includes('Bleue')
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : lot.onssaStatus.includes('Jaune')
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {lot.onssaStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-50 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Porte-greffe :</span>
                    <strong className="text-stone-800">{lot.rootstock || 'Semis direct'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Stade Végétatif :</span>
                    <strong className="text-emerald-800">{lot.growthStage}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Quantité Dispo :</span>
                    <strong className="text-stone-900 font-mono text-sm">{lot.quantityAvailable.toLocaleString()}</strong>
                    <span className="text-[10px] text-stone-400"> / {lot.quantityTotal.toLocaleString()} total</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Prix Unitaire :</span>
                    <strong className="text-emerald-800 font-mono text-sm">{lot.unitPriceMAD} MAD</strong>
                    <span className="text-[10px] text-stone-400"> / plant</span>
                  </div>
                  {lot.phytosanitaryPassportNumber && (
                    <div className="col-span-2 pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 font-mono">Passeport ONSSA:</span>
                      <span className="font-bold text-stone-800 font-mono">{lot.phytosanitaryPassportNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setSelectedLotForQR(lot)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900 font-bold text-xs transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Code ONSSA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLotForTreatment(lot)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-bold text-xs transition cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Traitement</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau des lots Desktop (hidden md:block) */}
          <div className="hidden md:block overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">{tr(language, 'N° Lot & Variété', 'رقم الدفعة والصنف', 'Batch & Variety')}</th>
                    <th className="p-3.5">{tr(language, 'Porte-greffe & Stade', 'حامل الطعم والمرحلة', 'Rootstock & Stage')}</th>
                    <th className="p-3.5">{tr(language, 'Agrément ONSSA', 'شهادة أونسا', 'ONSSA Status')}</th>
                    <th className="p-3.5 text-right">{tr(language, 'Quantité Dispo', 'الكمية المتوفرة', 'Available Qty')}</th>
                    <th className="p-3.5 text-right">{tr(language, 'Prix Unitaire', 'السعر الفردي', 'Unit Price')}</th>
                    <th className="p-3.5 text-center">{tr(language, 'Actions & QR', 'إجراءات وباركود', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLots.map(lot => (
                    <tr key={lot.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900 text-sm">{lot.variety}</div>
                        <div className="text-[11px] text-stone-500">{lot.species}</div>
                        {lot.batchNumber && (
                          <span className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold">
                            {lot.batchNumber}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1">
                        <div className="font-semibold text-stone-800">
                          {lot.rootstock ? `PG: ${lot.rootstock}` : 'Franc / Semis direct'}
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {lot.growthStage}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          lot.onssaStatus.includes('Bleue')
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : lot.onssaStatus.includes('Jaune')
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {lot.onssaStatus}
                        </span>
                        {lot.phytosanitaryPassportNumber && (
                          <div className="text-[10px] text-stone-500 font-mono mt-1">
                            Pass: {lot.phytosanitaryPassportNumber}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono">
                        <span className="font-bold text-sm text-stone-900">
                          {lot.quantityAvailable.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-stone-500">
                          / {lot.quantityTotal.toLocaleString()} total
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-mono">
                        <span className="font-bold text-sm text-emerald-800">
                          {lot.unitPriceMAD} MAD
                        </span>
                        <div className="text-[10px] text-stone-500">
                          / plant
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLotForQR(lot)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 transition cursor-pointer"
                            title={tr(language, 'Afficher le QR Code de traçabilité ONSSA', 'عرض الباركود وتتبع الدفعة', 'Show QR Code')}
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedLotForTreatment(lot)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 transition cursor-pointer"
                            title={tr(language, 'Ajouter un traitement phytosanitaire', 'تسجيل معالجة صحية', 'Add Treatment')}
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* SECTION COMMANDES RÉSERVÉES & SÉQUESTRE */}
      {nurseryOrders.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            <span>{tr(language, 'Commandes de Plants Sous Séquestre', 'طلبيات الشتلات تحت الحجز المضمون', 'Escrow Plant Orders')}</span>
          </h3>
          <div className="space-y-3">
            {nurseryOrders.map(tx => (
              <div key={tx.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {tx.referenceNumber}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">{tx.itemTitle}</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Acheteur : <span className="font-semibold text-stone-800">{tx.buyerName}</span> — Destination : <span className="font-semibold text-stone-800">{tx.destinationCity}</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Quantité : <span className="font-mono font-bold text-stone-900">{tx.quantity.toLocaleString()} {tx.unit}</span> — Montant séquestre : <span className="font-mono font-bold text-emerald-800">{tx.totalPaidByBuyerMAD.toLocaleString()} MAD</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    🛡️ {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales associées */}
      {isAddLotModalOpen && (
        <NurseryLotFormModal
          isOpen={isAddLotModalOpen}
          onClose={() => setIsAddLotModalOpen(false)}
          onSave={(lotData) => {
            addNurseryLot(lotData);
            setIsAddLotModalOpen(false);
          }}
        />
      )}

      {selectedLotForQR && (
        <BatchQRCodeModal
          isOpen={true}
          onClose={() => setSelectedLotForQR(null)}
          lot={selectedLotForQR}
        />
      )}

      {selectedLotForTreatment && (
        <TreatmentModal
          isOpen={true}
          onClose={() => setSelectedLotForTreatment(null)}
          lot={selectedLotForTreatment}
          onAddTreatment={addTreatmentLog}
        />
      )}
    </div>
  );
};

export const NurseryDashboardView: React.FC = () => {
  const { language, canManageNursery } = useApp();

  if (!canManageNursery) {
    return (
      <RoleAccessRestrictedNotice
        requiredRole="nursery"
        title={tr(
          language,
          'Espace Pépiniériste Producteur Réservé',
          'فضاء خاص بالمشاتل والمنتجين المعتمدين',
          'Authorized Nursery Workspace'
        )}
        description={tr(
          language,
          "Cet espace de gestion d'exploitation (passeports sanitaires ONSSA, gestion des serres, traitements phytosanitaires et lots de plants) est strictement réservé aux pépiniéristes certifiés.",
          "هذا الفضاء مخصص لإدارة المشاتل وجوازات السلامة الصحية ONSSA وتتبع المعاملات.",
          "This station management space is reserved for certified nursery producers and authorized station managers."
        )}
      />
    );
  }

  return <NurseryDashboardContent />;
};
