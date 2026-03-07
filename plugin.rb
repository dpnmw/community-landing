# frozen_string_literal: true

# name: community-landing
# about: Branded public landing page for unauthenticated visitors
# version: 2.3.0
# authors: DPN MEDiA WORKS
# url: https://github.com/dpnmw/community-landing
# meta_url: https://dpnmediaworks.com

enabled_site_setting :community_landing_enabled

register_asset "stylesheets/community_landing/admin.css", :admin

after_initialize do
  module ::CommunityLanding
    PLUGIN_NAME = "community-landing"
    PLUGIN_DIR  = File.expand_path("..", __FILE__)
  end

  require_relative "lib/community_landing/icons"
  require_relative "lib/community_landing/helpers"
  require_relative "lib/community_landing/data_fetcher"
  require_relative "lib/community_landing/style_builder"
  require_relative "lib/community_landing/page_builder"

  class ::CommunityLanding::LandingController < ::ApplicationController
    requires_plugin CommunityLanding::PLUGIN_NAME

    skip_before_action :check_xhr
    skip_before_action :redirect_to_login_if_required
    skip_before_action :preload_json, raise: false
    content_security_policy false

    def index
      data = CommunityLanding::DataFetcher.fetch

      css = load_file("assets", "stylesheets", "community_landing", "landing.css")
      js  = load_file("assets", "javascripts", "community_landing", "landing.js")

      html = CommunityLanding::PageBuilder.new(data: data, css: css, js: js).build

      base_url = Discourse.base_url
      csp = "default-src 'self' #{base_url}; " \
            "script-src 'self' 'unsafe-inline'; " \
            "style-src 'self' 'unsafe-inline'; " \
            "img-src 'self' #{base_url} data: https:; " \
            "font-src 'self' #{base_url} https://fonts.gstatic.com; " \
            "media-src 'self' https:; " \
            "frame-src https://www.youtube.com https://www.youtube-nocookie.com; " \
            "frame-ancestors 'self'"
      response.headers["Content-Security-Policy"] = csp

      render html: html.html_safe, layout: false, content_type: "text/html"
    end

    private

    def load_file(*path_parts)
      File.read(File.join(CommunityLanding::PLUGIN_DIR, *path_parts))
    rescue StandardError => e
      "/* Error loading #{path_parts.last}: #{e.message} */"
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
