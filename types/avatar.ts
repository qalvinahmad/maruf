export interface Avatar {
  id: string;
  user_id: string;
  animation_url: string;
  border_style: 'gray' | 'primary' | 'secondary' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  border_color?: {
    from: string;
    to: string;
  };
  badge_type: 'none' | 'streaming' | 'recording' | 'award' | 'active';
  badge_color?: string;
  created_at: string;
  updated_at: string;
}
