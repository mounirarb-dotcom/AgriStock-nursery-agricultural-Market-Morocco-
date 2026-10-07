export interface ManualSection {
  id: string;
  title: string;
  titleAr: string;
  titleEn?: string;
  badge: string;
  badgeAr: string;
  badgeEn?: string;
  iconName: string;
  summary: string;
  summaryAr: string;
  summaryEn?: string;
  steps: {
    title: string;
    titleAr: string;
    titleEn?: string;
    desc: string;
    descAr: string;
    descEn?: string;
    tip?: string;
    tipAr?: string;
    tipEn?: string;
  }[];
  keyBenefits: string[];
  keyBenefitsAr: string[];
  keyBenefitsEn?: string[];
  faq?: {
    q: string;
    qAr: string;
    qEn?: string;
    a: string;
    aAr: string;
    aEn?: string;
  }[];
}

export const USER_MANUAL_CHAPTERS: ManualSection[] = [
  {
    id: 'intro-roles',
    title: '1. Prise en main, Profil & Choix des Rôles',
    titleAr: '1. البداية، الملف الشخصي وتحديد الأدوار',
    badge: 'Guide Fondateur',
    badgeAr: 'دليل أساسي',
    iconName: 'UserCheck',
    summary: 'AgriMaroc est la plateforme B2B de référence au Maroc dédiée au négoce des plants de pépinières certifiés ONSSA, des fruits & légumes récoltés et des vergers sur pied. Choisissez votre rôle (Acheteur ou Vendeur/Pépiniériste) pour adapter vos fonctionnalités.',
    summaryAr: 'أجري ماروك هي المنصة المغربية الرائدة في المعاملات الفلاحية B2B المخصصة لشتائل المشاتل المعتمدة من طرف أونسا، الخضر والفواكه المجنية، والغلات على رؤوس أشجارها.',
    steps: [
      {
        title: 'Sélection du Rôle Principal',
        titleAr: 'اختيار الصفة الرئيسية',
        desc: 'Cliquez sur la capsule de profil en haut à droite pour basculer entre Acheteur (agriculteur planteur, négociant, coopérative, exportateur) et Vendeur (pépiniériste agréé, producteur maraîcher, propriétaire de verger).',
        descAr: 'انقر على أيقونة الحساب أعلى الشاشة لاختيار صفتك كـ "مشتري" (فلاح، تاجر، مصدر) أو "بائع" (صاحب مشتل معتمد أو فلاح منتج).',
        tip: 'Vous pouvez modifier votre rôle à tout moment sans perte de données.',
        tipAr: 'يمكنك تبديل صفتك في أي وقت بسهولة دون فقدان أي بيانات.',
      },
      {
        title: 'Région & Coordonnées de Contact',
        titleAr: 'الجهة الفلاحية ورقم الهاتف',
        desc: 'Renseignez votre nom ou raison sociale, votre région agricole (Souss-Massa, Gharb, Saïss, Haouz, Berkane, Tadla, etc.) et votre numéro WhatsApp pour la mise en relation sécurisée.',
        descAr: 'حدد جهتك الفلاحية (سوس ماسة، الغرب، سايس، الحوز، بركان، تادلة...) ورقم الواتساب للتواصل التجاري المنظم.',
      },
      {
        title: 'Choix de la Langue',
        titleAr: 'اختيار لغة التطبيق',
        desc: 'L\'interface est entièrement disponible en Français (FR), Arabe (عربية) et Anglais (EN). Basculez en un clic via le sélecteur situé dans la barre supérieure.',
        descAr: 'المنصة معربة بالكامل ومتوفرة كذلك بالفرنسية والإنجليزية بنقرة زر في الشريط العلوي.',
      },
    ],
    keyBenefits: [
      'Accès immédiat sans mot de passe obligatoire dès l\'ouverture',
      'Affichage optimisé des annonces selon votre région d\'exploitation',
      'Compatibilité smartphone et écran tactile grand format pour le terrain',
    ],
    keyBenefitsAr: [
      'ولوج فوري وسهل دون الحاجة لتسجيل معقد',
      'فرز فوري للعروض حسب قربها من ضيعتك أو مشتلك',
      'تصميم متجاوب بالكامل مع الهواتف في الحقل',
    ],
    faq: [
      {
        q: 'Puis-je être à la fois acheteur de plants et vendeur de fruits ?',
        qAr: 'هل يمكنني شراء الشتلات وبيع الفواكه في نفس الوقت؟',
        a: 'Oui, la bascule de rôle s\'effectue en un tap dans le menu profil sans réinitialiser vos annonces ou vos commandes.',
        aAr: 'نعم بالتأكيد، يمكنك تبديل دورك بنقرة واحدة من شريط الحساب الشخصي.',
      },
    ],
  },
  {
    id: 'nursery-onssa',
    title: '2. Gestion de Pépinière & Traçabilité ONSSA',
    titleAr: '2. تسيير المشاتل وتتبع معايير أونسا ONSSA',
    badge: 'Module Pépiniériste',
    badgeAr: 'خاص بالمشاتل',
    iconName: 'Sprout',
    summary: 'Enregistrez vos lots de plants (oliviers, agrumes, amandiers, palmiers dattiers, plants maraîchers ou ornementaux), gérez vos passeports phytosanitaires officiels et éditez vos QR codes de parcelles.',
    summaryAr: 'سجل دفعات الشتلات (زيتون، حمضيات، لوز، نخيل، شتلات الخضر أو نباتات الزينة)، استخرج جواز المرور الصحي النباتي واطبع رموز الاستجابة السريعة QR للوحات الشتلات.',
    steps: [
      {
        title: 'Création d\'un Lot de Pépinière',
        titleAr: 'إضافة دفعة شتلات جديدة',
        desc: 'Rendez-vous dans l\'onglet "Pépinière" puis cliquez sur "Nouveau Lot". Saisissez le numéro de lot/parcelle, l\'espèce, la variété, le porte-greffe, le stade végétatif, les quantités et le prix unitaire.',
        descAr: 'ادخل إلى تبويب "المشتل" ثم انقر على "إضافة دفعة". أدخل رقم الدفعة، الصنف، الأصل (Porte-greffe)، مرحلة النمو، الكمية وثمن الشتلة بالدرهم.',
        tip: 'Précisez le statut d\'agrément ONSSA pour bénéficier du badge "Certifié ONSSA" rassurant les acheteurs.',
        tipAr: 'حدد رقم اعتماد أونسا لظهور شارة التحقق الرسمية للمشترين.',
      },
      {
        title: 'Édition du Passeport Phytosanitaire',
        titleAr: 'استخراج الجواز الصحي النباتي الرسمي',
        desc: 'Sur chaque fiche de lot, cliquez sur "Passeport". L\'application génère automatiquement le document conforme aux exigences ONSSA prêt à imprimer pour accompagner vos livraisons.',
        descAr: 'انقر على زر "Passeport" بجانب كل دفعة للحصول على وثيقة مطابقة لمعايير أونسا جاهزة للطباعة مع الشحنات.',
      },
      {
        title: 'Génération du QR Code de Parcelle',
        titleAr: 'طباعة رمز QR الخاص بألواح المشتل',
        desc: 'Générez et imprimez l\'étiquette QR Code à apposer sur vos planches de culture. Les clients ou inspecteurs sur place peuvent le scanner avec leur téléphone pour voir la fiche technique instantanément.',
        descAr: 'اطبع بطاقة الرمز الشريطي QR لوضعها على أحواض الشتلات، لتمكين الزبائن ومراقبي أونسا من مسحها وقراءة التفاصيل الفنية فوراً.',
      },
      {
        title: 'Cahier de Traitements Phytosanitaires',
        titleAr: 'سجل المعالجات الزراعية والمكافحة',
        desc: 'Consignez les traitements effectués (produit homologué, dose, date d\'application, délai avant vente/DAR) pour garantir une traçabilité totale.',
        descAr: 'سجل المواد المستعملة، الجرعات، وتاريخ المعالجة لضمان احترام المعايير البيئية وتوجيهات السلامة الصحية.',
      },
    ],
    keyBenefits: [
      'Conformité stricte avec la réglementation marocaine sur la certification des plants',
      'Passeport sanitaire éditable en 1 clic au format A4 officiel',
      'Impression des QR codes résistants pour identification sous serre',
    ],
    keyBenefitsAr: [
      'مطابقة كاملة للقوانين المغربية المنظمة لمشاتل الأشجار المثمرة والشتائل',
      'استخراج فوري لجواز المرور النباتي A4',
      'تتبع دقيق عبر رموز QR على أحواض وألواح الزرع',
    ],
  },
  {
    id: 'daily-sync',
    title: '3. Actualisation Quotidienne & Quick Sync (1-Tap)',
    titleAr: '3. التحديث اليومي للمخزون والتأكيد السريع (نقرة واحدة)',
    badge: 'Fraîcheur & Confiance',
    badgeAr: 'ثقة المشترين',
    iconName: 'Zap',
    summary: 'Un stock à jour évite le sur-booking et garantit la priorité de référencement sur la place de marché. AgriMaroc intègre un système d\'actualisation express en 1 clic et des rappels programmés.',
    summaryAr: 'تحيين المخزون اليومي يجنب الحجز المزدوج ويمنح مشتلك الأولوية في نتائج البحث، بفضل نظام التحديث السريع بنقرة واحدة.',
    steps: [
      {
        title: 'La Bannière de Rappel Journalier',
        titleAr: 'شريط التذكير اليومي التفاعلي',
        desc: 'Chaque matin, la bannière supérieure vous indique le nombre de lots non encore certifiés pour la date du jour. Elle se colore en vert dès que votre inventaire est validé.',
        descAr: 'في بداية اليوم، يظهر لك شريط ينبهك للكميات التي تنتظر التأكيد. يتحول إلى الأخضر فور مصادقتك على بيانات اليوم.',
      },
      {
        title: 'Validation Globale "1-Tap : Tout certifier inchangé"',
        titleAr: 'التأكيد الشامل بنقرة واحدة "الكل مطابق"',
        desc: 'Si vos quantités n\'ont pas varié au cours des dernières 24h, cliquez sur le bouton vert 1-Tap : tous vos lots reçoivent instantanément l\'horodatage certifié de la journée.',
        descAr: 'إذا لم تتغير كميات مشتلك خلال 24 ساعة، اضغط على زر "تأكيد الكل دون تغيير" لتوثيق تاريخ اليوم على كافة الأصناف دفعة واحدة.',
        tip: 'Le badge "Stock certifié ce jour" apparaît alors sur toutes vos fiches visibles par les acheteurs.',
        tipAr: 'ستظهر شارة "تم التأكيد اليوم" باللون الأخضر لجميع المشترين في المغرب.',
      },
      {
        title: 'Console Quick Sync Express',
        titleAr: 'لوحة التعديل السريع للأرقام',
        desc: 'Ouvrez la modale "⚡ Quick Sync Journalier" pour ajuster vos quantités avec les touches tactiles (+10, +50, -10, -50) sans ouvrir chaque formulaire un par un.',
        descAr: 'افتح نافذة "Quick Sync" لتعديل الأرقام بالأزرار السريعة (+10، +50، -10، -50) دون الدخول في كل بطاقة على حدة.',
      },
      {
        title: 'Rappels Automatiques Navigateur',
        titleAr: 'تنبيهات التذكير التلقائية',
        desc: 'Activez les notifications de rappel (ex. à 17h00 en fin de journée) pour ne jamais oublier de clôturer votre inventaire.',
        descAr: 'فعل الإشعارات في المتصفح لتلقي تذكير في وقت محدد (مثلاً الساعة 17:00 مساءً) لضبط المخزون.',
      },
    ],
    keyBenefits: [
      'Élimination des litiges liés aux ruptures de stock inattendues',
      'Gain de temps précieux pour les exploitants de pépinières occupés',
      'Priorité d\'affichage dans les résultats de recherche acheteurs',
    ],
    keyBenefitsAr: [
      'تفادي المشاكل الناتجة عن نفاذ المخزون بعد الاتفاق مع المشتري',
      'ربح كبير للوقت بفضل التعديل باللمس السريع',
      'ترتيب متقدم في صفحة السوق للسلع المؤكدة حديثاً',
    ],
  },
  {
    id: 'd3-growth-trends',
    title: '4. Courbes de Croissance D3.js & Performance de Stock',
    titleAr: '4. رسوم D3.js البيانية لتتبع النمو وأداء المخزون',
    badge: 'Technologie D3.js',
    badgeAr: 'تحليل بياني متقدم',
    iconName: 'TrendingUp',
    summary: 'Visualisez l\'évolution phénologique de vos végétaux et la vélocité de vos ventes grâce aux graphiques interactifs vectoriels conçus avec D3.js.',
    summaryAr: 'تابع تطور طول الساق، قطر الجذع، وسرعة تصريف الشتلات وقيمتها السوقية عبر رسوم بيانية تفاعلية مدعومة بمكتبة D3.js العالمية.',
    steps: [
      {
        title: 'Accès au Module de Graphiques',
        titleAr: 'فتح شاشة الرسوم البيانية',
        desc: 'Cliquez sur le bouton "Courbes D3 & Rapports" dans le gestionnaire de pépinière, ou cliquez sur le bouton "D3" présent sur n\'importe quelle fiche de lot.',
        descAr: 'انقر على زر "Courbes D3 & Rapports" في المشتل، أو اضغط زر "D3" الخاص بأي دفعة ترغب في دراستها.',
      },
      {
        title: 'Sélection des Métriques Clés',
        titleAr: 'اختيار المؤشرات الفنية',
        desc: 'Explorez 5 dimensions distinctes : Croissance en hauteur (cm), Diamètre au collet (mm), Disponibilité en stock (plants), Déstockage cumulé (sorties/ventes) et Valorisation marchande (MAD).',
        descAr: 'اختر المؤشر المطلوب: تطور الطول (سم)، قطر الساق (ملم)، المخزون المتوفر، المبيعات المتراكمة، أو القيمة المالية الإجمالية بالدرهم.',
      },
      {
        title: 'Période Temporelle & Mode Comparatif',
        titleAr: 'المدى الزمني ومقارنة الأصناف',
        desc: 'Choisissez l\'échelle d\'analyse (30 jours, 90 jours, 6 mois, 1 an) et basculez en "Mode Comparatif" pour superposer jusqu\'à 4 variétés (ex. Picholine vs Menara vs Haouzia).',
        descAr: 'حدد الفترة (30 يوماً، 3 أشهر، 6 أشهر، أو سنة كاملة) واستعمل "وضع المقارنة" لدمج حتى 4 أصناف في نفس المنحنى.',
      },
      {
        title: 'Exploration Interactive & Export SVG',
        titleAr: 'استكشاف النقط وتصدير الرسم Vectoriel',
        desc: 'Survolez la courbe pour activer le réticule et afficher l\'infobulle (date exacte, valeur, vigueur %, jalons d\'interventions). Téléchargez le graphique en SVG vectoriel HD pour vos dossiers de subventions ou d\'audit.',
        descAr: 'مرر الفأرة أو الإصبع فوق المنحنى لقراءة التفاصيل والمحطات الزراعية (التسميد، التقليم). واضغط "Export SVG" لتحميل الرسم بجودة عالية للطباعة والتقارير.',
      },
    ],
    keyBenefits: [
      'Suivi scientifique de la cinétique de pousse pour planifier la commercialisation',
      'Estimation financière précise de l\'actif biologique de la pépinière',
      'Fichiers graphiques vectoriels exportables pour les dossiers FDA / ONSSA',
    ],
    keyBenefitsAr: [
      'تتبع علمي دقيق لسرعة النمو لمعرفة موعد الجاهزية للبيع',
      'تقييم مالي فوري للثروة النباتية الحية في ضيعتك',
      'تصدير رسومات SVG رسمية لملفات الدعم وصندوق التنمية الفلاحية',
    ],
  },
  {
    id: 'marketplace-harvest',
    title: '5. Place de Marché Fruits & Légumes (Récoltés & Sur Pied)',
    titleAr: '5. سوق الخضر والفواكه (المجنية والغلات على رؤوس أشجارها)',
    badge: 'Bourse Agricole',
    badgeAr: 'بورصة الإنتاج',
    iconName: 'Store',
    summary: 'Publiez et achetez des récoltes agricoles fraîches au Maroc. Négociez au camion, à la tonne ou à la caisse, ou cédez vos vergers complets en vente sur pied avec estimation du rendement.',
    summaryAr: 'انشر واشترِ المحاصيل الزراعية الطازجة في المغرب. تفاوض بالشاحنة أو الطن أو الصندوق، أو اعرض ضيعتك للبيع "على رؤوس أشجارها" بتقدير المحصول الإجمالي.',
    steps: [
      {
        title: 'Recherche & Filtres Avancés',
        titleAr: 'البحث والفلترة الذكية',
        desc: 'Filtrez les annonces par catégorie (Agrumes, Légumes de serre, Maraîchage plein champ, Fruits rouges, Olives...), par région de production et par type d\'emballage (caisses bois, plastique, vrac palox).',
        descAr: 'فرز العروض حسب الصنف (حوامض، خضروات، فواكه حمراء، زيتون...)، وحسب المنطقة ونوع التعبئة والتغليف.',
      },
      {
        title: 'Publication d\'une Annonce de Récolte',
        titleAr: 'نشر إعلان محصول مجني',
        desc: 'Précisez la variété, le tonnage ou nombre de caisses disponible, le calibre, le prix au kg/tonne départ station ou départ champ, et ajoutez des photos réelles.',
        descAr: 'حدد الصنف، الكيلوغرامات أو الأطنان المتوفرة، المعيار (Calibre)، ثمن الانطلاق، مع إرفاق صور واضحة للشحنة.',
      },
      {
        title: 'Vente de Vergers Sur Pied ("Khedara")',
        titleAr: 'بيع الغلات على رؤوس أشجارها ("الخضارة")',
        desc: 'Dans l\'onglet Vente sur Pied, publiez vos vergers avec la superficie (ha), l\'estimation en tonnes, la date prévisionnelle de maturité et le mode de cueillette convenu.',
        descAr: 'في قسم البيع على رؤوس الأشجار، اعرض ضيعتك مع ذكر المساحة بالهكتار، التقدير التقريبي للأطنان، وتاريخ النضج المتوقع.',
      },
      {
        title: 'Cours des Marchés de Gros en Direct',
        titleAr: 'متابعة أسعار أسواق الجملة بالمغرب',
        desc: 'Consultez en temps réel les cours indicatifs des principaux marchés de gros du Royaume (Inezgane, Casablanca, Meknès, Marrakech, Oujda) pour fixer le juste prix.',
        descAr: 'اطلع على الأسعار المرجعية لأسواق الجملة الكبرى (إنزكان، الدار البيضاء، مكناس...) لتسعير محاصيلك بثمن السوق الحقيقي.',
      },
    ],
    keyBenefits: [
      'Accès direct aux grossistes et exportateurs sans intermédiaires abusifs',
      'Formules adaptées à la vente bord champ et départ station d\'emballage',
      'Cotations quotidiennes transparentes pour sécuriser vos marges',
    ],
    keyBenefitsAr: [
      'الوصول المباشر لتجار الجملة والمصدرين وتفادي السماسرة المضاربين',
      'عروض مرنة تشمل البيع من الضيعة أو محطة التلفيف',
      'شفافية الأسعار لضمان هامش ربح عادل للفلاح',
    ],
  },
  {
    id: 'escrow-security',
    title: '6. Paiement Séquestre B2B & Sécurité Anti-Impayés',
    titleAr: '6. حساب الضمان البنكي والحماية من الشيكات بدون رصيد',
    badge: 'Protection Financière',
    badgeAr: 'أمان المعاملات',
    iconName: 'ShieldCheck',
    summary: 'Enrayez le fléau des chèques sans provision et des impayés dans le secteur agricole grâce au mécanisme de compte séquestre AgriMaroc (fonds consignés jusqu\'à réception conforme).',
    summaryAr: 'تخلص نهائياً من مخاطر "شيكات الضمان" والشيكات بدون رصيد. المشتري يودع المبلغ في حساب وسيط آمن، ولا يتسلمه البائع إلا بعد وصول الشاحنة وفحص الجودة.',
    steps: [
      {
        title: 'Initiation du Séquestre par l\'Acheteur',
        titleAr: 'بدء المعاملة وإيداع الضمان',
        desc: 'Sur l\'annonce, cliquez sur "Acheter via Séquestre Sécurisé". Renseignez la quantité, l\'adresse de livraison et consignez l\'acompte ou la totalité des fonds par carte CMI, virement bancaire certifié ou carte bancaire.',
        descAr: 'انقر على "شراء عبر حساب الضمان". حدد الكمية وعنوان التوصيل وقم بإيداع المبلغ عبر بطاقة CMI أو التحويل البنكي المعتمد.',
      },
      {
        title: 'Notification & Expédition par le Vendeur',
        titleAr: 'إشعار البائع وبدء الشحن',
        desc: 'Le vendeur reçoit la notification certifiant que les fonds sont bloqués en compte séquestre. Il peut charger le camion et expédier la marchandise en toute confiance.',
        descAr: 'يتلقى الفلاح أو المشتل إشعاراً رسمياً بأن الأموال مضمونة ومودعة بالكامل، فيشرع في جني المحصول وتحميل الشاحنة دون أي قلق.',
      },
      {
        title: 'Inspection à la Livraison & Pesée Pont-Bascule',
        titleAr: 'معاينة البضاعة عند الوصول ووزن الشاحنة',
        desc: 'À l\'arrivée du transporteur, l\'acheteur vérifie la conformité (calibre, fraîcheur, quantité sur ticket de pesée).',
        descAr: 'عند وصول الشاحنة، يقوم المشتري بفحص السلعة والتأكد من مطابقتها وتأكيد وزن القبان.',
      },
      {
        title: 'Déblocage Instantané des Fonds',
        titleAr: 'تحرير الأموال للبائع فوراً',
        desc: 'Dès que l\'acheteur clique sur "Confirmer la réception conforme", l\'ordre de virement irrévocable est exécuté au profit du vendeur.',
        descAr: 'بمجرد تأكيد الاستلام المطابق، يتم تحويل المبلغ فوراً وبشكل غير قابل للإلغاء إلى الحساب البنكي للبائع.',
        tip: 'En cas de litige partiel, le service de conciliation AgriMaroc intervient sous 24h avec expertise photo.',
        tipAr: 'في حال وجود اختلاف في الوزن أو الجودة، يتدخل فريق الوساطة خلال 24 ساعة لفض النزاع بالعدل.',
      },
    ],
    keyBenefits: [
      'Garantie absolue contre les chèques impayés et les faillites d\'acheteurs',
      'Protection de l\'acheteur en cas de non-livraison ou de marchandise avariée',
      'Facturation et preuve de transaction conformes aux normes fiscales marocaines',
    ],
    keyBenefitsAr: [
      'حماية 100% ضد الشيكات المرفوضة والمماطلة في الأداء',
      'حماية حق المشتري في حال عدم إرسال البضاعة أو تلفها في الطريق',
      'سجل قانوني واضح للمعاملات يسهل المحاسبة والشفافية',
    ],
  },
  {
    id: 'negotiation-messaging',
    title: '7. Espace de Négociation & Offres de Prix Directes',
    titleAr: '7. المحادثات الفورية والتفاوض بالأرقام الرسمية',
    badge: 'Messagerie B2B',
    badgeAr: 'مفاوضات مباشرة',
    iconName: 'MessageSquare',
    summary: 'Négociez directement le prix à la caisse ou à la tonne via une messagerie dédiée rattachée à chaque lot. Envoyez des propositions chiffrées officielles en un clic.',
    summaryAr: 'تفاوض في إطار احترافي عبر شات مخصص لكل عرض تجاري. أرسل مقترحات أسعار رسمية قابلة للقبول والتحويل الفوري لصفقة دفع آمن.',
    steps: [
      {
        title: 'Ouvrir une Discussion d\'Offre',
        titleAr: 'فتح محادثة حول العرض',
        desc: 'Cliquez sur "Discuter / Négocier" sur la fiche du produit pour entrer en contact direct avec l\'agriculteur ou le pépiniériste.',
        descAr: 'اضغط على "محادثة / تفاوض" في أي بطاقة منتج لبدء الحديث مع صاحب العرض.',
      },
      {
        title: 'Envoi d\'une Offre de Prix Chiffrée',
        titleAr: 'إرسال عرض ثمن رسمي بالكمية',
        desc: 'Utilisez le bouton "Proposer un prix" pour spécifier votre offre (ex. 8,50 MAD/kg pour 5 tonnes). La proposition apparaît clairement encadrée avec boutons "Accepter" ou "Contre-offre".',
        descAr: 'استعمل زر "اقتراح ثمن" لتحديد سعرك والكمية (مثال: 8.5 درهم/كلغ لـ 5 أطنان). يظهر العرض بوضوح مع خيار القبول أو الرفض.',
      },
      {
        title: 'Transformation en Commande Séquestre',
        titleAr: 'تحويل العرض المقبول إلى حجز فوري',
        desc: 'Dès que le vendeur accepte votre prix dans le chat, un bouton direct vous permet de finaliser la commande avec le montant convenu sans ressaisir les données.',
        descAr: 'بمجرد قبول البائع للثمن، يظهر زر ينقلك مباشرة لإتمام الدفع الآمن بالسعر المتفق عليه بدقة.',
      },
      {
        title: 'Protection Anti-Court-Circuitage',
        titleAr: 'حماية المعاملات من التحايل الخارجي',
        desc: 'Pour protéger les deux parties contre les impayés extérieurs, les coordonnées téléphoniques directes peuvent être masquées tant que la commande n\'est pas sécurisée.',
        descAr: 'لحماية الطرفين من النصب خارج المنصة، يمكن حجب الأرقام حتى تأكيد الجدية في المعاملة.',
      },
    ],
    keyBenefits: [
      'Historique écrit clair des accords de prix opposable en cas de désaccord',
      'Notifications instantanées dès réception d\'une nouvelle contre-proposition',
      'Conversion fluide de la négociation vers le bon de commande sécurisé',
    ],
    keyBenefitsAr: [
      'توثيق كتابي واضح لجميع مراحل الاتفاق لتفادي أي لبس',
      'إشعارات فورية عند تلقي أي رد أو اقتراح سعر جديد',
      'انتقال سلس من مرحلة الكلام إلى مرحلة الإنجاز المالي المحمي',
    ],
  },
  {
    id: 'logistics-freight',
    title: '8. Fret Agricole, Camions Frigo & Réservation Logistique',
    titleAr: '8. النقل الفلاحي والشاحنات المبردة وحجز الشحن',
    badge: 'Transport Agricole',
    badgeAr: 'لوجستيك النقل',
    iconName: 'Truck',
    summary: 'Acheminez vos plants et récoltes dans les meilleures conditions thermiques grâce au réseau de transporteurs agricoles partenaires à travers tout le Royaume.',
    summaryAr: 'انقل شتلاتك ومحاصيلك في أحسن الظروف المناخية بفضل أسطول الشاحنات المبردة والشاحنات الكبيرة المخصصة للمنتجات الزراعية في جميع مدن وقرى المغرب.',
    steps: [
      {
        title: 'Accès au Module Fret Agricole',
        titleAr: 'طلب خدمة نقل فلاحي',
        desc: 'Dans la barre supérieure ou lors de la conclusion d\'une vente, ouvrez la modale "Fret Agricole".',
        descAr: 'افتح نافذة "Fret Agricole" من الشريط العلوي أو أثناء إتمام أي طلبية.',
      },
      {
        title: 'Sélection du Véhicule & Trajet',
        titleAr: 'اختيار نوع الشاحنة والمسار',
        desc: 'Indiquez la ville d\'enlèvement (ex. Agadir / Taroudant) et la destination (ex. Casablanca / Tanger / Nador). Choisissez entre Camion Frigorifique régulé (0°C à +4°C), Camion Plateau bâché ou Fourgonnette express.',
        descAr: 'حدد مدينة الانطلاق (مثل أكادير/تارودانت) ومدينة الوصول (الدار البيضاء/طنجة...). واختر شاحنة تبريد معتمدة أو شاحنة عادية مسيجة.',
      },
      {
        title: 'Estimation Tarifaire & Mise en Relation',
        titleAr: 'حساب التكلفة التقديرية والتواصل مع السائق',
        desc: 'Le simulateur calcule le coût kilométrique estimé selon le tonnage et vous met en relation directe avec les transporteurs disponibles sur cet axe routier.',
        descAr: 'يقوم النظام بحساب التكلفة التقديرية حسب المسافة والحمولة، ويربطك فوراً بالسائقين والشركات المتاحة على هذا المحور.',
      },
      {
        title: 'Manifestes d\'Expédition & Export Standardisés (PDF A4)',
        titleAr: 'بيانات الشحن والتصدير المعيارية (ملف PDF A4 رسمي)',
        desc: 'Générez en 1 clic un manifeste officiel complet pour le contrôle routier, douanier (BADR / DUM) et sanitaire (ONSSA / Morocco Foodex EACCE). Inclut les codes SH, températures de consigne, numéros de plomb et scellés, ainsi que la traçabilité des lots et parcelles.',
        descAr: 'أنشئ بنقرة واحدة بيان شحن وتصدير معتمد (PDF) يضم رمز النظام المنسق SH، ودرجات حرارة التبريد، ورقم ترخيص أونسا، ورقم الختم الجمركي وتفاصيل الشاحنة والطرود.',
      },
    ],
    keyBenefits: [
      'Préservation de la chaîne du froid indispensable pour fruits rouges et légumes primeurs',
      'Véhicules capitonnés adaptés au transport des plants d\'arbres sans abîmer les mottes racinaires',
      'Génération instantanée du Manifeste Export A4 conforme aux exigences douanières et européennes',
      'Suivi du statut d\'acheminement et lettre de voiture numérique',
    ],
    keyBenefitsAr: [
      'الحفاظ على سلسلة التبريد لضمان وصول التوت والفواكه والخضر طازجة',
      'شاحنات ملائمة لنقل شتائل المشاتل وأكياس الجذور دون تضررها',
      'استخراج فوري لبيان التصدير والشحن المطابق لمعايير الجمارك وموروكو فوديكس',
      'متابعة حالة النقل والتنسيق السريع لتسليم الشحنة في وقتها',
    ],
  },
  {
    id: 'security-data-compliance',
    title: '9. Sécurité des Stocks, Code PIN & Conformité CNDP / OMPIC',
    titleAr: '9. حماية المخزون بالرمز السري والامتثال القانوني CNDP و OMPIC',
    badge: 'Sécurité & Légal',
    badgeAr: 'قانون وأمان',
    iconName: 'Lock',
    summary: 'Protégez vos volumes contre les modifications involontaires, sauvegardez vos données en JSON et opérez en toute légalité sous le cadre réglementaire marocain.',
    summaryAr: 'احمِ مخزون مشتلك برمز PIN سري، قم بتصدير واستيراد بياناتك محلياً (JSON)، وتأكد من امتثال المنصة لقانون حماية المعطيات الشخصية المغربي 09-08 وعلامة OMPIC.',
    steps: [
      {
        title: 'Verrouillage des Stocks par Code PIN',
        titleAr: 'قفل تعديل المخزون برمز سري',
        desc: 'Activez l\'option "Protéger stocks" dans la barre d\'outils. Définissez votre mot de passe pour empêcher toute modification accidentelle ou non autorisée par des tiers sur votre téléphone partagé.',
        descAr: 'فعل خاصية "Protéger stocks" وضع رمزاً سرياً لحماية الكميات من أي تعديل خاطئ عند مشاركة الهاتف أو الحاسوب في الضيعة.',
      },
      {
        title: 'Sauvegarde Locale & Export JSON',
        titleAr: 'تصدير نسخة احتياطية من بياناتك',
        desc: 'Dans l\'icône "Données", cliquez sur "Exporter mes données en JSON" pour conserver une copie de sécurité de vos lots, annonces et historique sur votre ordinateur ou clé USB.',
        descAr: 'انقر على "Données" ثم "Exporter mes données" لتحميل ملف احتياطي JSON لجميع شتلاتك وعروضك وأرشيفك.',
      },
      {
        title: 'Cadre Juridique CNDP & OMPIC',
        titleAr: 'الوضع القانوني وحماية البيانات',
        desc: 'Consultez la modale "Statut Officiel" : la plateforme respecte scrupuleusement la loi 09-08 (déclaration CNDP n° D-W-849/2026), le dépôt de marque OMPIC n° 249104 et les standards de sécurité bancaire CMI.',
        descAr: 'اطلع على نافذة "الوضع القانوني": المنصة مصرح بها لدى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي CNDP ومسجلة بالمكتب المغربي للملكية الصناعية OMPIC.',
      },
    ],
    keyBenefits: [
      'Sécurisation physique et logique de vos données d\'exploitation',
      'Fonctionnement garanti même sans connexion Internet (PWA Offline First)',
      'Totale conformité avec les lois marocaines du commerce électronique',
    ],
    keyBenefitsAr: [
      'حماية محكمة لأسرار عملك وأرقام مشتلك',
      'الاشتغال حتى بدون إنترنت في الحقل مع مزامنة لاحقة (PWA)',
      'احترام تام للقوانين المغربية للتجارة الإلكترونية وحماية المستهلك',
    ],
  },
  {
    id: 'export-manifest-compliance',
    title: '10. Export, Conformité Internationale & Manifestes A4 (Morocco Foodex, ONSSA & Douane BADR)',
    titleAr: '10. التصدير والامتثال الدولي وبيانات الشحن الرسمية (موروكو فوديكس، أونسا، جمارك BADR)',
    titleEn: '10. Export, International Compliance & A4 Manifests (Morocco Foodex, ONSSA & Customs BADR)',
    badge: 'Export & Douane',
    badgeAr: 'تصدير وجمارك',
    badgeEn: 'Export & Customs',
    iconName: 'Globe',
    summary: 'Préparez vos expéditions de fruits, légumes et agrumes pour l\'exportation vers l\'Union Européenne, le Royaume-Uni et l\'Afrique. Générez en 1 clic vos manifestes d\'expédition officiels A4 avec codes SH, agréments phytosanitaires ONSSA, visa EACCE / Morocco Foodex et contrôle frigorifique.',
    summaryAr: 'جهز شحناتك من الخضر والفواكه والحوامض للتصدير نحو الاتحاد الأوروبي وبريطانيا وإفريقيا. استخرج بنقرة واحدة بيان شحن رسمي معتمد (PDF A4) يضم رمز النظام المنسق SH، وترخيص أونسا الصحي، وتأشيرة موروكو فوديكس، ودرجات حرارة التبريد.',
    summaryEn: 'Prepare fruit, vegetable and citrus shipments for export to the European Union, the United Kingdom and West Africa. Instantly generate official A4 shipping manifests with HS codes, ONSSA phytosanitary certificates, Morocco Foodex (EACCE) approvals and cold-chain compliance.',
    steps: [
      {
        title: 'Génération Instantanée depuis les Annonces ou le Gestionnaire Export',
        titleAr: 'إنشاء بيان الشحن والتصدير بنقرة واحدة',
        titleEn: 'Instant Generation from Produce Listings or Export Hub',
        desc: 'Depuis la Marketplace ou le bouton "Manifestes Export (PDF)", créez un manifeste standardisé. Renseignez l\'exportateur (ICE, RC), la station de conditionnement agréée, le destinataire international (ex. Rungis, Saint-Charles Perpignan, Rotterdam, Londres) et le mode de transport (Camion TIR Frigorifique, Conteneur Maritime Reefer via Tanger Med).',
        descAr: 'من البورصة الفلاحية أو من زر "بيانات التصدير"، أنشئ بياناً موحداً يضم هوية المصدر (ICE، السجل التجاري)، محطة التلفيف المعتمدة، المستورد الدولي ووسيلة النقل المبردة.',
        descEn: 'From the Produce Marketplace or the "Export Manifest (PDF)" button, create a standardized document. Fill in exporter details (ICE, Commercial Register), accredited packing station, international recipient (e.g., Rungis, Perpignan Saint-Charles, Rotterdam, London) and transport mode (Refrigerated TIR truck or Maritime Reefer via Tanger Med).',
        tip: 'Sur chaque annonce de lot sur la Marketplace, cliquez sur "Manifeste Export (PDF)" pour pré-remplir automatiquement le tonnage, le calibre, le producteur et la variété.',
        tipAr: 'في بطاقة أي منتج بالبورصة، اضغط على "Manifeste Export (PDF)" لتعبئة بيانات الصنف والوزن والمحطة آلياً دون كتابة يدوية.',
        tipEn: 'On any Produce lot card, click "Export Manifest (PDF)" to auto-fill tonnage, calibre, grower and variety.',
      },
      {
        title: 'Automatisation des Codes SH & Points de Consigne Thermiques',
        titleAr: 'تحديد رمز النظام المنسق SH ودرجات حرارة التبريد',
        titleEn: 'Automated HS Codes & Temperature Setpoints',
        desc: 'La plateforme intègre la nomenclature douanière marocaine du Système Harmonisé (ex. 0702.00 pour Tomates fraîches, 0805.10 pour Oranges douces, 0810.40 pour Myrtilles / Fruits rouges). Les plages de température recommandées (+0°C à +4°C ou +8°C à +12°C) sont automatiquement calibrées pour prévenir tout litige d\'avarie en mer ou sur route.',
        descAr: 'يدرج النظام تلقائياً رمز التعريفة الجمركية المغربية والدولية (مثل 0702 للطماطم، 0805 للحوامض، 0810 للتوت الأزرق) وضبط درجات حرارة شاحنة التبريد تفادياً لأي تلف أثناء الشحن.',
        descEn: 'The platform integrates official Moroccan Harmonized System (HS) codes (e.g. 0702.00 Fresh Tomatoes, 0805.10 Sweet Oranges, 0810.40 Blueberries & Berries). Recommended temperature ranges (+0°C to +4°C or +8°C to +12°C) are automatically suggested to eliminate transit spoilage disputes.',
      },
      {
        title: 'Traçabilité des Parcelles, Numéros de Scellés & Contrôle Douanier BADR',
        titleAr: 'تتبع الحقول ورقم الختم الجمركي وتصريح BADR',
        titleEn: 'Field Traceability, Container Seals & BADR Customs Declaration',
        desc: 'Indiquez le numéro de certificat phytosanitaire ONSSA, l\'agrément EACCE / Morocco Foodex de la station d\'emballage, le numéro de déclaration unique de marchandise (DUM / BADR) et le numéro de scellé/plomb douanier. Chaque manifeste intègre un QR Code scannable pour les inspecteurs aux postes frontières.',
        descAr: 'سجل رقم الشهادة الصحية أونسا، ورقم اعتماد المحطة لدى موروكو فوديكس، ورقم التصريح الجمركي الموحد DUM/BADR وختم الرصاص الجمركي مع رمز QR للتحقق السريع في الموانئ.',
        descEn: 'Specify the ONSSA phytosanitary certificate number, Morocco Foodex packing station approval, single goods declaration (DUM / BADR) number and customs container seal. Every manifest embeds an official scannable QR code for border inspectors.',
      },
      {
        title: 'Téléchargement PDF Vectoriel A4 & Impression Directe',
        titleAr: 'تحميل ملف PDF A4 رسمي والطباعة المباشرة',
        titleEn: 'Vector A4 PDF Download & Direct Print',
        desc: 'Téléchargez en 1 clic le document vectoriel prêt pour la liasse documentaire de dédouanement (Facture proforma, EUR.1, Certificat phytosanitaire) ou imprimez-le directement au format A4 avec le tampon et visa de la station.',
        descAr: 'حمل بنقرة واحدة الملف بصيغة PDF A4 جاهزاً للإدراج ضمن ملف التصدير الجمركي (EUR.1، الفاتورة الأولية، شهادة المطابقة) أو اطبعه مباشرة.',
        descEn: 'Download in 1 click the official vector document ready for your export customs file (Proforma invoice, EUR.1, phytosanitary certificate) or print directly in A4 format with station stamp & signature.',
      },
    ],
    keyBenefits: [
      'Génération en 30 secondes d\'un document export officiel respectant les normes de l\'EACCE, l\'ONSSA et la Douane BADR',
      'Élimination des erreurs manuelles sur les codes SH et les plages de températures frigorifiques',
      'Fluidification du passage en douane portuaire (Tanger Med, Agadir, Nador) grâce au QR Code de contrôle',
      'Conformité totale avec les référentiels GlobalG.A.P., BRC, IFS et SMETA exigés par les centrales d\'achat internationales',
    ],
    keyBenefitsAr: [
      'استخراج وثيقة التصدير والشحن في 30 ثانية مطابقة لمعايير السلطات المغربية والأوروبية',
      'تفادي الأخطاء في رمز النظام المنسق الجمركي ودرجات حرارة التبريد',
      'تسريع العبور الجمركي بميناء طنجة المتوسط وميناء أكادير بفضل رمز QR الرقمي',
      'مطابقة كاملة لشهادات الجودة العالمية (GlobalG.A.P. و BRC) المطلوبة لدى المستوردين الكبار',
    ],
    keyBenefitsEn: [
      'Generate an official export manifest in 30 seconds complying with Morocco Foodex, ONSSA and Customs BADR standards',
      'Eliminate manual errors on HS tariff codes and regulated transport temperature setpoints',
      'Accelerate customs border clearance at Tanger Med, Agadir and Nador ports via official QR code inspection',
      'Full alignment with GlobalG.A.P., BRC Food, IFS and SMETA frameworks required by European and British supermarket chains',
    ],
    faq: [
      {
        q: 'Le manifeste AgriStock remplace-t-il le certificat phytosanitaire officiel délivré par l\'ONSSA ?',
        qAr: 'هل بيان الشحن يعوض الشهادة الصحية النباتية الصادرة عن أونسا؟',
        qEn: 'Does the AgriStock manifest replace the official ONSSA phytosanitary certificate?',
        a: 'Non, il s\'agit du manifeste d\'expédition et de conditionnement standardisé qui accompagne le lot et regroupe l\'ensemble des références réglementaires (n° certificat ONSSA, agrément station EACCE, DUM BADR). L\'inspection physique et l\'émission du certificat phytosanitaire original restent de la compétence exclusive des inspecteurs de l\'ONSSA.',
        aAr: 'لا، بل هو بيان الشحن والتعليب الموحد الذي يرافق الشحنة ويجمع كافة المراجع القانونية (رقم ترخيص أونسا، اعتماد محطة التلفيف، تصريح الجمارك)، بينما الفحص الفعلي وإصدار الشهادة الأصلية يبقى من اختصاص مصالح أونسا.',
        aEn: 'No, it is the standardized packing and shipping manifest that accompanies the lot and consolidates all regulatory references (ONSSA certificate #, Foodex station approval, BADR DUM #). Physical inspection and the original certificate remain the exclusive purview of ONSSA inspectors.',
      },
      {
        q: 'Puis-je exporter sous température dirigée vers l\'Afrique subsaharienne via Guerguerat ?',
        qAr: 'هل يمكن استخدام البيان للتصدير البري نحو دول غرب إفريقيا عبر معبر الكركرات؟',
        qEn: 'Can I use this manifest for temperature-controlled overland export to West Africa via Guerguerat?',
        a: 'Absolument. Le module prend en charge les trajets terrestres via le poste frontière de Guerguerat avec suivi du camion TIR frigo et fiches de température adaptées aux longs trajets.',
        aAr: 'نعم بالتأكيد، يدعم النظام مسارات النقل البري عبر معبر الكركرات مع تسجيل بيانات شاحنات التبريد وسائقي الرحلات الطويلة.',
        aEn: 'Absolutely. The platform supports overland road freight through the Guerguerat border crossing with refrigerated TIR tracking and thermal monitoring adapted to long desert journeys.',
      },
    ],
  },
  {
    id: 'offline-pwa',
    title: '11. Utilisation au Champ, Hors-Ligne (PWA) & F.A.Q.',
    titleAr: '11. الاستعمال في الحقل، العمل بدون إنترنت (PWA) والأسئلة الشائعة',
    badge: 'Mode Terrain',
    badgeAr: 'تطبيق الحقل',
    iconName: 'Smartphone',
    summary: 'AgriMaroc a été pensée pour les conditions réelles du monde rural marocain : elle fonctionne sans réseau dans vos serres ou au verger et s\'installe comme une application mobile Android.',
    summaryAr: 'تم تصميم المنصة لتناسب الواقع الفلاحي الميداني في البوادي والمشاتل: تشتغل بسلاسة بدون شبكة إنترنت وتثبت كتطبيق هاتف ذكي سريع.',
    steps: [
      {
        title: 'Installation sur Smartphone (PWA / Play Store)',
        titleAr: 'تثبيت التطبيق على الشاشة الرئيسية',
        desc: 'Ouvrez le menu de votre navigateur Chrome/Safari et cliquez sur "Ajouter à l\'écran d\'accueil" ou accédez à l\'onglet "App Android" pour installer l\'icône sur votre téléphone.',
        descAr: 'من متصفح هاتفك، اضغط على "Ajouter à l\'écran d\'accueil" لتثبيت أيقونة التطبيق في شاشة هاتفك مثل أي تطبيق عادي.',
      },
      {
        title: 'Consultation & Saisie Hors-Ligne',
        titleAr: 'تسجيل التعديلات بدون تغطية إنترنت',
        desc: 'Même au fond d\'un verger sans 4G, vous pouvez consulter vos lots, vérifier les QR codes et ajuster vos inventaires. Dès le retour du réseau, la synchronisation s\'opère sans conflit.',
        descAr: 'حتى في أعماق الضيعة دون تغطية 4G، يمكنك فحص الأصناف ومراجعة الكميات، وتتم المزامنة تلقائياً بمجرد توفر الاتصال.',
      },
      {
        title: 'Foire Aux Questions (F.A.Q.)',
        titleAr: 'أبرز الأسئلة الشائعة',
        desc: 'Retrouvez les réponses aux questions fréquentes des producteurs marocains ci-dessous.',
        descAr: 'إليك إجابات سريعة على التساؤلات الأكثر طرحاً من طرف الفلاحين والمشاتل.',
      },
    ],
    keyBenefits: [
      'Aucune perte de données lors des coupures de réseau en zone rurale',
      'Application ultra-légère ne consommant quasiment pas de données mobiles',
      'Support technique et accompagnement pour les exploitants agricoles',
    ],
    keyBenefitsAr: [
      'عدم ضياع أي معطيات عند انقطاع الشبكة في المناطق القروية',
      'تطبيق خفيف جداً يستهلك أقل قدر من رصيد الإنترنت',
      'مرافقة ومساعدة مستمرة للمهنيين الفلاحين في المغرب',
    ],
    faq: [
      {
        q: 'Comment contacter le service client en cas de problème sur une transaction ?',
        qAr: 'كيف أتواصل مع الدعم الفني في حال وجود استفسار حول معاملة؟',
        a: 'Par WhatsApp officiel ou par email d\'assistance disponible 7j/7 pour assister les producteurs et acheteurs.',
        aAr: 'عبر الواتساب الرسمي أو البريد الإلكتروني المتوفر طيلة أيام الأسبوع لمساعدة الفلاحين.',
      },
      {
        q: 'L\'application est-elle gratuite pour les petits agriculteurs ?',
        qAr: 'هل المنصة مجانية للفلاحين الصغار والمشاتل؟',
        a: 'Oui, l\'accès, la consultation des prix des marchés de gros et la publication des annonces de base sont 100% gratuits.',
        aAr: 'نعم، التصفح ومتابعة أسعار أسواق الجملة ونشر العروض الأساسية مجاني بالكامل.',
      },
    ],
  },
];

