// Interface for tweet information object
export interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  conversation_id: string;
  edit_history_tweet_ids: string[];
  /** User ID if the tweet is a reply */
  in_reply_to_user_id?: string;
  /** Array with information about related tweets (e.g., retweet, reply, quote) */
  referenced_tweets?: TwitterTweetReference[];
}

// Interface for describing an object in the referenced_tweets array
export interface TwitterTweetReference {
  /** Type of reference: "retweeted", "replied_to" or "quoted" */
  type: 'retweeted' | 'replied_to' | 'quoted';
  id: string;
}

// Interface for describing a user
export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  connection_status: string[]; // e.g., ['following', 'followed_by']
  verified_type: 'none' | 'blue' | string; // can be extended if necessary
  is_identity_verified: boolean;
  /** User registration date (if requested) */
  created_at?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

// Interface for the includes section
export interface TwitterIncludes {
  users: TwitterUser[];
}

// Interface for request metadata
export interface TwitterMeta {
  result_count: number;
  newest_id: string;
  oldest_id: string;
}

// Main interface for Twitter API response
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
