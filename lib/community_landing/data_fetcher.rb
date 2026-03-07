# frozen_string_literal: true

module CommunityLanding
  class DataFetcher
    def self.fetch
      s = SiteSetting
      data = {}

      # Top contributors
      data[:contributors] = if s.contributors_enabled
        User
          .joins(:posts)
          .where(posts: { created_at: s.contributors_days.days.ago.. })
          .where.not(username: %w[system discobot])
          .where(active: true, staged: false)
          .group("users.id")
          .order("COUNT(posts.id) DESC")
          .limit(s.contributors_count)
          .select("users.*, COUNT(posts.id) AS post_count")
      end

      # Public groups — optionally filtered by selected names
      data[:groups] = if s.groups_enabled
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

      # Trending topics
      data[:topics] = if s.topics_enabled
        Topic
          .listable_topics
          .where(visible: true)
          .where("topics.created_at > ?", 30.days.ago)
          .order(posts_count: :desc)
          .limit(s.topics_count)
          .includes(:category, :user)
      end

      # Aggregate stats
      chat_count = 0
      begin
        chat_count = Chat::Message.count if defined?(Chat::Message)
      rescue
        chat_count = 0
      end

      data[:stats] = {
        members: User.real.count,
        topics:  Topic.listable_topics.count,
        posts:   Post.where(user_deleted: false).count,
        likes:   Post.sum(:like_count),
        chats:   chat_count,
      }

      data
    end
  end
end
