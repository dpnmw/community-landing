# frozen_string_literal: true

module CommunityLanding
  class StyleBuilder
    include Helpers

    def initialize(settings = SiteSetting)
      @s = settings
    end

    # CSS custom properties for accent colors, gradients, backgrounds
    def color_overrides
      accent       = (hex(@s.accent_color) rescue nil) || "#d4a24e"
      accent_hover = (hex(@s.accent_hover_color) rescue nil) || "#c4922e"
      dark_bg      = (hex(@s.dark_bg_color) rescue nil) || "#06060f"
      light_bg     = (hex(@s.light_bg_color) rescue nil) || "#faf6f0"
      stat_icon    = (hex(@s.stat_icon_color) rescue nil) || accent
      about_bg_img = (@s.about_background_image_url.presence rescue nil)
      app_g1_dark  = safe_hex(:app_cta_gradient_start_dark) || accent
      app_g1_light = safe_hex(:app_cta_gradient_start_light)
      app_g2_dark  = safe_hex(:app_cta_gradient_mid_dark) || accent_hover
      app_g2_light = safe_hex(:app_cta_gradient_mid_light)
      app_g3_dark  = safe_hex(:app_cta_gradient_end_dark) || accent_hover
      app_g3_light = safe_hex(:app_cta_gradient_end_light)
      stat_icon_bg = hex(@s.stat_icon_bg_color.presence) rescue nil
      stat_counter = hex(@s.stat_counter_color.presence) rescue nil
      video_btn_bg = hex(@s.hero_video_button_color.presence) rescue nil

      # Hero card bg (hex + opacity → rgba)
      hero_card_dark  = hex(@s.hero_card_bg_dark.presence) rescue nil
      hero_card_light = hex(@s.hero_card_bg_light.presence) rescue nil
      hero_card_opacity = [[@s.hero_card_opacity.to_s.to_f, 0].max, 1].min rescue 0.85
      hero_card_opacity = 0.85 if hero_card_opacity == 0.0 && (@s.hero_card_opacity.to_s.strip.empty? rescue true)

      # Dark/light element colors
      navbar_signin_dark  = safe_hex(:navbar_signin_color_dark)
      navbar_signin_light = safe_hex(:navbar_signin_color_light)
      navbar_join_dark    = safe_hex(:navbar_join_color_dark)
      navbar_join_light   = safe_hex(:navbar_join_color_light)
      primary_btn_dark    = safe_hex(:hero_primary_btn_color_dark)
      primary_btn_light   = safe_hex(:hero_primary_btn_color_light)
      secondary_btn_dark  = safe_hex(:hero_secondary_btn_color_dark)
      secondary_btn_light = safe_hex(:hero_secondary_btn_color_light)
      pill_bg_dark        = safe_hex(:contributors_pill_bg_dark)
      pill_bg_light       = safe_hex(:contributors_pill_bg_light)
      stat_card_dark      = safe_hex(:stat_card_bg_dark)
      stat_card_light     = safe_hex(:stat_card_bg_light)
      about_card_dark     = safe_hex(:about_card_color_dark)
      about_card_light    = safe_hex(:about_card_color_light)
      topic_card_dark     = safe_hex(:topics_card_bg_dark)
      topic_card_light    = safe_hex(:topics_card_bg_light)
      space_card_dark     = safe_hex(:groups_card_bg_dark)
      space_card_light    = safe_hex(:groups_card_bg_light)
      faq_card_dark       = safe_hex(:faq_card_bg_dark)
      faq_card_light      = safe_hex(:faq_card_bg_light)
      part_card_dark      = safe_hex(:participation_card_bg_dark)
      part_card_light     = safe_hex(:participation_card_bg_light)
      part_icon_color     = safe_hex(:participation_icon_color)
      part_stat_color     = safe_hex(:participation_stat_color)
      part_stat_lbl_color = safe_hex(:participation_stat_label_color)
      part_bio_color      = safe_hex(:participation_bio_color)
      part_name_color     = safe_hex(:participation_name_color)
      part_meta_color     = safe_hex(:participation_meta_color)
      cta_headline_dark   = safe_hex(:app_cta_headline_color_dark)
      cta_headline_light  = safe_hex(:app_cta_headline_color_light)
      cta_subtext_dark    = safe_hex(:app_cta_subtext_color_dark)
      cta_subtext_light   = safe_hex(:app_cta_subtext_color_light)

      orb_color     = safe_hex(:orb_color)
      orb_opacity   = [[@s.orb_opacity.to_i, 0].max, 100].min rescue 50
      orb_opacity   = 50 if orb_opacity == 0 && (@s.orb_opacity.to_s.strip.empty? rescue true)

      accent_rgb    = hex_to_rgb(accent)
      orb_rgb       = orb_color ? hex_to_rgb(orb_color) : accent_rgb
      stat_icon_rgb = hex_to_rgb(stat_icon)

      stat_icon_bg_val = stat_icon_bg || "rgba(#{stat_icon_rgb}, 0.1)"
      stat_counter_val = stat_counter || "var(--cl-text-strong)"

      # Hero card bg rgba
      hero_card_dark_rgb  = hero_card_dark ? hex_to_rgb(hero_card_dark) : "12, 12, 25"
      hero_card_light_rgb = hero_card_light ? hex_to_rgb(hero_card_light) : "255, 255, 255"
      hero_card_dark_val  = "rgba(#{hero_card_dark_rgb}, #{hero_card_opacity})"
      hero_card_light_val = "rgba(#{hero_card_light_rgb}, #{hero_card_opacity})"

      # About card with optional background image
      about_dark_val  = about_card_dark || "var(--cl-card)"
      about_light_val = about_card_light || "var(--cl-card)"
      about_dark_css  = about_bg_img ? "#{about_dark_val}, url('#{about_bg_img}') center/cover no-repeat" : about_dark_val
      about_light_css = about_bg_img ? "#{about_light_val}, url('#{about_bg_img}') center/cover no-repeat" : about_light_val

      # Build optional lines (only emitted when a custom color is set)
      dark_extras = +""
      dark_extras << "\n  --cl-navbar-signin-color: #{navbar_signin_dark};" if navbar_signin_dark
      dark_extras << "\n  --cl-navbar-join-bg: #{navbar_join_dark};" if navbar_join_dark
      dark_extras << "\n  --cl-primary-btn-bg: #{primary_btn_dark};" if primary_btn_dark
      dark_extras << "\n  --cl-secondary-btn-bg: #{secondary_btn_dark};" if secondary_btn_dark
      dark_extras << "\n  --cl-pill-bg: #{pill_bg_dark};" if pill_bg_dark
      if video_btn_bg
        video_btn_rgb = hex_to_rgb(video_btn_bg)
        dark_extras << "\n  --cl-video-btn-bg: #{video_btn_bg};"
        dark_extras << "\n  --cl-video-btn-glow: rgba(#{video_btn_rgb}, 0.35);"
      end

      light_extras = +""
      light_extras << "\n  --cl-navbar-signin-color: #{navbar_signin_light || navbar_signin_dark};" if navbar_signin_light || navbar_signin_dark
      light_extras << "\n  --cl-navbar-join-bg: #{navbar_join_light || navbar_join_dark};" if navbar_join_light || navbar_join_dark
      light_extras << "\n  --cl-primary-btn-bg: #{primary_btn_light || primary_btn_dark};" if primary_btn_light || primary_btn_dark
      light_extras << "\n  --cl-secondary-btn-bg: #{secondary_btn_light || secondary_btn_dark};" if secondary_btn_light || secondary_btn_dark
      light_extras << "\n  --cl-pill-bg: #{pill_bg_light || pill_bg_dark};" if pill_bg_light || pill_bg_dark
      if video_btn_bg
        video_btn_rgb ||= hex_to_rgb(video_btn_bg)
        light_extras << "\n  --cl-video-btn-bg: #{video_btn_bg};"
        light_extras << "\n  --cl-video-btn-glow: rgba(#{video_btn_rgb}, 0.25);"
      end

      "<style>
