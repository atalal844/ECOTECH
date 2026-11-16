import { put } from "@vercel/blob";
import path from "path";
import {
  db,
  userRoles,
  users,
  mediaLibrary,
  productCategories,
  products,
  productImages,
  productDocuments,
  productSpecifications,
  websitePages,
  homepageSections,
  companySettings,
  navigationMenus,
  inquiries,
  inquiryNotes,
} from "@/db";
import { count, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { buildEcotechPdf } from "@/lib/pdf-generator";
import { UPLOAD_ROOT } from "@/lib/storage";

async function ensureCmsSeeded() {
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
          catalogHref: "/api/files/catalogs/ecotech-master-catalog.pdf",
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
        subtitleEn: "Precision industrial engineering combined with end-to-end compliance and responsive technical support.",
        subtitleAr: "هندسة صناعية دقيقة مدعومة بالامتثال للمعايير العالمية ودعم فني وهندسي متواصل.",
        payload: {
          cards: [
            { titleEn: "Precision Sheet Metal & CNC Fabrication", titleAr: "تصنيع معدني دقيق بتقنيات CNC", descEn: "Automated laser cutting, CNC turret punching, and 7-stage powder coating.", descAr: "قص ليزري آلي وتشكيل CNC مع طلاء بودرة بـ 7 مراحل لمقاومة التآكل." },
            { titleEn: "100% Factory Optical & Electrical Testing", titleAr: "اختبار مصنعي بنسبة 100% للألياف والطاقة", descEn: "Every fiber patch cord is interferometer verified and every Smart PDU undergoes full burn-in.", descAr: "يتم فحص كل كابل ألياف ضوئية وكل وحدة طاقة ذكية تحت الحمل الكامل." },
            { titleEn: "Turnkey Data Center Customization", titleAr: "تخصيص متكامل لمراكز البيانات", descEn: "Custom dimensions, RAL colors, OEM PDU outlet layouts, and pre-terminated trunks.", descAr: "تصميم مقاسات وألوان وتوزيعات طاقة مخصصة وفق متطلبات كل مشروع." },
            { titleEn: "Global Compliance & Fast Lead Times", titleAr: "اعتمادات عالمية وسرعة التوريد", descEn: "Full IEC, EIA-310-E, UL, CE, RoHS, and TIA-568 documentation.", descAr: "توافق كامل مع معايير IEC و EIA-310-E و UL و CE و RoHS." },
          ],
        },
        displayOrder: 3,
        isVisible: true,
      },
      {
        sectionKey: "capabilities",
        titleEn: "Engineering & Manufacturing Capabilities",
        titleAr: "القدرات الهندسية والتصنيعية",
        subtitleEn: "From structural CAD design and thermal CFD modeling to automated assembly.",
        subtitleAr: "من التصميم الهندسي CAD ومحاكاة التبريد إلى خطوط التجميع الآلية.",
        payload: { items: [] },
        displayOrder: 4,
        isVisible: true,
      },
      {
        sectionKey: "projects",
        titleEn: "Featured Projects & Applications",
        titleAr: "مشاريع وتطبيقات مختارة",
        subtitleEn: "Trusted across banking data centers, telecom hubs, smart campuses, and healthcare networks.",
        subtitleAr: "حلولنا موثوقة في مراكز بيانات البنوك، شركات الاتصالات، الجامعات الذكية، والمستشفيات.",
        payload: { projects: [] },
        displayOrder: 5,
        isVisible: true,
      },
      {
        sectionKey: "certifications",
        titleEn: "Certifications & Quality Standards",
        titleAr: "الاعتمادات ومعايير الجودة العالمية",
        subtitleEn: "Every ECOTECH system is engineered, tested, and certified to international benchmarks.",
        subtitleAr: "جميع أنظمة إيكوتك مصممة ومختبرة ومعتمدة وفق أرقى المعايير الدولية.",
        payload: {
          badges: [
            { code: "ISO 9001:2015", descEn: "Quality Management System", descAr: "نظام إدارة الجودة" },
            { code: "IEC 60297", descEn: "19-Inch Mechanical Rack Standard", descAr: "معيار الكبائن الميكانيكي 19 بوصة" },
            { code: "EIA-310-E", descEn: "Server Cabinet Structural Compliance", descAr: "توافق هياكل كبائن الخوادم" },
            { code: "TIA-568.2-D", descEn: "Structured Cabling Performance", descAr: "معيار التمديدات الهيكلية والألياف" },
          ],
        },
        displayOrder: 6,
        isVisible: true,
      },
      {
        sectionKey: "news",
        titleEn: "Latest News & Engineering Updates",
        titleAr: "أحدث الأخبار والتحديثات الهندسية",
        subtitleEn: "Product launches, technical advisories, and data center infrastructure insights.",
        subtitleAr: "إطلاقات المنتجات الجديدة، التحديثات الفنية، ورؤى البنية التحتية لمراكز البيانات.",
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
      subtitleEn: "ECOTECH is a specialized manufacturer of enterprise network cabinets, high-density fiber optic systems, and intelligent rack power distribution solutions.",
      subtitleAr: "إيكوتك شركة متخصصة في تصنيع كبائن الشبكات المؤسسية وأنظمة الألياف الضوئية عالية الكثافة وحلول توزيع الطاقة الذكية.",
      contentEn: "Founded to bridge precision industrial manufacturing with mission-critical IT requirements, ECOTECH delivers fully tested, standards-compliant infrastructure hardware.",
      contentAr: "تأسست إيكوتك للجمع بين دقة التصنيع الصناعي ومتطلبات تقنية المعلومات الحرجة، حيث تقدم أجهزة بنية تحتية مختبرة بالكامل ومعتمدة.",
      structuredData: {
        visionEn: "To be the premier engineering partner for resilient, energy-efficient physical layer and power infrastructure.",
        visionAr: "أن نكون الشريك الهندسي الأول للبنية التحتية الفيزيائية والطاقة عالية الكفاءة.",
        missionEn: "Deliver precision-manufactured racks, ultra-low-loss optical connectivity, and intelligent power telemetry.",
        missionAr: "تقديم كبائن مصنعة بدقة، وحلول ألياف ضوئية فائقة الأداء، ووحدات طاقة ذكية.",
      },
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
      { key: "phone_sales", valueEn: "+971 4 555 0195", valueAr: "+971 4 555 0195" },
      { key: "address", valueEn: "Plot 42, Industrial Technology Zone, Gate 3, Dubai, UAE", valueAr: "قطعة 42، المنطقة الصناعية التكنولوجية، بوابة 3، دبي، الإمارات" },
      { key: "working_hours", valueEn: "Monday – Friday: 08:30 – 18:00 GST", valueAr: "الاثنين – الجمعة: 08:30 صباحاً – 06:00 مساءً" },
      { key: "google_maps_embed_url", valueEn: "https://maps.google.com/maps?q=Dubai%20Industrial%20City&t=&z=13&ie=UTF8&iwloc=&output=embed", valueAr: "https://maps.google.com/maps?q=Dubai%20Industrial%20City&t=&z=13&ie=UTF8&iwloc=&output=embed" },
      { key: "footer_about", valueEn: "ECOTECH engineers and manufactures high-reliability network racks, fiber optic connectivity, and intelligent Smart PDU power systems.", valueAr: "تصمم وتصنع إيكوتك كبائن الشبكات عالية الاعتمادية، وأنظمة الألياف الضوئية، ووحدات توزيع الطاقة الذكية." },
      { key: "social_links", valueJson: { linkedin: "https://linkedin.com", youtube: "https://youtube.com", x: "https://x.com", instagram: "https://instagram.com" } },
    ]).onConflictDoNothing();
  }
}

let seedPromise: Promise<void> | null = null;

