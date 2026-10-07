import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, tr } from '../utils/translations';
import { AppLanguage } from '../types';
import { playAudioFeedback, speakSearchResult } from '../utils/audioUtils';
import {
  Search,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Sprout,
  Trees,
  Flower2,
  Package,
  Store,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export type SearchMode = 'ALL' | 'CROP' | 'PLANT_TYPE';

interface HomeSearchBarProps {
  language: AppLanguage;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  resultCount: number;
  totalLotsCount: number;
  matchingProduceCount?: number;
  onNavigateToMarket?: () => void;
}

// Curated crop suggestions
const POPULAR_CROPS = [
  { label: 'Tomate', icon: '🍅', alt: ['tomates', 'tomate industrielle', 'roma', 'heinz'] },
  { label: 'Olivier', icon: '🫒', alt: ['oliviers', 'picholine', 'menara', 'haouzia'] },
  { label: 'Clémentinier / Agrumes', icon: '🍊', alt: ['clementine', 'agrumes', 'nadorcott', 'afourer', 'oranger'] },
  { label: 'Pastèque', icon: '🍉', alt: ['pasteque', 'melon', 'greffée'] },
  { label: 'Avocatier', icon: '🥑', alt: ['avocat', 'hass', 'fuerte'] },
  { label: 'Palmier Dattier', icon: '🌴', alt: ['palmier', 'dattier', 'medjool', 'boufeggous'] },
  { label: 'Poivron', icon: '🌶️', alt: ['poivrons', 'piment', 'cannelle'] },
  { label: 'Fraisier / Petits fruits', icon: '🍓', alt: ['fraise', 'fraisier', 'myrtille', 'framboise'] },
];

// Curated plant types
const POPULAR_PLANT_TYPES = [
  { label: 'Arbres Fruitiers', icon: '🌳', alt: ['fruitier', 'arbres fruitiers', 'verger'] },
  { label: 'Plantes Ornementales', icon: '🪴', alt: ['ornement', 'espaces verts', 'jardin', 'decoratif'] },
  { label: 'Palmiers & Cycas', icon: '🌴', alt: ['palmier', 'cycas', 'washingtonia', 'phoenix'] },
  { label: 'Jeunes Plants Maraîchers', icon: '🌱', alt: ['maraicher', 'legume', 'legumes', 'plants'] },
  { label: 'Arbustes & Haies', icon: '🌺', alt: ['arbuste', 'haie', 'laurier', 'brise-vue'] },
  { label: 'Gazon en rouleaux', icon: '🌿', alt: ['gazon', 'pelouse', 'paspalum', 'kikuyu'] },
  { label: 'Cactées & Agaves', icon: '🌵', alt: ['cactee', 'cactus', 'succulente', 'agave', 'aloe'] },
  { label: 'Porte-greffes', icon: '🎋', alt: ['porte-greffe', 'ecusson', 'bigaradier', 'carrizo'] },
];

// Speech Recognition Type Shim
interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  language,
  searchTerm,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  resultCount,
  totalLotsCount,
  matchingProduceCount = 0,
  onNavigateToMarket,
}) => {
  const t = useTranslation(language);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    const win = window as unknown as IWindowSpeechRecognition;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  // Handle Speech Recognition with explicit microphone permission request
  const toggleVoiceSearch = async () => {
    setVoiceError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      playAudioFeedback('clear');
      return;
    }

    // 1. Explicitly request microphone access via getUserMedia to prompt the user
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream tracks immediately so speech recognition can bind cleanly
        stream.getTracks().forEach((track) => track.stop());
      } catch (mediaErr: any) {
        console.warn('Microphone permission request rejected:', mediaErr);
        if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
          setVoiceError(
            language === 'ar'
              ? 'تم رفض إذن الميكروفون. يرجى تفعيل إذن الميكروفون في إعدادات المتصفح.'
              : language === 'en'
              ? 'Microphone access denied. Please allow microphone permissions in your browser.'
              : 'Accès au microphone refusé. Veuillez autoriser le micro dans votre navigateur (icône cadenas).'
          );
          return;
        }
      }
    }

    const win = window as unknown as IWindowSpeechRecognition;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechSupported(false);
      setVoiceError(t.voiceNotSupported);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;

      // Configure speech parameters
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        playAudioFeedback('start');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        setInterimTranscript(transcript);

        if (event.results[0].isFinal) {
          // Clean recognized string
          const finalClean = transcript.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          onSearchChange(finalClean);
          setIsListening(false);
          setInterimTranscript('');
          playAudioFeedback('success');
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setInterimTranscript('');
        if (err.error === 'not-allowed') {
          setVoiceError(
            language === 'ar'
              ? 'تم حظر الميكروفون. انقر على أيقونة القفل أو الميكروفون في شريط العنوان للسماح به.'
              : language === 'en'
              ? 'Microphone blocked. Click the lock/micro icon in your browser address bar to allow access.'
              : 'Accès au microphone bloqué. Cliquez sur l\'icône cadenas ou micro dans la barre d\'adresse pour autoriser.'
          );
        } else if (err.error === 'no-speech') {
          setVoiceError(
            language === 'ar'
              ? 'لم يتم التقاط أي صوت. يرجى التحدث بوضوح بالقرب من الميكروفون.'
              : language === 'en'
              ? 'No speech detected. Please speak closer to your microphone.'
              : 'Aucune parole détectée. Veuillez parler plus près du micro et réessayer.'
          );
        } else {
          setVoiceError(`Erreur audio (${err.error}). Essayez les suggestions rapides.`);
        }
        playAudioFeedback('clear');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch (e: any) {
      console.error('Speech initialization error:', e);
      setIsListening(false);
      setVoiceError('Impossible de démarrer la reconnaissance vocale.');
    }
  };

  // Text-To-Speech read aloud
  const handleReadAloud = () => {
    playAudioFeedback('click');
    setIsSpeaking(true);

    let phrase = '';
    const query = searchTerm.trim();

    if (language === 'ar') {
      if (!query) {
        phrase = `يتوفر ${resultCount} حصة بمخزون المشتل`;
      } else {
        phrase = `تم العثور على ${resultCount} حصص متوفرة لـ ${query}`;
      }
    } else if (language === 'en') {
      if (!query) {
        phrase = `There are ${resultCount} nursery lots available`;
      } else {
        phrase = `${resultCount} lots found for ${query}`;
      }
    } else {
      if (!query) {
        phrase = `Actuellement ${resultCount} lots disponibles dans le stock de la pépinière`;
      } else {
        phrase = `${resultCount} ${resultCount > 1 ? 'lots trouvés' : 'lot trouvé'} pour la recherche : ${query}`;
      }
    }

    speakSearchResult(phrase, language);

    setTimeout(() => {
      setIsSpeaking(false);
    }, 2800);
  };

  const handleClear = () => {
    onSearchChange('');
    playAudioFeedback('clear');
  };

  // Apply a quick suggestion
  const handleTagClick = (tagLabel: string, mode: SearchMode) => {
    playAudioFeedback('click');
    onSearchModeChange(mode);
    if ((searchTerm || '').toLowerCase() === (tagLabel || '').toLowerCase()) {
      onSearchChange('');
    } else {
      onSearchChange(tagLabel);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-4 sm:p-5 space-y-3.5 transition-all">
      {/* Top Header Row with Mode Switcher & Audio Tools */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <span>{tr(language, 'Recherche par Culture ou Type de Plante', 'البحث حسب المحصول أو صنف النبتة', 'Search by Crop or Plant Type')}</span>
              <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {tr(language, 'Audio & Vocal', 'صوتي وفوري', 'Audio & Voice')}
              </span>
            </h2>
            <p className="text-[11px] text-stone-500">
              {tr(
                language,
                "Trouvez rapidement des plants selon la culture ciblée ou l'architecture végétale.",
                'اعثر بسرعة على الشتلات والأشجار حسب المحصول المستهدف أو الصنف الزراعي.',
                'Quickly find plants and seedlings by target crop or plant architecture.'
              )}
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            id="btn-search-mode-all"
            type="button"
            onClick={() => {
              playAudioFeedback('click');
              onSearchModeChange('ALL');
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              searchMode === 'ALL'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t.searchAllOption}
          </button>

          <button
            id="btn-search-mode-crop"
            type="button"
            onClick={() => {
              playAudioFeedback('click');
              onSearchModeChange('CROP');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              searchMode === 'CROP'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-amber-700'
            }`}
          >
            <span>🌾</span>
            <span>{t.searchByCropOption}</span>
          </button>

          <button
            id="btn-search-mode-plant-type"
            type="button"
            onClick={() => {
              playAudioFeedback('click');
              onSearchModeChange('PLANT_TYPE');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              searchMode === 'PLANT_TYPE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-emerald-700'
            }`}
          >
            <span>🌿</span>
            <span>{t.searchByPlantTypeOption}</span>
          </button>
        </div>
      </div>

      {/* Main Search Input with Audio Mic and Text-To-Speech Buttons */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            {searchMode === 'CROP' ? (
              <span className="text-sm">🌾</span>
            ) : searchMode === 'PLANT_TYPE' ? (
              <span className="text-sm">🌿</span>
            ) : (
              <Search className="w-4 h-4 text-stone-400" />
            )}
          </div>

          <input
            id="home-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              searchMode === 'CROP'
                ? tr(language, 'Rechercher par culture : Tomate, Olivier, Clémentine, Pastèque, Avocatier...', 'البحث بالمحصول: طماطم، زيتون، حوامض، دلاح، أفوكادو...', 'Search by crop: Tomato, Olive, Citrus, Watermelon, Avocado...')
                : searchMode === 'PLANT_TYPE'
                ? tr(language, 'Rechercher par type de plante : Palmier, Arbuste, Haie, Arbre fruitier, Gazon...', 'البحث بنوع النبات: نخيل، شجيرات، مصدات، أشجار مثمرة، عشب...', 'Search by plant type: Palms, Shrubs, Hedges, Fruit trees, Lawn turf...')
                : t.searchHomeBarPlaceholder
            }
            className={`w-full pl-10 pr-24 py-3 rounded-xl border text-xs sm:text-sm font-medium transition placeholder-stone-400 focus:outline-none focus:ring-2 ${
              isListening
                ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-50/40 text-stone-900'
                : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-500/20 bg-stone-50/50 focus:bg-white text-stone-900'
            }`}
          />

          {/* Right input actions: Clear (X) + Count Badge */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchTerm && (
              <button
                id="btn-clear-search"
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition"
                title={tr(language, 'Effacer la recherche', 'مسح البحث', 'Clear search')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {searchTerm && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                {resultCount} {resultCount > 1 ? tr(language, 'lots', 'حصص', 'lots') : tr(language, 'lot', 'حصة', 'lot')}
              </span>
            )}
          </div>
        </div>

        {/* Voice Search (Microphone) Button */}
        <button
          id="btn-voice-search"
          type="button"
          onClick={toggleVoiceSearch}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm border ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 animate-pulse ring-4 ring-rose-200'
              : 'bg-stone-900 hover:bg-emerald-700 text-white border-stone-800'
          }`}
          title={isListening ? t.voiceStop : t.voiceSearchTooltip}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">{tr(language, 'Arrêter', 'إيقاف', 'Stop')}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{tr(language, 'Vocal', 'صوتي', 'Voice')}</span>
            </>
          )}
        </button>

        {/* Read Out Loud (Audio Speaker) Button */}
        <button
          id="btn-read-aloud"
          type="button"
          onClick={handleReadAloud}
          className={`p-3 rounded-xl font-bold text-xs transition-all active:scale-95 border ${
            isSpeaking
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
          }`}
          title={t.readOutLoud}
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-emerald-700 animate-bounce' : 'text-stone-600'}`} />
        </button>
      </div>

      {/* Voice Listening Active Waveform Bar */}
      {isListening && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between gap-3 text-rose-950 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <div className="text-xs">
              <span className="font-bold block">{tr(language, 'Microphone actif • Parlez maintenant', 'الميكروفون نشط • تحدث الآن', 'Microphone active • Speak now')}</span>
              <span className="text-[11px] text-rose-700">
                {interimTranscript ? `"${interimTranscript}"` : tr(language, 'Dites le nom d\'une culture (ex: "Tomate", "Olivier") ou d\'un type (ex: "Palmier", "Arbuste")', 'انطق اسم محصول (مثل: "طماطم"، "زيتون") أو صنف (مثل: "نخيل")', 'Say a crop (e.g. "Tomato", "Olive") or type (e.g. "Palm", "Shrub")')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="inline-block w-1 h-4 bg-rose-500 rounded-full animate-pulse"></span>
            <span className="inline-block w-1 h-6 bg-rose-600 rounded-full animate-pulse delay-75"></span>
            <span className="inline-block w-1 h-3 bg-rose-400 rounded-full animate-pulse delay-150"></span>
            <span className="inline-block w-1 h-5 bg-rose-700 rounded-full animate-pulse delay-100"></span>
          </div>
        </div>
      )}

      {/* Voice Error Fallback */}
      {voiceError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 rounded text-[11px]"
          >
            {tr(language, 'Fermer', 'إغلاق', 'Close')}
          </button>
        </div>
      )}

      {/* Quick Suggestions Chips Section: Par Culture & Par Type de Plante */}
      <div className="space-y-2 pt-1">
        {/* Row 1: Cultures fréquentes */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1 shrink-0">
            <span>🌾</span> {tr(language, 'Cultures :', 'المحاصيل :', 'Crops :')}
          </span>
          {POPULAR_CROPS.map((crop) => {
            const isSelected = (searchTerm || '').toLowerCase().includes((crop.label || '').toLowerCase());
            return (
              <button
                key={crop.label}
                type="button"
                onClick={() => handleTagClick(crop.label, 'CROP')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs scale-105'
                    : 'bg-stone-100 hover:bg-amber-50 hover:text-amber-900 text-stone-700 border border-stone-200/60'
                }`}
              >
                <span>{crop.icon}</span>
                <span>{crop.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Types de Plantes */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
            <span>🌿</span> {tr(language, 'Types de plantes :', 'أصناف النباتات :', 'Plant types :')}
          </span>
          {POPULAR_PLANT_TYPES.map((type) => {
            const isSelected = (searchTerm || '').toLowerCase().includes((type.label || '').toLowerCase());
            return (
              <button
                key={type.label}
                type="button"
                onClick={() => handleTagClick(type.label, 'PLANT_TYPE')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs scale-105'
                    : 'bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 border border-stone-200/60'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cross-Market Notification Badge: if matching produce or standing crops exist in Marketplace */}
      {searchTerm.trim() && matchingProduceCount > 0 && onNavigateToMarket && (
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-800">
            <Store className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              💡 <strong>{matchingProduceCount}</strong> {tr(
                language,
                `${matchingProduceCount > 1 ? 'annonces de récoltes correspondent' : 'annonce de récolte correspond'} également dans Fruits & Légumes pour "${searchTerm}".`,
                `عروض محاصيل مطابقة في سوق الخضر والفواكه لـ "${searchTerm}".`,
                `${matchingProduceCount > 1 ? 'harvest listings match' : 'harvest listing matches'} also in Fruits & Vegetables for "${searchTerm}".`
              )}
            </span>
          </div>

          <button
            id="btn-goto-market-results"
            type="button"
            onClick={onNavigateToMarket}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300 px-3 py-1 rounded-lg transition shrink-0"
          >
            <span>{tr(language, 'Voir le Marché', 'معاينة البورصة', 'View Market')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
