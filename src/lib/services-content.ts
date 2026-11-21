export type L = { en: string; ar: string };

export interface ServiceImage {
  src: string;
  alt: L;
  cap: L;
}

export interface ServiceBlock {
  id: string;
  eyebrow?: L;
  title: L;
  body?: L[];
  cards?: { t: L; d: L }[];
  list?: L[];
  image?: ServiceImage;
  tone?: "white" | "slate";
}

export interface ServicePage {
  slug: "warehousing" | "fiber-lab";
  icon: "warehouse" | "cable";
  inquiryService: "storage-inventory" | "fiber";
  eyebrow: L;
  title: L;
  sub: L;
  lead: L;
  hero: ServiceImage;
  blocks: ServiceBlock[];
  stepsTitle: L;
  steps: L[];
  prepareTitle: L;
  prepareIntro: L;
  prepare: L[];
  faqTitle: L;
  faq: { q: L; a: L }[];
  note: L;
  sources: { label: string; url: string }[];
}

export const IMAGES = {
  warehouse: {
    src: "/services/warehouse.jpg",
    alt: {
      en: "Storage racks holding containers and goods inside a warehouse.",
      ar: "أرفف تخزين عليها عبوات وبضائع داخل مخزن.",
    },
    cap: {
      en: "Illustrative storage photo, not a photo of ECOTECH's warehouses.",
      ar: "صورة توضيحية للتخزين، وليست صورة مخازن ECOTECH.",
    },
  },
  forklift: {
    src: "/services/forklift.jpg",
    alt: {
      en: "A forklift beside stacks of timber boards.",
      ar: "رافعة شوكية بجانب رصات من الألواح الخشبية.",
    },
    cap: {
      en: "Illustrative handling photo. It does not confirm the equipment available.",
      ar: "صورة توضيحية للمناولة، ولا تؤكد نوع المعدات المتاحة.",
    },
  },
  inventory: {
    src: "/services/inventory.jpg",
    alt: {
      en: "A person using a barcode scanner and tablet at warehouse racks.",
      ar: "شخص يستخدم قارئ باركود وجهازًا لوحيًا عند أرفف مخزن.",
    },
    cap: {
      en: "Illustrative inventory photo. It does not confirm the use of a specific device.",
      ar: "صورة توضيحية لمتابعة المخزون، ولا تؤكد استخدام جهاز بعينه.",
    },
  },
  fiber: {
    src: "/services/fiber.jpg",
    alt: {
      en: "Fiber-optic cables connected to a blue patch panel.",
      ar: "كابلات ألياف ضوئية متصلة بلوحة توزيع زرقاء.",
    },
    cap: {
      en: "Illustrative fiber connections, not a photo of the lab or its equipment.",
      ar: "صورة توضيحية لوصلات فايبر، وليست صورة المعمل أو أجهزته.",
    },
  },
} satisfies Record<string, ServiceImage>;

export const CREDITS: L = {
  en: "Photos: Tiger Lily, Mandiri Abadi and Brett Sayles via Pexels. Illustrative use under the Pexels license. No endorsement implied.",
  ar: "الصور: Tiger Lily وMandiri Abadi وBrett Sayles عبر Pexels. استخدام توضيحي بترخيص Pexels، بدون أي ادعاء تأييد.",
};

