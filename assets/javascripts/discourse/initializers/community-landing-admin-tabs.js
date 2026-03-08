// community-landing-admin-tabs v2.5.0
import { withPluginApi } from "discourse/lib/plugin-api";

// Setting descriptions — injected into the admin DOM since the newer
// plugin settings page does not render .desc elements automatically.
const DESCRIPTIONS = {
  // ── Master Switch ──
  community_landing_enabled: "Enable the community landing page for logged-out visitors.",

  // ── Layout ──
  section_order: "Order of content sections. Drag to reorder. Available: hero, stats, about, participation, topics, groups, app_cta.",
  custom_css: "Raw CSS injected after all plugin styles. Use for overrides and tweaks. No style tags needed.",

  // ── SEO & Meta ──
  meta_description: "Meta description for search engines and social sharing. If blank, the hero subtitle is used.",
  og_image_url: "Open Graph image URL for social sharing (1200×630px recommended). If blank, the site logo is used.",
  favicon_url: "Custom favicon URL (.ico, .png, .svg). If blank, the browser default is used.",
  json_ld_enabled: "Add JSON-LD structured data (Organization + WebSite schema) for search engines.",

  // ── Branding: Logo ──
  logo_dark_url: "Logo image URL for dark mode. Shown in navbar and footer. Leave blank to show site name as text.",
  logo_light_url: "Logo image URL for light mode. If not set, the dark logo is used for both themes.",
  logo_height: "Logo height in pixels (16–80). Applies to both navbar and footer logos.",
  footer_logo_url: "Override logo for the footer only. If not set, the navbar logo is reused.",

  // ── Colors ──
  accent_color: "Primary accent color: buttons, links, highlights, gradients, stat icons. Hex value.",
  accent_hover_color: "Accent color on hover. Should be slightly lighter or darker than the accent.",
  dark_bg_color: "Page background color for dark mode.",
  light_bg_color: "Page background color for light mode.",
  orb_color: "Color of decorative background orbs. Leave blank to use the accent color.",
  orb_opacity: "Opacity of the background orbs (0–100). Default: 50.",

  // ── Scroll Animations ──
  scroll_animation: "How sections animate into view on scroll: fade_up, fade_in, slide_left, slide_right, zoom_in, flip_up, or none.",
  staggered_reveal_enabled: "Animate child elements (cards, stats) with a staggered delay for a cascading reveal effect.",
  dynamic_background_enabled: "Enable parallax background orbs that drift as the user scrolls.",
  mouse_parallax_enabled: "Enable subtle parallax movement of background elements in response to mouse position.",
  scroll_progress_enabled: "Show a thin progress bar at the top of the page indicating scroll position.",

  // ── Fonts ──
  google_font_name: "Google Font family for body text. Must match exact Google Fonts name (e.g. 'Inter', 'Poppins'). Default: Outfit.",
  title_font_name: "Separate Google Font for titles and headings. Leave blank to use the body font.",

  // ── Icons ──
  fontawesome_enabled: "Load FontAwesome 6 Free icons from CDN for use on buttons.",

  // ── Navbar ──
  navbar_signin_label: "Text for the sign-in link in the navbar.",
  navbar_signin_enabled: "Show the sign-in link in the navbar.",
  navbar_signin_color_dark: "Sign-in link color for dark mode. Leave blank for default.",
  navbar_signin_color_light: "Sign-in link color for light mode.",
  navbar_join_label: "Text for the join/register CTA button in the navbar.",
  navbar_join_enabled: "Show the join/register button in the navbar.",
  navbar_join_color_dark: "Join button background color for dark mode. Leave blank for accent color.",
  navbar_join_color_light: "Join button background color for light mode.",
  navbar_bg_color: "Custom navbar background when scrolled. Leave blank for frosted glass effect.",
  navbar_border_style: "Border style at the bottom of the navbar when scrolled.",
  navbar_signin_icon: "FontAwesome icon name for sign-in (e.g. 'right-to-bracket'). Requires FontAwesome enabled.",
  navbar_signin_icon_position: "Show the sign-in icon before or after the label.",
  navbar_join_icon: "FontAwesome icon name for join button (e.g. 'user-plus'). Requires FontAwesome enabled.",
  navbar_join_icon_position: "Show the join icon before or after the label.",
  social_twitter_url: "Twitter / X profile URL. Leave blank to hide. Icons appear in navbar before auth buttons.",
  social_facebook_url: "Facebook page or profile URL. Leave blank to hide.",
  social_instagram_url: "Instagram profile URL. Leave blank to hide.",
  social_youtube_url: "YouTube channel URL. Leave blank to hide.",
  social_tiktok_url: "TikTok profile URL. Leave blank to hide.",
  social_github_url: "GitHub organization or profile URL. Leave blank to hide.",

  // ── Hero ──
  hero_title: "Main headline text in the hero section.",
  hero_title_size: "Hero title font size in pixels. 0 = use default responsive size.",
  hero_accent_word: "Which word gets the accent shimmer. 0 = last word, 1 = first, 2 = second, etc.",
  hero_subtitle: "Supporting text below the headline. Describe your community's purpose.",
  hero_card_enabled: "Display hero content inside a rounded card with border and shadow.",
  hero_image_first: "Show hero image above text on mobile / left on desktop. Off = text first.",
  hero_background_image_url: "Full-bleed background image behind the hero. In card mode, fills the card with overlay.",
  hero_image_urls: "Images for the right side of the hero. Up to 5 URLs — one shown randomly per page load.",
  hero_image_max_height: "Maximum height for the hero image in pixels (100–1200).",
  hero_primary_button_enabled: "Show the primary CTA button in the hero.",
  hero_primary_button_label: "Text on the primary (filled, accent-colored) CTA button.",
  hero_primary_button_url: "URL the primary button links to. Relative path or absolute URL.",
  hero_secondary_button_enabled: "Show the secondary CTA button in the hero.",
  hero_secondary_button_label: "Text on the secondary (outlined) CTA button.",
  hero_secondary_button_url: "URL the secondary button links to.",
  hero_primary_button_icon: "FontAwesome icon for primary button (e.g. 'rocket'). Leave blank for no icon.",
  hero_primary_button_icon_position: "Show the primary button icon before or after the label.",
  hero_secondary_button_icon: "FontAwesome icon for secondary button. Leave blank for no icon.",
  hero_secondary_button_icon_position: "Show the secondary button icon before or after the label.",
  hero_primary_btn_color_dark: "Primary button background for dark mode. Leave blank for accent color.",
  hero_primary_btn_color_light: "Primary button background for light mode.",
  hero_secondary_btn_color_dark: "Secondary button background for dark mode. Leave blank for glass style.",
  hero_secondary_btn_color_light: "Secondary button background for light mode.",
  hero_video_url: "Hero video URL (MP4 or YouTube). Play button opens a lightbox modal.",
  hero_video_button_color: "Custom color for the video play button. Leave blank for accent color.",
  hero_video_blur_on_hover: "Blur the hero image when hovering the play button.",
  hero_bg_dark: "Hero section background for dark mode. Leave blank for default.",
  hero_bg_light: "Hero section background for light mode.",
  hero_min_height: "Minimum hero section height in pixels. 0 = auto height.",
  hero_border_style: "Border style at the bottom of the hero section.",
  hero_card_bg_dark: "Hero card overlay background for dark mode. Only in card mode.",
  hero_card_bg_light: "Hero card overlay background for light mode.",
  hero_card_opacity: "Hero card background opacity (0–1). Lower = more transparent. Default: 0.85.",

  // ── Contributors (Hero Creators) ──
  contributors_enabled: "Show top 3 creators in the hero with gold, silver, bronze badges.",
  contributors_title: "Heading above the creators list.",
  contributors_title_enabled: "Show the heading above the creators list.",
  contributors_count_label: "Label before each creator's count (e.g. 'Cheers'). Blank = no prefix.",
  contributors_count_label_enabled: "Show the count label prefix before activity counts.",
  contributors_alignment: "Horizontal alignment of the creators list: center or left.",
  contributors_pill_max_width: "Max width per creator pill card in pixels (200–600).",
  contributors_pill_bg_dark: "Creator pill background for dark mode. Leave blank for glass styling.",
  contributors_pill_bg_light: "Creator pill background for light mode.",
  contributors_days: "Lookback period in days for calculating top contributors.",
  contributors_count: "Number of top contributors to fetch (top 3 in hero, 4–10 in Participation).",

  // ── Participation ──
  participation_enabled: "Show Participation section: testimonial cards with leaderboard bios (positions 4–10).",
  participation_title_enabled: "Show heading above participation cards.",
  participation_title: "Heading text above participation cards.",
  participation_bio_max_length: "Max characters from each user's bio (50–500). Longer bios are truncated.",
  participation_icon_color: "Color for the decorative quote icon and avatar border. Leave blank for accent color.",
  participation_card_bg_dark: "Participation card background for dark mode.",
  participation_card_bg_light: "Participation card background for light mode.",
  participation_bg_dark: "Section background for dark mode. Leave blank for default.",
  participation_bg_light: "Section background for light mode.",
  participation_min_height: "Minimum section height in pixels. 0 = auto.",
  participation_border_style: "Border style at the bottom of the section.",
  participation_title_size: "Section title font size in pixels. 0 = use default.",
  participation_stat_color: "Color for stat numbers (Topics, Posts, Likes). Leave blank for default text color.",
  participation_stat_label_color: "Color for stat labels below the numbers. Leave blank for muted text.",
  participation_bio_color: "Color for the bio excerpt text. Leave blank for default text color.",
  participation_name_color: "Color for the @username. Leave blank for default strong text color.",
  participation_meta_color: "Color for the join date and location line. Leave blank for accent color.",

  // ── Stats ──
  stats_enabled: "Show the stats section with live community counters.",
  stat_labels_enabled: "Show text labels below stat counters (e.g. 'Members'). Off = numbers and icons only.",
  stats_title_enabled: "Show section heading above the stats row.",
  stats_title: "Section heading text above the stats.",
  stats_title_size: "Stats title font size in pixels. 0 = use default.",
  stat_card_style: "Stat card style: rectangle, rounded, pill, or minimal (no background).",
  stat_icon_color: "Color for stat counter icons.",
  stat_icon_bg_color: "Background behind each stat icon. Leave blank for subtle accent tint.",
  stat_icon_shape: "Icon background shape: circle or rounded square.",
  stat_counter_color: "Color for stat counter numbers. Leave blank for default text color.",
  stat_members_label: "Custom label for the Members stat.",
  stat_topics_label: "Custom label for the Topics stat.",
  stat_posts_label: "Custom label for the Posts stat.",
  stat_likes_label: "Custom label for the Likes stat.",
  stat_chats_label: "Custom label for the Chats stat. Shows chat messages if Chat plugin is active.",
  stat_round_numbers: "Round large numbers: 1000 → 1K, 12345 → 12.3K, 1234567 → 1.2M.",
  stat_card_bg_dark: "Stat card background for dark mode.",
  stat_card_bg_light: "Stat card background for light mode.",
  stats_bg_dark: "Section background for dark mode. Leave blank for default.",
  stats_bg_light: "Section background for light mode.",
  stats_min_height: "Minimum section height in pixels. 0 = auto.",
  stats_border_style: "Border style at the bottom of the stats section.",

  // ── About ──
  about_enabled: "Show the About section: card with heading, quote icon, description, and author attribution.",
  about_heading_enabled: "Show the bold heading at the top of the About card.",
  about_heading: "Heading text at the top of the About card (e.g. 'About Community').",
  about_title: "Author or community name in the card's bottom attribution.",
  about_title_size: "About heading font size in pixels. 0 = use default.",
  about_role: "Subtitle below author name (e.g. 'Community Manager'). Blank = site name.",
  about_body: "Main body text. Supports HTML: p, a, strong, em, ul, li, br.",
  about_image_url: "Avatar image next to author name. Square images work best.",
  about_card_color_dark: "About card background for dark mode.",
  about_card_color_light: "About card background for light mode.",
  about_background_image_url: "Background image on the card. Use a subtle pattern or texture.",
  about_bg_dark: "Section background for dark mode. Leave blank for default.",
  about_bg_light: "Section background for light mode.",
  about_min_height: "Minimum section height in pixels. 0 = auto.",
  about_border_style: "Border style at the bottom of the about section.",

  // ── Trending ──
  topics_enabled: "Show Trending Discussions: scrollable row of active topic cards with live data.",
  topics_title_enabled: "Show heading above the topic cards.",
  topics_title: "Heading text above the topic cards.",
  topics_title_size: "Trending title font size in pixels. 0 = use default.",
  topics_count: "Number of trending topic cards to display.",
  topics_card_bg_dark: "Topic card background for dark mode.",
  topics_card_bg_light: "Topic card background for light mode.",
  topics_bg_dark: "Section background for dark mode. Leave blank for default.",
  topics_bg_light: "Section background for light mode.",
  topics_min_height: "Minimum section height in pixels. 0 = auto.",
  topics_border_style: "Border style at the bottom of the trending section.",

  // ── Spaces ──
  groups_enabled: "Show Community Spaces: grid of group cards with icon, name, and member count.",
  groups_title_enabled: "Show heading above group cards.",
  groups_title: "Heading text above group cards.",
  groups_title_size: "Spaces title font size in pixels. 0 = use default.",
  groups_count: "Number of group cards to display.",
  groups_selected: "Show only specific groups. Enter names separated by pipes (e.g. designers|developers). Blank = auto-select.",
  groups_show_description: "Show group description text below the group name on each card.",
  groups_description_max_length: "Max characters for group descriptions (30–500). Longer text is truncated.",
  groups_card_bg_dark: "Space card background for dark mode.",
  groups_card_bg_light: "Space card background for light mode.",
  groups_bg_dark: "Section background for dark mode. Leave blank for default.",
  groups_bg_light: "Section background for light mode.",
  groups_min_height: "Minimum section height in pixels. 0 = auto.",
  groups_border_style: "Border style at the bottom of the spaces section.",

  // ── FAQ ──
  faq_enabled: "Show FAQ accordion alongside the Spaces section. One item opens at a time.",
  faq_title_enabled: "Show heading above the FAQ accordion.",
  faq_title: "Heading text above the FAQ.",
  faq_title_size: "FAQ title font size in pixels. 0 = use default.",
  faq_items: 'FAQ items as JSON array: [{\"q\":\"Question\",\"a\":\"Answer\"}]. HTML supported in answers.',
  faq_card_bg_dark: "FAQ card background for dark mode.",
  faq_card_bg_light: "FAQ card background for light mode.",

  // ── App CTA ──
  show_app_ctas: "Show App Download CTA: gradient banner with headline, badges, and promo image.",
  ios_app_url: "Apple App Store URL. Leave blank to hide iOS badge.",
  android_app_url: "Google Play Store URL. Leave blank to hide Android badge.",
  ios_app_badge_image_url: "Custom iOS badge image. Leave blank for default.",
  android_app_badge_image_url: "Custom Android badge image. Leave blank for default.",
  app_badge_height: "Badge height in pixels (30–80).",
  app_badge_style: "Badge border-radius: rounded, pill, or square.",
  app_cta_headline: "Bold headline in the app download banner.",
  app_cta_title_size: "App CTA headline font size in pixels. 0 = use default.",
  app_cta_subtext: "Supporting text below the headline.",
  app_cta_gradient_start_dark: "Gradient start color for dark mode. Leave blank for accent.",
  app_cta_gradient_start_light: "Gradient start color for light mode.",
  app_cta_gradient_mid_dark: "Gradient middle color for dark mode.",
  app_cta_gradient_mid_light: "Gradient middle color for light mode.",
  app_cta_gradient_end_dark: "Gradient end color for dark mode.",
  app_cta_gradient_end_light: "Gradient end color for light mode.",
  app_cta_image_url: "Promo image on the right (e.g. phone mockup). PNG for transparent bg.",
  app_cta_bg_dark: "Section background for dark mode. Leave blank for default.",
  app_cta_bg_light: "Section background for light mode.",
  app_cta_min_height: "Minimum section height in pixels. 0 = auto.",
  app_cta_border_style: "Border style at the bottom of the app CTA section.",

  // ── Footer ──
  footer_description: "Description paragraph above the footer bar.",
  footer_text: "Optional HTML text inside the footer bar. Supports: p, a, strong, em, ul, li, br.",
  footer_links: 'Footer links as JSON array: [{\"label\":\"Terms\",\"url\":\"/tos\"}].',
  footer_bg_dark: "Footer background for dark mode. Leave blank for default.",
  footer_bg_light: "Footer background for light mode.",
  footer_border_style: "Border style at the top of the footer bar.",
};

