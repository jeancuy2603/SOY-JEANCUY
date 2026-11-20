import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:4000/api';

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: number; name: string; email: string; role: string };
}

export interface DashboardStats {
  files: number;
  folders: number;
  projects: number;
  credentials: number;
  trash: number;
}

export interface FolderItem {
  id: number;
  name: string;
  parent_id: number | null;
  description: string;
}

export interface FileItem {
  id: number;
  folder_id: number | null;
  folder_name: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  is_public: boolean;
}

export interface ProjectItem {
  id: number;
  title: string;
  summary: string;
  description: string;
  technologies: string[] | string | null;
  project_url: string;
  is_public: boolean;
}

export interface CredentialItem {
  id: number;
  title: string;
  institution: string;
  issue_date: string | null;
  description: string;
  file_id: number | null;
  original_name: string | null;
  is_public: boolean;
}

export interface Profile {
  display_name: string;
  headline: string;
  bio: string;
  skills: string;
  experience: string;
  location: string;
  email_public: string;
  website: string;
  github: string;
  linkedin: string;
  logo_path: string | null;
  avatar_path: string | null;
  cv_path: string | null;
}

export interface ActivityItem {
  action: string;
  details: string | null;
  entity_type: string | null;
  created_at: string;
}

export interface TrashItem {
  id: number;
  name: string;
  type: 'file' | 'folder' | 'project' | 'credential';
  deleted_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  constructor(private readonly http: HttpClient) {}

  login(credentials: Credentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credentials);
  }

  stats() { return this.http.get<DashboardStats>(`${API_URL}/admin/stats`, this.authorized()); }
  folders() { return this.http.get<FolderItem[]>(`${API_URL}/admin/folders`, this.authorized()); }
  files() { return this.http.get<FileItem[]>(`${API_URL}/admin/files`, this.authorized()); }
  projects() { return this.http.get<ProjectItem[]>(`${API_URL}/admin/projects`, this.authorized()); }
  credentials() { return this.http.get<CredentialItem[]>(`${API_URL}/admin/credentials`, this.authorized()); }
  profile() { return this.http.get<Profile>(`${API_URL}/admin/profile`, this.authorized()); }
  activity() { return this.http.get<ActivityItem[]>(`${API_URL}/admin/activity`, this.authorized()); }
  trash() { return this.http.get<TrashItem[]>(`${API_URL}/admin/trash`, this.authorized()); }

  createFolder(data: { name: string; description: string; parent_id: number | null }) {
    return this.http.post(`${API_URL}/admin/folders`, data, this.authorized());
  }
  uploadFile(data: FormData) {
    return this.http.post(`${API_URL}/admin/files`, data, this.authorized());
  }
  updateFile(id: number, data: Partial<FileItem>) {
    return this.http.patch(`${API_URL}/admin/files/${id}`, data, this.authorized());
  }
  deleteFile(id: number) {
    return this.http.delete(`${API_URL}/admin/files/${id}`, this.authorized());
  }
  createProject(data: Partial<ProjectItem>) {
    return this.http.post(`${API_URL}/admin/projects`, data, this.authorized());
  }
  updateProject(id: number, data: Partial<ProjectItem>) {
    return this.http.patch(`${API_URL}/admin/projects/${id}`, data, this.authorized());
  }
  deleteProject(id: number) {
    return this.http.delete(`${API_URL}/admin/projects/${id}`, this.authorized());
  }
  createCredential(data: Partial<CredentialItem>) {
    return this.http.post(`${API_URL}/admin/credentials`, data, this.authorized());
  }
  updateCredential(id: number, data: Partial<CredentialItem>) {
    return this.http.patch(`${API_URL}/admin/credentials/${id}`, data, this.authorized());
  }
  deleteCredential(id: number) {
    return this.http.delete(`${API_URL}/admin/credentials/${id}`, this.authorized());
  }
  updateProfile(data: Partial<Profile>) {
    return this.http.put(`${API_URL}/admin/profile`, data, this.authorized());
  }
  uploadProfileAssets(data: FormData) {
    return this.http.post(`${API_URL}/admin/profile/assets`, data, this.authorized());
  }
  previewPrivateFile(id: number) {
    return this.http.get(`${API_URL}/admin/private-file/${id}`, {
      ...this.authorized(),
      responseType: 'blob'
    });
  }
  restore(type: TrashItem['type'], id: number) {
    return this.http.post(`${API_URL}/admin/trash/${type}/${id}/restore`, {}, this.authorized());
  }
  permanentlyDelete(type: TrashItem['type'], id: number) {
    return this.http.delete(`${API_URL}/admin/trash/${type}/${id}`, this.authorized());
  }

  private authorized() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('sj_token') || ''}` }) };
  }
}
