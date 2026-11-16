import { db, homepageSections, websitePages, companySettings } from "@/db";
import { count } from "drizzle-orm";

export async function ensureCmsSeeded() {
  const [{ value: secCount }] = await db.select({ value: count() }).from(homepageSections);
  if (Number(secCount) === 0) {
    await db.insert(homepageSections).values([
      {
        sectionKey: "hero",
        titleEn: "Powering the Future of Network Infrastructure",
        titleAr: "نقود مستقبل البنية التحتية للشبكات والطاقة الذكية",
        subtitleEn: "Advanced Networking, Fiber Optic and Smart Power Distribution Solutions.",
        subtitleAr: "حلول متطورة في هندسة الشبكات والألياف الضوئية وتوزيع الطاقة الذكي لمراكز البيانات.",
        ctaPrimaryLabelEn: "Explore Products",
        ctaPrimaryLabelAr: "استكشف المنتجات",
        ctaPrimaryHref: "/products",
        ctaSecondaryLabelEn: "Contact Sales",
        ctaSecondaryLabelAr: "تواصل مع المبيعات",
        ctaSecondaryHref: "/contact",
        heroMediaUrl: "/images/hero-datacenter.jpg",
        payload: {
          catalogLabelEn: "Download Catalog",
          catalogLabelAr: "تحميل الكتالوج",
          catalogHref: "/products",
          badgeEn: "ISO 9001:2015 • IEC 60297 • TIA-568 CERTIFIED INFRASTRUCTURE",
          badgeAr: "بنية تحتية معتمدة وفق معايير ISO 9001:2015 و IEC 60297 و TIA-568",
        },
        displayOrder: 1,
        isVisible: true,
      },
      {
        sectionKey: "stats",
        titleEn: "Engineered for Mission-Critical Uptime",
        titleAr: "مصممة لاستمرارية الأعمال الحرجة دون انقطاع",
        subtitleEn: "Verified manufacturing scale across enterprise and hyperscale deployments.",
        subtitleAr: "قدرات تصنيع موثوقة لمشاريع الشركات الكبرى ومراكز البيانات.",
        payload: {
          items: [
            { value: "1500 kg", labelEn: "Max Rack Static Load", labelAr: "أقصى حمولة للكبائن" },
            { value: "±1%", labelEn: "Smart PDU Metering Accuracy", labelAr: "دقة قياس وحدات الطاقة" },
            { value: "0.12 dB", labelEn: "Typical Fiber Insertion Loss", labelAr: "فقد الإدخال البصري" },
            { value: "99.99%", labelEn: "Infrastructure Reliability", labelAr: "اعتمادية البنية التحتية" },
          ],
        },
        displayOrder: 2,
        isVisible: true,
      },
      {
        sectionKey: "why_ecotech",
        titleEn: "Why Choose ECOTECH",
        titleAr: "لماذا تختار حلول إيكوتك؟",
        subtitleEn: "Precision industrial engineering combined with end-to-end compliance.",
        subtitleAr: "هندسة صناعية دقيقة مدعومة بالامتثال للمعايير العالمية.",
        payload: { cards: [] },
        displayOrder: 3,
        isVisible: true,
      },
      {
        sectionKey: "capabilities",
        titleEn: "Engineering & Manufacturing Capabilities",
        titleAr: "القدرات الهندسية والتصنيعية",
        subtitleEn: "From structural CAD design to automated assembly.",
        subtitleAr: "من التصميم الهندسي CAD إلى خطوط التجميع الآلية.",
        payload: { items: [] },
        displayOrder: 4,
        isVisible: true,
      },
      {
        sectionKey: "projects",
        titleEn: "Featured Projects & Applications",
        titleAr: "مشاريع وتطبيقات مختارة",
        subtitleEn: "Trusted across banking data centers, telecom hubs, and smart campuses.",
        subtitleAr: "حلولنا موثوقة في مراكز بيانات البنوك وشركات الاتصالات.",
        payload: { projects: [] },
        displayOrder: 5,
        isVisible: true,
      },
      {
        sectionKey: "certifications",
        titleEn: "Certifications & Quality Standards",
        titleAr: "الاعتمادات ومعايير الجودة العالمية",
        subtitleEn: "Certified to international electrical, mechanical, and optical benchmarks.",
        subtitleAr: "معتمدة وفق أرقى المعايير الدولية.",
        payload: { badges: [] },
        displayOrder: 6,
        isVisible: true,
      },
      {
        sectionKey: "news",
        titleEn: "Latest News & Engineering Updates",
        titleAr: "أحدث الأخبار والتحديثات الهندسية",
        subtitleEn: "Product launches and data center infrastructure insights.",
        subtitleAr: "إطلاقات المنتجات الجديدة والتحديثات الفنية.",
        payload: { posts: [] },
        displayOrder: 7,
        isVisible: true,
      },
    ]).onConflictDoNothing();
  }

  const [{ value: pageCount }] = await db.select({ value: count() }).from(websitePages);
  if (Number(pageCount) === 0) {
    await db.insert(websitePages).values({
      slug: "about-us",
      titleEn: "Engineering Excellence in Network & Power Infrastructure",
      titleAr: "التميز الهندسي في البنية التحتية للشبكات والطاقة",
      subtitleEn: "Specialized manufacturer of enterprise network cabinets, fiber optic systems, and Smart PDUs.",
      subtitleAr: "شركة متخصصة في تصنيع كبائن الشبكات وأنظمة الألياف الضوئية ووحدات الطاقة الذكية.",
      contentEn: "ECOTECH delivers fully tested, standards-compliant infrastructure hardware.",
      contentAr: "تقدم إيكوتك أجهزة بنية تحتية مختبرة بالكامل ومعتمدة.",
      structuredData: {},
      isPublished: true,
    }).onConflictDoNothing();
  }

  const [{ value: setCount }] = await db.select({ value: count() }).from(companySettings);
  if (Number(setCount) === 0) {
    await db.insert(companySettings).values([
      { key: "company_name", valueEn: "ECOTECH Infrastructure Systems", valueAr: "إيكوتك لأنظمة البنية التحتية" },
      { key: "contact_email", valueEn: "sales@ecotech-infra.com", valueAr: "sales@ecotech-infra.com" },
      { key: "support_email", valueEn: "engineering@ecotech-infra.com", valueAr: "engineering@ecotech-infra.com" },
      { key: "phone_primary", valueEn: "+971 4 555 0190", valueAr: "+971 4 555 0190" },
      { key: "address", valueEn: "Plot 42, Industrial Technology Zone, Dubai, UAE", valueAr: "قطعة 42، المنطقة الصناعية التكنولوجية، دبي، الإمارات" },
      { key: "working_hours", valueEn: "Monday – Friday: 08:30 – 18:00 GST", valueAr: "الاثنين – الجمعة: 08:30 صباحاً – 06:00 مساءً" },
      { key: "google_maps_embed_url", valueEn: "https://maps.google.com/maps?q=Dubai%20Industrial%20City&t=&z=13&ie=UTF8&iwloc=&output=embed", valueAr: "https://maps.google.com/maps?q=Dubai%20Industrial%20City&t=&z=13&ie=UTF8&iwloc=&output=embed" },
      { key: "footer_about", valueEn: "ECOTECH engineers and manufactures network racks, fiber optic connectivity, and Smart PDU systems.", valueAr: "تصمم وتصنع إيكوتك كبائن الشبكات وأنظمة الألياف الضوئية ووحدات توزيع الطاقة الذكية." },
    ]).onConflictDoNothing();
  }
}