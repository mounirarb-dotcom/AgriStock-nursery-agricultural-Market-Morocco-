import React from 'react';
import {
  FileJson,
  X,
  FileSpreadsheet,
  BookOpen,
  ShieldCheck,
  DownloadCloud,
  RotateCcw,
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { tr } from '../../utils/translations';

interface NavbarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  importStatus: string | null;
  openExcelStockModal: () => void;
  openUserManual: () => void;
  isSuperAdmin: boolean;
  handleExport: () => void;
  handleImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetToSampleData: () => void;
}

export const NavbarSettingsModal: React.FC<NavbarSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  importStatus,
  openExcelStockModal,
  openUserManual,
  isSuperAdmin,
  handleExport,
  handleImportFile,
  resetToSampleData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FileJson className="w-5 h-5 text-emerald-600" />
            {tr(
              language,
              "Sauvegarde & Données de l'Application",
              'النسخ الاحتياطي وبيانات المنصة',
              'Backup & Application Data'
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-stone-600 leading-relaxed">
          {tr(
            language,
            'Les données de stock de pépinières et les annonces de fruits & légumes sont synchronisées en local dans votre navigateur (PWA offline first). Vous pouvez exporter vos données ou restaurer une sauvegarde.',
            'بيانات المشاتل وعروض الخضر والفواكه مخزنة محلياً على متصفحك (PWA دون انقطاع). يمكنك تصدير بياناتك أو استعادتها.',
            'Nursery stock data and fruit & vegetable listings are synchronized locally in your browser (offline-first PWA). You can export your data or restore a backup.'
          )}
        </p>

        {importStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            {importStatus}
          </div>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              openExcelStockModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            {tr(
              language,
              'Bases de Données Excel Stock (.xlsx)',
              'قواعد بيانات المخزون إكسيل (.xlsx)',
              'Excel Stock Databases (.xlsx)'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              openUserManual();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            {tr(
              language,
              "Consulter ou Télécharger le Manuel d'Utilisation",
              'الاطلاع على دليل الاستعمال أو تحميله',
              'View or Download the User Manual'
            )}
          </button>

          {/* SECTION EXCLUSIVE SUPER ADMIN */}
          {isSuperAdmin && (
            <div className="pt-3 border-t border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                  {tr(
                    language,
                    'Supervision & Sauvegarde Système',
                    'الإشراف والنسخ الاحتياطي للنظام',
                    'System Supervision & Backup'
                  )}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                  SUPER ADMIN
                </span>
              </div>

              <button
                id="btn-superadmin-export-json"
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                title={tr(
                  language,
                  'Exporter la base de données globale en JSON (Réservé Super Admin)',
                  'تصدير قاعدة البيانات الشاملة إلى JSON (خاص بالمشرف العام)',
                  'Export global database as JSON (Super Admin only)'
                )}
              >
                <DownloadCloud className="w-4 h-4 text-amber-400" />
                {tr(
                  language,
                  'Exporter données JSON (Super Admin)',
                  'تصدير البيانات إلى ملف JSON (المشرف العام)',
                  'Export data as JSON (Super Admin)'
                )}
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold transition cursor-pointer">
                <FileJson className="w-4 h-4 text-emerald-600" />
                {tr(
                  language,
                  'Importer une sauvegarde JSON',
                  'استيراد نسخة احتياطية JSON',
                  'Import JSON backup'
                )}
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      tr(
                        language,
                        'Voulez-vous réinitialiser avec les données agricoles de démonstration au Maroc ?',
                        'هل تريد إعادة التعيين مع البيانات التجريبية للمغرب؟',
                        'Reset with Morocco sample demo data?'
                      )
                    )
                  ) {
                    resetToSampleData();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {tr(
                  language,
                  "Réinitialiser avec les données d'exemple Maroc",
                  'إعادة التعيين مع بيانات نموذجية للمغرب',
                  'Reset with Moroccan demo sample data'
                )}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
        >
          {tr(language, 'Fermer', 'إغلاق', 'Close')}
        </button>
      </div>
    </div>
  );
};
