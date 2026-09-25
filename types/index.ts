export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface LegalTopic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  created_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  template_text: string;
  required_fields: string[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  question: string;
  answer: string | null;
  legal_topic: string | null;
  created_at: string;
}

export interface DocumentRequest {
  id: string;
  user_id: string;
  template_id: string;
  form_data: Record<string, string>;
  generated_text: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  details: string | null;
  created_at: string;
}