const TABS = [
  {
    id: "settings",
    label: "Settings",
    settings: new Set([
      "community_landing_enabled",
      "section_order", "custom_css",
      "meta_description", "og_image_url", "favicon_url", "json_ld_enabled",
      "logo_dark_url", "logo_light_url", "logo_height", "footer_logo_url",
      "accent_color", "accent_hover_color", "dark_bg_color", "light_bg_color",
      "orb_color", "orb_opacity",
      "scroll_animation", "staggered_reveal_enabled", "dynamic_background_enabled",
      "mouse_parallax_enabled", "scroll_progress_enabled",
      "google_font_name", "title_font_name", "fontawesome_enabled"
    ])
  },
  {
    id: "navbar",
    label: "Navbar",
    settings: new Set([
      "navbar_signin_label", "navbar_signin_enabled",
      "navbar_signin_color_dark", "navbar_signin_color_light",
      "navbar_join_label", "navbar_join_enabled",
      "navbar_join_color_dark", "navbar_join_color_light",
      "navbar_signin_icon", "navbar_signin_icon_position",
      "navbar_join_icon", "navbar_join_icon_position",
      "navbar_bg_color", "navbar_border_style",
      "social_twitter_url", "social_facebook_url", "social_instagram_url",
      "social_youtube_url", "social_tiktok_url", "social_github_url"
    ])
  },
  {
    id: "hero",
    label: "Hero",
    settings: new Set([
      "hero_title", "hero_accent_word", "hero_subtitle", "hero_title_size",
      "hero_card_enabled", "hero_image_first",
      "hero_background_image_url", "hero_image_urls", "hero_image_max_height",
      "hero_primary_button_enabled", "hero_primary_button_label", "hero_primary_button_url",
      "hero_primary_button_icon", "hero_primary_button_icon_position",
      "hero_secondary_button_enabled", "hero_secondary_button_label", "hero_secondary_button_url",
      "hero_secondary_button_icon", "hero_secondary_button_icon_position",
      "hero_primary_btn_color_dark", "hero_primary_btn_color_light",
      "hero_secondary_btn_color_dark", "hero_secondary_btn_color_light",
      "hero_video_url", "hero_video_button_color", "hero_video_blur_on_hover",
      "hero_bg_dark", "hero_bg_light", "hero_min_height", "hero_border_style",
      "hero_card_bg_dark", "hero_card_bg_light", "hero_card_opacity",
      "contributors_enabled", "contributors_title", "contributors_title_enabled",
      "contributors_count_label", "contributors_count_label_enabled",
      "contributors_alignment", "contributors_pill_max_width",
      "contributors_pill_bg_dark", "contributors_pill_bg_light",
      "contributors_days", "contributors_count"
    ])
  },
  {
    id: "participation",
    label: "Participation",
    settings: new Set([
      "participation_enabled", "participation_title_enabled",
      "participation_title", "participation_title_size",
      "participation_bio_max_length",
      "participation_icon_color",
      "participation_card_bg_dark", "participation_card_bg_light",
      "participation_bg_dark", "participation_bg_light",
      "participation_min_height", "participation_border_style",
      "participation_stat_color", "participation_stat_label_color",
      "participation_bio_color", "participation_name_color",
      "participation_meta_color"
    ])
  },
  {
    id: "stats",
    label: "Stats",
    settings: new Set([
      "stats_enabled", "stat_labels_enabled", "stats_title_enabled",
      "stats_title", "stats_title_size", "stat_card_style",
      "stat_icon_color", "stat_icon_bg_color", "stat_icon_shape", "stat_counter_color",
      "stat_members_label", "stat_topics_label", "stat_posts_label",
      "stat_likes_label", "stat_chats_label", "stat_round_numbers",
      "stat_card_bg_dark", "stat_card_bg_light",
      "stats_bg_dark", "stats_bg_light", "stats_min_height", "stats_border_style"
    ])
  },
  {
    id: "about",
    label: "About",
    settings: new Set([
      "about_enabled", "about_heading_enabled", "about_heading",
      "about_title", "about_title_size", "about_role", "about_body", "about_image_url",
      "about_card_color_dark", "about_card_color_light",
      "about_background_image_url",
      "about_bg_dark", "about_bg_light", "about_min_height", "about_border_style"
    ])
  },
  {
    id: "topics",
    label: "Topics",
    settings: new Set([
      "topics_enabled", "topics_title_enabled", "topics_title", "topics_title_size",
      "topics_count",
      "topics_card_bg_dark", "topics_card_bg_light",
      "topics_bg_dark", "topics_bg_light", "topics_min_height", "topics_border_style"
    ])
  },
  {
    id: "groups",
    label: "Groups",
    settings: new Set([
      "groups_enabled", "groups_title_enabled", "groups_title", "groups_title_size",
      "groups_count", "groups_selected",
      "groups_show_description", "groups_description_max_length",
      "groups_card_bg_dark", "groups_card_bg_light",
      "groups_bg_dark", "groups_bg_light", "groups_min_height", "groups_border_style"
    ])
  },
  {
    id: "faq",
    label: "FAQ",
    settings: new Set([
      "faq_enabled", "faq_title_enabled", "faq_title", "faq_title_size",
      "faq_items",
      "faq_card_bg_dark", "faq_card_bg_light"
    ])
  },
  {
    id: "appcta",
    label: "App CTA",
    settings: new Set([
      "show_app_ctas", "ios_app_url", "android_app_url",
      "ios_app_badge_image_url", "android_app_badge_image_url",
      "app_badge_height", "app_badge_style",
      "app_cta_headline", "app_cta_title_size", "app_cta_subtext",
      "app_cta_gradient_start_dark", "app_cta_gradient_start_light",
      "app_cta_gradient_mid_dark", "app_cta_gradient_mid_light",
      "app_cta_gradient_end_dark", "app_cta_gradient_end_light",
      "app_cta_image_url",
      "app_cta_bg_dark", "app_cta_bg_light", "app_cta_min_height", "app_cta_border_style"
    ])
  },
  {
    id: "footer",
    label: "Footer",
    settings: new Set([
      "footer_description", "footer_text", "footer_links",
      "footer_bg_dark", "footer_bg_light", "footer_border_style"
    ])
  }
];

