# frozen_string_literal: true

module CommunityLanding
  class DataFetcher
    def self.fetch
      s = SiteSetting
      data = {}

      # Top contributors
      data[:contributors] = begin
        if s.contributors_enabled || (s.participation_enabled rescue true)
          User
            .joins(:posts)
            .includes(:user_profile)
            .where(posts: { created_at: s.contributors_days.days.ago.. })
            .where.not(username: %w[system discobot])
            .where(active: true, staged: false)
            .group("users.id")
            .order("COUNT(posts.id) DESC")
            .limit(s.contributors_count)
            .select("users.*, COUNT(posts.id) AS post_count")
        end
      rescue => e
        Rails.logger.warn("[CommunityLanding] contributors fetch failed: #{e.message}")
        nil
      end

      # Public groups — optionally filtered by selected names
      data[:groups] = begin
        if s.groups_enabled
          selected = s.groups_selected.presence
          scope = Group
            .where(visibility_level: Group.visibility_levels[:public])
            .where(automatic: false)

          if selected
            names = selected.split("|").map(&:strip).reject(&:empty?)
            scope = scope.where(name: names) if names.any?
          end

          scope.limit(s.groups_count)
        end
      rescue => e
        Rails.logger.warn("[CommunityLanding] groups fetch failed: #{e.message}")
        nil
      end

      # Trending topics
      data[:topics] = begin
        if s.topics_enabled
          Topic
            .listable_topics
            .where(visible: true)
            .where("topics.created_at > ?", 30.days.ago)
            .order(posts_count: :desc)
            .limit(s.topics_count)
            .includes(:category, :user)
        end
      rescue => e
        Rails.logger.warn("[CommunityLanding] topics fetch failed: #{e.message}")
        nil
      end

      # Aggregate stats
      chat_count = 0
      begin
        chat_count = Chat::Message.count if defined?(Chat::Message)
      rescue
        chat_count = 0
      end

      data[:stats] = begin
        {
          members: User.real.count,
          topics:  Topic.listable_topics.count,
          posts:   Post.where(user_deleted: false).count,
          likes:   Post.sum(:like_count),
          chats:   chat_count,
        }
      rescue => e
        Rails.logger.warn("[CommunityLanding] stats fetch failed: #{e.message}")
        { members: 0, topics: 0, posts: 0, likes: 0, chats: 0 }
      end

      data
    end
  end
end
