import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/translations';
import { AgriB2BAd, AgriB2BAdCategory, AgriB2BAdStatus, AgriB2BAdPlacement } from '../../types';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  MousePointerClick,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Phone,
  MessageSquare,
  Leaf,
  Droplets,
  ShieldCheck,
  FlaskConical,
  Zap,
  Tag,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Check,
  X,
  Layers,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_OPTIONS: AgriB2BAdCategory[] = [
  'Engrais & Biostimulants',
  'Irrigation & Goutte-à-goutte',
  'Serres & Filets',
  'Analyses & Labo',
  'Machinisme & Tracteurs',
  'Emballage & Conditionnement',
  'Semences & Hybrides',
  'Énergie Solaire & Pompage',
];

const GRADIENT_PRESETS = [
  { id: 'from-emerald-900 via-stone-900 to-teal-950', label: 'Émeraude Végétal', color: 'bg-emerald-800' },
  { id: 'from-blue-950 via-stone-900 to-sky-950', label: 'Bleu Eau & Irrigation', color: 'bg-blue-800' },
  { id: 'from-amber-950 via-stone-900 to-emerald-950', label: 'Ambre Terre & Soleil', color: 'bg-amber-800' },
  { id: 'from-purple-950 via-stone-900 to-indigo-950', label: 'Pourpre Laboratoire', color: 'bg-purple-800' },
  { id: 'from-stone-900 via-stone-950 to-stone-900', label: 'Noir Carbone Minimaliste', color: 'bg-stone-800' },
  { id: 'from-rose-950 via-stone-900 to-amber-950', label: 'Ocre & Cuivre Fruits', color: 'bg-rose-800' },
];

const ICON_OPTIONS = [
  { id: 'Leaf', label: 'Feuille (Plante / Bio)', icon: Leaf },
  { id: 'Droplets', label: 'Gouttes (Irrigation / Eau)', icon: Droplets },
  { id: 'ShieldCheck', label: 'Bouclier (Protection / Certif)', icon: ShieldCheck },
  { id: 'FlaskConical', label: 'Fiole (Analyse / Chimie)', icon: FlaskConical },
  { id: 'Zap', label: 'Éclair (Énergie / Solaire)', icon: Zap },
  { id: 'Tag', label: 'Tag (Promo / Machinisme)', icon: Tag },
  { id: 'Sparkles', label: 'Étoiles (Premium / Spécial)', icon: Sparkles },
];