export const WAREHOUSING: ServicePage = {
  slug: "warehousing",
  icon: "warehouse",
  inquiryService: "storage-inventory",
  eyebrow: { en: "Service 1", ar: "الخدمة الأولى" },
  title: {
    en: "Warehousing & Inventory Management",
    ar: "التخزين وإدارة المخزون",
  },
  sub: {
    en: "Third-party storage in Cairo | Stock counts and item movement records",
    ar: "تخزين للغير في القاهرة | جرد ومتابعة حركة الأصناف",
  },
  lead: {
    en: "Storage space for every requirement, with inventory management alongside it. Share your business needs so we can discuss a suitable arrangement for your goods.",
    ar: "كل المساحات المطلوبة متوفرة، مع إدارة مخزون بجانبها. ابعت احتياج نشاطك ونحدد ترتيب التخزين المناسب لبضاعتك.",
  },
  hero: IMAGES.warehouse,
  blocks: [
    {
      id: "what",
      eyebrow: { en: "General information", ar: "معلومات عامة" },
      title: {
        en: "What is third-party storage?",
        ar: "يعني إيه تخزين للغير؟",
      },
      body: [
        {
          en: "Third-party storage means keeping your goods in a warehouse run by someone else. Your business keeps ownership of the stock, while the warehouse provides the space, the handling and the day-to-day control of where everything sits.",
          ar: "التخزين للغير معناه إن بضاعتك تتحفظ في مخزن بيديره طرف تاني. نشاطك بيفضل مالك البضاعة، والمخزن بيوفر المساحة والمناولة والتحكم اليومي في مكان كل صنف.",
        },
        {
          en: "It suits businesses that need room for stock without building, renting and staffing their own warehouse, or that need extra room for a season, a project or a large shipment.",
          ar: "ده مناسب للأنشطة اللي محتاجة مكان لبضاعتها من غير ما تبني أو تأجر وتشغل مخزن خاص بيها، أو محتاجة مساحة زيادة لموسم أو مشروع أو شحنة كبيرة.",
        },
      ],
      cards: [
        {
          t: { en: "Space when you need it", ar: "مساحة وقت ما تحتاجها" },
          d: {
            en: "Add or reduce storage as your stock changes, instead of committing to a building.",
            ar: "زوّد أو قلّل مساحة التخزين حسب حجم بضاعتك، بدل ما تلتزم بمبنى كامل.",
          },
        },
        {
          t: { en: "Focus on your business", ar: "ركّز على شغلك" },
          d: {
            en: "Storage handling and record keeping are done for you, so your team can focus on selling.",
            ar: "المناولة وتسجيل الحركة بيتعملوا عنك، وفريقك يركّز على البيع.",
          },
        },
        {
          t: { en: "Your goods stay yours", ar: "بضاعتك تفضل بضاعتك" },
          d: {
            en: "You keep ownership of the stock. The arrangement covers where it is kept and how it is handled.",
            ar: "بتفضل مالك البضاعة. الاتفاق بيغطي مكان حفظها وطريقة مناولتها.",
          },
        },
        {
          t: { en: "Clear records", ar: "سجلات واضحة" },
          d: {
            en: "Know what is stored, how much, and what moved in or out, agreed in the scope of work.",
            ar: "تعرف إيه المخزن وكميته وإيه اللي دخل وخرج، حسب النطاق المتفق عليه.",
          },
        },
      ],
    },
    {
      id: "who",
      title: { en: "Who third-party storage suits", ar: "التخزين للغير مناسب لمين؟" },
      tone: "slate",
      list: [
        { en: "Importers and traders holding stock between shipments and sales", ar: "المستوردين والتجار اللي بيحتفظوا ببضاعة بين الشحنات والمبيعات" },
        { en: "Manufacturers that need space for raw materials or finished goods", ar: "المصنّعين المحتاجين مكان للخامات أو المنتجات الجاهزة" },
        { en: "Online sellers and distributors with growing product ranges", ar: "البائعين أونلاين والموزعين اللي أصنافهم بتزيد" },
        { en: "Contractors and project teams that need to hold materials near a site", ar: "المقاولين وفرق المشاريع المحتاجة تحتفظ بمواد قريبة من الموقع" },
        { en: "Any business with seasonal peaks that exceed its own storage", ar: "أي نشاط عنده مواسم ذروة أكبر من مساحة تخزينه" },
      ],
    },
    {
      id: "arrangements",
      eyebrow: { en: "General information", ar: "معلومات عامة" },
      title: {
        en: "Common storage arrangements",
        ar: "ترتيبات التخزين الشائعة",
      },
      body: [
        {
          en: "In general, warehouses organise goods in a few common ways. Which one fits depends on what you store, how it is packed and how often it moves. We discuss the right arrangement for your goods when you send your inquiry.",
          ar: "بشكل عام، المخازن بتنظم البضاعة بكذا طريقة شائعة. اللي يناسبك بيعتمد على نوع بضاعتك وتغليفها وعدد مرات حركتها. بنناقش الترتيب المناسب لبضاعتك لما تبعت استفسارك.",
        },
      ],
      cards: [
        {
          t: { en: "Pallet racking", ar: "أرفف الباليتات" },
          d: {
            en: "Palletised goods stored on racks in levels, making good use of height and keeping each pallet accessible.",
            ar: "بضاعة على باليتات بتتخزن على أرفف في مستويات، بتستغل الارتفاع وبتخلي كل باليت سهل الوصول ليه.",
          },
        },
        {
          t: { en: "Floor and bulk storage", ar: "التخزين الأرضي والسائب" },
          d: {
            en: "Large or heavy items, or full pallet loads, kept at floor level in marked areas.",
            ar: "الأصناف الكبيرة أو التقيلة أو حمولات الباليتات الكاملة بتتحفظ على الأرض في مناطق معلّمة.",
          },
        },
        {
          t: { en: "Shelving for smaller items", ar: "أرفف للأصناف الأصغر" },
          d: {
            en: "Cartons and smaller items kept on shelves or in bins with their own locations.",
            ar: "الكراتين والأصناف الصغيرة على أرفف أو صناديق، وكل واحد له مكانه.",
          },
        },
        {
          t: { en: "Goods with special needs", ar: "بضاعة ليها متطلبات خاصة" },
          d: {
            en: "Some goods need particular handling or conditions. Tell us early so we can discuss what is possible.",
            ar: "بعض البضاعة محتاجة مناولة أو ظروف معينة. قولنا بدري عشان نناقش المتاح.",
          },
        },
      ],
      image: IMAGES.forklift,
    },
    {
      id: "inventory",
      eyebrow: { en: "Inventory management", ar: "إدارة المخزون" },
      title: {
        en: "Inventory management alongside storage",
        ar: "إدارة المخزون بجانب التخزين",
      },
      body: [
        {
          en: "Inventory management is the routine of knowing what you hold, where it is and how it moves. Accurate records are the base for everything else: if the system and the shelf disagree, orders and reorders are made on wrong numbers.",
          ar: "إدارة المخزون هي إنك تعرف عندك إيه، وفين، وبيتحرك إزاي. السجلات الدقيقة هي الأساس لكل حاجة: لو السجل والرف مش متطابقين، الطلبات وإعادة الشراء بتتم على أرقام غلط.",
        },
        {
          en: "Stock counts and item movement records come with storage, with the operating scope and details agreed around your business needs.",
          ar: "الجرد وسجل حركة الأصناف بيجوا مع التخزين، بنطاق عمل وتفاصيل تنفيذ نتفق عليها حسب احتياج نشاطك.",
        },
      ],
      image: IMAGES.inventory,
      cards: [
        {
          t: { en: "Receiving checks", ar: "مراجعة الاستلام" },
          d: {
            en: "Goods are counted and checked against your delivery details when they arrive, so differences show up on day one.",
            ar: "البضاعة بتتعد وتتراجع على بيانات التسليم وقت وصولها، فأي فرق يبان من أول يوم.",
          },
        },
        {
          t: { en: "Locations and labels", ar: "أماكن وملصقات" },
          d: {
            en: "Each item type gets a known location, often with a label or barcode, so it can be found quickly.",
            ar: "كل صنف له مكان معروف، وغالبا بملصق أو باركود، عشان يتلاقى بسرعة.",
          },
        },
        {
          t: { en: "Regular counts", ar: "جرد منتظم" },
          d: {
            en: "Cycle counting checks selected items or locations throughout the year instead of one big annual count, so errors are caught sooner.",
            ar: "الجرد الدوري بيراجع أصناف أو أماكن مختارة على مدار السنة بدل جرد سنوي كبير، فالأخطاء بتتكشف أسرع.",
          },
        },
        {
          t: { en: "Stock rotation", ar: "تدوير المخزون" },
          d: {
            en: "Rules such as first in, first out (FIFO), or first expired, first out (FEFO) for dated goods, keep older stock moving.",
            ar: "قواعد زي الداخل أولا يخرج أولا (FIFO)، أو الأقرب انتهاء يخرج أولا (FEFO) للبضاعة اللي ليها تاريخ صلاحية، بتخلي الأقدم يتحرك.",
          },
        },
        {
          t: { en: "Focus on key items", ar: "تركيز على الأصناف المهمة" },
          d: {
            en: "ABC analysis groups items by value and demand, so the most important items get the closest attention.",
            ar: "تحليل ABC بيقسم الأصناف حسب القيمة والطلب، فالأصناف الأهم بتاخد أكبر اهتمام.",
          },
        },
        {
          t: { en: "Movement records", ar: "سجل الحركة" },
          d: {
            en: "A record of what came in, what went out and what remains, shared in a format agreed with you.",
            ar: "سجل بإيه اللي دخل وإيه اللي خرج وإيه المتبقي، بيتشارك معاك بصيغة نتفق عليها.",
          },
        },
      ],
    },
  ],
  stepsTitle: { en: "From inquiry to an agreed scope", ar: "من استفسارك لاتفاق واضح" },
  steps: [
    { en: "Tell us the goods, quantity and storage period.", ar: "ابعت نوع البضاعة والكمية ومدة التخزين." },
    { en: "Agree the space, services and operating details before starting.", ar: "نتفق على المساحة والخدمات وتفاصيل التنفيذ قبل البدء." },
    { en: "Define receiving, counting, follow-up and release procedures within the agreed scope.", ar: "نحدد طريقة الاستلام والجرد والمتابعة والصرف حسب النطاق المتفق عليه." },
  ],
  prepareTitle: { en: "What to share in your inquiry", ar: "إيه اللي تبعته في استفسارك" },
  prepareIntro: {
    en: "The more detail you share, the easier it is to discuss a suitable arrangement.",
    ar: "كل ما تبعت تفاصيل أكتر، كان أسهل نناقش الترتيب المناسب.",
  },
  prepare: [
    { en: "Type of goods and how they are packed (cartons, pallets, drums, loose items)", ar: "نوع البضاعة وطريقة تغليفها (كراتين، باليتات، براميل، أصناف سائبة)" },
    { en: "Quantity, and approximate size and weight of each unit or pallet", ar: "الكمية، والحجم والوزن التقريبي لكل وحدة أو باليت" },
    { en: "How long you need storage, and when goods will arrive", ar: "مدة التخزين المطلوبة وموعد وصول البضاعة" },
    { en: "How often goods go in and out", ar: "عدد مرات دخول وخروج البضاعة" },
    { en: "Any special handling or conditions your goods need", ar: "أي مناولة أو ظروف خاصة تحتاجها بضاعتك" },
    { en: "The records or reports you would like to receive", ar: "السجلات أو التقارير اللي حابب تستلمها" },
  ],
  faqTitle: { en: "Common questions", ar: "أسئلة شائعة" },
  faq: [
    {
      q: { en: "Do I still own my goods?", ar: "هفضل مالك البضاعة؟" },
      a: {
        en: "In a typical third-party storage arrangement the owner keeps ownership of the goods, and the warehouse keeps them in its custody. The exact terms are agreed in writing for each case.",
        ar: "في ترتيب التخزين للغير المعتاد، صاحب البضاعة بيفضل مالكها، والمخزن بيحتفظ بيها في عهدته. الشروط بالتفصيل بتتفق عليها كتابة في كل حالة.",
      },
    },
    {
      q: { en: "Can I add or reduce space later?", ar: "أقدر أزوّد أو أقلّل المساحة بعدين؟" },
      a: {
        en: "Flexibility is one of the main reasons businesses use third-party storage. We discuss how changes in space are handled when we agree the scope.",
        ar: "المرونة من أهم أسباب استخدام التخزين للغير. بنناقش طريقة التعامل مع تغيير المساحة وقت الاتفاق على النطاق.",
      },
    },
    {
      q: { en: "What does inventory management include?", ar: "إدارة المخزون بتشمل إيه؟" },
      a: {
        en: "Typically stock counts and records of item movement. The exact scope, how often counts happen and what reports you receive are agreed around your business needs.",
        ar: "عادة الجرد وسجلات حركة الأصناف. النطاق بالتفصيل وعدد مرات الجرد والتقارير اللي هتستلمها بنتفق عليها حسب احتياج نشاطك.",
      },
    },
    {
      q: { en: "How do I start?", ar: "أبدأ إزاي؟" },
      a: {
        en: "Use the inquiry form below or contact us on WhatsApp with the goods, quantity and storage period.",
        ar: "استخدم نموذج الاستفسار تحت أو كلمنا على واتساب بنوع البضاعة والكمية ومدة التخزين.",
      },
    },
  ],
  note: {
    en: "General information about warehousing and inventory practice. It describes common industry approaches and is not a statement of ECOTECH's equipment, systems or facilities. Scope and details are agreed for each inquiry.",
    ar: "معلومات عامة عن ممارسات التخزين وإدارة المخزون. بتوصف الطرق الشائعة في المجال، وليست بيانا بمعدات أو أنظمة أو منشآت ECOTECH. النطاق والتفاصيل بتتفق عليها في كل استفسار.",
  },
  sources: [
    { label: "Maersk: inventory management strategies", url: "https://www.maersk.com/logistics-explained/supply-chain-management/2024/02/20/nine-inventory-management-strategies" },
    { label: "Kardex: warehouse inventory management", url: "https://www.kardex.com/en-us/blog/warehouse-inventory-management" },
    { label: "3PL Center: 3PL inventory management", url: "https://3plcenter.com/3pl-inventory-management-services/" },
  ],
};

