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
  participation_icon_color: "Color for the decorative quote icon on cards. Leave blank for accent color.",
  participation_card_bg_dark: "Participation card background for dark mode.",
  participation_card_bg_light: "Participation card background for light mode.",
  participation_bg_dark: "Section background for dark mode. Leave blank for default.",
  participation_bg_light: "Section background for light mode.",
  participation_min_height: "Minimum section height in pixels. 0 = auto.",
  participation_border_style: "Border style at the bottom of the section.",
  participation_title_size: "Section title font size in pixels. 0 = use default.",

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
      "participation_min_height", "participation_border_style"
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
    label: "Trending",
    settings: new Set([
      "topics_enabled", "topics_title_enabled", "topics_title", "topics_title_size",
      "topics_count",
      "topics_card_bg_dark", "topics_card_bg_light",
      "topics_bg_dark", "topics_bg_light", "topics_min_height", "topics_border_style"
    ])
  },
  {
    id: "groups",
    label: "Spaces",
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

// Dark/light color pairs — light row gets merged into dark row (same-row display)
const BG_PAIRS = [
  // Navbar
  ["navbar_signin_color_dark", "navbar_signin_color_light"],
  ["navbar_join_color_dark", "navbar_join_color_light"],
  // Hero
  ["hero_primary_btn_color_dark", "hero_primary_btn_color_light"],
  ["hero_secondary_btn_color_dark", "hero_secondary_btn_color_light"],
  ["hero_bg_dark", "hero_bg_light"],
  ["hero_card_bg_dark", "hero_card_bg_light"],
  ["contributors_pill_bg_dark", "contributors_pill_bg_light"],
  // Participation
  ["participation_card_bg_dark", "participation_card_bg_light"],
  ["participation_bg_dark", "participation_bg_light"],
  // Stats
  ["stat_card_bg_dark", "stat_card_bg_light"],
  ["stats_bg_dark", "stats_bg_light"],
  // About
  ["about_card_color_dark", "about_card_color_light"],
  ["about_bg_dark", "about_bg_light"],
  // Trending
  ["topics_card_bg_dark", "topics_card_bg_light"],
  ["topics_bg_dark", "topics_bg_light"],
  // Spaces
  ["groups_card_bg_dark", "groups_card_bg_light"],
  ["groups_bg_dark", "groups_bg_light"],
  // FAQ
  ["faq_card_bg_dark", "faq_card_bg_light"],
  // App CTA
  ["app_cta_gradient_start_dark", "app_cta_gradient_start_light"],
  ["app_cta_gradient_mid_dark", "app_cta_gradient_mid_light"],
  ["app_cta_gradient_end_dark", "app_cta_gradient_end_light"],
  ["app_cta_bg_dark", "app_cta_bg_light"],
  // Footer
  ["footer_bg_dark", "footer_bg_light"],
];

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
  const nativeItem = document.querySelector(".cl-native-settings-item");
  if (nativeItem) {
    nativeItem.classList.toggle("active", activeId === "settings");
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

  updateActiveStates(tabId);
  applyTabFilter();
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
    nativeItem.classList.remove("cl-native-settings-item", "active");
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

    // Remove merge classes
    container.querySelectorAll(".cl-merged-dark, .cl-merged-light").forEach((el) => {
      el.classList.remove("cl-merged-dark", "cl-merged-light");
    });
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
 * Merge dark/light bg color pairs into a single visual row.
 * CSS-only approach — elements stay in their original DOM positions
 * (preserving Ember bindings, undo/reset buttons, and re-renders).
 */
function mergeBgPairs() {
  const container = getContainer();
  if (!container) return;

  BG_PAIRS.forEach(([darkName, lightName]) => {
    const darkRow = container.querySelector(`.row.setting[data-setting="${darkName}"]`);
    const lightRow = container.querySelector(`.row.setting[data-setting="${lightName}"]`);
    if (!darkRow || !lightRow) return;
    // Already merged
    if (darkRow.classList.contains("cl-merged-dark")) return;

    // Rename the dark row label (remove " dark" suffix)
    const darkH3 = darkRow.querySelector(".setting-label h3");
    if (darkH3) {
      darkH3.textContent = darkH3.textContent.replace(/\s*dark$/i, "").trim();
    }

    // Add "Dark" / "Light" labels to each row's setting-value
    const darkValue = darkRow.querySelector(".setting-value");
    const lightValue = lightRow.querySelector(".setting-value");
    if (darkValue && !darkValue.querySelector(".cl-color-col__label")) {
      const lbl = document.createElement("span");
      lbl.className = "cl-color-col__label";
      lbl.textContent = "Dark";
      darkValue.insertBefore(lbl, darkValue.firstChild);
    }
    if (lightValue && !lightValue.querySelector(".cl-color-col__label")) {
      const lbl = document.createElement("span");
      lbl.className = "cl-color-col__label";
      lbl.textContent = "Light";
      lightValue.insertBefore(lbl, lightValue.firstChild);
    }

    // Just add classes — NO DOM moves, preserves all Ember bindings
    darkRow.classList.add("cl-merged-dark");
    lightRow.classList.add("cl-merged-light");
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
    mergeBgPairs();
    applyTabFilter();
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
  mergeBgPairs();
  applyTabFilter();
  return true;
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
