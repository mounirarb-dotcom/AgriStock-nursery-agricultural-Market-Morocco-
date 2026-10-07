import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  Radio,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { AppLanguage } from '../types';
import { globalVoiceSearch, VoiceSearchResult } from '../services/voiceSearchService';
import { playAudioFeedback, speakSearchResult } from '../utils/audioUtils';

interface AudioSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch?: (query: string, targetTab?: 'market' | 'nursery' | 'wholesale') => void;
}

export const AudioSearchModal: React.FC<AudioSearchModalProps> = ({
  isOpen,
  onClose,
  onApplySearch,
}) => {
  const { language, setLanguage, setActiveTab, setGlobalVoiceSearchQuery } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedResult, setRecognizedResult] = useState<VoiceSearchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferGeminiAI, setPreferGeminiAI] = useState(true);

  // Moroccan agricultural sample phrases
  const SUGGESTIONS = [
    { text: 'Tomate ronde sous serre Agadir', icon: '🍅', tab: 'market' as const },
    { text: 'Plants oliviers Menara agréés ONSSA', icon: '🫒', tab: 'nursery' as const },
    { text: 'Pommes de terre Spunta calibre 50+', icon: '🥔', tab: 'market' as const },
    { text: 'Moutons Sardi bétail Souk Settat', icon: '🐑', tab: 'wholesale' as const },
    { text: 'Avocats Hass primeur exportation', icon: '🥑', tab: 'market' as const },
    { text: 'Clémentines Nadorcott Berkane', icon: '🍊', tab: 'market' as const },
  ];

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setRecognizedResult(null);
      setErrorMessage(null);
      startListening();
    } else {
      globalVoiceSearch.stopListening(false);
      setIsListening(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const startListening = async () => {
    setErrorMessage(null);
    setRecognizedResult(null);
    setTranscript('');
    setIsListening(true);
    setIsProcessing(false);

    await globalVoiceSearch.startListening(
      language,
      {
        onStart: () => {
          setIsListening(true);
          setIsProcessing(false);
        },
        onInterim: (text) => {
          setTranscript(text);
          if (text.includes('Gemini') || text.includes('Analyse')) {
            setIsProcessing(true);
          }
        },
        onResult: (result) => {
          setIsListening(false);
          setIsProcessing(false);
          setTranscript(result.transcript || result.query);
          setRecognizedResult(result);
        },
        onError: (err) => {
          setIsListening(false);
          setIsProcessing(false);
          setErrorMessage(err);
        },
        onEnd: () => {
          setIsListening(false);
        },
      },
      { forceGemini: preferGeminiAI }
    );
  };

  const handleStopListening = () => {
    setIsListening(false);
    globalVoiceSearch.stopListening(true);
  };

  const handleClose = () => {
    globalVoiceSearch.stopListening(false);
    setIsListening(false);
    setIsProcessing(false);
    onClose();
  };

  const handleSelectSuggestion = (phrase: string, tab: 'market' | 'nursery' | 'wholesale') => {
    playAudioFeedback('click');
    setTranscript(phrase);
    setRecognizedResult({
      transcript: phrase,
      query: phrase,
      targetTab: tab,
      confidence: 1.0,
    });
  };

  const handleValidateAndSearch = () => {
    const query = recognizedResult?.query || transcript;
    if (!query) return;

    playAudioFeedback('success');
    const targetTab = recognizedResult?.targetTab || 'market';

    if (onApplySearch) {
      onApplySearch(query, targetTab);
    } else {
      setGlobalVoiceSearchQuery(query);
      setActiveTab(targetTab);
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d2218] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b3e2b] bg-[#091910]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>{tr(language, 'Recherche Audio Intelligente', 'البحث الصوتي الذكي', 'Smart Voice Search')}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  IA Gemini
                </span>
              </h2>
              <p className="text-[10px] text-emerald-300/80">
                {tr(
                  language,
                  'Dictez votre recherche en français ou darija marocaine (ex: maticha, batata, sardi)',
                  'تحدث بالدارجة المغربية أو الفرنسية (طماطم، بطاطس، صردي...) للبحث الفوري',
                  'Speak in Darija, French or English for instant search'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Mode Toggle */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs bg-[#0b1c13]">
          <span className="text-[11px] text-stone-300">
            {tr(language, 'Moteur de reconnaissance :', 'محرك التعرف الصوتي :', 'Recognition engine:')}
          </span>
          <div className="flex items-center gap-1 bg-[#07150e] p-1 rounded-xl border border-emerald-900/60">
            <button
              type="button"
              onClick={() => setPreferGeminiAI(true)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                preferGeminiAI
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ✨ IA Gemini
            </button>
            <button
              type="button"
              onClick={() => setPreferGeminiAI(false)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                !preferGeminiAI
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⚡ Rapide
            </button>
          </div>
        </div>

        {/* Central Audio Visualization & State */}
        <div className="p-6 text-center space-y-4 flex-1 overflow-y-auto">
          {/* Main Pulsing Mic Button */}
          <div className="relative flex justify-center py-2">
            {isListening && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                <div className="absolute w-28 h-28 rounded-full bg-rose-500/30 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={isListening ? handleStopListening : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 shadow-2xl cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white scale-105 ring-4 ring-rose-400/50'
                  : isProcessing
                  ? 'bg-amber-600 text-white ring-4 ring-amber-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/30 hover:scale-102'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-8 h-8 animate-bounce mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {tr(language, 'Terminer', 'إنهاء', 'Done')}
                  </span>
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {tr(language, 'Analyse', 'تحليل', 'Analyzing')}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {tr(language, 'Parler', 'تحدث', 'Speak')}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Sound Waves Animation */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 h-7">
              {[40, 75, 95, 60, 85, 50, 90, 70, 45].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript / Spoken Output Display */}
          <div className="min-h-[70px] p-3.5 rounded-2xl bg-[#091a11] border border-[#1a402a] text-center flex flex-col items-center justify-center">
            {transcript ? (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {tr(language, 'Paroles captées :', 'الكلام الملتقط :', 'Captured speech:')}
                </span>
                <p className="text-base sm:text-lg font-black text-white italic">
                  &quot;{transcript}&quot;
                </p>
              </div>
            ) : isListening ? (
              <p className="text-xs sm:text-sm text-stone-300 font-medium animate-pulse">
                {tr(
                  language,
                  'Parlez maintenant... (Ex: "50 tonnes de tomates Agadir")',
                  'تحدث الآن... (مثال: "50 طن مطيشة أكادير")',
                  'Speak now... (e.g. "50 tons Agadir tomatoes")'
                )}
              </p>
            ) : isProcessing ? (
              <p className="text-xs text-amber-300 font-semibold animate-pulse flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{tr(language, 'Interprétation Gemini IA...', 'جاري التحليل بالذكاء الاصطناعي...', 'Gemini AI parsing...')}</span>
              </p>
            ) : (
              <p className="text-xs text-stone-400">
                {tr(language, 'Cliquez sur le microphone pour commencer la recherche audio', 'اضغط على الميكروفون لبدء التحدث', 'Click microphone to start audio search')}
              </p>
            )}
          </div>

          {/* Error display if any */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={startListening}
                className="underline font-bold text-rose-300 ml-2 cursor-pointer"
              >
                {tr(language, 'Réessayer', 'إعادة المحاولة', 'Retry')}
              </button>
            </div>
          )}

          {/* AI Structured Extraction Result */}
          {recognizedResult && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-left space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {tr(language, 'Résultat de la recherche interprété :', 'نتيجة البحث المستخلصة :', 'Extracted Search:')}
                </span>
                {recognizedResult.targetTab && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-900 text-emerald-200 text-[10px] uppercase font-mono">
                    {recognizedResult.targetTab === 'nursery'
                      ? 'Pépinière'
                      : recognizedResult.targetTab === 'wholesale'
                      ? 'Bourse des Prix'
                      : 'Marché Récoltes'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-black text-white truncate">
                    {recognizedResult.query}
                  </div>
                  {recognizedResult.region && (
                    <div className="text-[10px] text-stone-300">
                      Région : {recognizedResult.region}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => speakSearchResult(recognizedResult.query, language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                    title="Écouter le résultat"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateAndSearch}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md cursor-pointer transition active:scale-95"
                  >
                    <span>{tr(language, 'Lancer', 'بحث', 'Launch')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Click-to-Speak Suggestions */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
              <span>{tr(language, 'Suggestions fréquentes (Maroc) :', 'أمثلة شائعة :', 'Frequent examples:')}</span>
              <span className="text-[10px] text-emerald-400 lowercase">cliquer pour tester</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.text, item.tab)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#091a11] hover:bg-[#122c1f] border border-[#1b3d2c] hover:border-emerald-500/40 text-left transition cursor-pointer group"
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <span className="text-xs text-stone-300 group-hover:text-white truncate">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1b3e2b] bg-[#091910] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-stone-400">{tr(language, 'Langue :', 'اللغة :', 'Language :')}</span>
            {(['fr', 'ar', 'en'] as AppLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                  language === lang
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {transcript && (
              <button
                type="button"
                onClick={handleValidateAndSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <span>{tr(language, 'Rechercher', 'بحث', 'Search')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs cursor-pointer"
            >
              {tr(language, 'Fermer', 'إغلاق', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
