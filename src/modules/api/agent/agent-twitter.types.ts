// Интерфейс для объекта с информацией о твите
export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  conversation_id: string;
  edit_history_tweet_ids: string[];
  /** ID пользователя, если твит является ответом */
  in_reply_to_user_id?: string;
  /** Массив с информацией о связанных твитах (например, ретвит, ответ, квот) */
  referenced_tweets?: TwitterTweetReference[];
}

// Интерфейс для описания объекта в массиве referenced_tweets
export interface TwitterTweetReference {
  /** Тип ссылки: "retweeted", "replied_to" или "quoted" */
  type: 'retweeted' | 'replied_to' | 'quoted';
  id: string;
}

// Интерфейс для описания пользователя
export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  connection_status: string[]; // например: ['following', 'followed_by']
  verified_type: 'none' | 'blue' | string; // можно расширить при необходимости
  is_identity_verified: boolean;
  /** Дата регистрации пользователя (если запрашивалась) */
  created_at?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

// Интерфейс для секции includes
export interface TwitterIncludes {
  users: TwitterUser[];
}

// Интерфейс для метаданных запроса
export interface TwitterMeta {
  result_count: number;
  newest_id: string;
  oldest_id: string;
}

// Основной интерфейс ответа Twitter API
export interface TwitterTimelineResponse {
  data: TwitterTweet[];
  includes?: TwitterIncludes;
  meta: TwitterMeta;
  status?: number;
}

export interface MappedTweet extends TwitterTweet {
  author?: TwitterUser;
  extended_referenced_tweets?: Array<
    TwitterTweetReference & {
      tweet?: TwitterTweet & { author?: TwitterUser };
    }
  >;
}
