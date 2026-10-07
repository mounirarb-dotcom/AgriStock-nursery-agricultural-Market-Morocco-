import React, { useState } from 'react';
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
} from 'lucide-react';
import { NurseryLot, GrowthStage, ONSSAStatus } from '../types';
import { NurseryLotFormModal } from './NurseryLotFormModal';
import { BatchQRCodeModal } from './BatchQRCodeModal';
import { TreatmentModal } from './TreatmentModal';
import { RoleAccessRestrictedNotice } from './RoleAccessRestrictedNotice';
import { RealTimeDataDashboard } from './RealTimeDataDashboard';

export const NurseryDashboardView: React.FC = () => {
  const {
    language,
    userProfile,
    canManageNursery,
    switchActiveRole,
    nurseryLots,
    addNurseryLot,
    escrowTransactions,
    lowStockLots,
    setIsLowStockSettingsModalOpen,
    setIsQuickSyncModalOpen,
    setIsOfficialComplianceModalOpen,
    setActiveTab,
    addTreatmentLog,
    openExcelStockModal,
    openNurserySetupModal,
  } = useApp();

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

  const [activeSubTab, setActiveSubTab] = useState<'lots' | 'varieties' | 'passports' | 'orders' | 'treatments'>('lots');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLotForQR, setSelectedLotForQR] = useState<NurseryLot | null>(null);
  const [selectedLotForTreatment, setSelectedLotForTreatment] = useState<NurseryLot | null>(null);
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);

  // Commandes de plants via séquestre
  const nurseryOrders = escrowTransactions.filter(tx => tx.itemType === 'nursery_lot');

  // Filtrage des lots
  const filteredLots = nurseryLots.filter(lot => {
    const matchesCategory = categoryFilter === 'ALL' || lot.category.toLowerCase().includes(categoryFilter.toLowerCase());
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

      {/* NAVIGATION DES SOUS-ONGLETS PÉPINIÈRE */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab-nursery-lots"
            type="button"
            onClick={() => setActiveSubTab('lots')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'lots'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{tr(language, 'Lots & Stocks de Plants', 'دفعات ومخزون الشتلات', 'Lots & Stock')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {nurseryLots.length}
            </span>
          </button>

          <button
            id="tab-nursery-varieties"
            type="button"
            onClick={() => setActiveSubTab('varieties')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'varieties'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Trees className="w-4 h-4" />
            <span>{tr(language, 'Variétés & Porte-Greffes', 'الأصناف وحوامل الطعوم', 'Varieties & Rootstocks')}</span>
          </button>

          <button
            id="tab-nursery-passports"
            type="button"
            onClick={() => setActiveSubTab('passports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'passports'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{tr(language, 'Passeports ONSSA & Traçabilité', 'جوازات أونسا والتتبع', 'ONSSA Passports')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {certifiedONSSACount}
            </span>
          </button>

          <button
            id="tab-nursery-orders"
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{tr(language, 'Commandes Reçues', 'الطلبيات الواردة', 'Orders Received')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {nurseryOrders.length}
            </span>
          </button>
        </div>

        {/* Bouton d'accès au catalogue public des pépinières */}
        <button
          type="button"
          onClick={() => setActiveTab('nursery')}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl transition"
        >
          <span>{tr(language, 'Voir le Catalogue Public', 'عرض الكتالوج العام للمشاتل', 'View Public Catalog')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CONTENU DU SOUS-ONGLET 1 : LOTS & STOCKS */}
      {activeSubTab === 'lots' && (
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
                  {cat === 'ALL' ? tr(language, 'Toutes Catégories', 'كل الفئات', 'All Categories') : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tableau des lots */}
          <div className="overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-xs">
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
      )}

      {/* CONTENU DU SOUS-ONGLET 2 : VARIÉTÉS & PORTE-GREFFES */}
      {activeSubTab === 'varieties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.map(lot => (
            <div key={lot.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{lot.variety}</h3>
                  <p className="text-xs text-stone-500">{lot.species}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {lot.growthStage}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">{tr(language, 'Porte-greffe :', 'حامل الطعم :', 'Rootstock :')}</span>
                  <span className="font-semibold text-stone-900">{lot.rootstock || 'Semis direct'}</span>
                </div>
                {lot.graftingDate && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">{tr(language, 'Date de greffage :', 'تاريخ التطعيم :', 'Grafting Date :')}</span>
                    <span className="font-semibold text-stone-900">{lot.graftingDate}</span>
                  </div>
                )}
                {lot.expectedDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">{tr(language, 'Prêt à livrer le :', 'جاهز للتسليم في :', 'Ready on :')}</span>
                    <span className="font-semibold text-emerald-800">{lot.expectedDeliveryDate}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                <span className="text-stone-500">
                  {lot.quantityAvailable.toLocaleString()} {tr(language, 'plants disponibles', 'شتلة متوفرة', 'plants available')}
                </span>
                <span className="font-bold text-emerald-800 font-mono">
                  {lot.unitPriceMAD} MAD/plant
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENU DU SOUS-ONGLET 3 : PASSEPORTS ONSSA & TRAÇABILITÉ */}
      {activeSubTab === 'passports' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {tr(language, 'Registre Officiel des Passeports Phytosanitaires ONSSA', 'سجل جوازات المرور النباتية المعتمدة أونسا', 'Official ONSSA Phytosanitary Passport Registry')}
              </h2>
              <p className="text-xs text-stone-500">
                {tr(language, 'Traçabilité unitaire obligatoire pour la commercialisation et le transport des plants au Maroc.', 'تتبع قانوني وإلزامي لتسويق ونقل الشتلات داخل التراب الوطني بالمغرب.', 'Mandatory regulatory traceability for plant marketing and transit across Morocco.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {nurseryLots.filter(l => l.onssaStatus.includes('ONSSA')).map(lot => (
              <div key={lot.id} className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-blue-950">{lot.variety}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    {lot.batchNumber || 'LOT-2026'}
                  </span>
                </div>
                <div className="text-stone-600">
                  Passeport N° : <span className="font-mono font-bold text-stone-900">{lot.phytosanitaryPassportNumber || 'PASS-ONSSA-MA-2026-88'}</span>
                </div>
                <div className="text-stone-500 text-[11px]">
                  Catégorie : <span className="font-semibold text-stone-800">{lot.onssaStatus}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLotForQR(lot)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition text-[11px] cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{tr(language, 'Imprimer QR & Étiquette', 'طباعة الباركود والملصق', 'Print QR & Label')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENU DU SOUS-ONGLET 4 : COMMANDES REÇUES */}
      {activeSubTab === 'orders' && (
        <div className="space-y-3">
          {nurseryOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
              <Package className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-800">
                {tr(language, 'Aucune commande de plants en cours', 'لا توجد طلبيات شتلات حالياً', 'No current plant orders')}
              </p>
              <p className="text-xs text-stone-500">
                {tr(language, 'Dès qu\'un acheteur réserve un lot sous séquestre, il apparaîtra ici avec son bon de livraison.', 'عندما يقوم مشتري بحجز دفعة مع الدفع المضمون ستظهر هنا فوراً.', 'Orders placed by buyers will appear here with delivery details.')}
              </p>
            </div>
          ) : (
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
          )}
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
