import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  Truck,
  Plus,
  MapPin,
  Clock,
  ThermometerSnowflake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
} from 'lucide-react';

export const LogisticsPage: React.FC = () => {
  const {
    language,
    transportTripRequests,
    carrierVehicles,
    openLogisticsModal,
    setActiveTab,
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'requests' | 'fleet'>('requests');

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 mb-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>FRET & LOGISTIQUE FRIGORIFIQUE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Transport & Expéditions Agricoles', 'الشحن والنقل الفلاحي', 'Agricultural Freight & Logistics')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Trouvez des transporteurs frigorifiques certifiés, demandez une cotation et suivez vos livraisons.',
              'حجز شاحنات النقل المبرد المعتمدة وتتبع الشحنات بين مناطق الإنتاج وأسواق الجملة.',
              'Book certified temperature-controlled transport and track deliveries.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('transport_request')}
            className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{tr(language, 'Demander un transport', 'طلب نقل شحنة', 'Request Transport')}</span>
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTabSub('requests')}
          className={`pb-2.5 px-3 transition cursor-pointer ${
            activeTabSub === 'requests'
              ? 'border-b-2 border-blue-600 text-blue-900'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Demandes d’acheminement ({transportTripRequests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSub('fleet')}
          className={`pb-2.5 px-3 transition cursor-pointer ${
            activeTabSub === 'fleet'
              ? 'border-b-2 border-blue-600 text-blue-900'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Flotte Frigorifique Disponible ({carrierVehicles.length})
        </button>
      </div>

      {/* Contenu */}
      {activeTabSub === 'requests' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {transportTripRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    #{req.requestNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                    {req.status}
                  </span>
                </div>

                <h3 className="font-black text-sm text-stone-900">{req.cargoDescription}</h3>

                <div className="space-y-1 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Départ : {req.originCity} → Arrivée : {req.destinationCity}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Date souhaitée : {req.departureDate}</span>
                  </div>
                  {req.requiredTemperatureC !== undefined && (
                    <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                      <ThermometerSnowflake className="w-3.5 h-3.5" />
                      <span>T° de consigne : {req.requiredTemperatureC}°C</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">Budget proposé</span>
                  <span className="text-sm font-black text-blue-900">
                    {req.budgetProposedMAD ? `${req.budgetProposedMAD.toLocaleString('fr-FR')} MAD` : 'À débattre'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('delivery_tracking')}
                  className="py-1.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                >
                  <span>Suivi trajet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {carrierVehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                  {v.plateNumber}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {v.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p><strong>Type :</strong> {v.vehicleType.replace(/_/g, ' ')}</p>
                <p><strong>Capacité :</strong> {v.capacityTonnes} Tonnes</p>
                <p><strong>Chauffeur :</strong> {v.driverName} ({v.driverPhone})</p>
                <p><strong>Position GPS :</strong> {v.gpsLocation || 'En transit'}</p>
              </div>

              {v.temperatureControlled && (
                <div className="p-2 rounded-xl bg-blue-50 text-[11px] text-blue-800 flex items-center gap-1.5 font-semibold">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-600" />
                  <span>Groupe frigorifique {v.tempMinC}°C à {v.tempMaxC}°C</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
