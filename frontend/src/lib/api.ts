const API_BASE_URL = (() => {
  const url = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
  if (!url) {
    throw new Error('Missing VITE_API_BASE_URL environment variable');
  }
  return url;
})();
const DEFAULT_TENANT = import.meta.env.VITE_TENANT_ID ?? 'tenant_alpha';

const REFRESH_STORAGE_KEY = 'saas-school.refreshToken';
const TENANT_STORAGE_KEY = 'saas-school.tenantId';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tenantId: string | null = DEFAULT_TENANT;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

type UnauthorizedHandler = () => void;
type RefreshHandler = (auth: AuthResponse) => void;

let onUnauthorized: UnauthorizedHandler | null = null;
let onRefresh: RefreshHandler | null = null;

export type Role = 'student' | 'teacher' | 'admin' | 'superadmin';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  tenantId: string | null;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Role;
  tenantId?: string;
}

type FetchOptions = Omit<globalThis.RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

async function extractError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload?.message === 'string') {
      return payload.message;
    }
  } catch {
    // ignore
  }
  return response.statusText || 'Request failed';
}

export function setAuthHandlers(handlers: {
  onUnauthorized?: UnauthorizedHandler | null;
  onRefresh?: RefreshHandler | null;
}) {
  onUnauthorized = handlers.onUnauthorized ?? null;
  onRefresh = handlers.onRefresh ?? null;
}

function persistSession(tokens: { refresh: string | null; tenant: string | null }) {
  if (typeof window === 'undefined') return;
  if (tokens.refresh) {
    window.localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh);
  } else {
    window.localStorage.removeItem(REFRESH_STORAGE_KEY);
  }

  if (tokens.tenant) {
    window.localStorage.setItem(TENANT_STORAGE_KEY, tokens.tenant);
  } else {
    window.localStorage.removeItem(TENANT_STORAGE_KEY);
  }
}

const TENANT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function isValidTenantId(id: string | null | undefined): id is string {
  return Boolean(id && TENANT_ID_PATTERN.test(id));
}

function parseDuration(input: string): number {
  if (!input) return 0;
  const numeric = Number(input);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }
  const match = input.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 0;
  }
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

function clearRefreshTimer() {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
}

function scheduleTokenRefresh(expiresIn: string) {
  clearRefreshTimer();
  const duration = parseDuration(expiresIn);
  if (!duration || duration < 0) {
    return;
  }
  const refreshDelay = Math.max(duration - 60_000, duration * 0.75);
  refreshTimeout = setTimeout(() => {
    authApi.refresh().catch(() => {
      /* errors handled in refresh */
    });
  }, refreshDelay);
}

export function initialiseSession(auth: AuthResponse, persist: boolean = true) {
  accessToken = auth.accessToken;
  refreshToken = auth.refreshToken;
  const resolvedTenant = auth.user.tenantId ?? DEFAULT_TENANT;
  tenantId = isValidTenantId(resolvedTenant) ? resolvedTenant : DEFAULT_TENANT;
  if (persist) {
    persistSession({ refresh: refreshToken, tenant: tenantId });
  }
  scheduleTokenRefresh(auth.expiresIn);
}

export function clearSession() {
  accessToken = null;
  refreshToken = null;
  tenantId = DEFAULT_TENANT;
  clearRefreshTimer();
  persistSession({ refresh: null, tenant: null });
}

export function hydrateFromStorage(): { refreshToken: string | null; tenantId: string | null } {
  if (typeof window === 'undefined') {
    return { refreshToken: null, tenantId: null };
  }
  const storedRefresh = window.localStorage.getItem(REFRESH_STORAGE_KEY);
  const storedTenant = window.localStorage.getItem(TENANT_STORAGE_KEY);
  refreshToken = storedRefresh;
  const safeTenant = storedTenant && isValidTenantId(storedTenant) ? storedTenant : DEFAULT_TENANT;
  tenantId = safeTenant;
  if (storedTenant && !isValidTenantId(storedTenant)) {
    window.localStorage.removeItem(TENANT_STORAGE_KEY);
  }
  return { refreshToken: storedRefresh, tenantId: safeTenant };
}

export function setTenant(nextTenant: string | null) {
  if (nextTenant && !isValidTenantId(nextTenant)) {
    throw new Error('Invalid tenant identifier');
  }
  tenantId = nextTenant ?? DEFAULT_TENANT;
  persistSession({ refresh: refreshToken, tenant: tenantId });
}

