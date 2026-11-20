import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { concatMap, forkJoin, from, of, toArray } from 'rxjs';
import {
  ActivityItem,
  AdminApi,
  CredentialItem,
  DashboardStats,
  FileItem,
  FolderItem,
  Profile,
  ProjectItem,
  TrashItem
} from './admin-api';

type AdminTab = 'dashboard' | 'files' | 'projects' | 'credentials' | 'profile' | 'trash';
type EntityDialog = 'folder' | 'project' | 'credential' | null;
type AssetKind = 'avatar' | 'logo' | 'cv';

interface EntityForm {
  title: string;
  summary: string;
  description: string;
  technologies: string;
  project_url: string;
  institution: string;
  issue_date: string;
  file_id: number | null;
  is_public: boolean;
}

interface FolderForm {
  name: string;
  description: string;
  parent_id: number | null;
}

const emptyProfile: Profile = {
  display_name: '', headline: '', bio: '', skills: '', experience: '',
  location: '', email_public: '', website: '', github: '', linkedin: '',
  logo_path: null, avatar_path: null, cv_path: null
};

const emptyEntity: EntityForm = {
  title: '', summary: '', description: '', technologies: '', project_url: '',
  institution: '', issue_date: '', file_id: null, is_public: false
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  readonly tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Resumen', icon: '⌂' },
    { id: 'files', label: 'Archivos', icon: '▤' },
    { id: 'projects', label: 'Proyectos', icon: '◇' },
    { id: 'credentials', label: 'Diplomas', icon: '✦' },
    { id: 'profile', label: 'Mi perfil', icon: '◎' },
    { id: 'trash', label: 'Papelera', icon: '⌫' }
  ];

  readonly authenticated = signal(!!localStorage.getItem('sj_token'));
  readonly busy = signal(false);
  readonly notice = signal('');
  readonly error = signal('');
  readonly activeTab = signal<AdminTab>('dashboard');
  readonly stats = signal<DashboardStats>({ files: 0, folders: 0, projects: 0, credentials: 0, trash: 0 });
  readonly folders = signal<FolderItem[]>([]);
  readonly files = signal<FileItem[]>([]);
  readonly projects = signal<ProjectItem[]>([]);
  readonly credentials = signal<CredentialItem[]>([]);
  readonly profile = signal<Profile>({ ...emptyProfile });
  readonly activity = signal<ActivityItem[]>([]);
  readonly trash = signal<TrashItem[]>([]);
  readonly search = signal('');
  readonly folderFilter = signal<number | null>(null);
  readonly dialog = signal<EntityDialog>(null);
  readonly editingId = signal<number | null>(null);
  readonly entity = signal<EntityForm>({ ...emptyEntity });
  readonly folderForm = signal<FolderForm>({ name: '', description: '', parent_id: null });
  readonly selectedUploads = signal<File[]>([]);
  readonly uploadFolderId = signal<number | null>(null);
  readonly uploadPublic = signal(false);
  readonly selectedAssets: Record<AssetKind, File | null> = { avatar: null, logo: null, cv: null };
  readonly previewName = signal('');
  readonly previewUrl = signal('');
  readonly previewError = signal('');
  readonly previewSafeUrl = signal<SafeResourceUrl | null>(null);
  readonly profileImageUrl = signal('');
  readonly filteredFiles = computed(() => {
    const query = this.search().trim().toLowerCase();
    const folderId = this.folderFilter();
    return this.files().filter(file =>
      file.original_name.toLowerCase().includes(query) &&
      (folderId === null || file.folder_id === folderId)
    );
  });

  email = '';
  password = '';
  private noticeTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly api: AdminApi, private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.authenticated()) this.loadAll();
  }

  ngOnDestroy(): void {
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.revokePreview();
    if (this.profileImageUrl()) URL.revokeObjectURL(this.profileImageUrl());
  }

  login(): void {
    this.error.set('');
    this.busy.set(true);
    this.api.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: result => {
        localStorage.setItem('sj_token', result.token);
        this.authenticated.set(true);
        this.password = '';
        this.loadAll();
        this.busy.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'No fue posible iniciar sesión. Revisa tus datos e inténtalo de nuevo.');
        this.busy.set(false);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('sj_token');
    this.authenticated.set(false);
    this.clearData();
  }

  openTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  loadAll(): void {
    forkJoin({
      stats: this.api.stats(),
      folders: this.api.folders(),
      files: this.api.files(),
      projects: this.api.projects(),
      credentials: this.api.credentials(),
      profile: this.api.profile(),
      activity: this.api.activity(),
      trash: this.api.trash()
    }).subscribe({
      next: result => {
        this.stats.set(result.stats);
        this.folders.set(result.folders);
        this.files.set(result.files);
        this.projects.set(result.projects);
        this.credentials.set(result.credentials);
        this.profile.set({ ...emptyProfile, ...result.profile });
        this.activity.set(result.activity);
        this.trash.set(result.trash);
        this.updateProfileImage();
      },
      error: err => {
        if (err.status === 401) {
          this.logout();
          this.error.set('Tu sesión venció. Inicia sesión nuevamente.');
        } else {
          this.showNotice(err.error?.message || 'No se pudieron cargar los datos del administrador.', true);
        }
      }
    });
  }

  openCreate(kind: Exclude<EntityDialog, null>): void {
    this.dialog.set(kind);
    this.editingId.set(null);
    this.entity.set({ ...emptyEntity });
    this.folderForm.set({ name: '', description: '', parent_id: null });
  }

  openProject(project: ProjectItem): void {
    const technologies = Array.isArray(project.technologies)
      ? project.technologies.join(', ')
      : project.technologies || '';
    this.entity.set({
      ...emptyEntity,
      title: project.title,
      summary: project.summary || '',
      description: project.description || '',
      technologies,
      project_url: project.project_url || '',
      is_public: !!project.is_public
    });
    this.editingId.set(project.id);
    this.dialog.set('project');
  }

  openCredential(item: CredentialItem): void {
    this.entity.set({
      ...emptyEntity,
      title: item.title,
      description: item.description || '',
      institution: item.institution || '',
      issue_date: item.issue_date?.slice(0, 10) || '',
      file_id: item.file_id,
      is_public: !!item.is_public
    });
    this.editingId.set(item.id);
    this.dialog.set('credential');
  }

  closeDialog(): void {
    this.dialog.set(null);
    this.editingId.set(null);
  }

  saveDialog(): void {
    if (this.dialog() === 'folder') this.saveFolder();
    else this.saveEntity();
  }

  updateEntity<K extends keyof EntityForm>(key: K, value: EntityForm[K]): void {
    this.entity.update(current => ({ ...current, [key]: value }));
  }

  updateFolder<K extends keyof FolderForm>(key: K, value: FolderForm[K]): void {
    this.folderForm.update(current => ({ ...current, [key]: value }));
  }

  saveFolder(): void {
    const folder = this.folderForm();
    if (!folder.name.trim()) return;
    this.busy.set(true);
    this.api.createFolder({ ...folder, name: folder.name.trim() }).subscribe({
      next: () => { this.closeDialog(); this.loadAll(); this.showNotice('Carpeta creada.'); this.busy.set(false); },
      error: err => { this.showNotice(err.error?.message || 'No se pudo crear la carpeta.', true); this.busy.set(false); }
    });
  }

  saveEntity(): void {
    const value = this.entity();
    if (!value.title.trim()) return;
    const isProject = this.dialog() === 'project';
    const data: Partial<ProjectItem & CredentialItem> = {
      title: value.title.trim(),
      description: value.description,
      is_public: value.is_public
    };
    if (isProject) {
      data.summary = value.summary;
      data.technologies = value.technologies.split(',').map(item => item.trim()).filter(Boolean);
      data.project_url = value.project_url;
    } else {
      data.institution = value.institution;
      data.issue_date = value.issue_date || null;
      data.file_id = value.file_id;
    }

    this.busy.set(true);
    const id = this.editingId();
    const request = isProject
      ? id ? this.api.updateProject(id, data) : this.api.createProject(data)
      : id ? this.api.updateCredential(id, data) : this.api.createCredential(data);
    request.subscribe({
      next: () => {
        this.closeDialog();
        this.loadAll();
        this.showNotice(isProject ? 'Proyecto guardado.' : 'Diploma guardado.');
        this.busy.set(false);
      },
      error: err => { this.showNotice(err.error?.message || 'No se pudo guardar la información.', true); this.busy.set(false); }
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedUploads.set(Array.from(input.files || []));
  }

  uploadFiles(): void {
    const files = this.selectedUploads();
    if (!files.length) return;
    this.busy.set(true);
    from(files).pipe(
      concatMap(file => {
        const form = new FormData();
        form.append('file', file);
        form.append('folder_id', this.uploadFolderId()?.toString() || '');
        form.append('is_public', String(this.uploadPublic()));
        return this.api.uploadFile(form);
      }),
      toArray()
    ).subscribe({
      next: () => {
        this.selectedUploads.set([]);
        this.uploadPublic.set(false);
        this.loadAll();
        this.showNotice(`${files.length} archivo(s) subido(s).`);
        this.busy.set(false);
      },
      error: err => { this.showNotice(err.error?.message || 'No se pudieron subir todos los archivos.', true); this.busy.set(false); }
    });
  }

  fileAction(file: FileItem, action: 'rename' | 'move' | 'visibility' | 'delete'): void {
    if (action === 'delete') {
      if (!confirm(`¿Enviar "${file.original_name}" a la papelera?`)) return;
      this.api.deleteFile(file.id).subscribe({
        next: () => { this.loadAll(); this.showNotice('Archivo enviado a la papelera.'); },
        error: err => this.showNotice(err.error?.message || 'No se pudo eliminar el archivo.', true)
      });
      return;
    }

    let update: Partial<FileItem>;
    if (action === 'visibility') {
      update = { folder_id: file.folder_id, is_public: !file.is_public };
    } else if (action === 'rename') {
      const name = prompt('Nuevo nombre del archivo', file.original_name);
      if (!name?.trim()) return;
      update = { original_name: name.trim(), folder_id: file.folder_id };
    } else {
      const folders = this.folders().map(item => `${item.id}: ${item.name}`).join('\n');
      const choice = prompt(`ID de carpeta destino (0 para raíz):\n${folders}`, file.folder_id?.toString() || '0');
      if (choice === null) return;
      const folderId = choice === '0' ? null : Number(choice);
      if (folderId !== null && !this.folders().some(item => item.id === folderId)) {
        this.showNotice('Selecciona una carpeta válida.', true);
        return;
      }
      update = { original_name: file.original_name, folder_id: folderId };
    }

    this.api.updateFile(file.id, update).subscribe({
      next: () => { this.loadAll(); this.showNotice('Archivo actualizado.'); },
      error: err => this.showNotice(err.error?.message || 'No se pudo actualizar el archivo.', true)
    });
  }

  deleteProject(item: ProjectItem): void {
    if (!confirm(`¿Enviar "${item.title}" a la papelera?`)) return;
    this.api.deleteProject(item.id).subscribe({
      next: () => { this.loadAll(); this.showNotice('Proyecto enviado a la papelera.'); },
      error: err => this.showNotice(err.error?.message || 'No se pudo eliminar el proyecto.', true)
    });
  }

  deleteCredential(item: CredentialItem): void {
    if (!confirm(`¿Enviar "${item.title}" a la papelera?`)) return;
    this.api.deleteCredential(item.id).subscribe({
      next: () => { this.loadAll(); this.showNotice('Diploma enviado a la papelera.'); },
      error: err => this.showNotice(err.error?.message || 'No se pudo eliminar el diploma.', true)
    });
  }

  saveProfile(): void {
    this.busy.set(true);
    this.api.updateProfile(this.profile()).pipe(
      concatMap(() => {
        const assets = new FormData();
        for (const kind of ['avatar', 'logo', 'cv'] as const) {
          const file = this.selectedAssets[kind];
          if (file) assets.append(kind, file);
        }
        return [...assets.keys()].length ? this.api.uploadProfileAssets(assets) : of(null);
      })
    ).subscribe({
      next: () => {
        this.selectedAssets.avatar = null;
        this.selectedAssets.logo = null;
        this.selectedAssets.cv = null;
        this.loadAll();
        this.showNotice('Perfil actualizado y publicado.');
        this.busy.set(false);
      },
      error: err => { this.showNotice(err.error?.message || 'No se pudo actualizar el perfil.', true); this.busy.set(false); }
    });
  }

  onAssetSelected(kind: AssetKind, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedAssets[kind] = input.files?.[0] || null;
  }

  restoreItem(item: TrashItem): void {
    this.api.restore(item.type, item.id).subscribe({
      next: () => { this.loadAll(); this.showNotice('Elemento restaurado.'); },
      error: err => this.showNotice(err.error?.message || 'No se pudo restaurar el elemento.', true)
    });
  }

  permanentlyDelete(item: TrashItem): void {
    if (!confirm(`¿Eliminar definitivamente "${item.name}"? Esta acción no se puede deshacer.`)) return;
    this.api.permanentlyDelete(item.type, item.id).subscribe({
      next: () => { this.loadAll(); this.showNotice('Elemento eliminado definitivamente.'); },
      error: err => this.showNotice(err.error?.message || 'No se pudo eliminar el elemento.', true)
    });
  }

  previewFile(file: FileItem): void {
    this.revokePreview();
    this.previewName.set(file.original_name);
    this.previewError.set('');
    this.api.previewPrivateFile(file.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.previewUrl.set(url);
        this.previewSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      },
      error: err => {
        this.previewError.set(err.error?.message || 'No se pudo abrir la vista previa.');
        this.showNotice(this.previewError(), true);
      }
    });
  }

  closePreview(): void {
    this.revokePreview();
    this.previewName.set('');
    this.previewError.set('');
  }

  downloadPreview(): void {
    const url = this.previewUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = this.previewName();
    link.click();
  }

  setProfileField(key: keyof Profile, value: string): void {
    this.profile.update(current => ({ ...current, [key]: value }));
  }

  bytes(value: number): string {
    return `${(value / 1024 / 1024).toFixed(2)} MB`;
  }

  private updateProfileImage(): void {
    const path = this.profile().avatar_path;
    this.profileImageUrl.set(path ? (path.startsWith('http') ? path : `http://localhost:4000${path}`) : '');
  }

  private showNotice(message: string, isError = false): void {
    this.notice.set(message);
    this.error.set(isError ? message : '');
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => {
      this.notice.set('');
      this.error.set('');
    }, 4000);
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set('');
    this.previewSafeUrl.set(null);
  }

  private clearData(): void {
    this.stats.set({ files: 0, folders: 0, projects: 0, credentials: 0, trash: 0 });
    this.folders.set([]);
    this.files.set([]);
    this.projects.set([]);
    this.credentials.set([]);
    this.profile.set({ ...emptyProfile });
    this.activity.set([]);
    this.trash.set([]);
    this.updateProfileImage();
  }
}