export const FIBER_LAB: ServicePage = {
  slug: "fiber-lab",
  icon: "cable",
  inquiryService: "fiber",
  eyebrow: { en: "Service 2", ar: "الخدمة الثانية" },
  title: {
    en: "Fiber-Optic Cable Maintenance & Testing Lab",
    ar: "معمل صيانة واختبار كابلات الفايبر",
  },
  sub: {
    en: "Maintenance and testing of fiber-optic cables for third parties",
    ar: "صيانة واختبار كابلات الفايبر للغير",
  },
  lead: {
    en: "Need maintenance or testing for fiber-optic cables? The lab offers fiber cable maintenance and testing for third parties. Share the cable type, quantity and fault or testing requirement to agree the work scope.",
    ar: "عندك كابلات فايبر محتاجة صيانة أو اختبار؟ المعمل بيقدم صيانة واختبار كابلات الفايبر للغير. ابعت نوع الكابل والعدد ووصف العطل أو الاختبار المطلوب عشان نحدد نطاق الشغل.",
  },
  hero: IMAGES.fiber,
  blocks: [
    {
      id: "what",
      eyebrow: { en: "General information", ar: "معلومات عامة" },
      title: {
        en: "Why fiber cables are tested and maintained",
        ar: "ليه بنختبر ونصون كابلات الفايبر؟",
      },
      body: [
        {
          en: "Fiber-optic cables carry data as pulses of light through glass strands thinner than a human hair. That gives very high capacity, but it also means small problems, such as a speck of dust on a connector or a tight bend, can reduce the signal.",
          ar: "كابلات الفايبر بتنقل البيانات كنبضات ضوء جوه ألياف زجاجية أرفع من شعرة الإنسان. ده بيدي سعة عالية جدا، لكن كمان معناه إن مشاكل صغيرة، زي ذرة تراب على الكونكتور أو انحناء حاد، ممكن تضعف الإشارة.",
        },
        {
          en: "Testing shows whether a cable or link performs as expected before it goes into use and after a fault. Maintenance restores connections that are dirty, damaged or worn.",
          ar: "الاختبار بيوضح هل الكابل أو الوصلة بتشتغل زي المتوقع قبل التشغيل وبعد أي عطل. والصيانة بترجّع الوصلات اللي اتوسخت أو اتضرّرت أو اتهالكت.",
        },
      ],
      cards: [
        {
          t: { en: "Before use", ar: "قبل التشغيل" },
          d: {
            en: "Check a new or installed link so problems are found before equipment depends on it.",
            ar: "فحص وصلة جديدة أو متركبة عشان المشاكل تتكشف قبل ما الأجهزة تعتمد عليها.",
          },
        },
        {
          t: { en: "After a fault", ar: "بعد العطل" },
          d: {
            en: "Locate where a link has degraded or broken, and find out what needs repair.",
            ar: "تحديد مكان ضعف أو قطع الوصلة ومعرفة المطلوب إصلاحه.",
          },
        },
        {
          t: { en: "Routine care", ar: "عناية دورية" },
          d: {
            en: "Inspect and clean connections as part of regular upkeep to keep links stable.",
            ar: "فحص وتنظيف الوصلات كجزء من الصيانة الدورية عشان تفضل مستقرة.",
          },
        },
      ],
      image: IMAGES.fiber,
    },
    {
      id: "causes",
      title: { en: "Common causes of fiber link problems", ar: "أسباب شائعة لمشاكل وصلات الفايبر" },
      tone: "slate",
      body: [
        {
          en: "Industry bodies such as the Fiber Optic Association and the TIA Fiber Optics Technology Consortium point to dirty connectors as the leading cause of fiber network problems. The dirt is often invisible to the naked eye, yet a fiber core is only about 8 microns wide in single-mode and 50 microns in multimode cable.",
          ar: "جهات متخصصة في المجال زي Fiber Optic Association وTIA Fiber Optics Technology Consortium بتشير إن الكونكتورات المتسخة هي السبب الأول لمشاكل شبكات الفايبر. التراب غالبا مش بيبان بالعين، ونواة الفايبر عرضها حوالي 8 ميكرون في السينجل مود و50 ميكرون في المالتي مود.",
        },
      ],
      list: [
        { en: "Dust, skin oil or residue on connector end faces", ar: "تراب أو دهون أو بقايا على أطراف الكونكتورات" },
        { en: "Scratched or damaged connectors", ar: "كونكتورات مخدوشة أو متضررة" },
        { en: "Bends tighter than the cable allows, or crushed cable", ar: "انحناءات أحد من المسموح، أو كابل مضغوط" },
        { en: "Breaks or cuts in the cable", ar: "كسر أو قطع في الكابل" },
        { en: "Poor splices or mismatched connections", ar: "لحامات ضعيفة أو توصيلات غير متوافقة" },
      ],
    },
    {
      id: "methods",
      eyebrow: { en: "General information", ar: "معلومات عامة" },
      title: {
        en: "Methods commonly used in the industry",
        ar: "الطرق الشائعة الاستخدام في المجال",
      },
      body: [
        {
          en: "The cabling standard ANSI/TIA-568.3 describes two tiers of testing. Tier 1 is the basic level: measuring how much light is lost along the link, checking length and checking polarity. Tier 2 adds an OTDR trace and inspection of connector end faces. These are general industry methods. The methods and equipment used on your job are confirmed when the scope is agreed.",
          ar: "معيار الكابلات ANSI/TIA-568.3 بيوصف مستويين للاختبار. المستوى الأول هو الأساسي: قياس فقد الضوء على الوصلة وفحص الطول وفحص الاتجاه (polarity). والمستوى الثاني بيضيف تتبّع OTDR وفحص أطراف الكونكتورات. دي طرق عامة في المجال. الطرق والأجهزة المستخدمة في شغلك بتتأكد وقت الاتفاق على النطاق.",
        },
      ],
      cards: [
        {
          t: { en: "Visual and end-face inspection", ar: "الفحص البصري وفحص الأطراف" },
          d: {
            en: "Looking at connector end faces with a magnifying inspection scope to see dirt or damage before connecting.",
            ar: "فحص أطراف الكونكتورات بمجهر فحص مكبّر لرؤية التراب أو التلف قبل التوصيل.",
          },
        },
        {
          t: { en: "Cleaning", ar: "التنظيف" },
          d: {
            en: "Cleaning connectors with tools made for fiber, then checking again, since dirt is a leading cause of faults.",
            ar: "تنظيف الكونكتورات بأدوات مخصصة للفايبر ثم إعادة الفحص، لأن التراب من أهم أسباب الأعطال.",
          },
        },
        {
          t: { en: "Loss testing", ar: "قياس الفقد" },
          d: {
            en: "A light source and power meter measure how much light is lost across the link, compared with the expected limit.",
            ar: "مصدر ضوء وجهاز قياس قدرة بيقيسوا كمية الضوء المفقودة على الوصلة ومقارنتها بالحد المتوقع.",
          },
        },
        {
          t: { en: "OTDR tracing", ar: "تتبّع OTDR" },
          d: {
            en: "An optical time-domain reflectometer sends pulses along the fiber and shows a trace of its length and where events such as connectors, splices or breaks occur.",
            ar: "جهاز OTDR بيبعت نبضات على طول الفايبر ويعرض تتبّعا لطوله ومكان الأحداث زي الكونكتورات واللحامات أو الكسر.",
          },
        },
        {
          t: { en: "Length and polarity checks", ar: "فحص الطول والاتجاه" },
          d: {
            en: "Confirming the length of a link and that transmit and receive fibers are connected the right way round.",
            ar: "التأكد من طول الوصلة ومن إن ألياف الإرسال والاستقبال متوصلة بالاتجاه الصحيح.",
          },
        },
        {
          t: { en: "Test records", ar: "تسجيل النتائج" },
          d: {
            en: "Results are written up so you can see what was measured. The format is agreed with you.",
            ar: "النتائج بتتسجل عشان تشوف إيه اللي اتقاس. والصيغة بنتفق عليها معاك.",
          },
        },
      ],
    },
    {
      id: "types",
      title: { en: "Fiber types and connectors, in brief", ar: "أنواع الفايبر والكونكتورات باختصار" },
      tone: "slate",
      cards: [
        {
          t: { en: "Single-mode fiber", ar: "فايبر سينجل مود" },
          d: {
            en: "A very small core, about 8 to 9 microns, used for long distances and high bandwidth.",
            ar: "نواة صغيرة جدا، حوالي 8 إلى 9 ميكرون، بتُستخدم للمسافات الطويلة والسعات العالية.",
          },
        },
        {
          t: { en: "Multimode fiber", ar: "فايبر مالتي مود" },
          d: {
            en: "A larger core, commonly 50 microns, used for shorter links such as inside buildings and data rooms.",
            ar: "نواة أكبر، غالبا 50 ميكرون، بتُستخدم للوصلات الأقصر زي جوه المباني وغرف البيانات.",
          },
        },
        {
          t: { en: "Connectors and patch panels", ar: "الكونكتورات ولوحات التوزيع" },
          d: {
            en: "Common connector styles include LC and SC. Patch cords plug into patch panels that organise many links in one place.",
            ar: "من أنواع الكونكتورات الشائعة LC وSC. وباتش كورد بيتوصل في لوحات توزيع بتنظم عدة وصلات في مكان واحد.",
          },
        },
      ],
    },
  ],
  stepsTitle: { en: "From inquiry to an agreed scope", ar: "من استفسارك لاتفاق واضح" },
  steps: [
    { en: "Tell us the cable type, quantity and the fault or testing you need.", ar: "ابعت نوع الكابل والعدد والعطل أو الاختبار المطلوب." },
    { en: "Agree the work scope, methods and how results are reported before starting.", ar: "نتفق على نطاق الشغل والطرق وطريقة عرض النتائج قبل البدء." },
    { en: "Carry out the agreed work and share the results in the agreed format.", ar: "ننفذ الشغل المتفق عليه ونشارك النتائج بالصيغة المتفق عليها." },
  ],
  prepareTitle: { en: "What to share in your inquiry", ar: "إيه اللي تبعته في استفسارك" },
  prepareIntro: {
    en: "A few details help define the work scope.",
    ar: "كام تفصيلة بتساعد في تحديد نطاق الشغل.",
  },
  prepare: [
    { en: "Cable type, if known: single-mode or multimode, and connector style", ar: "نوع الكابل لو معروف: سينجل مود أو مالتي مود، ونوع الكونكتور" },
    { en: "Number of cables or links, and approximate lengths", ar: "عدد الكابلات أو الوصلات والأطوال التقريبية" },
    { en: "A description of the fault, or the testing you need", ar: "وصف العطل أو الاختبار المطلوب" },
    { en: "Where the cables are, and whether they are installed or loose", ar: "مكان الكابلات، وهل هي متركبة أو سائبة" },
    { en: "Any test results or records you already have", ar: "أي نتائج اختبار أو سجلات موجودة عندك" },
    { en: "When you need the work done", ar: "الموعد المطلوب لتنفيذ الشغل" },
  ],
  faqTitle: { en: "Common questions", ar: "أسئلة شائعة" },
  faq: [
    {
      q: { en: "Which cables can you work on?", ar: "إيه الكابلات اللي تشتغلوا عليها؟" },
      a: {
        en: "Send the cable type, quantity and what you need. We confirm what the lab can do and agree the scope before any work starts.",
        ar: "ابعت نوع الكابل والعدد والمطلوب. بنأكد إيه اللي المعمل يقدر يعمله ونتفق على النطاق قبل بدء أي شغل.",
      },
    },
    {
      q: { en: "What is the difference between loss testing and an OTDR trace?", ar: "إيه الفرق بين قياس الفقد وتتبّع OTDR؟" },
      a: {
        en: "In general, loss testing measures the total light lost across a link, while an OTDR trace shows the link along its length and where events such as splices, connectors or breaks sit.",
        ar: "بشكل عام، قياس الفقد بيقيس إجمالي الضوء المفقود على الوصلة، بينما تتبّع OTDR بيعرض الوصلة على طولها ومكان الأحداث زي اللحامات والكونكتورات أو الكسر.",
      },
    },
    {
      q: { en: "Can a dirty connector really cause problems?", ar: "الكونكتور المتسخ ممكن فعلا يسبب مشاكل؟" },
      a: {
        en: "Yes. Dirty connectors are widely reported as a leading cause of fiber network problems, which is why inspection and cleaning are common first steps.",
        ar: "أيوه. الكونكتورات المتسخة بيتم الإبلاغ عنها على نطاق واسع كسبب رئيسي لمشاكل شبكات الفايبر، علشان كده الفحص والتنظيف غالبا أول خطوة.",
      },
    },
    {
      q: { en: "How do I start?", ar: "أبدأ إزاي؟" },
      a: {
        en: "Use the inquiry form below or contact us on WhatsApp with the cable type, quantity and your requirement.",
        ar: "استخدم نموذج الاستفسار تحت أو كلمنا على واتساب بنوع الكابل والعدد والمطلوب.",
      },
    },
  ],
  note: {
    en: "General information about fiber-optic testing and maintenance. It describes common industry methods and standards and is not a statement of the lab's equipment, accreditation or capabilities. Scope, methods and reporting are agreed for each inquiry.",
    ar: "معلومات عامة عن اختبار وصيانة الفايبر. بتوصف الطرق والمعايير الشائعة في المجال، وليست بيانا بمعدات أو اعتماد أو قدرات المعمل. النطاق والطرق وطريقة التقرير بتتفق عليها في كل استفسار.",
  },
  sources: [
    { label: "Corning: Tier 1 and Tier 2 testing (TIA-568.3)", url: "https://www.corning.com/catalog/coc/documents/misc/LAN-1561-AEN.pdf" },
    { label: "TIA FOTC: fiber testing and inspection", url: "https://www.tiafotc.org/fiber-testing-inspection/" },
    { label: "Fiber Optic Reference: ANSI/TIA-568.3-E", url: "https://www.fiberopticreference.com/standards/tia-568-3-e/" },
  ],
};

export const PAGES: Record<string, ServicePage> = {
  warehousing: WAREHOUSING,
  "fiber-lab": FIBER_LAB,
};
