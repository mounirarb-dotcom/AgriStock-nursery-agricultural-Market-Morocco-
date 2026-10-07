import React, { useState, useEffect } from 'react';
import {
  sanitizeText,
  sanitizeNumber,
  sanitizeUrl,
  globalClientRateLimiter,
} from '../utils/securityUtils';
import {
  GrowthStage,
  HealthStatus,
  MoroccanRegion,
  NurseryCategory,
  NurseryLot,
  NurseryOrnamentalDetails,
  ONSSAStatus,
} from '../types';
import { MOROCCAN_REGIONS, NURSERY_CATEGORIES, GROWTH_STAGES, ONSSA_OPTIONS } from '../data/mockData';
import { NURSERY_PHOTO_PRESETS, NurseryPhotoPreset } from '../data/nurseryPhotoPresets';
import { PhotoUploadCapture } from './PhotoUploadCapture';
import { useApp } from '../context/AppContext';
import {
  X,
  Sprout,
  Check,
  TreePine,
  Flower2,
  Salad,
  Sparkles,
  Sun,
  Droplets,
  Ruler,
  Maximize2,
  Layers,
  ShieldCheck,
  Info,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Image,
} from 'lucide-react';

interface Props {
  isOpen?: boolean;
  initialLot?: NurseryLot | null;
  onClose: () => void;
  onSave?: (lotData: any) => void;
}

type MainCategoryType = 'ORNAMENTAL' | 'FRUIT_TREES' | 'VEGETABLES' | 'TERROIR_OTHER';

