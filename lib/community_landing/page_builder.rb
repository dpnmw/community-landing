# frozen_string_literal: true

module CommunityLanding
  class PageBuilder
    include Helpers

    SECTION_MAP = {
      "hero"          => :render_hero,
      "stats"         => :render_stats,
      "about"         => :render_about,
      "participation" => :render_participation,
      "topics"        => :render_topics,
      "groups"        => :render_groups,
      "app_cta"       => :render_app_cta,
    }.freeze

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
      html << render_preloader if (@s.preloader_enabled rescue false)
      if @s.dynamic_background_enabled
        html << "<div class=\"cl-orb-container\"><div class=\"cl-orb cl-orb--1\"></div><div class=\"cl-orb cl-orb--2\"></div></div>\n"
      end
      html << render_navbar

      # Reorderable sections
      order = (@s.section_order.presence rescue nil) || "hero|stats|about|participation|topics|groups|app_cta"
      order.split("|").map(&:strip).each do |section_id|
        method_name = SECTION_MAP[section_id]
        html << send(method_name) if method_name
      end

      html << render_footer_desc
      html << render_footer
      html << render_video_modal
      html << render_designer_badge
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
      base_url   = Discourse.base_url

      # SEO overrides
      meta_desc = (@s.meta_description.presence rescue nil) || @s.hero_subtitle
      og_image  = (@s.og_image_url.presence rescue nil) || og_logo
      favicon   = (@s.favicon_url.presence rescue nil)

      html = +""
      html << "<!DOCTYPE html>\n<html lang=\"en\""
      html << " data-scroll-anim=\"#{e(anim_class)}\""
      html << " data-parallax=\"#{@s.mouse_parallax_enabled}\""
      html << ">\n<head>\n"
      html << "<meta charset=\"UTF-8\">\n"
      body_font  = (@s.google_font_name.presence rescue nil) || "Outfit"
      title_font = (@s.title_font_name.presence rescue nil)
      font_families = [body_font]
      font_families << title_font if title_font && title_font != body_font
      font_params = font_families.map { |f| "family=#{f.gsub(' ', '+')}:wght@400;500;600;700;800;900" }.join("&")

      html << "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n"
      html << "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
      html << "<link href=\"https://fonts.googleapis.com/css2?#{font_params}&display=swap\" rel=\"stylesheet\">\n"
      icon_lib = (@s.icon_library rescue "none").to_s
      case icon_lib
      when "fontawesome"
        html << "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css\" crossorigin=\"anonymous\">\n"
      when "google"
        html << "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap\">\n"
      end
      html << "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\">\n"
      html << "<meta name=\"color-scheme\" content=\"dark light\">\n"

      # Favicon
      if favicon
        ftype = case favicon.to_s.split(".").last.downcase
                when "svg" then "image/svg+xml"
                when "png" then "image/png"
                else "image/x-icon"
                end
        html << "<link rel=\"icon\" type=\"#{ftype}\" href=\"#{e(favicon)}\">\n"
      end

      # Title & meta
      html << "<title>#{e(@s.hero_title)} | #{e(site_name)}</title>\n"
      html << "<meta name=\"description\" content=\"#{e(meta_desc)}\">\n"

      # Open Graph
      html << "<meta property=\"og:type\" content=\"website\">\n"
      html << "<meta property=\"og:title\" content=\"#{e(@s.hero_title)}\">\n"
      html << "<meta property=\"og:description\" content=\"#{e(meta_desc)}\">\n"
      html << "<meta property=\"og:url\" content=\"#{base_url}\">\n"
      html << "<meta property=\"og:site_name\" content=\"#{e(site_name)}\">\n"
      html << "<meta property=\"og:image\" content=\"#{og_image}\">\n" if og_image

      # Twitter card
      html << "<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
      html << "<meta name=\"twitter:title\" content=\"#{e(@s.hero_title)}\">\n"
      html << "<meta name=\"twitter:description\" content=\"#{e(meta_desc)}\">\n"
      html << "<meta name=\"twitter:image\" content=\"#{og_image}\">\n" if og_image

      html << "<link rel=\"canonical\" href=\"#{base_url}\">\n"

      # JSON-LD structured data
      if (@s.json_ld_enabled rescue true)
        html << "<script type=\"application/ld+json\">\n#{render_json_ld(site_name, base_url, og_logo)}\n</script>\n"
      end

      html << "<style>\n#{@css}\n</style>\n"
      html << @styles.color_overrides
      html << @styles.section_backgrounds

      # Font overrides
      font_css = +""
      font_css << ":root { --cl-font-body: \"#{body_font}\", sans-serif;"
      if title_font
        font_css << " --cl-font-title: \"#{title_font}\", serif;"
      else
        font_css << " --cl-font-title: var(--cl-font-body);"
      end
      font_css << " }\n"
      html << "<style>#{font_css}</style>\n"

      # Custom CSS (injected last so it can override everything)
      custom_css = @s.custom_css.presence rescue nil
      if custom_css
        html << "<style id=\"cl-custom-css\">\n#{custom_css}\n</style>\n"
      end

      html << "</head>\n"
      html
    end

    # ── PRELOADER ──

    def render_preloader
      logo_dark  = (@s.preloader_logo_dark_url.presence rescue nil) || logo_dark_url
      logo_light = (@s.preloader_logo_light_url.presence rescue nil) || logo_dark

      min_ms = (@s.preloader_min_duration rescue 800).to_i.clamp(0, 5000)

      html = +""
      html << "<div id=\"cl-preloader\" class=\"cl-preloader\">\n"
      html << "  <div class=\"cl-preloader__content\">\n"
      if logo_dark
        html << "    <img class=\"cl-preloader__logo cl-preloader__logo--dark\" src=\"#{e(logo_dark)}\" alt=\"\">\n"
        html << "    <img class=\"cl-preloader__logo cl-preloader__logo--light\" src=\"#{e(logo_light)}\" alt=\"\">\n"
      end
      html << "    <div class=\"cl-preloader__counter\" id=\"cl-preloader-pct\">0%</div>\n"
      html << "    <div class=\"cl-preloader__bar\"><div class=\"cl-preloader__bar-fill\" id=\"cl-preloader-bar\"></div></div>\n"
      html << "  </div>\n"
      html << "</div>\n"

      # Inline script — must run immediately, before any other resources
      html << "<script>\n"
      html << "(function() {\n"
      html << "  var el = document.getElementById('cl-preloader');\n"
      html << "  var pct = document.getElementById('cl-preloader-pct');\n"
      html << "  var bar = document.getElementById('cl-preloader-bar');\n"
      html << "  var minMs = #{min_ms};\n"
      html << "  var start = Date.now();\n"
      html << "  var current = 0;\n"
      html << "  var target = 0;\n"
      html << "  var done = false;\n"
      html << "\n"
      html << "  function update() {\n"
      html << "    if (current < target) {\n"
      html << "      current += (target - current) * 0.15;\n"
      html << "      if (target - current < 0.5) current = target;\n"
      html << "    }\n"
      html << "    var v = Math.round(current);\n"
      html << "    pct.textContent = v + '%';\n"
      html << "    bar.style.width = v + '%';\n"
      html << "    if (done && current >= 100) {\n"
      html << "      var elapsed = Date.now() - start;\n"
      html << "      var remaining = Math.max(0, minMs - elapsed);\n"
      html << "      setTimeout(function() {\n"
      html << "        el.classList.add('cl-preloader--hide');\n"
      html << "        setTimeout(function() { el.remove(); }, 500);\n"
      html << "      }, remaining);\n"
      html << "      return;\n"
      html << "    }\n"
      html << "    requestAnimationFrame(update);\n"
      html << "  }\n"
      html << "\n"
      html << "  // Track image loading\n"
      html << "  window.addEventListener('DOMContentLoaded', function() {\n"
      html << "    var imgs = document.querySelectorAll('img');\n"
      html << "    var total = imgs.length || 1;\n"
      html << "    var loaded = 0;\n"
      html << "    function tick() {\n"
      html << "      loaded++;\n"
      html << "      target = Math.min(95, Math.round((loaded / total) * 95));\n"
      html << "    }\n"
      html << "    imgs.forEach(function(img) {\n"
      html << "      if (img.complete) { tick(); return; }\n"
      html << "      img.addEventListener('load', tick);\n"
      html << "      img.addEventListener('error', tick);\n"
      html << "    });\n"
      html << "    if (imgs.length === 0) target = 95;\n"
      html << "  });\n"
      html << "\n"
      html << "  window.addEventListener('load', function() {\n"
      html << "    target = 100;\n"
      html << "    done = true;\n"
      html << "  });\n"
      html << "\n"
      html << "  requestAnimationFrame(update);\n"
      html << "})();\n"
      html << "</script>\n"
      html
    end

    # ── 1. NAVBAR ──

    def render_navbar
      site_name    = @s.title
      signin_label = @s.navbar_signin_label.presence || "Sign In"
      join_label   = @s.navbar_join_label.presence || "Get Started"
      navbar_bg    = hex(@s.navbar_bg_color) rescue nil
      navbar_border = @s.navbar_border_style rescue "none"

      nav_style_parts = []
      nav_style_parts << "--cl-nav-bg: #{navbar_bg}" if navbar_bg
      nav_style_parts << "--cl-nav-border: 1px #{navbar_border} var(--cl-border)" if navbar_border && navbar_border != "none"
      nav_style = nav_style_parts.any? ? " style=\"#{nav_style_parts.join('; ')}\"" : ""

      html = +""
      html << "<nav class=\"cl-navbar\" id=\"cl-navbar\"#{nav_style}>\n"
      if @s.scroll_progress_enabled
        html << "<div class=\"cl-progress-bar\"></div>\n"
      end
      html << "<div class=\"cl-navbar__inner\">\n"
      html << "<div class=\"cl-navbar__left\">"
      html << "<a href=\"/\" class=\"cl-navbar__brand\">"
      logo_accent = (@s.logo_use_accent_color rescue false)
      if has_logo?
        html << render_logo(logo_dark_url, logo_light_url, site_name, "cl-navbar__logo", logo_height, accent: logo_accent)
      else
        html << "<span class=\"cl-navbar__site-name\">#{e(site_name)}</span>"
      end
      html << "</a>\n</div>"

      signin_enabled = @s.navbar_signin_enabled rescue true
      join_enabled   = @s.navbar_join_enabled rescue true

      html << "<div class=\"cl-navbar__right\">"
      html << theme_toggle
      html << render_social_icons
      if signin_enabled
        html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--ghost\">#{button_with_icon(signin_label)}</a>\n"
      end
      if join_enabled
        html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--primary\">#{button_with_icon(join_label)}</a>\n"
      end
      html << "</div>"

      html << "<button class=\"cl-navbar__hamburger\" id=\"cl-hamburger\" aria-label=\"Toggle menu\"><span></span><span></span><span></span></button>\n"
      html << "</div></nav>\n"
      html << "<div class=\"cl-navbar__mobile-menu\" id=\"cl-nav-links\">\n"
      html << theme_toggle
      html << render_social_icons
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--ghost\">#{button_with_icon(signin_label)}</a>\n"
      html << "<a href=\"#{login_url}\" class=\"cl-navbar__link cl-btn--primary\">#{button_with_icon(join_label)}</a>\n"
      html << "</div>\n"
      html
    end

    # ── 2. HERO ──

    def render_hero
      hero_card   = @s.hero_card_enabled rescue true
      hero_img_first = @s.hero_image_first rescue false
      hero_bg_img = (@s.hero_background_image_url.presence rescue nil)
      hero_border = @s.hero_border_style rescue "none"
      hero_min_h  = @s.hero_min_height rescue 0
      site_name   = @s.title

      html = +""
      # Build hero section style: bg image on the section itself + border/min-height
      hero_style_parts = []
      hero_style_parts << "background-image: url('#{hero_bg_img}');" if hero_bg_img
      hero_style_parts << "border-bottom: 1px #{hero_border} var(--cl-border);" if hero_border.present? && hero_border != "none"
      hero_style_parts << "min-height: #{hero_min_h}px;" if hero_min_h.to_i > 0
      hero_attr = hero_style_parts.any? ? " style=\"#{hero_style_parts.join(' ')}\"" : ""
      hero_classes = +"cl-hero"
      hero_classes << " cl-hero--card" if hero_card
      hero_classes << " cl-hero--image-first" if hero_img_first
      html << "<section class=\"#{hero_classes}\" id=\"cl-hero\"#{hero_attr}>\n"

      html << "<div class=\"cl-hero__inner\">\n<div class=\"cl-hero__content\">\n"

      # Accent word: 0 = last word (default), N = Nth word (1-indexed)
      title_words = @s.hero_title.to_s.split(" ")
      accent_idx = (@s.hero_accent_word rescue 0).to_i
      if title_words.length > 1
        # Convert to 0-based index; 0 means last word
        target = accent_idx > 0 ? [accent_idx - 1, title_words.length - 1].min : title_words.length - 1
        before = title_words[0...target]
        accent = title_words[target]
        after  = title_words[(target + 1)..-1] || []
        parts = +""
        parts << "#{e(before.join(' '))} " if before.any?
        parts << "<span class=\"cl-hero__title-accent\">#{e(accent)}</span>"
        parts << " #{e(after.join(' '))}" if after.any?
        html << "<h1 class=\"cl-hero__title\"#{title_style(:hero_title_size)}>#{parts}</h1>\n"
      else
        html << "<h1 class=\"cl-hero__title\"#{title_style(:hero_title_size)}><span class=\"cl-hero__title-accent\">#{e(@s.hero_title)}</span></h1>\n"
      end

      html << "<p class=\"cl-hero__subtitle\">#{e(@s.hero_subtitle)}</p>\n"

      primary_on      = @s.hero_primary_button_enabled rescue true
      secondary_on    = @s.hero_secondary_button_enabled rescue true
      primary_label   = @s.hero_primary_button_label.presence || "View Latest Topics"
      primary_url     = @s.hero_primary_button_url.presence || "/latest"
      secondary_label = @s.hero_secondary_button_label.presence || "Explore Our Spaces"
      secondary_url   = @s.hero_secondary_button_url.presence || login_url

      if primary_on || secondary_on
        html << "<div class=\"cl-hero__actions\">\n"
        html << "<a href=\"#{primary_url}\" class=\"cl-btn cl-btn--primary cl-btn--lg\">#{button_with_icon(primary_label)}</a>\n" if primary_on
        html << "<a href=\"#{secondary_url}\" class=\"cl-btn cl-btn--ghost cl-btn--lg\">#{button_with_icon(secondary_label)}</a>\n" if secondary_on
        html << "</div>\n"
      end

      # Hero creators (top 3 with gold/silver/bronze ranks)
      contributors = @data[:contributors]
      if (@s.contributors_enabled rescue false) && contributors&.any?
        top3 = contributors.first(3)
        rank_colors = ["#FFD700", "#C0C0C0", "#CD7F32"]
        creators_title = @s.contributors_title.presence || "Top Creators"
        show_title = @s.contributors_title_enabled rescue true
        count_label = @s.contributors_count_label.presence || ""
        show_count_label = @s.contributors_count_label_enabled rescue true
        alignment = @s.contributors_alignment rescue "center"
        pill_max_w = @s.contributors_pill_max_width rescue 340

        align_class = alignment == "left" ? " cl-hero__creators--left" : ""
        html << "<div class=\"cl-hero__creators#{align_class}\">\n"
        html << "<h3 class=\"cl-hero__creators-title\">#{e(creators_title)}</h3>\n" if show_title
        top3.each_with_index do |user, idx|
          avatar_url     = user.avatar_template.to_s.gsub("{size}", "120")
          activity_count = user.attributes["post_count"].to_i rescue 0
          rank_color     = rank_colors[idx]
          count_prefix = show_count_label && count_label.present? ? "#{e(count_label)} " : ""
          pill_style_parts = ["--rank-color: #{rank_color}"]
          pill_style_parts << "max-width: #{pill_max_w}px" if pill_max_w.to_i != 340
          html << "<a href=\"#{login_url}\" class=\"cl-creator-pill cl-creator-pill--rank-#{idx + 1}\" style=\"#{pill_style_parts.join('; ')}\">\n"
          html << "<span class=\"cl-creator-pill__rank\">Ranked ##{idx + 1}</span>\n"
          html << "<img src=\"#{avatar_url}\" alt=\"#{e(user.username)}\" class=\"cl-creator-pill__avatar\" loading=\"lazy\">\n"
          html << "<div class=\"cl-creator-pill__info\">\n"
          html << "<span class=\"cl-creator-pill__name\">@#{e(user.username)}</span>\n"
          html << "<span class=\"cl-creator-pill__count\">#{count_prefix}#{activity_count}</span>\n"
          html << "</div>\n"
          html << "</a>\n"
        end
        html << "</div>\n"
      end

      html << "</div>\n"

      hero_multi = (@s.hero_multiple_images_enabled rescue false)
      if hero_multi
        hero_image_urls_raw = (@s.hero_image_urls.presence rescue nil)
      else
        hero_image_urls_raw = (@s.hero_image_url.presence rescue nil)
      end
      hero_video = (@s.hero_video_url.presence rescue nil)
      blur_attr = (@s.hero_video_blur_on_hover rescue true) ? " data-blur-hover=\"true\"" : ""
      has_images = false

      if hero_image_urls_raw
        if hero_multi
          urls = hero_image_urls_raw.split(/[|\n\r]+/).map(&:strip).reject(&:empty?).first(5)
        else
          urls = [hero_image_urls_raw.strip]
        end
        if urls.any?
          has_images = true
          img_max_h = @s.hero_image_max_height rescue 500
          img_weight = (@s.hero_image_weight rescue 1).to_i.clamp(1, 3)
          img_style = img_weight > 1 ? " style=\"flex: #{img_weight}\"" : ""
          html << "<div class=\"cl-hero__image\"#{img_style} data-hero-images=\"#{e(urls.to_json)}\">\n"
          html << "<img src=\"#{urls.first}\" alt=\"#{e(site_name)}\" class=\"cl-hero__image-img\" style=\"max-height: #{img_max_h}px;\">\n"
          if hero_video
            html << "<button class=\"cl-hero-play\" data-video-url=\"#{e(hero_video)}\"#{blur_attr} aria-label=\"Play video\">"
            html << "<span class=\"cl-hero-play__icon\">#{Icons::PLAY_SVG}</span>"
            html << "</button>\n"
          end
          html << "</div>\n"
        end
      end

      if hero_video && !has_images
        html << "<div class=\"cl-hero__image cl-hero__image--video-only\">\n"
        html << "<button class=\"cl-hero-play\" data-video-url=\"#{e(hero_video)}\"#{blur_attr} aria-label=\"Play video\">"
        html << "<span class=\"cl-hero-play__icon\">#{Icons::PLAY_SVG}</span>"
        html << "</button>\n"
        html << "</div>\n"
      end

      html << "</div></section>\n"
      html
    end

    # ── 3. STATS ──

    def render_stats
      return "" unless (@s.stats_enabled rescue true)

      stats       = @data[:stats]
      stats_title = @s.stats_title.presence || "Premium Stats"
      show_title  = @s.stats_title_enabled rescue true
      border      = @s.stats_border_style rescue "none"
      min_h       = @s.stats_min_height rescue 0
      icon_shape  = @s.stat_icon_shape rescue "circle"
      card_style  = @s.stat_card_style rescue "rectangle"
      round_nums  = @s.stat_round_numbers rescue false
      show_labels = @s.stat_labels_enabled rescue true

      html = +""
      html << "<section class=\"cl-stats cl-anim\" id=\"cl-stats-row\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\"#{title_style(:stats_title_size)}>#{button_with_icon(stats_title)}</h2>\n" if show_title
      html << "<div class=\"cl-stats__grid\">\n"
      html << stat_card(Icons::STAT_MEMBERS_SVG, stats[:members], @s.stat_members_label, icon_shape, card_style, round_nums, show_labels)
      html << stat_card(Icons::STAT_TOPICS_SVG,  stats[:topics],  @s.stat_topics_label,  icon_shape, card_style, round_nums, show_labels)
      html << stat_card(Icons::STAT_POSTS_SVG,   stats[:posts],   @s.stat_posts_label,   icon_shape, card_style, round_nums, show_labels)
      html << stat_card(Icons::STAT_LIKES_SVG,   stats[:likes],   @s.stat_likes_label,   icon_shape, card_style, round_nums, show_labels)
      html << stat_card(Icons::STAT_CHATS_SVG,   stats[:chats],   @s.stat_chats_label,   icon_shape, card_style, round_nums, show_labels)
      html << "</div>\n</div></section>\n"
      html
    end

    # ── 4. ABOUT — split layout: image left on gradient, text right ──

    def render_about
      return "" unless @s.about_enabled

      about_body       = @s.about_body.presence || ""
      about_image      = @s.about_image_url.presence
      about_role       = @s.about_role.presence || @s.title
      about_heading_on = @s.about_heading_enabled rescue true
      about_heading    = @s.about_heading.presence || "About Community"
      about_bg_img     = @s.about_background_image_url.presence
      border           = @s.about_border_style rescue "none"
      min_h            = @s.about_min_height rescue 0

      html = +""
      html << "<section class=\"cl-about cl-anim\" id=\"cl-about\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<div class=\"cl-about__card\">\n"

      # Left side — image on gradient background
      html << "<div class=\"cl-about__left\">\n"
      if about_image
        html << "<img src=\"#{about_image}\" alt=\"#{e(@s.about_title)}\" class=\"cl-about__image\">\n"
      end
      html << "</div>\n"

      # Right side — text content
      html << "<div class=\"cl-about__right\">\n"
      html << "<h2 class=\"cl-about__heading\"#{title_style(:about_title_size)}>#{button_with_icon(about_heading)}</h2>\n" if about_heading_on
      html << Icons::QUOTE_SVG
      html << "<div class=\"cl-about__body\">#{about_body}</div>\n" if about_body.present?
      html << "<div class=\"cl-about__meta\">\n"
      html << "<div class=\"cl-about__meta-text\">\n"
      html << "<span class=\"cl-about__author\">#{e(@s.about_title)}</span>\n"
      html << "<span class=\"cl-about__role\">#{e(about_role)}</span>\n"
      html << "</div></div>\n"
      html << "</div>\n"

      html << "</div>\n</div></section>\n"
      html
    end

    # ── 5b. PARTICIPATION ──

    def render_participation
      return "" unless (@s.participation_enabled rescue true)

      contributors = @data[:contributors]
      hero_contributors_on = (@s.contributors_enabled rescue false)

      if hero_contributors_on
        # Hero shows top 3, participation shows 4–10
        return "" unless contributors&.length.to_i > 3
        candidates = contributors[3..9] || []
      else
        # Hero contributors disabled, participation shows 1–10
        return "" unless contributors&.any?
        candidates = contributors[0..9] || []
      end

      bio_max = (@s.participation_bio_max_length rescue 150).to_i
      users_with_bio = candidates.select { |u| u.user_profile&.bio_excerpt.present? rescue false }
      return "" if users_with_bio.empty?

      show_title  = @s.participation_title_enabled rescue true
      title_text  = @s.participation_title.presence || "Participation"
      border      = @s.participation_border_style rescue "none"
      min_h       = @s.participation_min_height rescue 0

      topics_label = @s.participation_topics_label.presence || "Topics"
      posts_label  = @s.participation_posts_label.presence || "Posts"
      likes_label  = @s.participation_likes_label.presence || "Likes"

      html = +""
      html << "<section class=\"cl-participation cl-anim\" id=\"cl-participation\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\"#{title_style(:participation_title_size)}>#{button_with_icon(title_text)}</h2>\n" if show_title
      stagger_class = @s.staggered_reveal_enabled ? " cl-stagger" : ""
      html << "<div class=\"cl-participation__grid#{stagger_class}\">\n"

      users_with_bio.each do |user|
        avatar_url    = user.avatar_template.to_s.gsub("{size}", "120")
        bio_raw       = user.user_profile.bio_excerpt.to_s
        bio_text      = bio_raw.length > bio_max ? "#{bio_raw[0...bio_max]}..." : bio_raw
        join_date     = user.created_at.strftime("Joined %b %Y") rescue "Member"
        location      = (user.user_profile&.location.presence rescue nil)
        meta_line     = location ? "#{join_date} · #{e(location)}" : join_date
        topic_count   = (user.user_stat&.topic_count.to_i rescue 0)
        post_count    = (user.user_stat&.post_count.to_i rescue 0)
        likes_received = (user.user_stat&.likes_received.to_i rescue 0)

        html << "<div class=\"cl-participation-card\">\n"
        html << "<div class=\"cl-participation-card__header\">\n"
        html << "<div class=\"cl-participation-card__quote\">#{Icons::QUOTE_SVG}</div>\n"
        html << "<p class=\"cl-participation-card__bio\">#{e(bio_text)}</p>\n"
        html << "</div>\n"
        html << "<div class=\"cl-participation-card__stats\">\n"
        html << participation_stat(topic_count, topics_label, Icons::PART_TOPICS_SVG)
        html << participation_stat(post_count, posts_label, Icons::PART_POSTS_SVG)
        html << participation_stat(likes_received, likes_label, Icons::PART_LIKES_SVG)
        html << "</div>\n"
        html << "<div class=\"cl-participation-card__footer\">\n"
        html << "<img src=\"#{avatar_url}\" alt=\"#{e(user.username)}\" class=\"cl-participation-card__avatar\" loading=\"lazy\">\n"
        html << "<div class=\"cl-participation-card__meta\">\n"
        html << "<span class=\"cl-participation-card__name\">@#{e(user.username)}</span>\n"
        html << "<span class=\"cl-participation-card__count\">#{e(meta_line)}</span>\n"
        html << "</div>\n"
        html << "</div>\n"
        html << "</div>\n"
      end

      html << "</div>\n</div></section>\n"
      html
    end

    # ── 5. TRENDING DISCUSSIONS ──

    def render_topics
      topics = @data[:topics]
      return "" unless @s.topics_enabled && topics&.any?

      border = @s.topics_border_style rescue "none"
      min_h  = @s.topics_min_height rescue 0

      show_title = @s.topics_title_enabled rescue true

      html = +""
      html << "<section class=\"cl-topics cl-anim\" id=\"cl-topics\"#{section_style(border, min_h)}><div class=\"cl-container\">\n"
      html << "<h2 class=\"cl-section-title\"#{title_style(:topics_title_size)}>#{button_with_icon(@s.topics_title)}</h2>\n" if show_title
      stagger_class = @s.staggered_reveal_enabled ? " cl-stagger" : ""
      html << "<div class=\"cl-topics__grid#{stagger_class}\">\n"

      topics.each do |topic|
        topic_likes   = topic.like_count rescue 0
        topic_replies = topic.posts_count.to_i

        html << "<a href=\"#{login_url}\" class=\"cl-topic-card\">\n"
        if topic.category
          html << "<span class=\"cl-topic-card__cat\">#{e(topic.category.name)}</span>\n"
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

    # ── 7. COMMUNITY SPACES + FAQ ──

    def render_groups
      groups  = @data[:groups]
      faq_on  = (@s.faq_enabled rescue false)
      has_groups = @s.groups_enabled && groups&.any?

      return "" unless has_groups || faq_on

      show_title = @s.groups_title_enabled rescue true
      show_desc  = @s.groups_show_description rescue true
      desc_max   = (@s.groups_description_max_length rescue 100).to_i

      min_h = @s.splits_min_height rescue 0

      html = +""
      groups_bg_img = (@s.splits_background_image_url.presence rescue nil)
      section_style_parts = []
      section_style_parts << "background: url('#{groups_bg_img}') center/cover no-repeat;" if groups_bg_img
      section_style_parts << "min-height: #{min_h}px;" if min_h.to_i > 0
      section_attr = section_style_parts.any? ? " style=\"#{section_style_parts.join(' ')}\"" : ""
      html << "<section class=\"cl-spaces cl-anim\" id=\"cl-splits\"#{section_attr}><div class=\"cl-container\">\n"

      if has_groups && faq_on
        # ── Split layout: both titles at same level ──
        html << "<div class=\"cl-spaces__split\">\n"

        # Left column: Groups
        html << "<div class=\"cl-spaces__col\">\n"
        html << "<h2 class=\"cl-section-title\"#{title_style(:groups_title_size)}>#{button_with_icon(@s.groups_title)}</h2>\n" if show_title
        html << render_groups_grid(groups, show_desc, desc_max)
        html << "</div>\n"

        # Right column: FAQ
        html << "<div class=\"cl-spaces__col\">\n"
        html << render_faq
        html << "</div>\n"

        html << "</div>\n"
      elsif has_groups
        # ── Groups only (full width) ──
        html << "<h2 class=\"cl-section-title\"#{title_style(:groups_title_size)}>#{button_with_icon(@s.groups_title)}</h2>\n" if show_title
        html << "<div class=\"cl-spaces__full\">\n"
        html << render_groups_grid(groups, show_desc, desc_max)
        html << "</div>\n"
      else
        # ── FAQ only (full width) ──
        html << render_faq
      end

      html << "</div></section>\n"
      html
    end

    def render_groups_grid(groups, show_desc, desc_max)
      stagger_class = @s.staggered_reveal_enabled ? " cl-stagger" : ""
      html = +""
      html << "<div class=\"cl-spaces__grid#{stagger_class}\">\n"

      groups.each do |group|
        display_name = group.full_name.presence || group.name.tr("_-", " ").gsub(/\b\w/, &:upcase)
        hue   = group.name.bytes.sum % 360
        sat   = 55 + (group.name.bytes.first.to_i % 15)
        light = 45 + (group.name.bytes.last.to_i % 12)
        icon_color = "hsl(#{hue}, #{sat}%, #{light}%)"

        desc_text = nil
        if show_desc
          raw_bio = (group.bio_raw.to_s.strip rescue "")
          if raw_bio.present?
            plain = raw_bio.gsub(/<[^>]*>/, "").strip
            desc_text = plain.length > desc_max ? "#{plain[0...desc_max]}..." : plain
          end
        end

        html << "<a href=\"#{login_url}\" class=\"cl-space-card\" style=\"--space-color: #{icon_color}\">\n"
        html << "<div class=\"cl-space-card__icon\">"
        if group.flair_url.present?
          html << "<img src=\"#{group.flair_url}\" alt=\"\">"
        else
          html << "<span class=\"cl-space-card__letter\">#{group.name[0].upcase}</span>"
        end
        html << "</div>\n"
        html << "<div class=\"cl-space-card__body\">\n"
        html << "<span class=\"cl-space-card__name\">#{e(display_name)}</span>\n"
        html << "<span class=\"cl-space-card__sub\">#{group.user_count} members</span>\n"
        html << "<p class=\"cl-space-card__desc\">#{e(desc_text)}</p>\n" if desc_text
        html << "</div>\n"
        html << "</a>\n"
      end

      html << "</div>\n"
      html
    end

    def render_faq
      faq_title_on = @s.faq_title_enabled rescue true
      faq_title    = @s.faq_title.presence || "Frequently Asked Questions"
      faq_raw      = @s.faq_items.presence rescue nil

      html = +""
      html << "<h2 class=\"cl-section-title\"#{title_style(:faq_title_size)}>#{button_with_icon(faq_title)}</h2>\n" if faq_title_on
      html << "<div class=\"cl-faq\">\n"

      if faq_raw
        begin
          items = JSON.parse(faq_raw)
          items.each do |item|
            q = item["q"].to_s
            a = item["a"].to_s
            next if q.blank?
            html << "<details class=\"cl-faq__card\" data-faq-exclusive>\n"
            html << "<summary class=\"cl-faq__question\">#{e(q)}</summary>\n"
            html << "<div class=\"cl-faq__answer\">#{a}</div>\n"
            html << "</details>\n"
          end
        rescue JSON::ParserError
          # Invalid JSON — silently skip
        end
      end

      html << "</div>\n"
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
      html << "<h2 class=\"cl-app-cta__headline\"#{title_style(:app_cta_title_size)}>#{button_with_icon(@s.app_cta_headline)}</h2>\n"
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
      footer_accent = (@s.logo_use_accent_color rescue false)
      if flogo
        html << logo_img(flogo, site_name, "cl-footer__logo", logo_height, accent: footer_accent)
      elsif has_logo?
        html << render_logo(logo_dark_url, logo_light_url, site_name, "cl-footer__logo", logo_height, accent: footer_accent)
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

    def stat_card(icon_svg, count, label, icon_shape = "circle", card_style = "rectangle", round_numbers = false, show_label = true)
      shape_class = icon_shape == "rounded" ? "cl-stat-icon--rounded" : "cl-stat-icon--circle"
      style_class = "cl-stat-card--#{card_style}"
      round_attr = round_numbers ? ' data-round="true"' : ''
      label_html = show_label ? "<span class=\"cl-stat-card__label\">#{e(label)}</span>\n" : ""
      "<div class=\"cl-stat-card #{style_class}\">\n" \
      "<div class=\"cl-stat-card__icon-wrap #{shape_class}\">#{icon_svg}</div>\n" \
      "<div class=\"cl-stat-card__text\">\n" \
      "<span class=\"cl-stat-card__value\" data-count=\"#{count}\"#{round_attr}>0</span>\n" \
      "#{label_html}" \
      "</div>\n" \
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

    def render_video_modal
      has_video = (@s.hero_video_url.presence rescue nil)
      return "" unless has_video

      html = +""
      html << "<div class=\"cl-video-modal\" id=\"cl-video-modal\">\n"
      html << "<div class=\"cl-video-modal__backdrop\"></div>\n"
      html << "<div class=\"cl-video-modal__content\">\n"
      html << "<button class=\"cl-video-modal__close\" aria-label=\"Close video\">&times;</button>\n"
      html << "<div class=\"cl-video-modal__player\" id=\"cl-video-player\"></div>\n"
      html << "</div>\n"
      html << "</div>\n"
      html
    end

    def render_designer_badge
      logo_path = File.join(CommunityLanding::PLUGIN_DIR, "assets", "images", "badge.png")

      begin
        logo_b64 = Base64.strict_encode64(File.binread(logo_path))
      rescue StandardError
        return ""
      end

      html = +""
      html << "<div class=\"cl-designer-badge\" id=\"cl-designer-badge\">\n"
      html << "  <div class=\"cl-designer-badge__tooltip\" id=\"cl-designer-tooltip\">\n"
      html << "    <a href=\"https://www.dpnmw.com\" target=\"_blank\" rel=\"noopener noreferrer\">Interface By DPN MW <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"8\" height=\"8\" viewBox=\"0 -960 960 960\" fill=\"currentColor\" style=\"vertical-align:middle;margin-left:2px\"><path d=\"M186.67-120q-27 0-46.84-19.83Q120-159.67 120-186.67v-586.66q0-27 19.83-46.84Q159.67-840 186.67-840H466v66.67H186.67v586.66h586.66V-466H840v279.33q0 27-19.83 46.84Q800.33-120 773.33-120H186.67ZM384-336.67 337.33-384l389.34-389.33h-194V-840H840v307.33h-66.67V-726L384-336.67Z\"/></svg></a>\n"
      html << "  </div>\n"
      html << "  <img class=\"cl-designer-badge__logo\" src=\"data:image/png;base64,#{logo_b64}\" alt=\"Designer\">\n"
      html << "</div>\n"
      html
    end

    def render_social_icons
      icons = {
        social_twitter_url:   Icons::SOCIAL_TWITTER_SVG,
        social_facebook_url:  Icons::SOCIAL_FACEBOOK_SVG,
        social_instagram_url: Icons::SOCIAL_INSTAGRAM_SVG,
        social_youtube_url:   Icons::SOCIAL_YOUTUBE_SVG,
        social_tiktok_url:    Icons::SOCIAL_TIKTOK_SVG,
        social_github_url:    Icons::SOCIAL_GITHUB_SVG,
      }

      links = +""
      icons.each do |setting, svg|
        url = (@s.public_send(setting).presence rescue nil)
        next unless url
        links << "<a href=\"#{e(url)}\" class=\"cl-social-icon\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"#{setting.to_s.split('_')[1].capitalize}\">#{svg}</a>\n"
      end
      return "" if links.empty?

      "<div class=\"cl-social-icons\">#{links}</div>\n"
    end

    def theme_toggle
      "<button class=\"cl-theme-toggle\" aria-label=\"Toggle theme\">#{Icons::SUN_SVG}#{Icons::MOON_SVG}</button>\n"
    end

    def render_json_ld(site_name, base_url, logo_url)
      org = { "@type" => "Organization", "name" => site_name, "url" => base_url }
      org["logo"] = logo_url if logo_url
      website = { "@type" => "WebSite", "name" => site_name, "url" => base_url }
      { "@context" => "https://schema.org", "@graph" => [org, website] }.to_json
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

    def title_style(setting_name)
      size = (@s.public_send(setting_name) rescue 0).to_i
      size > 0 ? " style=\"font-size: #{size}px\"" : ""
    end

    # Render an icon element based on the chosen icon library
    # size is optional pixel size (renders as inline style)
    def icon_tag(name, extra_class = nil, size = nil)
      lib = (@s.icon_library rescue "none").to_s
      cls = extra_class ? " #{extra_class}" : ""
      style = size ? " style=\"font-size: #{size.to_i}px\"" : ""
      case lib
      when "fontawesome"
        "<i class=\"fa-solid fa-#{e(name)}#{cls}\"#{style}></i>"
      when "google"
        "<span class=\"material-symbols-outlined#{cls}\"#{style}>#{e(name)}</span>"
      else
        nil
      end
    end

    # Parse "icon | Label" or "icon | size | Label" from a raw label string.
    # Returns [icon_name, size_or_nil, label] or nil if no icon found.
    def parse_icon_label(raw)
      parts = raw.split("|").map(&:strip)
      return nil if parts.length < 2

      if parts.length >= 3
        # "icon | size | Label" or "Label | size | icon"
        if parts[0].match?(/\A[\w-]+\z/) && parts[0].length < 30
          size = parts[1].match?(/\A\d+\z/) ? parts[1].to_i : nil
          label = size ? parts[2..].join(" | ") : parts[1..].join(" | ")
          return [parts[0], size, label]
        elsif parts[-1].match?(/\A[\w-]+\z/) && parts[-1].length < 30
          size = parts[-2].match?(/\A\d+\z/) ? parts[-2].to_i : nil
          label = size ? parts[0..-3].join(" | ") : parts[0..-2].join(" | ")
          return [parts[-1], size, label, :after]
        end
      else
        # "icon | Label" or "Label | icon"
        left, right = parts
        if left.match?(/\A[\w-]+\z/) && left.length < 30
          return [left, nil, right]
        elsif right.match?(/\A[\w-]+\z/) && right.length < 30
          return [right, nil, left, :after]
        end
      end
      nil
    end

    def participation_stat(count, raw_label, default_svg)
      lib = (@s.icon_library rescue "none").to_s
      if lib != "none" && raw_label.include?("|")
        parsed = parse_icon_label(raw_label)
        if parsed
          icon_html = icon_tag(parsed[0], "cl-participation-stat__icon", parsed[1])
          label = parsed[2]
        else
          icon_html = default_svg
          label = raw_label
        end
      else
        icon_html = default_svg
        label = raw_label
      end
      "<div class=\"cl-participation-stat\">" \
        "<span class=\"cl-participation-stat__value\">#{icon_html}#{count}</span>" \
        "<span class=\"cl-participation-stat__label\">#{e(label)}</span>" \
        "</div>\n"
    end

    def button_with_icon(raw_label)
      lib = (@s.icon_library rescue "none").to_s
      return e(raw_label) unless lib != "none" && raw_label.include?("|")

      parsed = parse_icon_label(raw_label)
      return e(raw_label) unless parsed

      icon = icon_tag(parsed[0], nil, parsed[1])
      label = e(parsed[2])
      parsed[3] == :after ? "#{label} #{icon}" : "#{icon} #{label}"
    end
  end
end