async function writePdfToStorage(
  folder: string,
  fileName: string,
  buffer: Buffer,
  uploadedById: number
) {
  const blob = await put(`${folder}/${fileName}`, buffer, { access: "public", contentType: "application/pdf" });

  const [media] = await db
    .insert(mediaLibrary)
    .values({
      fileName,
      originalName: fileName,
      mimeType: "application/pdf",
      extension: "pdf",
      fileSize: buffer.length,
      folder,
      storagePath: blob.pathname,`n      publicUrl: blob.url,
      altEn: fileName,
      altAr: fileName,
      captionEn: "ECOTECH Official Technical Documentation",
      captionAr: "الوثائق الفنية الرسمية لشركة إيكوتك",
      isLegacyArchive: false,
      uploadedById,
    })
    .returning();

  return media;
}

export async function ensureDatabaseSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const [{ value: roleCount }] = await db
        .select({ value: count() })
        .from(userRoles);
      await ensureCmsSeeded();
      if (Number(roleCount) > 0) {
        return;
      }

      // 1. Seed Roles
      const insertedRoles = await db
        .insert(userRoles)
        .values([
          {
            name: "Super Admin",
            slug: "super_admin",
            description:
              "Full unrestricted access across system settings, users, roles, audit logs, products, media, and inquiries.",
            permissions: ["*"],
          },
          {
            name: "Admin",
            slug: "admin",
            description:
              "Manage products, categories, media library, datasheets, homepage content, and customer inquiries.",
            permissions: [
              "dashboard.view",
              "products.*",
              "categories.*",
              "media.*",
              "documents.*",
              "inquiries.*",
              "pages.*",
              "homepage.*",
            ],
          },
          {
            name: "Editor",
            slug: "editor",
            description:
              "Manage website content, bilingual product information, categories, media assets, and documents.",
            permissions: [
              "dashboard.view",
              "products.read",
              "products.write",
              "categories.read",
              "categories.write",
              "media.read",
              "media.write",
              "documents.read",
              "documents.write",
              "pages.*",
              "homepage.*",
            ],
          },
          {
            name: "Sales Manager",
            slug: "sales_manager",
            description:
              "Manage customer quote requests, sales inquiries, internal notes, and export reports.",
            permissions: [
              "dashboard.view",
              "inquiries.*",
              "products.read",
              "categories.read",
              "documents.read",
            ],
          },
        ])
        .returning();

      const roleMap = new Map(insertedRoles.map((r) => [r.slug, r.id]));

      // 2. Seed Users
      const [superAdmin] = await db
        .insert(users)
        .values([
          {
            email: "superadmin@ecotech.local",
            passwordHash: await hashPassword("EcoTech@2026!"),
            fullName: "Eng. Tariq Al-Mansoor",
            fullNameAr: "م. طارق المنصور",
            roleId: roleMap.get("super_admin")!,
            isActive: true,
          },
          {
            email: "admin@ecotech.local",
            passwordHash: await hashPassword("Admin@2026!"),
            fullName: "Sarah Al-Harbi",
            fullNameAr: "سارة الحربي",
            roleId: roleMap.get("admin")!,
            isActive: true,
          },
          {
            email: "editor@ecotech.local",
            passwordHash: await hashPassword("Editor@2026!"),
            fullName: "Omar Al-Zahrani",
            fullNameAr: "عمر الزهراني",
            roleId: roleMap.get("editor")!,
            isActive: true,
          },
          {
            email: "sales@ecotech.local",
            passwordHash: await hashPassword("Sales@2026!"),
            fullName: "Nadia Al-Qahtani",
            fullNameAr: "نادية القحطاني",
            roleId: roleMap.get("sales_manager")!,
            isActive: true,
          },
        ])
        .returning();

      // 3. Seed Catalog & Company Profile PDFs in Storage + Media Library
      const masterCatalogPdf = buildEcotechPdf({
        title: "ECOTECH Master Product Catalog 2026",
        subtitle:
          "Enterprise Network Racks, Fiber Optic Connectivity & Smart Power Distribution",
        metaCode: "DOC: ECO-CAT-2026-EN",
        sections: [
          {
            heading: "1. Network Racks & Server Cabinets",
            lines: [
              "- Floor Standing Server Racks (22U to 47U, up to 1500 kg static load)",
              "- Wall-Mount Network Cabinets (6U to 18U, single and double section)",
              "- IP55 / IP66 Outdoor Telecom & Industrial Cabinets",
              "- Cold & Hot Aisle Containment Systems and Rack Accessories",
            ],
          },
          {
            heading: "2. Fiber Optic Infrastructure Solutions",
            lines: [
              "- High-Density 1U/2U/4U ODF & Sliding Fiber Patch Panels (LC, SC, MPO)",
              "- Indoor/Outdoor Armored OS2 Single-Mode & OM3/OM4/OM5 Fiber Cables",
              "- Low-Loss Factory-Terminated Fiber Patch Cords & Pigtails",
              "- Optical Termination Boxes, Splice Enclosures & Adapters",
            ],
          },
          {
            heading: "3. Intelligent Smart PDU & Rack Power",
            lines: [
              "- Basic, Metered, Monitored, Switched & Outlet-Metered Smart PDUs",
              "- Single-Phase & Three-Phase High-Density Rack Power Distribution",
              "- SNMPv3, Modbus-TCP, REST API & Daisy-Chain Environmental Sensors",
            ],
          },
          {
            heading: "4. Structured Cabling & Custom Engineering",
            lines: [
              "- Cat6 / Cat6A Shielded & Unshielded Patch Panels & Keystone Jacks",
              "- Custom CNC Fabrication, Custom PDU Wiring & Turnkey Data Center Racks",
            ],
          },
        ],
      });
      const masterCatalogMedia = await writePdfToStorage(
        "catalogs",
        "ecotech-master-catalog-2026.pdf",
        masterCatalogPdf,
        superAdmin.id
      );

      const companyProfilePdf = buildEcotechPdf({
        title: "ECOTECH Corporate Engineering Profile",
        subtitle:
          "Precision Manufacturing for Data Centers, Telecom & Enterprise Networks",
        metaCode: "DOC: ECO-PROFILE-2026",
        sections: [
          {
            heading: "Corporate Overview",
            lines: [
              "ECOTECH designs and manufactures precision networking racks, fiber optic connectivity systems, and intelligent rack power distribution units (Smart PDUs) engineered for mission-critical data centers and enterprise IT environments.",
            ],
          },
          {
            heading: "Manufacturing & Quality Standards",
            lines: [
              "- ISO 9001:2015 Quality Management & ISO 14001 Environmental Compliance",
              "- IEC 60297-3-100 / EIA-310-E 19-Inch Mechanical Compliance",
              "- TIA-568.2-D & ISO/IEC 11801 Optical & Copper Cabling Standards",
              "- CE, RoHS, UL 62368-1 & IEC 62368-1 Electrical Safety Certification",
            ],
          },
        ],
      });
      const companyProfileMedia = await writePdfToStorage(
        "documents",
        "ecotech-company-profile.pdf",
        companyProfilePdf,
        superAdmin.id
      );

      // 4. Seed Categories (5 Main + Subcategories)
      const mainCategoriesInput = [
        {
          slug: "network-racks-cabinets",
          nameEn: "Network Racks & Cabinets",
          nameAr: "كبائن الشبكات والخوادم",
          descriptionEn:
            "Heavy-duty floor-standing server cabinets, wall-mount enclosures, and IP-rated outdoor racks engineered to EIA-310-E and IEC 60297 standards.",
          descriptionAr:
            "كبائن خوادم أرضية عالية التحمل، وخزائن حائطية، وكبائن خارجية مقاومة للعوامل الجوية مصممة وفق معايير EIA-310-E و IEC 60297.",
          imageUrl: "/images/cat-racks.jpg",
          bannerUrl: "/images/cat-racks.jpg",
          catalogUrl: masterCatalogMedia.publicUrl,
          catalogMediaId: masterCatalogMedia.id,
          displayOrder: 1,
          isFeatured: true,
          subs: [
            { slug: "wall-mount-racks", nameEn: "Wall Mount Racks", nameAr: "كبائن شبكات جدارية" },
            { slug: "floor-standing-racks", nameEn: "Floor Standing Racks", nameAr: "كبائن شبكات أرضية" },
            { slug: "server-racks", nameEn: "Server Racks", nameAr: "كبائن الخوادم" },
            { slug: "outdoor-cabinets", nameEn: "Outdoor Cabinets", nameAr: "الكبائن الخارجية" },
            { slug: "rack-accessories", nameEn: "Rack Accessories", nameAr: "ملحقات الكبائن" },
            { slug: "rack-cable-management", nameEn: "Cable Management", nameAr: "إدارة الكابلات" },
            { slug: "shelves-mounting-accessories", nameEn: "Shelves and Mounting Accessories", nameAr: "الأرفف وملحقات التثبيت" },
          ],
        },
        {
          slug: "fiber-optic-solutions",
          nameEn: "Fiber Optic Solutions",
          nameAr: "حلول الألياف الضوئية",
          descriptionEn:
            "Ultra-low-loss optical distribution frames, high-density ODF patch panels, single-mode and multimode cables, patch cords, and splicing infrastructure.",
          descriptionAr:
            "إطارات التوزيع البصري عالية الكثافة، لوحات توصيل الألياف الضوئية، كابلات الألياف أحادية ومتعددة الأنماط، أسلاك التوصيل وملحقات اللحام.",
          imageUrl: "/images/cat-fiber.jpg",
          bannerUrl: "/images/cat-fiber.jpg",
          catalogUrl: masterCatalogMedia.publicUrl,
          catalogMediaId: masterCatalogMedia.id,
          displayOrder: 2,
          isFeatured: true,
          subs: [
            { slug: "fiber-optic-cables", nameEn: "Fiber Optic Cables", nameAr: "كابلات الألياف الضوئية" },
            { slug: "fiber-patch-panels", nameEn: "Fiber Patch Panels", nameAr: "لوحات توزيع الألياف" },
            { slug: "odf", nameEn: "ODF", nameAr: "إطارات التوزيع البصري ODF" },
            { slug: "fiber-termination-boxes", nameEn: "Fiber Termination Boxes", nameAr: "صناديق إنهاء الألياف" },
            { slug: "fiber-patch-cords", nameEn: "Fiber Patch Cords", nameAr: "أسلاك توصيل الألياف" },
            { slug: "pigtails", nameEn: "Pigtails", nameAr: "وصلات البيجتيل" },
            { slug: "fiber-adapters", nameEn: "Fiber Adapters", nameAr: "مهايئات الألياف" },
            { slug: "fiber-connectors", nameEn: "Fiber Connectors", nameAr: "موصلات الألياف الضوئية" },
            { slug: "splicing-accessories", nameEn: "Splicing Accessories", nameAr: "ملحقات لحام الألياف" },
            { slug: "fiber-distribution-solutions", nameEn: "Fiber Distribution Solutions", nameAr: "حلول توزيع الألياف" },
          ],
        },
        {
          slug: "smart-pdu-solutions",
          nameEn: "Smart PDU Solutions",
          nameAr: "حلول وحدات توزيع الطاقة الذكية",
          descriptionEn:
            "Precision-engineered rack power distribution units from basic power strips to outlet-metered, switched Intelligent Smart PDUs with environmental monitoring.",
          descriptionAr:
            "وحدات توزيع الطاقة للكبائن المصممة بدقة عالية بدءاً من الوحدات الأساسية وصولاً إلى وحدات الطاقة الذكية القابلة للقياس والتحكم والمراقبة البيئية.",
          imageUrl: "/images/cat-pdu.jpg",
          bannerUrl: "/images/cat-pdu.jpg",
          catalogUrl: masterCatalogMedia.publicUrl,
          catalogMediaId: masterCatalogMedia.id,
          displayOrder: 3,
          isFeatured: true,
          subs: [
            { slug: "basic-pdu", nameEn: "Basic PDU", nameAr: "وحدة توزيع طاقة أساسية" },
            { slug: "metered-pdu", nameEn: "Metered PDU", nameAr: "وحدة توزيع طاقة بعداد" },
            { slug: "monitored-pdu", nameEn: "Monitored PDU", nameAr: "وحدة توزيع طاقة مراقبة" },
            { slug: "switched-pdu", nameEn: "Switched PDU", nameAr: "وحدة توزيع طاقة قابلة للتحكم" },
            { slug: "intelligent-smart-pdu", nameEn: "Intelligent Smart PDU", nameAr: "وحدة توزيع الطاقة الذكية" },
            { slug: "rack-power-distribution", nameEn: "Rack Power Distribution", nameAr: "توزيع طاقة الكبائن" },
            { slug: "pdu-accessories", nameEn: "PDU Accessories", nameAr: "ملحقات وحدات الطاقة" },
            { slug: "environmental-sensors", nameEn: "Environmental Sensors", nameAr: "حساسات مراقبة البيئة" },
          ],
        },
        {
          slug: "networking-accessories",
          nameEn: "Networking Accessories",
          nameAr: "ملحقات الشبكات والبنية التحتية",
          descriptionEn:
            "End-to-end Cat6/Cat6A shielded structured cabling, high-density copper patch panels, horizontal and vertical cable management, and termination tooling.",
          descriptionAr:
            "حلول الكابلات الهيكلية Cat6/Cat6A المحمية، لوحات التوصيل النحاسية، أنظمة إدارة الكابلات الأفقية والرأسية، وأدوات التركيب والاختبار.",
          imageUrl: "/images/cat-accessories.jpg",
          bannerUrl: "/images/cat-accessories.jpg",
          catalogUrl: masterCatalogMedia.publicUrl,
          catalogMediaId: masterCatalogMedia.id,
          displayOrder: 4,
          isFeatured: true,
          subs: [
            { slug: "copper-patch-panels", nameEn: "Patch Panels", nameAr: "لوحات التوصيل" },
            { slug: "network-cabinets-accessories", nameEn: "Network Cabinets Accessories", nameAr: "ملحقات كبائن الشبكات" },
            { slug: "accessories-cable-management", nameEn: "Cable Management", nameAr: "منظمات الكابلات" },
            { slug: "structured-cabling", nameEn: "Structured Cabling", nameAr: "التمديدات الهيكلية" },
            { slug: "network-tools", nameEn: "Network Tools", nameAr: "أدوات الشبكات" },
          ],
        },
        {
          slug: "custom-solutions",
          nameEn: "Custom Solutions",
          nameAr: "الحلول الهندسية المخصصة",
          descriptionEn:
            "Bespoke CNC cabinet fabrication, custom-configured Smart PDUs, modular cold/hot aisle containment, and turnkey data center infrastructure projects.",
          descriptionAr:
            "تصنيع كبائن مخصصة بالتحكم الرقمي، وحدات طاقة مصممة حسب الطلب، أنظمة احتواء الممرات الباردة والساخنة، ومشاريع مراكز البيانات المتكاملة.",
          imageUrl: "/images/cat-custom.jpg",
          bannerUrl: "/images/cat-custom.jpg",
          catalogUrl: masterCatalogMedia.publicUrl,
          catalogMediaId: masterCatalogMedia.id,
          displayOrder: 5,
          isFeatured: true,
          subs: [
            { slug: "custom-rack-manufacturing", nameEn: "Custom Rack Manufacturing", nameAr: "تصنيع الكبائن المخصصة" },
            { slug: "customized-pdu-solutions", nameEn: "Customized PDU Solutions", nameAr: "حلول وحدات الطاقة المخصصة" },
            { slug: "data-center-infrastructure", nameEn: "Data Center Infrastructure", nameAr: "البنية التحتية لمراكز البيانات" },
            { slug: "special-networking-projects", nameEn: "Special Networking Projects", nameAr: "مشاريع الشبكات الخاصة" },
          ],
        },
      ];

      const catSlugToId = new Map<string, number>();

      for (const cat of mainCategoriesInput) {
        const [parentRow] = await db
          .insert(productCategories)
          .values({
            slug: cat.slug,
            nameEn: cat.nameEn,
            nameAr: cat.nameAr,
            descriptionEn: cat.descriptionEn,
            descriptionAr: cat.descriptionAr,
            imageUrl: cat.imageUrl,
            bannerUrl: cat.bannerUrl,
            catalogUrl: cat.catalogUrl,
            catalogMediaId: cat.catalogMediaId,
            displayOrder: cat.displayOrder,
            isFeatured: cat.isFeatured,
            isActive: true,
          })
          .returning();
        catSlugToId.set(cat.slug, parentRow.id);

        for (let i = 0; i < cat.subs.length; i++) {
          const sub = cat.subs[i];
          const [subRow] = await db
            .insert(productCategories)
            .values({
              parentId: parentRow.id,
              slug: sub.slug,
              nameEn: sub.nameEn,
              nameAr: sub.nameAr,
              descriptionEn: `${sub.nameEn} engineered by ECOTECH for enterprise reliability and IEC/TIA compliance.`,
              descriptionAr: `${sub.nameAr} مصممة من إيكوتك لضمان أعلى مستويات الاعتمادية والتوافق مع المعايير العالمية.`,
              imageUrl: cat.imageUrl,
              bannerUrl: cat.bannerUrl,
              displayOrder: i + 1,
              isFeatured: false,
              isActive: true,
            })
            .returning();
          catSlugToId.set(sub.slug, subRow.id);
        }
      }

      // 5. Seed Products with Real Specs, Gallery Images & Generated PDF Datasheets
      const productsSeed = [
        {
          categorySlug: "server-racks",
          slug: "ecotech-42u-proseries-server-rack-800x1000",
          sku: "ECO-RACK-42U-8010",
          model: "ProSeries-42U-8010",
          productType: "Floor Standing Server Rack",
          nameEn: "ECOTECH 42U ProSeries Perforated Server Rack (800x1000mm)",
          nameAr: "كابينة خوادم إيكوتك ProSeries 42U مثقبة (800×1000 مم)",
          shortOverviewEn:
            "High-density 42U server cabinet with 80% perforated airflow doors, 1500 kg static load capacity, and integrated vertical cable channels.",
          shortOverviewAr:
            "كابينة خوادم عالية الكثافة بارتفاع 42U مع أبواب مثقبة بنسبة 80% للتبريد، قدرة تحمل ثابتة 1500 كجم، وقنوات كابلات رأسية مدمجة.",
          descriptionEn:
            "Engineered for modern enterprise data centers, the ECOTECH ProSeries 42U cabinet combines a welded cold-rolled SPCC steel frame with 80% hexagonal front and split-rear perforated ventilation. Tool-less zero-U PDU mounting rails and top/bottom brush-sealed cable entries accelerate deployment and optimize airflow management.",
          descriptionAr:
            "تم تصميم كابينة إيكوتك ProSeries 42U خصيصاً لمراكز البيانات الحديثة، حيث تجمع بين هيكل فولاذي مدلفن على البارد عالي المتانة وأبواب مثقبة بنسبة 80% لضمان تدفق الهواء بكفاءة. مزودة بقضبان تثبيت سريعة لوحدات توزيع الطاقة ومداخل كابلات محكمة الإغلاق.",
          featuresEn: [
            "80% high-ventilation hexagonal perforated front & dual-split rear doors",
            "1500 kg static load capacity with heavy-duty leveling feet and casters",
            "Tool-less 0U vertical PDU & cable tray mounting slots on both rear sides",
            "Quick-release lockable side panels with integrated grounding kit",
          ],
          featuresAr: [
            "أبواب أمامية وخلفية مزدوجة مثقبة بنسبة 80% لتبريد مثالي",
            "قدرة تحمل ثابتة تصل إلى 1500 كجم مع قواعد تثبيت وعجلات شديدة التحمل",
            "فتحات تثبيت سريعة بدون أدوات لوحدات PDU الرأسية ومسارات الكابلات",
            "ألواح جانبية سريعة الفك مزودة بأقفال ونظام تأريض متكامل",
          ],
          applicationsEn: [
            "Tier III / IV Enterprise Data Centers",
            "Colocation & Cloud Server Farms",
            "Core Network Distribution Rooms",
          ],
          applicationsAr: [
            "مراكز البيانات المؤسسية الفئة الثالثة والرابعة",
            "مراكز الاستضافة والسحابة",
            "غرف توزيع الشبكات الأساسية",
          ],
          configurationsEn: [
            "42U - 800 x 1000 mm (Black RAL 9005)",
            "42U - 800 x 1200 mm (Black RAL 9005)",
            "47U - 800 x 1200 mm (Grey RAL 7035)",
          ],
          configurationsAr: [
            "42U - أبعاد 800 × 1000 مم (أسود RAL 9005)",
            "42U - أبعاد 800 × 1200 مم (أسود RAL 9005)",
            "47U - أبعاد 800 × 1200 مم (رمادي RAL 7035)",
          ],
          dimensions: "2055 mm (H) x 800 mm (W) x 1000 mm (D)",
          materialsEn: "2.0mm SPCC cold-rolled steel frame, 1.5mm mounting profiles, electrostatic powder coating",
          materialsAr: "هيكل فولاذ مدلفن على البارد SPCC بسماكة 2.0 مم، طلاء بودرة إلكتروستاتيك مقاوم للصدأ",
          availabilityStatus: "in_stock",
          isFeatured: true,
          isBestSeller: true,
          images: ["/images/cat-racks.jpg", "/images/hero-datacenter.jpg"],
          specs: [
            { groupEn: "Mechanical", groupAr: "المواصفات الميكانيكية", keyEn: "Rack Units", keyAr: "عدد الوحدات", valEn: "42U (19-inch EIA-310-E)", valAr: "42U (معيار 19 بوصة EIA-310-E)" },
            { groupEn: "Mechanical", groupAr: "المواصفات الميكانيكية", keyEn: "External Dimensions", keyAr: "الأبعاد الخارجية", valEn: "2055 x 800 x 1000 mm", valAr: "2055 × 800 × 1000 مم" },
            { groupEn: "Mechanical", groupAr: "المواصفات الميكانيكية", keyEn: "Static Load Capacity", keyAr: "قدرة التحمل الثابتة", valEn: "1500 kg", valAr: "1500 كجم" },
            { groupEn: "Airflow & Finish", groupAr: "التهوية والطلاء", keyEn: "Door Perforation", keyAr: "نسبة تثقيب الأبواب", valEn: "80% Open Area Hex Mesh", valAr: "80% مساحة مفتوحة سداسية" },
            { groupEn: "Compliance", groupAr: "الاعتمادات", keyEn: "Standards", keyAr: "المعايير القياسية", valEn: "IEC 60297-3-100, EIA-310-E, RoHS", valAr: "IEC 60297-3-100, EIA-310-E, RoHS" },
          ],
        },
        {
          categorySlug: "wall-mount-racks",
          slug: "ecotech-12u-wall-mount-network-cabinet",
          sku: "ECO-WRK-12U-6060",
          model: "WallPro-12U-6060",
          productType: "Wall Mount Cabinet",
          nameEn: "ECOTECH 12U Tempered Glass Wall-Mount Network Cabinet",
          nameAr: "كابينة شبكة جدارية إيكوتك 12U بباب زجاجي مقوى",
          shortOverviewEn:
            "Compact 12U 600x600mm wall-mounted enclosure with 5mm tempered glass door, removable side panels, and top fan mounting provision.",
          shortOverviewAr:
            "كابينة جدارية مدمجة بارتفاع 12U وأبعاد 600×600 مم مزودة بباب زجاجي مقوى 5 مم وألواح جانبية قابلة للإزالة.",
          descriptionEn:
            "Designed for branch offices, telecom closets, and edge networking equipment, the ECOTECH WallPro 12U cabinet offers clean cable routing, 180-degree reversible front door opening, and a rigid welded frame supporting up to 80 kg wall-mounted equipment.",
          descriptionAr:
            "مصممة لمكاتب الفروع وغرف الاتصالات ومعدات الشبكات الطرفية، وتوفر كابينة WallPro 12U توجيهاً منظماً للكابلات مع باب أمامي قابل للعكس بزاوية 180 درجة وقدرة تحميل تصل إلى 80 كجم.",
          featuresEn: [
            "5mm smoked tempered safety glass front door with spring-loaded hinge",
            "Top & bottom knock-out cable entry plates with dust-proof brush option",
            "Pre-punched 2x 120mm ceiling fan cutouts for active thermal exhaust",
          ],
          featuresAr: [
            "باب أمامي من الزجاج المقوى بسماكة 5 مم مع مفصلات سريعة الفك",
            "فتحات علوية وسفلية مجهزة لإدخال الكابلات مع خيار الفرشاة العازلة للغبار",
            "فتحات سقفية مجهزة لتركيب مروحتي تبريد 120 مم",
          ],
          applicationsEn: [
            "Edge Switching & PoE Access Closets",
            "CCTV & Security Head-End Enclosures",
            "Retail & Enterprise Branch Offices",
          ],
          applicationsAr: [
            "مفاتيح الشبكات الطرفية وأنظمة PoE",
            "أنظمة المراقبة والأمن",
            "مكاتب الشركات والفروع",
          ],
          configurationsEn: ["6U (600x450mm)", "9U (600x600mm)", "12U (600x600mm)", "15U (600x600mm)"],
          configurationsAr: ["6U (600×450 مم)", "9U (600×600 مم)", "12U (600×600 مم)", "15U (600×600 مم)"],
          dimensions: "635 mm (H) x 600 mm (W) x 600 mm (D)",
          materialsEn: "1.2mm - 1.5mm SPCC cold-rolled steel, 5mm tempered glass",
          materialsAr: "فولاذ مدلفن على البارد بسماكة 1.2 - 1.5 مم مع زجاج مقوى 5 مم",
          availabilityStatus: "in_stock",
          isFeatured: true,
          isBestSeller: false,
          images: ["/images/prod-wallrack.jpg", "/images/cat-racks.jpg"],
          specs: [
            { groupEn: "Mechanical", groupAr: "المواصفات الميكانيكية", keyEn: "Capacity", keyAr: "السعة", valEn: "12U", valAr: "12U" },
            { groupEn: "Mechanical", groupAr: "المواصفات الميكانيكية", keyEn: "Static Load", keyAr: "الحمولة الثابتة", valEn: "80 kg", valAr: "80 كجم" },
            { groupEn: "Protection", groupAr: "الحماية", keyEn: "IP Rating", keyAr: "درجة الحماية", valEn: "IP20", valAr: "IP20" },
          ],
        },
        {
          categorySlug: "odf",
          slug: "ecotech-48-port-1u-sliding-fiber-odf-panel",
          sku: "ECO-ODF-48LC-1U",
          model: "OptiRack-48LC-1U",
          productType: "Fiber ODF Patch Panel",
          nameEn: "ECOTECH 48-Port High-Density 1U Sliding Fiber ODF Panel",
          nameAr: "لوحة توزيع ألياف ضوئية منزلقة ODF 48 منفذ ارتفاع 1U",
          shortOverviewEn:
            "Telescopic 1U rack-mount optical distribution frame loaded with 24x LC Duplex OS2 adapters, fusion splice trays, and rear cable glands.",
          shortOverviewAr:
            "إطار توزيع بصري منزلق ارتفاع 1U مجهز بـ 24 مهايئ LC مزدوج، صواني لحام الألياف، ومداخل كابلات خلفية محكمة.",
          descriptionEn:
            "The ECOTECH OptiRack 1U ODF provides streamlined fiber termination and splicing for up to 48 LC fibers in a single rack unit. Its smooth ball-bearing telescopic drawer allows front-access splicing and maintenance without removing the chassis from the cabinet.",
          descriptionAr:
            "يوفر إطار التوزيع البصري OptiRack 1U من إيكوتك إنهاءً ولحاماً منظماً لما يصل إلى 48 ليفة ضوئية في وحدة ارتفاع واحدة، مع درج منزلق يتيح الصيانة الأمامية بسهولة تامة.",
          featuresEn: [
            "Telescopic sliding tray with 45-degree lockable tilt stop",
            "Loaded with Grade-A zirconia ceramic sleeve LC/UPC duplex adapters",
            "2x 24-fiber ABS splice cassettes with bend-radius management spools",
          ],
          featuresAr: [
            "درج منزلق تلسكوبي مع قفل تثبيت للصيانة الأمامية",
            "مجهز بمهايئات LC/UPC عالية الدقة بجلبة سيراميك زيركونيا",
            "صينيتا لحام سعة 24 ليفة مع منظمات لحماية نصف قطر الانحناء",
          ],
          applicationsEn: [
            "Data Center Spine-Leaf Fiber Interconnects",
            "FTTx & Telecom Central Office ODF Racks",
            "Campus Backbone Distribution",
          ],
          applicationsAr: [
            "ربط الألياف في مراكز البيانات",
            "مقاسم الاتصالات وشبكات FTTx",
            "توزيع الشبكات الرئيسية للمجمعات",
          ],
          configurationsEn: ["24-Port SC/UPC", "48-Port LC/UPC OS2", "48-Port LC/APC", "48-Port LC OM4"],
          configurationsAr: ["24 منفذ SC/UPC", "48 منفذ LC/UPC أحادي النمط", "48 منفذ LC/APC", "48 منفذ LC متعدد النمط OM4"],
          dimensions: "44.4 mm (1U) x 482.6 mm (19-inch) x 280 mm",
          materialsEn: "1.5mm cold-rolled steel powder-coated matte black, flame-retardant ABS splice trays",
          materialsAr: "فولاذ 1.5 مم مطلي بالبودرة السوداء، صواني لحام ABS مقاومة للحريق",
          availabilityStatus: "in_stock",
          isFeatured: true,
          isBestSeller: true,
          images: ["/images/cat-fiber.jpg", "/images/prod-patchcord.jpg"],
          specs: [
            { groupEn: "Optical", groupAr: "الأداء البصري", keyEn: "Insertion Loss", keyAr: "فقد الإدخال", valEn: "<= 0.20 dB (Typical 0.12 dB)", valAr: "<= 0.20 ديسيبل (قياسي 0.12)" },
            { groupEn: "Optical", groupAr: "الأداء البصري", keyEn: "Return Loss", keyAr: "فقد الارتداد", valEn: ">= 50 dB (UPC) / >= 60 dB (APC)", valAr: ">= 50 ديسيبل (UPC) / >= 60 ديسيبل (APC)" },
            { groupEn: "Mechanical", groupAr: "المواصفات الميكانيكية", keyEn: "Fiber Capacity", keyAr: "السعة القصوى", valEn: "48 Fibers (LC Duplex)", valAr: "48 ليفة ضوئية (LC مزدوج)" },
          ],
        },
        {
          categorySlug: "fiber-patch-cords",
          slug: "ecotech-os2-singlemode-lc-duplex-patch-cord",
          sku: "ECO-FPC-OS2-LC",
          model: "OptiCord-OS2-LCD",
          productType: "Fiber Patch Cord",
          nameEn: "ECOTECH OS2 Single-Mode LC-LC Duplex Fiber Patch Cord (LSZH)",
          nameAr: "سلك توصيل ألياف ضوئية إيكوتك OS2 أحادي النمط LC-LC مزدوج (LSZH)",
          shortOverviewEn:
            "Factory-interferometer-tested 9/125μm G.657.A1 bend-insensitive LSZH duplex fiber jumper with ultra-low insertion loss.",
          shortOverviewAr:
            "سلك توصيل ألياف ضوئية أحادي النمط 9/125 ميكرون مقاوم للانحناء بغلاف LSZH خالٍ من الهالوجين ومختبر مصنعياً.",
          descriptionEn:
            "ECOTECH OptiCord OS2 patch cords deliver guaranteed optical performance for 10G, 40G, and 100G long-reach transceivers. Every assembly undergoes 100% 3D end-face interferometry and IL/RL verification.",
          descriptionAr:
            "توفر أسلاك التوصيل OptiCord OS2 من إيكوتك أداءً بصرياً موثوقاً لسرعات 10G و 40G و 100G، حيث يخضع كل سلك لاختبار التداخل ثلاثي الأبعاد وفحص فقد الإدخال والارتداد بنسبة 100%.",
          featuresEn: [
            "Corning/ITU-T G.657.A1 bend-insensitive 9/125μm single-mode fiber",
            "LSZH (Low Smoke Zero Halogen) flame-retardant yellow 2.0mm jacket",
            "Individual serialization and IL/RL test report included per cord",
          ],
          featuresAr: [
            "ألياف أحادية النمط مقاومة للانحناء بمعيار G.657.A1",
            "غلاف خارجي أصفر LSZH منخفض الدخان وخالٍ من الهالوجين بقطر 2.0 مم",
            "تقرير اختبار فردي مرفق لكل كابل برقم تسلسلي",
          ],
          applicationsEn: ["TOR to Leaf Optical Links", "ODF Cross-Connect Patching", "10G/40G/100G SFP+/QSFP28 Optics"],
          applicationsAr: ["توصيلات المفاتيح الضوئية", "لوحات التوزيع البصري ODF", "وحدات الإرسال البصرية 10G/40G/100G"],
          configurationsEn: ["1m", "2m", "3m", "5m", "10m", "Custom Length"],
          configurationsAr: ["1 متر", "2 متر", "3 متر", "5 متر", "10 متر", "طول مخصص"],
          dimensions: "2.0 mm Duplex Zipcord, Length: 1m to 50m",
          materialsEn: "LSZH Jacket, Aramid Yarn Strength Member, Zirconia Ceramic Ferrule",
          materialsAr: "غلاف LSZH، ألياف أراميد للتدعيم، جلبة سيراميك زيركونيا",
          availabilityStatus: "in_stock",
          isFeatured: false,
          isBestSeller: true,
          images: ["/images/prod-patchcord.jpg", "/images/cat-fiber.jpg"],
          specs: [
            { groupEn: "Optical", groupAr: "الأداء البصري", keyEn: "Fiber Grade", keyAr: "نوع الألياف", valEn: "OS2 9/125μm G.657.A1", valAr: "OS2 9/125 ميكرون G.657.A1" },
            { groupEn: "Optical", groupAr: "الأداء البصري", keyEn: "Max Insertion Loss", keyAr: "أقصى فقد إدخال", valEn: "<= 0.15 dB", valAr: "<= 0.15 ديسيبل" },
            { groupEn: "Safety", groupAr: "السلامة", keyEn: "Jacket Rating", keyAr: "تصنيف الغلاف", valEn: "LSZH IEC 60332-1 / IEC 61034", valAr: "LSZH IEC 60332-1 / IEC 61034" },
          ],
        },
        {
          categorySlug: "intelligent-smart-pdu",
          slug: "ecotech-intelligent-switched-24-outlet-smart-pdu",
          sku: "ECO-PDU-INT-24C",
          model: "PowerCore-i24-3P",
          productType: "Intelligent Smart PDU",
          nameEn: "ECOTECH Intelligent Switched & Outlet-Metered 24-Port 3-Phase Smart PDU",
          nameAr: "وحدة توزيع طاقة ذكية إيكوتك 24 منفذ ثلاثية الطور مع قياس وتحكم لكل منفذ",
          shortOverviewEn:
            "0U vertical 32A 3-phase Intelligent PDU with per-outlet power metering, remote individual outlet switching, hot-swappable OLED NMC, and sensor ports.",
          shortOverviewAr:
            "وحدة طاقة ذكية رأسية 0U ثلاثية الطور 32 أمبير مع قياس الطاقة والتحكم عن بعد لكل منفذ، وشاشة OLED قابلة للاستبدال السريع.",
          descriptionEn:
            "Built for high-density AI and enterprise server racks, the ECOTECH PowerCore i24 delivers ±1% billing-grade metering at inlet, breaker bank, and individual outlet levels. Supports SNMPv3, HTTPS, RESTful API, Modbus-TCP, and daisy-chaining up to 16 PDUs under a single IP address.",
          descriptionAr:
            "مصممة لكبائن الخوادم عالية الكثافة والذكاء الاصطناعي، توفر وحدة PowerCore i24 دقة قياس ±1% على مستوى الدخل والقواطع وكل منفذ على حدة، مع دعم بروتوكولات SNMPv3 و HTTPS و Modbus-TCP وربط حتى 16 وحدة بعنوان IP واحد.",
          featuresEn: [
            "24x locking IEC outlets (18x C13 + 6x C19) with +/-1% metrology accuracy",
            "Hot-swappable network management controller with dual Gigabit Ethernet ports",
            "Supports external temperature, humidity, door contact & leak sensors",
          ],
          featuresAr: [
            "24 مخرج IEC مع قفل أمان (18x C13 + 6x C19) بدقة قياس ±1%",
            "وحدة تحكم شبكية قابلة للاستبدال السريع مع منفذي إيثرنت جيجابت",
            "دعم حساسات الحرارة والرطوبة وفتح الأبواب وتسرب المياه",
          ],
          applicationsEn: ["High-Density AI & Blade Server Racks", "Remote Lights-Out Data Centers", "Managed Colocation Suites"],
          applicationsAr: ["كبائن الخوادم عالية الكثافة", "مراكز البيانات المدارة عن بعد", "أجنحة الاستضافة السحابية"],
          configurationsEn: ["32A 3-Phase 400V (24 Outlets)", "16A 3-Phase 400V (24 Outlets)", "32A 1-Phase 230V (24 Outlets)"],
          configurationsAr: ["32 أمبير ثلاثي الطور 400 فولت (24 مخرج)", "16 أمبير ثلاثي الطور 400 فولت (24 مخرج)", "32 أمبير أحادي الطور 230 فولت (24 مخرج)"],
          dimensions: "1780 mm (H) x 56 mm (W) x 62 mm (D) - 0U Vertical",
          materialsEn: "Extruded anodized aluminum chassis, UL94 V-0 flame-retardant outlets",
          materialsAr: "هيكل ألمنيوم مؤكسد عالي الجودة، مخارج مقاومة للحريق بمعيار UL94 V-0",
          availabilityStatus: "in_stock",
          isFeatured: true,
          isBestSeller: true,
          images: ["/images/cat-pdu.jpg", "/images/hero-datacenter.jpg"],
          specs: [
            { groupEn: "Electrical", groupAr: "المواصفات الكهربائية", keyEn: "Input Rating", keyAr: "قدرة الدخل", valEn: "32A, 400V 3-Phase Wye (22 kW)", valAr: "32 أمبير، 400 فولت ثلاثي الطور (22 كيلوواط)" },
            { groupEn: "Electrical", groupAr: "المواصفات الكهربائية", keyEn: "Outlets", keyAr: "المخارج", valEn: "18x IEC C13 + 6x IEC C19 Locking", valAr: "18× IEC C13 + 6× IEC C19 مع قفل" },
            { groupEn: "Intelligence", groupAr: "الذكاء والمراقبة", keyEn: "Protocols", keyAr: "بروتوكولات الشبكة", valEn: "SNMPv1/v2c/v3, HTTPS, SSH, REST API, Modbus-TCP", valAr: "SNMPv1/v2c/v3, HTTPS, SSH, REST API, Modbus-TCP" },
            { groupEn: "Safety", groupAr: "السلامة والاعتماد", keyEn: "Operating Temp", keyAr: "درجة حرارة التشغيل", valEn: "0°C to 60°C", valAr: "0° إلى 60° مئوية" },
          ],
        },
        {
          categorySlug: "metered-pdu",
          slug: "ecotech-1u-metered-pdu-8-outlet-c13",
          sku: "ECO-PDU-MTR-08C",
          model: "PowerMeter-1U-08C",
          productType: "Metered Rack PDU",
          nameEn: "ECOTECH 1U Horizontal Metered Rack PDU (8x IEC C13, 16A)",
          nameAr: "وحدة توزيع طاقة أفقية بعداد رقمي إيكوتك 1U (8 منافذ C13، 16 أمبير)",
          shortOverviewEn:
            "1U 19-inch horizontal metered rack PDU with true-RMS digital LED ammeter, hydraulic-magnetic breaker, and 3m C20/Schuko input cord.",
          shortOverviewAr:
            "وحدة توزيع طاقة أفقية 1U مزودة بعداد تيار رقمي LED وقاطع حماية حراري مغناطيسي وكابل تغذية بطول 3 أمتار.",
          descriptionEn:
            "Ideal for network closets and standard server cabinets requiring reliable local load visibility to prevent circuit overloads during provisioning.",
          descriptionAr:
            "مثالية لغرف الشبكات وكبائن الخوادم القياسية التي تتطلب مراقبة فورية للأحمال الكهربائية لمنع التحميل الزائد أثناء التشغيل.",
          featuresEn: [
            "True-RMS backlit digital current & voltage display",
            "8x IEC 60320 C13 outlets with surge & overload protection",
            "Tool-less reversible 19-inch mounting ears",
          ],
          featuresAr: [
            "شاشة رقمية مضيئة لعرض التيار والجهد بدقة عالية",
            "8 مخارج IEC 60320 C13 مع حماية ضد زيادة الحمل",
            "زوايا تثبيت 19 بوصة قابلة للعكس",
          ],
          applicationsEn: ["Network Access Closets", "Branch Server Cabinets", "Edge Telecom Racks"],
          applicationsAr: ["غرف الشبكات الفرعية", "كبائن الخوادم الصغيرة", "كبائن الاتصالات الطرفية"],
          configurationsEn: ["8x C13 (16A)", "12x C13 (16A)", "8x Universal / BS1363"],
          configurationsAr: ["8 مخارج C13 (16 أمبير)", "12 مخرج C13 (16 أمبير)", "8 مخارج قياسية متعددة"],
          dimensions: "44.4 mm (1U) x 482.6 mm x 90 mm",
          materialsEn: "Anodized aluminum alloy housing, copper busbar internal wiring",
          materialsAr: "هيكل سبيكة ألمنيوم مؤكسد مع قضبان توزيع نحاسية داخلية",
          availabilityStatus: "in_stock",
          isFeatured: false,
          isBestSeller: false,
          images: ["/images/cat-pdu.jpg"],
          specs: [
            { groupEn: "Electrical", groupAr: "المواصفات الكهربائية", keyEn: "Max Load", keyAr: "أقصى حمل", valEn: "16A, 230V (3.68 kW)", valAr: "16 أمبير، 230 فولت (3.68 كيلوواط)" },
            { groupEn: "Electrical", groupAr: "المواصفات الكهربائية", keyEn: "Cable Spec", keyAr: "مواصفة الكابل", valEn: "3x 2.5mm² H05VV-F, 3.0m", valAr: "3× 2.5 مم² بطول 3.0 متر" },
          ],
        },
        {
          categorySlug: "copper-patch-panels",
          slug: "ecotech-24-port-cat6a-shielded-patch-panel",
          sku: "ECO-PP-C6A-24S",
          model: "NetLink-C6A-24S",
          productType: "Copper Patch Panel",
          nameEn: "ECOTECH 24-Port Cat6A Shielded (STP) 1U 10G Patch Panel",
          nameAr: "لوحة توصيل شبكية إيكوتك Cat6A محمية 24 منفذ ارتفاع 1U بسرعة 10G",
          shortOverviewEn:
            "10GbE ANSI/TIA-568.2-D compliant 24-port shielded RJ45 patch panel with 50μm gold-plated contacts and integrated rear strain-relief bar.",
          shortOverviewAr:
            "لوحة توصيل شبكية 24 منفذ محمية بسرعة 10 جيجابت متوافقة مع معيار ANSI/TIA-568.2-D ومطلية بالذهب 50 ميكروإنش.",
          descriptionEn:
            "Designed to eliminate alien crosstalk (ANEXT) in high-speed 10GBASE-T deployments, the NetLink Cat6A panel features full 360-degree die-cast metal shielding and tool-less keystone modularity.",
          descriptionAr:
            "مصممة للقضاء على التداخل الكهرومغناطيسي في شبكات 10GBASE-T عالية السرعة، وتتميز بدرع معدني متكامل 360 درجة وتصميم وحدات قابل للتركيب السريع.",
          featuresEn: [
            "Supports 10GBASE-T up to 100 meters per ANSI/TIA-568.2-D",
            "50-microinch gold-plated phosphor bronze contacts",
            "Rear cable support bar with earthing wire included",
          ],
          featuresAr: [
            "تدعم سرعة 10GBASE-T لمسافة تصل إلى 100 متر وفق معيار TIA-568.2-D",
            "نقاط تلامس مطلية بالذهب بسماكة 50 ميكروإنش",
            "قضيب دعم خلفي للكابلات مزود بسلك تأريض",
          ],
          applicationsEn: ["10G Enterprise Horizontal Cabling", "Wi-Fi 6E / Wi-Fi 7 Uplinks", "Industrial EMI Environments"],
          applicationsAr: ["تمديدات الشبكات بسرعة 10 جيجابت", "روابط نقاط الوصول Wi-Fi 6E/7", "البيئات الصناعية ذات التداخل العالي"],
          configurationsEn: ["24-Port 1U Shielded", "48-Port 2U Shielded", "24-Port Unshielded UTP"],
          configurationsAr: ["24 منفذ 1U محمية", "48 منفذ 2U محمية", "24 منفذ 1U غير محمية"],
          dimensions: "44.4 mm (1U) x 482.6 mm x 115 mm",
          materialsEn: "Cold-rolled steel bezel with zinc-alloy shielded jacks",
          materialsAr: "واجهة فولاذية مع مقابس محمية من سبيكة الزنك",
          availabilityStatus: "in_stock",
          isFeatured: true,
          isBestSeller: false,
          images: ["/images/cat-accessories.jpg"],
          specs: [
            { groupEn: "Transmission", groupAr: "الأداء الشبكي", keyEn: "Bandwidth", keyAr: "عرض النطاق", valEn: "500 MHz (10GBASE-T)", valAr: "500 ميجاهرتز (10GBASE-T)" },
            { groupEn: "Transmission", groupAr: "الأداء الشبكي", keyEn: "PoE Support", keyAr: "دعم الطاقة عبر الإيثرنت", valEn: "IEEE 802.3bt Type 4 (90W PoE++)", valAr: "IEEE 802.3bt Type 4 (90 واط)" },
          ],
        },
        {
          categorySlug: "data-center-infrastructure",
          slug: "ecotech-modular-cold-aisle-containment-system",
          sku: "ECO-CUS-CAC-42U",
          model: "AisleGuard-CAC-Pro",
          productType: "Custom Containment Solution",
          nameEn: "ECOTECH Modular Cold-Aisle Data Center Containment System",
          nameAr: "نظام احتواء الممر البارد المعياري لمراكز البيانات من إيكوتك",
          shortOverviewEn:
            "Custom-engineered modular aisle containment featuring tempered glass sliding doors, drop-away fire-suppression roof panels, and PUE optimization.",
          shortOverviewAr:
            "نظام احتواء ممرات معياري مصمم هندسياً بأبواب زجاجية منزلقة وألواح سقف ذكية متوافقة مع أنظمة إطفاء الحريق.",
          descriptionEn:
            "ECOTECH AisleGuard containment isolates cold supply air from hot exhaust streams, reducing cooling energy consumption by up to 32% and eliminating hot spots in high-density data center pods.",
          descriptionAr:
            "يقوم نظام AisleGuard بفصل الهواء البارد عن الهواء الساخن الخارج من الخوادم، مما يقلل استهلاك طاقة التبريد بنسبة تصل إلى 32% ويمنع النقاط الحرارية الساخنة.",
          featuresEn: [
            "Electromagnetic drop-away polycarbonate roof panels linked to fire alarm panel",
            "Automatic or soft-close dual tempered glass sliding end-of-aisle doors",
            "Custom width & height bridging for multi-vendor server cabinets",
          ],
          featuresAr: [
            "ألواح سقف كهرومغناطيسية تفتح تلقائياً عند إنذار الحريق",
            "أبواب منزلقة مزدوجة من الزجاج المقوى في نهايات الممر",
            "تصميم مرن يتوافق مع مختلف مقاسات كبائن الخوادم",
          ],
          applicationsEn: ["Hyperscale & Enterprise Data Centers", "Modular Prefabricated Data Halls"],
          applicationsAr: ["مراكز البيانات الكبرى والمؤسسية", "قاعات البيانات المعيارية الجاهزة"],
          configurationsEn: ["1200mm Aisle Width", "1500mm Aisle Width", "Custom Pod Layout"],
          configurationsAr: ["عرض ممر 1200 مم", "عرض ممر 1500 مم", "تصميم مخصص حسب المشروع"],
          dimensions: "Custom Project Engineered (1200mm / 1500mm / 1800mm Aisle)",
          materialsEn: "Extruded aluminum structural framing, 8mm safety glass, UL94 V-0 clear roof panels",
          materialsAr: "إطار ألمنيوم إنشائي، زجاج أمان 8 مم، ألواح سقف شفافة مقاومة للحريق",
          availabilityStatus: "made_to_order",
          isFeatured: true,
          isBestSeller: false,
          images: ["/images/cat-custom.jpg", "/images/hero-datacenter.jpg"],
          specs: [
            { groupEn: "Efficiency", groupAr: "الكفاءة", keyEn: "Cooling Energy Savings", keyAr: "توفير طاقة التبريد", valEn: "Up to 32% PUE Improvement", valAr: "تحسن كفاءة الطاقة حتى 32%" },
            { groupEn: "Safety", groupAr: "السلامة", keyEn: "Fire Integration", keyAr: "تكامل الحريق", valEn: "24V DC Fail-Safe Roof Release (UL/FM Ready)", valAr: "إطلاق سقف آمن 24V DC متوافق مع أنظمة الإطفاء" },
          ],
        },
      ];

      for (let idx = 0; idx < productsSeed.length; idx++) {
        const p = productsSeed[idx];
        const categoryId = catSlugToId.get(p.categorySlug);
        if (!categoryId) continue;

        const [createdProd] = await db
          .insert(products)
          .values({
            categoryId,
            slug: p.slug,
            sku: p.sku,
            model: p.model,
            productType: p.productType,
            nameEn: p.nameEn,
            nameAr: p.nameAr,
            shortOverviewEn: p.shortOverviewEn,
            shortOverviewAr: p.shortOverviewAr,
            descriptionEn: p.descriptionEn,
            descriptionAr: p.descriptionAr,
            featuresEn: p.featuresEn,
            featuresAr: p.featuresAr,
            applicationsEn: p.applicationsEn,
            applicationsAr: p.applicationsAr,
            configurationsEn: p.configurationsEn,
            configurationsAr: p.configurationsAr,
            dimensions: p.dimensions,
            materialsEn: p.materialsEn,
            materialsAr: p.materialsAr,
            availabilityStatus: p.availabilityStatus,
            status: "published",
            isFeatured: p.isFeatured,
            isBestSeller: p.isBestSeller,
            has360View: idx === 0,
            displayOrder: idx + 1,
            viewCount: 120 - idx * 11,
            seoTitleEn: `${p.nameEn} | ECOTECH`,
            seoTitleAr: `${p.nameAr} | إيكوتك`,
            seoDescriptionEn: p.shortOverviewEn,
            seoDescriptionAr: p.shortOverviewAr,
            ogImageUrl: p.images[0],
          })
          .returning();

        // Gallery images
        for (let i = 0; i < p.images.length; i++) {
          await db.insert(productImages).values({
            productId: createdProd.id,
            url: p.images[i],
            mediaType: "image",
            altEn: `${p.nameEn} - View ${i + 1}`,
            altAr: `${p.nameAr} - صورة ${i + 1}`,
            isPrimary: i === 0,
            is360Frame: idx === 0,
            displayOrder: i,
          });
        }

        // Specifications
        for (let i = 0; i < p.specs.length; i++) {
          const s = p.specs[i];
          await db.insert(productSpecifications).values({
            productId: createdProd.id,
            groupNameEn: s.groupEn,
            groupNameAr: s.groupAr,
            specKeyEn: s.keyEn,
            specKeyAr: s.keyAr,
            specValueEn: s.valEn,
            specValueAr: s.valAr,
            displayOrder: i,
          });
        }

        // Generate real downloadable Datasheet PDF for each product
        const dsPdf = buildEcotechPdf({
          title: p.nameEn,
          subtitle: `SKU: ${p.sku}  |  Model: ${p.model}  |  ${p.productType}`,
          metaCode: `DATASHEET: ${p.sku}`,
          sections: [
            {
              heading: "Product Overview",
              lines: [p.shortOverviewEn, p.descriptionEn],
            },
            {
              heading: "Technical Specifications",
              lines: p.specs.map((s) => `${s.keyEn}: ${s.valEn}`),
            },
            {
              heading: "Key Features & Materials",
              lines: [
                ...p.featuresEn.map((f) => `* ${f}`),
                `Dimensions: ${p.dimensions}`,
                `Materials: ${p.materialsEn}`,
              ],
            },
          ],
        });
        const dsFileName = `${p.sku.toLowerCase()}-datasheet.pdf`;
        const dsMedia = await writePdfToStorage(
          "datasheets",
          dsFileName,
          dsPdf,
          superAdmin.id
        );

        await db.insert(productDocuments).values({
          productId: createdProd.id,
          mediaId: dsMedia.id,
          docType: "datasheet",
          titleEn: `${p.model} Official Technical Datasheet (PDF)`,
          titleAr: `النشرة الفنية الرسمية للمنتج ${p.model} (PDF)`,
          fileUrl: dsMedia.publicUrl,
          fileName: dsFileName,
          fileSize: dsPdf.length,
          mimeType: "application/pdf",
          displayOrder: 1,
        });
      }

      // 6. Seed Homepage Sections
      await db.insert(homepageSections).values([
        {
          sectionKey: "hero",
          titleEn: "Powering the Future of Network Infrastructure",
          titleAr: "نقود مستقبل البنية التحتية للشبكات والطاقة الذكية",
          subtitleEn:
            "Advanced Networking, Fiber Optic and Smart Power Distribution Solutions.",
          subtitleAr:
            "حلول متطورة في هندسة الشبكات والألياف الضوئية وتوزيع الطاقة الذكي لمراكز البيانات.",
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
            catalogHref: masterCatalogMedia.publicUrl,
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
          subtitleEn:
            "Precision industrial engineering combined with end-to-end compliance and responsive technical support.",
          subtitleAr:
            "هندسة صناعية دقيقة مدعومة بالامتثال للمعايير العالمية ودعم فني وهندسي متواصل.",
          payload: {
            cards: [
              {
                titleEn: "Precision Sheet Metal & CNC Fabrication",
                titleAr: "تصنيع معدني دقيق بتقنيات CNC",
                descEn: "Automated laser cutting, CNC turret punching, and 7-stage powder coating for corrosion-proof cabinets.",
                descAr: "قص ليزري آلي وتشكيل CNC مع طلاء بودرة بـ 7 مراحل لمقاومة التآكل.",
              },
              {
                titleEn: "100% Factory Optical & Electrical Testing",
                titleAr: "اختبار مصنعي بنسبة 100% للألياف والطاقة",
                descEn: "Every fiber patch cord is interferometer verified and every Smart PDU undergoes full thermal burn-in testing.",
                descAr: "يتم فحص كل كابل ألياف ضوئية وكل وحدة طاقة ذكية تحت الحمل الكامل قبل الشحن.",
              },
              {
                titleEn: "Turnkey Data Center Customization",
                titleAr: "تخصيص متكامل لمراكز البيانات",
                descEn: "Custom dimensions, RAL colors, OEM PDU outlet layouts, and pre-terminated trunk assemblies built to project specs.",
                descAr: "تصميم مقاسات وألوان وتوزيعات طاقة مخصصة وفق متطلبات كل مشروع.",
              },
              {
                titleEn: "Global Compliance & Fast Lead Times",
                titleAr: "اعتمادات عالمية وسرعة التوريد",
                descEn: "Full IEC, EIA-310-E, UL, CE, RoHS, and TIA-568 documentation backed by regional stock availability.",
                descAr: "توافق كامل مع معايير IEC و EIA-310-E و UL و CE و RoHS مع توفر المخزون.",
              },
            ],
          },
          displayOrder: 3,
          isVisible: true,
        },
        {
          sectionKey: "capabilities",
          titleEn: "Engineering & Manufacturing Capabilities",
          titleAr: "القدرات الهندسية والتصنيعية",
          subtitleEn:
            "From structural CAD design and thermal CFD modeling to automated assembly and compliance testing.",
          subtitleAr:
            "من التصميم الهندسي CAD ومحاكاة التبريد إلى خطوط التجميع الآلية واختبارات الجودة.",
          payload: {
            items: [
              {
                titleEn: "Thermal & Airflow Optimization",
                titleAr: "تحسين التبريد وتدفق الهواء",
                descEn: "80% perforated airflow doors, blanking panels, and cold-aisle containment engineered to lower data center PUE.",
                descAr: "أبواب مثقبة بنسبة 80% وأنظمة احتواء الممرات الباردة لرفع كفاءة التبريد.",
              },
              {
                titleEn: "Intelligent Power Telemetry",
                titleAr: "القياس الذكي وإدارة الطاقة",
                descEn: "Real-time kWh, power factor, harmonic distortion, and environmental telemetry over SNMPv3 and REST APIs.",
                descAr: "قياس فوري للطاقة ومعامل القدرة والبيئة عبر بروتوكولات SNMPv3 و REST API.",
              },
              {
                titleEn: "High-Density Fiber Terminations",
                titleAr: "إنهاء الألياف عالي الكثافة",
                descEn: "Pre-terminated MPO/MTP trunks and 48/96-port 1U ODF frames built for 100G/400G backbone upgrades.",
                descAr: "كابلات MPO/MTP وإطارات ODF جاهزة لترقيات شبكات 100G و 400G.",
              },
            ],
          },
          displayOrder: 4,
          isVisible: true,
        },
        {
          sectionKey: "projects",
          titleEn: "Featured Projects & Applications",
          titleAr: "مشاريع وتطبيقات مختارة",
          subtitleEn:
            "Trusted across banking data centers, telecom hubs, smart campuses, and healthcare networks.",
          subtitleAr:
            "حلولنا موثوقة في مراكز بيانات البنوك، شركات الاتصالات، الجامعات الذكية، والمستشفيات.",
          payload: {
            projects: [
              {
                titleEn: "National Financial Tier-III Data Hall",
                titleAr: "قاعة بيانات مالية من الفئة الثالثة",
                scopeEn: "180x 42U ProSeries Racks, Dual-Feed 3-Phase Smart PDUs & Cold Aisle Containment",
                scopeAr: "180 كابينة 42U ووحدات طاقة ذكية مزدوجة التغذية ونظام احتواء الممر البارد",
                sectorEn: "Banking & Finance",
                sectorAr: "القطاع المصرفي والمالي",
              },
              {
                titleEn: "Regional 5G Core & Fiber POP Rollout",
                titleAr: "توسعة شبكة الألياف ونقاط 5G الأساسية",
                scopeEn: "High-density 1U/4U ODF frames, IP55 outdoor cabinets & OS2 armored fiber trunks",
                scopeAr: "إطارات ODF عالية الكثافة وكبائن خارجية IP55 وكابلات ألياف مدرعة",
                sectorEn: "Telecommunications",
                sectorAr: "قطاع الاتصالات",
              },
              {
                titleEn: "University Smart Campus Backbone",
                titleAr: "الشبكة الرئيسية لحرم جامعي ذكي",
                scopeEn: "240+ Wall-Mount & Floor Racks, Cat6A STP Panels & 10G Fiber Interconnects",
                scopeAr: "أكثر من 240 كابينة جدارية وأرضية ولوحات Cat6A محمية وربط ألياف 10G",
                sectorEn: "Education & Public Sector",
                sectorAr: "التعليم والقطاع الحكومي",
              },
            ],
          },
          displayOrder: 5,
          isVisible: true,
        },
        {
          sectionKey: "certifications",
          titleEn: "Certifications & Quality Standards",
          titleAr: "الاعتمادات ومعايير الجودة العالمية",
          subtitleEn:
            "Every ECOTECH system is engineered, tested, and certified to international electrical, mechanical, and optical benchmarks.",
          subtitleAr:
            "جميع أنظمة إيكوتك مصممة ومختبرة ومعتمدة وفق أرقى المعايير الكهربائية والميكانيكية والبصرية الدولية.",
          payload: {
            badges: [
              { code: "ISO 9001:2015", descEn: "Quality Management System", descAr: "نظام إدارة الجودة" },
              { code: "IEC 60297", descEn: "19-Inch Mechanical Rack Standard", descAr: "معيار الكبائن الميكانيكي 19 بوصة" },
              { code: "EIA-310-E", descEn: "Server Cabinet Structural Compliance", descAr: "توافق هياكل كبائن الخوادم" },
              { code: "TIA-568.2-D", descEn: "Structured Cabling & Fiber Performance", descAr: "معيار التمديدات الهيكلية والألياف" },
              { code: "CE & UL 62368", descEn: "Smart PDU Electrical Safety", descAr: "السلامة الكهربائية لوحدات الطاقة" },
              { code: "RoHS / REACH", descEn: "Hazardous Substance Compliance", descAr: "الامتثال البيئي وخلو المواد الخطرة" },
            ],
          },
          displayOrder: 6,
          isVisible: true,
        },
        {
          sectionKey: "news",
          titleEn: "Latest News & Engineering Updates",
          titleAr: "أحدث الأخبار والتحديثات الهندسية",
          subtitleEn: "Product launches, technical advisories, and data center infrastructure insights.",
          subtitleAr: "إطلاقات المنتجات الجديدة، التحديثات الفنية، ورؤى البنية التحتية لمراكز البيانات.",
          payload: {
            posts: [
              {
                date: "2026-02-18",
                tagEn: "Product Launch",
                tagAr: "إطلاق منتج",
                titleEn: "Introducing PowerCore i24: 22kW 3-Phase Outlet-Metered Smart PDU for AI Racks",
                titleAr: "إطلاق PowerCore i24: وحدة طاقة ذكية ثلاثية الطور بقدرة 22 كيلوواط لكبائن الذكاء الاصطناعي",
                summaryEn: "Built with hot-swappable OLED network management and ±1% billing-grade metrology per outlet.",
                summaryAr: "مصممة بوحدة تحكم شبكية قابلة للاستبدال السريع ودقة قياس ±1% لكل منفذ.",
              },
              {
                date: "2026-01-24",
                tagEn: "Engineering Brief",
                tagAr: "مذكرة هندسية",
                titleEn: "Reducing Cooling OpEx by 32% with Modular Cold-Aisle Containment",
                titleAr: "خفض تكاليف تبريد مراكز البيانات بنسبة 32% عبر احتواء الممر البارد",
                summaryEn: "Field thermal results from a 180-rack financial Tier-III installation utilizing ECOTECH 80% mesh doors.",
                summaryAr: "نتائج الأداء الحراري الميدانية لمشروع مركز بيانات مالي يضم 180 كابينة.",
              },
              {
                date: "2025-12-10",
                tagEn: "Standards",
                tagAr: "معايير الجودة",
                titleEn: "ECOTECH Expands Automated 100% Interferometer Testing Line for OS2 & OM5 Patch Cords",
                titleAr: "إيكوتك توسع خط الاختبار البصري الآلي لكابلات الألياف OS2 و OM5",
                summaryEn: "Enhancing turnaround times for custom pre-terminated fiber trunk orders across enterprise deployments.",
                summaryAr: "رفع الطاقة الإنتاجية لتجهيز كابلات الألياف المخصصة لمشاريع المؤسسات الكبرى.",
              },
            ],
          },
          displayOrder: 7,
          isVisible: true,
        },
      ]);

      // 7. Seed About Us Page
      await db.insert(websitePages).values({
        slug: "about-us",
        titleEn: "Engineering Excellence in Network & Power Infrastructure",
        titleAr: "التميز الهندسي في البنية التحتية للشبكات والطاقة",
        subtitleEn:
          "ECOTECH is a specialized manufacturer of enterprise network cabinets, high-density fiber optic systems, and intelligent rack power distribution solutions.",
        subtitleAr:
          "إيكوتك شركة متخصصة في تصنيع كبائن الشبكات المؤسسية وأنظمة الألياف الضوئية عالية الكثافة وحلول توزيع الطاقة الذكية.",
        contentEn:
          "Founded to bridge precision industrial manufacturing with mission-critical IT requirements, ECOTECH delivers fully tested, standards-compliant infrastructure hardware trusted by data center operators, telecom carriers, and enterprise systems integrators.",
        contentAr:
          "تأسست إيكوتك للجمع بين دقة التصنيع الصناعي ومتطلبات تقنية المعلومات الحرجة، حيث تقدم أجهزة بنية تحتية مختبرة بالكامل ومعتمدة من مشغلي مراكز البيانات وشركات الاتصالات ومكملي الأنظمة.",
        structuredData: {
          companyProfilePdfUrl: companyProfileMedia.publicUrl,
          visionEn:
            "To be the premier engineering partner for resilient, energy-efficient physical layer and power infrastructure across modern data centers.",
          visionAr:
            "أن نكون الشريك الهندسي الأول للبنية التحتية الفيزيائية والطاقة عالية الكفاءة في مراكز البيانات الحديثة.",
          missionEn:
            "Deliver precision-manufactured racks, ultra-low-loss optical connectivity, and intelligent power telemetry backed by rigorous testing and responsive engineering support.",
          missionAr:
            "تقديم كبائن مصنعة بدقة، وحلول ألياف ضوئية فائقة الأداء، ووحدات طاقة ذكية مدعومة باختبارات صارمة ودعم هندسي سريع.",
          values: [
            { titleEn: "Engineering Precision", titleAr: "الدقة الهندسية", descEn: "Zero-compromise tolerances across sheet metal, optics, and electronics.", descAr: "أعلى معايير الدقة في التصنيع المعدني والبصري والإلكتروني." },
            { titleEn: "Operational Reliability", titleAr: "الاعتمادية التشغيلية", descEn: "100% factory testing before shipment for uninterrupted uptime.", descAr: "اختبار مصنعي شامل بنسبة 100% لضمان استمرارية التشغيل." },
            { titleEn: "Energy Intelligence", titleAr: "ذكاء الطاقة", descEn: "Airflow-optimized racks and metering PDUs that actively lower PUE.", descAr: "تصاميم تبريد وقياس طاقة ذكية تخفض استهلاك مراكز البيانات." },
          ],
          manufacturingCapabilities: [
            "Automated Fiber-Laser Cutting & CNC Bending Lines",
            "7-Stage Phosphate Pre-Treatment & Electrostatic Powder Coating",
            "Automated Smart PDU Metrology Calibration & Thermal Burn-In Chambers",
            "3D End-Face Interferometry & OTDR Optical Verification Labs",
          ],
          manufacturingCapabilitiesAr: [
            "خطوط قص بالليزر وتشكيل المعادن بالتحكم الرقمي CNC",
            "معالجة سطحية بـ 7 مراحل وطلاء بودرة إلكتروستاتيك",
            "غرف معايرة واختبار الأحمال الحرارية لوحدات الطاقة الذكية",
            "مختبرات فحص الألياف الضوئية بالتداخل ثلاثي الأبعاد و OTDR",
          ],
          industries: [
            { en: "Cloud & Hyperscale Data Centers", ar: "مراكز البيانات السحابية" },
            { en: "Telecommunications & 5G Core", ar: "الاتصالات وشبكات 5G" },
            { en: "Banking & Financial Institutions", ar: "البنوك والمؤسسات المالية" },
            { en: "Healthcare & Smart Hospitals", ar: "الرعاية الصحية والمستشفيات الذكية" },
            { en: "Energy, Oil & Industrial Automation", ar: "الطاقة والأتمتة الصناعية" },
            { en: "Government & Smart Campuses", ar: "القطاع الحكومي والجامعات الذكية" },
          ],
        },
        isPublished: true,
      });

      // 8. Seed Company Settings (Configurable in Admin -> Settings)
      await db.insert(companySettings).values([
        {
          key: "company_name",
          valueEn: "ECOTECH Infrastructure Systems",
          valueAr: "إيكوتك لأنظمة البنية التحتية",
        },
        {
          key: "contact_email",
          valueEn: "sales@ecotech-infra.com",
          valueAr: "sales@ecotech-infra.com",
        },
        {
          key: "support_email",
          valueEn: "engineering@ecotech-infra.com",
          valueAr: "engineering@ecotech-infra.com",
        },
        {
          key: "phone_primary",
          valueEn: "+971 4 555 0190",
          valueAr: "+971 4 555 0190",
        },
        {
          key: "phone_sales",
          valueEn: "+971 4 555 0195",
          valueAr: "+971 4 555 0195",
        },
        {
          key: "address",
          valueEn: "Plot 42, Industrial Technology Zone, Gate 3, Dubai, UAE",
          valueAr: "قطعة 42، المنطقة الصناعية التكنولوجية، بوابة 3، دبي، الإمارات",
        },
        {
          key: "working_hours",
          valueEn: "Monday – Friday: 08:30 – 18:00 GST",
          valueAr: "الإثنين – الجمعة: 08:30 صباحاً – 06:00 مساءً",
        },
        {
          key: "google_maps_embed_url",
          valueEn:
            "https://maps.google.com/maps?q=Dubai%20Industrial%20City&t=&z=13&ie=UTF8&iwloc=&output=embed",
          valueAr:
            "https://maps.google.com/maps?q=Dubai%20Industrial%20City&t=&z=13&ie=UTF8&iwloc=&output=embed",
        },
        {
          key: "master_catalog_url",
          valueEn: masterCatalogMedia.publicUrl,
          valueAr: masterCatalogMedia.publicUrl,
        },
        {
          key: "company_profile_url",
          valueEn: companyProfileMedia.publicUrl,
          valueAr: companyProfileMedia.publicUrl,
        },
        {
          key: "footer_about",
          valueEn:
            "ECOTECH engineers and manufactures high-reliability network racks, fiber optic connectivity, and intelligent Smart PDU power systems for mission-critical infrastructure.",
          valueAr:
            "تصمم وتصنع إيكوتك كبائن الشبكات عالية الاعتمادية، وأنظمة الألياف الضوئية، ووحدات توزيع الطاقة الذكية للبنية التحتية الحرجة.",
        },
        {
          key: "social_links",
          valueJson: {
            linkedin: "https://linkedin.com",
            youtube: "https://youtube.com",
            x: "https://x.com",
            instagram: "https://instagram.com",
          },
        },
      ]);

      // 9. Seed Navigation Menus
      await db.insert(navigationMenus).values([
        { location: "header", labelEn: "Home", labelAr: "الرئيسية", href: "/", displayOrder: 1, isVisible: true },
        { location: "header", labelEn: "Products", labelAr: "المنتجات", href: "/products", displayOrder: 2, isVisible: true },
        { location: "header", labelEn: "Custom Solutions", labelAr: "الحلول المخصصة", href: "/categories/custom-solutions", displayOrder: 3, isVisible: true },
        { location: "header", labelEn: "About ECOTECH", labelAr: "عن إيكوتك", href: "/about", displayOrder: 4, isVisible: true },
        { location: "header", labelEn: "Contact & Sales", labelAr: "المبيعات والتواصل", href: "/contact", displayOrder: 5, isVisible: true },
      ]);

      // 10. Seed Initial Sample Customer Inquiries so Admin CRM has live records immediately
      const firstProd = await db.select().from(products).limit(1);
      const [inq1] = await db
        .insert(inquiries)
        .values([
          {
            referenceCode: "RFQ-2026-1001",
            inquiryType: "quote",
            customerName: "Khalid Al-Saud",
            companyName: "Gulf Cloud Data Centers",
            email: "k.alsaud@gulfcloud.example",
            phone: "+966 50 555 0142",
            country: "Saudi Arabia",
            productId: firstProd[0]?.id ?? null,
            productNameSnapshot: firstProd[0]?.nameEn ?? "ECOTECH 42U ProSeries Perforated Server Rack",
            quantity: "24 Units",
            message:
              "Requesting formal quotation and CAD drawings for 24x 42U 800x1000mm cabinets with dual vertical 0U Smart PDUs.",
            status: "new",
          },
          {
            referenceCode: "RFQ-2026-1002",
            inquiryType: "sales",
            customerName: "Elena Rostova",
            companyName: "NetCore Integrators LLC",
            email: "elena@netcore.example",
            phone: "+971 52 555 0188",
            country: "United Arab Emirates",
            productNameSnapshot: "ECOTECH 48-Port High-Density 1U Sliding Fiber ODF Panel",
            quantity: "60 Units",
            message:
              "Need lead time and bulk pricing for 60x 48-Port LC/UPC ODF panels for Q2 telecom rollout.",
            status: "in_progress",
            assignedToId: superAdmin.id,
          },
        ])
        .returning();

      if (inq1) {
        await db.insert(inquiryNotes).values({
          inquiryId: inq1.id,
          authorId: superAdmin.id,
          authorName: superAdmin.fullName,
          note: "Initial RFQ logged; engineering team preparing 42U rack CAD package and Smart PDU BOM.",
        });
      }
    } catch (error) {
      seedPromise = null;
      console.error("Seed error:", error);
      throw error;
    }
  })();

  return seedPromise;
}

export async function getSettingValue(key: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.key, key))
    .limit(1);
  return rows[0]?.valueEn ?? null;
}
