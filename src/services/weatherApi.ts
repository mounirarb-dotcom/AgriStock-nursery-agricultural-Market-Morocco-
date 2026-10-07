import { MoroccanRegion } from '../types';
import { sanitizeNumber, globalClientRateLimiter } from '../utils/securityUtils';

export interface WeatherCoordinates {
  lat: number;
  lon: number;
  hubName: string;
  cropsSpecialty: string;
}

export const REGION_COORDINATES: Record<MoroccanRegion, WeatherCoordinates> = {
  'Souss-Massa (Agadir, Taroudant, Chtouka)': {
    lat: 30.4278,
    lon: -9.5981,
    hubName: 'Agadir / Chtouka Aït Baha',
    cropsSpecialty: 'Tomates primeurs sous serres, Agrumes, Arganier & Pépinières',
  },
  'L\'Oriental (Berkane, Oujda, Nador)': {
    lat: 34.9200,
    lon: -2.3200,
    hubName: 'Berkane / Plaine de la Moulouya',
    cropsSpecialty: 'Clémentine de Berkane, Agrumes & Vergers d\'Oliviers',
  },
  'Gharb - Chrarda (Kénitra, Sidi Slimane)': {
    lat: 34.2610,
    lon: -6.5800,
    hubName: 'Kénitra / Sidi Slimane',
    cropsSpecialty: 'Céréales, Agrumes, Maraîchage intensif & Petits fruits',
  },
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)': {
    lat: 33.8900,
    lon: -5.5400,
    hubName: 'Meknès / Plateau de Saïss',
    cropsSpecialty: 'Rosacées fruitières (Pommiers, Pêchers), Vignes & Maraîchage',
  },
  'Marrakech - Safi (Haouz, El Kelaâ)': {
    lat: 31.6295,
    lon: -7.9811,
    hubName: 'Marrakech / Plaine du Haouz',
    cropsSpecialty: 'Oliviers, Abricotiers, Agrumes & Melons',
  },
  'Béni Mellal - Khénifra (Tadla)': {
    lat: 32.3394,
    lon: -6.3608,
    hubName: 'Béni Mellal / Périmètre du Tadla',
    cropsSpecialty: 'Agrumes du Tadla, Oliviers, Betterave & Grenadiers',
  },
  'Drâa - Tafilalet (Zagora, Errachidia)': {
    lat: 30.3300,
    lon: -5.8300,
    hubName: 'Zagora / Oasis du Tafilalet',
    cropsSpecialty: 'Palmiers dattiers (Majhoul), Pastèques & Cultures d\'oasis',
  },
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)': {
    lat: 35.1900,
    lon: -6.1500,
    hubName: 'Larache / Périmètre du Loukkos',
    cropsSpecialty: 'Fraisiers, Myrtilles, Avocatiers & Maraîchage côtier',
  },
  'Casablanca - Settat & Doukkala': {
    lat: 33.5731,
    lon: -7.5898,
    hubName: 'Doukkala / Chaouia',
    cropsSpecialty: 'Maraîchage de plein champ, Pomme de terre & Céréales',
  },
};

export interface DailyAgriForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  et0Evapotranspiration: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
}

export interface HourlyAgriForecast {
  time: string;
  temperature: number;
  relativeHumidity: number;
  windSpeed: number;
  precipitationProbability: number;
}

export interface AgriWeatherReport {
  region: MoroccanRegion;
  hubName: string;
  cropsSpecialty: string;
  timestamp: string;
  // Current values
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  weatherCode: number;
  weatherDescriptionFr: string;
  weatherDescriptionAr: string;
  weatherDescriptionEn?: string;
  weatherIcon: string;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  // Agronomic parameters
  todayEt0: number; // Evapotranspiration in mm/day
  soilTemperature?: number;
  // Agronomic alerts & diagnostics
  alerts: {
    frostAlert: {
      active: boolean;
      severity: 'safe' | 'warning' | 'danger';
      messageFr: string;
      messageAr: string;
      messageEn?: string;
    };
    cherguiAlert: {
      active: boolean;
      severity: 'safe' | 'warning' | 'danger';
      messageFr: string;
      messageAr: string;
      messageEn?: string;
    };
    sprayingWindow: {
      status: 'favorable' | 'vigilance' | 'defavorable';
      labelFr: string;
      labelEn?: string;
      adviceFr: string;
      adviceEn?: string;
    };
    fungalDiseaseRisk: {
      level: 'bas' | 'moyen' | 'eleve';
      adviceFr: string;
      adviceEn?: string;
    };
    irrigationGuidance: {
      waterDemandCategory: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé';
      recommendedMm: number;
      adviceFr: string;
      adviceEn?: string;
    };
  };
  daily: DailyAgriForecast[];
  hourly: HourlyAgriForecast[];
}

