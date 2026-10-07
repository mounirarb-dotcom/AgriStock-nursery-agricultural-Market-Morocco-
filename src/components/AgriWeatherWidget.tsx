import React, { useEffect, useState, useMemo } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Sprout,
  ShieldAlert,
  MapPin,
  Calendar,
  Clock,
  Info,
  Layers,
} from 'lucide-react';
import { MoroccanRegion } from '../types';
import { useAppContext } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  AgriWeatherReport,
  REGION_COORDINATES,
  fetchAgriWeather,
} from '../services/weatherApi';

interface AgriWeatherWidgetProps {
  compactOnly?: boolean;
}

export const AgriWeatherWidget: React.FC<AgriWeatherWidgetProps> = ({ compactOnly = false }) => {
  const { userProfile, language } = useAppContext();

  // Afficher la météo et bulletin agronomique exclusivement pour les vendeurs et pépinières
  const isSellerOrNursery =
    userProfile.role === 'seller' ||
    userProfile.role === 'nursery' ||
    Boolean(userProfile.roles && (userProfile.roles.includes('seller') || userProfile.roles.includes('nursery')));

  if (!isSellerOrNursery) {
    return null;
  }

  // Region state (defaults to user profile region or Souss-Massa)
  const [selectedRegion, setSelectedRegion] = useState<MoroccanRegion>(() => {
    return userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)';
  });

  const [weatherData, setWeatherData] = useState<AgriWeatherReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState<boolean>(false);

  // Sync region when userProfile changes
  useEffect(() => {
    if (userProfile.region && userProfile.region !== selectedRegion) {
      setSelectedRegion(userProfile.region);
    }
  }, [userProfile.region]);

  const loadWeather = async (region: MoroccanRegion, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchAgriWeather(region);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load agri weather', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedRegion);
    // Refresh automatically every 30 minutes
    const interval = setInterval(() => {
      loadWeather(selectedRegion, true);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedRegion]);

  const allRegions = useMemo(() => {
    return Object.keys(REGION_COORDINATES) as MoroccanRegion[];
  }, []);

  const activeAlertCount = useMemo(() => {
    if (!weatherData) return 0;
    let count = 0;
    if (weatherData.alerts.frostAlert.active) count++;
    if (weatherData.alerts.cherguiAlert.active) count++;
    if (weatherData.alerts.sprayingWindow.status === 'defavorable') count++;
    if (weatherData.alerts.fungalDiseaseRisk.level === 'eleve') count++;
    return count;
  }, [weatherData]);

  return (
    <div id="agri-weather-widget" className="w-full">
      {/* Top Agricultural Weather Bar */}
      <div className="bg-white text-stone-900 rounded-2xl border border-stone-200/90 p-3 sm:p-3.5 shadow-xs hover:border-emerald-300/60 transition">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Left section: Icon + Region Selector + Current Temp */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Weather Icon Badge */}
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
              {weatherData?.weatherIcon || '⛅'}
            </div>

            {/* Region Selector with Dropdown */}
            <div className="relative">
              <button
                id="btn-weather-region-select"
                type="button"
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100/90 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold border border-stone-200 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[190px] sm:max-w-[260px] font-bold">
                  {selectedRegion}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {/* Region Dropdown List */}
              {isRegionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRegionDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-1.5 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100">
                      {tr(language, 'Bassin Agricole / Région Marocaine', 'الحوض الزراعي / الجهة المغربية', 'Agricultural Basin / Moroccan Region')}
                    </div>
                    {allRegions.map(reg => {
                      const isSelected = reg === selectedRegion;
                      const hub = REGION_COORDINATES[reg]?.hubName;
                      return (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(reg);
                            setIsRegionDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                              : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                          }`}
                        >
                          <span className="font-semibold">{reg}</span>
                          <span className="text-[10px] text-stone-500 font-normal">
                            {tr(language, 'Station : ', 'محطة : ', 'Station: ')}{hub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Current Temperature & Description */}
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {isLoading ? '--' : `${weatherData?.temperature ?? 24}°C`}
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline-block font-medium">
                {language === 'ar'
                  ? weatherData?.weatherDescriptionAr
                  : language === 'en'
                  ? (weatherData?.weatherDescriptionEn || weatherData?.weatherDescriptionFr)
                  : weatherData?.weatherDescriptionFr}
              </span>
            </div>
          </div>

          {/* Middle section: Key Agronomic Parameters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-stone-700">
            {/* Humidity */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-950"
              title={tr(language, "Humidité Relative", "الرطوبة النسبية", "Relative Humidity")}
            >
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>{tr(language, 'HR: ', 'رطوبة: ', 'RH: ')}<strong className="text-sky-950 font-bold">{weatherData?.relativeHumidity ?? 50}%</strong></span>
            </div>

            {/* Wind */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200 text-stone-800"
              title={tr(language, "Vitesse du Vent", "سرعة الرياح", "Wind Speed")}
            >
              <Wind className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr(language, 'Vent: ', 'رياح: ', 'Wind: ')}<strong className="text-stone-900 font-bold">{weatherData?.windSpeed ?? 12} km/h</strong></span>
            </div>

            {/* Evapotranspiration ET0 */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950"
              title={tr(language, "Évapotranspiration de référence journalière (ET0 FAO-56)", "البخر نتح المرجعي اليومي (ET0)", "Daily reference evapotranspiration (ET0 FAO-56)")}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>ET0: <strong className="text-emerald-950 font-black">{weatherData?.todayEt0 ?? 4.2} mm/{tr(language, 'j', 'يوم', 'd')}</strong></span>
            </div>

            {/* Agronomic Alert pill if any */}
            {weatherData?.alerts.cherguiAlert.active ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {tr(language, 'Alerte Chergui', 'تحذير الشركي', 'Chergui Alert')}
              </span>
            ) : weatherData?.alerts.frostAlert.active ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-300 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 text-cyan-600" />
                {tr(language, 'Vigilance Gelée', 'يقظة صقيع', 'Frost Vigilance')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold hidden md:inline-flex">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {tr(language, 'Traitements Favorables', 'معالجة ملائمة', 'Optimal Spraying')}
              </span>
            )}
          </div>

          {/* Right section: Action Buttons */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {/* Refresh button */}
            <button
              id="btn-weather-refresh"
              type="button"
              onClick={() => loadWeather(selectedRegion, true)}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition disabled:opacity-50 border border-stone-200"
              title={tr(language, "Actualiser les données météo Open-Meteo", "تحديث بيانات الطقس", "Refresh Open-Meteo weather data")}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Expand / Detailed Agronomic Forecast modal button */}
            {!compactOnly && (
              <button
                id="btn-weather-details"
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition active:scale-95"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>{tr(language, 'Bulletin Agronomique', 'النشرة الزراعية', 'Agronomic Report')}</span>
                {activeAlertCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black flex items-center justify-center">
                    {activeAlertCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED AGRONOMIC WEATHER MODAL */}
      {isModalOpen && weatherData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-stone-200 text-stone-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 sm:p-6 bg-[#0e2118] border-b border-[#1b3b2c] text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {weatherData.weatherIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {tr(language, 'Bulletin & Météo Agricole en Temps Réel', 'النشرة والطقس الفلاحي المباشر', 'Real-Time Agri-Weather Report')}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                      Open-Meteo Direct
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">{weatherData.region}</span>
                    <span>• {tr(language, 'Station : ', 'المحطة : ', 'Station: ')}{weatherData.hubName}</span>
                  </div>
                  <p className="text-[11px] text-stone-300/80 mt-0.5 italic">
                    {tr(language, 'Spécialités : ', 'الزراعات الرئيسية : ', 'Key crops: ')}{weatherData.cropsSpecialty}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
                title={tr(language, "Fermer", "إغلاق", "Close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-white">
              
              {/* 1. Main Current Status Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Temp */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{tr(language, 'Température', 'درجة الحرارة', 'Temperature')}</span>
                    <Thermometer className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-stone-900">
                    {weatherData.temperature}°C
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    {tr(language, 'Ressenti', 'المحسوسة', 'Feels like')} {weatherData.apparentTemperature}°C
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{tr(language, "Humidité de l'Air", 'رطوبة الجو', 'Air Humidity')}</span>
                    <Droplets className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-black text-stone-900">
                    {weatherData.relativeHumidity}%
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    {tr(language, 'Point de rosée calculé', 'نقطة الندى المحسوبة', 'Dew point calculated')}
                  </div>
                </div>

                {/* Wind */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{tr(language, 'Vent & Rafales', 'الرياح والهبات', 'Wind & Gusts')}</span>
                    <Wind className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-stone-900">
                    {weatherData.windSpeed} <span className="text-sm font-semibold text-stone-500">km/h</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    {tr(language, 'Rafales jusqu’à', 'هبات تصل إلى', 'Gusts up to')} {weatherData.windGusts} km/h
                  </div>
                </div>

                {/* Evapotranspiration ET0 */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between text-xs text-emerald-800 mb-1 font-semibold">
                    <span>{tr(language, 'Évapotranspiration ET0', 'البخر نتح ET0', 'Evapotranspiration ET0')}</span>
                    <Sun className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-950">
                    {weatherData.todayEt0} <span className="text-sm font-semibold text-emerald-800">mm/{tr(language, 'jour', 'يوم', 'day')}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    {tr(language, 'FAO-56 (Dose d’irrigation)', 'FAO-56 (جرعة السقي)', 'FAO-56 (Irrigation dose)')}
                  </div>
                </div>
              </div>

              {/* 2. Critical Agronomic Diagnostics */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  {tr(language, 'Diagnostics Agronomiques & Recommandations Terrain', 'التشخيص الزراعي والتوصيات الميدانية', 'Agronomic Diagnostics & Field Guidance')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Card A: Besoins en Eau & Irrigation */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span>{tr(language, "Pilotage de l'Irrigation (Goutte-à-Goutte)", 'إدارة الري الموضعي (بالتنقيط)', 'Irrigation Management (Drip)')}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                        {tr(language, 'Demande : ', 'الحاجة : ', 'Demand: ')}{weatherData.alerts.irrigationGuidance.waterDemandCategory}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {weatherData.alerts.irrigationGuidance.adviceFr}
                    </p>
                    <div className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-200">
                      💡 <em>{tr(language, `Formule pratique : Dose d'eau journalière (m³/ha) = 10 × ET0 (${weatherData.todayEt0} mm) × Kc de la culture.`, `معادلة عملية : كمية المياه اليومية (م³/هكتار) = 10 × ET0 (${weatherData.todayEt0} مم) × معامل المحصول Kc.`, `Practical formula: Daily water dose (m³/ha) = 10 × ET0 (${weatherData.todayEt0} mm) × Crop Kc.`)}</em>
                    </div>
                  </div>

                  {/* Card B: Fenêtre de Traitement Phytosanitaire */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                        <Sprout className="w-4 h-4 text-emerald-700" />
                        <span>{tr(language, 'Pulvérisation & Traitements Phytosanitaires', 'المعالجة الوقائية ورش المبيدات', 'Spraying & Crop Protection')}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          weatherData.alerts.sprayingWindow.status === 'favorable'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                            : weatherData.alerts.sprayingWindow.status === 'vigilance'
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-rose-100 text-rose-900 border-rose-200'
                        }`}
                      >
                        {weatherData.alerts.sprayingWindow.labelFr}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {weatherData.alerts.sprayingWindow.adviceFr}
                    </p>
                    <div className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-200">
                      🌿 <em>{tr(language, "Recommandation ONSSA : Traiter idéalement par vent < 15 km/h et hygrométrie > 50% pour optimiser l'efficacité.", "توصية أونسا ONSSA : يفضل الرش عند رياح أقل من 15 كم/س ورطوبة تتجاوز 50% لتحقيق الفعالية القصوى.", "ONSSA Recommendation: Spray at wind speed < 15 km/h and RH > 50% for optimal efficacy.")}</em>
                    </div>
                  </div>

                  {/* Card C: Chergui & Risque Canicule */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2 ${
                      weatherData.alerts.cherguiAlert.active
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <span>{tr(language, 'Surveillance Chergui & Canicule', 'مراقبة الشركي والموجات الحارة', 'Chergui & Heatwave Monitoring')}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          weatherData.alerts.cherguiAlert.active
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {weatherData.alerts.cherguiAlert.active
                          ? tr(language, 'Alerte Active', 'تحذير مفعل', 'Active Alert')
                          : tr(language, 'Conditions Normales', 'ظروف طبيعية', 'Normal Conditions')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {tr(
                        language,
                        weatherData.alerts.cherguiAlert.messageFr,
                        weatherData.alerts.cherguiAlert.messageAr,
                        weatherData.alerts.cherguiAlert.active
                          ? 'Severe Chergui / Heat Alert: High thermal stress and dry winds. Increase irrigation and deploy nursery shade cloths early morning.'
                          : 'Normal thermal conditions.'
                      )}
                    </p>
                  </div>

                  {/* Card D: Risque Gel & Température Nocturne */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2 ${
                      weatherData.alerts.frostAlert.active
                        ? 'bg-cyan-50 border-cyan-300 text-cyan-950'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                        <Thermometer className="w-4 h-4 text-cyan-600" />
                        <span>{tr(language, 'Risque de Gelée & Température Nocturne', 'خطر الصقيع والحرارة الليلية', 'Frost Risk & Night Temperatures')}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          weatherData.alerts.frostAlert.active
                            ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {weatherData.alerts.frostAlert.active
                          ? tr(language, 'Vigilance Gel', 'يقظة صقيع', 'Frost Warning')
                          : tr(language, 'Aucun Risque de Gel', 'لا يوجد خطر صقيع', 'No Frost Risk')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {tr(
                        language,
                        weatherData.alerts.frostAlert.messageFr,
                        weatherData.alerts.frostAlert.messageAr,
                        weatherData.alerts.frostAlert.active
                          ? 'Frost Risk Warning: Night temperatures dropping near freezing point. Protect fragile seedlings and young plants under cover.'
                          : 'No frost risk detected for current crops.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 5-Day Agricultural Forecast */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  {tr(language, 'Prévisions Météorologiques Agricoles (5 Jours)', 'التوقعات المناخية الزراعية (5 أيام)', '5-Day Agricultural Weather Forecast')}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {weatherData.daily.map((day, idx) => (
                    <div
                      key={day.date + idx}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center flex flex-col justify-between hover:bg-emerald-50/40 hover:border-emerald-200 transition"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-stone-700 block">
                          {idx === 0
                            ? tr(language, "Aujourd'hui", 'اليوم', 'Today')
                            : idx === 1
                            ? tr(language, 'Demain', 'غداً', 'Tomorrow')
                            : day.date}
                        </span>
                        <div className="text-2xl my-1.5">
                          {day.weatherCode === 0 ? '☀️' : day.weatherCode <= 3 ? '⛅' : day.weatherCode >= 60 ? '🌧️' : '🌤️'}
                        </div>
                        <div className="text-xs font-black text-stone-900">
                          {day.tempMax}°C <span className="text-[10px] font-normal text-stone-500">/ {day.tempMin}°C</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-stone-200 text-[10px] text-stone-600 space-y-0.5">
                        <div>ET0 : <strong className="text-emerald-800">{day.et0Evapotranspiration} mm</strong></div>
                        <div>{tr(language, 'Pluie : ', 'أمطار : ', 'Rain: ')}<strong className="text-sky-800">{day.precipitationSum} mm</strong></div>
                        <div>{tr(language, 'Vent max : ', 'أقصى رياح : ', 'Max wind: ')}<strong className="text-stone-800">{day.windSpeedMax} km/h</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Hourly Timeline (Next 12 hours) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  {tr(language, 'Évolution Horaire (Journée de Travail Agricole)', 'التطور بالساعة (يوم العمل الزراعي)', 'Hourly Evolution (Agricultural Workday)')}
                </h3>

                <div className="overflow-x-auto pb-1">
                  <div className="flex gap-2 min-w-max">
                    {weatherData.hourly.map((h, i) => (
                      <div
                        key={h.time + i}
                        className="px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[70px]"
                      >
                        <span className="text-[10px] font-semibold text-stone-500 block">{h.time}</span>
                        <span className="text-sm font-black text-stone-900 block my-0.5">{h.temperature}°C</span>
                        <span className="text-[9.5px] text-sky-700 block">💧 {h.relativeHumidity}%</span>
                        <span className="text-[9.5px] text-stone-600 block">💨 {h.windSpeed}k</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {tr(
                    language,
                    "Données météorologiques haute précision transmises en direct par l'API Open-Meteo pour les coordonnées GPS exactes des bassins agricoles marocains.",
                    "بيانات مناخية عالية الدقة مباشرة من منصة Open-Meteo وفق الإحداثيات الجغرافية الدقيقة للأحواض الزراعية المغربية.",
                    "High-precision weather data streamed live via the Open-Meteo API calibrated for Moroccan agricultural basins."
                  )}
                </span>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition"
              >
                {tr(language, 'Fermer', 'إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
