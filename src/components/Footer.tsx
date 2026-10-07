import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  ShieldCheck,
  Truck,
  Sprout,
  Store,
  FileCheck,
  TrendingUp,
  MapPin,
  Mail,
  CheckCircle2,
  Lock,
  ExternalLink,
  Phone,
  HelpCircle,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    language,
    setActiveTab,
    setIsOfficialComplianceModalOpen,
    openUserManual,
    setIsAdminLoginModalOpen,
    isAdminAuthenticated,
  } = useApp();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-[#07170e] text-stone-300 border-t border-[#163825] text-xs">
      {/* Bandeau de réassurance supérieure */}
      <div className="border-b border-[#163825] bg-[#091e13]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {tr(language, 'Séquestre CMI Garanti', 'أداء مؤمن عبر الحساب الوسيط', 'Guaranteed CMI Escrow')}
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {tr(
                    language,
                    'Les fonds de l’acheteur sont consignés jusqu’à livraison conforme constatée.',
                    'حجز أموال الشحنة حتى استلام وتأكيد مطابقة السلعة.',
                    'Buyer funds securely held until verified delivery.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {tr(language, 'Pépinières Homologuées ONSSA', 'مشاتل معتمدة من أونسا', 'ONSSA Certified Nurseries')}
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {tr(
                    language,
                    'Passeports phytosanitaires officiels et contrôle de conformité variétale.',
                    'جوازات صحية نباتية معتمدة ومطابقة رسمية للأصناف.',
                    'Official phytosanitary passports and varietal compliance.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {tr(language, 'Logistique Frigo TIR', 'نقل مبرد فلاحي TIR', 'Reefer TIR Freight')}
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {tr(
                    language,
                    'Camions frigorifiques et plateaux géolocalisés à température dirigée.',
                    'شاحنات مبردة مجهزة بمحدد المواقع والحفاظ على سلسلة التبريد.',
                    'GPS-tracked temperature-controlled trucks across Morocco.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {tr(language, 'Conformité Export Foodex', 'مطابقة التصدير الغذائي', 'Export Foodex / BADR')}
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {tr(
                    language,
                    'Édition directe des manifestes douaniers et certificats d’agrément station.',
                    'إعداد مباشر لبيانات الشحن الجمركي وشهادات محطات التلفيف.',
                    'Direct export manifest generation and station certifications.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal du footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Colonne 1 : Identité & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                🌱
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight block">
                  AgriStock Maroc
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block">
                  Bourse Agricole & Marché Pépinières B2B
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {tr(
                language,
                'La plateforme marocaine de référence pour le commerce de gros agricole, la certification des plants d’arboriculture et de maraîchage, et la sécurisation des règlements inter-entreprises.',
                'المنصة المغربية المرجعية لتجارة الجملة الفلاحية، واعتماد شتلات الأشجار والخضار، وتأمين المعاملات المالية بين المهنيين.',
                'Morocco’s leading B2B agricultural trade exchange for certified nursery lots, fresh wholesale crops, and guaranteed secured transactions.'
              )}
            </p>

            {/* Newsletter B2B */}
            <div className="pt-2">
              <h5 className="font-bold text-white text-xs mb-2">
                {tr(language, 'Indice des prix agricoles hebdomadaire', 'النشرة الأسبوعية للأسعار الفلاحية', 'Weekly Agri Price Index Alert')}
              </h5>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="votre.email@coop.ma"
                  required
                  className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-xs focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {tr(language, 'S’inscrire', 'اشتراك', 'Subscribe')}
                </button>
              </form>
              {newsletterSubscribed && (
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{tr(language, 'Merci ! Vous recevrez la prochaine mercuriale.', 'شكراً! تم تسجيل اشتراككم بنجاح.', 'Subscribed successfully!')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Colonne 2 : Filières Agricoles */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {tr(language, 'Filières Marchés', 'الأسواق والمنتجات', 'Market Sectors')}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('market')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Fruits & Agrumes (Tonnes)', 'الحوامض والفواكه', 'Fruits & Citrus')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('market')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Légumes & Maraîchage', 'الخضر والمحاصيل', 'Vegetables')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('nursery')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Plants de Pépinières ONSSA', 'شتائل المشاتل المعتمدة', 'ONSSA Nursery Plants')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('farm_standing')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Ventes sur pied (Hectares)', 'محاصيل على رؤوس أشجارها', 'Standing Crop Auctions')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('market')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Élevage & Cheptel Ovin/Bovin', 'المواشي والأغنام والأبقار', 'Livestock & Cattle')}
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Outils Professionnels */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {tr(language, 'Outils & Services Pro', 'أدوات وخدمات مهنية', 'Pro Tools')}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('wholesale')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Mercuriale Prix de Gros (MAD)', 'أسعار أسواق الجملة الرسمية', 'Wholesale Market Prices')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('carrier_space')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Bourse de Fret Agricole TIR', 'بورصة النقل الفلاحي', 'Agricultural Freight Exchange')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsOfficialComplianceModalOpen(true)}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Conformité & Agréments ONSSA', 'مطابقة شروط أونسا', 'ONSSA Official Compliance')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openUserManual()}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Guide Utilisateur & Manuel Pro', 'دليل الاستخدام للمهنيين', 'User Manual & Pro Guide')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  {tr(language, 'Annuaire B2B Agricole Maroc', 'دليل الفاعلين الفلاحيين', 'Morocco B2B Agro Directory')}
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Régions & Territoires */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {tr(language, 'Bassins de Production', 'المناطق والجهات الفلاحية', 'Agricultural Regions')}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Souss-Massa (Biougra, Taroudant)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>L’Oriental (Berkane, Moulouya)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Gharb - Loukkos (Larache, Kénitra)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Marrakech - Safi (Haouz, Kelaâ)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Fès - Meknès (Saïss, El Hajeb)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Drâa - Tafilalet (Zagora, Ouarzazate)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barre de copyright et conformité légale */}
      <div className="border-t border-[#133020] bg-[#05110a] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <div>
            © 2026 AgriStock Maroc · Plateforme B2B d’échanges agricoles et pépinières certifiées. Tous droits réservés.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Lock className="w-3 h-3" />
              <span>Conforme CNDP Loi 09-08</span>
            </span>
            <span className="text-stone-600">·</span>
            <button
              type="button"
              onClick={() => openUserManual('confidentialite')}
              className="hover:text-white transition cursor-pointer"
            >
              Politique de Confidentialité
            </button>
            <span className="text-stone-600">·</span>
            <button
              type="button"
              onClick={() => openUserManual('cgu')}
              className="hover:text-white transition cursor-pointer"
            >
              Conditions Générales B2B
            </button>
            <span className="text-stone-600">·</span>
            <button
              type="button"
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveTab('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className="hover:text-stone-300 text-stone-600 transition cursor-pointer text-[10px]"
            >
              {isAdminAuthenticated ? 'Console Admin' : 'Portail Maintenance'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
