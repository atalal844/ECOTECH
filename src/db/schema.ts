import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  bigint,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. User Roles (RBAC)
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // super_admin, admin, editor, sales_manager
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Users
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    fullNameAr: text("full_name_ar"),
    roleId: integer("role_id")
      .notNull()
      .references(() => userRoles.id),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("users_email_idx").on(table.email)]
);

// 3. Media Library
export const mediaLibrary = pgTable(
  "media_library",
  {
    id: serial("id").primaryKey(),
    fileName: text("file_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    extension: text("extension").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    folder: text("folder").notNull().default("general"),
    storagePath: text("storage_path").notNull(),
    publicUrl: text("public_url").notNull(),
    altEn: text("alt_en"),
    altAr: text("alt_ar"),
    captionEn: text("caption_en"),
    captionAr: text("caption_ar"),
    isLegacyArchive: boolean("is_legacy_archive").notNull().default(false),
    uploadedById: integer("uploaded_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("media_folder_idx").on(table.folder),
    index("media_ext_idx").on(table.extension),
  ]
);

// 4. Product Categories (Self-referencing hierarchy + Bilingual)
export const productCategories = pgTable(
  "product_categories",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id"),
    slug: text("slug").notNull().unique(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    imageUrl: text("image_url"),
    bannerUrl: text("banner_url"),
    catalogUrl: text("catalog_url"),
    imageMediaId: integer("image_media_id").references(() => mediaLibrary.id, {
      onDelete: "set null",
    }),
    bannerMediaId: integer("banner_media_id").references(() => mediaLibrary.id, {
      onDelete: "set null",
    }),
    catalogMediaId: integer("catalog_media_id").references(() => mediaLibrary.id, {
      onDelete: "set null",
    }),
    displayOrder: integer("display_order").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    seoTitleEn: text("seo_title_en"),
    seoTitleAr: text("seo_title_ar"),
    seoDescriptionEn: text("seo_description_en"),
    seoDescriptionAr: text("seo_description_ar"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("categories_parent_idx").on(table.parentId),
    uniqueIndex("categories_slug_idx").on(table.slug),
  ]
);

// 5. Products
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => productCategories.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().unique(),
    model: text("model").notNull(),
    productType: text("product_type").notNull().default("standard"),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    shortOverviewEn: text("short_overview_en"),
    shortOverviewAr: text("short_overview_ar"),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    featuresEn: jsonb("features_en").$type<string[]>().notNull().default([]),
    featuresAr: jsonb("features_ar").$type<string[]>().notNull().default([]),
    applicationsEn: jsonb("applications_en").$type<string[]>().notNull().default([]),
    applicationsAr: jsonb("applications_ar").$type<string[]>().notNull().default([]),
    configurationsEn: jsonb("configurations_en").$type<string[]>().notNull().default([]),
    configurationsAr: jsonb("configurations_ar").$type<string[]>().notNull().default([]),
    dimensions: text("dimensions"),
    materialsEn: text("materials_en"),
    materialsAr: text("materials_ar"),
    availabilityStatus: text("availability_status").notNull().default("in_stock"), // in_stock | made_to_order | pre_order | discontinued
    status: text("status").notNull().default("draft"), // draft | published | archived
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    has360View: boolean("has_360_view").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    seoTitleEn: text("seo_title_en"),
    seoTitleAr: text("seo_title_ar"),
    seoDescriptionEn: text("seo_description_en"),
    seoDescriptionAr: text("seo_description_ar"),
    ogImageUrl: text("og_image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    index("products_sku_idx").on(table.sku),
    index("products_category_idx").on(table.categoryId),
    index("products_status_idx").on(table.status),
  ]
);

// 6. Product Images (Gallery + Primary + 360 + Video/GIF)
export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").references(() => mediaLibrary.id, {
      onDelete: "set null",
    }),
    url: text("url").notNull(),
    mediaType: text("media_type").notNull().default("image"), // image | gif | video
    altEn: text("alt_en"),
    altAr: text("alt_ar"),
    captionEn: text("caption_en"),
    captionAr: text("caption_ar"),
    isPrimary: boolean("is_primary").notNull().default(false),
    is360Frame: boolean("is_360_frame").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("product_images_prod_idx").on(table.productId)]
);

// 7. Product Documents (Datasheets, Manuals, Diagrams, Certificates, Legacy SWF)
export const productDocuments = pgTable(
  "product_documents",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").references(() => mediaLibrary.id, {
      onDelete: "set null",
    }),
    docType: text("doc_type").notNull().default("datasheet"), // datasheet | manual | diagram | certificate | installation_guide | catalog | legacy_archive | other
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).default(0),
    mimeType: text("mime_type").default("application/pdf"),
    isLegacyArchive: boolean("is_legacy_archive").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("product_docs_prod_idx").on(table.productId)]
);

