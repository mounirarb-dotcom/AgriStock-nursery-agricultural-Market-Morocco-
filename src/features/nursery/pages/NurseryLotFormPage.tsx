import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { MoroccanRegion, GrowthStage, ONSSAStatus } from '../../../types';
import { MOROCCAN_REGIONS } from '../../../data/mockData';
import {
  Sprout,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const NurseryLotFormPage: React.FC = () => {
  const {
    language,
    addNurseryLot,
    userProfile,
    setActiveTab,
  } = useApp();

  const [species, setSpecies] = useState('Olivier (Olea europaea)');
  const [variety, setVariety] = useState('');
  const [rootstock, setRootstock] = useState('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [unitPriceMAD, setUnitPriceMAD] = useState<number>(18.5);
  const [region, setRegion] = useState<MoroccanRegion>(userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('Prêt à la plantation (Commercialisable)');
  const [onssaStatus, setOnssaStatus] = useState<ONSSAStatus>('ONSSA Certifié (Catégorie Bleue)');
  const [batchNumber, setBatchNumber] = useState(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variety.trim() || quantity <= 0 || unitPriceMAD <= 0) return;

    addNurseryLot({
      species,
      variety: variety.trim(),
      rootstock: rootstock.trim() || undefined,
      category: 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)',
      propagationMethod: 'Greffage',
      stage: growthStage,
      quantityTotal: Number(quantity),
      quantityAvailable: Number(quantity),
      quantityReserved: 0,
      unitPriceMAD: Number(unitPriceMAD),
      containerType: 'Pot plastique 3L',
      greenhouseLocation: 'Serre Agréée ONSSA',
      seedingOrGraftDate: new Date().toISOString().split('T')[0],
      estimatedReadyDate: new Date().toISOString().split('T')[0],
      healthStatus: 'Excellent',
      onssaStatus,
      phytosanitaryPassportNumber: `PP-ONSSA-${batchNumber}`,
      batchNumber,
      region,
      treatments: [],
      notes: 'Lot produit en pépinière agréée sous abri contrôlé.',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
    });

    setActiveTab('nursery_inventory');
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('nursery_inventory')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour aux lots', 'العودة للدليل', 'Back to Nursery Lots')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 mb-2">
            <Sprout className="w-3.5 h-3.5 text-teal-600" />
            <span>NOUVEAU LOT DE PLANTS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            {tr(language, 'Enregistrer un lot de pépinière', 'تسجيل دفعة شتائل جديدة', 'Register Nursery Sapling Batch')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(language, 'Renseignez l’espèce, la variété, le porte-greffe et le statut de certification ONSSA.', 'أدخل الصنف والأصل الوراثي وحالة الاعتماد من أونسا.', 'Enter species, variety, rootstock, and ONSSA certification details.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Espèce Végétale', 'النوع النباتي', 'Plant Species')}
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden"
              >
                <option value="Olivier (Olea europaea)">Olivier (Olea europaea)</option>
                <option value="Agrumes (Citrus)">Agrumes (Citrus)</option>
                <option value="Rosacées (Pommier, Pêcher, Amandier)">Rosacées (Amandier, Pommier...)</option>
                <option value="Palmier Dattier (Phoenix dactylifera)">Palmier Dattier</option>
                <option value="Jeunes Plants Maraîchers (Tomate, Poivron...)">Jeunes Plants Maraîchers</option>
                <option value="Plantes Ornementales">Plantes Ornementales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Variété / Clone', 'الصنف التجاري', 'Variety / Clone')}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="Ex: Picholine Marocaine, Haouzia, Nadorcott..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Porte-greffe (si greffé)', 'الأصل الوراثي', 'Rootstock')}
              </label>
              <input
                type="text"
                value={rootstock}
                onChange={(e) => setRootstock(e.target.value)}
                placeholder="Ex: Carrizo, Citrange C35, GF677, Maxifort..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Numéro de Lot / Traçabilité', 'رقم الدفعة', 'Batch Number')}
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Quantité de plants disponibles', 'عدد الشتائل المتوفرة', 'Available Saplings')}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Prix unitaire HT (MAD / plant)', 'السعر للشتلة (درهم)', 'Unit Price (MAD)')}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={unitPriceMAD}
                onChange={(e) => setUnitPriceMAD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden font-bold text-teal-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Stade de croissance', 'مرحلة النمو', 'Growth Stage')}
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden"
              >
                <option value="Prêt à la plantation (Commercialisable)">Prêt à la plantation</option>
                <option value="Sevrage & Élevage">Sevrage & Élevage</option>
                <option value="Greffage en cours">Greffage en cours</option>
                <option value="Semis / Germination">Semis / Germination</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {tr(language, 'Homologation Sanitaire ONSSA', 'الاعتماد الصحي من أونسا', 'ONSSA Status')}
              </label>
              <select
                value={onssaStatus}
                onChange={(e) => setOnssaStatus(e.target.value as ONSSAStatus)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden font-semibold"
              >
                <option value="ONSSA Certifié (Catégorie Bleue)">ONSSA Certifié (Catégorie Bleue)</option>
                <option value="ONSSA Base (Catégorie Blanche)">ONSSA Base (Catégorie Blanche)</option>
                <option value="ONSSA Standard Contrôlé (Catégorie Jaune)">ONSSA Standard Contrôlé</option>
                <option value="En cours d'homologation">En cours d'homologation</option>
                <option value="Conventionnel">Conventionnel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tr(language, 'Région de production', 'جهة الإنتاج', 'Region')}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as MoroccanRegion)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-teal-500 focus:outline-hidden"
            >
              {MOROCCAN_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{tr(language, 'Enregistrer le lot de pépinière', 'تأكيد تسجيل الدفعة', 'Save Sapling Batch')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
