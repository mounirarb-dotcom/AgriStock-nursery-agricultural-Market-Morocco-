import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  RotateCw,
  Sparkles,
  Trash2,
  Star,
  Maximize2,
  AlertCircle,
  FolderOpen,
  Eye,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { NURSERY_PHOTO_PRESETS } from '../data/nurseryPhotoPresets';

export interface PhotoUploadCaptureProps {
  currentImageUrl?: string;
  additionalImages?: string[];
  onImageChange: (mainUrl: string, additionalUrls: string[]) => void;
  categoryHint?: string;
  title?: string;
  subtitle?: string;
  maxImages?: number;
  allowPresets?: boolean;
  className?: string;
}

// Preset agricultural photo catalogue categorized by domain
const CATALOG_PRESETS: {
  category: string;
  labelFr: string;
  labelAr: string;
  items: { label: string; url: string; sub?: string }[];
}[] = [
  {
    category: 'legumes',
    labelFr: 'Légumes & Maraîchage',
    labelAr: 'الخضروات والمحاصيل',
    items: [
      {
        label: 'Tomates Rondes',
        sub: 'Sous-serre Chtouka',
        url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Pommes de terre',
        sub: 'Spunta / Nicola Saïss',
        url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Oignons Rouges',
        sub: 'Terroir El Hajeb',
        url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Poivrons & Piments',
        sub: 'Calibre Export',
        url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'fruits',
    labelFr: 'Fruits & Agrumes',
    labelAr: 'الفواكه والحوامض',
    items: [
      {
        label: 'Clémentines Berkane',
        sub: 'Nadorcott / Afourer',
        url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Avocats Hass',
        sub: 'Gharb / Kenitra',
        url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Dattes Mejhoul',
        sub: 'Tafilalet / Zagora',
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Pastèques & Melons',
        sub: 'Zagora / Souss',
        url: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'elevage',
    labelFr: 'Élevage & Bétail',
    labelAr: 'المواشي والأنعام',
    items: [
      {
        label: 'Moutons Sardi',
        sub: 'Béni Meskine / Chaouia',
        url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Troupeau Timahdite',
        sub: 'Moyen Atlas certifié',
        url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Génisses Holstein',
        sub: 'Production laitière',
        url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Veaux Engraissement',
        sub: 'Charolais / Blanc Bleu',
        url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Chèvres Alpines & Atlas',
        sub: 'Troupeau caprin sain',
        url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    category: 'pepiniere',
    labelFr: 'Plants & Pépinières',
    labelAr: 'الشتلات والمشاتل',
    items: [
      {
        label: 'Jeunes Oliviers Picholine',
        sub: 'Sachets PE / Godets',
        url: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      },
      {
        label: 'Agrumes Greffés Carrizo',
        sub: 'Pépinière agréée',
        url: '/src/assets/images/nursery_citrus_sapling_1789031045474.jpg',
      },
      {
        label: 'Palmiers Mejhoul Vitro',
        sub: 'Plants en pots',
        url: '/src/assets/images/arbo_palm_mejhoul_pots_1790004584140.jpg',
      },
      {
        label: 'Plateaux Alvéolés Tomates',
        sub: 'Plants maraîchers greffés',
        url: '/src/assets/images/nursery_tomato_plugtrays_1789031062934.jpg',
      },
    ],
  },
  {
    category: 'fourrage',
    labelFr: 'Fourrage & Intrants',
    labelAr: 'الأعلاف والكلأ',
    items: [
      {
        label: 'Luzerne en Bottes',
        sub: 'Séchée sous soleil',
        url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80',
      },
      {
        label: 'Foin & Paille Pressée',
        sub: 'Alimentation animale & paillage',
        url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

/**
 * Compresses an image file client-side using an offscreen HTML Canvas
 * to ensure maximum reliability, fast rendering, and minimal memory usage.
 */
const compressImageFile = (file: File, maxDimension = 1280, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Clean rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Erreur de lecture image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur de fichier'));
    reader.readAsDataURL(file);
  });
};

export const PhotoUploadCapture: React.FC<PhotoUploadCaptureProps> = ({
  currentImageUrl,
  additionalImages = [],
  onImageChange,
  categoryHint = '',
  title,
  subtitle,
  maxImages = 4,
  allowPresets = true,
  className = '',
}) => {
  const { language } = useApp();

  // Primary list of images (0 = main, 1..n = additional)
  const [images, setImages] = useState<string[]>(() => {
    const list: string[] = [];
    if (currentImageUrl && currentImageUrl.trim()) {
      list.push(currentImageUrl);
    }
    if (additionalImages && additionalImages.length > 0) {
      additionalImages.forEach((url) => {
        if (url && !list.includes(url)) list.push(url);
      });
    }
    return list;
  });

  const [activeTab, setActiveTab] = useState<'upload_capture' | 'presets'>('upload_capture');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>(() => {
    const hint = (categoryHint || '').toLowerCase();
    if (hint.includes('bétail') || hint.includes('élev') || hint.includes('ovin') || hint.includes('bovin')) {
      return 'elevage';
    }
    if (hint.includes('pépin') || hint.includes('plant') || hint.includes('arbre')) {
      return 'pepiniere';
    }
    if (hint.includes('fruit') || hint.includes('agrume')) {
      return 'fruits';
    }
    return 'legumes';
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // In-app Live Camera states
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasCameraSupport, setHasCameraSupport] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFlashEffect, setCameraFlashEffect] = useState(false);

  // Input refs
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync back to parent when images array updates
  const notifyChange = useCallback(
    (newImages: string[]) => {
      const main = newImages[0] || '';
      const extras = newImages.slice(1);
      onImageChange(main, extras);
    },
    [onImageChange]
  );

  // Handle files selection (both camera snapshot or gallery upload)
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const files = Array.from(fileList);
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setErrorMessage(
          tr(
            language,
            `Limite de ${maxImages} photos atteinte. Supprimez-en une pour en ajouter d'autres.`,
            `تم الوصول للحد الأقصى (${maxImages} صور). احذف صورة لإضافة أخرى.`,
            `Maximum limit of ${maxImages} photos reached. Delete one to add more.`
          )
        );
        setIsProcessing(false);
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const newCompressedUrls: string[] = [];

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          continue;
        }
        const compressed = await compressImageFile(file, 1280, 0.85);
        newCompressedUrls.push(compressed);
      }

      if (newCompressedUrls.length > 0) {
        const updated = [...images, ...newCompressedUrls];
        setImages(updated);
        notifyChange(updated);
      }
    } catch (err: any) {
      setErrorMessage(
        tr(
          language,
          'Impossible de charger la photo. Vérifiez le format.',
          'تعذر تحميل الصورة. المرجو التحقق من الصيغة.',
          'Failed to load image. Check the format.'
        )
      );
    } finally {
      setIsProcessing(false);
      // Reset inputs so user can choose the same file again if desired
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove a photo
  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);
    notifyChange(updated);
  };

  // Set an image as primary
  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const item = images[indexToPrimary];
    const rest = images.filter((_, idx) => idx !== indexToPrimary);
    const updated = [item, ...rest];
    setImages(updated);
    notifyChange(updated);
  };

  // Select a preset from photothèque
  const handleSelectPreset = (url: string) => {
    if (images.includes(url)) {
      handleSetPrimary(images.indexOf(url));
      return;
    }
    if (images.length >= maxImages) {
      // Replace main photo if max reached
      const updated = [url, ...images.slice(1)];
      setImages(updated);
      notifyChange(updated);
    } else {
      const updated = [url, ...images];
      setImages(updated);
      notifyChange(updated);
    }
  };

  // Live Camera stream management
  const startLiveCamera = async (facing: 'environment' | 'user') => {
    setIsLiveCameraOpen(true);
    setErrorMessage(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Live camera stream not available, fallback to native camera input', err);
      setHasCameraSupport(false);
      setIsLiveCameraOpen(false);
      // Fallback directly to native camera input
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      }
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsLiveCameraOpen(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Capture a snapshot from live video element
  const captureLiveSnapshot = () => {
    if (!videoRef.current) return;
    setCameraFlashEffect(true);
    setTimeout(() => setCameraFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front-facing selfie
    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (images.length >= maxImages) {
      const updated = [dataUrl, ...images.slice(1)];
      setImages(updated);
      notifyChange(updated);
    } else {
      const updated = [dataUrl, ...images];
      setImages(updated);
      notifyChange(updated);
    }

    stopLiveCamera();
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Inputs */}
      {/* 1. Native Camera trigger (direct capture for smartphones & tablets) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 2. Standard Gallery / File Picker (supports multiple photos) */}
      <input
        ref={galleryFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>
              {title ||
                tr(
                  language,
                  'Photos du lot / stock',
                  'صور الدفعة / المخزون',
                  'Stock / Lot Photos'
                )}
            </span>
            <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
              {images.length} / {maxImages} {tr(language, 'photos', 'صور', 'photos')}
            </span>
          </label>
          <p className="text-[11px] text-stone-500">
            {subtitle ||
              tr(
                language,
                'Prenez une photo en direct de votre exploitation ou insérez des images depuis votre galerie.',
                'التقط صورة مباشرة من ضيعتك أو أدرج صوراً من معرض جهازك.',
                'Take a live photo from your farm or insert pictures from your device gallery.'
              )}
          </p>
        </div>

        {/* Tab switch between Upload/Camera and Pre-curated photothèque */}
        {allowPresets && (
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('upload_capture')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'upload_capture'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{tr(language, 'Appareil & Galerie', 'الكاميرا والمعرض', 'Camera & Gallery')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'presets'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{tr(language, 'Photothèque certifiée', 'مكتبة الصور المعتمدة', 'Certified Catalog')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-amber-100 rounded-lg text-amber-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODE 1: UPLOAD & CAMERA CAPTURE */}
      {activeTab === 'upload_capture' && (
        <div className="space-y-3">
          {/* Main Action Buttons Grid: 1) Prendre une photo 2) Insérer depuis la galerie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* BOUTON 1 : PRENDRE UNE PHOTO */}
            <button
              id="btn-stock-take-photo"
              type="button"
              onClick={() => {
                // If on mobile or modern browser, launch native camera input
                if (nativeCameraInputRef.current) {
                  nativeCameraInputRef.current.click();
                }
              }}
              disabled={isProcessing || images.length >= maxImages}
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-xs hover:shadow-md transition cursor-pointer border border-emerald-600 group disabled:opacity-50 disabled:cursor-not-allowed"
              title={tr(
                language,
                'Ouvrir l’appareil photo du smartphone pour photographier le lot',
                'فتح كاميرا الهاتف لالتقاط صورة الدفعة',
                'Open device camera to snap a stock photo'
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-white">
                  📸 {tr(language, 'Prendre une photo', 'التقاط صورة بالكاميرا', 'Take a Photo')}
                </span>
                <span className="block text-[10px] text-emerald-100/90 font-medium">
                  {tr(language, 'Déclencheur direct smartphone', 'تصوير مباشر من الضيعة', 'Direct smartphone camera')}
                </span>
              </div>
            </button>

            {/* BOUTON 2 : INSÉRER UNE OU PLUSIEURS PHOTOS */}
            <button
              id="btn-stock-insert-photo"
              type="button"
              onClick={() => {
                if (galleryFileInputRef.current) {
                  galleryFileInputRef.current.click();
                }
              }}
              disabled={isProcessing || images.length >= maxImages}
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-stone-50 active:scale-[0.98] text-stone-800 border-2 border-dashed border-emerald-600/40 hover:border-emerald-600 shadow-xs transition cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              title={tr(
                language,
                'Sélectionner des photos dans la galerie ou vos dossiers',
                'اختيار صور من المعرض أو ملفات الجهاز',
                'Select photos from gallery or files'
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-stone-900 group-hover:text-emerald-800">
                  🖼️ {tr(language, 'Insérer des photos', 'إدراج صور من المعرض', 'Insert from Gallery')}
                </span>
                <span className="block text-[10px] text-stone-500 font-medium">
                  {tr(language, 'Fichiers JPG, PNG ou WEBP', 'ملفات JPG أو PNG أو WEBP', 'JPG, PNG or WEBP files')}
                </span>
              </div>
            </button>
          </div>

          {/* Quick link: In-app live camera viewfinder (for desktop webcam or in-browser shooting) */}
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {tr(
                language,
                'Compression auto haute qualité activée',
                'تفعيل الضغط التلقائي بجودة عالية',
                'Auto high-quality compression enabled'
              )}
            </span>
            <button
              type="button"
              onClick={() => startLiveCamera(cameraFacing)}
              className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{tr(language, 'Viseur caméra en direct', 'معاينة الكاميرا المباشرة', 'Live Camera Viewfinder')}</span>
            </button>
          </div>

          {/* Drag & Drop Visual Zone (shown when empty or for multiple photos) */}
          {images.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => galleryFileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center transition cursor-pointer ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50 scale-[1.01]'
                  : 'border-stone-200 bg-stone-50/70 hover:bg-stone-50 hover:border-emerald-400'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-800">
                {tr(
                  language,
                  'Glissez-déposez vos photos ou cliquez pour parcourir',
                  'اسحب الصور وأفلتها هنا أو انقر للتصفح',
                  'Drag & drop photos or click to browse'
                )}
              </p>
              <p className="text-[10px] text-stone-500 mt-1">
                {tr(
                  language,
                  'Photos de champs, vergers, étiquettes de certification, cheptel...',
                  'صور الحقول، البساتين، شهادات الاعتماد، المواشي...',
                  'Photos of fields, orchards, certification labels, livestock...'
                )}
              </p>
            </div>
          )}

          {/* Photos Display & Thumbnail Grid */}
          {images.length > 0 && (
            <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>
                  {tr(language, 'Photos sélectionnées pour cette offre :', 'الصور المختارة لهذا العرض :', 'Selected photos for this listing:')}
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  {images.length === 1 ? '1 photo' : `${images.length} photos`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {images.map((imgUrl, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl overflow-hidden border-2 transition group ${
                        isPrimary
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm bg-white'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="h-28 w-full bg-stone-100 relative">
                        <img
                          src={imgUrl}
                          alt={`Stock Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=75';
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none">
                          {isPrimary ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-[9px] shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {tr(language, 'Principale', 'الرئيسية', 'Primary')}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white font-medium text-[9px] backdrop-blur-xs">
                              #{idx + 1}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="pointer-events-auto p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition cursor-pointer"
                            title={tr(language, 'Supprimer cette photo', 'حذف هذه الصورة', 'Delete photo')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom Action Strip */}
                        <div className="absolute bottom-1 inset-x-1 flex items-center justify-between gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="px-2 py-0.5 rounded-md bg-white/90 hover:bg-white text-emerald-950 font-bold text-[9px] shadow-xs backdrop-blur-xs transition cursor-pointer flex items-center gap-1 border border-stone-200"
                              title={tr(language, 'Définir comme photo principale', 'تعيين كصورة رئيسية', 'Set as primary')}
                            >
                              <Star className="w-2.5 h-2.5 text-amber-600" />
                              <span>{tr(language, 'Principale', 'رئيسية', 'Main')}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPreviewModalUrl(imgUrl)}
                            className="ml-auto p-1 rounded-md bg-white/90 hover:bg-white text-stone-700 shadow-xs backdrop-blur-xs transition cursor-pointer"
                            title={tr(language, 'Agrandir', 'تكبير', 'Zoom')}
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Photo Slot Button if space left */}
                {images.length < maxImages && (
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="h-28 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white/80 hover:bg-emerald-50/40 flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-bold">
                      + {tr(language, 'Ajouter photo', 'إضافة صورة', 'Add photo')}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      ({maxImages - images.length} {tr(language, 'restantes', 'متبقية', 'left')})
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: PHOTOTHÈQUE AGRICOLE CERTIFIÉE */}
      {allowPresets && activeTab === 'presets' && (
        <div className="space-y-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATALOG_PRESETS.map((cat) => {
              const isSelected = selectedCatalogCategory === cat.category;
              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setSelectedCatalogCategory(cat.category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {language === 'ar' ? cat.labelAr : cat.labelFr}
                </button>
              );
            })}
          </div>

          {/* Preset Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATALOG_PRESETS.find((c) => c.category === selectedCatalogCategory)?.items.map(
              (item, i) => {
                const isAlreadySelected = images.includes(item.url);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(item.url)}
                    className={`group relative text-left rounded-xl p-1.5 border transition-all flex flex-col justify-between overflow-hidden cursor-pointer bg-white ${
                      isAlreadySelected
                        ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                        : 'border-stone-200 hover:border-emerald-500 hover:shadow-xs'
                    }`}
                  >
                    <div className="relative h-20 w-full rounded-lg overflow-hidden bg-stone-100 mb-1.5">
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=75';
                        }}
                      />
                      {isAlreadySelected && (
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block font-bold text-[11px] text-stone-900 leading-tight line-clamp-1">
                        {item.label}
                      </span>
                      {item.sub && (
                        <span className="block text-[9px] text-stone-500 line-clamp-1">
                          {item.sub}
                        </span>
                      )}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: LIVE CAMERA VIEWFINDER */}
      {isLiveCameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-stone-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col relative">
            {/* Top Toolbar */}
            <div className="p-3 bg-stone-900/90 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">
                  {tr(language, 'Appareil photo AgriStock', 'كاميرا أجريستوك المباشرة', 'AgriStock Camera')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title={tr(language, 'Changer de caméra', 'تبديل الكاميرا', 'Switch Camera')}
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title={tr(language, 'Fermer', 'إغلاق', 'Close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Viewfinder Area with Rule-of-Thirds Grid */}
            <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
              />

              {/* Flash animation simulation */}
              {cameraFlashEffect && (
                <div className="absolute inset-0 bg-white pointer-events-none animate-out fade-out duration-200" />
              )}

              {/* Viewfinder Target Framing Guidelines */}
              <div className="absolute inset-4 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[9px] text-white/70 font-mono">
                  <span>HD 1080p</span>
                  <span>MAROC • EXPLOITATION</span>
                </div>
                <div className="self-center px-3 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold backdrop-blur-xs">
                  {tr(language, 'Cadrez votre récolte ou lot', 'ضع المنتوج داخل الإطار', 'Frame your crop or lot')}
                </div>
                <div className="text-[9px] text-white/50 text-right font-mono">ONSSA CERTIFIED</div>
              </div>
            </div>

            {/* Bottom Shutter Controls */}
            <div className="p-4 bg-stone-900 flex items-center justify-around border-t border-white/10">
              <button
                type="button"
                onClick={stopLiveCamera}
                className="px-4 py-2 rounded-xl text-stone-300 hover:text-white text-xs font-bold transition"
              >
                {tr(language, 'Annuler', 'إلغاء', 'Cancel')}
              </button>

              {/* Big Shutter Button */}
              <button
                id="btn-camera-shutter"
                type="button"
                onClick={captureLiveSnapshot}
                className="w-16 h-16 rounded-full bg-white hover:bg-emerald-400 active:scale-90 p-1.5 shadow-2xl transition cursor-pointer flex items-center justify-center border-4 border-stone-800"
                title={tr(language, 'Prendre la photo', 'التقاط الصورة', 'Take snapshot')}
              >
                <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  galleryFileInputRef.current?.click();
                }}
                className="px-3 py-2 rounded-xl text-stone-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{tr(language, 'Galerie', 'المعرض', 'Gallery')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LIGHTBOX ZOOM PREVIEW */}
      {previewModalUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
            <img
              src={previewModalUrl}
              alt="Aperçu Grand Format"
              className="w-full h-full object-contain max-h-[80vh]"
            />
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadCapture;
