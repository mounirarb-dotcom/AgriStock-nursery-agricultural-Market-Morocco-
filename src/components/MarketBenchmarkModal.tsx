import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Truck,
  FileCheck,
  Calculator,
  Building2,
  Sprout,
  Users,
  Lock,
  ChevronDown,
  X,
  Scale,
  Sparkles,
  DollarSign,
  Globe,
  FileText,
  Anchor,
  Thermometer,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketBenchmarkModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { language, setActiveTab } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'comparison' | 'casestudies' | 'export' | 'simulator'>('comparison');

  // Simulateur interactif de risque et gain
  const [tradeVolumeTonnes, setTradeVolumeTonnes] = useState<number>(25);
  const [pricePerKgMAD, setPricePerKgMAD] = useState<number>(4.5);
  const [defaultRateRisk, setDefaultRateRisk] = useState<number>(12); // Taux moyen de perte/impayé sur le circuit informel au Maroc (10-15%)

  if (!isOpen) return null;

  const totalTransactionMAD = tradeVolumeTonnes * 1000 * pricePerKgMAD;
  const estimatedInformalLossMAD = (totalTransactionMAD * defaultRateRisk) / 100;
  const agriStockFeeMAD = (totalTransactionMAD * 1.5) / 100;
  const netSavedCapitalMAD = estimatedInformalLossMAD - agriStockFeeMAD;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="benchmark-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Institutionnel */}
        <div className="bg-gradient-to-r from-[#091b12] via-[#0f2c1d] to-[#163a28] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Scale className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-stone-950">
                  {tr(language, 'Benchmark & Valeur Ajoutée', 'دراسة مقارنة السوق', 'Benchmark & Value Proposition')}
                </span>
                <span className="text-xs text-emerald-300 font-semibold">AgriStock vs Marché Marocain</span>
              </div>
              <h2 id="benchmark-modal-title" className="text-lg sm:text-xl font-black text-white mt-1">
                {tr(
                  language,
                  'Pourquoi Choisir AgriStock Maroc ? Comparatif & Études de Cas',
                  'لماذا أجري سطوك المغرب؟ مقارنة شاملة مع القنوات الأخرى',
                  'Why Choose AgriStock Morocco? Comparison & Case Studies'
                )}
              </h2>
              <p className="text-xs text-stone-300">
                {tr(
                  language,
                  "Analyse objective des canaux de négoce agricole au Maroc (WhatsApp, Sites d'annonces généralistes, Marché informel vs AgriStock : Séquestre, Pépinières ONSSA & Exportation Internationale).",
                  'تحليل مقارن لقنوات التجارة الفلاحية بالمغرب (واتساب، مواقع الإعلانات العامة، السوق الموازي مقارنة مع أجري سطوك: الضمان المالي، شتلات أونسا، وتوثيق التصدير الدولي).',
                  'Objective benchmark of Moroccan agricultural trade channels (WhatsApp, general classifieds, informal brokers vs AgriStock: Escrow guarantee, ONSSA nurseries & International export).'
                )}
              </p>
            </div>
          </div>

          {/* Onglets internes du modal */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-emerald-900/60 overflow-x-auto">
            <button
              onClick={() => setActiveTabSub('comparison')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTabSub === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{tr(language, 'Tableau Comparatif', 'جدول المقارنة', 'Comparison Table')}</span>
            </button>

            <button
              onClick={() => setActiveTabSub('export')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTabSub === 'export'
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300/40'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-extrabold">{tr(language, 'Pôle Export & Foodex', 'قطب التصدير وفوديكس', 'Export & Foodex Hub')}</span>
            </button>

            <button
              onClick={() => setActiveTabSub('casestudies')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTabSub === 'casestudies'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{tr(language, 'Études de Cas Régionales', 'قصص نجاح مغربية', 'Regional Case Studies')}</span>
            </button>

            <button
              onClick={() => setActiveTabSub('simulator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTabSub === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{tr(language, 'Simulateur Anti-Impayés', 'حاسبة تقليل المخاطر', 'Risk Simulator')}</span>
            </button>
          </div>
        </div>

        {/* Contenu dynamique selon l'onglet */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800 text-xs sm:text-sm">
          {/* TAB 1: TABLEAU COMPARATIF DÉTAILLÉ */}
          {activeTabSub === 'comparison' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed">
                Au Maroc, plus de <strong>75% des transactions agricoles</strong> s&apos;effectuent encore via des intermédiaires informels (« Chnakla »), des chèques post-datés non garantis ou des groupes WhatsApp fermés sans aucune traçabilité sanitaire ni contrat. AgriStock apporte une structure institutionnelle certifiée.
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                      <th className="p-3 font-bold">Fonctionnalité & Critère B2B</th>
                      <th className="p-3 font-semibold text-stone-500">Groupes WhatsApp & Souk</th>
                      <th className="p-3 font-semibold text-stone-500">Sites d&apos;annonces généralistes</th>
                      <th className="p-3 font-black text-emerald-800 bg-emerald-50/90 border-l border-r border-emerald-200">
                        AgriStock Maroc 🇲🇦
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Gestion Pépinières & Plants Agréés
                        <span className="block text-[11px] text-stone-500 font-normal">Arbres fruitiers, maraîchage, dattes in-vitro</span>
                      </td>
                      <td className="p-3 text-stone-500">
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Informel
                        </span>
                      </td>
                      <td className="p-3 text-stone-500">
                        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Rare & basique
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" /> Dédié par lot & variété
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Passeport Phytosanitaire ONSSA
                        <span className="block text-[11px] text-stone-500 font-normal">Traçabilité génétique, sanitaire & étiquetage QR</span>
                      </td>
                      <td className="p-3 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Impossible
                      </td>
                      <td className="p-3 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Absent
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Génération & impression conforme
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Vente sur Pied au Forfait (Par Hectare)
                        <span className="block text-[11px] text-stone-500 font-normal">Daman El Ghalla : agrumes, oliviers, pastèque</span>
                      </td>
                      <td className="p-3 text-amber-600">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Accords oraux risqués
                      </td>
                      <td className="p-3 text-rose-600">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Non adapté
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Module spécialisé avec rendement estimé
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Sécurisation du Paiement (Séquestre)
                        <span className="block text-[11px] text-stone-500 font-normal">Protection contre les chèques sans provision</span>
                      </td>
                      <td className="p-3 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> 0% (gros risque impayé)
                      </td>
                      <td className="p-3 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Aucune garantie
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Fonds cantonnés débloqués à réception
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Cotations Marchés de Gros (Mercuriale)
                        <span className="block text-[11px] text-stone-500 font-normal">Prix en direct à Sidi Othmane, Inezgane, Meknès</span>
                      </td>
                      <td className="p-3 text-stone-500">Rumeurs / Prix variables</td>
                      <td className="p-3 text-rose-600">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Non fourni
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Ticker live & tendances min/max
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Logistique & Fret Frigorifique
                        <span className="block text-[11px] text-stone-500 font-normal">Camions frigo régulés +2°C / +14°C</span>
                      </td>
                      <td className="p-3 text-stone-500">Recherche manuelle souk</td>
                      <td className="p-3 text-rose-600">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Non intégré
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Réservation directe de transporteurs certifiés
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Conformité Export & Manifestes A4 (Morocco Foodex)
                        <span className="block text-[11px] text-stone-500 font-normal">Codes SH automatiques, traçabilité BADR/DUM, visa EACCE</span>
                      </td>
                      <td className="p-3 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Impossible (rejet port)
                      </td>
                      <td className="p-3 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Zéro outil export
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Manifestes officiels A4 en 1 clic + QR Douane
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-900">
                        Contrôle Températures & Chaîne du Froid Export
                        <span className="block text-[11px] text-stone-500 font-normal">Points de consigne fruits rouges, tomates, agrumes</span>
                      </td>
                      <td className="p-3 text-amber-600">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Aucune consigne
                      </td>
                      <td className="p-3 text-rose-600">
                        <XCircle className="w-3.5 h-3.5 inline mr-1" /> Non géré
                      </td>
                      <td className="p-3 font-bold text-emerald-900 bg-emerald-50/40 border-l border-r border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-700" /> Barèmes thermiques intégrés + plombs scellés
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PÔLE EXPORT & MOROCCO FOODEX */}
          {activeTabSub === 'export' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Bannière Header Export */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-[#0d2a1c] to-[#0a1e14] text-white border border-emerald-700/50 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950">
                        {tr(language, 'Export International & Logistique', 'التصدير الدولي واللوجستيك', 'International Export & Logistics')}
                      </span>
                      <span className="text-xs text-emerald-300 font-semibold">Morocco Foodex (EACCE) • ONSSA • Douane BADR</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {tr(
                        language,
                        'Pourquoi les Exportateurs Marocains Choisissent AgriStock ?',
                        'لماذا يختار المصدرون المغاربة منصة أجري سطوك؟',
                        'Why Moroccan Exporters Choose AgriStock?'
                      )}
                    </h3>
                    <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                      {tr(
                        language,
                        'De la station de conditionnement jusqu\'aux hubs de Perpignan, Rotterdam, Londres et l\'Afrique de l\'Ouest : sécurisation de la liasse documentaire, chaîne du froid ATP et garantie financière.',
                        'من محطة التلفيف حتى منصات بيربينيان، روتردام، لندن وإفريقيا الغربية: توثيق رسمي موحد، سلسلة تبريد معتمدة ATP وضمان مالي صارم.',
                        'From packing stations to hubs in Perpignan, Rotterdam, London and West Africa: unified customs documentation, ATP certified cold chain, and secure financial escrow.'
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                      <div className="text-lg font-black text-amber-300">30s</div>
                      <div className="text-[10px] text-stone-300 font-medium">
                        {tr(language, 'Manifeste A4', 'بيان الشحن A4', 'A4 Manifest')}
                      </div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                      <div className="text-lg font-black text-emerald-300">0%</div>
                      <div className="text-[10px] text-stone-300 font-medium">
                        {tr(language, 'Litiges SH', 'أخطاء جمركية', 'HS Code Disputes')}
                      </div>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
                      <div className="text-lg font-black text-blue-300">MAD/EUR</div>
                      <div className="text-[10px] text-stone-300 font-medium">
                        {tr(language, 'Multi-Devises', 'متعدد العملات', 'Multi-Currency')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Piliers Export */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Pilier 1 */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/50 transition">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      {tr(
                        language,
                        '1. Liasse Documentaire & Manifestes A4 en 1 Clic',
                        '1. وثائق التصدير وبيانات الشحن الرسمية بنقرة واحدة',
                        '1. One-Click A4 Export Shipping Manifests'
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {tr(
                      language,
                      'Édition instantanée du manifeste normalisé conforme Morocco Foodex (EACCE) et Douane BADR. Codes SH automatisés (0702 Tomates, 0805 Agrumes, 0810 Fruits Rouges), n° DUM, n° de scellés et QR Code de traçabilité officiel scannable au port.',
                      'إصدار فوري لبيان الشحن المطابق لموروكو فوديكس وجمارك BADR. إدراج تلقائي لرمز النظام المنسق SH، ورقم التصريح الموحد DUM، وختم الرصاص ورمز QR للتحقق بالميناء.',
                      'Instant generation of standardized manifests compliant with Morocco Foodex & BADR customs. Automated HS Codes (0702 Tomatoes, 0805 Citrus, 0810 Berries), DUM declaration, container seals and port-scannable QR code.'
                    )}
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{tr(language, 'Gain de 45 minutes par camion à Tanger Med', 'ربح 45 دقيقة لكل شاحنة بميناء طنجة المتوسط', 'Save 45 min per truck at Tanger Med')}</span>
                  </div>
                </div>

                {/* Pilier 2 */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/50 transition">
                  <div className="flex items-center gap-2.5 text-blue-800">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Thermometer className="w-4 h-4 text-blue-700" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      {tr(
                        language,
                        '2. Chaîne du Froid ATP & Consignes Thermiques',
                        '2. سلسلة التبريد المعتمدة ATP وضبط الحرارة',
                        '2. ATP Certified Cold Chain & Temperature Targets'
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {tr(
                      language,
                      'Barèmes thermiques intégrés pour prévenir tout litige d\'avarie de transport (+0.5°C à +3°C pour fruits rouges du Gharb/Loukkos, +8°C à +12°C pour agrumes de Berkane). Réservation de camions frigorifiques TIR et conteneurs reefers homologués.',
                      'جداول درجات حرارة قياسية تفادياً لنزاعات التلف البحري والبري (+0.5°C إلى +3°C للفواكه الحمراء، +8°C إلى +12°C لحوامض بركان). حجز شاحنات تبريد معتمدة وحاويات بحرية مبردة.',
                      'Built-in thermal setpoints preventing transit loss claims (+0.5°C to +3°C for red berries, +8°C to +12°C for citrus). Booking of verified ATP refrigerated TIR trucks and sea reefers.'
                    )}
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] font-bold text-blue-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{tr(language, 'Traçabilité thermique certifiée de bout en bout', 'تتبع حراري موثق من الضيعة حتى الوصول', 'Certified end-to-end temperature tracking')}</span>
                  </div>
                </div>

                {/* Pilier 3 */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/50 transition">
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      {tr(
                        language,
                        '3. Séquestre Financier Multi-Devises (MAD, EUR, USD)',
                        '3. حساب ضمان مالي متعدد العملات (درهم، يورو، دولار)',
                        '3. Multi-Currency Escrow Protection (MAD, EUR, USD)'
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {tr(
                      language,
                      'Protection absolue contre les défauts de paiement internationaux et les contestations opportunistes à l\'arrivée en Europe. Les fonds de l\'acheteur étranger sont cantonnés avant le départ du camion et libérés à la validation des bons de livraison.',
                      'حماية تامة من تعثر المشترين الدوليين واقتطاعات الفرز الجائرة في أوروبا. تودع أموال المستورد في حساب الضمان قبل انطلاق الشاحنة وتُصرف فور التأكيد.',
                      'Full protection against international buyer defaults and arbitrary discounting at European terminals. Funds are secured in escrow prior to truck departure and released upon delivery receipt.'
                    )}
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] font-bold text-amber-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{tr(language, 'Zéro risque d\'impayé transfrontalier', 'ضمان 100% ضد الديون غير المستخلصة', 'Zero cross-border unpaid debt risk')}</span>
                  </div>
                </div>

                {/* Pilier 4 */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-500/50 transition">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Anchor className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      {tr(
                        language,
                        '4. Couverture des Corridors Maritimes & Terrestres',
                        '4. تغطية المعابر البحرية ومسارات إفريقيا البرية',
                        '4. Sea Ports & West Africa Overland Corridors'
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {tr(
                      language,
                      'Prise en charge intégrée des flux portuaires majeurs : Tanger Med (liaisons Algesiras/Marseille/Rotterdam), Port d\'Agadir (agrumes/tomates) et corridor terrestre transsaharien via Guerguerat vers la Mauritanie, le Sénégal et la Côte d\'Ivoire.',
                      'دعم شامل للممرات اللوجستية الكبرى: ميناء طنجة المتوسط، ميناء أكادير التجاري، والمعبر البري الكركرات نحو موريتانيا والسنغال ودول غرب إفريقيا.',
                      'Full support for key export arteries: Tanger Med port (routes to Algeciras/Marseille/Rotterdam), Agadir commercial port, and trans-Saharan overland routes via Guerguerat to West Africa.'
                    )}
                  </p>
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{tr(language, 'Hubs européens et africains connectés', 'ربط مباشر بالمستوردين في أوروبا وإفريقيا', 'Direct connection to European & African buyers')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ÉTUDES DE CAS RÉGIONALES AU MAROC */}
          {activeTabSub === 'casestudies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cas 1: Pépiniériste Souss */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Souss-Massa (Biougra)
                    </span>
                    <Sprout className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Pépinière Maraîchère (Greffage Tomate & Poivron)
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    « Avant, nos surplus de jeunes plants greffés devaient être liquidés sur WhatsApp avec 20% d&apos;annulations de dernière minute. Avec AgriStock, chaque lot est réservé avec acompte garanti et passeport ONSSA téléchargeable. »
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-emerald-800">
                  📈 Résultat : +18% de marge nette & zéro plant détruit.
                </div>
              </div>

              {/* Cas 2: Exploitant Berkane */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      L&apos;Oriental (Berkane)
                    </span>
                    <Building2 className="w-4 h-4 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Domaine Agrumicole (Clémentine Berkane IGP)
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    « Vendre 40 hectares de clémentines sur pied représentait une angoisse : les négociants versaient une avance minime puis contestaient le calibre à la cueillette. Le module sur pied d&apos;AgriStock a sécurisé le contrat. »
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-amber-800">
                  🛡️ Résultat : Paiement total sécurisé sous séquestre à 100%.
                </div>
              </div>

              {/* Cas 3: Négociant Casablanca */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Casablanca (Sidi Othmane)
                    </span>
                    <Truck className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Grossiste Carreau Marché de Gros
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    « Je commande directement aux domaines du Gharb et du Tadla sans intermédiaire. La réservation immédiate du camion frigo me garantit que les primeurs arrivent à Casablanca sans rupture de chaîne de froid. »
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-blue-800">
                  ⏱️ Résultat : Gain de 24h sur l&apos;approvisionnement en rayons.
                </div>
              </div>

              {/* Cas 4: Station de Conditionnement & Exportateur Souss */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Souss (Aït Melloul & Chtouka)
                    </span>
                    <Globe className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Station Export Primeurs (UE & UK)
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    « Pour nos camions frigo vers Perpignan et Rotterdam, compiler manuellement codes SH, certificats ONSSA et visas Foodex prenait 1h par camion. Avec AgriStock, le manifeste A4 avec QR Code est prêt en 30s. Aucun blocage à Tanger Med. »
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-emerald-800">
                  🚢 Résultat : 100% conformité douanière & 45 min gagnées par camion.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATEUR DE SÉCURITÉ ET GAIN FINANCIER */}
          {activeTabSub === 'simulator' && (
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-5">
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  Simulateur d&apos;Économie & Sécurisation d&apos;Impayés
                </h3>
                <p className="text-xs text-stone-500">
                  Calculez ce que vous perdez en moyenne sur le circuit informel vs ce que vous gagnez avec la garantie AgriStock.
                </p>
              </div>

              {/* Paramètres interactifs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Volume de la transaction
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={tradeVolumeTonnes}
                      onChange={e => setTradeVolumeTonnes(Number(e.target.value) || 1)}
                      className="w-full font-bold text-stone-900 bg-stone-50 p-2 rounded-lg border border-stone-200"
                    />
                    <span className="text-xs font-semibold text-stone-500">Tonnes</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Prix moyen négocié (MAD / Kg)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={pricePerKgMAD}
                      onChange={e => setPricePerKgMAD(Number(e.target.value) || 0.5)}
                      className="w-full font-bold text-stone-900 bg-stone-50 p-2 rounded-lg border border-stone-200"
                    />
                    <span className="text-xs font-semibold text-stone-500">MAD/Kg</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Taux d&apos;impayé / litige informel
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={defaultRateRisk}
                      onChange={e => setDefaultRateRisk(Number(e.target.value) || 0)}
                      className="w-full font-bold text-stone-900 bg-stone-50 p-2 rounded-lg border border-stone-200"
                    />
                    <span className="text-xs font-semibold text-stone-500">%</span>
                  </div>
                </div>
              </div>

              {/* Résultats du comparatif financier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                    Risque Réel sur Circuit Informel
                  </span>
                  <div className="text-xl font-black">
                    {Math.round(estimatedInformalLossMAD).toLocaleString('fr-FR')} MAD
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Montant moyen de pertes sèches causées par les chèques sans provision, décotes forcées au déchargement ou litiges variétaux.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Capital Net Préservé avec AgriStock
                  </span>
                  <div className="text-xl font-black text-emerald-800">
                    +{Math.round(netSavedCapitalMAD).toLocaleString('fr-FR')} MAD
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Paiement garanti à 100% sous séquestre bancaire après déduction de la commission de sécurisation de 1,5%.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec CTA */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {tr(
                language,
                'Plateforme adaptée aux réalités terrain du fellah et du négociant marocain',
                'منصة مصممة خصيصاً لواقع الفلاح والتاجر المغربي',
                'Platform built for Moroccan growers, nurseries and agricultural traders'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-100 transition cursor-pointer"
            >
              {tr(language, 'Fermer', 'إغلاق', 'Close')}
            </button>

            <button
              onClick={() => {
                onClose();
                setActiveTab('market');
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{tr(language, 'Accéder aux Marchés Sécurisés', 'الولوج إلى البورصة الفلاحية', 'Access Secure Market')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