// Convert Open-Meteo WMO weather codes to descriptions & icons
export function interpretWeatherCode(code: number): {
  fr: string;
  ar: string;
  en: string;
  icon: string;
} {
  switch (code) {
    case 0:
      return { fr: 'Ensoleillé / Ciel dégagé', ar: 'مشمس / سماء صافية', en: 'Sunny / Clear sky', icon: '☀️' };
    case 1:
    case 2:
      return { fr: 'Peu nuageux / Ensoleillé', ar: 'قليل الغيوم / مشمس', en: 'Partly cloudy / Sunny', icon: '🌤️' };
    case 3:
      return { fr: 'Nuageux', ar: 'غائم', en: 'Cloudy', icon: '☁️' };
    case 45:
    case 48:
      return { fr: 'Brume matinale / Brouillard', ar: 'ضباب صباحي', en: 'Morning mist / Fog', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { fr: 'Bruine légère', ar: 'رذاذ خفيف', en: 'Light drizzle', icon: '🌦️' };
    case 61:
    case 63:
      return { fr: 'Pluie modérée', ar: 'أمطار معتدلة', en: 'Moderate rain', icon: '🌧️' };
    case 65:
      return { fr: 'Pluie forte', ar: 'أمطار غزيرة', en: 'Heavy rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { fr: 'Chutes de neige (Reliefs)', ar: 'تساقط ثلوج', en: 'Snowfall (Highlands)', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { fr: 'Averses orageuses', ar: 'زخات رعدية', en: 'Thundershowers', icon: '🌦️' };
    case 95:
    case 96:
    case 99:
      return { fr: 'Orage & Risque de grêle', ar: 'عواصف رعدية مع خطر البرد', en: 'Thunderstorm & Hail risk', icon: '⛈️' };
    default:
      return { fr: 'Temps variable', ar: 'طقس متغير', en: 'Variable weather', icon: '⛅' };
  }
}

export async function fetchAgriWeather(region: MoroccanRegion): Promise<AgriWeatherReport> {
  const coords = REGION_COORDINATES[region] || REGION_COORDINATES['Souss-Massa (Agadir, Taroudant, Chtouka)'];
  const safeLat = sanitizeNumber(coords.lat, { min: -90, max: 90, defaultValue: 30.4278 });
  const safeLon = sanitizeNumber(coords.lon, { min: -180, max: 180, defaultValue: -9.5981 });
  const cacheKey = `agri_weather_${safeLat}_${safeLon}`;

  // OWASP Rate Limiting guard on weather API requests
  const rate = globalClientRateLimiter.check('weather:fetch', 30, 60000);
  if (!rate.allowed) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fallback to fresh fetch if cache corrupt
      }
    }
  }

  try {
    // Attempt backend proxy first for rate limiting & secure proxying, fallback to direct Open-Meteo
    let response: Response;
    try {
      response = await fetch(`/api/weather?lat=${safeLat}&lon=${safeLon}`);
      if (!response.ok) throw new Error('Proxy failed');
    } catch {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${safeLat}&longitude=${safeLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,soil_temperature_0cm&daily=weather_code,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,precipitation_sum,uv_index_max,wind_speed_10m_max&timezone=auto`;
      response = await fetch(url);
    }

    if (!response.ok) {
      throw new Error(`Erreur API Météo: ${response.status}`);
    }

    const data = await response.json();

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const weatherInfo = interpretWeatherCode(current.weather_code ?? 0);

    const temp = current.temperature_2m ?? 24;
    const humidity = current.relative_humidity_2m ?? 50;
    const windSpeed = current.wind_speed_10m ?? 12;
    const windGusts = current.wind_gusts_10m ?? 15;
    const et0Today = (daily.et0_fao_evapotranspiration && daily.et0_fao_evapotranspiration[0]) ?? 4.2;
    const minTempToday = (daily.temperature_2m_min && daily.temperature_2m_min[0]) ?? 12;
    const rainToday = (daily.precipitation_sum && daily.precipitation_sum[0]) ?? 0;

    // 1. Détection Gelée Blanche pour pépinières et jeunes plants
    const frostAlert = {
      active: minTempToday <= 4,
      severity: (minTempToday <= 1 ? 'danger' : minTempToday <= 4 ? 'warning' : 'safe') as 'safe' | 'warning' | 'danger',
      messageFr: minTempToday <= 1
        ? `Alerte Gel Nocturne (${minTempToday}°C) : Risque critique pour jeunes plants et floraison vergers. Fermer les serres et activer brumisateurs antigel.`
        : minTempToday <= 4
        ? `Vigilance Température Basse (${minTempToday}°C) : Surveiller les pépinières sous abri non chauffé.`
        : `Température nocturne normale (${minTempToday}°C). Pas de risque de gelée.`,
      messageAr: minTempToday <= 4
        ? `تحذير من الصقيع (${minTempToday}°م) : يرجى حماية شتلات المشاتل وإغلاق البيوت المغطاة.`
        : `درجات حرارة ليلية آمنة (${minTempToday}°م).`,
    };

    // 2. Détection Alerte Chergui / Canicule agricole
    const isChergui = (temp >= 33 && humidity < 28) || (temp >= 36);
    const cherguiAlert = {
      active: isChergui,
      severity: (temp >= 38 || (temp >= 34 && windSpeed >= 25) ? 'danger' : isChergui ? 'warning' : 'safe') as 'safe' | 'warning' | 'danger',
      messageFr: temp >= 38 || (temp >= 34 && windSpeed >= 25)
        ? `Alerte Chergui Sévère (${temp}°C, humidité ${humidity}%, vent sec) : Stress hydrique aigu. Déployer toiles d'ombrage et irriguer dès le matin tôt.`
        : isChergui
        ? `Temps chaud et sec (${temp}°C) : Augmenter les apports d'eau pour compenser la transpiration des plants.`
        : `Conditions thermiques régulières (${temp}°C, HR: ${humidity}%).`,
      messageAr: isChergui
        ? `تحذير من رياح الشركي والحرارة المرتفعة (${temp}°م). يجب تعزيز الري والتظليل في المشاتل.`
        : `أجواء مناخية طبيعية.`,
    };

    // 3. Fenêtre de pulvérisation & Traitements phytosanitaires
    let sprayingStatus: 'favorable' | 'vigilance' | 'defavorable' = 'favorable';
    let sprayingAdvice = 'Conditions idéales : vent faible (< 15 km/h) et absence de pluie imminente. Bonne adhérence foliaire.';

    if (windSpeed > 18 || windGusts > 25) {
      sprayingStatus = 'defavorable';
      sprayingAdvice = `Vent trop fort (${windSpeed} km/h, rafales ${windGusts} km/h) : Risque important de dérive des produits et perte d'efficacité. Reporter les traitements.`;
    } else if (rainToday > 2 || (hourly.precipitation_probability && hourly.precipitation_probability[0] > 40)) {
      sprayingStatus = 'defavorable';
      sprayingAdvice = 'Risque de pluie : Le traitement risque d\'être lessivé avant absorption systémique.';
    } else if (temp > 29) {
      sprayingStatus = 'vigilance';
      sprayingAdvice = 'Température élevée : Traiter tôt le matin ou au coucher du soleil pour éviter l\'évaporation rapide et les brûlures foliaires.';
    }

    // 4. Risque Maladie Cryptogamique (Mildiou, Botrytis, Oïdium)
    let fungalLevel: 'bas' | 'moyen' | 'eleve' = 'bas';
    let fungalAdvice = 'Atmosphère équilibrée : pression fongique faible.';
    if (humidity > 78 && temp >= 16 && temp <= 26) {
      fungalLevel = 'eleve';
      fungalAdvice = 'Humidité très élevée combinée à une température douce : Conditions propices au développement du Mildiou et du Botrytis. Aérer les serres et surveiller les foyers.';
    } else if (humidity > 65 || rainToday > 1) {
      fungalLevel = 'moyen';
      fungalAdvice = 'Humidité modérée : Maintenir une bonne ventilation des serres et surveiller les faces inférieures des feuilles.';
    }

    // 5. Conseil d'irrigation basé sur l'ET0 FAO-56
    let waterDemandCategory: 'Faible' | 'Modéré' | 'Élevé' | 'Très Élevé' = 'Modéré';
    if (et0Today < 2.5) waterDemandCategory = 'Faible';
    else if (et0Today <= 4.5) waterDemandCategory = 'Modéré';
    else if (et0Today <= 6.0) waterDemandCategory = 'Élevé';
    else waterDemandCategory = 'Très Élevé';

    const irrigationAdvice = `Évapotranspiration journalière estimée à ${et0Today.toFixed(1)} mm. Prévoir une dose d'arrosage de compensation proportionnelle au coefficient cultural (Kc).`;

    // Process daily list
    const dailyForecasts: DailyAgriForecast[] = (daily.time || []).slice(0, 5).map((d: string, idx: number) => ({
      date: d,
      weatherCode: daily.weather_code[idx] ?? 0,
      tempMax: Math.round(daily.temperature_2m_max[idx] ?? 25),
      tempMin: Math.round(daily.temperature_2m_min[idx] ?? 14),
      et0Evapotranspiration: Number((daily.et0_fao_evapotranspiration?.[idx] ?? 4.0).toFixed(1)),
      precipitationSum: Number((daily.precipitation_sum?.[idx] ?? 0).toFixed(1)),
      uvIndexMax: Math.round(daily.uv_index_max?.[idx] ?? 6),
      windSpeedMax: Math.round(daily.wind_speed_10m_max?.[idx] ?? 15),
    }));

    // Process hourly list for next 12 hours
    const currentHourIndex = new Date().getHours();
    const hourlyForecasts: HourlyAgriForecast[] = (hourly.time || [])
      .slice(currentHourIndex, currentHourIndex + 12)
      .map((t: string, idx: number) => {
        const actualIdx = currentHourIndex + idx;
        const timePart = t.split('T')[1] || t;
        return {
          time: timePart.substring(0, 5),
          temperature: Math.round(hourly.temperature_2m[actualIdx] ?? 20),
          relativeHumidity: Math.round(hourly.relative_humidity_2m[actualIdx] ?? 50),
          windSpeed: Math.round(hourly.wind_speed_10m[actualIdx] ?? 10),
          precipitationProbability: Math.round(hourly.precipitation_probability?.[actualIdx] ?? 0),
        };
      });

    const report: AgriWeatherReport = {
      region,
      hubName: coords.hubName,
      cropsSpecialty: coords.cropsSpecialty,
      timestamp: new Date().toISOString(),
      temperature: Math.round(temp),
      apparentTemperature: Math.round(current.apparent_temperature ?? temp),
      relativeHumidity: Math.round(humidity),
      weatherCode: current.weather_code ?? 0,
      weatherDescriptionFr: weatherInfo.fr,
      weatherDescriptionAr: weatherInfo.ar,
      weatherDescriptionEn: weatherInfo.en,
      weatherIcon: weatherInfo.icon,
      windSpeed: Math.round(windSpeed),
      windDirection: Math.round(current.wind_direction_10m ?? 0),
      windGusts: Math.round(windGusts),
      precipitation: Number((current.precipitation ?? 0).toFixed(1)),
      todayEt0: Number(et0Today.toFixed(1)),
      soilTemperature: hourly.soil_temperature_0cm ? Math.round(hourly.soil_temperature_0cm[currentHourIndex] ?? 20) : undefined,
      alerts: {
        frostAlert,
        cherguiAlert,
        sprayingWindow: {
          status: sprayingStatus,
          labelFr: sprayingStatus === 'favorable' ? 'Fenêtre Favorable' : sprayingStatus === 'vigilance' ? 'Vigilance Chaleur/Vent' : 'Traitement Déconseillé',
          adviceFr: sprayingAdvice,
        },
        fungalDiseaseRisk: {
          level: fungalLevel,
          adviceFr: fungalAdvice,
        },
        irrigationGuidance: {
          waterDemandCategory,
          recommendedMm: Number(et0Today.toFixed(1)),
          adviceFr: irrigationAdvice,
        },
      },
      daily: dailyForecasts,
      hourly: hourlyForecasts,
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(report));
    } catch {}

    return report;
  } catch (err) {
    console.warn('Weather API fetch failed, trying local cache', err);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    // Fallback report tailored to the region
    return createFallbackReport(region, coords);
  }
}

