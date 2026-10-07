import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExcelStockService, ExcelStockType, ParseResult } from '../services/ExcelStockService';
import { tr } from '../utils/translations';

interface ExcelStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ExcelStockType;
}

export const ExcelStockModal: React.FC<ExcelStockModalProps> = ({
  isOpen,
  onClose,
  initialType = 'produce',
}) => {
  const {
    language,
    userProfile,
    canManageNursery,
    canManageCarrier,
    nurseryLots,
    produceListings,
    farmStandingListings,
    carrierVehicles,
    bulkAddNurseryLots,
    bulkAddProduceListings,
    bulkAddFarmStandingListings,
    bulkAddCarrierVehicles,
    setActiveTab,
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'template' | 'export' | 'import'>('import');
  const [selectedStockType, setSelectedStockType] = useState<ExcelStockType>(() => {
    if (initialType) return initialType;
    if (canManageNursery) return 'nursery';
    if (canManageCarrier) return 'carrier';
    if (userProfile.role === 'buyer') return 'buyer';
    return 'produce';
  });

  // State for file upload & parsing
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult<any> | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentColumns = ExcelStockService.getColumns(selectedStockType);

  const getStockCount = (type: ExcelStockType): number => {
    switch (type) {
      case 'nursery_ornamental':
        return nurseryLots.filter(l => l.category?.includes('Ornement') || !!l.ornamentalDetails).length;
      case 'nursery':
        return nurseryLots.filter(l => !l.category?.includes('Ornement') && !l.ornamentalDetails).length;
      case 'produce':
        return produceListings.length;
      case 'farm_standing':
        return farmStandingListings.length;
      case 'carrier':
        return carrierVehicles.length;
      default:
        return 0;
    }
  };

  const getLiveStockItems = (type: ExcelStockType): any[] => {
    switch (type) {
      case 'nursery_ornamental':
        return nurseryLots.filter(l => l.category?.includes('Ornement') || !!l.ornamentalDetails);
      case 'nursery':
        return nurseryLots.filter(l => !l.category?.includes('Ornement') && !l.ornamentalDetails);
      case 'produce':
        return produceListings;
      case 'farm_standing':
        return farmStandingListings;
      case 'carrier':
        return carrierVehicles;
      default:
        return [];
    }
  };

  const handleDownloadTemplate = (withSampleData: boolean) => {
    try {
      ExcelStockService.downloadTemplate(selectedStockType, withSampleData);
    } catch (e: any) {
      alert(`Erreur lors du téléchargement : ${e.message}`);
    }
  };

  const handleExportLiveStock = () => {
    try {
      const items = getLiveStockItems(selectedStockType);
      if (items.length === 0) {
        alert("Aucun lot actuellement dans cette base de données à exporter.");
        return;
      }
      ExcelStockService.exportCurrentStock(selectedStockType, items);
    } catch (e: any) {
      alert(`Erreur d'exportation : ${e.message}`);
    }
  };

  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setImportSuccessMessage(null);
    setImportErrorMessage(null);
    setParseResult(null);

    try {
      const result = await ExcelStockService.parseUploadedFile(file, selectedStockType);
      setParseResult(result);
    } catch (err: any) {
      setImportErrorMessage(err.message || "Erreur lors du traitement du fichier Excel.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleCommitImport = () => {
    if (!parseResult || parseResult.items.length === 0) return;

    try {
      let count = 0;
      if (selectedStockType === 'nursery' || selectedStockType === 'nursery_ornamental') {
        count = bulkAddNurseryLots(parseResult.items);
      } else if (selectedStockType === 'produce' || selectedStockType === 'buyer') {
        count = bulkAddProduceListings(parseResult.items);
      } else if (selectedStockType === 'farm_standing') {
        count = bulkAddFarmStandingListings(parseResult.items);
      } else if (selectedStockType === 'carrier') {
        count = bulkAddCarrierVehicles(parseResult.items);
      }

      setImportSuccessMessage(`🎉 Succès : ${count} lots ont été insérés avec succès dans votre stock AgriStock !`);
      setParseResult(null);
    } catch (e: any) {
      setImportErrorMessage(`Erreur lors de l'enregistrement : ${e.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">
                  Bases de Données Excel & Import en Lot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  XLSX / CSV
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Générez des modèles avec variables dédiées, téléchargez vos stocks ou insérez des dizaines de lots en 1 clic.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Role / Type Selector */}
        <div className="px-6 py-3 bg-stone-100/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-700">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Base de données ciblée :</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { type: 'nursery_ornamental', label: '🌸 Pépinière Ornementale & Paysage', badge: `${getStockCount('nursery_ornamental')} lots` },
              { type: 'nursery', label: '🌱 Pépinière Arboriculture & Fruitiers', badge: `${getStockCount('nursery')} lots` },
              { type: 'produce', label: '🍅 Récoltes & Maraîchage', badge: `${getStockCount('produce')} lots` },
              { type: 'farm_standing', label: '🌳 Vergers sur Pied (Ha)', badge: `${getStockCount('farm_standing')} ha` },
              { type: 'carrier', label: '🚛 Logistique & Flotte', badge: `${getStockCount('carrier')} camions` },
            ].map(item => {
              const isSelected = selectedStockType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    setSelectedStockType(item.type as ExcelStockType);
                    setParseResult(null);
                    setImportSuccessMessage(null);
                    setImportErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm font-bold ring-2 ring-emerald-600/30'
                      : 'bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-300'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs (Import en Masse, Télécharger Modèle, Exporter Stock) */}
        <div className="px-6 border-b border-stone-200 bg-white flex space-x-6 text-sm font-semibold shrink-0">
          <button
            onClick={() => setActiveTabState('import')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Importer des Lots en Masse (Bulk Import)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Rapide
            </span>
          </button>

          <button
            onClick={() => setActiveTabState('template')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'template'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>2. Modèles Excel Vierge & Variables Dédiées</span>
          </button>

          <button
            onClick={() => setActiveTabState('export')}
            className={`py-3.5 border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>3. Exporter l'Inventaire Actuel (.xlsx)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50">
          {/* ======================================================== */}
          {/* TAB 1: IMPORTER DES LOTS EN MASSE                         */}
          {/* ======================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Success notification banner */}
              {importSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-start space-x-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{importSuccessMessage}</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Les nouveaux lots sont visibles immédiatement dans l'application avec leur traçabilité et leurs paramètres financiers.
                    </p>
                    <div className="mt-3 flex items-center space-x-3">
                      <button
                        onClick={() => {
                          onClose();
                          if (selectedStockType === 'nursery' || selectedStockType === 'nursery_ornamental') setActiveTab('nursery');
                          else if (selectedStockType === 'farm_standing') setActiveTab('farm_standing');
                          else if (selectedStockType === 'carrier') setActiveTab('carrier_space');
                          else setActiveTab('market');
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
                      >
                        <span>Voir les stocks enregistrés</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error notification banner */}
              {importErrorMessage && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-start space-x-3 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Erreur d'importation</p>
                    <p className="text-xs text-red-700 mt-1">{importErrorMessage}</p>
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              {!parseResult && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-stone-200 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {selectedStockType === 'nursery_ornamental' ? '🌸' : selectedStockType === 'nursery' ? '🌱' : '📁'}
                    </span>
                    <div>
                      <span className="text-stone-500">Modèle et colonnes attendues pour l'import :</span>{' '}
                      <strong className="text-stone-900 font-bold">{ExcelStockService.getTitle(selectedStockType)}</strong>
                    </div>
                  </div>
                  {(selectedStockType === 'nursery_ornamental' || selectedStockType === 'nursery') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStockType(selectedStockType === 'nursery_ornamental' ? 'nursery' : 'nursery_ornamental');
                        setParseResult(null);
                        setImportSuccessMessage(null);
                        setImportErrorMessage(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px] transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Passer à</span>
                      <span className="font-bold text-emerald-800">
                        {selectedStockType === 'nursery_ornamental' ? '🌱 Arboriculture (Fruitiers)' : '🌸 Pépinière Ornementale'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {!parseResult && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                      : 'border-stone-300 hover:border-emerald-400 bg-white hover:bg-stone-50/80 shadow-sm'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
                    {isParsing ? (
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>

                  <h4 className="text-base font-bold text-stone-900">
                    {isParsing
                      ? 'Analyse du fichier Excel en cours...'
                      : 'Glissez-déposez votre fichier Excel (.xlsx, .xls ou .csv) ici'}
                  </h4>

                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    Ou cliquez pour parcourir vos fichiers sur votre ordinateur ou téléphone. Compatible avec Excel, Google Sheets et LibreOffice.
                  </p>

                  <div className="mt-4 flex items-center justify-center space-x-3 text-[11px] text-stone-500">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Validation automatique des colonnes</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Insertion immédiate multi-lots</span>
                    </span>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      Sélectionner un fichier Excel
                    </button>
                  </div>
                </div>
              )}

              {/* Preview of Parsed Data */}
              {parseResult && (
                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        {parseResult.validCount}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">
                          {parseResult.validCount} lot(s) détecté(s) prêt(s) à être inséré(s)
                        </h4>
                        <p className="text-xs text-stone-500">
                          Total lignes analysées : {parseResult.totalRows} • Erreurs : {parseResult.errorCount} • Avertissements : {parseResult.warnings.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setParseResult(null)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-medium"
                      >
                        Annuler / Choisir un autre fichier
                      </button>
                      <button
                        onClick={handleCommitImport}
                        className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmer l'insertion ({parseResult.validCount} lots)</span>
                      </button>
                    </div>
                  </div>

                  {/* Warnings & Errors summary */}
                  {parseResult.warnings.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Avertissements de formatage corrigés automatiquement :</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800">
                        {parseResult.warnings.slice(0, 4).map((w, idx) => (
                          <li key={idx}>
                            Ligne {w.row} {w.column ? `(${w.column})` : ''} : {w.message}
                          </li>
                        ))}
                        {parseResult.warnings.length > 4 && (
                          <li>... et {parseResult.warnings.length - 4} autres avertissements ajustés.</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Table Preview */}
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-stone-100 text-stone-700 sticky top-0 font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5">#</th>
                            {currentColumns.slice(0, 6).map(col => (
                              <th key={col.key} className="p-2.5 whitespace-nowrap">
                                {col.header}
                              </th>
                            ))}
                            <th className="p-2.5">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {parseResult.items.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-50">
                              <td className="p-2.5 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                              {currentColumns.slice(0, 6).map(col => (
                                <td key={col.key} className="p-2.5 text-stone-800 whitespace-nowrap">
                                  {row[col.key] !== undefined ? String(row[col.key]) : '-'}
                                </td>
                              ))}
                              <td className="p-2.5">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Valide</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Helper Quick Tip */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start space-x-3 text-xs text-stone-700">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 font-bold block mb-0.5">
                    Conseil pour une importation sans erreur :
                  </strong>
                  Téléchargez d'abord le modèle officiel dans l'onglet <strong>"2. Modèles Excel Vierge"</strong>.
                  Il contient déjà les colonnes exactes, les formats attendus et la feuille d'instructions avec toutes les régions marocaines et catégories ONSSA.
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MODÈLES EXCEL VIERGE & EXEMPLES                   */}
          {/* ======================================================== */}
          {activeTab === 'template' && (
            <div className="space-y-6">
              {/* Card download triggers */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                      Modèle Officiel AgriStock
                    </span>
                    <h4 className="text-base font-black text-stone-900">
                      {ExcelStockService.getTitle(selectedStockType)}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-500 max-w-xl">
                    Le classeur contient 2 onglets : la feuille <strong>"Stocks_Lots"</strong> prête pour la saisie et la feuille <strong>"Guide_Des_Variables"</strong> détaillant chaque colonne, son caractère obligatoire et les formats acceptés.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleDownloadTemplate(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Modèle Vierge (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTemplate(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Télécharger avec Exemples Réels (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Distinction Pépinière Ornementale vs Arboriculture */}
              {(selectedStockType === 'nursery_ornamental' || selectedStockType === 'nursery') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-amber-50/50 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl mt-0.5 shrink-0">
                      {selectedStockType === 'nursery_ornamental' ? '🌸' : '🌱'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-stone-900">
                          {selectedStockType === 'nursery_ornamental'
                            ? 'Pépinière Ornementale & Paysagère : Variables Adaptées'
                            : 'Pépinière Arboriculture & Fruitiers : Variables Adaptées'}
                        </h5>
                        <span className="px-2 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-md bg-white border border-emerald-300 text-emerald-800 shadow-2xs">
                          {selectedStockType === 'nursery_ornamental' ? 'Critères Paysagers (Sans porte-greffe)' : 'Arbres Fruitiers (Porte-greffes & Greffage)'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
                        {selectedStockType === 'nursery_ornamental' ? (
                          <>
                            <strong>Variables horticoles spécifiques :</strong> Hauteur de la plante (cm/m), Silhouette/Port (Arbre tige, cépée, touffe, topiaire), Calibre circonférence tronc tige (8/10, 10/12...), Stipe palmier, Litrage conteneur (C3, C10, C70, motte...), Période & couleur floraison, Exposition et Tolérance sécheresse/xérophyte. <em>Aucun champ porte-greffe ni greffage requis.</em>
                          </>
                        ) : (
                          <>
                            <strong>Variables arboricoles fruitières :</strong> Sujet / Porte-greffe (Carrizo, Volkameriana, M9, Franc...), Mode de greffage (écussonnage, fente...), Date de semis/greffage, Stade scion d'un an / 2 ans, et Certification Passeport ONSSA Catégorie Bleue.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStockType(
                        selectedStockType === 'nursery_ornamental' ? 'nursery' : 'nursery_ornamental'
                      );
                      setParseResult(null);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold shrink-0 shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer hover:border-emerald-400"
                  >
                    <span>Voir le modèle</span>
                    <span className="text-emerald-700 font-bold">
                      {selectedStockType === 'nursery_ornamental'
                        ? '🌱 Arboriculture Fruitière'
                        : '🌸 Pépinière Ornementale'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              )}

              {/* Table of Columns / Variables for this Stock Type */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
                  <h5 className="text-xs font-bold text-stone-800 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Variables et colonnes reconnues pour : {ExcelStockService.getTitle(selectedStockType)}</span>
                  </h5>
                  <span className="text-[11px] text-stone-500">
                    {currentColumns.length} colonnes configurées
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">Colonne Excel</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Exemple</th>
                        <th className="p-3">Description & Valeurs valides</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {currentColumns.map(col => (
                        <tr key={col.key} className="hover:bg-stone-50/70">
                          <td className="p-3 font-semibold text-stone-900 whitespace-nowrap">
                            {col.header}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {col.required ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Obligatoire
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600">
                                Optionnel
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-stone-600">{col.type}</td>
                          <td className="p-3 font-mono text-[11px] text-emerald-800 whitespace-nowrap">
                            {String(col.example)}
                          </td>
                          <td className="p-3 text-stone-600 max-w-xs">
                            <p>{col.description}</p>
                            {col.allowedValues && (
                              <p className="text-[10px] text-stone-500 mt-1">
                                Choix : {col.allowedValues.slice(0, 3).join(', ')}...
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: EXPORTER L'INVENTAIRE ACTUEL                      */}
          {/* ======================================================== */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                      Sauvegarde & Comptabilité
                    </span>
                    <h4 className="text-base font-black text-stone-900">
                      Export instantané de votre stock actuel
                    </h4>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 max-w-lg">
                    Générez un classeur Excel complet de tous les lots actuellement enregistrés dans votre base, avec leurs prix, quantités, certificats ONSSA et historiques.
                  </p>
                </div>

                <button
                  onClick={handleExportLiveStock}
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center space-x-2 shrink-0 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'inventaire en .xlsx ({getStockCount(selectedStockType)} lots)</span>
                </button>
              </div>

              {/* Quick stats of the selected database */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-xs">Total lots enregistrés</span>
                  <span className="text-2xl font-black text-stone-900">
                    {getStockCount(selectedStockType)}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-xs">Format d'export</span>
                  <span className="text-base font-bold text-emerald-800">
                    Microsoft Excel (.xlsx)
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-xs">Conformité</span>
                  <span className="text-base font-bold text-stone-800">
                    100% Compatible réimport
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sécurisation & vérification des formats au standard agricole marocain</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelStockModal;