// 8. Product Technical Specifications (Only Admin-approved specs)
export const productSpecifications = pgTable(
  "product_specifications",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    groupNameEn: text("group_name_en").notNull().default("General"),
    groupNameAr: text("group_name_ar").notNull().default("عام"),
    specKeyEn: text("spec_key_en").notNull(),
    specKeyAr: text("spec_key_ar").notNull(),
    specValueEn: text("spec_value_en").notNull(),
    specValueAr: text("spec_value_ar").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [index("product_specs_prod_idx").on(table.productId)]
);

// 9. Website Pages (About Us, Custom Solutions Overview, Legal, etc.)
export const websitePages = pgTable("website_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  subtitleEn: text("subtitle_en"),
  subtitleAr: text("subtitle_ar"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  structuredData: jsonb("structured_data").$type<Record<string, unknown>>().default({}),
  seoTitleEn: text("seo_title_en"),
  seoTitleAr: text("seo_title_ar"),
  seoDescriptionEn: text("seo_description_en"),
  seoDescriptionAr: text("seo_description_ar"),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 10. Homepage Sections
export const homepageSections = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").notNull().unique(), // hero, stats, why_ecotech, capabilities, projects, certifications, news, contact_cta, promo_banner
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  subtitleEn: text("subtitle_en"),
  subtitleAr: text("subtitle_ar"),
  ctaPrimaryLabelEn: text("cta_primary_label_en"),
  ctaPrimaryLabelAr: text("cta_primary_label_ar"),
  ctaPrimaryHref: text("cta_primary_href"),
  ctaSecondaryLabelEn: text("cta_secondary_label_en"),
  ctaSecondaryLabelAr: text("cta_secondary_label_ar"),
  ctaSecondaryHref: text("cta_secondary_href"),
  heroMediaUrl: text("hero_media_url"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 11. Customer Inquiries & Quote Requests
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    referenceCode: text("reference_code").notNull().unique(),
    inquiryType: text("inquiry_type").notNull().default("quote"), // quote | contact | sales
    customerName: text("customer_name").notNull(),
    companyName: text("company_name"),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    country: text("country").notNull(),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productNameSnapshot: text("product_name_snapshot"),
    quantity: text("quantity"),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"), // new | in_progress | quoted | completed | cancelled
    assignedToId: integer("assigned_to_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_status_idx").on(table.status),
    index("inquiries_created_idx").on(table.createdAt),
  ]
);

// 12. Inquiry Internal Notes
export const inquiryNotes = pgTable("inquiry_notes", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id")
    .notNull()
    .references(() => inquiries.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorName: text("author_name").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. Company Settings (Contact, Footer, Catalog PDF, Socials, Map)
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  valueEn: text("value_en"),
  valueAr: text("value_ar"),
  valueJson: jsonb("value_json").$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 14. Navigation Menus
export const navigationMenus = pgTable("navigation_menus", {
  id: serial("id").primaryKey(),
  location: text("location").notNull().default("header"), // header | footer
  parentId: integer("parent_id"),
  labelEn: text("label_en").notNull(),
  labelAr: text("label_ar").notNull(),
  href: text("href").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});

// 15. Audit Activity Logs
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    userEmail: text("user_email"),
    userRole: text("user_role"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("activity_created_idx").on(table.createdAt)]
);

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ one, many }) => ({
    parent: one(productCategories, {
      fields: [productCategories.parentId],
      references: [productCategories.id],
      relationName: "categoryHierarchy",
    }),
    children: many(productCategories, { relationName: "categoryHierarchy" }),
    products: many(products),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  images: many(productImages),
  documents: many(productDocuments),
  specifications: many(productSpecifications),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  media: one(mediaLibrary, {
    fields: [productImages.mediaId],
    references: [mediaLibrary.id],
  }),
}));

export const productDocumentsRelations = relations(
  productDocuments,
  ({ one }) => ({
    product: one(products, {
      fields: [productDocuments.productId],
      references: [products.id],
    }),
    media: one(mediaLibrary, {
      fields: [productDocuments.mediaId],
      references: [mediaLibrary.id],
    }),
  })
);

export const productSpecificationsRelations = relations(
  productSpecifications,
  ({ one }) => ({
    product: one(products, {
      fields: [productSpecifications.productId],
      references: [products.id],
    }),
  })
);

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  product: one(products, {
    fields: [inquiries.productId],
    references: [products.id],
  }),
  notes: many(inquiryNotes),
}));

export const inquiryNotesRelations = relations(inquiryNotes, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryNotes.inquiryId],
    references: [inquiries.id],
  }),
}));
