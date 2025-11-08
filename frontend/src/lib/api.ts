const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const DEFAULT_TENANT = import.meta.env.VITE_TENANT_ID ?? 'tenant_alpha';
const DEFAULT_TOKEN = import.meta.env.VITE_API_TOKEN ?? '';

type FetchOptions = Omit<globalThis.RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'x-tenant-id': DEFAULT_TENANT,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(DEFAULT_TOKEN ? { Authorization: DEFAULT_TOKEN } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ message: response.statusText || 'Request failed' }));
    throw new Error(message.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface BrandingConfig {
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  theme_flags?: Record<string, boolean> | null;
  typography?: Record<string, unknown> | null;
  navigation?: Record<string, unknown> | null;
}

export interface AcademicTerm {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  description?: string | null;
}

export interface AttendanceAggregate {
  attendance_date: string;
  class_id: string | null;
  status: string;
  count: number;
}

export interface GradeAggregate {
  subject: string;
  grade: string;
  count: number;
  average_score: number;
}

export interface FeeAggregate {
  status: string;
  invoice_count: number;
  total_amount: number;
  total_paid: number;
}

export interface TenantUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
  is_verified: boolean;
  created_at: string;
}

export const api = {
  getBranding: () => apiFetch<BrandingConfig | null>('/configuration/branding'),
  updateBranding: (payload: Partial<BrandingConfig>) =>
    apiFetch<BrandingConfig>('/configuration/branding', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  listTerms: () => apiFetch<AcademicTerm[]>('/configuration/terms'),
  createTerm: (payload: { name: string; startsOn: string; endsOn: string }) =>
    apiFetch<AcademicTerm>('/configuration/terms', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  listClasses: () => apiFetch<SchoolClass[]>('/configuration/classes'),
  createClass: (payload: { name: string; description?: string }) =>
    apiFetch<SchoolClass>('/configuration/classes', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getAttendanceReport: (params: { from?: string; to?: string; classId?: string }) => {
    const search = new URLSearchParams();
    if (params.from) search.append('from', params.from);
    if (params.to) search.append('to', params.to);
    if (params.classId) search.append('class_id', params.classId);
    return apiFetch<AttendanceAggregate[]>(`/reports/attendance?${search.toString()}`);
  },
  getGradeReport: (examId: string) =>
    apiFetch<GradeAggregate[]>(`/reports/grades?exam_id=${encodeURIComponent(examId)}`),
  getFeeReport: (status?: string) =>
    apiFetch<FeeAggregate[]>(
      status ? `/reports/fees?status=${encodeURIComponent(status)}` : '/reports/fees'
    ),
  listUsers: () => apiFetch<TenantUser[]>('/users'),
  updateUserRole: (userId: string, role: TenantUser['role']) =>
    apiFetch<TenantUser>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
};


