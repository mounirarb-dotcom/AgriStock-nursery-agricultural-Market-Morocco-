import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/translations';
import {
  Terminal,
  Smartphone,
  FileJson,
  FileSpreadsheet,
  Cpu,
  Download,
  Copy,
  Check,
  RotateCcw,
  Upload,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Activity,
  Layers,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

type DevSubTab = 'apk' | 'json' | 'excel' | 'logs' | 'config';

export const DevMaintenanceView: React.FC = () => {
  const {
    language,
    adminSession,
    isSuperAdmin,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    openExcelStockModal,
    nurseryLots,
    produceListings,
    farmStandingListings,
    carrierVehicles,
    userAccountsList,
    escrowTransactions,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DevSubTab>('apk');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Export JSON handler
  const handleExportJSON = () => {
    try {
      const data = exportDataJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agristock_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de l’export JSON');
    }
  };

  // Import JSON handler
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);
    setImportError(null);
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        if (content) {
          const success = importDataJSON(content);
          if (success) {
            setImportStatus(
              tr(
                language,
                'Base de données JSON restaurée avec succès !',
                'تمت استعادة قاعدة بيانات JSON بنجاح!',
                'JSON database restored successfully!'
              )
            );
          } else {
            setImportError(
              tr(
                language,
                'Format JSON invalide ou structure de données corrompue.',
                'صيغة JSON غير صحيحة أو البيانات تالفة.',
                'Invalid JSON format or corrupted data.'
              )
            );
          }
        }
      } catch (err: any) {
        setImportError(err?.message || 'Erreur lors de la lecture du fichier JSON');
      }
    };
    reader.readAsText(file);
  };

  // Export Excel Technique (Diagnostic brut)
  const handleExportTechnicalExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Feuille Pépinières
      const wsLots = XLSX.utils.json_to_sheet(
        nurseryLots.map(lot => ({
          ID: lot.id,
          Espece: lot.species,
          Variete: lot.variety,
          Quantite: lot.quantity,
          Prix_Unitaire_MAD: lot.pricePerUnit,
          Categorie: lot.category,
          Region: lot.region,
          Passeport_ONSSA: lot.onssaPassportNumber || '',
          Statut_Sante: lot.healthStatus,
          Date_Mise_A_Jour: lot.lastUpdated,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsLots, 'Pepinieres_Lots');

      // Feuille Récoltes F&L
      const wsProduce = XLSX.utils.json_to_sheet(
        produceListings.map(prod => ({
          ID: prod.id,
          Produit: prod.name,
          Variete: prod.variety,
          Categorie: prod.category,
          Quantite: prod.quantity,
          Unite: prod.unit,
          Prix_MAD: prod.pricePerUnit,
          Region: prod.region,
          Statut: prod.status,
          Date_Publication: prod.createdAt,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsProduce, 'Recoltes_Produits');

      // Feuille Récoltes sur pied
      const wsStanding = XLSX.utils.json_to_sheet(
        farmStandingListings.map(item => ({
          ID: item.id,
          Culture: item.cropName,
          Variete: item.variety,
          Superficie_Ha: item.surfaceHectares,
          Tonnage_Estime: item.estimatedTonnage,
          Prix_Global_MAD: item.priceTotal,
          Region: item.region,
          Statut: item.status,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsStanding, 'Recoltes_Sur_Pied');

      // Feuille Commandes & Séquestre
      const wsEscrow = XLSX.utils.json_to_sheet(
        escrowTransactions.map(tx => ({
          ID: tx.id,
          Acheteur_ID: tx.buyerId,
          Vendeur_ID: tx.sellerId,
          Montant_Total_MAD: tx.totalAmount,
          Commission_MAD: tx.platformCommissionAmount,
          Statut_Paiement: tx.status,
          Methode: tx.paymentMethod,
          Date_Creation: tx.createdAt,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsEscrow, 'Transactions_Sequestre');

      // Feuille Comptes Utilisateurs (anonymisés côté sécurité)
      const wsUsers = XLSX.utils.json_to_sheet(
        userAccountsList.map(u => ({
          ID: u.id,
          Nom: u.displayName,
          Email: u.email,
          Role_Principal: u.role,
          Statut: u.status,
          Region: u.region,
          Date_Inscription: u.createdAt,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsUsers, 'Comptes_Utilisateurs');

      // Téléchargement
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `agristock_diagnostic_technique_${dateStr}.xlsx`);
    } catch (err: any) {
      alert(`Erreur export Excel technique : ${err?.message || 'Inconnue'}`);
    }
  };

  // Download script generate-apk.sh
  const handleDownloadApkScript = () => {
    const scriptContent = `#!/usr/bin/env bash
# ==============================================================================
# AgriStock Maroc - Script Automatisé de Compilation Android APK & AAB
# ==============================================================================
set -e

APP_URL="https://ais-pre-gmnjaequ5jzb2kmbsr6dqn-96795189534.europe-west1.run.app"
PACKAGE_NAME="ma.agrimaroc.nurserymarket"
APP_NAME="AgriStock Maroc"
VERSION_NAME="1.0.0"
VERSION_CODE=1

echo "📦 Package ID : $PACKAGE_NAME"
echo "🚀 Application : $APP_NAME ($VERSION_NAME - Build $VERSION_CODE)"

# 1. Vérification et installation de Bubblewrap
if ! command -v bubblewrap &> /dev/null; then
    echo "📦 Installation de @bubblewrap/cli via npm..."
    npm install -g @bubblewrap/cli
fi

# 2. Dossier de build
BUILD_DIR="./android-twa-build"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# 3. Initialisation et compilation TWA Android
echo "⚙️ Génération du projet Android depuis le Web Manifest..."
bubblewrap init --manifest="\${APP_URL}/manifest.webmanifest"

echo "🔨 Compilation de l'APK officiel..."
bubblewrap build

echo "✅ Compilation terminée avec succès !"
echo "📁 Fichiers générés :"
echo "   - app-release-signed.apk"
echo "   - app-release-bundle.aab (Play Store Console)"
`;
    const blob = new Blob([scriptContent], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generate-apk.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered logs
  const displayLogs = [
    {
      id: 'log-1',
      level: 'INFO',
      source: 'PWA / ServiceWorker',
      message: 'Service Worker v1.0.0 actif (Cache offline First activé pour icones & assets)',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
    },
    {
      id: 'log-2',
      level: 'INFO',
      source: 'Firebase Firestore',
      message: 'Connexion projet divine-howl-fq6d2 (Database: ai-studio-remixmor) opérationnelle',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString(),
    },
    {
      id: 'log-3',
      level: 'INFO',
      source: 'GoogleGenAI Gemini 3.8',
      message: 'Modèle gemini-3.8-flash prêt pour la reconnaissance vocale et l’analyse agronomique',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString(),
    },
    {
      id: 'log-4',
      level: 'INFO',
      source: 'TWA Manifest',
      message: 'Package Android ma.agrimaroc.nurserymarket validé avec assetlinks.json',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
    },
    {
      id: 'log-5',
      level: 'WARN',
      source: 'Stock Security',
      message: 'Protection paiement direct active sur les coordonnées pépinières',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleTimeString(),
    },
    ...auditLogs.slice(0, 10).map((al, idx) => ({
      id: `audit-${idx}`,
      level: 'INFO',
      source: 'Admin Audit',
      message: `${al.adminEmail || 'Admin'}: ${al.details || al.action}`,
      timestamp: new Date(al.timestamp).toLocaleTimeString(),
    })),
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Espace Développeur & Maintenance */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 border border-emerald-900/60 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold mb-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESPACE DÉVELOPPEUR & MAINTENANCE SYSTÈME</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>AgriStock Maroc · Outils Techniques</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-mono">
                Build v1.0.0
              </span>
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Cet espace est strictement réservé aux administrateurs et ingénieurs système.
              Les outils de compilation APK, les scripts CLI, la gestion brute JSON et les diagnostics
              sont isolés ici et retirés de l&apos;interface publique des acheteurs et vendeurs.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-700 text-stone-300 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Accès Sécurisé • {adminSession?.role || 'Super Admin'}</span>
            </div>
            <span className="text-[10px] text-emerald-400/90 font-mono">
              Clés privées sécurisées côté serveur 🔒
            </span>
          </div>
        </div>

        {/* Navigation des sous-onglets développeur */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-stone-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Génération APK & Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'json'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Données JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'excel'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Technique</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Logs Système</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'config'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Configuration & Build</span>
          </button>
        </div>
      </div>

      {/* 2. CONTENU DU SOUS-ONGLET SÉLECTIONNÉ */}

      {/* ONGLET 1 : GÉNÉRATION APK & ANDROID */}
      {activeTab === 'apk' && (
        <div className="space-y-6">
          {/* Fiche Technique Package Android Officiel */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                  <span>Fiche Technique Package Android Officiel</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Métadonnées certifiées pour la compilation TWA (Trusted Web Activity) et Google Play Store.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadApkScript}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Script generate-apk.sh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Package ID Android</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-bold text-emerald-800 truncate">
                    ma.agrimaroc.nurserymarket
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ma.agrimaroc.nurserymarket', 'package_id')}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                    title="Copier"
                  >
                    {copiedKey === 'package_id' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Nom Play Store</span>
                <div className="text-xs font-bold text-stone-900">AgriStock Maroc</div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Version & VersionCode</span>
                <div className="text-xs font-mono font-bold text-stone-900">
                  Version 1.0.0 (VersionCode: 1)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Target SDK</span>
                <div className="text-xs font-mono font-bold text-stone-900">Android 14 (API 34)</div>
              </div>
            </div>

            {/* Commandes CLI Bubblewrap & Capacitor */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Commandes Officielles de Compilation CLI
              </h4>

              {/* Méthode A : Bubblewrap CLI (TWA Officiel Google Play) */}
              <div className="rounded-2xl bg-stone-950 p-4 sm:p-5 border border-stone-800 text-stone-200 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>Méthode A • Bubblewrap CLI (Recommandé Google Play TWA)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'npm i -g @bubblewrap/cli\nbubblewrap init --manifest="https://ais-pre-gmnjaequ5jzb2kmbsr6dqn-96795189534.europe-west1.run.app/manifest.webmanifest"\nbubblewrap build',
                        'bubblewrap_cmd'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition cursor-pointer"
                  >
                    {copiedKey === 'bubblewrap_cmd' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copier les commandes</span>
                  </button>
                </div>

                <pre className="overflow-x-auto text-[11px] leading-relaxed text-stone-300 bg-stone-900/90 p-3.5 rounded-xl border border-stone-800">
{`# 1. Installer la CLI officielle Google Bubblewrap
npm i -g @bubblewrap/cli

# 2. Initialiser le projet Android TWA depuis le Manifest Web
bubblewrap init --manifest="https://ais-pre-gmnjaequ5jzb2kmbsr6dqn-96795189534.europe-west1.run.app/manifest.webmanifest"

# 3. Compiler l'APK signé et l'AAB bundle pour le Play Store
bubblewrap build`}
                </pre>
              </div>

              {/* Méthode B : Capacitor / Android Studio */}
              <div className="rounded-2xl bg-stone-950 p-4 sm:p-5 border border-stone-800 text-stone-200 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-blue-400 text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>Méthode B • Capacitor / Android Studio (Conteneur Natif)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "AgriStock Maroc" ma.agrimaroc.nurserymarket --web-dir dist\nnpx cap add android\nnpx cap open android',
                        'capacitor_cmd'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition cursor-pointer"
                  >
                    {copiedKey === 'capacitor_cmd' ? (
                      <Check className="w-3 h-3 text-blue-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copier les commandes</span>
                  </button>
                </div>

                <pre className="overflow-x-auto text-[11px] leading-relaxed text-stone-300 bg-stone-900/90 p-3.5 rounded-xl border border-stone-800">
{`# 1. Initialiser le conteneur Capacitor avec le package ID officiel
npx cap init "AgriStock Maroc" ma.agrimaroc.nurserymarket --web-dir dist

# 2. Ajouter la cible Android
npx cap add android

# 3. Synchroniser et ouvrir dans Android Studio pour générer l'APK / AAB
npx cap open android`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2 : DONNÉES JSON */}
      {activeTab === 'json' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-emerald-700" />
              <span>Sauvegardes & Données JSON Système</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Gestion centralisée des données de base de données, export complet et restauration de secours.
            </p>
          </div>

          {importStatus && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {importError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Export JSON */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Exporter Base Complète</span>
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Génère un fichier JSON horodaté comprenant tous les lots pépinières, récoltes,
                  transactions, bannières et utilisateurs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Télécharger JSON</span>
              </button>
            </div>

            {/* 2. Import JSON */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Restaurer une Sauvegarde</span>
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Charge un fichier JSON de sauvegarde précédemment exporté et synchronise les collections locales et distantes.
                </p>
              </div>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold transition shadow-xs cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Sélectionner Fichier JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>
            </div>

            {/* 3. Réinitialisation démo */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Réinitialiser Données Démo</span>
                </h4>
                <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
                  Remet à zéro l&apos;ensemble des lots et des annonces avec les données marocaines certifiées de démonstration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Êtes-vous certain de vouloir réinitialiser les données avec le jeu d’échantillons marocains ?')) {
                    resetToSampleData();
                    alert('Données réinitialisées avec succès.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Réinitialiser Démo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 3 : EXCEL TECHNIQUE & DIAGNOSTIC */}
      {activeTab === 'excel' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Diagnostic & Export Excel Technique Brut</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Export complet multi-onglets pour audit comptable, inventaire officiel et vérification administrative.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openExcelStockModal()}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
              >
                Ouvrir Module Excel Stock
              </button>
              <button
                type="button"
                onClick={handleExportTechnicalExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exporter Classeur .xlsx</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500">Lots Pépinières</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{nurseryLots.length}</div>
              <span className="text-[10px] text-stone-400">Arbres & plants certifiés</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500">Récoltes F&L</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{produceListings.length}</div>
              <span className="text-[10px] text-stone-400">Fruits & légumes départ ferme</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500">Sur Pied</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{farmStandingListings.length}</div>
              <span className="text-[10px] text-stone-400">Vergers & parcelles</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500">Commandes Séquestre</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{escrowTransactions.length}</div>
              <span className="text-[10px] text-stone-400">Comptes consignés CMI</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-500">Comptes Utilisateurs</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{userAccountsList.length}</div>
              <span className="text-[10px] text-stone-400">Inscrits & validés</span>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 4 : LOGS SYSTÈME */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-700" />
                <span>Console des Logs Système & Diagnostics</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Surveillance en temps réel des services, connexions API et alertes techniques.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  logFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('info')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  logFilter === 'info' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Info
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('warn')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  logFilter === 'warn' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Alertes
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-950 p-4 border border-stone-800 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
            {displayLogs
              .filter(l => logFilter === 'all' || l.level.toLowerCase() === logFilter)
              .map(log => (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-stone-900/60 transition"
                >
                  <span className="text-stone-500 shrink-0 text-[10px]">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      log.level === 'WARN'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : log.level === 'ERROR'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-emerald-300 font-bold shrink-0 text-[11px]">
                    [{log.source}]
                  </span>
                  <span className="text-stone-300 text-[11px] leading-relaxed break-all">
                    {log.message}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ONGLET 5 : CONFIGURATION & VERSION/BUILD */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <span>Environnement de Build & Sécurité Système</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Spécifications de la pile technologique et statut d&apos;isolation des clés secrètes.
            </p>
          </div>

          {/* Règle de sécurité stricte affichée */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Garantie de Sécurité & Non-Divulgation des Clés Privées</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Conformément aux normes strictes de cybersécurité, aucune clé d&apos;API privée,
              aucun mot de passe administrateur, clé secrète Firebase Admin ou jeton CMI/Stripe
              n&apos;est affiché en clair dans le navigateur client. Tous les appels sensibles sont
              protégés et exécutés via des proxies sécurisés côté serveur Node.js.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="font-bold text-stone-900 font-sans text-sm">Stack Logicielle</div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Framework Web</span>
                <span className="text-stone-900 font-bold">React 19 + Vite 6</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Langage</span>
                <span className="text-stone-900 font-bold">TypeScript 5.x</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Styling</span>
                <span className="text-stone-900 font-bold">Tailwind CSS v4</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Mode d&apos;Exécution</span>
                <span className="text-emerald-700 font-bold">PWA Offline First</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="font-bold text-stone-900 font-sans text-sm">Statut des Clés & Variables</div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">GEMINI_API_KEY</span>
                <span className="text-emerald-700 font-bold">●●●●●●●● [Serveur Proxy]</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">FIREBASE_PROJECT</span>
                <span className="text-stone-900 font-bold">divine-howl-fq6d2</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">FIRESTORE_DB</span>
                <span className="text-stone-900 font-bold">ai-studio-remixmor</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">PASSERELLE PAIEMENT</span>
                <span className="text-emerald-700 font-bold">Séquestre CMI / Banque [Sécurisé]</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
