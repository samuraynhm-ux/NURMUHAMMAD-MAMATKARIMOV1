import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  ShoppingBag,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { MenuItem, VoiceOrderItem, VoiceOrderAnalysisResult } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { formatPrice } from '../utils/formatters';
import { triggerTelegramHaptic } from '../utils/telegram';
import { playCatDeliverySound } from '../utils/catSound';
import catDeliveryDonnerImg from '../assets/images/cat_delivery_donner_1790068811302.jpg';
import { LiveWaveform } from './LiveWaveform';

interface VoiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (items: VoiceOrderItem[]) => void;
}

export const VoiceOrderModal: React.FC<VoiceOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirmOrder,
}) => {
  if (!isOpen) return null;

  // View state: 'listening' | 'analyzing' | 'confirm_dialog' | 'error'
  const [step, setStep] = useState<'listening' | 'analyzing' | 'confirm_dialog' | 'error'>('listening');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  // Parsed result items for the 'Xaridni tasdiqlash' confirmation dialog
  const [parsedItems, setParsedItems] = useState<VoiceOrderItem[]>([]);
  const [unrecognizedText, setUnrecognizedText] = useState<string>('');
  const [summaryNote, setSummaryNote] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  // References for Web Speech API and MediaRecorder
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sample prompt chips for quick voice testing
  const samplePrompts = [
    '2 ta AL DONNER va 1 ta Coca-Cola',
    '1 ta Pepperoni pizza va kartoshka fri',
    '2 ta Gourmet burger va muzdek ayran',
    '3 ta mol go\'shtli lavash va fanta',
  ];

  // Initialize SpeechRecognition on mount if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ'; // Primary: Uzbek

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev} ${finalTrans}` : finalTrans).trim());
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Mikrofonga ruxsat berilmadi. Iltimos, brauzer sozlamalarida mikrofonga ruxsat bering yoki quyidagi matn maydoniga yozing.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    triggerTelegramHaptic('medium');
    setErrorMsg(null);
    setTranscript('');
    setInterimText('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        // Optionally capture lightweight audio stream for live waveform visualizer
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            setActiveStream(stream);
          }).catch((e) => {
            console.log('Waveform stream fallback:', e);
          });
        }
        return;
      } catch (e) {
        console.warn('Recognition start failed, trying media recorder:', e);
      }
    }

    // Fallback: MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setActiveStream(stream);
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setActiveStream(null);
        await analyzeAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setErrorMsg("Mikrofonga ulanib bo'lmadi. Siz matnni qo'lda kiritishingiz yoki namunalardan birini tanlashingiz mumkin.");
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    triggerTelegramHaptic('light');
    if (activeStream) {
      try {
        activeStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // ignore
      }
      setActiveStream(null);
    }
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  // Analyze audio blob directly via backend
  const analyzeAudioBlob = async (blob: Blob) => {
    setStep('analyzing');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await sendToParseApi({ audioBase64: base64Data, mimeType: blob.type });
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setErrorMsg('Audio yozuvni qayta ishlashda xatolik yuz berdi.');
      setStep('listening');
    }
  };

  // Send transcript or audio to /api/voice-order/parse
  const sendToParseApi = async (payload: { transcript?: string; audioBase64?: string; mimeType?: string }) => {
    setStep('analyzing');
    setErrorMsg(null);

    try {
      const response = await fetch('/api/voice-order/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server tahlil qila olmadi');
      }

      const data: VoiceOrderAnalysisResult = await response.json();

      if (!data.success || !data.matchedItems || data.matchedItems.length === 0) {
        setErrorMsg(data.summaryNote || "Kechirasiz, aytilgan taomlar menyuda topilmadi. Iltimos, qayta ayting.");
        setStep('listening');
        return;
      }

      // Enrich items with menu photos and details
      const enrichedItems = data.matchedItems.map((item) => {
        const menuItem = MENU_ITEMS.find((m) => m.id === item.menuItemId);
        return {
          ...item,
          image: menuItem?.image || 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&q=80',
          category: menuItem?.category || 'doner',
        };
      });

      setTranscript(data.rawTranscript || transcript);
      setParsedItems(enrichedItems);
      setUnrecognizedText(data.unrecognizedText || '');
      setSummaryNote(data.summaryNote || '');
      // Transition directly to the 'Xaridni tasdiqlash' confirmation dialog!
      setStep('confirm_dialog');
      triggerTelegramHaptic('success');
    } catch (err) {
      console.error('Voice order parse API error:', err);
      setErrorMsg('Ovozli buyurtmani tahlil qilishda nosozlik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      setStep('listening');
    }
  };

  // Trigger analysis for current transcript text
  const handleAnalyzeText = () => {
    const text = transcript.trim() || interimText.trim();
    if (!text) {
      setErrorMsg('Iltimos, avval mikrofon orqali gapiring yoki namunalardan birini tanlang.');
      return;
    }
    stopRecording();
    sendToParseApi({ transcript: text });
  };

  // Quick prompt select
  const handleSelectSample = (sample: string) => {
    triggerTelegramHaptic('light');
    setTranscript(sample);
    sendToParseApi({ transcript: sample });
  };

  // Modify quantity inside the Confirmation Dialog
  const handleUpdateQuantity = (index: number, delta: number) => {
    triggerTelegramHaptic('light');
    setParsedItems((prev) => {
      const next = [...prev];
      const item = next[index];
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        // remove item
        return next.filter((_, idx) => idx !== index);
      } else {
        next[index] = {
          ...item,
          quantity: newQty,
          totalPrice: item.unitPrice * newQty,
        };
        return next;
      }
    });
  };

  // Remove item completely in confirmation dialog
  const handleRemoveItem = (index: number) => {
    triggerTelegramHaptic('medium');
    setParsedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Total amount in the confirmation dialog
  const totalOrderAmount = parsedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItemCount = parsedItems.reduce((sum, item) => sum + item.quantity, 0);

  // User confirmed the purchase in the dialog!
  const handleConfirmPurchase = () => {
    if (parsedItems.length === 0) return;
    triggerTelegramHaptic('success');
    playCatDeliverySound('classic');
    onConfirmOrder(parsedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#12161f] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#151a24]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-black">
              <Mic className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {step === 'confirm_dialog' ? 'Xaridni Tasdiqlash' : 'Ovozli Buyurtma (Voice-to-Order)'}
              </h2>
              <p className="text-xs text-amber-300/80">
                {step === 'confirm_dialog'
                  ? 'AI tahlil qilingan buyurtmangiz'
                  : 'Mikrofonga gapiring yoki yozing'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* STEP 1: LISTENING & RECORDING */}
          {step === 'listening' && (
            <div className="space-y-4 text-center">
              {/* Scottish Fold Delivery Mascot Header (Kichikroq & Dastafkachi mushuk) */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-400/50 text-blue-200 text-xs font-semibold shadow-sm">
                <img
                  src={catDeliveryDonnerImg}
                  alt="Dastafkachi Skotish Fold qo'lida AL DONNER bilan"
                  className="w-6 h-6 rounded-full object-cover border border-amber-400 shrink-0 shadow-sm"
                />
                <span className="truncate max-w-[280px] sm:max-w-none">
                  Dastafkachi Skotish Fold qo'lida AL DONNER bilan tinglamoqda 🐾🌯
                </span>
              </div>

              {/* Animated Microphone Visualizer */}
              <div className="py-2 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center mb-1">
                  {isRecording && (
                    <>
                      <div className="absolute w-28 h-28 rounded-full bg-orange-500/20 animate-ping" />
                      <div className="absolute w-20 h-20 rounded-full bg-amber-500/30 animate-pulse" />
                    </>
                  )}

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${
                      isRecording
                        ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/40 scale-105 ring-4 ring-rose-500/30'
                        : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-black hover:scale-105 shadow-orange-500/30'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-7 h-7 animate-bounce" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                <div className="mt-2 text-center">
                  <p className="text-sm font-bold text-white">
                    {isRecording ? '🎙️ AI Mikrofoni Tinglamoqda... Gapiring!' : 'Mikrofonni bosing va buyurtma bering'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isRecording
                      ? 'Gapirib bo\'lgach, pastdagi "AI orqali Tahlil Qilish" tugmasini bosing'
                      : 'O\'zbek yoki rus tilida bemalol ayting'}
                  </p>
                </div>

                {/* Jonli to'lqin: AI mikrofoni ishlayotganini bildiruvchi to'lqin animatsiyasi */}
                <div className="w-full mt-2">
                  <LiveWaveform isRecording={isRecording} stream={activeStream} />
                </div>
              </div>

              {/* Live Transcript Box */}
              <div className="bg-[#171d29] border border-white/10 rounded-2xl p-4 text-left relative group">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Eshitilgan matn:
                  </span>
                  <button
                    onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                    className="text-[11px] text-zinc-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isEditingTranscript ? 'Saqlash' : "Tahrirlash"}
                  </button>
                </div>

                {isEditingTranscript ? (
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Masalan: 2 ta AL DONNER va 1 ta pepperoni pizza..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-zinc-200 min-h-[44px]">
                    {transcript || interimText ? (
                      <>
                        <span className="font-medium text-white">{transcript}</span>
                        {interimText && <span className="text-amber-400 italic"> {interimText}</span>}
                      </>
                    ) : (
                      <span className="text-zinc-500 italic">
                        Masalan: «Ikkita AL DONNER go'shtli, bitta pepperoni pizza va bitta kola bering»
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons for Listening */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={handleAnalyzeText}
                  disabled={!transcript.trim() && !interimText.trim()}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI orqali Tahlil Qilish</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Sample Prompts */}
              <div className="text-left pt-2">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Yoki tayyor namunalardan birini bosing:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 text-zinc-300 hover:text-amber-200 transition-all text-left"
                    >
                      🗣️ {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ANALYZING WITH GEMINI */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-white">AI ovozni tahlil qilmoqda...</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Aytilgan taomlar menyu bilan solishtirilmoqda va buyurtma ro'yxati shakllantirilmoqda.
                </p>
              </div>

              {transcript && (
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 max-w-sm">
                  «{transcript}»
                </div>
              )}
            </div>
          )}

          {/* STEP 3: THE MAIN FEATURE - 'XARIDNI TASDIQLASH' CONFIRMATION DIALOG */}
          {step === 'confirm_dialog' && (
            <div className="space-y-4">
              {/* Mascot Friendly Explanation Box (Kichikroq dastafkachi mushuk) */}
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-400/80 shrink-0 shadow-md">
                  <img
                    src={catDeliveryDonnerImg}
                    alt="Dastafkachi Skotish Fold qo'lida AL DONNER ushlab turibdi"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dastafkachi Skotish Fold buyurtmani tahlil qildi! 🌯</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-2">
                    {summaryNote || "Qo'limdagi yangi pishgan AL DONNER kabi taomlaringiz issiq va tez yetkaziladi. Xaridni tasdiqlang!"}
                  </p>
                </div>
              </div>

              {/* Original Heard Voice Transcript */}
              <div className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2 text-left">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-zinc-400">Siz aytgan ovoz: </span>
                  <span className="text-amber-200 font-medium">«{transcript}»</span>
                </div>
              </div>

              {/* Unrecognized items alert if any */}
              {unrecognizedText && (
                <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>
                    Menyuda topilmadi: <b>"{unrecognizedText}"</b> (boshqa taomlar hisobga olindi)
                  </span>
                </div>
              )}

              {/* Items List Heading */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Aniqlangan Taomlar ({parsedItems.length} ta):
                </span>
                <span className="text-[11px] text-zinc-400">Miqdorni o'zgartirishingiz mumkin</span>
              </div>

              {/* Parsed Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {parsedItems.map((item, index) => (
                  <div
                    key={`${item.menuItemId}-${index}`}
                    className="p-3 rounded-2xl bg-[#171d29] border border-white/10 hover:border-amber-500/30 flex items-center justify-between gap-3 transition-colors"
                  >
                    {/* Item Image & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="text-left min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                          {formatPrice(item.unitPrice)}
                          {item.selectedSize === 'large' && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              Katta
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-zinc-400 italic">
                            Eslatma: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Subtotal */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(index, -1)}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                          title="Kamaytirish"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, 1)}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                          title="Ko'paytirish"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-xs font-black text-amber-300">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {parsedItems.length === 0 && (
                  <div className="text-center py-6 text-zinc-400 text-xs">
                    Barcha taomlar o'chirildi. Qayta ovoz yozishingiz mumkin.
                  </div>
                )}
              </div>

              {/* Order Total Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400">Jami hisoblangan qiymat:</div>
                  <div className="text-[11px] text-zinc-400">
                    {totalItemCount} ta mahsulot
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-400">
                    {formatPrice(totalOrderAmount)}
                  </div>
                </div>
              </div>

              {/* Confirmation Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Primary Confirm Button */}
                <button
                  onClick={handleConfirmPurchase}
                  disabled={parsedItems.length === 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 hover:from-emerald-400 hover:via-amber-400 hover:to-orange-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Xaridni Tasdiqlash va Savatga Qo'shish</span>
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                </button>

                {/* Secondary buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      triggerTelegramHaptic('light');
                      setStep('listening');
                      setTranscript('');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Qayta Ovoz Yozish</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Bekor Qilish</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