// Tabs that depend on a section-enable toggle.
// When the toggle is OFF the tab shows a notice instead of the full settings list.
const TAB_ENABLE_SETTINGS = {
  hero:          { setting: "contributors_enabled", label: "Contributors", onlySettings: [
                     "contributors_enabled", "contributors_title", "contributors_title_enabled",
                     "contributors_count_label", "contributors_count_label_enabled",
                     "contributors_alignment", "contributors_pill_max_width",
                     "contributors_pill_bg_dark", "contributors_pill_bg_light",
                     "contributors_days", "contributors_count"
                   ]},
  participation: { setting: "participation_enabled", label: "Participation" },
  stats:         { setting: "stats_enabled",         label: "Stats" },
  about:         { setting: "about_enabled",         label: "About" },
  topics:        { setting: "topics_enabled",        label: "Topics" },
  groups:        { setting: "groups_enabled",        label: "Groups" },
  faq:           { setting: "faq_enabled",           label: "FAQ" },
  appcta:        { setting: "show_app_ctas",         label: "App CTA" },
};

// Image URL settings that get upload buttons injected in the admin panel.
// "multi: true" means pipe-separated list (appends rather than replaces).
const IMAGE_UPLOAD_SETTINGS = {
  og_image_url:                { label: "Upload Image", multi: false },
  favicon_url:                 { label: "Upload Favicon", multi: false },
  logo_dark_url:               { label: "Upload Logo", multi: false },
  logo_light_url:              { label: "Upload Logo", multi: false },
  footer_logo_url:             { label: "Upload Logo", multi: false },
  hero_background_image_url:   { label: "Upload Image", multi: false },
  hero_image_urls:             { label: "Add Image", multi: true },
  about_image_url:             { label: "Upload Image", multi: false },
  about_background_image_url:  { label: "Upload Image", multi: false },
  ios_app_badge_image_url:     { label: "Upload Badge", multi: false },
  android_app_badge_image_url: { label: "Upload Badge", multi: false },
  app_cta_image_url:           { label: "Upload Image", multi: false },
};

