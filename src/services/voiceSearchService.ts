import { playAudioFeedback } from '../utils/audioUtils';
import { AppLanguage } from '../types';

export interface VoiceSearchResult {
  transcript: string;
  query: string;
  category?: string;
  region?: string;
  targetTab?: 'market' | 'nursery' | 'wholesale' | 'carrier';
  confidence?: number;
}

export interface VoiceSearchHandlers {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onResult?: (result: VoiceSearchResult) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

export interface VoiceSearchOptions {
  forceGemini?: boolean;
}

interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceSearchService {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening = false;
  private isProcessing = false;
  private isDiscarding = false;
  private mediaStream: MediaStream | null = null;
  private autoStopTimeout: any = null;

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as IWindowSpeechRecognition;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public isMediaRecordingSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(navigator?.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined');
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Start Voice Search:
   * When options.forceGemini is true, records audio directly for multimodal Gemini AI interpretation.
   * Otherwise tries native Web Speech API first for zero-latency transcription, falling back to Gemini AI.
   */
  public async startListening(
    language: AppLanguage,
    handlers: VoiceSearchHandlers,
    options?: VoiceSearchOptions
  ): Promise<boolean> {
    if (this.isListening || this.isProcessing) {
      this.stopListening(true);
      return false;
    }

    this.isDiscarding = false;

    if (options?.forceGemini) {
      return this.startMediaRecorderFallback(language, handlers);
    }

    const win = window as unknown as IWindowSpeechRecognition;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang =
          language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.isProcessing = false;
          playAudioFeedback('start');
          handlers.onStart?.();
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          if (interim) {
            handlers.onInterim?.(interim);
          }

          if (final) {
            const cleanQuery = final.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
            playAudioFeedback('success');
            handlers.onResult?.({
              transcript: final,
              query: cleanQuery,
              confidence: event.results[0]?.[0]?.confidence || 0.9,
            });
            this.isListening = false;
            this.isProcessing = false;
          }
        };

        this.recognition.onerror = (err: any) => {
          console.warn('[Speech Recognition Warning]', err?.error);
          this.isListening = false;

          // Seamless fallback to MediaRecorder + Gemini if network, not allowed or service error
          if (
            err.error === 'network' ||
            err.error === 'service-not-allowed' ||
            err.error === 'audio-capture'
          ) {
            this.startMediaRecorderFallback(language, handlers);
            return;
          }

          let msg = 'Erreur lors de la capture audio.';
          if (err.error === 'not-allowed') {
            msg = 'Veuillez autoriser l’accès au microphone dans votre navigateur.';
          } else if (err.error === 'no-speech') {
            msg = 'Aucune parole détectée. Veuillez parler plus près du micro.';
          }
          playAudioFeedback('clear');
          handlers.onError?.(msg);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          handlers.onEnd?.();
        };

        this.recognition.start();
        return true;
      } catch (err) {
        console.warn('SpeechRecognition failed, falling back to MediaRecorder', err);
        return this.startMediaRecorderFallback(language, handlers);
      }
    } else {
      return this.startMediaRecorderFallback(language, handlers);
    }
  }

  /**
   * MediaRecorder + Gemini AI Processing
   */
  private async startMediaRecorderFallback(
    language: AppLanguage,
    handlers: VoiceSearchHandlers
  ): Promise<boolean> {
    if (!this.isMediaRecordingSupported()) {
      handlers.onError?.('La recherche audio n’est pas supportée sur ce navigateur.');
      return false;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.isDiscarding = false;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const recorder = new MediaRecorder(this.mediaStream, { mimeType });
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      recorder.onstart = () => {
        this.isListening = true;
        this.isProcessing = false;
        playAudioFeedback('start');
        handlers.onStart?.();
      };

      recorder.onstop = async () => {
        if (this.autoStopTimeout) {
          clearTimeout(this.autoStopTimeout);
          this.autoStopTimeout = null;
        }

        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }

        if (this.isDiscarding) {
          this.audioChunks = [];
          this.isListening = false;
          this.isProcessing = false;
          handlers.onEnd?.();
          return;
        }

        if (this.audioChunks.length === 0) {
          this.isListening = false;
          this.isProcessing = false;
          handlers.onError?.('Aucun flux audio capturé.');
          handlers.onEnd?.();
          return;
        }

        this.isListening = false;
        this.isProcessing = true;
        handlers.onInterim?.('Analyse intelligente en cours avec Gemini...');

        try {
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          const base64Audio = await this.blobToBase64(audioBlob);

          const response = await fetch('/api/ai/voice-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType,
              language,
            }),
          });

          if (!response.ok) {
            throw new Error(`Erreur serveur (${response.status})`);
          }

          const resData = await response.json();
          if (resData.success && resData.data) {
            playAudioFeedback('success');
            handlers.onResult?.(resData.data);
          } else {
            handlers.onError?.(resData.error || 'Impossible d’interpréter la voix.');
          }
        } catch (fetchErr: any) {
          handlers.onError?.(fetchErr.message || 'Erreur lors de l’analyse vocale.');
        } finally {
          this.isProcessing = false;
          handlers.onEnd?.();
        }
      };

      recorder.start();

      // Auto-stop after 8 seconds max
      this.autoStopTimeout = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stopListening(true);
        }
      }, 8000);

      return true;
    } catch (micErr: any) {
      console.error('Microphone permission error:', micErr);
      handlers.onError?.('Accès micro refusé. Veuillez autoriser le microphone.');
      return false;
    }
  }

  /**
   * Stop listening:
   * @param submit When true, completes recording and processes speech. When false, aborts and discards.
   */
  public stopListening(submit = true): void {
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }

    if (!submit) {
      this.isDiscarding = true;
      playAudioFeedback('clear');
    }

    if (this.recognition) {
      try {
        if (submit) {
          this.recognition.stop();
        } else {
          this.recognition.abort();
        }
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    } else if (!this.mediaRecorder) {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }
      this.isListening = false;
      this.isProcessing = false;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const globalVoiceSearch = new VoiceSearchService();