/**
 * Generates a clean, downloadable Markdown / Text User Manual document.
 */
export function generateUserManualMarkdown(lang: 'fr' | 'ar' | 'en' = 'fr'): string {
  const isAr = lang === 'ar';
  const isEn = lang === 'en';
  const locale = isAr ? 'ar-MA' : isEn ? 'en-US' : 'fr-FR';
  const dateStr = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isAr) {
    let md = `# دليل الاستعمال الرسمي - منصة أجري ماروك (AgriMaroc)\n`;
    md += `*تاريخ الإصدار: ${dateStr} | الإصدار: 2.6 | مطابقة معايير أونسا ONSSA وتصريح CNDP*\n\n`;
    md += `> المنصة الرقمية الأولى بالمملكة المغربية لمعاملات مشاتل الأشجار المعتمدة، الخضر والفواكه المجنية، والغلات على رؤوس أشجارها.\n\n`;
    md += `---\n\n`;

    USER_MANUAL_CHAPTERS.forEach((ch, idx) => {
      md += `## ${ch.titleAr}\n\n`;
      md += `**الملخص:** ${ch.summaryAr}\n\n`;
      md += `### الخطوات العملية:\n`;
      ch.steps.forEach((st, sIdx) => {
        md += `#### ${idx + 1}.${sIdx + 1} - ${st.titleAr}\n`;
        md += `${st.descAr}\n`;
        if (st.tipAr) {
          md += `*نصيحة عملية:* ${st.tipAr}\n`;
        }
        md += `\n`;
      });

      if (ch.keyBenefitsAr.length > 0) {
        md += `### الفوائد الرئيسية:\n`;
        ch.keyBenefitsAr.forEach(b => {
          md += `- ${b}\n`;
        });
        md += `\n`;
      }

      if (ch.faq && ch.faq.length > 0) {
        md += `### أسئلة شائعة:\n`;
        ch.faq.forEach(f => {
          md += `**س: ${f.qAr}**\n`;
          md += `ج: ${f.aAr}\n\n`;
        });
      }
      md += `---\n\n`;
    });

    md += `\n## الدعم الفني والمساعدة الرسمية\n`;
    md += `- البريد الإلكتروني: support@agrimaroc.ma\n`;
    md += `- الواتساب الفلاحي: +212 6 00 00 00 00\n`;
    md += `- المقر: القطب الفلاحي - مكناس / المحطة الفلاحية أكادير\n`;
    md += `\n*حقوق الطبع والنشر © 2026 AgriMaroc. جميع الحقوق محفوظة طبقاً للقانون المغربي 09-08.*`;
    return md;
  }

  if (isEn) {
    let md = `# OFFICIAL USER MANUAL — AGRIMAROC PLATFORM\n`;
    md += `*Complete Edition | Version 2.6 | Updated: ${dateStr}*\n`;
    md += `*Compliant with ONSSA Morocco standards, Morocco Foodex (EACCE) and CNDP Law 09-08*\n\n`;
    md += `> The premier B2B agricultural trading platform in Morocco for certified nursery stocks, fresh harvested produce and standing crop orchards with secured financial escrow.\n\n`;
    md += `--------------------------------------------------------------------------------\n\n`;

    md += `## TABLE OF CONTENTS\n`;
    USER_MANUAL_CHAPTERS.forEach((ch, idx) => {
      md += `${idx + 1}. ${ch.titleEn || ch.title} [${ch.badgeEn || ch.badge}]\n`;
    });
    md += `\n--------------------------------------------------------------------------------\n\n`;

    USER_MANUAL_CHAPTERS.forEach((ch, idx) => {
      md += `## ${ch.titleEn || ch.title}\n`;
      md += `**Badge:** ${ch.badgeEn || ch.badge}\n\n`;
      md += `### Executive Summary\n${ch.summaryEn || ch.summary}\n\n`;

      md += `### Step-by-Step Guide\n`;
      ch.steps.forEach((st, sIdx) => {
        md += `#### Step ${idx + 1}.${sIdx + 1}: ${st.titleEn || st.title}\n`;
        md += `${st.descEn || st.desc}\n`;
        if (st.tipEn || st.tip) {
          md += `> 💡 **Expert Tip:** ${st.tipEn || st.tip}\n`;
        }
        md += `\n`;
      });

      const benefits = (ch.keyBenefitsEn && ch.keyBenefitsEn.length > 0) ? ch.keyBenefitsEn : ch.keyBenefits;
      if (benefits.length > 0) {
        md += `### Key Operational Benefits\n`;
        benefits.forEach(b => {
          md += `- ✓ ${b}\n`;
        });
        md += `\n`;
      }

      if (ch.faq && ch.faq.length > 0) {
        md += `### Frequently Asked Questions\n`;
        ch.faq.forEach(f => {
          md += `**Q: ${f.qEn || f.q}**\n`;
          md += `A: ${f.aEn || f.a}\n\n`;
        });
      }

      md += `--------------------------------------------------------------------------------\n\n`;
    });

    md += `## CONTACT & TECHNICAL ASSISTANCE\n`;
    md += `- Technical Support: support@agrimaroc.ma\n`;
    md += `- Grower & Trader WhatsApp Support: +212 6 00 00 00 00\n`;
    md += `- ONSSA Partner Accreditation: Plant Protection Directorate\n`;
    md += `- CNDP Moroccan Data Protection: n° D-W-849/2026\n\n`;
    md += `*Document published and distributed by the AgriMaroc platform. Reproduction authorized for members of the accredited network.*`;
    return md;
  }

  // Default French version
  let md = `# MANUEL D'UTILISATION OFFICIEL — PLATEFORME AGRIMAROC\n`;
  md += `*Édition Complète | Version 2.6 | Mise à jour : ${dateStr}*\n`;
  md += `*Conforme aux standards ONSSA Maroc, CNDP Loi 09-08 et OMPIC*\n\n`;
  md += `> Plateforme B2B de référence au Maroc pour la gestion des pépinières certifiées, le négoce de fruits & légumes récoltés et la vente de vergers sur pied avec paiement sous séquestre sécurisé.\n\n`;
  md += `--------------------------------------------------------------------------------\n\n`;

  md += `## SOMMAIRE GÉNÉRAL\n`;
  USER_MANUAL_CHAPTERS.forEach((ch, idx) => {
    md += `${idx + 1}. ${ch.title} [${ch.badge}]\n`;
  });
  md += `\n--------------------------------------------------------------------------------\n\n`;

  USER_MANUAL_CHAPTERS.forEach((ch, idx) => {
    md += `## ${ch.title}\n`;
    md += `**Badge thématique :** ${ch.badge}\n\n`;
    md += `### Résumé Fonctionnel\n${ch.summary}\n\n`;

    md += `### Procédure Étape par Étape\n`;
    ch.steps.forEach((st, sIdx) => {
      md += `#### Étape ${idx + 1}.${sIdx + 1} : ${st.title}\n`;
      md += `${st.desc}\n`;
      if (st.tip) {
        md += `> 💡 **Conseil d'expert :** ${st.tip}\n`;
      }
      md += `\n`;
    });

    if (ch.keyBenefits.length > 0) {
      md += `### Avantages Clés pour l'Exploitant\n`;
      ch.keyBenefits.forEach(b => {
        md += `- ✓ ${b}\n`;
      });
      md += `\n`;
    }

    if (ch.faq && ch.faq.length > 0) {
      md += `### Questions Fréquentes du Chapitre\n`;
      ch.faq.forEach(f => {
        md += `**Q : ${f.q}**\n`;
        md += `R : ${f.a}\n\n`;
      });
    }

    md += `--------------------------------------------------------------------------------\n\n`;
  });

  md += `## CONTACT & ASSISTANCE TECHNIQUE AGRIMAROC\n`;
  md += `- Support Technique & Homologation : support@agrimaroc.ma\n`;
  md += `- WhatsApp Assistance Planteurs & Vendeurs : +212 6 00 00 00 00\n`;
  md += `- Agrément ONSSA Partenaires : Direction de la Protection des Végétaux\n`;
  md += `- Déclaration CNDP : n° D-W-849/2026 (Protection des données)\n`;
  md += `- Enregistrement OMPIC : n° 249104\n\n`;
  md += `*Document édité et distribué par la plateforme AgriMaroc. Reproduction autorisée pour les exploitants agricoles et pépiniéristes certifiés membres du réseau.*`;

  return md;
}

/**
 * Triggers an instant download of the manual as a formatted Markdown text file.
 */
export function downloadUserManualFile(lang: 'fr' | 'ar' | 'en' = 'fr'): void {
  const content = generateUserManualMarkdown(lang);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = lang === 'ar'
    ? `دليل_استعمال_أجري_ماروك_${new Date().toISOString().split('T')[0]}.md`
    : lang === 'en'
    ? `User_Manual_AgriMaroc_${new Date().toISOString().split('T')[0]}.md`
    : `Manuel_Utilisation_AgriMaroc_${new Date().toISOString().split('T')[0]}.md`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