let currentTab = "settings";
let filterActive = false;
let isActive = false;
let recheckTimer = null;

function getContainer() {
  return (
    document.querySelector(".admin-plugin-config-area") ||
    document.querySelector(".admin-detail")
  );
}

function applyTabFilter() {
  const container = getContainer();
  if (!container) return;

  const tab = TABS.find((t) => t.id === currentTab);
  if (!tab) return;

  container.querySelectorAll(".row.setting[data-setting]").forEach((row) => {
    const name = row.getAttribute("data-setting");
    row.classList.toggle(
      "cl-tab-hidden",
      !filterActive && !tab.settings.has(name)
    );
  });

  // Update filter-active dimming on native nav or standalone tab bar
  const nativeNav = document.querySelector(".d-nav-submenu__tabs");
  if (nativeNav) {
    nativeNav.classList.toggle("cl-filter-active", filterActive);
  }
  const standaloneBar = document.querySelector(".cl-admin-tabs");
  if (standaloneBar) {
    standaloneBar.classList.toggle("filter-active", filterActive);
  }
}

function updateActiveStates(activeId) {
  // Native nav: our injected <li> tabs
  document.querySelectorAll("li.cl-admin-tab").forEach((li) => {
    li.classList.toggle("active", li.dataset.tab === activeId);
  });

  // Native nav: the original Settings <li>
  // Discourse's router keeps aria-current="true" on the native <a>, so we
  // must also add a class to suppress its active styling when another tab
  // is selected.
  const nativeItem = document.querySelector(".cl-native-settings-item");
  if (nativeItem) {
    const isSettings = activeId === "settings";
    nativeItem.classList.toggle("active", isSettings);
    nativeItem.classList.toggle("cl-tab-inactive", !isSettings);
  }

  // Standalone fallback: <button> tabs
  document.querySelectorAll("button.cl-admin-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeId);
  });
}

