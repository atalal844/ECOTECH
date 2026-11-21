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
      ar: "صورة توضيحية لوصلات الألياف الضوئية، وليست صورة المعمل أو أجهزته.",
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
    ar: "تخزين للغير في القاهرة | جرد ومتابعة لحركة الأصناف",
  },
  lead: {
    en: "Storage space for every requirement, with inventory management alongside it. Share your business needs so we can discuss a suitable arrangement for your goods.",
    ar: "مساحات التخزين المطلوبة متاحة، مع إدارة للمخزون إلى جانبها. أرسلوا احتياجات نشاطكم لنحدد ترتيب التخزين المناسب لبضاعتكم.",
  },
  hero: IMAGES.warehouse,
  blocks: [
    {
      id: "what",
      eyebrow: { en: "General information", ar: "معلومات عامة" },
      title: {
        en: "What is third-party storage?",
        ar: "ما المقصود بالتخزين للغير؟",
      },
      body: [
        {
          en: "Third-party storage means keeping your goods in a warehouse run by someone else. Your business keeps ownership of the stock, while the warehouse provides the space, the handling and the day-to-day control of where everything sits.",
          ar: "التخزين للغير يعني أن تُحفظ بضاعتكم في مخزن يديره طرف آخر. وتبقون أنتم مالكي البضاعة، بينما يوفر المخزن المساحة والمناولة والمتابعة اليومية لموضع كل صنف.",
        },
        {
          en: "It suits businesses that need room for stock without building, renting and staffing their own warehouse, or that need extra room for a season, a project or a large shipment.",
          ar: "وهو مناسب للأنشطة التي تحتاج إلى مكان لبضاعتها دون بناء مخزن خاص أو استئجاره وتشغيله، أو التي تحتاج إلى مساحة إضافية لموسم أو مشروع أو شحنة كبيرة.",
        },
      ],
      cards: [
        {
          t: { en: "Space when you need it", ar: "مساحة عند الحاجة" },
          d: {
            en: "Add or reduce storage as your stock changes, instead of committing to a building.",
            ar: "زيدوا مساحة التخزين أو قلّلوها بحسب حجم بضاعتكم، بدلًا من الالتزام بمبنى كامل.",
          },
        },
        {
          t: { en: "Focus on your business", ar: "ركّزوا على عملكم" },
          d: {
            en: "Storage handling and record keeping are done for you, so your team can focus on selling.",
            ar: "تتولى الجهة المشغّلة المناولة وتسجيل الحركة، ويتفرغ فريقكم للبيع.",
          },
        },
        {
          t: { en: "Your goods stay yours", ar: "بضاعتكم تبقى ملكًا لكم" },
          d: {
            en: "You keep ownership of the stock. The arrangement covers where it is kept and how it is handled.",
            ar: "تبقون مالكي البضاعة، ويغطي الاتفاق مكان حفظها وطريقة مناولتها.",
          },
        },
        {
          t: { en: "Clear records", ar: "سجلات واضحة" },
          d: {
            en: "Know what is stored, how much, and what moved in or out, agreed in the scope of work.",
            ar: "تعرفون ما هو مخزّن وكميته وما دخل وما خرج، وفق النطاق المتفق عليه.",
          },
        },
      ],
    },
    {
      id: "who",
      title: { en: "Who third-party storage suits", ar: "لمن يناسب التخزين للغير؟" },
      tone: "slate",
      list: [
        { en: "Importers and traders holding stock between shipments and sales", ar: "المستوردون والتجار الذين يحتفظون بالبضائع بين الشحنات والمبيعات" },
        { en: "Manufacturers that need space for raw materials or finished goods", ar: "المصنّعون الذين يحتاجون إلى مكان للخامات أو للمنتجات الجاهزة" },
        { en: "Online sellers and distributors with growing product ranges", ar: "البائعون عبر الإنترنت والموزعون الذين تتزايد أصنافهم" },
        { en: "Contractors and project teams that need to hold materials near a site", ar: "المقاولون وفرق المشاريع التي تحتاج إلى حفظ المواد قرب الموقع" },
        { en: "Any business with seasonal peaks that exceed its own storage", ar: "أي نشاط تتجاوز مواسم ذروته طاقة مساحة التخزين لديه" },
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
          ar: "بوجه عام، تنظّم المخازن البضائع بعدة طرق شائعة، ويعتمد الأنسب منها على نوع بضاعتكم وتغليفها وعدد مرات حركتها. ونناقش الترتيب المناسب عند إرسال استفساركم.",
        },
      ],
      cards: [
        {
          t: { en: "Pallet racking", ar: "أرفف الباليتات" },
          d: {
            en: "Palletised goods stored on racks in levels, making good use of height and keeping each pallet accessible.",
            ar: "تُخزَّن البضائع المحمّلة على باليتات فوق أرفف متعددة المستويات، مما يستفيد من الارتفاع ويسهّل الوصول إلى كل باليت.",
          },
        },
        {
          t: { en: "Floor and bulk storage", ar: "التخزين الأرضي والسائب" },
          d: {
            en: "Large or heavy items, or full pallet loads, kept at floor level in marked areas.",
            ar: "تُحفظ الأصناف الكبيرة أو الثقيلة أو حمولات الباليتات الكاملة على الأرض في مناطق محددة.",
          },
        },
        {
          t: { en: "Shelving for smaller items", ar: "أرفف للأصناف الأصغر" },
          d: {
            en: "Cartons and smaller items kept on shelves or in bins with their own locations.",
            ar: "توضع الكراتين والأصناف الصغيرة على أرفف أو في صناديق، ولكل منها مكانه المحدد.",
          },
        },
        {
          t: { en: "Goods with special needs", ar: "بضائع ذات متطلبات خاصة" },
          d: {
            en: "Some goods need particular handling or conditions. Tell us early so we can discuss what is possible.",
            ar: "تحتاج بعض البضائع إلى مناولة أو ظروف معينة. أخبرونا بذلك مبكرًا لنناقش المتاح.",
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
        ar: "إدارة المخزون إلى جانب التخزين",
      },
      body: [
        {
          en: "Inventory management is the routine of knowing what you hold, where it is and how it moves. Accurate records are the base for everything else: if the system and the shelf disagree, orders and reorders are made on wrong numbers.",
          ar: "إدارة المخزون هي أن تعرفوا ما لديكم، وأين يوجد، وكيف يتحرك. والسجلات الدقيقة هي الأساس في ذلك: فإذا لم يتطابق السجل مع الرف، جرى الطلب وإعادة الشراء على أرقام غير صحيحة.",
        },
        {
          en: "Stock counts and item movement records come with storage, with the operating scope and details agreed around your business needs.",
          ar: "يُقدَّم الجرد وسجل حركة الأصناف مع خدمة التخزين، بنطاق عمل وتفاصيل تنفيذ يُتفق عليها وفق احتياج نشاطكم.",
        },
      ],
      image: IMAGES.inventory,
      cards: [
        {
          t: { en: "Receiving checks", ar: "مراجعة الاستلام" },
          d: {
            en: "Goods are counted and checked against your delivery details when they arrive, so differences show up on day one.",
            ar: "تُعدّ البضاعة وتُطابق ببيانات التسليم عند وصولها، فيظهر أي فرق منذ اليوم الأول.",
          },
        },
        {
          t: { en: "Locations and labels", ar: "المواقع والملصقات" },
          d: {
            en: "Each item type gets a known location, often with a label or barcode, so it can be found quickly.",
            ar: "لكل صنف موضع معروف، وغالبًا ما يكون بملصق أو باركود، ليسهل العثور عليه بسرعة.",
          },
        },
        {
          t: { en: "Regular counts", ar: "جرد منتظم" },
          d: {
            en: "Cycle counting checks selected items or locations throughout the year instead of one big annual count, so errors are caught sooner.",
            ar: "يراجع الجرد الدوري أصنافًا أو مواقع مختارة على مدار السنة بدلًا من جرد سنوي كبير، فتُكتشف الأخطاء أسرع.",
          },
        },
        {
          t: { en: "Stock rotation", ar: "تدوير المخزون" },
          d: {
            en: "Rules such as first in, first out (FIFO), or first expired, first out (FEFO) for dated goods, keep older stock moving.",
            ar: "قواعد مثل: الداخل أولًا يخرج أولًا (FIFO)، أو الأقرب انتهاءً يخرج أولًا (FEFO) للبضائع ذات تاريخ الصلاحية، تضمن تحريك الأقدم أولًا.",
          },
        },
        {
          t: { en: "Focus on key items", ar: "تركيز على الأصناف المهمة" },
          d: {
            en: "ABC analysis groups items by value and demand, so the most important items get the closest attention.",
            ar: "يقسّم تحليل ABC الأصناف بحسب القيمة والطلب، فتنال الأصناف الأهم أكبر قدر من الاهتمام.",
          },
        },
        {
          t: { en: "Movement records", ar: "سجل الحركة" },
          d: {
            en: "A record of what came in, what went out and what remains, shared in a format agreed with you.",
            ar: "سجل بما دخل وما خرج وما تبقّى، يُشارَك معكم بصيغة يُتفق عليها.",
          },
        },
      ],
    },
  ],
  stepsTitle: { en: "From inquiry to an agreed scope", ar: "من الاستفسار إلى اتفاق واضح" },
  steps: [
    { en: "Tell us the goods, quantity and storage period.", ar: "أرسلوا نوع البضاعة والكمية ومدة التخزين." },
    { en: "Agree the space, services and operating details before starting.", ar: "نتفق على المساحة والخدمات وتفاصيل التنفيذ قبل البدء." },
    { en: "Define receiving, counting, follow-up and release procedures within the agreed scope.", ar: "نحدد طريقة الاستلام والجرد والمتابعة والصرف وفق النطاق المتفق عليه." },
  ],
  prepareTitle: { en: "What to share in your inquiry", ar: "ما الذي ترسلونه في استفساركم" },
  prepareIntro: {
    en: "The more detail you share, the easier it is to discuss a suitable arrangement.",
    ar: "كلما زادت التفاصيل التي ترسلونها، سهل علينا مناقشة الترتيب المناسب.",
  },
  prepare: [
    { en: "Type of goods and how they are packed (cartons, pallets, drums, loose items)", ar: "نوع البضاعة وطريقة تغليفها (كراتين، باليتات، براميل، أصناف سائبة)" },
    { en: "Quantity, and approximate size and weight of each unit or pallet", ar: "الكمية، والحجم والوزن التقريبي لكل وحدة أو باليت" },
    { en: "How long you need storage, and when goods will arrive", ar: "مدة التخزين المطلوبة وموعد وصول البضاعة" },
    { en: "How often goods go in and out", ar: "عدد مرات دخول وخروج البضاعة" },
    { en: "Any special handling or conditions your goods need", ar: "أي مناولة أو ظروف خاصة تحتاجها بضاعتك" },
    { en: "The records or reports you would like to receive", ar: "السجلات أو التقارير التي ترغبون في استلامها" },
  ],
  faqTitle: { en: "Common questions", ar: "أسئلة شائعة" },
  faq: [
    {
      q: { en: "Do I still own my goods?", ar: "هل تبقى البضاعة ملكًا لي؟" },
      a: {
        en: "In a typical third-party storage arrangement the owner keeps ownership of the goods, and the warehouse keeps them in its custody. The exact terms are agreed in writing for each case.",
        ar: "في ترتيب التخزين للغير المعتاد، يبقى صاحب البضاعة مالكها، ويحتفظ المخزن بها في عهدته. وتُتفق الشروط بالتفصيل كتابةً في كل حالة.",
      },
    },
    {
      q: { en: "Can I add or reduce space later?", ar: "هل يمكنني زيادة المساحة أو تقليلها لاحقًا؟" },
      a: {
        en: "Flexibility is one of the main reasons businesses use third-party storage. We discuss how changes in space are handled when we agree the scope.",
        ar: "المرونة من أهم أسباب اللجوء إلى التخزين للغير. ونناقش آلية التعامل مع تغيير المساحة عند الاتفاق على النطاق.",
      },
    },
    {
      q: { en: "What does inventory management include?", ar: "ماذا تشمل إدارة المخزون؟" },
      a: {
        en: "Typically stock counts and records of item movement. The exact scope, how often counts happen and what reports you receive are agreed around your business needs.",
        ar: "تشمل عادةً الجرد وسجلات حركة الأصناف. ويُتفق على النطاق بالتفصيل وعدد مرات الجرد والتقارير التي ستستلمونها وفق احتياج نشاطكم.",
      },
    },
    {
      q: { en: "How do I start?", ar: "كيف أبدأ؟" },
      a: {
        en: "Use the inquiry form below or contact us on WhatsApp with the goods, quantity and storage period.",
        ar: "استخدموا نموذج الاستفسار أدناه أو راسلونا عبر واتساب مع ذكر نوع البضاعة والكمية ومدة التخزين.",
      },
    },
  ],
  note: {
    en: "General information about warehousing and inventory practice. It describes common industry approaches and is not a statement of ECOTECH's equipment, systems or facilities. Scope and details are agreed for each inquiry.",
    ar: "معلومات عامة عن ممارسات التخزين وإدارة المخزون. تصف الطرق الشائعة في المجال، وليست بيانًا بمعدات أو أنظمة أو منشآت ECOTECH. ويُتفق على النطاق والتفاصيل في كل استفسار.",
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
    ar: "معمل صيانة واختبار كابلات الألياف الضوئية",
  },
  sub: {
    en: "Maintenance and testing of fiber-optic cables for third parties",
    ar: "صيانة واختبار كابلات الألياف الضوئية للغير",
  },
  lead: {
    en: "Need maintenance or testing for fiber-optic cables? The lab offers fiber cable maintenance and testing for third parties. Share the cable type, quantity and fault or testing requirement to agree the work scope.",
    ar: "هل لديكم كابلات ألياف ضوئية تحتاج إلى صيانة أو اختبار؟ يقدّم المعمل صيانة واختبار كابلات الألياف الضوئية للغير. أرسلوا نوع الكابل وعددها ووصف العطل أو الاختبار المطلوب لنحدد نطاق العمل.",
  },
  hero: IMAGES.fiber,
  blocks: [
    {
      id: "what",
      eyebrow: { en: "General information", ar: "معلومات عامة" },
      title: {
        en: "Why fiber cables are tested and maintained",
        ar: "لماذا تُختبر كابلات الألياف الضوئية وتُصان؟",
      },
      body: [
        {
          en: "Fiber-optic cables carry data as pulses of light through glass strands thinner than a human hair. That gives very high capacity, but it also means small problems, such as a speck of dust on a connector or a tight bend, can reduce the signal.",
          ar: "تنقل كابلات الألياف الضوئية البيانات على هيئة نبضات ضوئية داخل ألياف زجاجية أرق من شعرة الإنسان. وهذا يمنحها سعة عالية جدًا، لكنه يعني أيضًا أن مشكلات صغيرة، كذرة غبار على الموصّل أو انحناء حاد، قد تُضعف الإشارة.",
        },
        {
          en: "Testing shows whether a cable or link performs as expected before it goes into use and after a fault. Maintenance restores connections that are dirty, damaged or worn.",
          ar: "يوضح الاختبار ما إذا كان الكابل أو الوصلة يعمل كما هو متوقع قبل التشغيل وبعد أي عطل. وتعيد الصيانة الوصلات التي اتسخت أو تضررت أو تآكلت إلى حالتها السليمة.",
        },
      ],
      cards: [
        {
          t: { en: "Before use", ar: "قبل التشغيل" },
          d: {
            en: "Check a new or installed link so problems are found before equipment depends on it.",
            ar: "فحص وصلة جديدة أو مركّبة حديثًا لاكتشاف المشكلات قبل أن تعتمد عليها الأجهزة.",
          },
        },
        {
          t: { en: "After a fault", ar: "بعد العطل" },
          d: {
            en: "Locate where a link has degraded or broken, and find out what needs repair.",
            ar: "تحديد موضع الضعف أو القطع في الوصلة ومعرفة المطلوب إصلاحه.",
          },
        },
        {
          t: { en: "Routine care", ar: "عناية دورية" },
          d: {
            en: "Inspect and clean connections as part of regular upkeep to keep links stable.",
            ar: "فحص الوصلات وتنظيفها ضمن الصيانة الدورية لتبقى مستقرة.",
          },
        },
      ],
      image: IMAGES.fiber,
    },
    {
      id: "causes",
      title: { en: "Common causes of fiber link problems", ar: "أسباب شائعة لمشكلات وصلات الألياف الضوئية" },
      tone: "slate",
      body: [
        {
          en: "Industry bodies such as the Fiber Optic Association and the TIA Fiber Optics Technology Consortium point to dirty connectors as the leading cause of fiber network problems. The dirt is often invisible to the naked eye, yet a fiber core is only about 8 microns wide in single-mode and 50 microns in multimode cable.",
          ar: "تشير جهات متخصصة في المجال، مثل Fiber Optic Association وTIA Fiber Optics Technology Consortium، إلى أن الموصّلات المتسخة هي السبب الأول لمشكلات شبكات الألياف الضوئية. والغبار غالبًا لا يُرى بالعين المجردة، إذ يبلغ قطر نواة الليف نحو 8 ميكرون في الأحادي النمط و50 ميكرون في متعدد الأنماط.",
        },
      ],
      list: [
        { en: "Dust, skin oil or residue on connector end faces", ar: "غبار أو دهون أو بقايا على أطراف الموصّلات" },
        { en: "Scratched or damaged connectors", ar: "موصّلات مخدوشة أو متضررة" },
        { en: "Bends tighter than the cable allows, or crushed cable", ar: "انحناءات أشد مما يسمح به الكابل، أو كابل مضغوط" },
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
          ar: "يصف معيار ANSI/TIA-568.3 مستويين للاختبار. المستوى الأول هو الأساسي: قياس فقد الضوء على الوصلة وفحص الطول وفحص الاتجاه (polarity). ويضيف المستوى الثاني تتبّع OTDR وفحص أطراف الموصّلات. وهذه طرق عامة في المجال، أما الطرق والأجهزة المستخدمة في عملكم فتُؤكَّد عند الاتفاق على النطاق.",
        },
      ],
      cards: [
        {
          t: { en: "Visual and end-face inspection", ar: "الفحص البصري وفحص الأطراف" },
          d: {
            en: "Looking at connector end faces with a magnifying inspection scope to see dirt or damage before connecting.",
            ar: "فحص أطراف الموصّلات بمجهر فحص مكبّر لرؤية الغبار أو التلف قبل التوصيل.",
          },
        },
        {
          t: { en: "Cleaning", ar: "التنظيف" },
          d: {
            en: "Cleaning connectors with tools made for fiber, then checking again, since dirt is a leading cause of faults.",
            ar: "تنظيف الموصّلات بأدوات مخصصة للألياف الضوئية ثم إعادة الفحص، لأن الغبار من أهم أسباب الأعطال.",
          },
        },
        {
          t: { en: "Loss testing", ar: "قياس الفقد" },
          d: {
            en: "A light source and power meter measure how much light is lost across the link, compared with the expected limit.",
            ar: "يقيس مصدر الضوء وجهاز قياس القدرة كمية الضوء المفقودة على الوصلة ويقارنانها بالحد المتوقع.",
          },
        },
        {
          t: { en: "OTDR tracing", ar: "تتبّع OTDR" },
          d: {
            en: "An optical time-domain reflectometer sends pulses along the fiber and shows a trace of its length and where events such as connectors, splices or breaks occur.",
            ar: "يرسل جهاز OTDR نبضات على امتداد الليف ويعرض تتبّعًا لطوله ومواضع الأحداث، مثل الموصّلات واللحامات أو الكسر.",
          },
        },
        {
          t: { en: "Length and polarity checks", ar: "فحص الطول والاتجاه" },
          d: {
            en: "Confirming the length of a link and that transmit and receive fibers are connected the right way round.",
            ar: "التأكد من طول الوصلة ومن أن ليفي الإرسال والاستقبال موصولان بالاتجاه الصحيح.",
          },
        },
        {
          t: { en: "Test records", ar: "تسجيل النتائج" },
          d: {
            en: "Results are written up so you can see what was measured. The format is agreed with you.",
            ar: "تُسجَّل النتائج لتتمكنوا من الاطلاع على ما جرى قياسه، وتُتفق الصيغة معكم.",
          },
        },
      ],
    },
    {
      id: "types",
      title: { en: "Fiber types and connectors, in brief", ar: "أنواع الألياف والموصّلات باختصار" },
      tone: "slate",
      cards: [
        {
          t: { en: "Single-mode fiber", ar: "ألياف أحادية النمط (Single-mode)" },
          d: {
            en: "A very small core, about 8 to 9 microns, used for long distances and high bandwidth.",
            ar: "نواة صغيرة جدًا، نحو 8 إلى 9 ميكرون، تُستخدم للمسافات الطويلة والسعات العالية.",
          },
        },
        {
          t: { en: "Multimode fiber", ar: "ألياف متعددة الأنماط (Multimode)" },
          d: {
            en: "A larger core, commonly 50 microns, used for shorter links such as inside buildings and data rooms.",
            ar: "نواة أكبر، غالبًا 50 ميكرون، تُستخدم للوصلات الأقصر، كتلك داخل المباني وغرف البيانات.",
          },
        },
        {
          t: { en: "Connectors and patch panels", ar: "الموصّلات ولوحات التوزيع" },
          d: {
            en: "Common connector styles include LC and SC. Patch cords plug into patch panels that organise many links in one place.",
            ar: "من أنواع الموصّلات الشائعة LC وSC. وتُوصَّل كابلات الباتش (patch cord) في لوحات توزيع تنظّم عدة وصلات في مكان واحد.",
          },
        },
      ],
    },
  ],
  stepsTitle: { en: "From inquiry to an agreed scope", ar: "من الاستفسار إلى اتفاق واضح" },
  steps: [
    { en: "Tell us the cable type, quantity and the fault or testing you need.", ar: "أرسلوا نوع الكابل وعددها والعطل أو الاختبار المطلوب." },
    { en: "Agree the work scope, methods and how results are reported before starting.", ar: "نتفق على نطاق العمل والطرق وطريقة عرض النتائج قبل البدء." },
    { en: "Carry out the agreed work and share the results in the agreed format.", ar: "ننفّذ العمل المتفق عليه ونشارك النتائج بالصيغة المتفق عليها." },
  ],
  prepareTitle: { en: "What to share in your inquiry", ar: "ما الذي ترسلونه في استفساركم" },
  prepareIntro: {
    en: "A few details help define the work scope.",
    ar: "بضع تفاصيل تساعد في تحديد نطاق العمل.",
  },
  prepare: [
    { en: "Cable type, if known: single-mode or multimode, and connector style", ar: "نوع الكابل إن كان معروفًا: أحادي النمط أو متعدد الأنماط، ونوع الموصّل" },
    { en: "Number of cables or links, and approximate lengths", ar: "عدد الكابلات أو الوصلات وأطوالها التقريبية" },
    { en: "A description of the fault, or the testing you need", ar: "وصف العطل أو الاختبار المطلوب" },
    { en: "Where the cables are, and whether they are installed or loose", ar: "موقع الكابلات، وهل هي مركّبة أم سائبة" },
    { en: "Any test results or records you already have", ar: "أي نتائج اختبار أو سجلات متوفرة لديكم" },
    { en: "When you need the work done", ar: "الموعد المطلوب لتنفيذ العمل" },
  ],
  faqTitle: { en: "Common questions", ar: "أسئلة شائعة" },
  faq: [
    {
      q: { en: "Which cables can you work on?", ar: "ما الكابلات التي تعملون عليها؟" },
      a: {
        en: "Send the cable type, quantity and what you need. We confirm what the lab can do and agree the scope before any work starts.",
        ar: "أرسلوا نوع الكابل وعددها والمطلوب. ونؤكد ما يستطيع المعمل تنفيذه ونتفق على النطاق قبل بدء أي عمل.",
      },
    },
    {
      q: { en: "What is the difference between loss testing and an OTDR trace?", ar: "ما الفرق بين قياس الفقد وتتبّع OTDR؟" },
      a: {
        en: "In general, loss testing measures the total light lost across a link, while an OTDR trace shows the link along its length and where events such as splices, connectors or breaks sit.",
        ar: "بوجه عام، يقيس قياس الفقد إجمالي الضوء المفقود على الوصلة، بينما يعرض تتبّع OTDR الوصلة على امتداد طولها ومواضع الأحداث، مثل اللحامات والموصّلات أو الكسر.",
      },
    },
    {
      q: { en: "Can a dirty connector really cause problems?", ar: "هل يمكن للموصّل المتسخ أن يسبب مشكلات فعلًا؟" },
      a: {
        en: "Yes. Dirty connectors are widely reported as a leading cause of fiber network problems, which is why inspection and cleaning are common first steps.",
        ar: "نعم. يُشار إلى الموصّلات المتسخة على نطاق واسع بوصفها سببًا رئيسيًا لمشكلات شبكات الألياف الضوئية، ولذلك يكون الفحص والتنظيف غالبًا أول خطوة.",
      },
    },
    {
      q: { en: "How do I start?", ar: "كيف أبدأ؟" },
      a: {
        en: "Use the inquiry form below or contact us on WhatsApp with the cable type, quantity and your requirement.",
        ar: "استخدموا نموذج الاستفسار أدناه أو راسلونا عبر واتساب مع ذكر نوع الكابل وعددها والمطلوب.",
      },
    },
  ],
  note: {
    en: "General information about fiber-optic testing and maintenance. It describes common industry methods and standards and is not a statement of the lab's equipment, accreditation or capabilities. Scope, methods and reporting are agreed for each inquiry.",
    ar: "معلومات عامة عن اختبار الألياف الضوئية وصيانتها. تصف الطرق والمعايير الشائعة في المجال، وليست بيانًا بمعدات المعمل أو اعتماده أو قدراته. ويُتفق على النطاق والطرق وطريقة التقرير في كل استفسار.",
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
