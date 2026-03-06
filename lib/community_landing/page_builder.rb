# frozen_string_literal: true

module CommunityLanding
  class PageBuilder
    include Helpers

    def initialize(data:, css:, js:)
      @data = data
      @css  = css
      @js   = js
      @s    = SiteSetting
      @styles = StyleBuilder.new(@s)
    end

    def build
      html = +""
      html << render_head
      html << "<body class=\"cl-body\">\n"
      html << render_navbar
      html << render_hero
      html << render_stats
      html << render_about
      html << render_topics
      html << render_contributors
      html << render_groups
      html << render_app_cta
      html << render_footer_desc
      html << render_footer
      html << "<script>\n#{@js}\n</script>\n"
      html << "</body>\n</html>"
      html
    end

    private

    # ── <head> ──

    def render_head
      site_name  = @s.title
      anim_class = @s.scroll_animation rescue "fade_up"
      anim_class = "none" if anim_class.blank?
      og_logo    = logo_dark_url || logo_light_url

      html = +""
      html << "<!DOCTYPE html>\n<html lang=\"en\" data-scroll-anim=\"#{e(anim_class)}\">\n<head>\n"
      html << "<meta charset=\"UTF-8\">\n"
      html << "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\">\n"
      html << "<meta name=\"color-scheme\" content=\"dark light\">\n"
      html << "<title>#{e(@s.hero_title)} | #{e(site_name)}</title>\n"
      html << "<meta name=\"description\" content=\"#{e(@s.hero_subtitle)}\">\n"
      html << "<meta property=\"og:type\" content=\"website\">\n"
      html << "<meta property=\"og:title\" content=\"#{e(@s.hero_title)}\">\n"
      html << "<meta property=\"og:description\" content=\"#{e(@s.hero_subtitle)}\">\n"
      html << "<meta property=\"og:image\" content=\"#{og_logo}\">\n" if og_logo
      html << "<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
      html << "<link rel=\"canonical\" href=\"#{Discourse.base_url}\">\n"
      html << "<style>\n#{@css}\n</style>\n"
      html << @styles.color_overrides
      html << @styles.section_backgrounds

      custom_css = @s.custom_css.presence rescue nil
      html << "<style>\n/* Custom CSS */\n#{custom_css}\n</style>\n" if custom_css

      html << "</head>\n"
      html
    end

    # ── 1. NAVBAR ──

    def render_navbar
      site_name    = @s.title
      signin_label = @s.navbar_signin_label.presence || "Sign In"
      join_label   = @s.navbar_join_label.presence || "Get Started"
      navbar_bg    = hex(@s.navbar_bg_color) rescue nil
      navbar_border = @s.navbar_border_style rescue "none"

      navbar_data = ""
      navbar_data << " data-nav-bg=\"#{e(navbar_bg)}\"" if navbar_bg
      navbar_data << " data-nav-border=\"#{e(navbar_border)}\"" if navbar_border && navbar_border != "none"

      html = +""
      html << "<nav class=\"cl-navbar\" id=\"cl-navbar\"#{navbar_data}><div class=\"cl-navbar__inner\">\n"
      html << "<div class=\"cl-navbar__left\">"
      html << "<a href=\"/\" class=\"cl-navbar__brand\">"
      if has_logo?
        html << render_logo(logo_dark_url, logo_light_url, site_name, "cl-navbar__logo", logo_height)
      else
        html << "<span class=\"cl-navbar__site-name\">#{e(site_name)}</span>"
      end
      html << "</a>\n</div>"

      html << "<div class=\"cl-navbar__right\">"
      html << theme_toggle
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--ghost\">#{e(signin_label)}</a>\n"
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--primary\">#{e(join_label)}</a>\n"
      html << "</div>"

      html << "<button class=\"cl-navbar__hamburger\" id=\"cl-hamburger\" aria-label=\"Toggle menu\"><span></span><span></span><span></span></button>\n"
      html << "<div class=\"cl-navbar__mobile-menu\" id=\"cl-nav-links\">\n"
      html << theme_toggle
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--ghost\">#{e(signin_label)}</a>\n"
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--primary\">#{e(join_label)}</a>\n"
      html << "</div>"
      html << "</div></nav>\n"
      html
    end

    # ── 2. HERO ──

    def render_hero
      hero_card   = @s.hero_card_enabled rescue true
      hero_bg_img = @s.hero_background_image_url.presence
      hero_border = @s.hero_border_style rescue "none"
      hero_min_h  = @s.hero_min_height rescue 0
      site_name   = @s.title

      html = +""
      html << "<section class=\"cl-hero#{hero_card ? ' cl-hero--card' : ''}\" id=\"cl-hero\"#{section_style(hero_border, hero_min_h)}>\n"

      if hero_bg_img && !hero_card
        html << "<div class=\"cl-hero__bg\" style=\"background-image: url('#{hero_bg_img}');\"></div>\n"
      end

      inner_style = ""
      if hero_card && hero_bg_img
        inner_style = " style=\"background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('#{hero_bg_img}'); background-size: cover; background-position: center;\""
      end

      html << "<div class=\"cl-hero__inner\"#{inner_style}>\n<div class=\"cl-hero__content\">\n"

      title_words = @s.hero_title.to_s.split(" ")
      if title_words.length > 1
        html << "<h1 class=\"cl-hero__title\">#{e(title_words[0..-2].join(' '))} <span class=\"cl-hero__title-accent\">#{e(title_words.last)}</span></h1>\n"
      else
        html << "<h1 class=\"cl-hero__title\"><span class=\"cl-hero__title-accent\">#{e(@s.hero_title)}</span></h1>\n"
      end

      html << "<p class=\"cl-hero__subtitle\">#{e(@s.hero_subtitle)}</p>\n"

      primary_label   = @s.hero_primary_button_label.presence || "View Latest Topics"
      primary_url     = @s.hero_primary_button_url.presence || "/latest"
      secondary_label = @s.hero_secondary_button_label.presence || "Explore Our Spaces"
      secondary_url   = @s.hero_secondary_button_url.presence || login_url

      html << "<div class=\"cl-hero__actions\">\n"
      html << "<a href=\"#{primary_url}\" class=\"cl-btn cl-btn--primary cl-btn--lg\">#{e(primary_label)}</a>\n"
      html << "<a href=\"#{secondary_url}\" class=\"cl-btn cl-btn--ghost cl-btn--lg\">#{e(secondary_label)}</a>\n"
      html << "</div>\n</div>\n"

      hero_image_urls_raw = @s.hero_image_urls.presence
      if hero_image_urls_raw
        urls = hero_image_urls_raw.split("|").map(&:strip).reject(&:empty?).first(5)
        if urls.any?
          img_max_h = @s.hero_image_max_height rescue 500
          html << "<div class=\"cl-hero__image\" data-hero-images=\"#{e(urls.to_json)}\">\n"
          html << "<img src=\"#{urls.first}\" alt=\"#{e(site_name)}\" class=\"cl-hero__image-img\" style=\"max-height: #{img_max_h}px;\">\n"
          html << "</div>\n"
        end
      end

      html << "</div></section>\n"
      html
    end

    # ── 3. STATS ──

    def render_stats
      stats       = @data[:stats]
      stats_title = @s.stats_title.presence || "Premium Stats"
      border      = @s.stats_border_style rescue "none"
      min_h       = @s.stats_min_height rescue 0

      html = +""
      html << "<section class=\"cl-stats cl-anim\" id=\"cl-stats-row\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\">#{e(stats_title)}</h2>\n"
      html << "<div class=\"cl-stats__grid\">\n"
      html << stat_card(Icons::STAT_MEMBERS_SVG, stats[:members], @s.stat_members_label)
      html << stat_card(Icons::STAT_TOPICS_SVG,  stats[:topics],  @s.stat_topics_label)
      html << stat_card(Icons::STAT_POSTS_SVG,   stats[:posts],   @s.stat_posts_label)
      html << stat_card(Icons::STAT_LIKES_SVG,   stats[:likes],   @s.stat_likes_label)
      html << stat_card(Icons::STAT_CHATS_SVG,   stats[:chats],   @s.stat_chats_label)
      html << "</div>\n</div></section>\n"
      html
    end

    # ── 4. ABOUT ──

    def render_about
      return "" unless @s.about_enabled

      about_body       = @s.about_body.presence || ""
      about_image      = @s.about_image_url.presence
      about_role       = @s.about_role.presence || @s.title
      about_heading_on = @s.about_heading_enabled rescue true
      about_heading    = @s.about_heading.presence || "About Community"
      border           = @s.about_border_style rescue "none"
      min_h            = @s.about_min_height rescue 0

      html = +""
      html << "<section class=\"cl-about cl-anim\" id=\"cl-about\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<div class=\"cl-about__card\">\n"
      html << "<h2 class=\"cl-about__heading\">#{e(about_heading)}</h2>\n" if about_heading_on
      html << Icons::QUOTE_SVG
      html << "<div class=\"cl-about__body\">#{about_body}</div>\n" if about_body.present?
      html << "<div class=\"cl-about__meta\">\n"
      html << "<img src=\"#{about_image}\" alt=\"\" class=\"cl-about__avatar\">\n" if about_image
      html << "<div class=\"cl-about__meta-text\">\n"
      html << "<span class=\"cl-about__author\">#{e(@s.about_title)}</span>\n"
      html << "<span class=\"cl-about__role\">#{e(about_role)}</span>\n"
      html << "</div></div>\n</div>\n</div></section>\n"
      html
    end

    # ── 5. TRENDING DISCUSSIONS ──

    def render_topics
      topics = @data[:topics]
      return "" unless @s.topics_enabled && topics&.any?

      border = @s.topics_border_style rescue "none"
      min_h  = @s.topics_min_height rescue 0

      html = +""
      html << "<section class=\"cl-topics cl-anim\" id=\"cl-topics\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\">#{e(@s.topics_title)}</h2>\n"
      html << "<div class=\"cl-topics__scroll\">\n"

      topics.each do |topic|
        topic_likes   = topic.like_count rescue 0
        topic_replies = topic.posts_count.to_i

        html << "<a href=\"#{login_url}\" class=\"cl-topic-card\">\n"
        if topic.category
          html << "<span class=\"cl-topic-card__cat\" style=\"--cat-color: ##{topic.category.color}\">#{e(topic.category.name)}</span>\n"
        end
        html << "<span class=\"cl-topic-card__title\">#{e(topic.title)}</span>\n"
        html << "<div class=\"cl-topic-card__meta\">"
        html << "<span class=\"cl-topic-card__stat\">#{Icons::COMMENT_SVG} #{topic_replies}</span>"
        html << "<span class=\"cl-topic-card__stat\">#{Icons::HEART_SVG} #{topic_likes}</span>"
        html << "</div></a>\n"
      end

      html << "</div>\n</div></section>\n"
      html
    end

    # ── 6. TOP CREATORS ──

    def render_contributors
      contributors = @data[:contributors]
      return "" unless @s.contributors_enabled && contributors&.any?

      border = @s.contributors_border_style rescue "none"
      min_h  = @s.contributors_min_height rescue 0

      html = +""
      html << "<section class=\"cl-creators cl-anim\" id=\"cl-contributors\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\">#{e(@s.contributors_title)}</h2>\n"
      html << "<div class=\"cl-creators__list\">\n"

      contributors.each do |user|
        avatar_url     = user.avatar_template.gsub("{size}", "120")
        activity_count = user.attributes["post_count"].to_i rescue 0

        html << "<a href=\"#{login_url}\" class=\"cl-creator-pill\">\n"
        html << "<img src=\"#{avatar_url}\" alt=\"#{e(user.username)}\" class=\"cl-creator-pill__avatar\" loading=\"lazy\">\n"
        html << "<span class=\"cl-creator-pill__name\">@#{e(user.username)}</span>\n"
        html << "<span class=\"cl-creator-pill__count\">#{activity_count}</span>\n"
        html << "</a>\n"
      end

      html << "</div>\n</div></section>\n"
      html
    end

    # ── 7. COMMUNITY SPACES ──

    def render_groups
      groups = @data[:groups]
      return "" unless @s.groups_enabled && groups&.any?

      border = @s.groups_border_style rescue "none"
      min_h  = @s.groups_min_height rescue 0

      html = +""
      html << "<section class=\"cl-spaces cl-anim\" id=\"cl-groups\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\">#{e(@s.groups_title)}</h2>\n"
      html << "<div class=\"cl-spaces__grid\">\n"

      groups.each do |group|
        display_name = group.name.tr("_-", " ").gsub(/\b\w/, &:upcase)
        hue   = group.name.bytes.sum % 360
        sat   = 50 + (group.name.bytes.first.to_i % 20)
        light = 40 + (group.name.bytes.last.to_i % 15)

        html << "<a href=\"#{login_url}\" class=\"cl-space-card\">\n"
        html << "<div class=\"cl-space-card__icon\" style=\"background: hsl(#{hue}, #{sat}%, #{light}%)\">"
        if group.flair_url.present?
          html << "<img src=\"#{group.flair_url}\" alt=\"\">"
        else
          html << "<span class=\"cl-space-card__letter\">#{group.name[0].upcase}</span>"
        end
        html << "</div>\n"
        html << "<span class=\"cl-space-card__name\">#{e(display_name)}</span>\n"
        html << "<span class=\"cl-space-card__sub\">#{group.user_count} members</span>\n"
        html << "</a>\n"
      end

      html << "</div>\n</div></section>\n"
      html
    end

    # ── 8. APP CTA ──

    def render_app_cta
      return "" unless @s.show_app_ctas && (@s.ios_app_url.present? || @s.android_app_url.present?)

      badge_h        = @s.app_badge_height rescue 45
      badge_style    = @s.app_badge_style rescue "rounded"
      app_image      = @s.app_cta_image_url.presence
      ios_custom     = @s.ios_app_badge_image_url.presence rescue nil
      android_custom = @s.android_app_badge_image_url.presence rescue nil
      border         = @s.app_cta_border_style rescue "none"
      min_h          = @s.app_cta_min_height rescue 0

      html = +""
      html << "<section class=\"cl-app-cta cl-anim\" id=\"cl-app-cta\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<div class=\"cl-app-cta__inner\">\n<div class=\"cl-app-cta__content\">\n"
      html << "<h2 class=\"cl-app-cta__headline\">#{e(@s.app_cta_headline)}</h2>\n"
      html << "<p class=\"cl-app-cta__subtext\">#{e(@s.app_cta_subtext)}</p>\n" if @s.app_cta_subtext.present?
      html << "<div class=\"cl-app-cta__badges\">\n"

      html << app_badge(:ios, @s.ios_app_url, ios_custom, badge_h, badge_style) if @s.ios_app_url.present?
      html << app_badge(:android, @s.android_app_url, android_custom, badge_h, badge_style) if @s.android_app_url.present?

      html << "</div>\n</div>\n"
      if app_image
        html << "<div class=\"cl-app-cta__image\">\n<img src=\"#{app_image}\" alt=\"App preview\" class=\"cl-app-cta__img\">\n</div>\n"
      end
      html << "</div>\n</div></section>\n"
      html
    end

    # ── 9. FOOTER DESCRIPTION ──

    def render_footer_desc
      return "" unless @s.footer_description.present?

      html = +""
      html << "<div class=\"cl-footer-desc\"><div class=\"cl-container\">\n"
      html << "<p class=\"cl-footer-desc__text\">#{@s.footer_description}</p>\n"
      html << "</div></div>\n"
      html
    end

    # ── 10. FOOTER ──

    def render_footer
      site_name     = @s.title
      footer_border = @s.footer_border_style rescue "solid"

      style_parts = []
      style_parts << "border-top: 1px #{footer_border} var(--cl-border);" if footer_border && footer_border != "none"
      style_attr = style_parts.any? ? " style=\"#{style_parts.join(' ')}\"" : ""

      html = +""
      html << "<footer class=\"cl-footer\" id=\"cl-footer\"#{style_attr}>\n<div class=\"cl-container\">\n"
      html << "<div class=\"cl-footer__row\">\n<div class=\"cl-footer__left\">\n"
      html << "<div class=\"cl-footer__brand\">"

      flogo = @s.footer_logo_url.presence
      if flogo
        html << "<img src=\"#{flogo}\" alt=\"#{e(site_name)}\" class=\"cl-footer__logo\" style=\"height: #{logo_height}px;\">"
      elsif has_logo?
        html << render_logo(logo_dark_url, logo_light_url, site_name, "cl-footer__logo", logo_height)
      else
        html << "<span class=\"cl-footer__site-name\">#{e(site_name)}</span>"
      end

      html << "</div>\n<div class=\"cl-footer__links\">\n"
      begin
        links = JSON.parse(@s.footer_links)
        links.each { |link| html << "<a href=\"#{link['url']}\" class=\"cl-footer__link\">#{e(link['label'])}</a>\n" }
      rescue JSON::ParserError
      end
      html << "</div>\n</div>\n"

      html << "<div class=\"cl-footer__right\">\n"
      html << "<span class=\"cl-footer__copy\">&copy; #{Time.now.year} #{e(site_name)}</span>\n"
      html << "</div>\n</div>\n"

      html << "<div class=\"cl-footer__text\">#{@s.footer_text}</div>\n" if @s.footer_text.present?

      html << "</div></footer>\n"
      html
    end

    # ── Shared helpers ──

    def stat_card(icon_svg, count, label)
      "<div class=\"cl-stat-card\">\n" \
      "<div class=\"cl-stat-card__top\">\n" \
      "<span class=\"cl-stat-card__icon\">#{icon_svg}</span>\n" \
      "<span class=\"cl-stat-card__label\">#{e(label)}</span>\n" \
      "</div>\n" \
      "<span class=\"cl-stat-card__value\" data-count=\"#{count}\">0</span>\n" \
      "</div>\n"
    end

    def app_badge(platform, url, custom_img, badge_h, badge_style)
      label = platform == :ios ? "App Store" : "Google Play"
      icon  = platform == :ios ? Icons::IOS_BADGE_SVG : Icons::ANDROID_BADGE_SVG
      style_class = case badge_style
                    when "pill" then "cl-app-badge--pill"
                    when "square" then "cl-app-badge--square"
                    else "cl-app-badge--rounded"
                    end

      if custom_img
        "<a href=\"#{url}\" class=\"cl-app-badge-img #{style_class}\" target=\"_blank\" rel=\"noopener noreferrer\">" \
        "<img src=\"#{custom_img}\" alt=\"#{label}\" style=\"height: #{badge_h}px; width: auto;\">" \
        "</a>\n"
      else
        "<a href=\"#{url}\" class=\"cl-app-badge #{style_class}\" target=\"_blank\" rel=\"noopener noreferrer\">" \
        "<span class=\"cl-app-badge__icon\">#{icon}</span>" \
        "<span class=\"cl-app-badge__label\">#{label}</span>" \
        "</a>\n"
      end
    end

    def theme_toggle
      "<button class=\"cl-theme-toggle\" aria-label=\"Toggle theme\">#{Icons::SUN_SVG}#{Icons::MOON_SVG}</button>\n"
    end

    def login_url
      "/login"
    end

    # ── Logo memoization ──

    def logo_dark_url
      return @logo_dark_url if defined?(@logo_dark_url)
      dark  = @s.logo_dark_url.presence
      light = @s.logo_light_url.presence
      if dark.nil? && light.nil?
        dark = @s.respond_to?(:logo_url) ? @s.logo_url.presence : nil
      end
      @logo_dark_url = dark
    end

    def logo_light_url
      return @logo_light_url if defined?(@logo_light_url)
      @logo_light_url = @s.logo_light_url.presence
    end

    def has_logo?
      logo_dark_url.present? || logo_light_url.present?
    end

    def logo_height
      @logo_height ||= (@s.logo_height rescue 30)
    end
  end
end