function findFilterInput(container) {
  for (const input of container.querySelectorAll("input")) {
    if (input.closest(".row.setting") || input.closest(".cl-admin-tabs")) {
      continue;
    }
    const t = (input.type || "text").toLowerCase();
    if (t === "text" || t === "search") return input;
  }
  return null;
}

function handleTabClick(container, tabId) {
  currentTab = tabId;
  filterActive = false;

  // Clear Discourse filter input so it doesn't conflict
  const fi = findFilterInput(container);
  if (fi && fi.value) {
    fi.value = "";
    fi.dispatchEvent(new Event("input", { bubbles: true }));
  }

  clearDisabledNotice(container);
  updateActiveStates(tabId);
  applyTabFilter();
  injectUploadButtons();
  updateDisabledNotice(container);
}

/**
 * Remove all injected tabs and restore clean state.
 * Called when navigating away from the community-landing settings page.
 */
function cleanupTabs() {
  // Remove injected <li> tabs from native nav
  document.querySelectorAll("li.cl-admin-tab").forEach((li) => li.remove());

  // Restore native Settings <li> — remove our hook class
  const nativeItem = document.querySelector(".cl-native-settings-item");
  if (nativeItem) {
    nativeItem.classList.remove("cl-native-settings-item", "active", "cl-tab-inactive");
  }

  // Remove filter-active class from native nav
  const nativeNav = document.querySelector(".d-nav-submenu__tabs");
  if (nativeNav) {
    nativeNav.classList.remove("cl-filter-active");
  }

  // Remove standalone tab bar if present
  const standaloneBar = document.querySelector(".cl-admin-tabs");
  if (standaloneBar) {
    standaloneBar.remove();
  }

  // Remove cl-tabs-active from container and un-hide all settings
  const container = getContainer();
  if (container) {
    container.classList.remove("cl-tabs-active");
    container.querySelectorAll(".cl-tab-hidden").forEach((el) => {
      el.classList.remove("cl-tab-hidden");
    });

    // Remove disabled notices
    clearDisabledNotice(container);
  }

  // Reset state
  currentTab = "settings";
  filterActive = false;
}

