import React, { useState, useEffect } from 'react';
import { sanitizeText, sanitizeNumber, sanitizeUrl, globalClientRateLimiter } from '../utils/securityUtils';
import { MoroccanRegion, ProduceCategory, ProduceListing, ListingIntent, LivestockSubCategory } from '../types';
import { MOROCCAN_REGIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { X, Store, Check, UploadCloud, ShieldCheck, Tag, ShoppingBag, Award, Camera, ShieldAlert, Tractor, ShoppingCart } from 'lucide-react';
import { PhotoUploadCapture } from './PhotoUploadCapture';
import { tr } from '../utils/translations';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (listing: Omit<ProduceListing, 'id' | 'createdAt' | 'status'>) => void;
  defaultCategory?: ProduceCategory;
  defaultLivestockSubCategory?: LivestockSubCategory;
  defaultListingIntent?: ListingIntent;
}

const SAMPLE_IMAGES = [
  { label: 'Tomates', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Clémentines', url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pommes de terre', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80' },
  { label: 'Avocats', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80' },
  { label: 'Moutons Sardi', url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Troupeau Timahdite', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Génisses Holstein', url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80' },
  { label: 'Veaux Engraissement', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chèvres Alpines', url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chèvres Atlas', url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80' },
  { label: 'Luzerne en Bottes', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dattes Mejhoul', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80' },
];

export const ProduceListingFormModal: React.FC<Props> = ({
  isOpen = true,
  onClose,
  onSave,
  defaultCategory = 'Légume',
  defaultLivestockSubCategory,
}) => {
  const { userProfile, addProduceListing, language, setUserRole, setActiveTab } = useApp();
  const listingIntent: ListingIntent = 'sell';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProduceCategory>(defaultCategory);
  const [variety, setVariety] = useState('');
  const [region, setRegion] = useState<MoroccanRegion>(userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [locationCity, setLocationCity] = useState(userProfile.city || 'Settat');
  const [quantityAvailable, setQuantityAvailable] = useState<number>(10);
  const [unit, setUnit] = useState<ProduceListing['unit']>(
    defaultCategory === 'Élevage & Bétail' ? 'Têtes / Bêtes' : 'Tonnes'
  );
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(1);
  const [pricePerUnitMAD, setPricePerUnitMAD] = useState<number>(
    defaultCategory === 'Élevage & Bétail' ? 3200 : 4500
  );
  const [priceType, setPriceType] = useState<ProduceListing['priceType']>('Départ ferme (Sortie de champ)');
  const [calibre, setCalibre] = useState('Catégorie I (Calibre 1)');
  const [packaging, setPackaging] = useState('Caisses plastiques 10kg');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [sellerName, setSellerName] = useState(
    userProfile.companyName || userProfile.displayName || 'Élevage & Domaine Agricole'
  );
  const [sellerType, setSellerType] = useState<ProduceListing['sellerType']>(
    defaultCategory === 'Élevage & Bétail' ? 'Éleveur Certifié' : 'Agriculteur / Producteur'
  );
  const [phone, setPhone] = useState(userProfile.phone || '+212661000000');
  const [whatsapp, setWhatsapp] = useState(userProfile.whatsapp || '212661000000');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0].url);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  // --- Production Animale (Bovins, Ovins, Caprins) ---
  const [livestockSubCategory, setLivestockSubCategory] = useState<LivestockSubCategory>(
    defaultLivestockSubCategory || 'ovins'
  );
  const [livestockBreed, setLivestockBreed] = useState('Sardi');
  const [livestockHeadCount, setLivestockHeadCount] = useState<number>(50);
  const [livestockAgeMonths, setLivestockAgeMonths] = useState<number>(12);
  const [livestockAverageWeightKg, setLivestockAverageWeightKg] = useState<number>(50);
  const [livestockHealthCertificate, setLivestockHealthCertificate] = useState(
    `CERT-ONSSA-VET-MA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [livestockVaccinationStatus, setLivestockVaccinationStatus] = useState(
    'Vaccination officielle ONSSA à jour (Fièvre Aphteuse, Clavelée, Entérotoxémie)'
  );
  const [livestockPurpose, setLivestockPurpose] = useState<ProduceListing['livestockPurpose']>(
    'Engraissement / Boucherie'
  );
  const [livestockDiet, setLivestockDiet] = useState<ProduceListing['livestockDiet']>('Mixte');

  // Ajuster l'unité et le type de conditionnement si catégorie Élevage
  useEffect(() => {
    if (category === 'Élevage & Bétail') {
      setUnit('Têtes / Bêtes');
      setPackaging('Bétaillère agricole aérée');
      setCalibre(`Poids vif moyen ${livestockAverageWeightKg} kg (Âge ${livestockAgeMonths} mois)`);
      if (sellerType === 'Agriculteur / Producteur') {
        setSellerType('Éleveur Certifié');
      }
      if (pricePerUnitMAD < 100) {
        setPricePerUnitMAD(livestockSubCategory === 'bovins' ? 18000 : livestockSubCategory === 'ovins' ? 3200 : 2100);
      }
    }
  }, [category, livestockSubCategory, livestockAverageWeightKg, livestockAgeMonths]);

  // Suggestions de races selon la sous-rubrique
  const breedOptions = {
    bovins: ['Montbéliarde', 'Prim\'Holstein', 'Croisé Charolais / BBB', 'Limousine', 'Brune de l\'Atlas', 'Tarentaise'],
    ovins: ['Sardi', 'Timahdite', 'Beni Guil', 'D\'man', 'Boujaâd', 'Croisé Local'],
    caprins: ['Alpine Chamoisée', 'Noire de l\'Atlas', 'Chèvre de Drâa', 'Damascène (Chami)', 'Murciana', 'Saanen'],
  };

  // Certifications
  const [agriforexChecked, setAgriforexChecked] = useState(true);
  const [onssaChecked, setOnssaChecked] = useState(true);
  const [vaccinationChecked, setVaccinationChecked] = useState(category === 'Élevage & Bétail');
  const [globalGapChecked, setGlobalGapChecked] = useState(false);
  const [bioMarocChecked, setBioMarocChecked] = useState(false);
  const [igpChecked, setIgpChecked] = useState(false);
  const [exportReadyChecked, setExportReadyChecked] = useState(category !== 'Élevage & Bétail');

  // Fermeture par touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isOpen === false) {
    return null;
  }

  // RÈGLE MÉTIER : Un compte Acheteur ne possède pas l'option de publier une offre de production
  if (userProfile.role === 'buyer') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              {tr(language, 'Espace Acheteur Réservé', 'فضاء المشتري', 'Buyer Space Reserved')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {tr(
                language,
                'Publication réservée aux Producteurs & Vendeurs',
                'نشر العروض مخصص للمنتجين والبائعين فقط',
                'Listing publishing reserved for Producers & Sellers'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-md mx-auto">
              {tr(
                language,
                "En tant qu'acheteur sur AgriStock Maroc, vous ne pouvez pas publier d'offre de production. Votre espace est dédié à la consultation des offres partagées par les producteurs et vendeurs, et à la commande avec paiement garanti sous séquestre.",
                'بصفتك مشتري في منصة أگريستوك، لا يمكنك نشر عروض محاصيل فلاحية. فضاؤك مخصص لتصفح عروض المنتجين، الشراء المباشر والدفع الآمن بالضمان البنكي.',
                'As a buyer on AgriStock Maroc, you cannot publish production offers. Your space is dedicated to browsing offers shared by producers and sellers, and ordering with guaranteed escrow payment.'
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 text-left text-xs space-y-1.5 text-stone-300">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{tr(language, 'Vos fonctionnalités Acheteur :', 'مزايا حسابك كمشتري :', 'Your Buyer features:')}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-stone-400 pl-1 text-[11px]">
              <li>{tr(language, 'Consulter l\'ensemble des offres fruits, légumes et plants certifiés ONSSA', 'تصفح كافة عروض الخضر، الفواكه وشتلات المشاتل المعتمدة', 'Browse all fruits, vegetables, and ONSSA certified plants')}</li>
              <li>{tr(language, 'Acheter en direct ou négocier les prix avec les exploitants', 'الشراء المباشر أو التفاوض على الأسعار مع الفلاحين', 'Direct purchase or price negotiation with producers')}</li>
              <li>{tr(language, 'Bénéficier de la protection séquestre CMI / Stripe sans risque d\'impayé', 'الاستفادة من حماية الحساب الضامن وضمان جودة البضاعة', 'Full escrow protection on all shipments')}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('market');
              }}
              className="w-full sm:w-auto flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>{tr(language, 'Consulter les offres partagées', 'تصفح العروض المتوفرة بالسوق', 'Browse shared offers')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserRole('seller');
                onClose();
                setActiveTab('seller_space');
              }}
              className="w-full sm:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Si vous exploitez une ferme et souhaitez vendre"
            >
              <Tractor className="w-4 h-4 text-amber-400" />
              <span>{tr(language, 'Activer profil Vendeur', 'تفعيل حساب بائع', 'Switch to Seller')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !variety) return;

    // OWASP Rate Limiting
    const rate = globalClientRateLimiter.check('produce:create', 10, 60000);
    if (!rate.allowed) {
      alert(`Trop de publications rapprochées. Réessayez dans ${Math.ceil(rate.retryAfterMs / 1000)}s.`);
      return;
    }

    const certs: ProduceListing['certifications'] = [];
    if (agriforexChecked) certs.push('Vérifié AgriForex');
    if (onssaChecked) certs.push('ONSSA Homologué');
    if (vaccinationChecked) certs.push('Vaccination Certifiée');
    if (globalGapChecked) certs.push('GlobalG.A.P');
    if (bioMarocChecked) certs.push('Bio Maroc');
    if (igpChecked) certs.push('IGP Maroc');
    if (exportReadyChecked) certs.push('Export Ready');

    const randomBatchSuffix = Math.floor(100 + Math.random() * 900);
    const safeVariety = sanitizeText(variety, 50);
    const generatedBatchNumber =
      category === 'Élevage & Bétail'
        ? `SNIT-MA-${(livestockSubCategory || 'OVIN').toUpperCase()}-${new Date().getFullYear()}-${randomBatchSuffix}`
        : `LOT-${new Date().getFullYear()}-${(safeVariety || 'LOT').slice(0, 3).toUpperCase()}-${randomBatchSuffix}`;

    const newListingData: Omit<ProduceListing, 'id' | 'createdAt' | 'status'> = {
      userId: userProfile?.id,
      title: sanitizeText(title, 120),
      category,
      variety: safeVariety,
      region,
      locationCity: sanitizeText(locationCity, 80),
      quantityAvailable: sanitizeNumber(category === 'Élevage & Bétail' ? livestockHeadCount : quantityAvailable, { min: 1, max: 10000000 }),
      unit,
      minOrderQuantity: sanitizeNumber(minOrderQuantity, { min: 1, max: 1000000 }),
      pricePerUnitMAD: sanitizeNumber(pricePerUnitMAD, { min: 0.1, max: 10000000 }),
      priceType,
      calibre: sanitizeText(category === 'Élevage & Bétail' ? `Poids vif ${livestockAverageWeightKg} kg (${livestockAgeMonths} mois)` : calibre, 100),
      packaging: sanitizeText(packaging, 100),
      harvestDate: sanitizeText(harvestDate, 30),
      certifications: certs,
      sellerName: sanitizeText(sellerName, 100),
      sellerType,
      phone: sanitizeText(phone, 30),
      whatsapp: sanitizeText(whatsapp || phone, 30),
      description: sanitizeText(description, 2000),
      imageUrl: sanitizeUrl(imageUrl),
      additionalImages: additionalImages.map(url => sanitizeUrl(url)).filter(Boolean),
      isCustomPhoto,
      isFeatured: false,
      listingIntent: 'sell',
      verifiedAgriForex: agriforexChecked,
      batchNumber: generatedBatchNumber,
      phytosanitaryPassport: onssaChecked ? `ONSSA-MA-${(sanitizeText(locationCity, 10) || 'MAR').slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${randomBatchSuffix}` : undefined,
      // Champs spécifiques élevage & cheptel
      livestockSubCategory: category === 'Élevage & Bétail' ? livestockSubCategory : undefined,
      livestockBreed: category === 'Élevage & Bétail' ? sanitizeText(livestockBreed || variety, 80) : undefined,
      livestockHeadCount: category === 'Élevage & Bétail' ? sanitizeNumber(livestockHeadCount, { min: 1 }) : undefined,
      livestockAgeMonths: category === 'Élevage & Bétail' ? sanitizeNumber(livestockAgeMonths, { min: 0 }) : undefined,
      livestockAverageWeightKg: category === 'Élevage & Bétail' ? sanitizeNumber(livestockAverageWeightKg, { min: 0 }) : undefined,
      livestockHealthCertificate: category === 'Élevage & Bétail' ? sanitizeText(livestockHealthCertificate, 100) : undefined,
      livestockVaccinationStatus: category === 'Élevage & Bétail' ? sanitizeText(livestockVaccinationStatus, 100) : undefined,
      livestockPurpose: category === 'Élevage & Bétail' ? (livestockPurpose as any) : undefined,
      livestockDiet: category === 'Élevage & Bétail' ? (livestockDiet as any) : undefined,
      cheptelPhotoUrl: category === 'Élevage & Bétail' ? sanitizeUrl(imageUrl) : undefined,
    };

    if (onSave) {
      onSave(newListingData);
    } else {
      addProduceListing(newListingData);
    }
    onClose();
  };

  return (
    <div
      id="produce-listing-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="produce-listing-modal-container"
        className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
              {category === 'Élevage & Bétail'
                ? 'Publier une Vente Bétail / Cheptel'
                : 'Publier une Offre de Vente (Bourse Agricole Maroc)'}
            </h3>
          </div>
          <button
            id="btn-close-produce-modal"
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition active:scale-95 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Row 1: Product Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-stone-700 font-semibold mb-1">Titre de l'annonce</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={
                  category === 'Élevage & Bétail'
                    ? "ex: Troupeau Moutons Sardi Settat / Génisses Prim'Holstein Tadla / Chèvres Alpines"
                    : "ex: Tomates Rondes Chtouka / Clémentines Berkane / Pommes de terre Saïss"
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-300 font-semibold text-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Filière / Catégorie</label>
              <select
                value={category}
                onChange={e => {
                  const newCat = e.target.value as ProduceCategory;
                  setCategory(newCat);
                  if (newCat === 'Élevage & Bétail') {
                    setUnit('Têtes / Bêtes');
                    setPackaging('Bétaillère agricole aérée');
                    setVaccinationChecked(true);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white font-semibold"
              >
                <option value="Légume">🥦 Légumes</option>
                <option value="Fruit">🍎 Fruits</option>
                <option value="Élevage & Bétail">🐑 Élevage & Bétail (Production Animale)</option>
                <option value="Fourrage & Intrants">🌾 Fourrage & Intrants</option>
              </select>
            </div>
          </div>

          {/* SECTION DÉDIÉE : PRODUCTION ANIMALE (BOVINS, OVINS, CAPRINS) */}
          {category === 'Élevage & Bétail' && (
            <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-base">🐑 🐂 🐐</span>
                  <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                    Rubrique Production Animale & Cheptel
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                  Certifié SNIT / ONSSA
                </span>
              </div>

              {/* Sous-rubrique : Bovins, Ovins, Caprins */}
              <div>
                <label className="block text-amber-950 font-bold mb-1.5 text-xs">
                  Type d'animal / Espèce :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bovins' as LivestockSubCategory, label: '🐂 Bovins', desc: 'Vaches, Taureaux, Génisses, Veaux' },
                    { id: 'ovins' as LivestockSubCategory, label: '🐑 Ovins', desc: 'Moutons, Brebis, Agneaux, Béliers' },
                    { id: 'caprins' as LivestockSubCategory, label: '🐐 Caprins', desc: 'Chèvres, Boucs, Chevreaux' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setLivestockSubCategory(sub.id);
                        const defaultBreed = breedOptions[sub.id][0];
                        setLivestockBreed(defaultBreed);
                        setVariety(defaultBreed);
                        if (!title || title.startsWith('Lot') || title.includes('Troupeau')) {
                          setTitle(`Troupeau ${sub.label.split(' ')[1]} ${defaultBreed}`);
                        }
                      }}
                      className={`p-2 rounded-xl text-left transition border ${
                        livestockSubCategory === sub.id
                          ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <div className="font-bold text-xs">{sub.label}</div>
                      <div className={`text-[10px] truncate ${livestockSubCategory === sub.id ? 'text-amber-100' : 'text-stone-500'}`}>
                        {sub.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Race, Vocation & Régime */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-950 font-semibold mb-1">
                    Race sélectionnée
                  </label>
                  <input
                    type="text"
                    value={livestockBreed}
                    onChange={e => {
                      setLivestockBreed(e.target.value);
                      setVariety(e.target.value);
                    }}
                    placeholder="ex: Sardi, Timahdite, Montbéliarde..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-stone-900"
                    required
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {breedOptions[livestockSubCategory].slice(0, 4).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setLivestockBreed(b);
                          setVariety(b);
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 hover:bg-amber-200"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-amber-950 font-semibold mb-1">
                    Vocation / Destination
                  </label>
                  <select
                    value={livestockPurpose}
                    onChange={e => setLivestockPurpose(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-stone-900 font-medium"
                  >
                    <option value="Engraissement / Boucherie">Engraissement / Boucherie</option>
                    <option value="Élevage / Reproduction">Élevage / Reproduction</option>
                    <option value="Laitier">Production Laitière</option>
                    <option value="Aïd Al-Adha">Aïd Al-Adha (Spécial Fête)</option>
                    <option value="Génisses pleines">Génisses pleines / Gestantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-950 font-semibold mb-1">
                    Régime alimentaire
                  </label>
                  <select
                    value={livestockDiet}
                    onChange={e => setLivestockDiet(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-stone-900 font-medium"
                  >
                    <option value="Mixte">Mixte (Pâturage + Complément)</option>
                    <option value="Pâturage naturel">Pâturage naturel / Parcours</option>
                    <option value="Alimentation composée & foin">Alimentation composée & foin</option>
                  </select>
                </div>
              </div>

              {/* Nbr de têtes, Âge moyen, Poids moyen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    🔢 Nombre de têtes
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={livestockHeadCount}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setLivestockHeadCount(val);
                        setQuantityAvailable(val);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-black text-amber-900"
                      required
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-semibold">
                      têtes
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    ⏳ Âge moyen (en mois)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={livestockAgeMonths}
                      onChange={e => setLivestockAgeMonths(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900"
                      required
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-semibold">
                      mois
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    ⚖️ Poids moyen (kg vif)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      value={livestockAverageWeightKg}
                      onChange={e => setLivestockAverageWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900"
                      required
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-semibold">
                      kg / tête
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificat sanitaire / SNIT & Statut vaccinal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-950 font-semibold mb-1">
                    📋 Certificat sanitaire / N° Boucle SNIT
                  </label>
                  <input
                    type="text"
                    value={livestockHealthCertificate}
                    onChange={e => setLivestockHealthCertificate(e.target.value)}
                    placeholder="ex: CERT-ONSSA-VET-2025-4491 ou N° Boucle SNIT"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-stone-900 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-amber-950 font-semibold mb-1">
                    💉 Statut vaccinal vétérinaire
                  </label>
                  <input
                    type="text"
                    value={livestockVaccinationStatus}
                    onChange={e => setLivestockVaccinationStatus(e.target.value)}
                    placeholder="ex: Vaccin Fièvre Aphteuse, Clavelée, Entérotoxémie à jour"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-stone-900 text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Variety & Location (pour les catégories autres qu'élevage si pas encore rempli) */}
          {category !== 'Élevage & Bétail' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Variété / Marque</label>
                <input
                  type="text"
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  placeholder="ex: Spunta, Nadorcott, Hass, Massey Ferguson..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Région Agricole</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value as MoroccanRegion)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                >
                  {MOROCCAN_REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Ville / Commune</label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={e => setLocationCity(e.target.value)}
                  placeholder="ex: Settat, Taroudant, Meknès, Berrechid..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900"
                  required
                />
              </div>
            </div>
          )}

          {category === 'Élevage & Bétail' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Région du Cheptel</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value as MoroccanRegion)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 bg-white"
                >
                  {MOROCCAN_REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Localité / Souk / Commune</label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={e => setLocationCity(e.target.value)}
                  placeholder="ex: Settat, Berrechid, El Hajeb, Azrou..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900"
                  required
                />
              </div>
            </div>
          )}

          {/* Row 3: Volume & Unit Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {category === 'Élevage & Bétail' ? 'Total têtes' : 'Volume disponible'}
              </label>
              <input
                type="number"
                value={category === 'Élevage & Bétail' ? livestockHeadCount : quantityAvailable}
                onChange={e => {
                  const val = Number(e.target.value);
                  setQuantityAvailable(val);
                  if (category === 'Élevage & Bétail') setLivestockHeadCount(val);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Unité</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white"
              >
                <option value="Têtes / Bêtes">Têtes / Bêtes (Bétail)</option>
                <option value="Tonnes">Tonnes</option>
                <option value="Kg">Kilogrammes (Kg)</option>
                <option value="Caisses (10kg)">Caisses (10kg)</option>
                <option value="Palettes">Palettes</option>
                <option value="Unités / Matériel">Unités / Pièces</option>
                <option value="Bottes">Bottes (Fourrage)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-700 font-semibold text-xs">
                  {category === 'Élevage & Bétail'
                    ? 'Prix par tête (MAD)'
                    : `Prix unitaire / ${unit} (MAD)`}
                </label>
                {unit === 'Tonnes' && pricePerUnitMAD > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700">
                    = {(pricePerUnitMAD / 1000).toFixed(2)} MAD / kg
                  </span>
                )}
              </div>
              <input
                type="number"
                step="1"
                value={pricePerUnitMAD}
                onChange={e => setPricePerUnitMAD(Number(e.target.value))}
                placeholder={unit === 'Tonnes' ? 'ex: 4500 (soit 4.50 MAD/kg)' : 'ex: 3200'}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 font-bold text-emerald-800"
                required
              />
              {unit === 'Tonnes' && (
                <p className="text-[10px] text-stone-500 mt-1">
                  💡 En vente par tonne : 4 800 MAD/Tonne = 4,80 MAD/kg.
                </p>
              )}
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Cotation / Modalité</label>
              <select
                value={priceType}
                onChange={e => setPriceType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white"
              >
                <option value="Départ ferme (Sortie de champ)">Départ ferme</option>
                <option value="Rendu marché de gros">Rendu marché / Souk</option>
                <option value="Prix négociable">Négociable</option>
              </select>
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Description détaillée & Traçabilité</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                category === 'Élevage & Bétail'
                  ? "Détails sur l'état sanitaire, alimentation, conformation bouchère, transport et conditions de visite à la ferme..."
                  : "Détails sur la récolte, la qualité, le transport et les facilités de paiement..."
              }
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900"
            />
          </div>

          {/* Row 5: Certifications & Confiance */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Garanties & Certifications</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <input
                  type="checkbox"
                  checked={agriforexChecked}
                  onChange={e => setAgriforexChecked(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="font-bold text-emerald-900">Vérifié AgriForex</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onssaChecked}
                  onChange={e => setOnssaChecked(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="font-semibold text-stone-800">Contrôle ONSSA</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vaccinationChecked}
                  onChange={e => setVaccinationChecked(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="font-semibold text-stone-800">Vaccination Vétérinaire Certifiée</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bioMarocChecked}
                  onChange={e => setBioMarocChecked(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span>Élevage Bio / Terroir</span>
              </label>
            </div>
          </div>

          {/* Row 6: Seller details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {category === 'Élevage & Bétail' ? 'Nom de l\'Éleveur / Exploitant' : 'Nom du Producteur / Exploitant'}
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Statut</label>
              <select
                value={sellerType}
                onChange={e => setSellerType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white"
              >
                <option value="Éleveur Certifié">Éleveur Certifié</option>
                <option value="Agriculteur / Producteur">Agriculteur / Producteur</option>
                <option value="Coopérative Agricole">Coopérative Agricole</option>
                <option value="Acheteur / Grossiste">Acheteur / Grossiste</option>
                <option value="Négociant / Exportateur">Négociant / Exportateur</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">N° WhatsApp (Contact direct)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="212661..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 font-mono"
                required
              />
            </div>
          </div>

          {/* Photo Upload & Camera Capture (Prendre ou insérer des photos) */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <PhotoUploadCapture
              currentImageUrl={imageUrl}
              additionalImages={additionalImages}
              onImageChange={(main, extras) => {
                setImageUrl(main);
                setAdditionalImages(extras);
                setIsCustomPhoto(true);
              }}
              categoryHint={category}
              title={
                category === 'Élevage & Bétail'
                  ? 'Photos du Cheptel / Bétail (Caméra direct ou Galerie)'
                  : 'Photos du Produit / Stock (Caméra direct ou Galerie)'
              }
              subtitle={
                category === 'Élevage & Bétail'
                  ? 'Prenez des photos de vos bêtes, boucles SNIT ou installations en direct, ou insérez depuis votre galerie.'
                  : 'Photographiez vos récoltes, caisses ou stock en direct, ou insérez vos images.'
              }
              maxImages={4}
              allowPresets={true}
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 z-10">
            <button
              id="btn-cancel-produce-modal"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 active:bg-stone-200 font-bold text-xs sm:text-sm transition cursor-pointer min-h-[44px]"
            >
              Annuler
            </button>
            <button
              id="btn-submit-produce-modal"
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-98 transition cursor-pointer min-h-[44px] bg-emerald-700 hover:bg-emerald-800"
            >
              <Check className="w-4 h-4" />
              {category === 'Élevage & Bétail'
                ? "Publier l'Offre de Bétail"
                : "Publier l'Offre de Vente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


