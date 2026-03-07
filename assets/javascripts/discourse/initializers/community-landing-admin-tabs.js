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
      "stats_title", "stat_icon_color", "stat_icon_bg_color", "stat_icon_shape", "stat_counter_color",
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
      "groups_enabled", "groups_title", "groups_count", "groups_selected", "groups_card_bg_color",
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
  }
];

let currentTab = "general";
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

  const tabBar = container.querySelector(".cl-admin-tabs");
  if (tabBar) {
    tabBar.classList.toggle("filter-active", filterActive);
  }
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

function buildTabsUI() {
  const container = getContainer();
  if (!container) return false;

  // Already injected — just re-apply filter
  if (container.querySelector(".cl-admin-tabs")) {
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

  // Build tab bar
  const tabBar = document.createElement("div");
  tabBar.className = "cl-admin-tabs";

  TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = "cl-admin-tab" + (tab.id === currentTab ? " active" : "");
    btn.textContent = tab.label;
    btn.dataset.tab = tab.id;
    btn.addEventListener("click", () => {
      currentTab = tab.id;
      filterActive = false;

      // Clear Discourse filter input so it doesn't conflict
      const fi = findFilterInput(container);
      if (fi && fi.value) {
        fi.value = "";
        fi.dispatchEvent(new Event("input", { bubbles: true }));
      }

      tabBar
        .querySelectorAll(".cl-admin-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyTabFilter();
    });
    tabBar.appendChild(btn);
  });

  // ── Insertion strategy: place tabs as high as possible ──

  let inserted = false;

  // Strategy 1: Top of .admin-plugin-config-area__content (above filter bar)
  const contentArea = container.querySelector(
    ".admin-plugin-config-area__content"
  );
  if (contentArea) {
    const form = contentArea.querySelector("form");
    const target = form || contentArea;
    target.insertBefore(tabBar, target.firstChild);
    inserted = true;
  }

  // Strategy 2: Before the filter controls
  if (!inserted) {
    const filterArea = container.querySelector(
      ".admin-site-settings-filter-controls, .setting-filter"
    );
    if (filterArea) {
      filterArea.parentNode.insertBefore(tabBar, filterArea);
      inserted = true;
    }
  }

  // Strategy 3: Before the first setting row (fallback)
  if (!inserted) {
    allRows[0].parentNode.insertBefore(tabBar, allRows[0]);
  }

  container.classList.add("cl-tabs-active");
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
            if (buildTabsUI() || attempts > 15) return;
            attempts++;
            setTimeout(tryInject, 200);
          };
          tryInject();

          // Periodic re-check: re-injects tab bar if Discourse re-renders the DOM
          if (!recheckTimer) {
            recheckTimer = setInterval(() => {
              if (!isActive) {
                clearInterval(recheckTimer);
                recheckTimer = null;
                return;
              }
              const c = getContainer();
              if (c && !c.querySelector(".cl-admin-tabs")) {
                buildTabsUI();
              }
            }, 500);
          }
        } else {
          // Left plugin settings page — clean up
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