/**
 * Inject description text into each setting row.
 * The newer Discourse plugin admin page doesn't render .desc elements,
 * so we add them from the DESCRIPTIONS map.
 */
function injectDescriptions() {
  const container = getContainer();
  if (!container) return;

  container.querySelectorAll(".row.setting[data-setting]").forEach((row) => {
    const name = row.getAttribute("data-setting");
    const text = DESCRIPTIONS[name];
    if (!text) return;

    const valueDiv = row.querySelector(".setting-value");
    if (!valueDiv) return;

    // Already injected
    if (valueDiv.querySelector(".cl-desc")) return;

    const desc = document.createElement("div");
    desc.className = "cl-desc";
    desc.textContent = text;
    valueDiv.appendChild(desc);
  });
}

/**
 * For boolean (checkbox) settings:
 *  1. Strip "enable" / "enabled" from the setting-label heading.
 *  2. Add an "Enable" text label next to the checkbox in setting-value.
 */
function cleanBooleanLabels() {
  const container = getContainer();
  if (!container) return;

  container.querySelectorAll(".row.setting[data-setting]").forEach((row) => {
    const cb = row.querySelector('.setting-value input[type="checkbox"]');
    if (!cb) return; // not a boolean setting

    // Already processed
    if (cb.dataset.clLabelCleaned) return;
    cb.dataset.clLabelCleaned = "1";

    // 1. Clean the heading: remove "enable" / "enabled" (case-insensitive)
    const h3 = row.querySelector(".setting-label h3");
    if (h3) {
      h3.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = node.textContent
            .replace(/\benabled?\b/gi, "")
            .replace(/\s{2,}/g, " ")
            .trim();
        }
      });
    }

    // 2. Add "Enable" label next to the checkbox
    const valueDiv = row.querySelector(".setting-value");
    if (valueDiv && !valueDiv.querySelector(".cl-enable-label")) {
      const lbl = document.createElement("span");
      lbl.className = "cl-enable-label";
      lbl.textContent = "Enable";
      cb.insertAdjacentElement("afterend", lbl);
    }
  });
}

/**
 * Read a boolean setting's current value from its DOM checkbox.
 */
function isSettingEnabled(container, settingName) {
  const row = container.querySelector(`.row.setting[data-setting="${settingName}"]`);
  if (!row) return true; // if row not found, assume enabled (safe default)
  const cb = row.querySelector('input[type="checkbox"]');
  if (!cb) return true;
  return cb.checked;
}

/**
 * Show or remove the "section disabled" notice for the current tab.
 * When a section's master toggle is OFF, we hide all sub-settings (except
 * the enable toggle itself) and show a notice prompting the user to enable it.
 */
function updateDisabledNotice(container) {
  // Remove any existing notice
  const existing = container.querySelector(".cl-disabled-notice");
  if (existing) existing.remove();

  const dep = TAB_ENABLE_SETTINGS[currentTab];
  if (!dep) return; // tab has no dependency

  const enabled = isSettingEnabled(container, dep.setting);
  if (enabled) return; // section is on — nothing to do

  // Determine which settings to hide (all tab settings except the enable toggle)
  const tab = TABS.find((t) => t.id === currentTab);
  if (!tab) return;

  // For "hero" tab, only hide/dim the contributor sub-settings, not all hero settings
  const affectedSettings = dep.onlySettings
    ? new Set(dep.onlySettings)
    : tab.settings;

  container.querySelectorAll(".row.setting[data-setting]").forEach((row) => {
    const name = row.getAttribute("data-setting");
    if (name === dep.setting) return; // keep the enable toggle visible
    if (affectedSettings.has(name)) {
      row.classList.add("cl-disabled-dim");
    }
  });

  // Insert notice after the enable toggle row
  const toggleRow = container.querySelector(`.row.setting[data-setting="${dep.setting}"]`);
  if (!toggleRow) return;

  const notice = document.createElement("div");
  notice.className = "cl-disabled-notice";
  notice.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink:0">' +
    '<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a.75.75 0 110-1.5.75.75 0 010 1.5z"/>' +
    "</svg>" +
    "<span><strong>" + dep.label + "</strong> is currently disabled. " +
    "Enable it above to configure these settings.</span>";

  toggleRow.insertAdjacentElement("afterend", notice);
}

