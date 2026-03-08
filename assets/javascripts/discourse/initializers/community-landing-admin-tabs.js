import { withPluginApi } from "discourse/lib/plugin-api";

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
      "scroll_animation", "staggered_reveal_enabled", "dynamic_background_enabled",
      "mouse_parallax_enabled", "scroll_progress_enabled"
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
      "navbar_bg_color", "navbar_border_style",
      "social_twitter_url", "social_facebook_url", "social_instagram_url",
      "social_youtube_url", "social_tiktok_url", "social_github_url"
    ])
  },
  {
    id: "hero",
    label: "Hero",
    settings: new Set([
      "hero_title", "hero_accent_word", "hero_subtitle",
      "hero_card_enabled", "hero_image_first",
      "hero_background_image_url", "hero_image_urls", "hero_image_max_height",
      "hero_primary_button_enabled", "hero_primary_button_label", "hero_primary_button_url",
      "hero_secondary_button_enabled", "hero_secondary_button_label", "hero_secondary_button_url",
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
      "participation_title", "participation_bio_max_length",
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
      "stats_title", "stat_card_style",
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
      "about_title", "about_role", "about_body", "about_image_url",
      "about_card_color_dark", "about_card_color_light",
      "about_background_image_url",
      "about_bg_dark", "about_bg_light", "about_min_height", "about_border_style"
    ])
  },
  {
    id: "topics",
    label: "Trending",
    settings: new Set([
      "topics_enabled", "topics_title_enabled", "topics_title", "topics_count",
      "topics_card_bg_dark", "topics_card_bg_light",
      "topics_bg_dark", "topics_bg_light", "topics_min_height", "topics_border_style"
    ])
  },
  {
    id: "groups",
    label: "Spaces & FAQ",
    settings: new Set([
      "groups_enabled", "groups_title_enabled", "groups_title", "groups_count",
      "groups_selected",
      "groups_show_description", "groups_description_max_length",
      "groups_card_bg_dark", "groups_card_bg_light",
      "groups_bg_dark", "groups_bg_light", "groups_min_height", "groups_border_style",
      "faq_enabled", "faq_title_enabled", "faq_title", "faq_items"
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
    // Skip rows inside a merge wrapper — handled at wrapper level
    if (row.closest(".cl-merge-wrapper")) return;
    const name = row.getAttribute("data-setting");
    row.classList.toggle(
      "cl-tab-hidden",
      !filterActive && !tab.settings.has(name)
    );
  });

  // Handle merge wrappers — show/hide based on dark row's setting
  container.querySelectorAll(".cl-merge-wrapper").forEach((wrapper) => {
    const darkRow = wrapper.querySelector(".cl-merged-dark");
    if (!darkRow) return;
    const name = darkRow.getAttribute("data-setting");
    wrapper.classList.toggle(
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

    // Unwrap merge wrappers — restore rows to their original position
    container.querySelectorAll(".cl-merge-wrapper").forEach((wrapper) => {
      const parent = wrapper.parentNode;
      while (wrapper.firstChild) {
        const child = wrapper.firstChild;
        child.classList.remove("cl-merged-dark", "cl-merged-light");
        parent.insertBefore(child, wrapper);
      }
      wrapper.remove();
    });
  }

  // Reset state
  currentTab = "settings";
  filterActive = false;
}

/**
 * Merge dark/light bg color pairs into a single visual row.
 * Uses a CSS wrapper approach — both rows stay intact in the DOM
 * (preserving Ember bindings and undo/reset buttons).
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

    // Wrap both rows in a flex container
    const wrapper = document.createElement("div");
    wrapper.className = "cl-merge-wrapper";
    darkRow.parentNode.insertBefore(wrapper, darkRow);
    wrapper.appendChild(darkRow);
    wrapper.appendChild(lightRow);

    // Mark rows for CSS styling
    darkRow.classList.add("cl-merged-dark");
    lightRow.classList.add("cl-merged-light");
    // Light row is NOT hidden — it stays in the DOM with full Ember bindings
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
