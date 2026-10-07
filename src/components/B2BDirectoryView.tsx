import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { B2BAgent, B2BAgentCategory, MoroccanRegion } from '../types';
import { INITIAL_B2B_AGENTS } from '../data/b2bDirectoryData';
import {
  Users,
  Search,
  Filter,
  MapPin,
  Phone,
  MessageSquare,
  Building2,
  ShieldCheck,
  Award,
  Star,
  ExternalLink,
  ChevronRight,
  Truck,
  Sparkles,
  Layers,
  Sprout,
  Store,
  FileCheck,
  CheckCircle,
  Download,
  Info,
} from 'lucide-react';

interface Props {
  onOpenComplianceModal: () => void;
}

export const B2BDirectoryView: React.FC<Props> = ({ onOpenComplianceModal }) => {
  const { language, platformPaymentProtected, openLogisticsModal } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [onlyVerifiedPro, setOnlyVerifiedPro] = useState(false);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<B2BAgent | null>(null);

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: tr(language, 'Toutes les filières', 'جميع الفئات', 'All Sectors'), icon: <Layers className="w-4 h-4" /> },
    { id: 'Pépinière Agréée ONSSA', label: tr(language, 'Pépinières Agréées ONSSA', 'مشاتل معتمدة ONSSA', 'ONSSA Approved Nurseries'), icon: <Sprout className="w-4 h-4" /> },
    { id: 'Domaine Agricole & Production', label: tr(language, 'Domaines & Grands Producteurs', 'ضيعات فلاحية وإنتاج', 'Agricultural Estates & Producers'), icon: <Building2 className="w-4 h-4" /> },
    { id: 'Coopérative Agricole & GIE', label: tr(language, 'Coopératives Agricoles & GIE', 'تعاونيات ومجموعات نفعية', 'Agri Cooperatives & Economic Groups'), icon: <Users className="w-4 h-4" /> },
    { id: 'Négociant Marché de Gros', label: tr(language, 'Négociants Marchés de Gros', 'تجار أسواق الجملة', 'Wholesale Market Traders'), icon: <Store className="w-4 h-4" /> },
    { id: 'Station de Conditionnement & Export', label: tr(language, 'Stations Conditionnement & Export', 'محطات التلفيف والتصدير', 'Packing & Export Stations'), icon: <FileCheck className="w-4 h-4" /> },
    { id: 'Transport Frigorifique & Logistique', label: tr(language, 'Transport Frigorifique & Logistique', 'نقل مبرد ولوجستيك', 'Refrigerated Transport & Logistics'), icon: <Truck className="w-4 h-4" /> },
    { id: 'Fournisseur Intrants & Équipements', label: tr(language, 'Fournisseurs Intrants & Équipements', 'معدات، ري وأسمدة', 'Inputs & Equipment Suppliers'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'Conseil Agronomique & Laboratoire', label: tr(language, 'Conseil & Laboratoires d\'Analyses', 'استشارات وتحاليل مخبرية', 'Agronomic Advisory & Testing Labs'), icon: <Award className="w-4 h-4" /> },
  ];

  const regions: MoroccanRegion[] = [
    'Souss-Massa (Agadir, Taroudant, Chtouka)',
    'L\'Oriental (Berkane, Oujda, Nador)',
    'Gharb - Chrarda (Kénitra, Sidi Slimane)',
    'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
    'Marrakech - Safi (Haouz, El Kelaâ)',
    'Béni Mellal - Khénifra (Tadla)',
    'Drâa - Tafilalet (Zagora, Errachidia)',
    'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
    'Casablanca - Settat & Doukkala',
  ];

  const filteredAgents = useMemo(() => {
    return INITIAL_B2B_AGENTS.filter(agent => {
      const matchSearch =
        searchTerm === '' ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (agent.onssaApprovalNumber && agent.onssaApprovalNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || agent.category === selectedCategory;
      const matchRegion = selectedRegion === 'ALL' || agent.region === selectedRegion;
      const matchVerified = !onlyVerifiedPro || agent.isVerifiedPro;

      return matchSearch && matchCategory && matchRegion && matchVerified;
    });
  }, [searchTerm, selectedCategory, selectedRegion, onlyVerifiedPro]);

  const handleExportDirectoryCSV = () => {
    const headers = ['Nom', 'Catégorie', 'Région', 'Ville', 'Téléphone', 'WhatsApp', 'Agrément ONSSA', 'ICE', 'RC', 'Spécialités'];
    const rows = filteredAgents.map(a => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.region}"`,
      `"${a.city}"`,
      `"${a.phone}"`,
      `"${a.whatsapp}"`,
      `"${a.onssaApprovalNumber || 'N/A'}"`,
      `"${a.iceNumber || 'N/A'}"`,
      `"${a.rcNumber || 'N/A'}"`,
      `"${a.specialties.join(' ; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agristock_annuaire_agents_maroc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Banner Annuaire Professionnel B2B */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#091b12] via-[#0f2c1e] to-[#143e2b] text-white p-6 sm:p-8 shadow-xl border border-emerald-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-stone-950 flex items-center gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5" />
                {tr(language, 'Annuaire Officiel B2B Maroc', 'الدليل المهني الفلاحي B2B', 'Morocco Agri B2B Directory')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-emerald-300 border border-white/10">
                {tr(language, '12 Régions du Royaume', '12 جهة بالمملكة', '12 Kingdom Regions')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {tr(language, 'Base de Données & Répertoire des Acteurs Agricoles', 'قاعدة بيانات فاعلي القطاع الفلاحي بالمغرب', 'Agri Directory & Actors Database')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {tr(
                language,
                'Consultez et contactez les pépinières agréées ONSSA, domaines de production, coopératives agricoles, négociants de marchés de gros et transporteurs frigorifiques vérifiés à travers le Maroc.',
                'استكشف وتواصل مع المشاتل المعتمدة ONSSA، الضيعات الكبرى، التعاونيات، تجار أسواق الجملة وناقلي التبريد المؤكدين بالمغرب.',
                'Browse and connect with certified ONSSA nurseries, farming estates, agricultural coops, wholesale merchants and refrigerated freight carriers across Morocco.'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={handleExportDirectoryCSV}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-bold border border-white/20 transition cursor-pointer"
              title="Exporter la liste filtrée au format CSV / Excel"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{tr(language, 'Exporter en Excel / CSV', 'تصدير كـ Excel / CSV', 'Export to Excel / CSV')}</span>
            </button>

            <button
              onClick={onOpenComplianceModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{tr(language, 'Statut Officiel & CNDP', 'الوضع القانوني و CNDP', 'Official Status & CNDP')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartouche Récapitulatif Statut Institutionnel */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-stone-50 to-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-stone-900">
              {tr(
                language,
                'Cadre Légal Déclaré CNDP (Loi 09-08) & Marque OMPIC N° 249104',
                'إطار قانوني مصرح به لدى CNDP (قانون 09-08) وعلامة OMPIC مسجلة',
                'CNDP Declared Legal Framework (Law 09-08) & OMPIC Registered Trademark'
              )}
            </p>
            <p className="text-stone-600 text-[11px]">
              {tr(
                language,
                'Toutes les entités de cet annuaire disposent d’un statut d’entreprise (ICE, RC) ou d’un agrément d’exploitation officiel (ONSSA / EACCE).',
                'جميع المؤسسات في هذا الدليل تتوفر على وضع قانوني تجاري (ICE، RC) أو اعتماد فلاحي رسمي (ONSSA / EACCE).',
                'All entities in this directory possess official business status (ICE, RC) or certified agricultural approval (ONSSA / EACCE).'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenComplianceModal}
          className="text-emerald-800 hover:text-emerald-950 font-bold underline text-[11px] whitespace-nowrap"
        >
          {tr(language, 'Consulter les mentions légales & certif ➔', 'الاطلاع على البيانات القانونية والشهادات ➔', 'View legal notices & certs ➔')}
        </button>
      </div>

      {/* Barre de Recherche et Filtres par Catégorie & Région */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        {/* Ligne de recherche globale */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={tr(
                language,
                'Recherche par nom d\'entreprise, ville, N° agrément ONSSA, culture ou spécialité...',
                'البحث بالاسم، المدينة، رقم الاعتماد ONSSA، أو التخصص...',
                'Search by company name, city, ONSSA license, crop or specialty...'
              )}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ALL">{tr(language, 'Toutes les Régions (Maroc)', 'جميع الجهات (المغرب)', 'All Regions (Morocco)')}</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xs font-bold cursor-pointer hover:bg-stone-100 transition select-none">
              <input
                type="checkbox"
                checked={onlyVerifiedPro}
                onChange={e => setOnlyVerifiedPro(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              <span className="hidden sm:inline">{tr(language, 'Vérifiés PRO', 'محترفون موثوقون', 'Verified PRO')}</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </label>
          </div>
        </div>

        {/* Chips de filières & catégories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Résumé des résultats */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          <strong>{filteredAgents.length}</strong> {tr(language, 'acteurs répertoriés dans la base', 'فاعل مسجل في قاعدة البيانات', 'actors listed in database')}
        </span>
        {(searchTerm || selectedCategory !== 'ALL' || selectedRegion !== 'ALL' || onlyVerifiedPro) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedRegion('ALL');
              setOnlyVerifiedPro(false);
            }}
            className="text-emerald-700 hover:underline font-semibold"
          >
            {tr(language, 'Réinitialiser les filtres', 'إعادة ضبط الفلاتر', 'Reset filters')}
          </button>
        )}
      </div>

      {/* Grille des Acteurs B2B */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredAgents.map(agent => (
          <div
            key={agent.id}
            className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-5 space-y-3.5">
              {/* Header de la fiche */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {agent.category}
                    </span>
                    {agent.isVerifiedPro && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                        <Award className="w-2.5 h-2.5" />
                        {tr(language, 'PRO Vérifié', 'محترف موثق', 'Verified PRO')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition">
                    {agent.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-900 text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{agent.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-stone-400">({agent.reviewsCount})</span>
                </div>
              </div>

              {/* Localisation */}
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-stone-800">{agent.city}</span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 truncate">{agent.region.split('(')[0]}</span>
              </div>

              {/* Agrément ONSSA ou Identifiant Entreprise */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                {agent.onssaApprovalNumber && (
                  <div className="flex items-center justify-between text-emerald-900 font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {tr(language, 'Agrément ONSSA :', 'اعتماد ONSSA :', 'ONSSA Approval:')}
                    </span>
                    <span className="font-mono">{agent.onssaApprovalNumber}</span>
                  </div>
                )}
                {agent.iceNumber && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span>{tr(language, 'ICE Entreprise :', 'رقم ICE للشركة :', 'Company ICE:')}</span>
                    <span className="font-mono text-stone-800 font-bold">{agent.iceNumber}</span>
                  </div>
                )}
              </div>

              {/* Spécialités / Cultures */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
                  {tr(language, 'Spécialités & Capacités', 'التخصصات والقدرات', 'Specialties & Capacities')}
                </span>
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description courte */}
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Actions de contact (WhatsApp / Téléphone / Détails) */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedAgentDetails(agent)}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                {tr(language, 'Fiche complète', 'البطاقة الكاملة', 'Full Profile')}
              </button>

              <a
                href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${agent.name}, je vous contacte via la plateforme AgriStock Maroc pour une opportunité commerciale.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 cursor-pointer"
                title="Contacter sur WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              <a
                href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white shadow-xs transition active:scale-95 cursor-pointer"
                title="Appeler directement"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Détails Acteur B2B */}
      {selectedAgentDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#091b12] to-[#163a2a] text-white p-6 relative">
              <button
                onClick={() => setSelectedAgentDetails(null)}
                className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-stone-950">
                  {selectedAgentDetails.category}
                </span>
                {selectedAgentDetails.isVerifiedPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-emerald-100 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {tr(language, 'Vérifié Plateforme', 'موثق بالمنصة', 'Platform Verified')}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {selectedAgentDetails.name}
              </h2>
              <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {selectedAgentDetails.city} — {selectedAgentDetails.region}
              </p>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-stone-800 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold uppercase text-xs tracking-wider text-stone-500 mb-1.5">
                  {tr(language, "Présentation de l'Entreprise", 'نبذة عن المؤسسة', 'Company Overview')}
                </h4>
                <p className="text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  {selectedAgentDetails.description}
                </p>
              </div>

              {selectedAgentDetails.capacityOrSurface && (
                <div>
                  <h4 className="font-bold uppercase text-xs tracking-wider text-stone-500 mb-1">
                    {tr(language, 'Capacité Opérationnelle / Superficie', 'القدرة التشغيلية / المساحة', 'Operational Capacity / Surface')}
                  </h4>
                  <p className="font-semibold text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                    {selectedAgentDetails.capacityOrSurface}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold uppercase text-xs tracking-wider text-stone-500 mb-1.5">
                  {tr(language, 'Spécialités & Gammes Produites', 'التخصصات والمنتجات', 'Specialties & Product Lines')}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgentDetails.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Informations Légales & Certifications */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <h4 className="font-bold uppercase text-[11px] tracking-wider text-stone-500">
                  {tr(language, 'Identifiants Légaux & Agréments Sanitaires', 'المعرفات القانونية والشهادات الصحية', 'Legal Identifiers & Sanitary Certifications')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedAgentDetails.onssaApprovalNumber && (
                    <div className="p-2 rounded-lg bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">{tr(language, 'Agrément ONSSA', 'اعتماد ONSSA', 'ONSSA Approval')}</span>
                      <span className="font-mono font-bold text-emerald-800">{selectedAgentDetails.onssaApprovalNumber}</span>
                    </div>
                  )}
                  {selectedAgentDetails.iceNumber && (
                    <div className="p-2 rounded-lg bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">{tr(language, 'Numéro ICE', 'رقم ICE', 'ICE Number')}</span>
                      <span className="font-mono font-bold text-stone-900">{selectedAgentDetails.iceNumber}</span>
                    </div>
                  )}
                  {selectedAgentDetails.rcNumber && (
                    <div className="p-2 rounded-lg bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">{tr(language, 'Registre de Commerce', 'السجل التجاري', 'Trade Registry (RC)')}</span>
                      <span className="font-mono font-bold text-stone-900">{selectedAgentDetails.rcNumber}</span>
                    </div>
                  )}
                  {selectedAgentDetails.address && (
                    <div className="p-2 rounded-lg bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">{tr(language, 'Adresse Géographique', 'العنوان الجغرافي', 'Physical Address')}</span>
                      <span className="text-stone-900">{selectedAgentDetails.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setSelectedAgentDetails(null)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold text-xs cursor-pointer"
              >
                {tr(language, 'Fermer', 'إغلاق', 'Close')}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedAgentDetails.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    tr(
                      language,
                      `Bonjour ${selectedAgentDetails.name}, je vous contacte via la plateforme AgriStock Maroc pour discuter d'une opportunité d'affaires.`,
                      `السلام عليكم ${selectedAgentDetails.name}، أتصل بكم عبر منصة AgriStock المغرب لمناقشة فرصة تجارية.`,
                      `Hello ${selectedAgentDetails.name}, I am contacting you via AgriStock Morocco regarding a business opportunity.`
                    )
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{tr(language, 'WhatsApp Commercial', 'واتساب تجاري', 'Business WhatsApp')}</span>
                </a>

                <a
                  href={`tel:${selectedAgentDetails.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>{selectedAgentDetails.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