:root, [data-theme=\"dark\"] {
  --cl-accent: #{accent};
  --cl-accent-hover: #{accent_hover};
  --cl-accent-glow: rgba(#{accent_rgb}, 0.35);
  --cl-accent-subtle: rgba(#{accent_rgb}, 0.08);
  --cl-bg: #{dark_bg};
  --cl-hero-bg: #{dark_bg};
  --cl-gradient-text: linear-gradient(135deg, #{accent_hover}, #{accent}, #{accent_hover});
  --cl-border-hover: rgba(#{accent_rgb}, 0.25);
  --cl-orb-1: rgba(#{orb_rgb}, 0.12);
  --cl-orb-2: rgba(#{orb_rgb}, 0.08);
  --cl-orb-opacity: #{orb_opacity / 100.0};
  --cl-stat-icon-color: #{stat_icon};
  --cl-stat-icon-bg: #{stat_icon_bg_val};
  --cl-stat-counter-color: #{stat_counter_val};
  --cl-stat-card-bg: #{stat_card_dark || 'var(--cl-card)'};
  --cl-space-card-bg: #{space_card_dark || 'var(--cl-card)'};
  --cl-topic-card-bg: #{topic_card_dark || 'var(--cl-card)'};
  --cl-hero-card-bg: #{hero_card_dark_val};
  --cl-about-card-bg: #{about_dark_css};
  --cl-participation-card-bg: #{part_card_dark || 'var(--cl-card)'};
  --cl-participation-icon-color: #{part_icon_color || 'var(--cl-accent)'};
  --cl-participation-stat-color: #{part_stat_color || 'var(--cl-text-strong)'};
  --cl-participation-stat-label-color: #{part_stat_lbl_color || 'var(--cl-text-muted, var(--cl-text))'};
  --cl-participation-bio-color: #{part_bio_color || 'var(--cl-text)'};
  --cl-participation-name-color: #{part_name_color || 'var(--cl-text-strong)'};
  --cl-participation-meta-color: #{part_meta_color || 'var(--cl-participation-icon-color)'};
  --cl-faq-card-bg: #{faq_card_dark || 'var(--cl-card)'};
  --cl-app-gradient: linear-gradient(135deg, #{app_g1_dark}, #{app_g2_dark}, #{app_g3_dark});
  --cl-cta-headline-color: #{cta_headline_dark || '#ffffff'};
  --cl-cta-subtext-color: #{cta_subtext_dark || 'rgba(255, 255, 255, 0.75)'};#{dark_extras}
}
[data-theme=\"light\"] {
  --cl-accent: #{accent};
  --cl-accent-hover: #{accent_hover};
  --cl-accent-glow: rgba(#{accent_rgb}, 0.2);
  --cl-accent-subtle: rgba(#{accent_rgb}, 0.06);
  --cl-bg: #{light_bg};
  --cl-hero-bg: #{light_bg};
  --cl-gradient-text: linear-gradient(135deg, #{accent}, #{accent_hover}, #{accent});
  --cl-border-hover: rgba(#{accent_rgb}, 0.3);
  --cl-orb-1: rgba(#{orb_rgb}, 0.08);
  --cl-orb-2: rgba(#{orb_rgb}, 0.05);
  --cl-orb-opacity: #{orb_opacity / 100.0};
  --cl-stat-icon-color: #{stat_icon};
  --cl-stat-icon-bg: #{stat_icon_bg_val};
  --cl-stat-counter-color: #{stat_counter_val};
  --cl-stat-card-bg: #{stat_card_light || stat_card_dark || 'var(--cl-card)'};
  --cl-space-card-bg: #{space_card_light || space_card_dark || 'var(--cl-card)'};
  --cl-topic-card-bg: #{topic_card_light || topic_card_dark || 'var(--cl-card)'};
  --cl-hero-card-bg: #{hero_card_light_val};
  --cl-about-card-bg: #{about_light_css};
  --cl-participation-card-bg: #{part_card_light || part_card_dark || 'var(--cl-card)'};
  --cl-participation-icon-color: #{part_icon_color || 'var(--cl-accent)'};
  --cl-participation-stat-color: #{part_stat_color || 'var(--cl-text-strong)'};
  --cl-participation-stat-label-color: #{part_stat_lbl_color || 'var(--cl-text-muted, var(--cl-text))'};
  --cl-participation-bio-color: #{part_bio_color || 'var(--cl-text)'};
  --cl-participation-name-color: #{part_name_color || 'var(--cl-text-strong)'};
  --cl-participation-meta-color: #{part_meta_color || 'var(--cl-participation-icon-color)'};
  --cl-faq-card-bg: #{faq_card_light || faq_card_dark || 'var(--cl-card)'};
  --cl-app-gradient: linear-gradient(135deg, #{app_g1_light || app_g1_dark}, #{app_g2_light || app_g2_dark}, #{app_g3_light || app_g3_dark});
  --cl-cta-headline-color: #{cta_headline_light || '#1a1a2e'};
  --cl-cta-subtext-color: #{cta_subtext_light || 'rgba(26, 26, 46, 0.7)'};#{light_extras}
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme=\"dark\"]) {
    --cl-accent: #{accent};
    --cl-accent-hover: #{accent_hover};
    --cl-accent-glow: rgba(#{accent_rgb}, 0.2);
    --cl-accent-subtle: rgba(#{accent_rgb}, 0.06);
    --cl-bg: #{light_bg};
    --cl-hero-bg: #{light_bg};
    --cl-gradient-text: linear-gradient(135deg, #{accent}, #{accent_hover}, #{accent});
    --cl-border-hover: rgba(#{accent_rgb}, 0.3);
    --cl-orb-1: rgba(#{orb_rgb}, 0.08);
    --cl-orb-2: rgba(#{orb_rgb}, 0.05);
    --cl-orb-opacity: #{orb_opacity / 100.0};
    --cl-stat-icon-color: #{stat_icon};
    --cl-stat-card-bg: #{stat_card_light || stat_card_dark || 'var(--cl-card)'};
    --cl-space-card-bg: #{space_card_light || space_card_dark || 'var(--cl-card)'};
    --cl-topic-card-bg: #{topic_card_light || topic_card_dark || 'var(--cl-card)'};
    --cl-about-card-bg: #{about_light_css};
    --cl-participation-card-bg: #{part_card_light || part_card_dark || 'var(--cl-card)'};
    --cl-participation-icon-color: #{part_icon_color || 'var(--cl-accent)'};
    --cl-participation-stat-color: #{part_stat_color || 'var(--cl-text-strong)'};
    --cl-participation-stat-label-color: #{part_stat_lbl_color || 'var(--cl-text-muted, var(--cl-text))'};
    --cl-participation-bio-color: #{part_bio_color || 'var(--cl-text)'};
    --cl-participation-name-color: #{part_name_color || 'var(--cl-text-strong)'};
    --cl-participation-meta-color: #{part_meta_color || 'var(--cl-participation-icon-color)'};
    --cl-faq-card-bg: #{faq_card_light || faq_card_dark || 'var(--cl-card)'};
    --cl-app-gradient: linear-gradient(135deg, #{app_g1_light || app_g1_dark}, #{app_g2_light || app_g2_dark}, #{app_g3_light || app_g3_dark});
    --cl-cta-headline-color: #{cta_headline_light || '#1a1a2e'};
    --cl-cta-subtext-color: #{cta_subtext_light || 'rgba(26, 26, 46, 0.7)'};#{light_extras}
  }
}
</style>\n"
    end

    # Per-section dark/light background overrides
    def section_backgrounds
      css = +""
      sections = [
        ["#cl-hero",         safe_hex(:hero_bg_dark),         safe_hex(:hero_bg_light)],
        ["#cl-stats-row",    safe_hex(:stats_bg_dark),        safe_hex(:stats_bg_light)],
        ["#cl-about",        safe_hex(:about_bg_dark),        safe_hex(:about_bg_light)],
        ["#cl-participation", safe_hex(:participation_bg_dark), safe_hex(:participation_bg_light)],
        ["#cl-topics",       safe_hex(:topics_bg_dark),       safe_hex(:topics_bg_light)],
        ["#cl-splits",       safe_hex(:splits_bg_dark),       safe_hex(:splits_bg_light)],
        ["#cl-app-cta",      safe_hex(:app_cta_bg_dark),      safe_hex(:app_cta_bg_light)],
        ["#cl-footer",       safe_hex(:footer_bg_dark),       safe_hex(:footer_bg_light)],
      ]

      sections.each do |sel, dark_bg, light_bg|
        next unless dark_bg || light_bg
        if dark_bg
          css << ":root #{sel}, [data-theme=\"dark\"] #{sel} { background: #{dark_bg}; }\n"
        end
        if light_bg
          css << "[data-theme=\"light\"] #{sel} { background: #{light_bg}; }\n"
          css << "@media (prefers-color-scheme: light) { :root:not([data-theme=\"dark\"]) #{sel} { background: #{light_bg}; } }\n"
        end
      end

      faq_mh = (@s.faq_mobile_max_height rescue 0).to_i
      if faq_mh > 0
        css << "@media (max-width: 767px) { .cl-faq { max-height: #{faq_mh}px; overflow-y: auto; } }\n"
      end

      css.present? ? "<style>\n#{css}</style>\n" : ""
    end

    private

    # Safe accessor — returns nil if the setting doesn't exist
    def safe_hex(setting_name)
      hex(@s.public_send(setting_name))
    rescue
      nil
    end
  end
end
