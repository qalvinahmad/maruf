export interface Event {
  id: string;
  title: string;
  type: 'WEBINAR' | 'WORKSHOP' | 'COMPETITION';
  description: string;
  date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface EventFormData {
  title: string;
  type: Event['type'];
  description: string;
  date: string;
  status: Event['status'];
}

export { };