export const AdminAdsManagementView: React.FC = () => {
  const {
    language,
    b2bAds,
    addB2BAd,
    updateB2BAd,
    deleteB2BAd,
    toggleB2BAdStatus,
    resetB2BAdsToDefault,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | AgriB2BAdStatus>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State (Create / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Form Fields
  const [formBrandName, setFormBrandName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<AgriB2BAdCategory>('Engrais & Biostimulants');
  const [formBadgeText, setFormBadgeText] = useState('Partenaire Homologué');
  const [formCtaText, setFormCtaText] = useState('Commander avec remise');
  const [formContactPhone, setFormContactPhone] = useState('+212 ');
  const [formContactWhatsapp, setFormContactWhatsapp] = useState('+212 ');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formPromoCode, setFormPromoCode] = useState('');
  const [formBannerGradient, setFormBannerGradient] = useState(GRADIENT_PRESETS[0].id);
  const [formIconName, setFormIconName] = useState('Leaf');
  const [formStatus, setFormStatus] = useState<AgriB2BAdStatus>('active');
  const [formPlacement, setFormPlacement] = useState<AgriB2BAdPlacement>('all');
  const [formMonthlyFeeMAD, setFormMonthlyFeeMAD] = useState<number>(2500);
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formNotesAdmin, setFormNotesAdmin] = useState('');

  // Filtering
  const filteredAds = useMemo(() => {
    return b2bAds.filter((ad) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        ad.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.promoCode && ad.promoCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ad.contactPerson && ad.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'ALL' || ad.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesStatus = selectedStatus === 'ALL' || (ad.status || 'active') === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [b2bAds, searchQuery, selectedCategory, selectedStatus]);

  // Global KPIs
  const stats = useMemo(() => {
    const total = b2bAds.length;
    const active = b2bAds.filter((ad) => (ad.status || 'active') === 'active').length;
    const paused = b2bAds.filter((ad) => ad.status === 'paused').length;
    const expired = b2bAds.filter((ad) => ad.status === 'expired').length;
    const totalRevenueMAD = b2bAds
      .filter((ad) => (ad.status || 'active') === 'active')
      .reduce((sum, ad) => sum + (ad.monthlyFeeMAD || 2500), 0);
    const totalClicks = b2bAds.reduce((sum, ad) => sum + (ad.clicksCount || 0), 0);
    const totalViews = b2bAds.reduce((sum, ad) => sum + (ad.viewsCount || 0), 0);
    const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    return { total, active, paused, expired, totalRevenueMAD, totalClicks, totalViews, averageCTR };
  }, [b2bAds]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const openCreateModal = () => {
    setEditingAdId(null);
    setFormBrandName('');
    setFormTagline('');
    setFormDescription('');
    setFormCategory('Engrais & Biostimulants');
    setFormBadgeText('Partenaire Homologué');
    setFormCtaText('Profiter de l\'offre');
    setFormContactPhone('+212 5 22 00 00 00');
    setFormContactWhatsapp('+212 6 61 00 00 00');
    setFormWebsiteUrl('https://');
    setFormPromoCode('AGRI2026');
    setFormBannerGradient(GRADIENT_PRESETS[0].id);
    setFormIconName('Leaf');
    setFormStatus('active');
    setFormPlacement('all');
    setFormMonthlyFeeMAD(2500);
    setFormContactPerson('M. Responsable Commercial');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2026-12-31');
    setFormNotesAdmin('Campagne sponsorisée annuelle standard');
    setIsFormModalOpen(true);
  };

  const openEditModal = (ad: AgriB2BAd) => {
    setEditingAdId(ad.id);
    setFormBrandName(ad.brandName);
    setFormTagline(ad.tagline);
    setFormDescription(ad.description);
    setFormCategory((ad.category as AgriB2BAdCategory) || 'Engrais & Biostimulants');
    setFormBadgeText(ad.badgeText || '');
    setFormCtaText(ad.ctaText || '');
    setFormContactPhone(ad.contactPhone || '');
    setFormContactWhatsapp(ad.contactWhatsapp || '');
    setFormWebsiteUrl(ad.websiteUrl || '');
    setFormPromoCode(ad.promoCode || '');
    setFormBannerGradient(ad.bannerGradient || GRADIENT_PRESETS[0].id);
    setFormIconName(ad.iconName || 'Leaf');
    setFormStatus(ad.status || 'active');
    setFormPlacement(ad.placement || 'all');
    setFormMonthlyFeeMAD(ad.monthlyFeeMAD || 2500);
    setFormContactPerson(ad.contactPerson || '');
    setFormStartDate(ad.startDate || '2026-01-01');
    setFormEndDate(ad.endDate || '2026-12-31');
    setFormNotesAdmin(ad.notesAdmin || '');
    setIsFormModalOpen(true);
  };

  const handleDuplicateAd = (ad: AgriB2BAd) => {
    const duplicated: Omit<AgriB2BAd, 'id'> = {
      ...ad,
      brandName: `${ad.brandName} (Copie)`,
      status: 'paused',
      clicksCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addB2BAd(duplicated);
    triggerToast(`Campagne "${ad.brandName}" dupliquée avec succès (en pause)`);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formBrandName.trim() || !formTagline.trim() || !formDescription.trim()) {
      alert('Veuillez remplir le nom de la marque, le slogan et la description.');
      return;
    }

    const payload: Omit<AgriB2BAd, 'id'> = {
      brandName: formBrandName.trim(),
      tagline: formTagline.trim(),
      description: formDescription.trim(),
      category: formCategory,
      badgeText: formBadgeText.trim() || 'Partenaire Officiel',
      ctaText: formCtaText.trim() || 'En savoir plus',
      contactPhone: formContactPhone.trim() || undefined,
      contactWhatsapp: formContactWhatsapp.trim() || undefined,
      websiteUrl: formWebsiteUrl.trim() ? (formWebsiteUrl.startsWith('http') ? formWebsiteUrl : `https://${formWebsiteUrl}`) : undefined,
      promoCode: formPromoCode.trim() ? formPromoCode.toUpperCase() : undefined,
      bannerGradient: formBannerGradient,
      iconName: formIconName,
      status: formStatus,
      placement: formPlacement,
      monthlyFeeMAD: Number(formMonthlyFeeMAD) || 0,
      contactPerson: formContactPerson.trim() || undefined,
      startDate: formStartDate,
      endDate: formEndDate,
      notesAdmin: formNotesAdmin.trim() || undefined,
    };

    if (editingAdId) {
      updateB2BAd(editingAdId, payload);
      triggerToast(`Bannière "${payload.brandName}" mise à jour avec succès !`);
    } else {
      addB2BAd(payload);
      triggerToast(`Nouvelle campagne "${payload.brandName}" créée et activée !`);
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteConfirmed = () => {
    if (deleteConfirmId) {
      const target = b2bAds.find((a) => a.id === deleteConfirmId);
      deleteB2BAd(deleteConfirmId);
      setDeleteConfirmId(null);
      triggerToast(`Campagne "${target?.brandName || deleteConfirmId}" supprimée.`);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Voulez-vous restaurer les 4 bannières B2B officielles du catalogue AgriStock Maroc ?')) {
      resetB2BAdsToDefault();
      triggerToast('Bannières B2B réinitialisées aux valeurs officielles.');
    }
  };

  const renderIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="w-4 h-4 text-emerald-400" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Tag':
        return <Tag className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-900 border border-emerald-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-900/40 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Régie Publicitaire & Bannières B2B
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-mono font-bold border border-amber-800">
                MODULE PUB ADMIN
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Gérez les annonceurs partenaires (engrais, irrigation, serres, matériel) et monétisez l'audience agricole.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            title="Restaurer les bannières initiales démo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurer Démo</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouvelle Campagne Pub</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span>Bannières en Ligne</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">{stats.active}</span>
            <span className="text-stone-500 text-[11px]">/ {stats.total} total</span>
          </div>
          <div className="text-[10px] text-stone-400">
            {stats.paused > 0 && <span className="text-amber-400">{stats.paused} en pause</span>}
            {stats.expired > 0 && <span className="text-stone-500 ml-1.5">{stats.expired} expirées</span>}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span>Revenus Facturés</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-amber-400 font-mono">
              {stats.totalRevenueMAD.toLocaleString()}
            </span>
            <span className="text-stone-400 text-[11px]">MAD/mois</span>
          </div>
          <div className="text-[10px] text-stone-400">Régie sponsoring B2B actif</div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span>Affichages / Impressions</span>
            <Eye className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 font-mono">
            {stats.totalViews.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-400">Vues sur les pages cibles</div>
        </div>

        <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span>Clics & Leads (CTR)</span>
            <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-purple-400 font-mono">{stats.totalClicks}</span>
            <span className="text-emerald-400 font-bold text-xs bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
              {stats.averageCTR}% CTR
            </span>
          </div>
          <div className="text-[10px] text-stone-400">WhatsApp, Téléphone & Liens</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par marque, slogan, code promo ou contact..."
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-stone-200 text-xs focus:outline-none"
              >
                <option value="ALL">Toutes les Catégories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-transparent text-stone-200 text-xs focus:outline-none"
              >
                <option value="ALL">Tous les Statuts</option>
                <option value="active">Actif (En ligne)</option>
                <option value="paused">En pause</option>
                <option value="expired">Expiré</option>
              </select>
            </div>

            <div className="flex items-center rounded-xl bg-stone-950 border border-stone-700 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'cards' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Cartes
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Tableau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Listing View */}
      {filteredAds.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
          <Megaphone className="w-10 h-10 text-stone-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-300">Aucune campagne publicitaire trouvée</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Aucune bannière ne correspond aux filtres actuels. Modifiez vos critères de recherche ou ajoutez une nouvelle campagne.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Créer la Première Bannière</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          {filteredAds.map((ad) => {
            const isPaused = ad.status === 'paused';
            const isExpired = ad.status === 'expired';
            const ctr = (ad.viewsCount || 0) > 0
              ? (((ad.clicksCount || 0) / (ad.viewsCount || 1)) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={ad.id}
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-4 transition hover:border-stone-700"
              >
                {/* Top status bar & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">{ad.brandName}</span>
                    <span className="text-xs text-stone-400 font-mono">({ad.id})</span>

                    {isPaused ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <PauseCircle className="w-3 h-3" />
                        <span>En pause</span>
                      </span>
                    ) : isExpired ? (
                      <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-bold">
                        Expirée
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        <span>Active en ligne</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] font-semibold border border-stone-700">
                      {ad.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Status */}
                    <button
                      type="button"
                      onClick={() => toggleB2BAdStatus(ad.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isPaused
                          ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                          : 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700'
                      }`}
                      title={isPaused ? 'Activer la campagne' : 'Mettre en pause la campagne'}
                    >
                      {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Activer' : 'Mettre en pause'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(ad)}
                      className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition cursor-pointer"
                      title="Modifier les paramètres de la campagne"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateAd(ad)}
                      className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition cursor-pointer"
                      title="Dupliquer la campagne"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(ad.id)}
                      className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition cursor-pointer"
                      title="Supprimer la campagne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Live Preview of the Banner */}
                <div
                  className={`relative overflow-hidden rounded-xl border border-stone-700/80 bg-gradient-to-r ${
                    ad.bannerGradient || 'from-stone-900 via-stone-950 to-stone-900'
                  } p-4 text-white shadow-md`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800/80 text-stone-300 border border-stone-700">
                          Sponsorisé B2B
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          {renderIconComponent(ad.iconName)}
                          <span>{ad.badgeText}</span>
                        </span>
                        {ad.promoCode && (
                          <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                            Code: {ad.promoCode}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {ad.brandName} — <span className="font-normal text-stone-300">{ad.tagline}</span>
                      </h4>

                      <p className="text-xs text-stone-300 leading-relaxed">{ad.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {ad.websiteUrl && (
                        <div className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                          <span>{ad.ctaText || 'En savoir plus'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                      {ad.contactWhatsapp && (
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </div>
                      )}
                      {ad.contactPhone && (
                        <div className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 text-xs font-medium flex items-center gap-1 border border-stone-700">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{ad.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campaign Metrics & Metadata details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs bg-stone-950 p-3 rounded-xl border border-stone-800/80">
                  <div>
                    <span className="text-stone-500 text-[10px] block">Affichages (Vues)</span>
                    <span className="font-bold text-stone-200 font-mono">{(ad.viewsCount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Clics Générés</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {ad.clicksCount || 0} <span className="text-[10px] text-stone-400">({ctr}%)</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Budget Facturé</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {(ad.monthlyFeeMAD || 2500).toLocaleString()} MAD<span className="text-[10px]">/m</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Emplacement</span>
                    <span className="font-semibold text-stone-300">
                      {ad.placement === 'home'
                        ? 'Accueil'
                        : ad.placement === 'market'
                        ? 'Marché Récoltes'
                        : ad.placement === 'nursery'
                        ? 'Pépinières'
                        : ad.placement === 'wholesale'
                        ? 'Wholesale'
                        : 'Partout'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Échéance</span>
                    <span className="font-mono text-stone-300 text-[11px]">{ad.endDate || '2026-12-31'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">Interlocuteur</span>
                    <span className="truncate block font-semibold text-stone-300 text-[11px]" title={ad.contactPerson || 'Non spécifié'}>
                      {ad.contactPerson || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Marque / Campagne</th>
                  <th className="py-3.5 px-4 font-bold">Catégorie</th>
                  <th className="py-3.5 px-4 font-bold">Budget / Mois</th>
                  <th className="py-3.5 px-4 font-bold">Impressions</th>
                  <th className="py-3.5 px-4 font-bold">Clics (CTR)</th>
                  <th className="py-3.5 px-4 font-bold">Validité</th>
                  <th className="py-3.5 px-4 font-bold">Statut</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredAds.map((ad) => {
                  const isPaused = ad.status === 'paused';
                  const isExpired = ad.status === 'expired';
                  const ctr = (ad.viewsCount || 0) > 0
                    ? (((ad.clicksCount || 0) / (ad.viewsCount || 1)) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={ad.id} className="hover:bg-stone-800/30 transition">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-stone-100">{ad.brandName}</div>
                        <div className="text-[11px] text-stone-400 truncate max-w-xs">{ad.tagline}</div>
                        {ad.promoCode && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1 rounded">
                            {ad.promoCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-800 text-[11px]">
                          {ad.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {(ad.monthlyFeeMAD || 2500).toLocaleString()} MAD
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-300">
                        {(ad.viewsCount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-amber-300 font-bold">{ad.clicksCount || 0}</span>
                        <span className="text-[10px] text-stone-400 ml-1">({ctr}%)</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-400 text-[11px]">
                        {ad.endDate || '2026-12-31'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPaused ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                            En pause
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-bold">
                            Expirée
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            En ligne
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleB2BAdStatus(ad.id)}
                            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
                            title={isPaused ? 'Activer' : 'Mettre en pause'}
                          >
                            {isPaused ? <PlayCircle className="w-3.5 h-3.5 text-emerald-400" /> : <PauseCircle className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(ad)}
                            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateAd(ad)}
                            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
                            title="Dupliquer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(ad.id)}
                            className="p-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-6 my-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingAdId ? 'Modifier la Campagne Publicitaire B2B' : 'Créer une Nouvelle Campagne Publicitaire B2B'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Configuration complète de la bannière sponsorisée et des paramètres annonceur
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Section 1 : Annonceur & Marque */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  1. Annonceur & Contact Partenaire
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Nom de la Marque / Société <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formBrandName}
                      onChange={(e) => setFormBrandName(e.target.value)}
                      placeholder="Ex: Netafim Maghreb, BioFertil Maroc"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Responsable / Interlocuteur
                    </label>
                    <input
                      type="text"
                      value={formContactPerson}
                      onChange={(e) => setFormContactPerson(e.target.value)}
                      placeholder="Ex: M. Rachid Benjelloun (Dir. Ventes)"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Téléphone Direct</label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      placeholder="+212 5 22 ..."
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">WhatsApp Direct</label>
                    <input
                      type="text"
                      value={formContactWhatsapp}
                      onChange={(e) => setFormContactWhatsapp(e.target.value)}
                      placeholder="+212 6 61 ..."
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-300 font-semibold mb-1">Site Web / Catalogue URL</label>
                    <input
                      type="text"
                      value={formWebsiteUrl}
                      onChange={(e) => setFormWebsiteUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 : Message Publicitaire & Textes */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  2. Message & Contenu de la Bannière
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-300 font-semibold mb-1">
                      Slogan Accrocheur (Tagline) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="Ex: Biostimulants & Fertilisants Organiques Homologués ONSSA"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-300 font-semibold mb-1">
                      Description Détaillée <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Ex: Boostez vos rendements de +22% tout en préservant la fertilité du sol. Formules adaptées aux cultures d'export..."
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Catégorie Ciblée</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Badge Texte</label>
                    <input
                      type="text"
                      value={formBadgeText}
                      onChange={(e) => setFormBadgeText(e.target.value)}
                      placeholder="Ex: Homologué ONSSA, Remise -15%"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Texte du Bouton CTA</label>
                    <input
                      type="text"
                      value={formCtaText}
                      onChange={(e) => setFormCtaText(e.target.value)}
                      placeholder="Ex: Commander avec remise -15%"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Code Promo Exclusif AgriStock</label>
                    <input
                      type="text"
                      value={formPromoCode}
                      onChange={(e) => setFormPromoCode(e.target.value.toUpperCase())}
                      placeholder="Ex: AGRISPRING26"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 font-mono uppercase focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3 : Style Visuel & Aperçu en Direct */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  3. Thème Visuel & Icône
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1.5">Couleur / Dégradé de la Bannière</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormBannerGradient(preset.id)}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[11px] transition ${
                            formBannerGradient === preset.id
                              ? 'border-amber-400 bg-stone-800 text-white'
                              : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${preset.color} shrink-0`} />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1.5">Icône Associée</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ICON_OPTIONS.map((opt) => {
                        const IconComp = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setFormIconName(opt.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[11px] transition ${
                              formIconName === opt.id
                                ? 'border-amber-400 bg-stone-800 text-white'
                                : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Aperçu interactif en direct */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1.5">
                    Aperçu en Direct de la Bannière :
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-xl border border-stone-700 bg-gradient-to-r ${formBannerGradient} p-4 text-white shadow-md`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                            Sponsorisé B2B
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            {renderIconComponent(formIconName)}
                            <span>{formBadgeText || 'Badge Partenaire'}</span>
                          </span>
                          {formPromoCode && (
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                              Code: {formPromoCode}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          {formBrandName || 'Nom de la Marque'} —{' '}
                          <span className="font-normal text-stone-300">{formTagline || 'Slogan accrocheur'}</span>
                        </h4>
                        <p className="text-xs text-stone-300 line-clamp-2">
                          {formDescription || 'Description de l\'offre publicitaire pour les agriculteurs et professionnels.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-sm">
                          {formCtaText || 'CTA'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 : Paramètres de Campagne & Facturation */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  4. Emplacement, Budget & Validité
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Emplacement Cible</label>
                    <select
                      value={formPlacement}
                      onChange={(e) => setFormPlacement(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="all">Toutes les sections (Global)</option>
                      <option value="home">Page d'Accueil</option>
                      <option value="market">Marché Récoltes</option>
                      <option value="nursery">Espace Pépinières</option>
                      <option value="wholesale">Bourse Wholesale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Tarif Mensuel Facturé (MAD)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formMonthlyFeeMAD}
                      onChange={(e) => setFormMonthlyFeeMAD(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Statut Initial</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="active">Actif (Mettre en ligne)</option>
                      <option value="paused">En pause (Brouillon)</option>
                      <option value="expired">Expiré</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Date de Début</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Date d'Échéance</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Notes Internes Admin</label>
                    <input
                      type="text"
                      value={formNotesAdmin}
                      onChange={(e) => setFormNotesAdmin(e.target.value)}
                      placeholder="Facturé, Virement reçu..."
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-lg shadow-amber-900/30 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAdId ? 'Enregistrer les Modifications' : 'Créer et Publier la Bannière'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Supprimer cette campagne ?</h4>
                <p className="text-xs text-stone-400">Cette action retirera la bannière publicitaire.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 bg-stone-950 p-3 rounded-xl border border-stone-800">
              Êtes-vous sûr de vouloir supprimer définitivement la campagne de{' '}
              <strong className="text-white">
                {b2bAds.find((a) => a.id === deleteConfirmId)?.brandName || deleteConfirmId}
              </strong>{' '}
              ? Les statistiques associées seront effacées.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 cursor-pointer"
              >
                Oui, Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
