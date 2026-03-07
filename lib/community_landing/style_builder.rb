# frozen_string_literal: true

module CommunityLanding
  class StyleBuilder
    include Helpers

    def initialize(settings = SiteSetting)
      @s = settings
    end

    # CSS custom properties for accent colors, gradients, backgrounds
    def color_overrides
      accent       = hex(@s.accent_color) || "#d4a24e"
      accent_hover = hex(@s.accent_hover_color) || "#c4922e"
      dark_bg      = hex(@s.dark_bg_color) || "#06060f"
      light_bg     = hex(@s.light_bg_color) || "#faf6f0"
      stat_icon    = hex(@s.stat_icon_color) || accent
      about_g1     = hex(@s.about_gradient_start) || "#fdf6ec"
      about_g2     = hex(@s.about_gradient_mid) || "#fef9f0"
      about_g3     = hex(@s.about_gradient_end) || "#fdf6ec"
      about_bg_img = @s.about_background_image_url.presence
      app_g1       = hex(@s.app_cta_gradient_start) || accent
      app_g2       = hex(@s.app_cta_gradient_mid) || accent_hover
      app_g3       = hex(@s.app_cta_gradient_end) || accent_hover
      stat_icon_bg = hex(@s.stat_icon_bg_color.presence) rescue nil
      stat_counter = hex(@s.stat_counter_color.presence) rescue nil
      space_card_bg = hex(@s.groups_card_bg_color.presence) rescue nil
      topic_card_bg = hex(@s.topics_card_bg_color.presence) rescue nil
      accent_rgb   = hex_to_rgb(accent)
      stat_icon_rgb = hex_to_rgb(stat_icon)

      stat_icon_bg_val = stat_icon_bg || "rgba(#{stat_icon_rgb}, 0.1)"
      stat_counter_val = stat_counter || "var(--cl-text-strong)"
      space_card_bg_val = space_card_bg || "var(--cl-card)"
      topic_card_bg_val = topic_card_bg || "var(--cl-card)"

      about_bg_extra = about_bg_img ? ", url('#{about_bg_img}') center/cover no-repeat" : ""

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
  --cl-orb-1: rgba(#{accent_rgb}, 0.12);
  --cl-stat-icon-color: #{stat_icon};
  --cl-stat-icon-bg: #{stat_icon_bg_val};
  --cl-stat-counter-color: #{stat_counter_val};
  --cl-space-card-bg: #{space_card_bg_val};
  --cl-topic-card-bg: #{topic_card_bg_val};
  --cl-about-gradient: linear-gradient(135deg, #{about_g1}, #{about_g2}, #{about_g3})#{about_bg_extra};
  --cl-app-gradient: linear-gradient(135deg, #{app_g1}, #{app_g2}, #{app_g3});
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
  --cl-orb-1: rgba(#{accent_rgb}, 0.08);
  --cl-stat-icon-color: #{stat_icon};
  --cl-stat-icon-bg: #{stat_icon_bg_val};
  --cl-stat-counter-color: #{stat_counter_val};
  --cl-space-card-bg: #{space_card_bg_val};
  --cl-topic-card-bg: #{topic_card_bg_val};
  --cl-about-gradient: linear-gradient(135deg, #{about_g1}, #{about_g2}, #{about_g3})#{about_bg_extra};
  --cl-app-gradient: linear-gradient(135deg, #{app_g1}, #{app_g2}, #{app_g3});
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
    --cl-orb-1: rgba(#{accent_rgb}, 0.08);
    --cl-stat-icon-color: #{stat_icon};
    --cl-about-gradient: linear-gradient(135deg, #{about_g1}, #{about_g2}, #{about_g3})#{about_bg_extra};
    --cl-app-gradient: linear-gradient(135deg, #{app_g1}, #{app_g2}, #{app_g3});
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
        ["#cl-topics",       safe_hex(:topics_bg_dark),       safe_hex(:topics_bg_light)],
        ["#cl-contributors", safe_hex(:contributors_bg_dark), safe_hex(:contributors_bg_light)],
        ["#cl-groups",       safe_hex(:groups_bg_dark),       safe_hex(:groups_bg_light)],
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
