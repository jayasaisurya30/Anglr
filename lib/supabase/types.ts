/**
 * Typed mirror of the Postgres schema defined in supabase/migrations/0001_init.sql.
 * If you regenerate via `supabase gen types typescript`, replace this file with the
 * generated output.
 */

export type CatchVisibility = "private" | "friends" | "public";
export type FollowRequestStatus = "pending" | "accepted" | "declined";
export type NotificationType =
  | "follow_request"
  | "follow_accept"
  | "like"
  | "comment";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          handle: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          biggest_fish_lbs: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          handle: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          biggest_fish_lbs?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          user_id: string;
          share_private_map: boolean;
          notify_likes: boolean;
          notify_comments: boolean;
          notify_follows: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          share_private_map?: boolean;
          notify_likes?: boolean;
          notify_comments?: boolean;
          notify_follows?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      catches: {
        Row: {
          id: string;
          user_id: string;
          species: string | null;
          species_nickname: string | null;
          weight_lbs: number | null;
          caught_at: string;
          lat: number;
          lng: number;
          notes: string | null;
          bait: string | null;
          visibility: CatchVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species?: string | null;
          species_nickname?: string | null;
          weight_lbs?: number | null;
          caught_at?: string;
          lat: number;
          lng: number;
          notes?: string | null;
          bait?: string | null;
          visibility?: CatchVisibility;
        };
        Update: Partial<Database["public"]["Tables"]["catches"]["Insert"]>;
        Relationships: [];
      };
      catch_images: {
        Row: {
          id: string;
          catch_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          catch_id: string;
          storage_path: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["catch_images"]["Insert"]>;
        Relationships: [];
      };
      likes: {
        Row: { catch_id: string; user_id: string; created_at: string };
        Insert: { catch_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["likes"]["Insert"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          catch_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          catch_id: string;
          user_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: { follower_id: string; following_id: string };
        Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
        Relationships: [];
      };
      follow_requests: {
        Row: {
          id: string;
          from_user: string;
          to_user: string;
          status: FollowRequestStatus;
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          from_user: string;
          to_user: string;
          status?: FollowRequestStatus;
        };
        Update: Partial<
          Database["public"]["Tables"]["follow_requests"]["Insert"]
        > & { responded_at?: string | null; status?: FollowRequestStatus };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: NotificationType;
          catch_id: string | null;
          comment_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type: NotificationType;
          catch_id?: string | null;
          comment_id?: string | null;
          read_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_my_profile: {
        Args: {
          p_username: string;
          p_handle: string;
          p_display_name: string;
        };
        Returns: unknown;
      };
      is_mutual_follow: {
        Args: { viewer: string; owner: string };
        Returns: boolean;
      };
    };
    Enums: {
      catch_visibility: CatchVisibility;
      follow_request_status: FollowRequestStatus;
      notification_type: NotificationType;
    };
  };
}

// Convenience row/insert aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CatchRow = Database["public"]["Tables"]["catches"]["Row"];
export type CatchInsert = Database["public"]["Tables"]["catches"]["Insert"];
export type CatchImage =
  Database["public"]["Tables"]["catch_images"]["Row"];
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type FollowRow = Database["public"]["Tables"]["follows"]["Row"];
export type FollowRequest =
  Database["public"]["Tables"]["follow_requests"]["Row"];

// Composite shapes used around the app
export interface CatchWithImages extends CatchRow {
  catch_images: CatchImage[];
}
export interface CatchWithAuthor extends CatchWithImages {
  profiles: Pick<Profile, "username" | "handle" | "avatar_url" | "display_name">;
  like_count?: number;
  comment_count?: number;
  viewer_has_liked?: boolean;
}
