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

    return response.blob();
  },
};
