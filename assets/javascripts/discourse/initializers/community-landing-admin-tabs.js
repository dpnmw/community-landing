import { withPluginApi } from "discourse/lib/plugin-api";

const TABS = [
  {
    id: "settings",
    label: "Settings",
    settings: new Set([
      "community_landing_enabled",
      "logo_dark_url", "logo_light_url", "logo_height", "footer_logo_url",
      "accent_color", "accent_hover_color", "dark_bg_color", "light_bg_color",
      "scroll_animation", "staggered_reveal_enabled", "dynamic_background_enabled",
      "mouse_parallax_enabled", "scroll_progress_enabled"
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
      "hero_video_url", "hero_video_button_color", "hero_video_blur_on_hover",
      "hero_bg_dark", "hero_bg_light", "hero_min_height", "hero_border_style",
      "hero_card_bg_dark", "hero_card_bg_light", "hero_card_opacity",
      "contributors_enabled", "contributors_days", "contributors_count"
    ])
  },
  {
    id: "stats",
    label: "Stats",
    settings: new Set([
      "stats_enabled", "stat_labels_enabled",
      "stats_title", "stat_icon_color", "stat_icon_bg_color", "stat_icon_shape", "stat_counter_color",
      "stat_members_label", "stat_topics_label", "stat_posts_label",
      "stat_likes_label", "stat_chats_label", "stat_round_numbers",
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
      "topics_enabled", "topics_title", "topics_count", "topics_card_bg_color",
      "topics_bg_dark", "topics_bg_light", "topics_min_height", "topics_border_style"
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

// Pairs of dark/light background settings to display side-by-side
const BG_PAIRS = [
  ["hero_bg_dark", "hero_bg_light"],
  ["hero_card_bg_dark", "hero_card_bg_light"],
  ["stats_bg_dark", "stats_bg_light"],
  ["about_bg_dark", "about_bg_light"],
  ["topics_bg_dark", "topics_bg_light"],
  ["groups_bg_dark", "groups_bg_light"],
  ["app_cta_bg_dark", "app_cta_bg_light"],
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

  // Toggle visibility on bg-pair wrappers
  container.querySelectorAll(".cl-bg-pair").forEach((pair) => {
    const firstRow = pair.querySelector(".row.setting[data-setting]");
    if (firstRow) {
      pair.classList.toggle("cl-tab-hidden", firstRow.classList.contains("cl-tab-hidden"));
    }
  });

  // Update filter-active dimming on whichever tab container exists
  const nativeTabs = container.querySelector(".admin-plugin-config-area__tabs");
  if (nativeTabs) {
    nativeTabs.classList.toggle("cl-filter-active", filterActive);
  }
  const standaloneTabs = container.querySelector(".cl-admin-tabs");
  if (standaloneTabs) {
    standaloneTabs.classList.toggle("filter-active", filterActive);
  }
}

function updateActiveStates(activeId) {
  const container = getContainer();
  if (!container) return;

  // Update all our injected tabs
  container.querySelectorAll(".cl-admin-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeId);
  });

  // Update native Settings link if present
  const nativeLink = container.querySelector(".cl-native-settings-link");
  if (nativeLink) {
    nativeLink.classList.toggle("active", activeId === "settings");
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

function wrapBgPairs() {
  const container = getContainer();
  if (!container) return;

  BG_PAIRS.forEach(([darkName, lightName]) => {
    const darkRow = container.querySelector(`.row.setting[data-setting="${darkName}"]`);
    const lightRow = container.querySelector(`.row.setting[data-setting="${lightName}"]`);
    if (!darkRow || !lightRow) return;
    // Skip if already wrapped
    if (darkRow.parentElement && darkRow.parentElement.classList.contains("cl-bg-pair")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "cl-bg-pair";
    darkRow.parentNode.insertBefore(wrapper, darkRow);
    wrapper.appendChild(darkRow);
    wrapper.appendChild(lightRow);
  });
}

function buildTabsUI() {
  const container = getContainer();
  if (!container) return false;

  // Already injected — just re-apply filter
  // Search broadly: native tabs may be a sibling of container, not a child
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

  // ── Strategy 1: Inject into native Discourse tab bar ──
  // Native tabs may be a sibling of our container, so search at page level
  const page = container.closest(".admin-plugin-config-page") || container.parentElement;
  const nativeTabsEl = (page && page.querySelector(".admin-plugin-config-area__tabs")) ||
                       document.querySelector(".admin-plugin-config-area__tabs");
  if (nativeTabsEl) {
    // Find the native "Settings" link and hook into it
    const nativeLink = nativeTabsEl.querySelector("a");
    if (nativeLink) {
      nativeLink.classList.add("cl-native-settings-link", "active");
      nativeLink.addEventListener("click", (e) => {
        e.preventDefault();
        handleTabClick(container, "settings");
      });
    }

    // Inject our section tabs into the native bar (skip "settings" — native link handles that)
    TABS.forEach((tab) => {
      if (tab.id === "settings") return;

      const btn = document.createElement("button");
      btn.className = "cl-admin-tab";
      btn.textContent = tab.label;
      btn.dataset.tab = tab.id;
      btn.addEventListener("click", () => handleTabClick(container, tab.id));
      nativeTabsEl.appendChild(btn);
    });

    nativeTabsEl.classList.add("cl-tabs-injected");
    container.classList.add("cl-tabs-active");
    wrapBgPairs();
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
  wrapBgPairs();
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
