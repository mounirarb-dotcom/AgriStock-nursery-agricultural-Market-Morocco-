import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { AppLanguage } from '../types';
import { tr } from '../utils/translations';
import { globalVoiceSearch, VoiceSearchResult } from '../services/voiceSearchService';

interface VoiceSearchButtonProps {
  language: AppLanguage;
  onSearchResult: (query: string, details?: VoiceSearchResult) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  language,
  onSearchResult,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
    return () => {
      globalVoiceSearch.stopListening(false);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      setIsListening(false);
      globalVoiceSearch.stopListening(true);
      return;
    }

    setIsListening(true);
    setIsProcessing(false);
    setInterimText('');

    await globalVoiceSearch.startListening(language, {
      onStart: () => {
        setIsListening(true);
        setIsProcessing(false);
      },
      onInterim: (text) => {
        setInterimText(text);
        if (text.includes('Gemini') || text.includes('Analyse')) {
          setIsProcessing(true);
        }
      },
      onResult: (result) => {
        setIsListening(false);
        setIsProcessing(false);
        setInterimText('');
        if (result.query) {
          onSearchResult(result.query, result);
        }
      },
      onError: (err) => {
        console.warn('Voice search error:', err);
        setIsListening(false);
        setIsProcessing(false);
        setInterimText('');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-xs'
      : size === 'lg'
      ? 'px-3 py-2 text-sm'
      : 'w-8 h-8 text-xs';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer select-none ${sizeClasses} ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400'
            : isProcessing
            ? 'bg-amber-600 text-white'
            : 'text-stone-400 hover:text-amber-500 hover:bg-amber-50'
        } ${className}`}
        title={
          isListening
            ? tr(language, 'Écoute en cours... Cliquez pour valider', 'جاري الاستماع... اضغط للتأكيد', 'Listening... Click to submit')
            : isProcessing
            ? tr(language, 'Analyse audio en cours...', 'جاري تحليل الصوت...', 'Analyzing audio...')
            : tr(language, 'Recherche vocale / audio (Parlez)', 'البحث الصوتي (تحدث الآن)', 'Voice search (Speak)')
        }
        aria-label="Recherche vocale"
      >
        {isListening ? (
          <MicOff className="w-4 h-4 animate-bounce" />
        ) : isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Mic className="w-4 h-4" />
        )}

        {showLabel && (
          <span className="font-bold text-xs">
            {isListening
              ? tr(language, 'Arrêter', 'إيقاف', 'Stop')
              : isProcessing
              ? tr(language, 'Analyse...', 'تحليل...', 'Analyzing...')
              : tr(language, 'Vocal', 'صوتي', 'Voice')}
          </span>
        )}
      </button>

      {/* Floating active status tooltip when recording */}
      {isListening && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap shadow-lg pointer-events-none z-50 animate-bounce">
          {interimText || tr(language, 'Parlez...', 'تحدث...', 'Speak...')}
        </div>
      )}
      {isProcessing && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap shadow-lg pointer-events-none z-50">
          {tr(language, 'Gemini IA...', 'ذكاء اصطناعي...', 'Gemini AI...')}
        </div>
      )}
    </div>
  );
};