/**
 * Remove disabled-notice and dim classes.
 */
function clearDisabledNotice(container) {
  const notice = container.querySelector(".cl-disabled-notice");
  if (notice) notice.remove();
  container.querySelectorAll(".cl-disabled-dim").forEach((el) => {
    el.classList.remove("cl-disabled-dim");
  });
}

function buildTabsUI() {
  const container = getContainer();
  if (!container) return false;

  // Already injected — just re-apply filter
  if (document.querySelector(".cl-admin-tab")) {
    applyTabFilter();
    return true;
  }

  const allRows = container.querySelectorAll(".row.setting[data-setting]");
  if (allRows.length < 5) return false;

  // Verify our plugin settings are present
  const hasOurs = Array.from(allRows).some((row) =>
    TABS[0].settings.has(row.getAttribute("data-setting"))
  );
  if (!hasOurs) return false;

  // ── Strategy 1: Inject into native Discourse nav tab bar ──
  // Native structure: <ul class="nav-pills action-list d-nav-submenu__tabs">
  //   <li class="admin-plugin-config-page__top-nav-item"><a>Settings</a></li>
  const nativeTabsList = document.querySelector(".d-nav-submenu__tabs");
  if (nativeTabsList) {
    // Hook the native "Settings" <li> so clicking it activates our Settings tab
    const nativeSettingsItem = nativeTabsList.querySelector(
      ".admin-plugin-config-page__top-nav-item"
    );
    if (nativeSettingsItem) {
      nativeSettingsItem.classList.add("cl-native-settings-item");
      const nativeLink = nativeSettingsItem.querySelector("a");
      if (nativeLink) {
        nativeLink.addEventListener("click", (e) => {
          e.preventDefault();
          handleTabClick(container, "settings");
        });
      }
    }

    // Inject our section tabs as <li> items (skip "settings" — native handles it)
    TABS.forEach((tab) => {
      if (tab.id === "settings") return;

      const li = document.createElement("li");
      li.className = "admin-plugin-config-page__top-nav-item cl-admin-tab";
      li.dataset.tab = tab.id;
      li.title = tab.label;

      const a = document.createElement("a");
      a.textContent = tab.label;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        handleTabClick(container, tab.id);
      });

      li.appendChild(a);
      nativeTabsList.appendChild(li);
    });

    container.classList.add("cl-tabs-active");
    injectDescriptions();
    cleanBooleanLabels();
    injectUploadButtons();
    applyTabFilter();
    updateDisabledNotice(container);
    listenForEnableToggles(container);
    return true;
  }

  // ── Strategy 2 (fallback): Standalone tab bar for older Discourse ──
  const tabBar = document.createElement("div");
  tabBar.className = "cl-admin-tabs";

  TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = "cl-admin-tab" + (tab.id === currentTab ? " active" : "");
    btn.textContent = tab.label;
    btn.dataset.tab = tab.id;
    btn.addEventListener("click", () => handleTabClick(container, tab.id));
    tabBar.appendChild(btn);
  });

  let inserted = false;

  const contentArea = container.querySelector(
    ".admin-plugin-config-area__content"
  );
  if (contentArea) {
    const form = contentArea.querySelector("form");
    const target = form || contentArea;
    target.insertBefore(tabBar, target.firstChild);
    inserted = true;
  }

  if (!inserted) {
    const filterArea = container.querySelector(
      ".admin-site-settings-filter-controls, .setting-filter"
    );
    if (filterArea) {
      filterArea.parentNode.insertBefore(tabBar, filterArea);
      inserted = true;
    }
  }

  if (!inserted) {
    allRows[0].parentNode.insertBefore(tabBar, allRows[0]);
  }

  container.classList.add("cl-tabs-active");
  injectDescriptions();
  cleanBooleanLabels();
  injectUploadButtons();
  applyTabFilter();
  updateDisabledNotice(container);
  listenForEnableToggles(container);
  return true;
}

/**
 * Listen for changes on section-enable checkboxes so the notice
 * updates live when the user toggles a section on or off.
 */
function listenForEnableToggles(container) {
  Object.values(TAB_ENABLE_SETTINGS).forEach(({ setting }) => {
    const row = container.querySelector(`.row.setting[data-setting="${setting}"]`);
    if (!row) return;
    const cb = row.querySelector('input[type="checkbox"]');
    if (!cb || cb.dataset.clToggleListening) return;
    cb.dataset.clToggleListening = "1";
    cb.addEventListener("change", () => {
      clearDisabledNotice(container);
      updateDisabledNotice(container);
    });
  });
}

// ── Image Upload Helpers ──

function getCsrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "composer");
  formData.append("synchronous_uploads", "true");

  const response = await fetch("/uploads.json", {
    method: "POST",
    headers: { "X-CSRF-Token": getCsrfToken() },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function pinUpload(uploadId, settingName) {
  const response = await fetch("/community-landing/admin/pin-upload", {
    method: "POST",
    headers: {
      "X-CSRF-Token": getCsrfToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ upload_id: uploadId, setting_name: settingName }),
  });

  if (!response.ok) {
    console.warn("[CL] Pin upload failed:", response.status);
  }
}

function setSettingValue(row, newValue, multi) {
  // For list-type settings (hero_image_urls), Discourse renders a .values .value-list
  // or a plain text input. Try the text input first.
  const input =
    row.querySelector('.setting-value input[type="text"]') ||
    row.querySelector(".setting-value textarea");
  if (!input) return;

  if (multi) {
    const current = input.value.trim();
    input.value = current ? current + "|" + newValue : newValue;
  } else {
    input.value = newValue;
  }

  // Dispatch events so Discourse's admin UI picks up the change
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));

  // Some Discourse admin UIs require a keydown Enter to register
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true })
  );
}

function updatePreviewThumbnail(wrapper, settingName) {
  const row = wrapper.closest(".row.setting");
  if (!row) return;

  const input =
    row.querySelector('.setting-value input[type="text"]') ||
    row.querySelector(".setting-value textarea");
  const url = input ? input.value.trim() : "";

  const preview = wrapper.querySelector(".cl-upload-preview");
  if (!preview) return;

  const cfg = IMAGE_UPLOAD_SETTINGS[settingName];
  if (cfg && cfg.multi) {
    // For multi-image, show the last image in the list
    const urls = url.split("|").filter(Boolean);
    const lastUrl = urls.length > 0 ? urls[urls.length - 1] : "";
    preview.src = lastUrl;
    preview.style.display = lastUrl ? "" : "none";
  } else {
    preview.src = url;
    preview.style.display = url ? "" : "none";
  }
}

function injectUploadButtons() {
  const container = getContainer();
  if (!container) return;

  Object.entries(IMAGE_UPLOAD_SETTINGS).forEach(([settingName, cfg]) => {
    const row = container.querySelector(
      `.row.setting[data-setting="${settingName}"]`
    );
    if (!row) return;
    if (row.dataset.clUploadInjected) return;
    row.dataset.clUploadInjected = "1";

    const valueDiv = row.querySelector(".setting-value");
    if (!valueDiv) return;

    // Build wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "cl-upload-wrapper";

    // Upload button
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cl-upload-btn";
    btn.textContent = cfg.label;
    btn.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);

      fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;
        fileInput.remove();

        // Show uploading status
        let status = wrapper.querySelector(".cl-upload-status");
        if (!status) {
          status = document.createElement("span");
          status.className = "cl-upload-status";
          wrapper.appendChild(status);
        }
        status.textContent = "Uploading…";
        btn.disabled = true;

        try {
          const data = await uploadFile(file);
          await pinUpload(data.id, settingName);
          setSettingValue(row, data.url, cfg.multi);
          updatePreviewThumbnail(wrapper, settingName);
          status.textContent = "";
        } catch (err) {
          status.textContent = "Upload failed";
          console.error("[CL] Upload error:", err);
        } finally {
          btn.disabled = false;
        }
      });

      fileInput.click();
    });
    wrapper.appendChild(btn);

    // Preview thumbnail
    const preview = document.createElement("img");
    preview.className = "cl-upload-preview";
    preview.alt = "Preview";
    wrapper.appendChild(preview);

    // Remove button (single-image only)
    if (!cfg.multi) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "cl-upload-remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        setSettingValue(row, "", false);
        updatePreviewThumbnail(wrapper, settingName);
      });
      wrapper.appendChild(removeBtn);
    }

    valueDiv.appendChild(wrapper);

    // Initialize preview from current value
    updatePreviewThumbnail(wrapper, settingName);

    // Listen for manual URL changes to update preview
    const input =
      row.querySelector('.setting-value input[type="text"]') ||
      row.querySelector(".setting-value textarea");
    if (input) {
      input.addEventListener("input", () => {
        updatePreviewThumbnail(wrapper, settingName);
      });
    }
  });
}

// ── Global filter detection via event delegation ──
// This survives DOM re-renders because it's on document, not on a specific input
document.addEventListener(
  "input",
  (e) => {
    if (!isActive) return;
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(".row.setting") || t.closest(".cl-admin-tabs")) return;

    const container = getContainer();
    if (!container || !container.contains(t)) return;

    const hasText = t.value.trim().length > 0;
    if (hasText !== filterActive) {
      filterActive = hasText;
      applyTabFilter();
    }
  },
  true
);

export default {
  name: "community-landing-admin-tabs",

  initialize() {
    withPluginApi("1.0", (api) => {
      api.onPageChange((url) => {
        if (
          url.includes("community-landing") ||
          url.includes("community_landing")
        ) {
          isActive = true;
          filterActive = false;

          // Initial injection with retries
          let attempts = 0;
          const tryInject = () => {
            if (!isActive) return; // Guard: user navigated away during retries
            if (buildTabsUI() || attempts > 15) return;
            attempts++;
            setTimeout(tryInject, 200);
          };
          tryInject();

          // Periodic re-check: re-injects tabs if Discourse re-renders the DOM
          if (!recheckTimer) {
            recheckTimer = setInterval(() => {
              if (!isActive) {
                clearInterval(recheckTimer);
                recheckTimer = null;
                return;
              }
              const c = getContainer();
              if (c && !document.querySelector(".cl-admin-tab")) {
                buildTabsUI();
              }
            }, 500);
          }
        } else {
          // Left plugin settings page — clean up injected tabs
          if (isActive) {
            cleanupTabs();
          }
          isActive = false;
          if (recheckTimer) {
            clearInterval(recheckTimer);
            recheckTimer = null;
          }
        }
      });
    });
  },
};