function createFallbackReport(region: MoroccanRegion, coords: WeatherCoordinates): AgriWeatherReport {
  return {
    region,
    hubName: coords.hubName,
    cropsSpecialty: coords.cropsSpecialty,
    timestamp: new Date().toISOString(),
    temperature: 24,
    apparentTemperature: 25,
    relativeHumidity: 58,
    weatherCode: 1,
    weatherDescriptionFr: 'Ensoleillé avec passages nuageux',
    weatherDescriptionAr: 'مشمس مع سحب عابرة',
    weatherIcon: '🌤️',
    windSpeed: 14,
    windDirection: 270,
    windGusts: 18,
    precipitation: 0,
    todayEt0: 4.5,
    alerts: {
      frostAlert: {
        active: false,
        severity: 'safe',
        messageFr: 'Température nocturne normale. Pas de risque de gelée.',
        messageAr: 'درجات حرارة ليلية آمنة.',
      },
      cherguiAlert: {
        active: false,
        severity: 'safe',
        messageFr: 'Conditions thermiques normales pour la saison.',
        messageAr: 'أجواء مناخية معتدلة.',
      },
      sprayingWindow: {
        status: 'favorable',
        labelFr: 'Fenêtre Favorable',
        adviceFr: 'Vent modéré et bonne visibilité. Traitements recommandés tôt le matin.',
      },
      fungalDiseaseRisk: {
        level: 'bas',
        adviceFr: 'Pression fongique faible à modérée.',
      },
      irrigationGuidance: {
        waterDemandCategory: 'Modéré',
        recommendedMm: 4.5,
        adviceFr: 'Évapotranspiration moyenne : 4.5 mm. Apport d\'eau régulier par goutte-à-goutte.',
      },
    },
    daily: [
      { date: 'Aujourd\'hui', weatherCode: 1, tempMax: 26, tempMin: 15, et0Evapotranspiration: 4.5, precipitationSum: 0, uvIndexMax: 7, windSpeedMax: 16 },
      { date: 'Demain', weatherCode: 0, tempMax: 27, tempMin: 16, et0Evapotranspiration: 4.8, precipitationSum: 0, uvIndexMax: 8, windSpeedMax: 14 },
      { date: 'J+2', weatherCode: 2, tempMax: 25, tempMin: 14, et0Evapotranspiration: 4.2, precipitationSum: 0, uvIndexMax: 7, windSpeedMax: 15 },
    ],
    hourly: [
      { time: '08:00', temperature: 18, relativeHumidity: 70, windSpeed: 8, precipitationProbability: 0 },
      { time: '12:00', temperature: 25, relativeHumidity: 50, windSpeed: 14, precipitationProbability: 0 },
      { time: '16:00', temperature: 24, relativeHumidity: 55, windSpeed: 16, precipitationProbability: 0 },
      { time: '20:00', temperature: 20, relativeHumidity: 65, windSpeed: 10, precipitationProbability: 0 },
    ],
  };
}
