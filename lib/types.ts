export interface TimeEntry {
  id: string;
  project: string;
  activity: string;
  start_time: string;
  end_time: string;
  duration: string;
  notes?: string;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  is_pro: boolean;
}

export interface AuthSession {
  user: User | null;
}
