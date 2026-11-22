/**
 * company_settings also holds private state (for example per-user sign-in
 * security). Only these keys may ever reach a public page or the public
 * settings endpoint. Anything not listed here stays server-side.
 */
export const PUBLIC_SETTING_KEYS = new Set([
  "company_name",
  "contact_email",
  "support_email",
  "phone_primary",
  "phone_sales",
  "address",
  "working_hours",
  "google_maps_embed_url",
  "footer_about",
  "social_links",
  "company_profile_url",
]);

export const isPublicSettingKey = (key: string) => PUBLIC_SETTING_KEYS.has(key);
