import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Trees,
  Flower2,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
  MapPin,
  Building2,
  Award,
  HelpCircle,
  X,
  Layers,
  Leaf,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { MoroccanRegion, NurseryOrientation } from '../types';
import { MOROCCAN_REGIONS } from '../data/mockData';

export const NurserySetupModal: React.FC = () => {
  const {
    language,
    isNurserySetupModalOpen,
    closeNurserySetupModal,
    userProfile,
    saveNurserySetupConfig,
  } = useApp();

  // Selected Primary Orientation: ornamental, arboriculture, or mixed
  const [selectedOrientation, setSelectedOrientation] = useState<NurseryOrientation>(() => {
    return userProfile.nurseryDetails?.orientation || 'ornamental';
  });

  // Station identification & credentials
  const [stationName, setStationName] = useState(() => {
    return (
      userProfile.nurseryDetails?.nurseryName ||
      userProfile.companyName ||
      (userProfile.displayName ? `Pépinière ${userProfile.displayName}` : 'Pépinière Moderne du Maroc')
    );
  });

  const [region, setRegion] = useState<MoroccanRegion>(() => {
    return userProfile.region || 'Marrakech - Safi (Haouz, El Kelaâ)';
  });

  const [city, setCity] = useState(() => {
    return userProfile.city || 'Marrakech';
  });

  const [hasOfficialOnssa, setHasOfficialOnssa] = useState(true);
  const [onssaApprovalNumber, setOnssaApprovalNumber] = useState(() => {
    return (
      userProfile.nurseryDetails?.onssaApprovalNumber ||
      `ONSSA-PEP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    );
  });

  const [annualCapacity, setAnnualCapacity] = useState<number>(() => {
    return userProfile.nurseryDetails?.annualSaplingCapacity || 75000;
  });

  // Selected production infrastructures
  const [infrastructures, setInfrastructures] = useState<string[]>([
    'Serres tunnels multi-chapelles',
    'Ombrières avec brumisation',
    'Zone de rempotage & conteneurs',
  ]);

  // Ornamental specialties
  const [ornamentalSpecialties, setOrnamentalSpecialties] = useState<string[]>([
    'Palmiers d’alignement (Washingtonia, Phoenix)',
    'Bougainvilliers royaux & grimpantes',
    'Arbustes de haies persistantes & brise-vent',
    'Sujets spécimens en conteneurs (C5 à C50)',
  ]);

  // Arboriculture specialties
  const [arboricultureSpecialties, setArboricultureSpecialties] = useState<string[]>([
    'Oliviers certifiés (Picholine Marocaine, Haouzia, Menara)',
    'Agrumes greffés sur Carrizo (Nadorcott, Clémentines, Orangers)',
    'Palmiers Dattiers Mejhoul (Vitroplants)',
    'Plants maraîchers greffés sous serre (Tomates, Poivrons)',
  ]);

  useEffect(() => {
    if (!isNurserySetupModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNurserySetupModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNurserySetupModalOpen, closeNurserySetupModal]);

  if (!isNurserySetupModalOpen) return null;

  const toggleInfrastructure = (infra: string) => {
    if (infrastructures.includes(infra)) {
      setInfrastructures(infrastructures.filter((i) => i !== infra));
    } else {
      setInfrastructures([...infrastructures, infra]);
    }
  };

  const handleValidateSetup = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenSpecialties =
      selectedOrientation === 'ornamental'
        ? ornamentalSpecialties
        : selectedOrientation === 'arboriculture'
        ? arboricultureSpecialties
        : [...ornamentalSpecialties, ...arboricultureSpecialties];

    saveNurserySetupConfig({
      nurseryName: stationName.trim(),
      orientation: selectedOrientation,
      region,
      city: city.trim(),
      onssaApprovalNumber: hasOfficialOnssa ? onssaApprovalNumber.trim() : 'En cours d’homologation',
      hasOfficialOnssa,
      annualCapacitySaplings: Number(annualCapacity) || 50000,
      infrastructures,
      specialties: chosenSpecialties,
      ornamentalDetails:
        selectedOrientation === 'ornamental' || selectedOrientation === 'mixed'
          ? {
              containerTypes: ['Conteneur C3', 'Conteneur C5', 'Conteneur C10', 'Conteneur C30 (30L)'],
              landscapeUsages: ['Villas & Résidentiel', 'Voirie urbaine', 'Hôtellerie', 'Espaces verts'],
              popularSpecies: ['Bougainvillea spectabilis', 'Washingtonia robusta', 'Nerium oleander'],
            }
          : undefined,
      arboricultureDetails:
        selectedOrientation === 'arboriculture' || selectedOrientation === 'mixed'
          ? {
              rootstocks: ['Citrange Carrizo', 'Bigaradier', 'Picholine franc', 'Citrus volkameriana'],
              fruitSpecies: ['Olivier', 'Clémentinier', 'Oranger', 'Palmier Dattier Mejhoul'],
              passportAutomated: true,
            }
          : undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="modal-nursery-setup"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl bg-stone-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-[#0e331b] to-stone-900 border-b border-emerald-500/30 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {tr(language, 'Étape Clé Post-Inscription', 'مرحلة أساسية بعد التسجيل', 'Key Post-Signup Step')}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                  ONSSA AgriStock v4.5
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {tr(
                  language,
                  'Configuration de votre Pépinière',
                  'إعداد وتخصيص المشتل الفلاحي',
                  'Nursery Station Setup'
                )}
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed max-w-xl">
                {tr(
                  language,
                  'Choisissez votre orientation principale (Ornementale vs Arboriculture) pour configurer automatiquement vos fiches de lots, vos conteneurs et votre rayon catalogue.',
                  'حدد التخصص الرئيسي لمشتلك (نباتات الزينة والمساحات الخضراء مقابل الأشجار المثمرة والأغراس) لضبط فضاء عملك وسجلاتك تلقائياً.',
                  'Choose your primary specialization (Ornamental vs Fruit Trees) to automatically adapt your plant batches, containers, and catalog view.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeNurserySetupModal}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            title={tr(language, 'Fermer', 'إغلاق', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleValidateSetup} className="p-6 space-y-6 overflow-y-auto">
          {/* SECTION 1: THE CORE CHOICE - ORNEMENTALE VS ARBORICULTURE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  {tr(
                    language,
                    '1. Orientation principale de votre Station Pépinière :',
                    '1. التخصص والتوجه الرئيسي للمشتل :',
                    '1. Primary Nursery Orientation :'
                  )}
                </span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-400">
                {tr(language, 'Modifiable à tout moment', 'يمكن تغييره لاحقاً في أي وقت', 'Can be changed anytime')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* CARTE 1 : ORNEMENTALE & ESPACES VERTS */}
              <div
                onClick={() => setSelectedOrientation('ornamental')}
                className={`relative rounded-2xl p-4.5 border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  selectedOrientation === 'ornamental'
                    ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'border-stone-800 bg-stone-950/60 hover:border-emerald-700/60 hover:bg-stone-900/60'
                }`}
              >
                {selectedOrientation === 'ornamental' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
                      🪴
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition">
                        {tr(
                          language,
                          'Pépinière Ornementale',
                          'مشتل نباتات الزينة',
                          'Ornamental Nursery'
                        )}
                      </h3>
                      <span className="text-[10px] text-teal-300 font-semibold block">
                        {tr(language, 'Espaces Verts & Paysagisme', 'المساحات الخضراء والتهيئة', 'Landscape & Green Spaces')}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {tr(
                      language,
                      'Palmiers d’alignement (Washingtonia), Bougainvilliers royaux, Lauriers-roses, Cactées & Succulentes, Arbustes de haies et gazon en rouleaux.',
                      'أشجار النخيل للتزيين (واشنطونيا)، الجهنمية، الدفلة، الصباريات، شجيرات التسييج وعشب المروج الجاهز.',
                      'Landscape palms, royal bougainvillea, oleander, succulents, hedges and turfgrass.'
                    )}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-[10px] text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>{tr(language, 'Tailles de conteneurs : C3, C5, C10, C30, 50L', 'أحجام الأصص والأكياس C3 إلى 50L', 'Container sizing: C3 to 50L')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>{tr(language, 'Variables de silhouette, tige & floraison', 'خصائص الساق والتفريع وألوان الأزهار', 'Stem height, shape & flowering colors')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>{tr(language, 'Marché : Villas, hôtels, promoteurs, voirie', 'الزبناء: الفيلات، الفنادق، التهيئة الحضرية', 'Target: Villas, hotels, urban projects')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-bold text-teal-400">
                  <span>{selectedOrientation === 'ornamental' ? '✓ ' + tr(language, 'Sélectionné', 'محدد', 'Selected') : tr(language, 'Choisir cette orientation', 'اختيار هذا التوجه', 'Select orientation')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* CARTE 2 : ARBORICULTURE FRUITIÈRE & MARAÎCHÈRE */}
              <div
                onClick={() => setSelectedOrientation('arboriculture')}
                className={`relative rounded-2xl p-4.5 border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  selectedOrientation === 'arboriculture'
                    ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'border-stone-800 bg-stone-950/60 hover:border-emerald-700/60 hover:bg-stone-900/60'
                }`}
              >
                {selectedOrientation === 'arboriculture' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                      🌳
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition">
                        {tr(
                          language,
                          'Arboriculture Fruitière',
                          'أشجار مثمرة وفلاحة',
                          'Fruit Trees & Orchards'
                        )}
                      </h3>
                      <span className="text-[10px] text-emerald-300 font-semibold block">
                        {tr(language, 'Vergers & Traçabilité ONSSA', 'البساتين وتتبع أونسا الرسمي', 'Commercial Orchards & ONSSA')}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {tr(
                      language,
                      'Oliviers certifiés (Picholine, Haouzia), Agrumes greffés Carrizo (Nadorcott), Palmiers Dattiers Mejhoul vitro, Avocatiers et plateaux maraîchers greffés.',
                      'أشجار الزيتون المعتمدة (بيشولين، حوزية)، الحوامض المطعمة (نذوركوت على كاريزو)، نخيل المجهول المخبري، الأفوكادو وشتلات الخضر.',
                      'Certified olive trees, grafted citrus on Carrizo, Mejhoul in-vitro date palms, avocados and vegetable plugs.'
                    )}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-[10px] text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{tr(language, 'Porte-greffes (PG) : Carrizo, Bigaradier, Franc', 'حوامل الطعوم المعتمدة كاريزو ورانجبور', 'Certified rootstocks: Carrizo, Sour orange')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{tr(language, 'Passeports phytosanitaires ONSSA officiels', 'جوازات المرور الصحية أونسا الرسمية', 'Official ONSSA phytosanitary passports')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{tr(language, 'Marché : Domaines agricoles, vergers, coopératives', 'الزبناء: الضيعات الكبرى، المزارعون، التعاونيات', 'Target: Large estates, orchards, growers')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                  <span>{selectedOrientation === 'arboriculture' ? '✓ ' + tr(language, 'Sélectionné', 'محدد', 'Selected') : tr(language, 'Choisir cette orientation', 'اختيار هذا التوجه', 'Select orientation')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* CARTE 3 : PÉPINIÈRE MIXTE (DOUBLE ORIENTATION) */}
              <div
                onClick={() => setSelectedOrientation('mixed')}
                className={`relative rounded-2xl p-4.5 border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  selectedOrientation === 'mixed'
                    ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                    : 'border-stone-800 bg-stone-950/60 hover:border-emerald-700/60 hover:bg-stone-900/60'
                }`}
              >
                {selectedOrientation === 'mixed' && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                      🌿
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition">
                        {tr(
                          language,
                          'Pépinière Polyvalente Mixte',
                          'مشتل مختلط شامل',
                          'Mixed / Polyvalent Nursery'
                        )}
                      </h3>
                      <span className="text-[10px] text-amber-300 font-semibold block">
                        {tr(language, 'Ornement & Arbres Fruitiers', 'نباتات زينة وأشجار مثمرة معاً', 'Both Ornamental & Fruit Trees')}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {tr(
                      language,
                      'Station complète produisant à la fois des sujets d’ornement pour paysagistes et des plants fruitiers certifiés pour exploitations agricoles.',
                      'محطة متكاملة تنتج في نفس الوقت شتلات الزينة لمهندسي الحدائق والأشجار المثمرة المعتمدة للضيعات الفلاحية.',
                      'Complete plant station producing both ornamental landscape plants and certified fruit trees.'
                    )}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-[10px] text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{tr(language, 'Catalogue scindé en 2 rayons distincts', 'فصل الكتالوج إلى قسمين متميزين', 'Catalog split in 2 distinct aisles')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{tr(language, 'Gestion unifiée des serres et des passeports', 'تدبير موحد للبيوت المغطاة والجوازات', 'Unified greenhouse and passport tracking')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{tr(language, 'Capacité d’approvisionnement élargie', 'قدرة تسويقية أوسع لجميع الزبناء', 'Broad commercial coverage')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-bold text-amber-400">
                  <span>{selectedOrientation === 'mixed' ? '✓ ' + tr(language, 'Sélectionné', 'محدد', 'Selected') : tr(language, 'Choisir cette orientation', 'اختيار هذا التوجه', 'Select orientation')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: STATION IDENTIFICATION & CREDENTIALS */}
          <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>
                {tr(
                  language,
                  '2. Coordonnées de la Station & Agrément Sanitaire ONSSA :',
                  '2. بيانات المحطة والاعتماد الصحي أونسا :',
                  '2. Station Details & ONSSA Sanitary Approval :'
                )}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {tr(language, 'Nom de l’Exploitation / Station Pépinière :', 'اسم المحطة أو المشتل :', 'Nursery Station Name :')}
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="ex: Pépinière Royale du Haouz, Domaine Agro-Plants..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-bold text-xs focus:border-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {tr(language, 'Région d’Implantation au Maroc :', 'الجهة الفلاحية بالمغرب :', 'Agricultural Region :')}
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as MoroccanRegion)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
                >
                  {MOROCCAN_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {tr(language, 'Ville / Commune pépinière :', 'المدينة / الجماعة الترابية :', 'City / Municipality :')}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="ex: Marrakech, Taroudant, Berkane, Kénitra, Fès..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {tr(language, 'Capacité annuelle estimée (Nombre de plants) :', 'القدرة الإنتاجية السنوية (عدد الشتلات) :', 'Annual Capacity (Plants count) :')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={annualCapacity}
                    onChange={(e) => setAnnualCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-emerald-300 font-bold text-xs focus:border-emerald-500 focus:outline-hidden"
                    required
                  />
                  <div className="flex gap-1 shrink-0">
                    {[25000, 75000, 200000].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setAnnualCapacity(cap)}
                        className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-mono text-stone-300"
                      >
                        {(cap / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ONSSA Sanitary Credentials Switch */}
            <div className="pt-2 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">
                    {tr(language, 'Agrément Sanitaire Officiel ONSSA', 'شهادة الاعتماد الصحي أونسا', 'Official ONSSA Sanitary Approval')}
                  </span>
                  <span className="block text-[10px] text-stone-400">
                    {tr(
                      language,
                      'Homologation obligatoire pour l’émission des passeports phytosanitaires officiels',
                      'اعتماد رسمي يخول إصدار جوازات المرور الصحية للشتلات',
                      'Mandatory approval to emit official plant phytosanitary passports'
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOfficialOnssa}
                    onChange={(e) => setHasOfficialOnssa(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-800 border-stone-700"
                  />
                  <span>{tr(language, 'Agrément actif', 'اعتماد نشط', 'Active approval')}</span>
                </label>

                {hasOfficialOnssa ? (
                  <input
                    type="text"
                    value={onssaApprovalNumber}
                    onChange={(e) => setOnssaApprovalNumber(e.target.value)}
                    placeholder="ONSSA-PEP-..."
                    className="px-3 py-1.5 rounded-lg bg-stone-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold"
                  />
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    {tr(language, 'En cours d’homologation', 'في طور المصادقة', 'Under review')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: INFRASTRUCTURES & PRODUCTION FACILITIES */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>
                {tr(
                  language,
                  '3. Infrastructures de culture disponibles dans votre pépinière :',
                  '3. البنيات التحتية المتوفرة بالمشتل :',
                  '3. Available Culture Infrastructures :'
                )}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Serres tunnels multi-chapelles',
                'Ombrières avec brumisation',
                'Zone de rempotage & conteneurs',
                'Planches de semis plein air',
                'Laboratoire In Vitro (Vitroplants)',
                'Système goutte-à-goutte dosé',
                'Substrats tourbe & fibre de coco',
                'Zone de quarantaine sanitaire',
              ].map((item) => {
                const isSelected = infrastructures.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInfrastructure(item)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className="line-clamp-2">{item}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons & Confirmation */}
          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-stone-900/95 backdrop-blur-md py-2">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {tr(
                  language,
                  'Votre Espace Pépinière sera immédiatement pré-configuré avec vos paramètres.',
                  'سيتم إعداد فضاء المشتل فوراً وفق المعايير التي اخترتموها.',
                  'Your Nursery Workspace will be immediately tuned with your preferences.'
                )}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={closeNurserySetupModal}
                className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 font-bold text-xs transition cursor-pointer"
              >
                {tr(language, 'Plus tard', 'لاحقاً', 'Later')}
              </button>

              <button
                id="btn-confirm-nursery-setup"
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {tr(
                    language,
                    'Valider & Ouvrir mon Espace Pépinière',
                    'تأكيد وفتح فضاء المشتل',
                    'Save & Open Nursery Dashboard'
                  )}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NurserySetupModal;
