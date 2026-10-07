import React, { useEffect, useState } from 'react';
import {
  Cloud,
  Shield,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Droplets,
  Wind,
  Sun,
  Award,
  Zap,
} from 'lucide-react';
import { bourseClimatService, ClimateData, ClimateDataDaily } from '../services/bourseClimatService';
import { onssaService, ONSSANurseryVerification, ONSSAPhytosanitaryCertificate, ONSSAScheduledInspection } from '../services/onssaService';
import { cmiService } from '../services/cmiPaymentService';
import { dataSyncService, SyncLog } from '../services/dataSync';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';

interface Props {
  nurseryId?: string;
  region?: string;
  compact?: boolean;
}

export const RealTimeDataDashboard: React.FC<Props> = ({
  nurseryId = 'nurs-active-01',
  region,
  compact = false,
}) => {
  const { language, userProfile, nurseryLots, escrowTransactions } = useApp();

  const activeRegion = region || userProfile.region || 'Souss-Massa (Agadir, Taroudant, Chtouka)';

  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [onssaStatus, setONSSAStatus] = useState<ONSSANurseryVerification | null>(null);
  const [certificates, setCertificates] = useState<ONSSAPhytosanitaryCertificate[]>([]);
  const [inspections, setInspections] = useState<ONSSAScheduledInspection[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showExtendedDetails, setShowExtendedDetails] = useState<boolean>(false);

  const fetchRealTimeData = async (forceSync = false) => {
    setIsSyncing(true);
    try {
      if (forceSync) {
        await dataSyncService.syncAll({
          nurseryId,
          nurseryLots,
          orders: escrowTransactions,
        });
      }

      const [climate, onssa, certs, insps] = await Promise.all([
        bourseClimatService.getClimateData(activeRegion),
        onssaService.verifyNurseryCertification(nurseryId),
        onssaService.getPhytosanitaryCertificates(nurseryId),
        onssaService.getScheduledInspections(nurseryId),
      ]);

      setClimateData(climate);
      setONSSAStatus(onssa);
      setCertificates(certs);
      setInspections(insps);
      setLastSync(new Date().toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));

      if (forceSync) {
        setSyncFeedback(
          tr(
            language,
            'Données actualisées en direct avec CMI, Bourse Climat et ONSSA.',
            'تم تحديث البيانات مباشرة مع CMI ومصلحة الأرصاد وأونسا.',
            'Data live synced with CMI, Climate Exchange and ONSSA.'
          )
        );
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData(false);
    const interval = setInterval(() => {
      fetchRealTimeData(false);
    }, 5 * 60 * 1000); // Rafraîchissement automatique toutes les 5 minutes

    const unsubscribe = dataSyncService.subscribe((_log: SyncLog) => {
      setLastSync(new Date().toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }));
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [nurseryId, activeRegion]);

  return (
    <div className="space-y-4">
      {/* Barre de synchronisation temps réel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0b2416] via-[#123623] to-[#0b2416] border border-emerald-500/30 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Zap className={`w-5 h-5 ${isSyncing ? 'animate-bounce text-amber-300' : 'text-emerald-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                {tr(language, 'Flux Données Certifiées en Direct', 'بيانات معتمدة في الوقت الحقيقي', 'Certified Live Data Feeds')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-emerald-100/80">
              CMI Escrow Maroc • Bourse Climat Régionale • Registre National ONSSA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-stone-300 font-mono hidden sm:inline">
            {lastSync ? `Sync: ${lastSync}` : 'Synchronisation...'}
          </span>
          <button
            type="button"
            onClick={() => fetchRealTimeData(true)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-black text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Forcer la synchronisation avec les serveurs CMI, Bourse Climat et ONSSA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? tr(language, 'Sync...', 'جارٍ التحديث...', 'Syncing...') : tr(language, 'Actualiser', 'تحديث مباشر', 'Live Sync')}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Les 3 Blocs Principaux (Climat, ONSSA, CMI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* BLOC 1 : BOURSE CLIMAT */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-blue-200/80 hover:shadow-md transition flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900">
                    {tr(language, 'Bourse Climat Maroc', 'بورصة المناخ الفلاحي', 'Climate Exchange')}
                  </h3>
                  <span className="text-[10px] text-blue-700 font-semibold block">{activeRegion.split('(')[0]}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                ET₀ {climateData ? `${climateData.et0} mm/j` : '4.2 mm/j'}
              </span>
            </div>

            {climateData ? (
              <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <div className="p-1">
                  <span className="text-[10px] text-stone-500 block">Température</span>
                  <span className="text-sm font-black text-stone-900">{climateData.temperature}°C</span>
                </div>
                <div className="p-1 border-x border-blue-200/60">
                  <span className="text-[10px] text-stone-500 block">Humidité</span>
                  <span className="text-sm font-black text-stone-900">{climateData.humidity}%</span>
                </div>
                <div className="p-1">
                  <span className="text-[10px] text-stone-500 block">Pluie</span>
                  <span className="text-sm font-black text-stone-900">{climateData.rainfall} mm</span>
                </div>
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center text-xs text-stone-400">
                {tr(language, 'Chargement météo...', 'جاري التحميل...', 'Loading climate data...')}
              </div>
            )}

            {climateData?.alerts && climateData.alerts.length > 0 && (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-medium line-clamp-2">{climateData.alerts[0].title}</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
            <span>Irrigation: <strong className="text-stone-800">{climateData?.irrigationIndex || 'Modéré'}</strong></span>
            <span className="text-blue-700 font-semibold">{climateData?.weatherCondition || 'Ensoleillé'}</span>
          </div>
        </div>

        {/* BLOC 2 : CERTIFICATION ONSSA */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-200/80 hover:shadow-md transition flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900">
                    {tr(language, 'Agrément & Passeports ONSSA', 'اعتماد ومراقبة أونسا', 'ONSSA Certification')}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Direction Protection Végétaux</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                onssaStatus?.certificationStatus === 'certified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {onssaStatus?.certificationStatus === 'certified' ? '✓ Homologué' : 'En attente'}
              </span>
            </div>

            {onssaStatus ? (
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[10px]">Agrément Officiel :</span>
                  <span className="font-mono font-bold text-stone-900 text-[11px]">{onssaStatus.registrationNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[10px]">Note Sanitaire :</span>
                  <span className="font-bold text-emerald-800">Grade {onssaStatus.sanitaryGrade} (Exemplaire)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-[10px]">Passeports Actifs :</span>
                  <span className="font-bold text-stone-800">{certificates.length} lots certifiés</span>
                </div>
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center text-xs text-stone-400">
                {tr(language, 'Vérification du registre...', 'جاري التحقق...', 'Checking registry...')}
              </div>
            )}
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
            <span>Audit: <strong className="text-stone-800">{onssaStatus?.lastInspectionDate || '2026-08-20'}</strong></span>
            <span className="text-emerald-700 font-semibold">Prochaine: {onssaStatus?.nextInspectionDate || '2026-11-15'}</span>
          </div>
        </div>

        {/* BLOC 3 : CMI ESCROW MAROC */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-amber-200/80 hover:shadow-md transition flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900">
                    {tr(language, 'Séquestre Bancaire CMI', 'الضمان البنكي CMI', 'CMI Bank Escrow')}
                  </h3>
                  <span className="text-[10px] text-amber-700 font-semibold block">Crédit Mutuel International</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                Passerelle Active
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-[10px]">Protection Acheteur/Vendeur :</span>
                <span className="font-bold text-emerald-700">100% Garanti</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-[10px]">Commandes sous Séquestre :</span>
                <span className="font-mono font-bold text-stone-900">{escrowTransactions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-[10px]">Fonds Cantonnés :</span>
                <span className="font-mono font-black text-amber-900">
                  {(escrowTransactions?.reduce((acc, t) => acc + (t.totalPaidByBuyerMAD || 0), 0) || 0).toLocaleString()} MAD
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
            <span>Environnement: <strong className="text-stone-800">Sandbox Sécurisé</strong></span>
            <span className="text-amber-800 font-semibold">Devise: MAD</span>
          </div>
        </div>
      </div>

      {/* Section Détails Avancés (Dépliable) */}
      {!compact && (
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setShowExtendedDetails(!showExtendedDetails)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-stone-800 hover:text-emerald-800 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>
                {tr(
                  language,
                  'Consulter les prévisions météo 7 jours, recommandations agronomiques et registre des passeports ONSSA',
                  'عرض التوقعات الجوية لـ 7 أيام، الإرشادات الفلاحية وسجل جوازات أونسا',
                  'View 7-day agro forecasts, agronomic recommendations, and ONSSA passports register'
                )}
              </span>
            </div>
            {showExtendedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExtendedDetails && (
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-5 animate-in fade-in">
              {/* Prévisions météo 7 jours */}
              {climateData?.forecast && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Prévisions Agro-Météorologiques (7 prochains jours)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {climateData.forecast.map((day) => (
                      <div key={day.date} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1">
                        <span className="text-[10px] font-bold text-stone-600 block">{day.date.slice(5)}</span>
                        <div className="text-xs font-black text-stone-900">
                          {day.tempMax}° / <span className="text-stone-500 text-[11px] font-normal">{day.tempMin}°</span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-semibold block">ET₀ {day.et0Evapotranspiration} mm</span>
                        <p className="text-[9px] text-stone-500 line-clamp-2 leading-tight">{day.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passeports phytosanitaires ONSSA */}
              {certificates.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passeports Phytosanitaires Officiels Actifs</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {certificates.map((cert) => (
                      <div key={cert.certificateNumber} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-emerald-950 text-xs">{cert.certificateNumber}</span>
                          <p className="text-stone-700 font-medium">{cert.plantSpecies} ({cert.variety || 'Standard'})</p>
                          <p className="text-[11px] text-stone-500">{(cert.quantity ?? 0).toLocaleString()} {cert.unit} • {cert.healthAssessment}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px]">
                          VALIDE
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspections programmées */}
              {inspections.length > 0 && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Prochaine inspection officielle ONSSA programmée le <strong>{inspections[0].scheduledDate}</strong></span>
                  </div>
                  <span className="text-[11px] text-stone-500">Auditeur: {inspections[0].inspectorName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
