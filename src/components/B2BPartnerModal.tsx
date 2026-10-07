import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  Sparkles,
  Building2,
  Mail,
  Phone,
  X,
  Target,
  Users,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const B2BPartnerModal: React.FC = () => {
  const { isB2BPartnerModalOpen, setIsB2BPartnerModalOpen } = useApp();
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('Engrais & Biostimulants');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isB2BPartnerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setIsB2BPartnerModalOpen(false);
    }, 2000);
  };

  return (
    <div
      id="b2b-partner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="b2b-partner-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Espace Annonceurs & Fournisseurs Agricoles (B2B)</span>
              </h3>
              <p className="text-xs text-stone-300">
                Touchez directement plus de 8 500 agriculteurs, pépiniéristes et coopératives au Maroc
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsB2BPartnerModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">
              Demande de partenariat transmise avec succès !
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Notre équipe régie publicitaire B2B prendra contact avec vous dans les 24h ouvrées pour vous transmettre le média-kit et les options d'encarts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {/* Reach stats */}
            <div className="grid grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-center">
              <div>
                <span className="text-lg font-black text-stone-900 block">8 500+</span>
                <span className="text-[11px] text-stone-500">Agriculteurs actifs / mois</span>
              </div>
              <div>
                <span className="text-lg font-black text-emerald-800 block">100% B2B</span>
                <span className="text-[11px] text-stone-500">Audience agricole ciblée</span>
              </div>
              <div>
                <span className="text-lg font-black text-amber-700 block">4.8%</span>
                <span className="text-[11px] text-stone-500">Taux de clic moyen (CTR)</span>
              </div>
            </div>

            {/* Sponsorship Packages */}
            <div className="space-y-2">
              <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                Nos formats publicitaires & sponsoring :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
                <div className="p-3 rounded-lg border border-stone-200 bg-white">
                  <span className="font-bold text-stone-900 block mb-1">
                    Bannière Thématique Native (Header / Feed)
                  </span>
                  <p className="text-[11px] text-stone-500">
                    Affichage exclusif dans le rayon de votre secteur (ex: Engrais dans Maraîchage, Serres dans Pépinière).
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-stone-200 bg-white">
                  <span className="font-bold text-stone-900 block mb-1">
                    Campagne WhatsApp & Notification Push
                  </span>
                  <p className="text-[11px] text-stone-500">
                    Diffusion d'offres promotionnelles saisonnières ou lancements de nouveaux intrants certifiés ONSSA.
                  </p>
                </div>
              </div>
            </div>

            {/* Form inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Nom de votre entreprise / marque *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ex: Maghreb Fertigation Solutions"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Secteur d'activité *
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 bg-white"
                  >
                    <option value="Engrais & Biostimulants">Engrais & Biostimulants</option>
                    <option value="Irrigation & Goutte-à-goutte">Irrigation & Goutte-à-goutte</option>
                    <option value="Serres & Filets">Serres, Plasticulture & Filets</option>
                    <option value="Analyses & Laboratoire">Analyses de sols & Labo ONSSA</option>
                    <option value="Tracteurs & Machinisme">Tracteurs & Machinisme agricole</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Téléphone / WhatsApp contact *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 5..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partenariats@entreprise.ma"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800"
                  required
                />
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsB2BPartnerModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-sm"
              >
                Recevoir le Kit Annonceur & Tarifs
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
