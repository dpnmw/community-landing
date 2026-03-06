import { withPluginApi } from "discourse/lib/plugin-api";

const TABS = [
  {
    id: "general",
    label: "General",
    settings: new Set([
      "community_landing_enabled",
      "logo_dark_url", "logo_light_url", "logo_height", "footer_logo_url",
      "accent_color", "accent_hover_color", "dark_bg_color", "light_bg_color",
      "scroll_animation"
    ])
  },
  {
    id: "navbar",
    label: "Navbar",
    settings: new Set([
      "navbar_signin_label", "navbar_join_label", "navbar_bg_color", "navbar_border_style"
    ])
  },
  {
    id: "hero",
    label: "Hero",
    settings: new Set([
      "hero_title", "hero_subtitle", "hero_card_enabled", "hero_background_image_url",
      "hero_image_urls", "hero_image_max_height",
      "hero_primary_button_label", "hero_primary_button_url",
      "hero_secondary_button_label", "hero_secondary_button_url",
      "hero_bg_dark", "hero_bg_light", "hero_min_height", "hero_border_style"
    ])
  },
  {
    id: "stats",
    label: "Stats",
    settings: new Set([
      "stats_title", "stat_icon_color",
      "stat_members_label", "stat_topics_label", "stat_posts_label",
      "stat_likes_label", "stat_chats_label",
      "stats_bg_dark", "stats_bg_light", "stats_min_height", "stats_border_style"
    ])
  },
  {
    id: "about",
    label: "About",
    settings: new Set([
      "about_enabled", "about_heading_enabled", "about_heading",
      "about_title", "about_role", "about_body", "about_image_url",
      "about_gradient_start", "about_gradient_mid", "about_gradient_end",
      "about_background_image_url",
      "about_bg_dark", "about_bg_light", "about_min_height", "about_border_style"
    ])
  },
  {
    id: "topics",
    label: "Trending",
    settings: new Set([
      "topics_enabled", "topics_title", "topics_count",
      "topics_bg_dark", "topics_bg_light", "topics_min_height", "topics_border_style"
    ])
  },
  {
    id: "contributors",
    label: "Creators",
    settings: new Set([
      "contributors_enabled", "contributors_title", "contributors_days", "contributors_count",
      "contributors_bg_dark", "contributors_bg_light", "contributors_min_height", "contributors_border_style"
    ])
  },
  {
    id: "groups",
    label: "Spaces",
    settings: new Set([
      "groups_enabled", "groups_title", "groups_count",
      "groups_bg_dark", "groups_bg_light", "groups_min_height", "groups_border_style"
    ])
  },
  {
    id: "appcta",
    label: "App CTA",
    settings: new Set([
      "show_app_ctas", "ios_app_url", "android_app_url",
      "ios_app_badge_image_url", "android_app_badge_image_url",
      "app_badge_height", "app_badge_style",
      "app_cta_headline", "app_cta_subtext",
      "app_cta_gradient_start", "app_cta_gradient_mid", "app_cta_gradient_end",
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
  },
  {
    id: "css",
    label: "Custom CSS",
    settings: new Set(["custom_css"])
  }
];

let currentTab = "general";

function applyTabFilter(container) {
  const tab = TABS.find((t) => t.id === currentTab);
  if (!tab) return;

  container.querySelectorAll(".row.setting[data-setting]").forEach((row) => {
    const name = row.getAttribute("data-setting");
    row.style.display = tab.settings.has(name) ? "" : "none";
  });
}

function buildTabsUI() {
  const container =
    document.querySelector(".admin-plugin-config-area") ||
    document.querySelector(".admin-detail");
  if (!container) return false;

  // Already injected?
  if (container.querySelector(".cl-admin-tabs")) return true;

  const allRows = container.querySelectorAll(".row.setting[data-setting]");
  if (allRows.length < 5) return false;

  // Verify our settings are present
  const firstTab = TABS[0];
  const hasOurs = Array.from(allRows).some((row) =>
    firstTab.settings.has(row.getAttribute("data-setting"))
  );
  if (!hasOurs) return false;

  // Create tab bar
  const tabBar = document.createElement("div");
  tabBar.className = "cl-admin-tabs";

  TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = "cl-admin-tab" + (tab.id === currentTab ? " active" : "");
    btn.textContent = tab.label;
    btn.setAttribute("data-tab", tab.id);
    btn.addEventListener("click", () => {
      currentTab = tab.id;
      tabBar
        .querySelectorAll(".cl-admin-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyTabFilter(container);
    });
    tabBar.appendChild(btn);
  });

  // Insert tab bar before the first setting row
  const settingsParent = allRows[0].parentNode;
  settingsParent.insertBefore(tabBar, allRows[0]);

  // Add class to disable separator borders
  container.classList.add("cl-tabs-active");

  // Apply initial filter
  applyTabFilter(container);
  return true;
}

export default {
  name: "community-landing-admin-tabs",

  initialize() {
    withPluginApi("1.0", (api) => {
      api.onPageChange((url) => {
        if (
          url.includes("community-landing") ||
          url.includes("community_landing")
        ) {
          let attempts = 0;
          const tryInject = () => {
            if (buildTabsUI() || attempts > 15) return;
            attempts++;
            setTimeout(tryInject, 200);
          };
          tryInject();
        }
      });
    });
  },
};