async function performRefresh(): Promise<AuthResponse | null> {
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId ?? DEFAULT_TENANT
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      const message = await extractError(response);
      console.warn('[api] refresh token failed', message);
      clearSession();
      onUnauthorized?.();
      return null;
    }

    const auth = (await response.json()) as AuthResponse;
    initialiseSession(auth);
    onRefresh?.(auth);
    scheduleTokenRefresh(auth.expiresIn);
    return auth;
  } catch (error) {
    console.error('[api] refresh token error', (error as Error).message);
    clearSession();
    onUnauthorized?.();
    return null;
  }
}

async function apiFetch<T>(path: string, options: FetchOptions = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    'x-tenant-id': tenantId ?? DEFAULT_TENANT,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers
  };

  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && retry && refreshToken) {
    const refreshed = await performRefresh();
    if (refreshed?.accessToken) {
      return apiFetch<T>(path, options, false);
    }
  }

  if (!response.ok) {
    throw new Error(await extractError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ------------------------
// Configuration Endpoints
// ------------------------

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
  role: Role;
  is_verified: boolean;
  created_at: string;
}

export interface AttendanceHistoryItem {
  id: string;
  student_id: string;
  class_id: string | null;
  status: 'present' | 'absent' | 'late';
  attendance_date: string;
  marked_by: string;
  recorded_at: string;
}

export interface AttendanceSummary {
  present: number;
  total: number;
  percentage: number;
}

export interface AttendanceHistoryResponse {
  history: AttendanceHistoryItem[];
  summary: AttendanceSummary;
}

export interface AttendanceMark {
  studentId: string;
  classId?: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface ClassAttendanceSnapshot {
  status: 'present' | 'absent' | 'late';
  count: number;
}

export interface GradeEntryInput {
  studentId: string;
  subject: string;
  score: number;
  remarks?: string;
  classId?: string;
}

export interface StudentResult {
  student_id: string;
  exam_id: string;
  overall_score: number;
  grade: string;
  remarks?: string | null;
  breakdown: Array<{
    subject: string;
    score: number;
    grade: string;
  }>;
}

export interface Invoice {
  id: string;
  student_id: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  status: string;
  description?: string | null;
  currency?: string | null;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      false
    );
    initialiseSession(response);
    scheduleTokenRefresh(response.expiresIn);
    return response;
  },
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      false
    );
    initialiseSession(response);
    scheduleTokenRefresh(response.expiresIn);
    return response;
  },
  async refresh(): Promise<AuthResponse | null> {
    return performRefresh();
  }
};

export const api = {
  // Configuration
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

  // Reports & summaries
  getAttendanceReport: (params: { from?: string; to?: string; classId?: string }) =>
    apiFetch<AttendanceAggregate[]>(
      `/reports/attendance${buildQuery({
        from: params.from,
        to: params.to,
        class_id: params.classId
      })}`
    ),
  getGradeReport: (examId: string) =>
    apiFetch<GradeAggregate[]>(`/reports/grades${buildQuery({ exam_id: examId })}`),
  getFeeReport: (status?: string) =>
    apiFetch<FeeAggregate[]>(`/reports/fees${buildQuery({ status })}`),

  // Attendance
  getStudentAttendance: (studentId: string, filters?: { from?: string; to?: string }) =>
    apiFetch<AttendanceHistoryResponse>(
      `/attendance/${studentId}${buildQuery({ from: filters?.from, to: filters?.to })}`
    ),
  markAttendance: (records: AttendanceMark[]) =>
    apiFetch<void>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ records })
    }),
  getClassAttendanceSnapshot: (classId: string, date: string) =>
    apiFetch<ClassAttendanceSnapshot[]>(
      `/attendance/report/class${buildQuery({ class_id: classId, date })}`
    ),

  // Grades & exams
  bulkUpsertGrades: (examId: string, entries: GradeEntryInput[]) =>
    apiFetch<{ saved: number }>('/grades/bulk', {
      method: 'POST',
      body: JSON.stringify({ examId, entries })
    }),
  getStudentResult: (studentId: string, examId: string) =>
    apiFetch<StudentResult>(`/results/${studentId}${buildQuery({ exam_id: examId })}`),

  // Invoices
  getStudentInvoices: (studentId: string) => apiFetch<Invoice[]>(`/invoices/${studentId}`),

  // RBAC
  listUsers: () => apiFetch<TenantUser[]>('/users'),
  updateUserRole: (userId: string, role: Role) =>
    apiFetch<TenantUser>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
};
