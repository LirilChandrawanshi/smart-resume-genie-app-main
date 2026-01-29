const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface MessageResponse {
  message: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate: string;
  url?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url?: string;
}

export interface Resume {
  id?: string;
  userId?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  template?: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get user from localStorage
export const getUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
export const setUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    // Handle different error response formats
    const errorMessage = error.message || error.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<JwtResponse> => {
    return apiRequest<JwtResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signup: async (data: SignupRequest): Promise<MessageResponse> => {
    return apiRequest<MessageResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Resume API
export const resumeApi = {
  getAll: async (): Promise<Resume[]> => {
    return apiRequest<Resume[]>('/resumes');
  },

  getById: async (id: string): Promise<Resume> => {
    return apiRequest<Resume>(`/resumes/${id}`);
  },

  create: async (resume: Resume): Promise<Resume> => {
    return apiRequest<Resume>('/resumes', {
      method: 'POST',
      body: JSON.stringify(resume),
    });
  },

  update: async (id: string, resume: Resume): Promise<Resume> => {
    return apiRequest<Resume>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resume),
    });
  },

  delete: async (id: string): Promise<MessageResponse> => {
    return apiRequest<MessageResponse>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  },

  getTemplates: async (): Promise<string[]> => {
    return apiRequest<string[]>('/resumes/templates');
  },
};

// Template list from backend (file-discovered LaTeX + HTML-only)
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  hasLatex?: boolean;
}

export interface TemplatesListResponse {
  templates: TemplateInfo[];
  total: number;
}

export const templatesApi = {
  getTemplates: async (): Promise<TemplatesListResponse> => {
    return apiRequest<TemplatesListResponse>('/templates');
  },
};

// Admin API types
export interface AdminStatsResponse {
  totalUsers: number;
  totalResumes: number;
}

export interface AdminStatsExtendedResponse {
  totalUsers: number;
  totalResumes: number;
  resumesByTemplate: Record<string, number>;
}

export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  resumeCount: number;
}

export interface AdminResumeResponse {
  id: string;
  name: string;
  userId: string;
  ownerUsername: string;
  template: string;
  updatedAt: string;
}

export interface AdminPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// Admin API
export const adminApi = {
  getStats: async (): Promise<AdminStatsResponse> => {
    return apiRequest<AdminStatsResponse>('/admin/stats');
  },

  getStatsExtended: async (): Promise<AdminStatsExtendedResponse> => {
    return apiRequest<AdminStatsExtendedResponse>('/admin/stats/extended');
  },

  getUsers: async (params?: { page?: number; size?: number; search?: string }): Promise<AdminPageResponse<AdminUserResponse>> => {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.size != null) sp.set('size', String(params.size));
    if (params?.search != null && params.search.trim() !== '') sp.set('search', params.search.trim());
    const q = sp.toString();
    return apiRequest<AdminPageResponse<AdminUserResponse>>(`/admin/users${q ? `?${q}` : ''}`);
  },

  getResumes: async (params?: { userId?: string; page?: number; size?: number }): Promise<AdminPageResponse<AdminResumeResponse>> => {
    const sp = new URLSearchParams();
    if (params?.userId) sp.set('userId', params.userId);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.size != null) sp.set('size', String(params.size));
    const q = sp.toString();
    return apiRequest<AdminPageResponse<AdminResumeResponse>>(`/admin/resumes${q ? `?${q}` : ''}`);
  },

  getResumeById: async (id: string): Promise<Resume> => {
    return apiRequest<Resume>(`/admin/resumes/${id}`);
  },

  deleteUser: async (id: string): Promise<MessageResponse> => {
    return apiRequest<MessageResponse>(`/admin/users/${id}`, { method: 'DELETE' });
  },

  deleteResume: async (id: string): Promise<MessageResponse> => {
    return apiRequest<MessageResponse>(`/admin/resumes/${id}`, { method: 'DELETE' });
  },

  updateUserRoles: async (id: string, roles: string[]): Promise<MessageResponse> => {
    return apiRequest<MessageResponse>(`/admin/users/${id}/roles`, {
      method: 'PATCH',
      body: JSON.stringify({ roles }),
    });
  },

  exportUsersCsv: async (): Promise<void> => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/admin/users/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  },

  exportResumesCsv: async (userId?: string): Promise<void> => {
    const token = getAuthToken();
    const url = userId ? `${API_BASE_URL}/admin/resumes/export?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/admin/resumes/export`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resumes.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

// PDF API
export const pdfApi = {
  generate: async (id: string): Promise<Blob> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pdf/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    // Check if response is actually a PDF
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Backend PDF generation not implemented, falling back to client-side');
    }

    return response.blob();
  },
};
