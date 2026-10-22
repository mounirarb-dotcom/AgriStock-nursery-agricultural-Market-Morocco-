import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  ThermometerSnowflake,
} from 'lucide-react';

export const TransportRequestPage: React.FC = () => {
  const {
    language,
    addTransportTripRequest,
    userProfile,
    setActiveTab,
  } = useApp();

  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoType, setCargoType] = useState<'fruits_legumes' | 'plants_pepiniere' | 'bétail' | 'vrac_céréales'>('fruits_legumes');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [volumeTonnes, setVolumeTonnes] = useState<number>(10);
  const [requiredTemperatureC, setRequiredTemperatureC] = useState<number>(4);
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [budgetProposedMAD, setBudgetProposedMAD] = useState<number>(3500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoDescription.trim() || !originCity.trim() || !destinationCity.trim()) return;

    addTransportTripRequest({
      requesterName: userProfile.displayName || userProfile.companyName || 'Opérateur Agricole',
      requesterRole: userProfile.role === 'nursery' ? 'nursery' : userProfile.role === 'seller' ? 'seller' : 'buyer',
      requesterPhone: userProfile.phone || '+212 600 000 000',
      originCity: originCity.trim(),
      destinationCity: destinationCity.trim(),
      cargoDescription: cargoDescription.trim(),
      cargoType,
      volumeTonnes: Number(volumeTonnes),
      requiredTemperatureC: Number(requiredTemperatureC),
      departureDate,
      budgetProposedMAD: Number(budgetProposedMAD),
    });

    setActiveTab('logistics');
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      <button
        type="button"
        onClick={() => setActiveTab('logistics')}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{tr(language, 'Retour à la logistique', 'العودة لصفحة النقل', 'Back to Logistics')}</span>
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 mb-2">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>DEMANDE DE FRET ROUTIER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            {tr(language, 'Publier une demande de transport', 'طلب شاحنة لنقل محصول', 'Post a Transport Request')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(language, 'Recevez des propositions de transporteurs frigorifiques certifiés pour acheminer votre lot.', 'احصل على عروض من ناقلين معتمدين مع الحفاظ على سلسلة التبريد.', 'Receive bids from certified refrigerated carriers.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description de la cargaison
            </label>
            <input
              type="text"
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder="Ex: 24 Palettes de Tomates Torry F1 en caisses 6kg"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Type de cargaison</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
              >
                <option value="fruits_legumes">Fruits & Légumes (Primeurs)</option>
                <option value="plants_pepiniere">Plants de Pépinière</option>
                <option value="bétail">Bétail & Cheptel</option>
                <option value="vrac_céréales">Céréales & Vrac</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tonnage estimé (Tonnes)</label>
              <input
                type="number"
                min="0.5"
                step="any"
                value={volumeTonnes}
                onChange={(e) => setVolumeTonnes(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Ville de Départ (Chargement)</label>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="Ex: Chtouka Aït Baha"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Ville d’Arrivée (Déchargement)</label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Ex: Marché de Gros Casablanca"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date départ souhaitée</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">T° consigne (°C)</label>
              <input
                type="number"
                value={requiredTemperatureC}
                onChange={(e) => setRequiredTemperatureC(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden font-bold text-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Budget proposé (MAD)</label>
              <input
                type="number"
                min="100"
                value={budgetProposedMAD}
                onChange={(e) => setBudgetProposedMAD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publier la demande de transport</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
