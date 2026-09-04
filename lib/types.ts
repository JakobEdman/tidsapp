export interface TimeEntry {
  id: string;
  project: string;
  activity: string;
  start_time: string;
  end_time: string;
  duration: string;
  entry_date: string;
  notes?: string;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  is_pro: boolean;
  must_change_password: boolean;
}

export interface AuthSession {
  user: User | null;
  expires_at?: number;
}
