import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { MoroccanRegion, ProduceCategory } from '../../../types';
import { MOROCCAN_REGIONS } from '../../../data/mockData';
import {
  PackagePlus,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  DollarSign,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';

export const InventoryFormPage: React.FC = () => {
  const {
    language,
    addProduceListing,
    userProfile,
    setActiveTab,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('Légumes & Maraîchage (Tomate, Poivron, Oignon...)');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<'Tonnes' | 'Kg' | 'Caisses (10kg)' | 'Palettes' | 'Plants' | 'Bottes'>('Tonnes');
  const [priceMAD, setPriceMAD] = useState<number>(4.5);
  const [region, setRegion] = useState<MoroccanRegion>(userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [locationCity, setLocationCity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || quantity <= 0 || priceMAD <= 0) return;

    addProduceListing({
      title: title.trim(),
      category,
      variety: variety.trim() || 'Standard',
      region,
      locationCity: locationCity.trim() || region.split('(')[0].trim(),
      quantityAvailable: Number(quantity),
      unit,
      minOrderQuantity: 1,
      pricePerUnitMAD: Number(priceMAD),
      priceType: 'Départ ferme (Sortie de champ)',
      calibre: 'Catégorie I',
      packaging: 'Caisses standard',
      harvestDate: new Date().toISOString().split('T')[0],
      certifications: ['ONSSA Homologué'],
      sellerName: userProfile.displayName || userProfile.companyName || 'Producteur Agricole',
      sellerType: 'Agriculteur / Producteur',
      phone: userProfile.phone || '+212 600 000 000',
      whatsapp: userProfile.whatsapp || userProfile.phone || '+212 600 000 000',
      description: description.trim(),
      imageUrl,
    });

    setActiveTab('inventory');
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('inventory')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à l’inventaire', 'العودة للمخزون', 'Back to Inventory')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>NOUVEAU LOT / RÉCOLTE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            {tr(language, 'Mettre un lot en vente', 'إضافة محصول للبيع', 'List a New Agricultural Lot')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(language, 'Remplissez les informations essentielles pour publier votre offre sur la marketplace.', 'أدخل المعلومات الأساسية لنشر المحصول في السوق.', 'Fill essential information to publish your lot on the marketplace.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Titre de l’annonce / Produit', 'اسم المحصول أو السلعة', 'Listing Title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tomates Rondes Torry F1 Plein Champ"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Catégorie', 'الصنف', 'Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProduceCategory)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Légumes & Maraîchage (Tomate, Poivron, Oignon...)">Légumes & Maraîchage</option>
                <option value="Fruits & Vergers (Agrumes, Pommes, Pastèques...)">Fruits & Vergers</option>
                <option value="Céréales & Légumineuses (Blé, Fèves, Lentilles...)">Céréales & Légumineuses</option>
                <option value="Fourrage & Alimentation Animale (Luzerne, Paille...)">Fourrage & Alimentation</option>
                <option value="Production Animale & Bétail (Bovins, Ovins, Caprins...)">Bétail & Élevage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Variété', 'النوع / الصنف التجاري', 'Variety')}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="Ex: Torry F1, Nadorcott, Sardi..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Quantité disponible', 'الكمية المتوفرة', 'Quantity')}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Unité', 'الوحدة', 'Unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Tonnes">Tonnes</option>
                <option value="Kg">Kg</option>
                <option value="Caisses (10kg)">Caisses (10kg)</option>
                <option value="Palettes">Palettes</option>
                <option value="Plants">Plants</option>
                <option value="Bottes">Bottes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Prix unitaire (MAD)', 'السعر (درهم)', 'Unit Price (MAD)')}
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={priceMAD}
                onChange={(e) => setPriceMAD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden font-bold text-emerald-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Région', 'الجهة', 'Region')}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as MoroccanRegion)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              >
                {MOROCCAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Ville / Commune', 'المدينة / الجماعة', 'City / Location')}
              </label>
              <input
                type="text"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="Ex: Chtouka Aït Baha"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Description détaillée', 'الوصف', 'Description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Précisez la date de récolte, le calibre, la qualité du conditionnement..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{tr(language, 'Publier l’offre sur le marché', 'نشر العرض في السوق', 'Publish Lot')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
