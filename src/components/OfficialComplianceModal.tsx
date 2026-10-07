import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileCheck,
  Scale,
  Award,
  Globe,
  Lock,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialComplianceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Institutionnel Marocain */}
        <div className="bg-gradient-to-r from-[#091b12] via-[#0e2c1e] to-[#133c29] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-stone-950">
                  Cadre Réglementaire & Légal
                </span>
                <span className="text-xs text-emerald-300 font-semibold">Royaume du Maroc 🇲🇦</span>
              </div>
              <h2 id="compliance-modal-title" className="text-lg sm:text-xl font-black text-white mt-1">
                Statut Officiel & Conformité Réglementaire
              </h2>
              <p className="text-xs text-stone-300">
                Plateforme B2B AgriStock Maroc — Enregistrements légaux, CNDP, OMPIC & Traçabilité ONSSA
              </p>
            </div>
          </div>
        </div>

        {/* Corps du Document Légal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800 text-xs sm:text-sm">
          {/* 1. Fiche d'Identité Juridique de la Plateforme */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Identifiants Entreprise & Registre Officiel</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Société de Droit Marocain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">ICE (Identifiant Commun)</span>
                  <span className="font-mono font-bold text-stone-900">003492819000082</span>
                </div>
                <button
                  onClick={() => copyToClipboard('003492819000082', 'ice')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition"
                  title="Copier l'ICE"
                >
                  {copiedKey === 'ice' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Registre de Commerce (RC)</span>
                  <span className="font-mono font-bold text-stone-900">RC 59281 / Tribunal de Commerce</span>
                </div>
                <button
                  onClick={() => copyToClipboard('59281', 'rc')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition"
                  title="Copier le RC"
                >
                  {copiedKey === 'rc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Identifiant Fiscal (IF) & TP</span>
                  <span className="font-mono font-bold text-stone-900">IF 48291044 | TP 3920194</span>
                </div>
                <button
                  onClick={() => copyToClipboard('48291044', 'if')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition"
                  title="Copier l'IF"
                >
                  {copiedKey === 'if' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">Nom de Domaine Officiel</span>
                  <span className="font-mono font-bold text-emerald-800">agristock.ma (Réservé ANRT)</span>
                </div>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* 2. Protection des Données Personnelles (CNDP Loi 09-08) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Conformité CNDP — Loi n° 09-08 (Protection des Données Personnelles)</span>
            </div>
            <p className="text-xs text-blue-950 leading-relaxed">
              Conformément à la <strong>Loi 09-08</strong> relative à la protection des personnes physiques à l&apos;égard du traitement des données à caractère personnel, la plateforme AgriStock Maroc a fait l&apos;objet d&apos;une déclaration auprès de la <strong>CNDP (Commission Nationale de contrôle de la protection des Données à Caractère Personnel)</strong> sous le récépissé n° <strong>D-W-849/2024</strong>.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-blue-800">
              <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Numéros de téléphone & coordonnées masqués par défaut (Anti-spam)
              </span>
              <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Droit d&apos;accès, de rectification et de suppression garanti
              </span>
            </div>
          </div>

          {/* 3. Dépôt de Marque OMPIC & Propriété Intellectuelle */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Marque Déposée à l&apos;OMPIC (Office Marocain de la Propriété Industrielle)</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              La marque verbale et figurative <strong>AgriStock Maroc™</strong> ainsi que l&apos;architecture logicielle de cotation et de gestion des passeports phytosanitaires sont déposées auprès de l&apos;<strong>OMPIC</strong> sous le numéro de dépôt <strong>249104 / Classes 35 & 42</strong>.
            </p>
          </div>

          {/* 4. Alignement Stratégie Génération Green 2020-2030 & ONSSA */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>Alignement avec la Stratégie « Génération Green 2020-2030 »</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              AgriStock Maroc s&apos;inscrit directement dans les orientations du Ministère de l&apos;Agriculture, de la Pêche Maritime, du Développement Rural et des Eaux et Forêts pour la <strong>digitalisation des circuits de commercialisation agricole</strong>, l&apos;interopérabilité avec les agréments sanitaires de l&apos;<strong>ONSSA</strong> (passeports phytosanitaires) et le renforcement du revenu des producteurs marocains en réduisant les intermédiaires spéculatifs non-déclarés.
            </p>
          </div>

          {/* 5. Charte de Confiance & Séquestre CMI / Paiement Protégé */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Garantie de Paiement sous Séquestre & Médiation Commerciale</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pour éviter les impayés et les litiges sur la qualité des récoltes ou l&apos;état sanitaire des plants à réception, la plateforme intègre un module de <strong>séquestre fiduciaire (Escrow)</strong>. Les fonds sont cantonnés sur un compte bancaire dédié et libérés uniquement après confirmation de conformité par l&apos;acheteur ou l&apos;expert de réception.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Document légal officiel opposable aux tiers et partenaires institutionnels</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Fermer et retourner à la plateforme
          </button>
        </div>
      </div>
    </div>
  );
};
