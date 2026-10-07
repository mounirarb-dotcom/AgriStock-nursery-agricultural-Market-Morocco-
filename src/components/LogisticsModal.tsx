import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Calendar,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Clock,
  DollarSign,
  ArrowRight,
  Info,
  Thermometer,
  Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CargoType, VehicleType } from '../types';
import { LOGISTICS_DISTANCES } from '../data/monetizationData';
import FinanceService from '../services/FinanceService';

export const LogisticsModal: React.FC = () => {
  const {
    isLogisticsModalOpen,
    closeLogisticsModal,
    logisticsInitialData,
    createTransportBooking,
    userProfile,
  } = useApp();

  const [originCity, setOriginCity] = useState('Agadir');
  const [destinationCity, setDestinationCity] = useState('Casablanca');
  const [cargoType, setCargoType] = useState<CargoType>('fresh_produce');
  const [vehicleType, setVehicleType] = useState<VehicleType>('camion_frigo');
  const [cargoVolumeTonnes, setCargoVolumeTonnes] = useState<number>(10);
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [contactName, setContactName] = useState(userProfile.displayName || '');
  const [contactPhone, setContactPhone] = useState(userProfile.phone || userProfile.whatsapp || '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    if (logisticsInitialData) {
      if (logisticsInitialData.originCity) setOriginCity(logisticsInitialData.originCity);
      if (logisticsInitialData.destinationCity) setDestinationCity(logisticsInitialData.destinationCity);
      if (logisticsInitialData.cargoType) setCargoType(logisticsInitialData.cargoType);
      if (logisticsInitialData.volumeTonnes) setCargoVolumeTonnes(logisticsInitialData.volumeTonnes);
    }
  }, [logisticsInitialData]);

  if (!isLogisticsModalOpen) return null;

  // Calculate distance
  const distance =
    (LOGISTICS_DISTANCES[originCity] && LOGISTICS_DISTANCES[originCity][destinationCity]) ||
    (LOGISTICS_DISTANCES[destinationCity] && LOGISTICS_DISTANCES[destinationCity][originCity]) ||
    420;

  // Pricing formula based on distance, vehicle and cargo special requirements
  const vehicleBaseRatePerKm: Record<VehicleType, number> = {
    fourgon_aere: 5.5,
    camion_frigo: 9.8,
    semi_remorque_25t: 14.5,
    plateau_agricole: 11.2,
  };

  const cargoFactor: Record<CargoType, number> = {
    plants_mottes: 1.15,    // Fragilité accrue, besoin d'aération douce
    trees_pots: 1.1,        // Sangles & arrimage spécial arbres
    fresh_produce: 1.2,     // Groupe frigorifique actif (8-12°C)
    bulk_standing: 1.0,     // Vrac standard
  };

  const estimatedPriceMAD = Math.round(
    Math.max(1200, distance * vehicleBaseRatePerKm[vehicleType] * cargoFactor[cargoType])
  );
  const logisticsBreakdown = FinanceService.calculateLogisticsBreakdown(estimatedPriceMAD);
  const platformCommissionMAD = logisticsBreakdown.platformCommissionMAD;
  const carrierPayoutMAD = logisticsBreakdown.carrierPayoutMAD;
  const transitHours = Math.round(distance / 65) + 1; // Moyenne 65 km/h + manutention

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      alert('Veuillez renseigner le nom et téléphone du contact logistique.');
      return;
    }

    const carrierNames = [
      'AgriFret Maroc Express (Réseau Agréé)',
      'Trans-Souss Frigo 25T',
      'Atlas Plantes & Arbres Logistique',
    ];
    const assignedCarrier =
      cargoType === 'trees_pots'
        ? carrierNames[2]
        : cargoType === 'fresh_produce'
        ? carrierNames[1]
        : carrierNames[0];

    const booking = createTransportBooking({
      carrierName: assignedCarrier,
      originCity,
      destinationCity,
      distanceKm: distance,
      cargoType,
      vehicleType,
      cargoVolumeTonnes,
      totalPriceMAD: estimatedPriceMAD,
      platformCommissionMAD,
      carrierPayoutMAD,
      transitHoursEstimate: transitHours,
      pickupDate,
      contactName,
      contactPhone,
    });

    setBookingRef(booking.bookingRef);
    setIsSuccess(true);
  };

  const CITIES = ['Agadir', 'Casablanca', 'Berkane', 'Marrakech', 'Meknès', 'Fès', 'Larache', 'Kénitra', 'Tanger', 'Oujda'];

  return (
    <div
      id="logistics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="logistics-modal"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-stone-900 to-blue-950 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shadow-inner">
              <Truck className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Services Logistiques & Fret Agricole
                </h3>
                <span className="text-xs bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Partenaires Agréés
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Transport spécialisé de plantes fragiles, arbres et légumes frais réfrigérés
              </p>
            </div>
          </div>
          <button
            onClick={closeLogisticsModal}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-900 mb-2">
                Course Réf: {bookingRef}
              </span>
              <h4 className="text-2xl font-black text-stone-900">
                Transport Confirmé avec Succès !
              </h4>
              <p className="text-stone-600 max-w-md mx-auto text-sm mt-1">
                Le transporteur partenaire a reçu la feuille de route pour le <strong>{pickupDate}</strong> entre <strong>{originCity}</strong> et <strong>{destinationCity}</strong>.
              </p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-left max-w-lg mx-auto space-y-2 text-xs text-blue-900">
              <div className="flex items-center space-x-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Garantie de Fret Agricole :</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-blue-800">
                <li>Camion inspecté avec contrôle thermométrique et aération adapté.</li>
                <li>Le chauffeur vous contactera au <strong>{contactPhone}</strong> 2h avant le chargement.</li>
                <li>Passeport phytosanitaire ONSSA vérifié au départ.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  closeLogisticsModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md"
              >
                Terminer & Retour
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitBooking} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Value proposition callout */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-start space-x-3 text-stone-700">
              <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-stone-900 block font-bold mb-0.5">
                  Fini le casse-tête du transport agricole au Maroc :
                </strong>
                Plateforme connectée à plus de 120 transporteurs certifiés spécialisés en plantes vivantes en alvéoles, arbres en pots et légumes réfrigérés. Devis immédiat et suivi GPS inclus.
              </div>
            </div>

            {/* Origin & Destination route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <label className="block text-stone-700 font-bold mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>Ville de départ / Chargement :</span>
                </label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ville de destination / Livraison :</span>
                </label>
                <select
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo Type & Vehicle Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-bold mb-1.5">
                  Type de marchandise agricole :
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value as CargoType)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="plants_mottes">Jeunes plants en mottes / alvéoles (très fragile)</option>
                  <option value="trees_pots">Arbres en conteneurs / pots (oliviers, agrumes, palmiers)</option>
                  <option value="fresh_produce">Légumes & Fruits frais (température dirigée 8-12°C)</option>
                  <option value="bulk_standing">Récolte brute / vrac en benne</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1.5">
                  Type de véhicule recommandé :
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="fourgon_aere">Fourgonnette aérée thermo-isolée (1 à 3 Tonnes)</option>
                  <option value="camion_frigo">Camion porteur frigorifique (6 à 12 Tonnes)</option>
                  <option value="semi_remorque_25t">Semi-remorque frigorifique (24 à 25 Tonnes)</option>
                  <option value="plateau_agricole">Plateau agricole bâché spécial arbres</option>
                </select>
              </div>
            </div>

            {/* Volume & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-bold mb-1.5">
                  Volume estimé (Tonnes) :
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={28}
                  step={0.5}
                  value={cargoVolumeTonnes}
                  onChange={(e) => setCargoVolumeTonnes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>Date d'enlèvement souhaitée :</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Contact person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-bold mb-1.5">
                  Nom du contact chargement :
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="ex: Responsable Station"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1.5">
                  Téléphone du contact :
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Instant Freight Quotation & Platform Commission */}
            <div className="bg-stone-900 text-white rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Trajet calculé :</span>
                <span className="font-semibold text-stone-200">
                  {originCity} → {destinationCity} ({distance} km • ~{transitHours}h de route)
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-400">
                <span>Rémunération transporteur certifié :</span>
                <span className="font-mono">{(carrierPayoutMAD || 0).toLocaleString('fr-FR')} MAD</span>
              </div>

              <div className="flex items-center justify-between text-blue-300">
                <span>Commission mise en relation & suivi logistique (8%) :</span>
                <span className="font-mono">+{(platformCommissionMAD || 0).toLocaleString('fr-FR')} MAD</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-700">
                <div>
                  <span className="text-stone-400 block text-[11px]">Tarif global tout inclus</span>
                  <span className="text-2xl font-black text-blue-400">
                    {(estimatedPriceMAD || 0).toLocaleString('fr-FR')} MAD
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px]">
                    Assurance cargaison incluse
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={closeLogisticsModal}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold"
              >
                Annuler
              </button>
              <button
                id="submit-logistics-booking-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md hover:shadow-lg flex items-center space-x-2 transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>Réserver la course ({((estimatedPriceMAD || 0)).toLocaleString('fr-FR')} MAD)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
