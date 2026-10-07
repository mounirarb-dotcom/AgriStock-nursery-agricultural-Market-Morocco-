import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { ProduceCategory, MoroccanRegion } from '../types';
import {
  X,
  Upload,
  CheckCircle2,
  Package,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PRESET_PHOTOS = [
  { label: 'Tomates', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Agrumes / Oranges', url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Moutons Sardi / Cheptel', url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luzerne / Fourrage', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80' },
];

export const SimpleCreateOfferModal: React.FC = () => {
  const {
    language,
    isSimpleCreateOfferOpen,
    setIsSimpleCreateOfferOpen,
    addProduceListing,
    userProfile,
    setActiveTab,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('Fruit');
  const [quantity, setQuantity] = useState<number>(5);
  const [unit, setUnit] = useState<string>('Tonnes');
  const [pricePerUnitMAD, setPricePerUnitMAD] = useState<number>(4500);
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_PHOTOS[0].url);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isSimpleCreateOfferOpen) return null;

  const handleCategoryChange = (newCat: ProduceCategory) => {
    setCategory(newCat);
    if (newCat === 'Élevage & Bétail') {
      setUnit('Têtes / Bêtes');
      setPricePerUnitMAD(3200);
      setSelectedImage(PRESET_PHOTOS[2].url);
    } else if (newCat === 'Fourrage & Intrants') {
      setUnit('Bottes');
      setPricePerUnitMAD(35);
      setSelectedImage(PRESET_PHOTOS[3].url);
    } else {
      setUnit('Tonnes');
      setPricePerUnitMAD(4500);
      setSelectedImage(PRESET_PHOTOS[0].url);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Veuillez renseigner un titre pour votre offre.');
      return;
    }

    addProduceListing({
      title,
      category,
      variety: title.split(' ')[0] || 'Variété standard',
      quantityAvailable: quantity,
      unit,
      pricePerUnitMAD,
      priceType: 'Départ ferme (Sortie de champ)',
      region: userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)',
      sellerName: userProfile.companyName || userProfile.displayName || 'Producteur Agricole',
      sellerType: category === 'Élevage & Bétail' ? 'Éleveur Certifié' : 'Agriculteur / Producteur',
      imageUrl: selectedImage,
      certifications: ['ONSSA Homologué', 'Vérifié AGRIStock'],
      listingIntent: 'sell',
    });

    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSimpleCreateOfferOpen(false);
    setIsSuccess(false);
    setTitle('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-auto">
        {/* Header Modale */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-amber-200">
            <Package className="w-4 h-4 text-amber-400" />
            <span>ESPACE VENDEUR / PRODUCTEUR • FORMULAIRE 5 CHAMPS</span>
          </div>

          <h2 className="text-lg font-black tracking-tight text-white">
            {isSuccess
              ? tr(language, 'Offre publiée avec succès !', 'تم نشر الإعلان بنجاح !', 'Offer published successfully !')
              : tr(language, 'Publier une nouvelle offre', 'نشر عرض جديد', 'Publish a new offer')}
          </h2>
          <p className="text-xs text-amber-100/90 mt-0.5">
            {isSuccess
              ? tr(language, 'Votre annonce est immédiatement visible par tous les acheteurs.', 'إعلانك متاح الآن لجميع المشترين في السوق.', 'Your listing is now live for all buyers.')
              : tr(language, 'Remplissez 5 critères essentiels pour mettre en vente immédiatement.', 'أدخل 5 معايير بسيطة لعرض محصولك للبيع فوراً.', 'Fill in 5 key criteria to sell immediately.')}
          </p>
        </div>

        {/* Corps selon étape */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">
                {tr(language, 'Votre offre est en ligne !', 'عرضك متاح للبيع الآن !', 'Your offer is now live !')}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                « {title} » ({quantity} {unit} à {pricePerUnitMAD} MAD/{unit}). Les acheteurs peuvent désormais vous commander ou vous contacter.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Garantie de paiement sous séquestre bancaire dès qu’un acheteur commande.</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setActiveTab('market');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer"
              >
                {tr(language, 'Voir sur le Marché', 'مشاهدة في السوق', 'View on Market')}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer"
              >
                {tr(language, 'Terminer', 'تم', 'Done')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="p-5 sm:p-6 space-y-4">
            {/* Champ 1 : Titre */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                {tr(language, '1. Titre de l’offre', '1. عنوان العرض', '1. Offer Title')} *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Tomate Ronde de primeur, Agneaux Sardi, Clémentines..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-600 font-medium"
              />
            </div>

            {/* Champ 2 : Rubrique officielle (SANS machines) */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                {tr(language, '2. Rubrique officielle', '2. القسم الفلاحي', '2. Official Rubric')} *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Fruit')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                    category === 'Fruit' || category === 'Légume'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-base">🥕</span>
                  <span>1. Fruits & Légumes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('Élevage & Bétail')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                    category === 'Élevage & Bétail'
                      ? 'bg-amber-100 border-amber-600 text-amber-950 ring-1 ring-amber-600'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-base">🐑</span>
                  <span>2. Production Animale</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('Fourrage & Intrants')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                    category === 'Fourrage & Intrants'
                      ? 'bg-yellow-100 border-yellow-600 text-yellow-950 ring-1 ring-yellow-600'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-base">🌾</span>
                  <span>Fourrage & Intrants</span>
                </button>
              </div>
            </div>

            {/* Champ 3 : Quantité & Unité */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  {tr(language, '3. Quantité disponible', '3. الكمية المتوفرة', '3. Available Quantity')} *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Unité
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-900"
                >
                  <option value="Tonnes">Tonnes</option>
                  <option value="Kg">Kg</option>
                  <option value="Têtes / Bêtes">Têtes / Bêtes</option>
                  <option value="Bottes">Bottes</option>
                  <option value="Caisses">Caisses</option>
                </select>
              </div>
            </div>

            {/* Champ 4 : Prix unitaire MAD */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                {tr(language, '4. Prix de vente (MAD)', '4. سعر البيع (درهم)', '4. Selling Price (MAD)')} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={pricePerUnitMAD}
                  onChange={(e) => setPricePerUnitMAD(Number(e.target.value) || 0)}
                  className="w-full p-2.5 pl-3 pr-20 rounded-xl border border-stone-300 bg-white text-xs font-black text-stone-900 focus:ring-2 focus:ring-amber-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  MAD / {unit}
                </span>
              </div>
            </div>

            {/* Champ 5 : Photo */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1.5">
                {tr(language, '5. Photo de l’offre', '5. صورة العرض', '5. Offer Photo')}
              </label>

              {/* Aperçu + Presets */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {PRESET_PHOTOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(p.url)}
                    className={`h-14 rounded-xl overflow-hidden border-2 transition relative cursor-pointer ${
                      selectedImage === p.url ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Upload personnalisé */}
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-stone-300 hover:border-amber-600 bg-stone-50 hover:bg-amber-50/50 text-stone-600 hover:text-amber-800 text-xs font-medium cursor-pointer transition">
                <Camera className="w-4 h-4" />
                <span>Téléverser une photo depuis mon appareil</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* Bouton Publier */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>{tr(language, 'PUBLIER MON OFFRE MAINTENANT', 'نشر العرض في السوق فوراً', 'PUBLISH MY OFFER NOW')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
