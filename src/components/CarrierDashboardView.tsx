import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  Truck,
  ShieldCheck,
  Package,
  MapPin,
  Clock,
  Phone,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  Sliders,
  ThermometerSnowflake,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { CarrierVehicle, TransportTripRequest, MoroccanRegion } from '../types';
import { RoleAccessRestrictedNotice } from './RoleAccessRestrictedNotice';

export const CarrierDashboardView: React.FC = () => {
  const {
    language,
    userProfile,
    canManageCarrier,
    switchActiveRole,
    carrierVehicles,
    addCarrierVehicle,
    updateCarrierVehicleStatus,
    transportTripRequests,
    addTransportTripRequest,
    updateTransportTripStatus,
    transportBookings,
    openLogisticsModal,
    openExcelStockModal,
  } = useApp();

  if (!canManageCarrier) {
    return (
      <RoleAccessRestrictedNotice
        requiredRole="carrier"
        title={tr(
          language,
          'Espace Transporteur & Logistique Réservé',
          'فضاء خاص بشركات النقل واللوجستيك الفلاحي',
          'Authorized Carrier & Logistics Workspace'
        )}
        description={tr(
          language,
          "Cet espace (gestion de flotte frigorifique, acceptation de missions de fret, feuilles de route) est réservé aux transporteurs professionnels enregistrés.",
          "هذا الفضاء مخصص للناقلين المهنيين لإدارة أسطول الشاحنات وتأكيد مهام الشحن والمسالك.",
          "This space is reserved for registered professional carriers to manage refrigerated fleets and freight trips."
        )}
      />
    );
  }

  const [activeSubTab, setActiveSubTab] = useState<'fleet' | 'requests' | 'missions' | 'deliveries'>('fleet');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  // Formulaire d'ajout de véhicule
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<CarrierVehicle['vehicleType']>('camion_frigo_semi');
  const [capacityTonnes, setCapacityTonnes] = useState<number>(24);
  const [temperatureControlled, setTemperatureControlled] = useState<boolean>(true);
  const [tempMinC, setTempMinC] = useState<number>(2);
  const [tempMaxC, setTempMaxC] = useState<number>(10);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [gpsLocation, setGpsLocation] = useState('Agadir Hub Logistique');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !driverName) return;

    addCarrierVehicle({
      plateNumber,
      vehicleType,
      capacityTonnes,
      temperatureControlled,
      tempMinC: temperatureControlled ? tempMinC : undefined,
      tempMaxC: temperatureControlled ? tempMaxC : undefined,
      availableRegions: [userProfile.region],
      status: 'disponible',
      gpsLocation,
      driverName,
      driverPhone,
    });

    setIsAddVehicleModalOpen(false);
    setPlateNumber('');
    setDriverName('');
    setDriverPhone('');
  };

  // KPI calculés
  const availableVehiclesCount = carrierVehicles.filter(v => v.status === 'disponible').length;
  const inMissionVehiclesCount = carrierVehicles.filter(v => v.status === 'en_mission').length;
  const pendingRequestsCount = transportTripRequests.filter(r => r.status === 'en_attente').length;
  const totalFleetCapacityTonnes = carrierVehicles.reduce((acc, v) => acc + v.capacityTonnes, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-in fade-in duration-300">
      {/* BANNER EN-TÊTE TRANSPORTEUR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102438] via-[#15344f] to-[#1c4b6e] p-6 sm:p-8 text-white shadow-xl border border-sky-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                {tr(language, 'Espace Transporteur & Fret Agricole Agréé', 'فضاء الناقل والشحن الفلاحي المعتمد', 'Certified Agri Carrier & Freight Space')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
                ❄️ {tr(language, 'Chaîne du Froid & Contrôle ATP', 'سلسلة التبريد ومراقبة الحرارة', 'Cold Chain & Temperature Controlled')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{userProfile.companyName || userProfile.displayName || tr(language, 'AgriFret Maroc Express', 'الشحن الفلاحي السريع', 'AgriFret Morocco Express')}</span>
            </h1>

            <p className="text-xs sm:text-sm text-sky-100/90 max-w-2xl leading-relaxed">
              {tr(
                language,
                'Gérez votre flotte de camions frigorifiques et plateaux, acceptez les demandes de transport de fruits, légumes et plants émis par les acheteurs et producteurs, et suivez vos livraisons sécurisées.',
                'إدارة أسطول الشاحنات المبردة، قبول طلبات نقل الخضر والفواكه والشتلات الصادرة عن المشترين والفلاحين، وتتبع التسليم المضمون.',
                'Manage your reefer and flatbed truck fleet, accept freight requests from buyers and producers, and track secured deliveries.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-sky-200/80 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {userProfile.region}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                {userProfile.phone || '+212 6 61 99 88 77'}
              </span>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              id="btn-carrier-add-vehicle"
              type="button"
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-black text-xs transition shadow-lg cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{tr(language, 'Ajouter un Véhicule', 'إضافة شاحنة للأسطول', 'Add Truck / Vehicle')}</span>
            </button>

            <button
              id="btn-carrier-excel-bulk"
              type="button"
              onClick={() => openExcelStockModal('carrier')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-100 font-bold text-xs border border-sky-400/40 transition cursor-pointer backdrop-blur-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-300" />
              <span>{tr(language, 'Excel Flotte & Véhicules', 'إكسيل الأسطول والشاحنات', 'Excel Fleet & Trucks')}</span>
            </button>

            <button
              type="button"
              onClick={() => openLogisticsModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer backdrop-blur-xs"
            >
              <Sliders className="w-4 h-4 text-sky-300" />
              <span>{tr(language, 'Calculateur de Fret & Trajets', 'حاسبة الشحن والمسافات', 'Freight Calculator')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STATISTIQUES TRANSPORTEUR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 : Véhicules Disponibles */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-sky-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Véhicules Prêts', 'الشاحنات الجاهزة', 'Ready Vehicles')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{availableVehiclesCount} <span className="text-xs font-bold text-stone-500">/ {carrierVehicles.length} total</span></div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {inMissionVehiclesCount} {tr(language, 'en mission sur la route', 'في مهمة على الطريق', 'on route')}
          </p>
        </div>

        {/* Metric 2 : Capacité totale flotte */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Capacité Flotte', 'حمولة الأسطول الإجمالية', 'Fleet Capacity')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalFleetCapacityTonnes} <span className="text-xs font-bold text-stone-500">Tonnes</span></div>
          <p className="text-[11px] text-stone-500">
            {tr(language, 'Semi-frigo & Plateaux', 'شاحنات تبريد ومقطورات', 'Reefer trailers & flatbeds')}
          </p>
        </div>

        {/* Metric 3 : Demandes de fret en attente */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Demandes de Fret', 'طلبات النقل الواردة', 'Freight Requests')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{pendingRequestsCount}</div>
          <p className="text-[11px] text-amber-600 font-semibold">
            {tr(language, 'À assigner ou accepter', 'في انتظار الموافقة والتعيين', 'To assign or accept')}
          </p>
        </div>

        {/* Metric 4 : Missions confirmées */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {tr(language, 'Réservations Confirmées', 'الحجوزات المؤكدة', 'Confirmed Bookings')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{transportBookings.length}</div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {tr(language, 'Paiements fret garantis', 'مستحقات الشحن مضمونة', 'Guaranteed carrier payouts')}
          </p>
        </div>
      </div>

      {/* SOUS-ONGLETS DU TRANSPORTEUR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab-carrier-fleet"
            type="button"
            onClick={() => setActiveSubTab('fleet')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'fleet'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{tr(language, 'Flotte de Véhicules', 'أسطول الشاحنات', 'Vehicle Fleet')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {carrierVehicles.length}
            </span>
          </button>

          <button
            id="tab-carrier-requests"
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{tr(language, 'Demandes de Transport', 'طلبات النقل المعروضة', 'Transport Requests')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {transportTripRequests.length}
            </span>
          </button>

          <button
            id="tab-carrier-missions"
            type="button"
            onClick={() => setActiveSubTab('missions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'missions'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-white/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{tr(language, 'Réservations & Missions', 'الحجوزات والرحلات الجارية', 'Active Missions')}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
              {transportBookings.length}
            </span>
          </button>
        </div>
      </div>

      {/* CONTENU SOUS-ONGLET 1 : FLOTTE DE VÉHICULES */}
      {activeSubTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carrierVehicles.map(vehicle => (
            <div key={vehicle.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block mb-1">
                    {vehicle.plateNumber}
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm capitalize">
                    {vehicle.vehicleType.replace(/_/g, ' ')}
                  </h3>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  vehicle.status === 'disponible'
                    ? 'bg-emerald-100 text-emerald-800'
                    : vehicle.status === 'en_mission'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {vehicle.status === 'disponible' ? '✅ Disponible' : vehicle.status === 'en_mission' ? '🚚 En Mission' : '🔧 Maintenance'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">{tr(language, 'Capacité Utile :', 'الحمولة المفيدة :', 'Capacity :')}</span>
                  <span className="font-bold text-stone-900">{vehicle.capacityTonnes} Tonnes</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">{tr(language, 'Thermorégulé :', 'مبرد ومراقب :', 'Reefer :')}</span>
                  <span className="font-bold text-stone-900">
                    {vehicle.temperatureControlled ? `❄️ Oui (${vehicle.tempMinC}°C à ${vehicle.tempMaxC}°C)` : '❌ Non (Bâche / Plateau)'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">{tr(language, 'Chauffeur :', 'السائق :', 'Driver :')}</span>
                  <span className="font-semibold text-stone-900">{vehicle.driverName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">{tr(language, 'Position GPS :', 'الموقع الحالي :', 'GPS :')}</span>
                  <span className="font-semibold text-sky-800 truncate max-w-[160px]">{vehicle.gpsLocation || 'En station'}</span>
                </div>
              </div>

              {/* Boutons de changement de statut */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100 text-xs">
                <button
                  type="button"
                  onClick={() => updateCarrierVehicleStatus(vehicle.id, 'disponible')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    vehicle.status === 'disponible' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Disponible
                </button>
                <button
                  type="button"
                  onClick={() => updateCarrierVehicleStatus(vehicle.id, 'en_mission')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    vehicle.status === 'en_mission' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  En route
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENU SOUS-ONGLET 2 : DEMANDES DE TRANSPORT */}
      {activeSubTab === 'requests' && (
        <div className="space-y-3">
          {transportTripRequests.map(req => (
            <div key={req.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {req.requestNumber}
                  </span>
                  <span className="font-bold text-stone-900 text-sm">
                    {req.originCity} ➔ {req.destinationCity}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                    {req.cargoType.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-stone-600 font-medium">
                  {req.cargoDescription} — <span className="font-bold text-stone-900">{req.volumeTonnes} Tonnes</span>
                  {req.requiredTemperatureC !== undefined && (
                    <span className="ml-2 text-sky-700 font-bold">❄️ T° consigne : {req.requiredTemperatureC}°C</span>
                  )}
                </p>

                <div className="text-xs text-stone-500">
                  Demandeur : <span className="font-semibold text-stone-800">{req.requesterName}</span> ({req.requesterRole}) — Tél : <span className="font-semibold text-stone-800">{req.requesterPhone}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                {req.budgetProposedMAD && (
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">Budget Proposé</span>
                    <span className="text-base font-black text-emerald-800 font-mono">{req.budgetProposedMAD.toLocaleString()} MAD</span>
                  </div>
                )}

                {req.status === 'en_attente' ? (
                  <button
                    type="button"
                    onClick={() => updateTransportTripStatus(req.id, 'assigne', carrierVehicles[0]?.id)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
                  >
                    {tr(language, 'Accepter & Assigner un Camion', 'قبول وتعيين شاحنة', 'Accept & Assign Truck')}
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✅ {req.status === 'assigne' ? 'Assigné au camion' : req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENU SOUS-ONGLET 3 : RÉSERVATIONS & MISSIONS */}
      {activeSubTab === 'missions' && (
        <div className="space-y-3">
          {transportBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
              <Truck className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-800">
                {tr(language, 'Aucune réservation de transport en cours', 'لا توجد حجوزات نقل جارية', 'No current transport bookings')}
              </p>
            </div>
          ) : (
            transportBookings.map(b => (
              <div key={b.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {b.bookingRef}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">
                      {b.originCity} ➔ {b.destinationCity} ({b.distanceKm} km)
                    </span>
                  </div>
                  <div className="text-xs text-stone-600">
                    Contact : <span className="font-semibold text-stone-800">{b.contactName}</span> ({b.contactPhone}) — Véhicule : <span className="font-semibold text-stone-800">{b.vehicleType}</span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Chargement prévu : <span className="font-bold text-stone-800">{b.pickupDate}</span> — Transit estimé : <span className="font-bold text-stone-800">{b.transitHoursEstimate} h</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-800 font-mono">
                    Net transporteur : {b.carrierPayoutMAD.toLocaleString()} MAD
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    🚛 {b.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALE D'AJOUT DE VÉHICULE */}
      {isAddVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-stone-900 text-base">
                  {tr(language, 'Ajouter un Véhicule à la Flotte', 'إضافة شاحنة جديدة إلى الأسطول', 'Add Truck to Fleet')}
                </h3>
              </div>
              <button
                onClick={() => setIsAddVehicleModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Immatriculation / N° Plaque :
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: 42-A-89211 (Agadir)"
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Type de Camion :</label>
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-sky-600 bg-white"
                  >
                    <option value="camion_frigo_semi">Semi-remorque Frigo</option>
                    <option value="camion_frigo_porteur">Porteur Frigo</option>
                    <option value="camion_plateau">Camion Plateau</option>
                    <option value="camion_benne">Camion Benne Vrac</option>
                    <option value="fourgon_isotherme">Fourgonnette Isotherme</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Capacité (Tonnes) :</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={capacityTonnes}
                    onChange={e => setCapacityTonnes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 flex items-center gap-2 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={temperatureControlled}
                    onChange={e => setTemperatureControlled(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>Contrôle de Température / Groupe Froid (ATP)</span>
                </label>

                {temperatureControlled && (
                  <div className="grid grid-cols-2 gap-2 mt-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <div>
                      <span className="text-[10px] text-stone-500 block">T° Min (°C)</span>
                      <input
                        type="number"
                        value={tempMinC}
                        onChange={e => setTempMinC(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">T° Max (°C)</span>
                      <input
                        type="number"
                        value={tempMaxC}
                        onChange={e => setTempMaxC(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nom Chauffeur :</label>
                  <input
                    type="text"
                    required
                    placeholder="Nom complet"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Téléphone Chauffeur :</label>
                  <input
                    type="text"
                    placeholder="+212 6..."
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition shadow-sm"
                >
                  Enregistrer Véhicule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
