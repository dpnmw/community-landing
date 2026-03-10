# frozen_string_literal: true

# name: community-landing
# about: Branded public landing page for unauthenticated visitors
# version: 2.6.1
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
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " \
            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " \
            "img-src 'self' #{base_url} data: https:; " \
            "font-src 'self' #{base_url} https://fonts.gstatic.com https://cdnjs.cloudflare.com; " \
            "media-src 'self' https:; " \
            "connect-src 'self' #{base_url}; " \
            "frame-src https://www.youtube.com https://www.youtube-nocookie.com; " \
            "frame-ancestors 'self'"
      response.headers["Content-Security-Policy"] = csp

      render html: html.html_safe, layout: false, content_type: "text/html"
    rescue => e
      bt = e.backtrace&.first(15)&.join("\n") rescue ""
      error_page = <<~HTML
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8"><title>Landing Page Error</title>
        <style>body{font-family:monospace;padding:2em;background:#111;color:#eee}
        pre{background:#1a1a2e;padding:1em;overflow-x:auto;border-radius:8px;font-size:13px}</style></head>
        <body>
        <h1 style="color:#e74c3c">CommunityLanding Error</h1>
        <p><strong>#{ERB::Util.html_escape(e.class)}</strong>: #{ERB::Util.html_escape(e.message)}</p>
        <pre>#{ERB::Util.html_escape(bt)}</pre>
        </body></html>
      HTML
      render html: error_page.html_safe, layout: false, content_type: "text/html", status: 500
    end

    private

    def load_file(*path_parts)
      File.read(File.join(CommunityLanding::PLUGIN_DIR, *path_parts))
    rescue StandardError => e
      "/* Error loading #{path_parts.last}: #{e.message} */"
    end
  end

  class ::CommunityLanding::AdminUploadsController < ::ApplicationController
    requires_plugin CommunityLanding::PLUGIN_NAME
    before_action :ensure_admin

    ALLOWED_UPLOAD_SETTINGS = %w[
      og_image_url favicon_url logo_dark_url logo_light_url footer_logo_url
      hero_background_image_url hero_image_url hero_image_urls about_image_url
      about_background_image_url ios_app_badge_image_url
      android_app_badge_image_url app_cta_image_url
      splits_background_image_url
      preloader_logo_dark_url preloader_logo_light_url
    ].freeze

    # POST /community-landing/admin/pin-upload
    def pin_upload
      upload = Upload.find(params[:upload_id])
      setting_name = params[:setting_name].to_s
      raise Discourse::InvalidParameters unless ALLOWED_UPLOAD_SETTINGS.include?(setting_name)

      key = "upload_pin_#{setting_name}"
      existing = PluginStore.get("community-landing", key)
      existing_ids = existing ? existing.to_s.split(",").map(&:to_i) : []
      existing_ids << upload.id unless existing_ids.include?(upload.id)
      PluginStore.set("community-landing", key, existing_ids.join(","))

      row = PluginStoreRow.find_by(plugin_name: "community-landing", key: key)
      UploadReference.ensure_exist!(upload_ids: existing_ids, target: row) if row

      render json: { success: true, upload_id: upload.id }
    end
  end

  Discourse::Application.routes.prepend do
    post "/community-landing/admin/pin-upload" =>
      "community_landing/admin_uploads#pin_upload",
      constraints: AdminConstraint.new

    root to: "community_landing/landing#index",
         constraints: ->(req) {
           req.cookies["_t"].blank? &&
             SiteSetting.community_landing_enabled
         }
  end
end