export const NurseryLotFormModal: React.FC<Props> = ({
  isOpen = true,
  initialLot,
  onClose,
  onSave,
}) => {
  const { userProfile } = useApp();
  // Handle ESC key to dismiss modal
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

  // Determine initial high-level category type
  const getInitialMainType = (cat?: string): MainCategoryType => {
    if (!cat) return 'ORNAMENTAL';
    if (cat.includes('Ornement')) return 'ORNAMENTAL';
    if (cat.includes('Arboriculture') || cat.includes('Fruiter') || cat.includes('Arbres Fruitiers') || cat.includes('Fruit')) return 'FRUIT_TREES';
    if (cat.includes('Maraîch') || cat.includes('Légume')) return 'VEGETABLES';
    return 'TERROIR_OTHER';
  };

  const [mainType, setMainType] = useState<MainCategoryType>(
    getInitialMainType(initialLot?.category)
  );

  const [category, setCategory] = useState<NurseryCategory>(
    initialLot?.category ||
      'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)'
  );

  const [batchNumber, setBatchNumber] = useState(
    initialLot?.batchNumber || `LOT-2025-${Math.floor(100 + Math.random() * 900)}`
  );
  const [species, setSpecies] = useState(
    initialLot?.species ||
      (initialLot?.category?.includes('Ornement')
        ? 'Bougainvillier (Bougainvillea spectabilis)'
        : 'Olivier (Olea europaea)')
  );
  const [variety, setVariety] = useState(
    initialLot?.variety ||
      (initialLot?.category?.includes('Ornement')
        ? 'Bougainvillier Violet Pourpre & Fuchsia'
        : 'Picholine Marocaine')
  );

  // Fruit trees & general propagation variables
  const [rootstock, setRootstock] = useState(initialLot?.rootstock || 'Citrange Carrizo');
  const [propagationMethod, setPropagationMethod] = useState<NurseryLot['propagationMethod']>(
    initialLot?.propagationMethod || 'Bouturage'
  );
  const [stage, setStage] = useState<GrowthStage>(
    initialLot?.stage || 'Prêt à la plantation (Commercialisable)'
  );

  // Ornamental specific variables (Landscape & Ornamental horticulture)
  const [ornamentalType, setOrnamentalType] = useState<
    NonNullable<NurseryOrnamentalDetails['ornamentalType']>
  >(initialLot?.ornamentalDetails?.ornamentalType || 'Arbuste & Haie décorative');

  const [plantForm, setPlantForm] = useState<NonNullable<NurseryOrnamentalDetails['plantForm']>>(
    initialLot?.ornamentalDetails?.plantForm || 'Grimpante sur tuteur / Bambou'
  );

  const [plantHeight, setPlantHeight] = useState<string>(
    initialLot?.ornamentalDetails?.plantHeight || '80-100 cm'
  );

  const [trunkCircumference, setTrunkCircumference] = useState<string>(
    initialLot?.ornamentalDetails?.trunkCircumference || 'Calibre 10/12'
  );

  const [palmStipeHeight, setPalmStipeHeight] = useState<string>(
    initialLot?.ornamentalDetails?.palmStipeHeight || 'Stipe 100 cm'
  );

  const [sunExposure, setSunExposure] = useState<
    NonNullable<NurseryOrnamentalDetails['sunExposure']>
  >(initialLot?.ornamentalDetails?.sunExposure || 'Plein soleil');

  const [waterRequirement, setWaterRequirement] = useState<
    NonNullable<NurseryOrnamentalDetails['waterRequirement']>
  >(
    initialLot?.ornamentalDetails?.waterRequirement ||
      'Faible (Xérophyte / Résistant sécheresse)'
  );

  const [foliageType, setFoliageType] = useState<
    NonNullable<NurseryOrnamentalDetails['foliageType']>
  >(initialLot?.ornamentalDetails?.foliageType || 'Persistant');

  const [floweringSeason, setFloweringSeason] = useState<string>(
    initialLot?.ornamentalDetails?.floweringSeason || 'Printemps à Automne (9 mois)'
  );

  const [flowerColor, setFlowerColor] = useState<string>(
    initialLot?.ornamentalDetails?.flowerColor || 'Violet Pourpre'
  );

  const [landscapeUsage, setLandscapeUsage] = useState<string>(
    initialLot?.ornamentalDetails?.landscapeUsage || 'Haie brise-vue & Pergola'
  );

  // General inventory & commercial variables
  const [quantityTotal, setQuantityTotal] = useState(initialLot?.quantityTotal || 1500);
  const [quantityAvailable, setQuantityAvailable] = useState(
    initialLot?.quantityAvailable || 1500
  );
  const [quantityReserved, setQuantityReserved] = useState(initialLot?.quantityReserved || 0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>(
    initialLot?.lowStockThreshold ?? ''
  );
  const [unitPriceMAD, setUnitPriceMAD] = useState(initialLot?.unitPriceMAD || 45.0);

  const [containerType, setContainerType] = useState<string>(
    initialLot?.containerType ||
      (initialLot?.category?.includes('Ornement') ? 'Conteneur C3 (3 Litres)' : 'Sachet PE 3L')
  );

  const [greenhouseLocation, setGreenhouseLocation] = useState(
    initialLot?.greenhouseLocation || 'Serre Ornementale A2 - Ombragée'
  );
  const [seedingOrGraftDate, setSeedingOrGraftDate] = useState(
    initialLot?.seedingOrGraftDate || new Date().toISOString().split('T')[0]
  );
  const [estimatedReadyDate, setEstimatedReadyDate] = useState(
    initialLot?.estimatedReadyDate || '2025-10-15'
  );
  const [onssaStatus, setOnssaStatus] = useState<ONSSAStatus>(
    initialLot?.onssaStatus || 'ONSSA Certifié (Catégorie Bleue)'
  );
  const [phytosanitaryPassportNumber, setPhytosanitaryPassportNumber] = useState(
    initialLot?.phytosanitaryPassportNumber ||
      `ONSSA-MA-2025-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(
    initialLot?.healthStatus || 'Excellent'
  );
  const [region, setRegion] = useState<MoroccanRegion>(
    initialLot?.region || 'Marrakech - Safi (Haouz, El Kelaâ)'
  );
  const [notes, setNotes] = useState(initialLot?.notes || '');
  const [imageUrl, setImageUrl] = useState(
    initialLot?.imageUrl ||
      '/src/assets/images/nursery_citrus_sapling_1789031045474.jpg'
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    initialLot?.additionalImages || []
  );
  const [isCustomPhoto, setIsCustomPhoto] = useState(initialLot?.isCustomPhoto || false);
  const [selectedPhotoDept, setSelectedPhotoDept] = useState<'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE'>(
    initialLot?.category?.toLowerCase().includes('ornement')
      ? 'ORNEMENTALE'
      : initialLot?.category?.toLowerCase().includes('maraîch') || initialLot?.category?.toLowerCase().includes('légum')
      ? 'MARAICHAGE'
      : 'ARBORICULTURE'
  );
  const [autoFillBotanyWithPhoto, setAutoFillBotanyWithPhoto] = useState(false);

  // Switch category and adapt defaults
  const handleSelectMainType = (type: MainCategoryType) => {
    setMainType(type);
    if (type === 'ORNAMENTAL') {
      setSelectedPhotoDept('ORNEMENTALE');
      setCategory(
        'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)'
      );
      if (!initialLot) {
        setSpecies('Bougainvillier (Bougainvillea spectabilis)');
        setVariety('Bougainvillier Violet Pourpre & Fuchsia');
        setContainerType('Conteneur C3 (3 Litres)');
        setUnitPriceMAD(35.0);
        setGreenhouseLocation('Ombrière Ornementale B - Marrakech');
        setImageUrl('/src/assets/images/ornement_bougainvillea_pot_1790004558833.jpg');
        setNotes(
          'Tuteuré bambou 90cm. Idéal haies fleuries, balcons et pergolas en climat marocain.'
        );
      }
    } else if (type === 'FRUIT_TREES') {
      setSelectedPhotoDept('ARBORICULTURE');
      setCategory('Arbres Fruitiers (Agrumes, Olivier, Palmier...)');
      if (!initialLot) {
        setSpecies('Clémentinier (Citrus clementina)');
        setVariety('Nadorcott Afourer certifié');
        setRootstock('Citrange Carrizo');
        setPropagationMethod('Greffage');
        setContainerType('Sachet PE 3L');
        setUnitPriceMAD(28.0);
        setGreenhouseLocation('Serre A1 - Berkane Ouest');
        setImageUrl('/src/assets/images/nursery_citrus_sapling_1789031045474.jpg');
        setNotes(
          'Greffon certifié indemne de virose, conforme homologation ONSSA pour subventions vergers.'
        );
      }
    } else if (type === 'VEGETABLES') {
      setSelectedPhotoDept('MARAICHAGE');
      setCategory('Jeunes Plants de Légumes & Maraîchage (Tomate, Poivron, Pastèque, Oignon...)');
      if (!initialLot) {
        setSpecies('Tomate de Serre (Solanum lycopersicum)');
        setVariety('Tomate Ronde Greffée sur Maxifort');
        setRootstock('Maxifort F1');
        setPropagationMethod('Greffage');
        setContainerType('Plateau alvéolé 104');
        setUnitPriceMAD(2.8);
        setQuantityAvailable(30000);
        setQuantityTotal(30000);
        setGreenhouseLocation('Chambre de greffage Chtouka');
        setImageUrl('/src/assets/images/nursery_tomato_plugtrays_1789031062934.jpg');
        setNotes(
          'Plants vigoureux avec système racinaire aéré prêt pour repiquage sous serre maraîchère.'
        );
      }
    } else {
      setSelectedPhotoDept('ARBORICULTURE');
      setCategory('Arganier & Plantes Terroir');
      if (!initialLot) {
        setSpecies('Arganier (Argania spinosa)');
        setVariety('Arganier Sélectionné Terroir Souss');
        setContainerType('Pot 2L');
        setUnitPriceMAD(22.0);
        setGreenhouseLocation('Pépinière Terroir Taroudant');
        setImageUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
        setNotes('Semis résistant au stress hydrique pour projets de reboisement de l\'Arganeraie.');
      }
    }
  };

  const handleSelectPhotoPreset = (preset: NurseryPhotoPreset) => {
    setImageUrl(preset.imageUrl);
    if (autoFillBotanyWithPhoto || !species || species === '') {
      setSpecies(preset.species);
      setVariety(preset.defaultVariety);
      setContainerType(preset.recommendedContainer);
      if (preset.category) setCategory(preset.category);
      if (preset.notesSuggestion && (!notes || notes === '')) {
        setNotes(preset.notesSuggestion);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // OWASP Rate Limiting guard
    const rate = globalClientRateLimiter.check('nursery:saveLot', 12, 60000);
    if (!rate.allowed) {
      alert(`Trop d'actions consécutives. Veuillez patienter ${Math.ceil(rate.retryAfterMs / 1000)}s.`);
      return;
    }

    const ornamentalDetails: NurseryOrnamentalDetails | undefined =
      mainType === 'ORNAMENTAL'
        ? {
            ornamentalType,
            plantForm,
            plantHeight: sanitizeText(plantHeight, 60),
            trunkCircumference: plantForm.includes('Tige') ? sanitizeText(trunkCircumference, 60) : undefined,
            palmStipeHeight: ornamentalType.includes('Palmier') ? sanitizeText(palmStipeHeight, 60) : undefined,
            sunExposure,
            waterRequirement,
            foliageType,
            floweringSeason: sanitizeText(floweringSeason, 60),
            flowerColor: sanitizeText(flowerColor, 60),
            landscapeUsage: sanitizeText(landscapeUsage, 200),
          }
        : undefined;

    const payload = {
      userId: initialLot?.userId || userProfile?.id,
      sellerName: initialLot?.sellerName || userProfile?.companyName || userProfile?.displayName || 'Pépinière Agréée',
      sellerPhone: initialLot?.sellerPhone || userProfile?.phone,
      sellerEmail: initialLot?.sellerEmail || userProfile?.email,
      batchNumber: sanitizeText(batchNumber, 60),
      species: sanitizeText(species, 80),
      variety: sanitizeText(variety, 80),
      category,
      rootstock: mainType === 'ORNAMENTAL' ? undefined : sanitizeText(rootstock, 80),
      propagationMethod,
      stage,
      quantityTotal: sanitizeNumber(quantityTotal, { min: 0, max: 10000000 }),
      quantityAvailable: sanitizeNumber(quantityAvailable, { min: 0, max: 10000000 }),
      quantityReserved: sanitizeNumber(quantityReserved, { min: 0, max: 10000000 }),
      unitPriceMAD: sanitizeNumber(unitPriceMAD, { min: 0.1, max: 10000000 }),
      containerType: sanitizeText(containerType, 100),
      greenhouseLocation: sanitizeText(greenhouseLocation, 100),
      seedingOrGraftDate: sanitizeText(seedingOrGraftDate, 30),
      estimatedReadyDate: sanitizeText(estimatedReadyDate, 30),
      onssaStatus,
      phytosanitaryPassportNumber: sanitizeText(phytosanitaryPassportNumber, 80),
      healthStatus,
      region,
      notes: sanitizeText(notes, 2000),
      imageUrl: sanitizeUrl(imageUrl),
      additionalImages: additionalImages.map(url => sanitizeUrl(url)).filter(Boolean),
      isCustomPhoto,
      lowStockThreshold:
        lowStockThreshold !== '' && !isNaN(Number(lowStockThreshold))
          ? sanitizeNumber(lowStockThreshold, { min: 0, max: 1000000 })
          : undefined,
      treatments: initialLot?.treatments || [],
      ornamentalDetails,
    };

    if (onSave) {
      onSave(payload);
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {initialLot ? 'Modifier le Lot de Pépinière' : 'Ajouter un Nouveau Lot au Stock'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Formulaire agronomique adapté selon la spécialité (Plantes d'Ornement / Arboriculture / Maraîchage)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
            title="Fermer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ÉTAPE 1 OBLIGATOIRE : CHOIX DE LA CATÉGORIE EN PREMIER */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-stone-50 via-emerald-50/30 to-purple-50/30 border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Choisir la Catégorie de Pépinière en Premier :
              </span>
            </div>
            <span className="text-[10px] text-stone-500 italic hidden sm:inline">
              (Adapte automatiquement les variables du formulaire)
            </span>
          </div>

          {/* Large Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Card 1: Plantes Ornementales & Espaces Verts */}
            <button
              id="cat-btn-ornamental"
              type="button"
              onClick={() => handleSelectMainType('ORNAMENTAL')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative active:scale-98 ${
                mainType === 'ORNAMENTAL'
                  ? 'bg-purple-900 text-white border-purple-600 shadow-md ring-2 ring-purple-500/40'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    mainType === 'ORNAMENTAL' ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  <Flower2 className="w-4 h-4" />
                </div>
                {mainType === 'ORNAMENTAL' && (
                  <Check className="w-3.5 h-3.5 text-purple-300" />
                )}
              </div>
              <p className="text-xs font-black leading-tight">Plantes d'Ornement</p>
              <p
                className={`text-[9.5px] mt-1 leading-tight ${
                  mainType === 'ORNAMENTAL' ? 'text-purple-200' : 'text-stone-500'
                }`}
              >
                Palmiers, Arbustes, Grimpantes, Cactées, Gazon naturel
              </p>
            </button>

            {/* Card 2: Arbres Fruitiers & Agrumes */}
            <button
              id="cat-btn-fruittrees"
              type="button"
              onClick={() => handleSelectMainType('FRUIT_TREES')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative active:scale-98 ${
                mainType === 'FRUIT_TREES'
                  ? 'bg-amber-900 text-white border-amber-600 shadow-md ring-2 ring-amber-500/40'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    mainType === 'FRUIT_TREES' ? 'bg-amber-800 text-amber-200' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <TreePine className="w-4 h-4" />
                </div>
                {mainType === 'FRUIT_TREES' && (
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                )}
              </div>
              <p className="text-xs font-black leading-tight">Arbres Fruitiers</p>
              <p
                className={`text-[9.5px] mt-1 leading-tight ${
                  mainType === 'FRUIT_TREES' ? 'text-amber-200' : 'text-stone-500'
                }`}
              >
                Agrumes, Oliviers, Avocatiers, Pommiers, Dattiers, Porte-greffes
              </p>
            </button>

            {/* Card 3: Plants Maraîchers & Semis */}
            <button
              id="cat-btn-vegetables"
              type="button"
              onClick={() => handleSelectMainType('VEGETABLES')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative active:scale-98 ${
                mainType === 'VEGETABLES'
                  ? 'bg-emerald-900 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/40'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    mainType === 'VEGETABLES' ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Salad className="w-4 h-4" />
                </div>
                {mainType === 'VEGETABLES' && (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                )}
              </div>
              <p className="text-xs font-black leading-tight">Plants Maraîchers</p>
              <p
                className={`text-[9.5px] mt-1 leading-tight ${
                  mainType === 'VEGETABLES' ? 'text-emerald-200' : 'text-stone-500'
                }`}
              >
                Tomates, Poivrons, Pastèques, Melons en plateaux alvéolés
              </p>
            </button>

            {/* Card 4: Aromatiques, Terroir & Autres */}
            <button
              id="cat-btn-terroir"
              type="button"
              onClick={() => handleSelectMainType('TERROIR_OTHER')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition relative active:scale-98 ${
                mainType === 'TERROIR_OTHER'
                  ? 'bg-stone-900 text-white border-stone-600 shadow-md ring-2 ring-stone-500/40'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    mainType === 'TERROIR_OTHER' ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                </div>
                {mainType === 'TERROIR_OTHER' && (
                  <Check className="w-3.5 h-3.5 text-stone-300" />
                )}
              </div>
              <p className="text-xs font-black leading-tight">Terroir & Forestiers</p>
              <p
                className={`text-[9.5px] mt-1 leading-tight ${
                  mainType === 'TERROIR_OTHER' ? 'text-stone-300' : 'text-stone-500'
                }`}
              >
                Arganier du Souss, Romarin, Thym, Cyprès, Petits Fruits
              </p>
            </button>
          </div>

          {/* Quick Inspirations Chips based on current category */}
          <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-stone-600 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Inspirations & Modèles rapides :
            </span>

            {mainType === 'ORNAMENTAL' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Palmier d\'Ornement (Washingtonia robusta)');
                    setVariety('Washingtonia Robusta de Californie & Maroc');
                    setOrnamentalType('Palmier, Yucca & Cycas');
                    setPlantForm('Arbre Tige (tronc unique)');
                    setPlantHeight('175-200 cm');
                    setPalmStipeHeight('Stipe 100 cm');
                    setContainerType('Conteneur C10 / C15');
                    setSunExposure('Plein soleil');
                    setWaterRequirement('Faible (Xérophyte / Résistant sécheresse)');
                    setLandscapeUsage('Alignement voirie & avenues');
                    setUnitPriceMAD(120);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Grand sujet d\'alignement urbain, hôtels et villas. Résistance vent et sécheresse.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-100/80 hover:bg-purple-200 text-purple-900 text-[10.5px] font-semibold border border-purple-200 transition"
                >
                  🌴 Palmier Washingtonia Stipe 1m
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Bougainvillier (Bougainvillea spectabilis)');
                    setVariety('Bougainvillier Violet Pourpre & Fuchsia');
                    setOrnamentalType('Plante grimpante');
                    setPlantForm('Grimpante sur tuteur / Bambou');
                    setPlantHeight('100-125 cm');
                    setContainerType('Conteneur C3 (3 Litres)');
                    setSunExposure('Plein soleil');
                    setFlowerColor('Violet Pourpre');
                    setFloweringSeason('Printemps à Automne (9 mois)');
                    setLandscapeUsage('Haie brise-vue & Pergola');
                    setUnitPriceMAD(35);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1596724898858-6931754027fb?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Grimpante très florifère, tuteurée bambou 90cm. Idéale clôtures et pergolas.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-100/80 hover:bg-purple-200 text-purple-900 text-[10.5px] font-semibold border border-purple-200 transition"
                >
                  🌺 Bougainvillier tuteuré C3
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Laurier-rose (Nerium oleander)');
                    setVariety('Laurier-rose d\'Alger blanc et rose');
                    setOrnamentalType('Arbuste & Haie décorative');
                    setPlantForm('Touffe / Buisson ramifié');
                    setPlantHeight('80-100 cm');
                    setContainerType('Conteneur C5 (5 Litres)');
                    setSunExposure('Plein soleil');
                    setWaterRequirement('Faible (Xérophyte / Résistant sécheresse)');
                    setLandscapeUsage('Haie brise-vue & Clôture');
                    setUnitPriceMAD(22);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1586968293593-433084eb67be?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Haie rustique persistante très dense. Excellente résistance à la chaleur et aux embruns.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-100/80 hover:bg-purple-200 text-purple-900 text-[10.5px] font-semibold border border-purple-200 transition"
                >
                  🌸 Laurier-rose Haie C5
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Jacaranda (Jacaranda mimosifolia)');
                    setVariety('Jacaranda à fleurs bleues mauves');
                    setOrnamentalType('Arbre d\'alignement & ombrage');
                    setPlantForm('Arbre Tige (tronc unique)');
                    setPlantHeight('2.5-3 m');
                    setTrunkCircumference('Calibre 10/12');
                    setContainerType('Conteneur C25 / C35 (Gros sujet)');
                    setSunExposure('Plein soleil');
                    setFlowerColor('Bleu Mauve');
                    setLandscapeUsage('Alignement voirie & avenues');
                    setUnitPriceMAD(380);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Arbre d\'alignement majestueux. Floraison bleue spectaculaire en mai-juin.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-100/80 hover:bg-purple-200 text-purple-900 text-[10.5px] font-semibold border border-purple-200 transition"
                >
                  🌳 Jacaranda Tige 10/12
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Gazon Naturel en Rouleaux (Paspalum vaginatum)');
                    setVariety('Paspalum SeaIsle 2000');
                    setOrnamentalType('Gazon naturel en rouleaux');
                    setPlantForm('Rampant / Tapissant');
                    setContainerType('Rouleaux / Plaques m²');
                    setSunExposure('Plein soleil');
                    setWaterRequirement('Faible (Xérophyte / Résistant sécheresse)');
                    setLandscapeUsage('Pelouse prestige, golf & villa');
                    setUnitPriceMAD(38);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Gazon déplaqué le jour même. Haute tolérance salinité de l\'eau et piétinement intense.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-100/80 hover:bg-purple-200 text-purple-900 text-[10.5px] font-semibold border border-purple-200 transition"
                >
                  🌾 Gazon Paspalum Rouleaux m²
                </button>
              </>
            )}

            {mainType === 'FRUIT_TREES' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Clémentinier (Citrus clementina)');
                    setVariety('Nadorcott Afourer certifié');
                    setRootstock('Citrange Carrizo (Tolérant Tristeza)');
                    setContainerType('Sachet PE 3L');
                    setUnitPriceMAD(28);
                    setGreenhouseLocation('Serre A1 - Berkane');
                    setImageUrl(
                      'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Greffon indemne de virose, conforme certification ONSSA catégorie bleue.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10.5px] font-semibold border border-amber-200 transition"
                >
                  🍊 Clémentinier Nadorcott PE 3L
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Olivier (Olea europaea)');
                    setVariety('Picholine Marocaine Sélectionnée');
                    setRootstock('Picholine Franc de semis');
                    setContainerType('Pot 2L');
                    setUnitPriceMAD(18.5);
                    setGreenhouseLocation('Serre 2 - Haouz Marrakech');
                    setImageUrl(
                      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Plants certifiés ONSSA pour subventions Génération Green.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10.5px] font-semibold border border-amber-200 transition"
                >
                  🫒 Olivier Picholine Pot 2L
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Avocatier (Persea americana)');
                    setVariety('Hass greffé sur Duke 7');
                    setRootstock('Duke 7 (Tolérant Phytophthora)');
                    setContainerType('Pot 5L');
                    setUnitPriceMAD(75);
                    setGreenhouseLocation('Serre Ombragée Larache');
                    setImageUrl(
                      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Greffage réussi avec bourgeon terminal actif. Calibre supérieur.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10.5px] font-semibold border border-amber-200 transition"
                >
                  🥑 Avocatier Hass Greffé Pot 5L
                </button>
              </>
            )}

            {mainType === 'VEGETABLES' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Tomate de Serre (Solanum lycopersicum)');
                    setVariety('Tomate Ronde Greffée Maxifort');
                    setRootstock('Maxifort F1');
                    setContainerType('Plateau alvéolé 104');
                    setUnitPriceMAD(2.8);
                    setQuantityAvailable(35000);
                    setQuantityTotal(35000);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Plants vigoureux avec système racinaire aéré.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10.5px] font-semibold border border-emerald-200 transition"
                >
                  🍅 Tomate Greffée Maxifort
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies('Pastèque (Citrullus lanatus)');
                    setVariety('Pastèque Ronde Précoce F1');
                    setRootstock('Carnivor F1');
                    setContainerType('Plateau alvéolé 104');
                    setUnitPriceMAD(2.5);
                    setQuantityAvailable(25000);
                    setQuantityTotal(25000);
                    setImageUrl(
                      'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80'
                    );
                    setNotes('Idéal primeurs Zagora / Taroudant.');
                  }}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10.5px] font-semibold border border-emerald-200 transition"
                >
                  🍉 Pastèque Greffée Alvéoles
                </button>
              </>
            )}

            {mainType === 'TERROIR_OTHER' && (
              <button
                type="button"
                onClick={() => {
                  setSpecies('Arganier (Argania spinosa)');
                  setVariety('Arganier Sélectionné Terroir Souss');
                  setContainerType('Pot 2L');
                  setUnitPriceMAD(22);
                  setImageUrl(
                    'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80'
                  );
                  setNotes('Semis résistant au stress hydrique.');
                }}
                className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-900 text-[10.5px] font-semibold border border-stone-300 transition"
              >
                🌿 Arganier du Souss
              </button>
            )}
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* SECTION A: IDENTIFICATION DU LOT */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white font-black text-[10px] flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                Identification & Botanique
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  N° de Lot (Traçabilité)
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-stone-900 font-semibold bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {mainType === 'ORNAMENTAL' ? 'Espèce Paysagère / Botanique' : 'Espèce Botanique'}
                </label>
                <input
                  type="text"
                  value={species}
                  onChange={e => setSpecies(e.target.value)}
                  placeholder={
                    mainType === 'ORNAMENTAL'
                      ? 'ex: Washingtonia robusta, Bougainvillea spectabilis...'
                      : 'ex: Olivier (Olea europaea), Citrus clementina...'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {mainType === 'ORNAMENTAL'
                    ? 'Variété / Nom commercial / Couleur'
                    : 'Variété / Cultivar'}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  placeholder={
                    mainType === 'ORNAMENTAL'
                      ? 'ex: Violet Pourpre, Ficus nitida, Laurier blanc...'
                      : 'ex: Picholine Marocaine, Nadorcott, Hass...'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-bold bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION B : VARIABLES SPÉCIFIQUES SELON LA CATÉGORIE CHOISIE */}
          {mainType === 'ORNAMENTAL' ? (
            /* ========================================================
               VARIABLES SPÉCIFIQUES : PLANTES D'ORNEMENT & PAYSAGISME
               ======================================================== */
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Flower2 className="w-4 h-4 text-purple-700" />
                    <h4 className="font-bold text-purple-950 uppercase text-xs tracking-wider">
                      Variables Spécifiques Plantes d'Ornement & Espaces Verts
                    </h4>
                  </div>
                </div>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold border border-purple-300">
                  Paysagisme & Espaces Verts
                </span>
              </div>

              {/* Row 1: Type d'ornement & Silhouette / Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">
                    Famille / Type d'Ornement :
                  </label>
                  <select
                    value={ornamentalType}
                    onChange={e =>
                      setOrnamentalType(e.target.value as NonNullable<NurseryOrnamentalDetails['ornamentalType']>)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-purple-300 text-stone-900 bg-white font-medium shadow-xs"
                  >
                    <option value="Arbuste & Haie décorative">Arbuste & Haie décorative (Bougainvillier, Laurier-rose, Hibiscus...)</option>
                    <option value="Palmier, Yucca & Cycas">Palmier, Yucca & Cycas (Washingtonia, Phoenix, Chamaerops Doum...)</option>
                    <option value="Arbre d'alignement & ombrage">Arbre d'alignement & ombrage (Jacaranda, Ficus nitida, Faux-poivrier...)</option>
                    <option value="Cactée, Succulente & Agave">Cactée, Succulente & Agave (Agave attenuata, Aloe vera, Yucca...)</option>
                    <option value="Plante grimpante">Plante grimpante (Jasmin étoilé, Bougainvillée, Lierre, Bignone...)</option>
                    <option value="Vivace, Graminée & Couvre-sol">Vivace, Graminée & Couvre-sol (Strelitzia, Pennisetum, Lavande...)</option>
                    <option value="Gazon naturel en rouleaux">Gazon naturel en rouleaux / plaques (Paspalum, Kikuyu, Cynodon...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">
                    Port & Silhouette paysagère :
                  </label>
                  <select
                    value={plantForm}
                    onChange={e =>
                      setPlantForm(e.target.value as NonNullable<NurseryOrnamentalDetails['plantForm']>)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-purple-300 text-stone-900 bg-white font-medium shadow-xs"
                  >
                    <option value="Arbre Tige (tronc unique)">Arbre Tige (tronc unique dégagé)</option>
                    <option value="Cépée (multi-troncs)">Cépée (multi-troncs naturels décoratifs)</option>
                    <option value="Touffe / Buisson ramifié">Touffe / Buisson ramifié (Idéal haie & massif)</option>
                    <option value="Pyramide / Topiaire">Pyramide / Cône ou Boule topiaire</option>
                    <option value="Grimpante sur tuteur / Bambou">Grimpante sur tuteur bambou / échalas</option>
                    <option value="Rampant / Tapissant">Rampant / Tapissant / Couvre-sol</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Dimensions / Calibres ornementaux */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-purple-200">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-purple-700" />
                    Hauteur du Sujet :
                  </label>
                  <select
                    value={plantHeight}
                    onChange={e => setPlantHeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white font-semibold"
                  >
                    <option value="40-60 cm">40 - 60 cm</option>
                    <option value="60-80 cm">60 - 80 cm</option>
                    <option value="80-100 cm">80 - 100 cm</option>
                    <option value="100-125 cm">100 - 125 cm</option>
                    <option value="125-150 cm">125 - 150 cm</option>
                    <option value="150-175 cm">150 - 175 cm</option>
                    <option value="175-200 cm">175 - 200 cm (2 mètres)</option>
                    <option value="200-250 cm">2.00 m - 2.50 m</option>
                    <option value="2.5-3 m">2.50 m - 3.00 m</option>
                    <option value="3.5-4 m+">3.50 m - 4.00 m+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-purple-700" />
                    Circonf. Tronc (Arbres tiges) :
                  </label>
                  <select
                    value={trunkCircumference}
                    onChange={e => setTrunkCircumference(e.target.value)}
                    disabled={!plantForm.includes('Tige')}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-stone-900 font-semibold ${
                      !plantForm.includes('Tige')
                        ? 'bg-stone-100 border-stone-200 text-stone-400'
                        : 'bg-white border-stone-300'
                    }`}
                  >
                    <option value="Calibre 8/10">Calibre 8/10 cm (circonf. à 1m)</option>
                    <option value="Calibre 10/12">Calibre 10/12 cm</option>
                    <option value="Calibre 12/14">Calibre 12/14 cm</option>
                    <option value="Calibre 14/16">Calibre 14/16 cm</option>
                    <option value="Calibre 16/18">Calibre 16/18 cm</option>
                    <option value="Calibre 20/25">Calibre 20/25 cm (Gros sujet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-purple-700" />
                    Stipe net (Palmiers) :
                  </label>
                  <select
                    value={palmStipeHeight}
                    onChange={e => setPalmStipeHeight(e.target.value)}
                    disabled={!ornamentalType.includes('Palmier')}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-stone-900 font-semibold ${
                      !ornamentalType.includes('Palmier')
                        ? 'bg-stone-100 border-stone-200 text-stone-400'
                        : 'bg-white border-stone-300'
                    }`}
                  >
                    <option value="Stipe 30-50 cm">Stipe 30 - 50 cm</option>
                    <option value="Stipe 80-100 cm">Stipe 80 - 100 cm (1 mètre)</option>
                    <option value="Stipe 1.20-1.50 m">Stipe 1.20 m - 1.50 m</option>
                    <option value="Stipe 1.80-2 m">Stipe 1.80 m - 2.00 m</option>
                    <option value="Stipe 2.5 m+">Stipe 2.50 m et plus</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Conditionnement Litrage Pot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    Contenant / Litrage Pot :
                  </label>
                  <select
                    value={containerType}
                    onChange={e => setContainerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-purple-300 text-stone-900 bg-white font-bold"
                  >
                    <option value="Conteneur C3 (3 Litres)">Conteneur C3 (3 Litres - Jeune arbuste)</option>
                    <option value="Conteneur C5 (5 Litres)">Conteneur C5 (5 Litres - Arbuste établi)</option>
                    <option value="Conteneur C7 / C10">Conteneur C7 / C10 (7 à 10 Litres)</option>
                    <option value="Conteneur C15 / C20">Conteneur C15 / C20 (15 à 20 Litres)</option>
                    <option value="Conteneur C25 / C35 (Gros sujet)">Conteneur C25 / C35 (Gros sujet)</option>
                    <option value="Grand bac C50 / C100+ (Spécimen)">Grand bac C50 / C100+ (Spécimen d'exception)</option>
                    <option value="Motte grillagée">Motte grillagée (Arbre / Palmier extrait de pleine terre)</option>
                    <option value="Rouleaux / Plaques m²">Rouleaux / Plaques m² (Gazon déplaqué)</option>
                    <option value="Godet 9x9">Godet 9x9 cm (Vivaces / Couvre-sol)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Exposition Solaire :
                  </label>
                  <select
                    value={sunExposure}
                    onChange={e =>
                      setSunExposure(e.target.value as NonNullable<NurseryOrnamentalDetails['sunExposure']>)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                  >
                    <option value="Plein soleil">Plein soleil (Résiste au soleil brûlant marocain)</option>
                    <option value="Mi-ombre">Mi-ombre</option>
                    <option value="Ombre">Ombre / Sous-bois</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                    Besoin en Eau :
                  </label>
                  <select
                    value={waterRequirement}
                    onChange={e =>
                      setWaterRequirement(
                        e.target.value as NonNullable<NurseryOrnamentalDetails['waterRequirement']>
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                  >
                    <option value="Faible (Xérophyte / Résistant sécheresse)">
                      Faible (Xérophyte / Très économe en eau - Idéal Maroc)
                    </option>
                    <option value="Modéré">Modéré (Arrosage régulier normal)</option>
                    <option value="Élevé">Élevé (Sol frais ou gazon irrigué)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Feuillage, Floraison & Usage paysager */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Type de Feuillage :
                  </label>
                  <select
                    value={foliageType}
                    onChange={e =>
                      setFoliageType(e.target.value as NonNullable<NurseryOrnamentalDetails['foliageType']>)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                  >
                    <option value="Persistant">Persistant (Conserve ses feuilles toute l'année)</option>
                    <option value="Caduc">Caduc (Perd ses feuilles en hiver)</option>
                    <option value="Semi-persistant">Semi-persistant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Couleur & Période Floraison :
                  </label>
                  <input
                    type="text"
                    value={flowerColor}
                    onChange={e => setFlowerColor(e.target.value)}
                    placeholder="ex: Violet Pourpre, Blanc, Rose fuchsia, Jaune..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Usage Paysager Préconisé :
                  </label>
                  <input
                    type="text"
                    value={landscapeUsage}
                    onChange={e => setLandscapeUsage(e.target.value)}
                    placeholder="ex: Haie brise-vue, Alignement voirie, Sujet isolé spécimen..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               VARIABLES SPÉCIFIQUES : ARBRES FRUITIERS & AUTRES CULTURES
               ======================================================== */
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <div className="flex items-center gap-1.5">
                    <TreePine className="w-4 h-4 text-amber-700" />
                    <h4 className="font-bold text-amber-950 uppercase text-xs tracking-wider">
                      Variables Spécifiques Arbres Fruitiers & Arboriculture
                    </h4>
                  </div>
                </div>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold border border-amber-300">
                  Certification & Greffons
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">
                    Porte-greffe Agronomique :
                  </label>
                  <input
                    type="text"
                    value={rootstock}
                    onChange={e => setRootstock(e.target.value)}
                    placeholder="ex: Citrange Carrizo, Macrophylla, Franc, Bigaradier..."
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-stone-900 bg-white font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Mode de Multiplication :
                  </label>
                  <select
                    value={propagationMethod}
                    onChange={e => setPropagationMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                  >
                    <option value="Greffage">Greffage (Écussonnage / Greffe en fente)</option>
                    <option value="Bouturage">Bouturage semi-ligneux</option>
                    <option value="Semis">Semis direct</option>
                    <option value="In Vitro (Micropropagation)">In Vitro (Micropropagation certifiée)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Conditionnement Fruitier :
                  </label>
                  <select
                    value={containerType}
                    onChange={e => setContainerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white font-semibold"
                  >
                    <option value="Sachet PE 3L">Sachet PE 3L (Polyéthylène noir standard)</option>
                    <option value="Pot 2L">Pot plastique 2L</option>
                    <option value="Pot 5L">Pot plastique 5L</option>
                    <option value="Plateau alvéolé 104">Plateau alvéolé 104 (Maraîchage)</option>
                    <option value="Plateau alvéolé 128">Plateau alvéolé 128</option>
                    <option value="Mottes pressées">Mottes pressées</option>
                    <option value="Racines nues">Racines nues (Période repos hivernal)</option>
                  </select>
                </div>
              </div>

              {/* Traçabilité ONSSA & Passeport */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Agrément ONSSA :
                  </label>
                  <select
                    value={onssaStatus}
                    onChange={e => setOnssaStatus(e.target.value as ONSSAStatus)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white font-bold text-emerald-900"
                  >
                    {ONSSA_OPTIONS.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    N° Passeport Phytosanitaire :
                  </label>
                  <input
                    type="text"
                    value={phytosanitaryPassportNumber}
                    onChange={e => setPhytosanitaryPassportNumber(e.target.value)}
                    placeholder="ONSSA-MA-..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Stade Végétatif :
                  </label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as GrowthStage)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                  >
                    {GROWTH_STAGES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: STOCKS, PRIX & LOCALISATION (COMMUNS) */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white font-black text-[10px] flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                Stocks, Prix & Emplacement
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-stone-200">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Quantité Disponible :
                </label>
                <input
                  type="number"
                  value={quantityAvailable}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setQuantityAvailable(val);
                    setQuantityTotal(val + Number(quantityReserved));
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 font-black text-sm text-emerald-800"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Quantité Réservée :
                </label>
                <input
                  type="number"
                  value={quantityReserved}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setQuantityReserved(val);
                    setQuantityTotal(Number(quantityAvailable) + val);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Prix Unitaire (MAD) :
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={unitPriceMAD}
                  onChange={e => setUnitPriceMAD(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 font-black text-sm text-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Seuil Alerte Stock Bas :</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="ex: 500 (vide = défaut)"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50/20 text-stone-900 font-bold text-sm"
                />
                <span className="text-[10px] text-stone-500">Seuil spécifique à ce lot</span>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  État Sanitaire :
                </label>
                <select
                  value={healthStatus}
                  onChange={e => setHealthStatus(e.target.value as HealthStatus)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white font-medium"
                >
                  <option value="Excellent">Excellent (Aucun symptôme)</option>
                  <option value="Bon">Bon (Vigueur normale)</option>
                  <option value="À surveiller">À surveiller</option>
                  <option value="En traitement">En traitement phytosanitaire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Région du Maroc :
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value as MoroccanRegion)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                >
                  {MOROCCAN_REGIONS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Serre / Emplacement pépinière :
                </label>
                <input
                  type="text"
                  value={greenhouseLocation}
                  onChange={e => setGreenhouseLocation(e.target.value)}
                  placeholder="ex: Serre Ornementale A2, Ombrière Nord..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <PhotoUploadCapture
                  currentImageUrl={imageUrl}
                  additionalImages={additionalImages}
                  onImageChange={(main, extras) => {
                    setImageUrl(main);
                    setAdditionalImages(extras);
                    setIsCustomPhoto(true);
                  }}
                  categoryHint={category}
                  title="Photos du Lot de Pépinière (Caméra direct serre ou Galerie)"
                  subtitle="Prenez une photo de vos plants, mottes ou étiquettes ONSSA en direct, ou insérez depuis votre galerie."
                  maxImages={4}
                  allowPresets={false}
                />
              </div>
            </div>

            {/* PHOTOTHÈQUE CERTIFIÉE PÉPINIÈRE (ARBO, MARAÎCHAGE, ORNEMENT) */}
            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-stone-900 text-xs">
                    Photothèque Spécifique Pépinière (Choisir un cliché certifié)
                  </span>
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoFillBotanyWithPhoto}
                    onChange={(e) => setAutoFillBotanyWithPhoto(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="font-medium">Remplir aussi l'espèce et les détails</span>
                </label>
              </div>

              {/* Department Tabs for Photos */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {[
                  { id: 'ARBORICULTURE', label: '🌳 Jeunes Plantes Arbo', count: NURSERY_PHOTO_PRESETS.filter(p => p.department === 'ARBORICULTURE').length },
                  { id: 'MARAICHAGE', label: '🌱 Plateaux Maraîchers', count: NURSERY_PHOTO_PRESETS.filter(p => p.department === 'MARAICHAGE').length },
                  { id: 'ORNEMENTALE', label: '🪴 Sujets d\'Ornement', count: NURSERY_PHOTO_PRESETS.filter(p => p.department === 'ORNEMENTALE').length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedPhotoDept(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                      selectedPhotoDept === tab.id
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                      selectedPhotoDept === tab.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Photo Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {NURSERY_PHOTO_PRESETS.filter(p => p.department === selectedPhotoDept).map(preset => {
                  const isSelected = imageUrl === preset.imageUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPhotoPreset(preset)}
                      className={`group relative text-left rounded-xl p-1.5 border transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-2 border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5">
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
                          {preset.recommendedContainer}
                        </span>
                      </div>

                      <div className="w-full">
                        <span className="block font-bold text-[11px] text-stone-900 leading-tight line-clamp-1">
                          {preset.name}
                        </span>
                        <span className="block text-[9px] text-stone-500 line-clamp-1 mt-0.5">
                          {preset.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Notes & Remarques agronomiques / paysagères :
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Exigences d'entretien, conseils de plantation, vigueur racinaire, acclimatation..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-stone-500 text-[11px]">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {mainType === 'ORNAMENTAL'
                  ? 'Fiche optimisée selon les normes du secteur horticole et des pépinières paysagères.'
                  : 'Fiche conforme aux exigences de traçabilité ONSSA & Plan Génération Green.'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold transition cursor-pointer active:scale-95"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                {initialLot ? 'Enregistrer les modifications' : 'Créer le lot de stock'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
