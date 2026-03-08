# frozen_string_literal: true

module CommunityLanding
  module Helpers
    def e(text)
      ERB::Util.html_escape(text.to_s)
    end

    # Normalize color values — Discourse color picker stores without #
    def hex(val)
      return nil if val.blank?
      v = val.to_s.delete("#")
      v.present? ? "##{v}" : nil
    end

    def hex_to_rgb(hex_val)
      hex_val = hex_val.to_s.gsub("#", "")
      return "0, 0, 0" unless hex_val.match?(/\A[0-9a-fA-F]{6}\z/)
      "#{hex_val[0..1].to_i(16)}, #{hex_val[2..3].to_i(16)}, #{hex_val[4..5].to_i(16)}"
    end

    # Inline style for section border + min-height (no background — handled by CSS)
    def section_style(border_style, min_height = 0)
      parts = []
      parts << "border-bottom: 1px #{border_style} var(--cl-border);" if border_style.present? && border_style != "none"
      parts << "min-height: #{min_height}px;" if min_height.to_i > 0
      parts.any? ? " style=\"#{parts.join(' ')}\"" : ""
    end

    def logo_img(url, alt, css_class, height, accent: false)
      if accent
        "<span class=\"#{css_class} cl-logo--accent\" style=\"height: #{height}px; -webkit-mask-image: url('#{url}'); mask-image: url('#{url}');\"><img src=\"#{url}\" alt=\"#{e(alt)}\" style=\"height: #{height}px; visibility: hidden;\"></span>"
      else
        "<img src=\"#{url}\" alt=\"#{e(alt)}\" class=\"#{css_class}\" style=\"height: #{height}px;\">"
      end
    end

    def render_logo(dark_url, light_url, site_name, base_class, height, accent: false)
      if dark_url && light_url
        logo_img(dark_url, site_name, "#{base_class} cl-logo--dark", height, accent: accent) +
        logo_img(light_url, site_name, "#{base_class} cl-logo--light", height, accent: accent)
      else
        logo_img(dark_url || light_url, site_name, base_class, height, accent: accent)
      end
    end
  end
end
