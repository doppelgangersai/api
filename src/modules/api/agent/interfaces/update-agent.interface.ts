// interfaces/update-agent.interface.ts

export type TUserID = number; // Определите тип TUserID согласно вашей системе

export interface IPostSettings {
  enabled: boolean;
  accounts: string[];
  keywords: string[];
  prompt: string;
  per_day: number;
}

export interface ICommentSettings {
  enabled: boolean;
  accounts: string[];
  reply_when_tagged: boolean;
  x_accounts_replies: boolean;
  my_accounts_replies: boolean;
  prompt: string;
  min_followers: number;
  older_then: number;
}

export interface IUpdateAgent {
  creatorId?: TUserID;
  ownerId?: TUserID;
  twitter_account_id?: number;
  post_settings?: IPostSettings;
  comment_settings?: ICommentSettings;
}
