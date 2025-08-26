

import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { generateAdFromKeywords, parseSearchQuery, searchByImage } from '../services/geminiService';
import { Button } from './common/Button';
import { AIAssistantMode } from '../types';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { XIcon } from './icons/XIcon';
import { LoadingSpinner } from './common/LoadingSpinner';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AIAssistantMode;
  onAdGenerated?: (content: { title: string; description: string }) => void;
  onSearchParsed?: (filters: any) => void;
}

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const searchSuggestions = [
    'ملابس تركية جملة',
    'أحذية رياضية في بغداد',
    'مواد غذائية معلبة',
    'أجهزة كهربائية للمنزل'
];

const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, mode, onAdGenerated, onSearchParsed }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setInput('');
        setResult('');
        setIsLoading(false);
        clearImage();
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        setIsRecording(false);
      }, 300); // Wait for fade out animation
    }
  }, [isOpen]);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            mimeType: file.type,
            data: await base64EncodedDataPromise as string,
        },
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(file));
        setInput(''); 
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if(imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if(imageInputRef.current) imageInputRef.current.value = "";
  }

 const handleToggleRecording = async () => {
      if (isRecording) {
          recognitionRef.current?.stop();
          return;
      }
      if (!SpeechRecognition) {
          setResult("عذراً، متصفحك لا يدعم خاصية البحث الصوتي.");
          return;
      }

      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        if (permissionStatus.state === 'denied') {
            setResult("تم رفض إذن الميكروفون. يرجى تفعيله من إعدادات المتصفح.");
            return;
        }

        // This will prompt the user if permission is not already granted.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop track immediately after getting permission

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'ar-IQ';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onstart = () => setIsRecording(true);
        recognitionRef.current.onend = () => setIsRecording(false);
        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setResult("حدث خطأ أثناء التعرف على الصوت.");
            setIsRecording(false);
        };
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
              finalTranscript += event.results[i][0].transcript;
          }
          setInput(finalTranscript);
        };
        recognitionRef.current.start();
      } catch (err: any) {
          console.error("Error with microphone:", err);
           if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
               setResult("لم تمنح الإذن لاستخدام الميكروفون.");
           } else {
               setResult("حدث خطأ أثناء محاولة استخدام الميكروفون.");
           }
          setIsRecording(false);
      }
  };


  const handleGenerate = async (query?: string) => {
    const currentInput = query || input;
    if (!currentInput.trim() && !imageFile) return;
    setIsLoading(true);
    setResult('');
    try {
      if (mode === AIAssistantMode.AD_CREATION && onAdGenerated) {
        const fullText = await generateAdFromKeywords(currentInput);
        const [title, ...descriptionParts] = fullText.split('---');
        const description = descriptionParts.join('---').trim();
        onAdGenerated({ title: title.trim(), description });
        setResult('تم إنشاء الإعلان بنجاح! سيتم ملء الحقول تلقائياً.');
        setTimeout(onClose, 2000);
      } else if (mode === AIAssistantMode.SEARCH && onSearchParsed) {
        let parsed;
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parsed = await searchByImage(imagePart);
        } else {
            parsed = await parseSearchQuery(currentInput);
        }
        if (parsed.error) {
          setResult(parsed.error);
        } else {
          onSearchParsed(parsed);
          setResult('تم تحليل طلبك. سيتم تطبيق الفلاتر.');
          setTimeout(onClose, 2000);
        }
      }
    } catch (e) {
      console.error(e);
      setResult('حدث خطأ ما. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    triggerHapticFeedback();
    handleGenerate(suggestion);
  };
  
  const handleImageButtonClick = () => {
    triggerHapticFeedback();
    imageInputRef.current?.click();
  };

  const handleToggleRecordingWithFeedback = () => {
    triggerHapticFeedback();
    handleToggleRecording();
  };


  if (!isOpen) return null;

  const title = mode === AIAssistantMode.AD_CREATION ? 'مساعد كتابة الإعلان' : 'البحث الذكي';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div 
        className="bg-brand-secondary/50 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-2xl border border-brand-accent/30 modal-glow-animation animate-fadeInUp"
        style={{animationDuration: '0.5s'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 space-y-6 stagger-children">
            {/* Header */}
            <div className="text-center" style={{ animationDelay: '100ms' }}>
                <SparklesIcon className="w-12 h-12 text-brand-accent mx-auto mb-2" />
                <h2 className="text-3xl font-bold text-gradient-gold">{title}</h2>
                <p className="text-brand-text-secondary mt-1">أهلاً بك في مساعد سوق العراق الذكي</p>
            </div>

            {isLoading ? (
                <LoadingSpinner text="لحظات... الذكاء الاصطناعي يفكر" />
            ) : result ? (
                <div className="text-center py-8 text-xl text-white font-semibold">
                    {result}
                </div>
            ) : (
             <>
                {/* Body */}
                <div className="space-y-4" style={{ animationDelay: '200ms' }}>
                    {imagePreview ? (
                        <div className="relative mb-4 w-fit mx-auto">
                            <img src={imagePreview} alt="معاينة الصورة" className="rounded-lg max-h-40 w-auto border-2 border-brand-accent/50" />
                            <button onClick={clearImage} disabled={isLoading} className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black/90 transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isRecording ? '... جاري الاستماع' : 'اكتب طلبك هنا...'}
                            rows={3}
                            disabled={isLoading || isRecording}
                            className="w-full bg-brand-primary/60 text-brand-text placeholder-brand-text-secondary border-2 border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-300"
                        />
                    )}
                </div>

                {/* Suggestions for Search Mode */}
                {mode === AIAssistantMode.SEARCH && !imageFile && (
                    <div style={{ animationDelay: '300ms' }}>
                        <p className="text-sm text-brand-text-secondary mb-2 text-center">أو جرب أحد الاقتراحات التالية:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {searchSuggestions.map(s => (
                                <button key={s} onClick={() => handleSuggestionClick(s)} className="bg-brand-secondary/80 text-brand-text-secondary text-sm px-3 py-1.5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-colors">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            
                {/* Footer / Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center gap-6">
                        {mode === AIAssistantMode.SEARCH && SpeechRecognition && (
                            <>
                            <button onClick={handleImageButtonClick} disabled={isLoading || isRecording || !!imageFile} className="flex flex-col items-center text-brand-text-secondary hover:text-brand-accent disabled:opacity-50 transition-colors group" title="بحث بالصورة">
                                <PaperclipIcon className="w-7 h-7" />
                                <span className="text-xs mt-1 group-hover:text-brand-accent">صورة</span>
                            </button>
                            <button onClick={handleToggleRecordingWithFeedback} disabled={isLoading || !!imageFile} className="flex flex-col items-center text-brand-text-secondary hover:text-brand-accent disabled:opacity-50 transition-colors group relative" title="بحث بالصوت">
                                {isRecording && <span className="absolute -top-2 -right-2 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                                <MicrophoneIcon className={`w-7 h-7 ${isRecording ? 'text-red-500' : ''}`} />
                                <span className={`text-xs mt-1 group-hover:text-brand-accent ${isRecording ? 'text-red-500' : ''}`}>صوت</span>
                            </button>
                            </>
                        )}
                    </div>

                    <div className="flex w-full sm:w-auto gap-3">
                        <Button onClick={() => handleGenerate()} disabled={isLoading || (!input.trim() && !imageFile)} className="w-full sm:w-auto flex-grow">
                            نفذ الأمر
                        </Button>
                        <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">
                            إلغاء
                        </Button>
                    </div>
                </div>
             </>
            )}
        </div>
        <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
      </div>
    </div>
  );
};
