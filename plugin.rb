# frozen_string_literal: true

# name: community-landing
# about: Branded public landing page for unauthenticated visitors
# version: 1.0.0
# authors: Community
# url: https://github.com/community/community-landing

enabled_site_setting :community_landing_enabled

after_initialize do
  module ::CommunityLanding
    PLUGIN_NAME = "community-landing"
    PLUGIN_DIR  = File.expand_path("..", __FILE__)
  end

  class ::CommunityLanding::LandingController < ::ApplicationController
    requires_plugin CommunityLanding::PLUGIN_NAME

    skip_before_action :check_xhr
    skip_before_action :redirect_to_login_if_required
    skip_before_action :preload_json, raise: false
    content_security_policy false

    def index
      fetch_community_data

      css = load_file("assets", "stylesheets", "community_landing", "landing.css")
      js  = load_file("assets", "javascripts", "community_landing", "landing.js")

      base_url = Discourse.base_url
      csp = "default-src 'self' #{base_url}; " \
            "script-src 'self' 'unsafe-inline'; " \
            "style-src 'self' 'unsafe-inline'; " \
            "img-src 'self' #{base_url} data: https:; " \
            "font-src 'self' #{base_url}; " \
            "frame-ancestors 'self'"
      response.headers["Content-Security-Policy"] = csp

      render html: build_html(css, js).html_safe, layout: false, content_type: "text/html"
    end

    private

    def load_file(*path_parts)
      File.read(File.join(CommunityLanding::PLUGIN_DIR, *path_parts))
    rescue StandardError => e
      "/* Error loading #{path_parts.last}: #{e.message} */"
    end

    def fetch_community_data
      s = SiteSetting

      if s.community_landing_contributors_enabled
        @top_contributors = User
          .joins(:posts)
          .where(posts: { created_at: s.community_landing_contributors_days.days.ago.. })
          .where.not(username: %w[system discobot])
          .where(active: true, staged: false)
          .group("users.id")
          .order("COUNT(posts.id) DESC")
          .limit(s.community_landing_contributors_count)
          .select("users.*, COUNT(posts.id) AS post_count")
      end

      if s.community_landing_groups_enabled
        @groups = Group
          .where(visibility_level: Group.visibility_levels[:public])
          .where(automatic: false)
          .limit(s.community_landing_groups_count)
      end

      if s.community_landing_topics_enabled
        @hot_topics = Topic
          .listable_topics
          .where(visible: true)
          .where("topics.created_at > ?", 30.days.ago)
          .order(posts_count: :desc)
          .limit(s.community_landing_topics_count)
          .includes(:category, :user)
      end

      chat_count = 0
      begin
        chat_count = Chat::Message.count if defined?(Chat::Message)
      rescue
        chat_count = 0
      end

      @stats = {
        members: User.real.count,
        topics:  Topic.listable_topics.count,
        posts:   Post.where(user_deleted: false).count,
        likes:   Post.sum(:like_count),
        chats:   chat_count,
      }
    end

    def e(text)
      ERB::Util.html_escape(text.to_s)
    end

    SUN_SVG  = '<svg class="cl-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    MOON_SVG = '<svg class="cl-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    QUOTE_SVG = '<svg class="cl-about__quote-mark" viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M6 7h3l2 4v6H5v-6h3zm8 0h3l2 4v6h-6v-6h3z"/></svg>'

    STAT_MEMBERS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    STAT_TOPICS_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
    STAT_POSTS_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    STAT_LIKES_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    STAT_CHATS_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'

    def hex_to_rgb(hex)
      hex = hex.to_s.gsub("#", "")
      return "0, 0, 0" unless hex.match?(/\A[0-9a-fA-F]{6}\z/)
      "#{hex[0..1].to_i(16)}, #{hex[2..3].to_i(16)}, #{hex[4..5].to_i(16)}"
    end

    def build_color_overrides(s)
      accent = s.community_landing_accent_color.presence || "#7c6aff"
      accent_hover = s.community_landing_accent_hover_color.presence || "#9485ff"
      dark_bg = s.community_landing_dark_bg_color.presence || "#06060f"
      light_bg = s.community_landing_light_bg_color.presence || "#f8f9fc"
      accent_rgb = hex_to_rgb(accent)

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
  }
}
</style>\n"
    end

    # ── Logo helpers ──

    def logo_img(url, alt, css_class, height)
      "<img src=\"#{url}\" alt=\"#{e(alt)}\" class=\"#{css_class}\" style=\"height: #{height}px;\">"
    end

    def render_logo(dark_url, light_url, site_name, base_class, height)
      if dark_url && light_url
        logo_img(dark_url, site_name, "#{base_class} cl-logo--dark", height) +
        logo_img(light_url, site_name, "#{base_class} cl-logo--light", height)
      else
        logo_img(dark_url || light_url, site_name, base_class, height)
      end
    end

    # ── App badge helper ──

    def render_app_badge(store_url, custom_icon_url, default_svg, badge_h, badge_style)
      style_class = case badge_style
                    when "pill" then "cl-app-badge--pill"
                    when "square" then "cl-app-badge--square"
                    else "cl-app-badge--rounded"
                    end
      html = "<a href=\"#{store_url}\" class=\"cl-app-badge #{style_class}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"height: #{badge_h}px;\">"
      if custom_icon_url
        html << "<img src=\"#{custom_icon_url}\" alt=\"\" class=\"cl-app-badge__img\">"
      else
        html << default_svg
      end
      html << "</a>\n"
      html
    end

    def build_html(css, js)
      s = SiteSetting
      site_name = s.title
      login_url = "/login"

      # Logo URLs
      logo_dark_url  = s.community_landing_logo_dark_url.presence
      logo_light_url = s.community_landing_logo_light_url.presence
      # Fallback: if only light is set, treat it as the universal logo
      if logo_dark_url.nil? && logo_light_url.nil?
        fallback = s.respond_to?(:logo_url) ? s.logo_url.presence : nil
        logo_dark_url = fallback
      end
      has_logo  = logo_dark_url.present? || logo_light_url.present?
      logo_h    = s.community_landing_logo_height rescue 30
      og_logo   = logo_dark_url || logo_light_url

      # Footer logo
      footer_logo_url = s.community_landing_footer_logo_url.presence

      html = +""
      html << "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n"
      html << "<meta charset=\"UTF-8\">\n"
      html << "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\">\n"
      html << "<meta name=\"color-scheme\" content=\"dark light\">\n"
      html << "<title>#{e(s.community_landing_hero_title)} | #{e(site_name)}</title>\n"
      html << "<meta name=\"description\" content=\"#{e(s.community_landing_hero_subtitle)}\">\n"
      html << "<meta property=\"og:type\" content=\"website\">\n"
      html << "<meta property=\"og:title\" content=\"#{e(s.community_landing_hero_title)}\">\n"
      html << "<meta property=\"og:description\" content=\"#{e(s.community_landing_hero_subtitle)}\">\n"
      html << "<meta property=\"og:image\" content=\"#{og_logo}\">\n" if og_logo
      html << "<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
      html << "<link rel=\"canonical\" href=\"#{Discourse.base_url}\">\n"
      html << "<style>\n#{css}\n</style>\n"
      html << build_color_overrides(s)
      html << "</head>\n<body class=\"cl-body\">\n"

      # Navbar labels
      signin_label = s.community_landing_navbar_signin_label.presence || "Sign In"
      join_label   = s.community_landing_navbar_join_label.presence || "Join Free"

      # ── NAVBAR ──
      html << "<nav class=\"cl-navbar\" id=\"cl-navbar\"><div class=\"cl-navbar__inner\">\n"
      html << "<a href=\"/\" class=\"cl-navbar__brand\">"
      if has_logo
        html << render_logo(logo_dark_url, logo_light_url, site_name, "cl-navbar__logo", logo_h)
      else
        html << "<span class=\"cl-navbar__site-name\">#{e(site_name)}</span>"
      end
      html << "</a>\n"
      html << "<button class=\"cl-navbar__hamburger\" id=\"cl-hamburger\" aria-label=\"Toggle menu\"><span></span><span></span><span></span></button>\n"
      html << "<div class=\"cl-navbar__links\" id=\"cl-nav-links\">\n"
      html << "<button class=\"cl-theme-toggle\" aria-label=\"Toggle theme\">#{SUN_SVG}#{MOON_SVG}</button>\n"
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--ghost\">#{e(signin_label)}</a>\n"
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--primary\">#{e(join_label)}</a>\n"
      html << "</div></div></nav>\n"

      # ── HERO — text left, image right ──
      hero_style = ""
      if s.community_landing_hero_background_image_url.present?
        hero_style = " style=\"background-image: linear-gradient(rgba(6,6,15,0.8), rgba(6,6,15,0.8)), url('#{s.community_landing_hero_background_image_url}');\""
      end
      html << "<section class=\"cl-hero\" id=\"cl-hero\"#{hero_style}>\n"
      html << "<div class=\"cl-hero__orb\"></div>\n"
      html << "<div class=\"cl-hero__inner\">\n"
      html << "<div class=\"cl-hero__content\">\n"

      title_words = s.community_landing_hero_title.to_s.split(" ")
      if title_words.length > 1
        html << "<h1 class=\"cl-hero__title\">#{e(title_words[0..-2].join(" "))} <span class=\"cl-hero__title-accent\">#{e(title_words.last)}</span></h1>\n"
      else
        html << "<h1 class=\"cl-hero__title\"><span class=\"cl-hero__title-accent\">#{e(s.community_landing_hero_title)}</span></h1>\n"
      end

      html << "<p class=\"cl-hero__subtitle\">#{e(s.community_landing_hero_subtitle)}</p>\n"

      primary_label = s.community_landing_hero_primary_button_label.presence || "Browse the Forum"
      primary_url   = s.community_landing_hero_primary_button_url.presence || "/latest"
      secondary_label = s.community_landing_hero_secondary_button_label.presence || "Join the Community"
      secondary_url   = s.community_landing_hero_secondary_button_url.presence || login_url

      html << "<div class=\"cl-hero__actions\">\n"
      html << "<a href=\"#{primary_url}\" class=\"cl-btn cl-btn--primary cl-btn--lg\">#{e(primary_label)}</a>\n"
      html << "<a href=\"#{secondary_url}\" class=\"cl-btn cl-btn--ghost cl-btn--lg\">#{e(secondary_label)}</a>\n"
      html << "</div>\n"

      html << "</div>\n" # end cl-hero__content

      hero_image_urls_raw = s.community_landing_hero_image_urls.presence
      if hero_image_urls_raw
        urls = hero_image_urls_raw.split("|").map(&:strip).reject(&:empty?).first(5)
        if urls.any?
          img_max_h = s.community_landing_hero_image_max_height rescue 500
          html << "<div class=\"cl-hero__image\" data-hero-images=\"#{e(urls.to_json)}\">\n"
          html << "<img src=\"#{urls.first}\" alt=\"#{e(site_name)}\" class=\"cl-hero__image-img\" style=\"max-height: #{img_max_h}px;\">\n"
          html << "</div>\n"
        end
      end

      html << "</div></section>\n" # end hero

      # ── STATS ROW — full-width counter cards ──
      html << "<section class=\"cl-stats-row cl-reveal\" id=\"cl-stats-row\"><div class=\"cl-container\">\n"
      html << "<div class=\"cl-stats-row__grid\">\n"
      html << stats_counter_card(STAT_MEMBERS_SVG, @stats[:members], s.community_landing_stat_members_label)
      html << stats_counter_card(STAT_TOPICS_SVG, @stats[:topics], s.community_landing_stat_topics_label)
      html << stats_counter_card(STAT_POSTS_SVG, @stats[:posts], s.community_landing_stat_posts_label)
      html << stats_counter_card(STAT_LIKES_SVG, @stats[:likes], s.community_landing_stat_likes_label)
      html << stats_counter_card(STAT_CHATS_SVG, @stats[:chats], s.community_landing_stat_chats_label)
      html << "</div>\n</div></section>\n"

      # ── TWO-COLUMN CONTENT AREA ──
      html << "<div class=\"cl-content\"><div class=\"cl-container\">\n"
      html << "<div class=\"cl-content__grid\">\n"

      # ── LEFT COLUMN — About + Contributors ──
      html << "<div class=\"cl-content__left\">\n"

      # About — quote card
      if s.community_landing_about_enabled
        about_body = s.community_landing_about_body.presence || ""
        about_image = s.community_landing_about_image_url.presence
        about_role = s.community_landing_about_role.presence || site_name
        html << "<section class=\"cl-about cl-reveal\" id=\"cl-about\">\n"
        html << "<div class=\"cl-about__card\">\n"
        html << QUOTE_SVG
        if about_body.present?
          html << "<div class=\"cl-about__body\">#{about_body}</div>\n"
        end
        html << "<div class=\"cl-about__meta\">\n"
        if about_image
          html << "<img src=\"#{about_image}\" alt=\"\" class=\"cl-about__avatar\">\n"
        end
        html << "<div class=\"cl-about__meta-text\">\n"
        html << "<span class=\"cl-about__author\">#{e(s.community_landing_about_title)}</span>\n"
        html << "<span class=\"cl-about__role\">#{e(about_role)}</span>\n"
        html << "</div></div></div>\n"
        html << "</section>\n"
      end

      # Top Contributors
      if s.community_landing_contributors_enabled && @top_contributors&.any?
        html << "<section class=\"cl-contributors cl-reveal\" id=\"cl-contributors\">\n"
        html << "<h2 class=\"cl-section-title\">#{e(s.community_landing_contributors_title)}</h2>\n"
        html << "<div class=\"cl-contributors__list\">\n"
        @top_contributors.each do |user|
          avatar_url = user.avatar_template.gsub("{size}", "120")
          html << "<a href=\"#{login_url}\" class=\"cl-contributor\">\n"
          html << "<img src=\"#{avatar_url}\" alt=\"#{e(user.username)}\" class=\"cl-contributor__avatar\" loading=\"lazy\">\n"
          html << "<span class=\"cl-contributor__name\">#{e(user.username)}</span>\n"
          html << "</a>\n"
        end
        html << "</div>\n</section>\n"
      end

      html << "</div>\n" # end left

      # ── RIGHT COLUMN — Trending Discussions ──
      html << "<div class=\"cl-content__right\">\n"

      # Trending Discussions
      if s.community_landing_topics_enabled && @hot_topics&.any?
        html << "<section class=\"cl-topics cl-reveal\" id=\"cl-topics\">\n"
        html << "<h2 class=\"cl-section-title\">#{e(s.community_landing_topics_title)}</h2>\n"
        html << "<div class=\"cl-topics__list\">\n"
        @hot_topics.each do |topic|
          html << "<a href=\"#{login_url}\" class=\"cl-topic-row\">\n"
          if topic.category
            html << "<span class=\"cl-topic-row__cat\" style=\"--cat-color: ##{topic.category.color}\">#{e(topic.category.name)}</span>\n"
          end
          html << "<span class=\"cl-topic-row__title\">#{e(topic.title)}</span>\n"
          html << "<span class=\"cl-topic-row__meta\">"
          html << "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/></svg>"
          html << " #{topic.posts_count}"
          html << "</span></a>\n"
        end
        html << "</div>\n</section>\n"
      end

      html << "</div>\n" # end right

      # ── BOTTOM ROW — Groups (full-width) ──
      if s.community_landing_groups_enabled && @groups&.any?
        html << "<div class=\"cl-content__bottom\">\n"
        html << "<section class=\"cl-groups cl-reveal\" id=\"cl-groups\">\n"
        html << "<h2 class=\"cl-section-title\">#{e(s.community_landing_groups_title)}</h2>\n"
        html << "<div class=\"cl-groups__grid\">\n"
        @groups.each do |group|
          display_name = group.name.tr("_-", " ").gsub(/\b\w/, &:upcase)
          hue = group.name.bytes.sum % 360
          html << "<a href=\"#{login_url}\" class=\"cl-group-card\">\n"
          html << "<div class=\"cl-group-card__icon\">"
          if group.flair_url.present?
            html << "<img src=\"#{group.flair_url}\" alt=\"\">"
          else
            html << "<span class=\"cl-group-card__initial\" style=\"background: hsl(#{hue}, 55%, 50%)\">#{group.name[0].upcase}</span>"
          end
          html << "</div>\n"
          html << "<span class=\"cl-group-card__name\">#{e(display_name)}</span>\n"
          html << "<span class=\"cl-group-card__count\">#{group.user_count} members</span>\n"
          html << "</a>\n"
        end
        html << "</div>\n</section>\n"
        html << "</div>\n"
      end

      html << "</div></div></div>\n" # end content grid

      # ── APP CTA (above footer) ──
      if s.community_landing_show_app_ctas && (s.community_landing_ios_app_url.present? || s.community_landing_android_app_url.present?)
        badge_h = s.community_landing_app_badge_height rescue 45
        badge_style = s.community_landing_app_badge_style rescue "rounded"
        ios_icon = s.community_landing_ios_app_icon_url.presence
        android_icon = s.community_landing_android_app_icon_url.presence

        ios_w = (badge_h * 3.0).to_i
        android_w = (badge_h * 3.375).to_i

        ios_default_svg = "<svg viewBox=\"0 0 120 40\" width=\"#{ios_w}\" height=\"#{badge_h}\"><rect width=\"120\" height=\"40\" fill=\"#000\"/><text x=\"60\" y=\"15\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"7\" font-family=\"system-ui\">Download on the</text><text x=\"60\" y=\"28\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"12\" font-weight=\"600\" font-family=\"system-ui\">App Store</text></svg>"
        android_default_svg = "<svg viewBox=\"0 0 135 40\" width=\"#{android_w}\" height=\"#{badge_h}\"><rect width=\"135\" height=\"40\" fill=\"#000\"/><text x=\"67\" y=\"15\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"7\" font-family=\"system-ui\">GET IT ON</text><text x=\"67\" y=\"28\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"12\" font-weight=\"600\" font-family=\"system-ui\">Google Play</text></svg>"

        html << "<section class=\"cl-app-cta cl-reveal\" id=\"cl-app-cta\"><div class=\"cl-container\">\n"
        html << "<h2 class=\"cl-app-cta__headline\">#{e(s.community_landing_app_cta_headline)}</h2>\n"
        html << "<p class=\"cl-app-cta__subtext\">#{e(s.community_landing_app_cta_subtext)}</p>\n"
        html << "<div class=\"cl-app-cta__badges\">\n"
        if s.community_landing_ios_app_url.present?
          html << render_app_badge(s.community_landing_ios_app_url, ios_icon, ios_default_svg, badge_h, badge_style)
        end
        if s.community_landing_android_app_url.present?
          html << render_app_badge(s.community_landing_android_app_url, android_icon, android_default_svg, badge_h, badge_style)
        end
        html << "</div></div></section>\n"
      end

      # ── FOOTER ──
      html << "<footer class=\"cl-footer\" id=\"cl-footer\">\n"
      html << "<div class=\"cl-container\">\n"
      html << "<div class=\"cl-footer__top\">\n"
      html << "<div class=\"cl-footer__brand\">"
      if footer_logo_url
        html << "<img src=\"#{footer_logo_url}\" alt=\"#{e(site_name)}\" class=\"cl-footer__logo\" style=\"height: #{logo_h}px;\">"
      elsif has_logo
        html << render_logo(logo_dark_url, logo_light_url, site_name, "cl-footer__logo", logo_h)
      else
        html << "<span class=\"cl-footer__site-name\">#{e(site_name)}</span>"
      end
      html << "</div>\n"
      html << "<div class=\"cl-footer__links\">\n"
      begin
        links = JSON.parse(s.community_landing_footer_links)
        links.each { |link| html << "<a href=\"#{link["url"]}\" class=\"cl-footer__link\">#{e(link["label"])}</a>\n" }
      rescue JSON::ParserError
      end
      html << "</div>\n"
      html << "</div>\n"
      if s.community_landing_footer_text.present?
        html << "<div class=\"cl-footer__text\">#{s.community_landing_footer_text}</div>\n"
      end
      html << "<div class=\"cl-footer__copy\">&copy; #{Time.now.year} #{e(site_name)}</div>\n"
      html << "</div></footer>\n"

      html << "<script>\n#{js}\n</script>\n"
      html << "</body>\n</html>"
      html
    end

    def stats_counter_card(icon_svg, count, label)
      "<div class=\"cl-stats-counter\">\n" \
      "<div class=\"cl-stats-counter__icon\">#{icon_svg}</div>\n" \
      "<span class=\"cl-stats-counter__value\" data-count=\"#{count}\">0</span>\n" \
      "<span class=\"cl-stats-counter__label\">#{e(label)}</span>\n" \
      "</div>\n"
    end

  end

  Discourse::Application.routes.prepend do
    root to: "community_landing/landing#index",
         constraints: ->(req) {
           req.cookies["_t"].blank? &&
             SiteSetting.community_landing_enabled
         }
  end
end
