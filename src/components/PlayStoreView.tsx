import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { AppLogoIcon } from './AppLogo';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Check,
  Sprout,
  Store,
  Truck,
  Lock,
  Mail,
  HelpCircle,
  FileText,
  Scale,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const PlayStoreView: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language, openUserManual, setIsOfficialComplianceModalOpen } = useApp();
  const [supportMessageSent, setSupportMessageSent] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supportMessage.trim()) {
      setSupportMessageSent(true);
      setSupportSubject('');
      setSupportMessage('');
      setTimeout(() => setSupportMessageSent(false), 6000);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 1. Hero : Présentation de l'Application & Version */}
      <div className="bg-gradient-to-r from-[#07190f] via-[#0d2719] to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr(language, 'Application Mobile Officielle • Version 1.0.0', 'التطبيق الرسمي المعتمد • الإصدار 1.0.0', 'Official Mobile App • Version 1.0.0')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {tr(
              language,
              'À propos d\'AgriStock Maroc & Application Mobile',
              'حول منصة AgriStock المغرب وتطبيق الهاتف',
              'About AgriStock Morocco & Mobile App'
            )}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
            {tr(
              language,
              'AgriStock Maroc est la première plateforme marocaine d\'échanges directs B2B dédiée aux récoltes de fruits & légumes, aux pépinières certifiées ONSSA, à la bourse des prix de gros et au transport agricole sécurisé.',
              'تعتبر AgriStock المنصة المغربية الرائدة للمبادلات التجارية الفلاحية المباشرة B2B، المخصصة لعروض الخضر والفواكه، المشاتل المعتمدة من أونسا، بورصة أسعار الجملة والنقل المبرد المؤمن.',
              'AgriStock Morocco is the leading direct B2B agricultural exchange connecting growers, ONSSA-certified nurseries, wholesale markets, and secured refrigerated transport.'
            )}
          </p>

          {/* Action principale d'installation mobile */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isInstallable && !isInstalled && (
              <button
                id="btn-install-mobile-app"
                type="button"
                onClick={install}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{tr(language, 'Installer l\'application sur mon téléphone', 'تثبيت التطبيق على هاتفي المحمول', 'Install app on my phone')}</span>
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/70 text-emerald-300 text-xs font-bold shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{tr(language, 'Application installée sur votre appareil ✅', 'التطبيق مثبت بنجاح على هاتفك ✅', 'App installed on your device ✅')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Brand Card */}
        <div className="shrink-0 flex flex-col items-center p-5 rounded-3xl bg-stone-950/80 border border-emerald-500/40 shadow-2xl backdrop-blur-xs relative z-10 w-full sm:w-auto">
          <AppLogoIcon size={84} className="shadow-lg shadow-emerald-950/80" />
          <div className="mt-3 text-center">
            <div className="text-sm font-black tracking-tight text-white">
              AGRI<span className="text-emerald-400">STOCK</span>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-700 text-white mt-1 inline-block">
              Maroc 🇲🇦 · Version 1.0.0
            </span>
            <div className="text-[10px] text-stone-400 mt-1">
              Plateforme B2B Sécurisée
            </div>
          </div>
        </div>
      </div>

      {/* 2. Guide d'installation simple pour l'utilisateur */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <span>{tr(language, 'Comment installer AgriStock sur votre téléphone ?', 'كيفية تثبيت التطبيق على هاتفك المحمول ؟', 'How to install AgriStock on your mobile phone?')}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {tr(
              language,
              'L\'application s\'installe en 1 tap sans passer par des téléchargements complexes.',
              'يمكن تثبيت التطبيق مباشرة وبنقرة واحدة دون الحاجة لتحميل ملفات معقدة.',
              'Install the app in 1 tap without any complex downloads.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm font-bold text-stone-900">
              {tr(language, 'Sur Android (Google Chrome)', 'لهواتف أندرويد (جوجل كروم)', 'On Android (Google Chrome)')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr(
                language,
                'Cliquez sur le bouton vert « Installer l\'application » ci-dessus ou sur les 3 points du menu du navigateur, puis sélectionnez « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».',
                'اضغط على الزر الأخضر أعلاه أو على قائمة المتصفح (3 نقاط) ثم اختر « تثبيت التطبيق » أو « إضافة إلى الشاشة الرئيسية ».',
                'Click the green "Install app" button above or browser menu (3 dots), then select "Install app" or "Add to Home screen".'
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-bold text-stone-900">
              {tr(language, 'Sur iPhone (Safari)', 'لهواتف آيفون (متصفح سفاري)', 'On iPhone (Safari)')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr(
                language,
                'Dans Safari, appuyez sur le bouton de Partage (le carré avec une flèche vers le haut en bas de l\'écran), puis choisissez « Sur l\'écran d\'accueil ».',
                'في متصفح سفاري، اضغط على زر المشاركة (المربع مع سهم للأعلى أسفل الشاشة) ثم اختر « إضافة إلى الصفحة الرئيسية ».',
                'In Safari, tap the Share icon (square with arrow pointing up), then select "Add to Home Screen".'
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-sm font-bold text-stone-900">
              {tr(language, 'Accès Direct & Mode Hors-Ligne', 'العمل دون انترنت وسرعة فائقة', 'Direct Access & Offline Mode')}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {tr(
                language,
                'L\'icône officielle AgriStock apparaît parmi vos applications. Vous accédez à vos stocks et à vos offres même en plein champ avec une faible couverture réseau.',
                'تظهر أيقونة المنصة الرسمية بين تطبيقات هاتفك، وتعمل حتى أثناء وجودكم في الحقول مع ضعف شبكة الانترنت.',
                'AgriStock appears right on your home screen and operates seamlessly even in rural fields with weak internet.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Les Piliers d'AgriStock Maroc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900">Marché Récoltes & Bétail</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Vente directe de fruits, légumes de saison et bétail au départ ferme sans intermédiaires abusifs.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900">Pépinières Agréées ONSSA</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Lots certifiés, passeports phytosanitaires officiels et garanties variétales conformes aux normes nationales.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900">Paiement Séquestre Garanti</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Les fonds sont protégés et bloqués sur un compte tiers jusqu&apos;à vérification du pesage et de la qualité livrée.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900">Fret Agricole Réfrigéré</h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Mise en relation directe avec les transporteurs frigorifiques certifiés pour préserver la chaîne du froid.
          </p>
        </div>
      </div>

      {/* 4. Mentions Légales, Confidentialité & Sécurité */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>{tr(language, 'Cadre Légal, Sécurité & Confidentialité', 'الإطار القانوني والأمان وحماية البيانات', 'Legal Framework, Security & Privacy')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => openUserManual('confidentialite')}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Politique de Confidentialité', 'سياسة الخصوصية', 'Privacy Policy')}
              </span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              Protection rigoureuse de vos données conformément à la loi marocaine CNDP 09-08.
            </p>
          </button>

          <button
            type="button"
            onClick={() => openUserManual('cgu')}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Conditions d\'Utilisation (CGU)', 'شروط الاستخدام العامة', 'Terms of Service')}
              </span>
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              Règles encadrant les transactions B2B, les paiements sous séquestre et les litiges.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setIsOfficialComplianceModalOpen(true)}
            className="p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 group-hover:text-emerald-800">
                {tr(language, 'Conformité ONSSA & Douane', 'المطابقة الصحية والجمارك', 'ONSSA & Customs')}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              Contrôles sanitaires, certificats d&apos;origine et manifestes officiels d&apos;exportation.
            </p>
          </button>
        </div>
      </div>

      {/* 5. Support & Contact Utilisateur */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <span>{tr(language, 'Assistance & Contact Support', 'المساعدة وخدمة المستعملين', 'Support & Inquiries')}</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {tr(
                language,
                'Notre équipe est à votre écoute pour vous accompagner dans vos démarches d\'achat, de vente ou d\'homologation.',
                'فريق الدعم الفلاحي في خدمتكم للإجابة على جميع استفساراتكم حول البيع والشراء والشهادات.',
                'Our team is available to assist with your buying, selling, or certification needs.'
              )}
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
            support@agristock.ma
          </span>
        </div>

        {supportMessageSent ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {tr(
                language,
                'Merci ! Votre message a bien été transmis à l\'équipe support d\'AgriStock Maroc.',
                'شكراً لكم، تم إرسال رسالتكم بنجاح إلى فريق الدعم.',
                'Thank you! Your message has been successfully transmitted to the support team.'
              )}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder={tr(language, 'Objet de votre demande...', 'موضوع الطلب...', 'Subject...')}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-emerald-500"
              />
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Réponse garantie sous 24h ouvrées</span>
              </div>
            </div>

            <textarea
              required
              rows={3}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder={tr(
                language,
                'Écrivez votre message ou question ici...',
                'اكتب رسالتك أو استفسارك هنا...',
                'Type your question or message here...'
              )}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-emerald-500"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {tr(language, 'Envoyer au Support', 'إرسال الرسالة', 'Send to Support')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
