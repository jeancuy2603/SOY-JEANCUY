
import {useEffect,useMemo,useRef,useState} from 'react';
import {Routes,Route,Link,useNavigate} from 'react-router-dom';
import {Folder,FileText,LayoutDashboard,UserRound,Briefcase,GraduationCap,Download,ExternalLink,Plus,Upload,LogOut,LockKeyhole,Globe,Search,ArrowUpRight, Github, Linkedin, Mail, Trash2,RotateCcw,Eye,EyeOff,Edit3, X, Menu,HardDrive,Settings,Image,File,ChevronRight,Home as HomeIcon,Clock,ShieldCheck} from 'lucide-react';
import api from './services/api';
const API=import.meta.env.VITE_API_URL||'http://localhost:4000/api';
const ADMIN_URL=import.meta.env.VITE_ADMIN_URL||'http://localhost:4200';
const CONTACT_EMAIL='j2698611@gmail.com';
const fileUrl=(id)=>`${API}/content/files/${id}/preview`;
const asset=(p)=>p?(p.startsWith('http')?p:`http://localhost:4000${p}`):'';
const nav=[['Inicio','/',Globe],['Sobre mí','/sobre-mi',UserRound],['Proyectos','/proyectos',Briefcase],['Diplomas','/diplomas',GraduationCap],['Repositorio','/repositorio',Folder]];
function Header(){const p=usePublic();return <header className="topbar"><Link className="brand" to="/">{p.logo_path?<img className="brand-logo" src={asset(p.logo_path)} alt="Logo SOY JEANCUY"/>:<span className="brandmark">SJ</span>}<span>SOY <b>JEANCUY</b></span></Link><nav>{nav.map(([n,p,I])=><Link key={p} to={p}><I size={15}/>{n}</Link>)}</nav></header>}
function Shell({children}){
 const mainRef=useRef(null);
 useEffect(()=>{
  const root=mainRef.current;
  if(!root||!('IntersectionObserver'in window))return;
  const selector='.section,.page-intro,.about-card,.listing .list-card,.contact-band';
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
   }
  }),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  const observe=()=>root.querySelectorAll(selector).forEach(element=>{
   element.classList.add('scroll-reveal');
   if(!element.classList.contains('is-visible'))observer.observe(element);
  });
  const mutations=new MutationObserver(observe);
  observe();
  mutations.observe(root,{childList:true,subtree:true});
  const trackGlow=event=>{
   if(!(event.target instanceof Element))return;
   const card=event.target.closest('.feature,.project-card,.manage-card');
   if(!card)return;
   const bounds=card.getBoundingClientRect();
   card.style.setProperty('--pointer-x',`${event.clientX-bounds.left}px`);
   card.style.setProperty('--pointer-y',`${event.clientY-bounds.top}px`);
  };
  root.addEventListener('pointermove',trackGlow);
  return()=>{
   mutations.disconnect();
   observer.disconnect();
   root.removeEventListener('pointermove',trackGlow);
  };
 },[]);
 return <><Header/><main ref={mainRef}>{children}</main><footer>© {new Date().getFullYear()} SOY JEANCUY <span>Un espacio para crear, aprender y compartir.</span></footer></>;
}
function usePublic(){const[p,setP]=useState({display_name:'SOY JEANCUY',headline:'Mi espacio personal y profesional',bio:'Bienvenido a mi repositorio digital.'});useEffect(()=>{const refresh=()=>api.get('/content/profile').then(r=>setP(x=>({...x,...r.data}))).catch(()=>{});refresh();window.addEventListener('soy-content-updated',refresh);return()=>window.removeEventListener('soy-content-updated',refresh)},[]);return p}
function Home(){
 const p=usePublic(),[projects,setProjects]=useState([]),[contactOpen,setContactOpen]=useState(false);
 const contactEmail=CONTACT_EMAIL;
 useEffect(()=>{const refresh=()=>api.get('/content/projects').then(r=>setProjects(r.data.slice(0,3))).catch(()=>{});refresh();window.addEventListener('soy-content-updated',refresh);return()=>window.removeEventListener('soy-content-updated',refresh)},[]);
 return <Shell>
  <section className="hero"><div className="eyebrow"><span className="pulse"/> REPOSITORIO PERSONAL · PORTAFOLIO DIGITAL</div><h1>Hola, <em>{p.display_name||'JEANCUY'}.</em></h1><p className="lead">{p.headline}</p><p className="muted hero-copy">{p.bio}</p><div className="actions"><Link className="btn primary" to="/proyectos">Explorar proyectos <ArrowUpRight size={17}/></Link>{p.cv_path&&<a className="btn secondary" href={asset(p.cv_path)} target="_blank"><Download size={17}/> Ver hoja de vida</a>}</div>{p.avatar_path&&<img className="hero-avatar" src={asset(p.avatar_path)} alt="Foto de perfil"/>}<div className="hero-orb"><div className="orb-inner">SJ</div></div><div className="hero-meta"><span>01 / PERFIL</span><span>{p.location||'COLOMBIA'}</span></div></section>
  <section className="section"><div className="section-head"><div><div className="eyebrow">LO QUE ENCONTRARÁS</div><h2>Un poco de mi mundo.</h2></div><p className="muted">Conocimiento, experiencias y proyectos organizados en un solo lugar.</p></div><div className="feature-grid">{[[Briefcase,'Proyectos','Ideas convertidas en experiencias.','/proyectos'],[GraduationCap,'Diplomas','Formación y logros académicos.','/diplomas'],[Folder,'Repositorio','Documentos y recursos compartidos.','/repositorio']].map(([I,t,d,l])=><Link className="feature" to={l} key={t}><I/><h3>{t}</h3><p>{d}</p><ArrowUpRight className="feature-arrow"/></Link>)}</div></section>
  <section className="section"><div className="section-head"><div><div className="eyebrow">TRABAJO RECIENTE</div><h2>Proyectos destacados.</h2></div><Link className="text-link" to="/proyectos">Ver todos <ArrowUpRight size={15}/></Link></div><div className="project-grid">{projects.length?projects.map(x=><article className="project-card" key={x.id}><div className="project-art"><Briefcase size={32}/></div><div className="project-body"><span className="tag">PROYECTO</span><h3>{x.title}</h3><p>{x.summary}</p>{x.project_url&&<a href={x.project_url} target="_blank" rel="noreferrer">Ver proyecto <ExternalLink size={13}/></a>}</div></article>):<div className="empty wide">Todavía no hay proyectos publicados.</div>}</div></section>
  <section className="contact-band"><div><div className="eyebrow">¿CONECTAMOS?</div><h2>Las buenas ideas<br/>comienzan conversando.</h2></div><button className="btn primary" type="button" onClick={()=>setContactOpen(true)}><Mail size={17}/> Escríbeme</button></section>
  {contactOpen&&<ContactForm recipient={contactEmail} onClose={()=>setContactOpen(false)}/>}
 </Shell>
}
function ContactForm({recipient,onClose}){
 const [sending,setSending]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const closeOnEscape=event=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',closeOnEscape);return()=>window.removeEventListener('keydown',closeOnEscape)},[onClose]);
 async function submit(event){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const senderEmail=String(form.get('sender_email')||'').trim();
  const message=String(form.get('message')||'').trim();
  setSending(true);
  setError('');
  try{
   await api.post('/contact',{senderEmail,message});
   setSent(true);
  }catch(err){
   setError(err.response?.status===503
    ?'Falta la contraseña de aplicación de Gmail en backend/.env. Agrégala y reinicia el backend.'
    :err.response?.data?.message||'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.');
  }finally{
   setSending(false);
  }
 }
 return <div className="contact-backdrop" onClick={onClose}>
  <section className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" onClick={event=>event.stopPropagation()}>
   <button className="contact-close" type="button" onClick={onClose} aria-label="Cerrar formulario"><X/></button>
   <p className="eyebrow">SOY JEANCUY / CONTACTO</p>
   <h2 id="contact-title">Cuéntame, ¿en qué puedo ayudarte?</h2>
   <p className="contact-intro">Escribe tu correo y tu mensaje. Lo recibiré directamente en esta dirección:</p>
   <div className="contact-recipient"><span>Correo destinatario</span><strong>{recipient}</strong></div>
   {sent?<div className="contact-success" role="status"><strong>¡Mensaje enviado!</strong><p>El servidor aceptó el mensaje. Si no aparece en la bandeja de entrada, revisa la carpeta de spam.</p></div>:
    <form className="contact-form" onSubmit={submit}>
     <label>Tu correo electrónico<input type="email" name="sender_email" autoComplete="email" placeholder="tu@correo.com" required/></label>
     <label>Tu mensaje<textarea name="message" rows="5" maxLength="5000" placeholder="Escribe aquí lo que quieras contarme..." required/></label>
     {error&&<p className="contact-error" role="alert">{error}</p>}
     <button className="btn primary" type="submit" disabled={sending}><Mail size={16}/> {sending?'Enviando…':'Enviar mensaje'}</button>
    </form>}
  </section>
 </div>
}
function About(){const p=usePublic();return <Shell><section className="page-intro"><div className="eyebrow">SOY JEANCUY / PERFIL</div><h1>Sobre mí<em>.</em></h1><p className="muted">{p.headline}</p></section><div className="about-card">{p.avatar_path?<img className="about-avatar" src={asset(p.avatar_path)}/>:<div className="avatar">SJ</div>}<div><h2>{p.display_name}</h2><p className="muted">{p.bio||'Próximamente compartiré más sobre mi historia.'}</p><p className="muted">{p.location}</p>{p.skills&&<><h3>Habilidades</h3><div className="skill-tags">{p.skills.split('\n').filter(Boolean).map((s,i)=><span key={i}>{s}</span>)}</div></>}{p.experience&&<><h3>Experiencia y trayectoria</h3><p className="muted preline">{p.experience}</p></>}<div className="socials"><a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Escribir a ${CONTACT_EMAIL}`}><Mail/></a>{p.github&&<a href={p.github} target="_blank"><Github/></a>}{p.linkedin&&<a href={p.linkedin} target="_blank"><Linkedin/></a>}{p.website&&<a href={p.website} target="_blank"><Globe/></a>}</div>{p.cv_path&&<a className="btn primary" href={asset(p.cv_path)} target="_blank"><Download size={16}/> Ver hoja de vida</a>}</div></div></Shell>}
function Listing({type}){
 const config=useMemo(()=>({
  projects:['Mis proyectos','Ideas, trabajos y experiencias que quiero compartir.','/content/projects','Todavía no hay proyectos publicados.'],
  credentials:['Diplomas y certificados','Mi formación y los logros que forman parte de mi camino.','/content/credentials','Todavía no hay diplomas publicados.'],
  files:['Repositorio','Documentos y recursos que he decidido compartir públicamente.','/content/files','Todavía no hay archivos públicos.']
 })[type],[type]);
 const[data,setData]=useState([]),[preview,setPreview]=useState(null),[previewUrl,setPreviewUrl]=useState(''),[previewError,setPreviewError]=useState('');
 useEffect(()=>{const refresh=()=>api.get(config[2]).then(r=>setData(r.data)).catch(()=>{});refresh();window.addEventListener('soy-content-updated',refresh);return()=>window.removeEventListener('soy-content-updated',refresh)},[config]);
 const canPreview=!!preview&&(preview.mimeType==='application/pdf'||preview.mimeType?.startsWith('image/')||preview.mimeType==='text/plain'||preview.mimeType==='text/csv');
 useEffect(()=>{
  if(!preview||!canPreview){setPreviewUrl('');return}
  let objectUrl;
  let active=true;
  setPreviewUrl('');
  setPreviewError('');
  api.get(`/content/files/${preview.id}/preview`,{responseType:'blob'})
   .then(r=>{objectUrl=URL.createObjectURL(r.data);if(active)setPreviewUrl(objectUrl);else URL.revokeObjectURL(objectUrl)})
   .catch(()=>{if(active)setPreviewError('No se pudo cargar la vista previa. Puedes descargar el archivo.');});
  return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[preview,canPreview]);
 useEffect(()=>{
  if(!preview)return;
  const closeOnEscape=e=>{if(e.key==='Escape')setPreview(null)};
  window.addEventListener('keydown',closeOnEscape);
  return()=>window.removeEventListener('keydown',closeOnEscape);
 },[preview]);
 return <Shell>
  <section className="page-intro"><div className="eyebrow">SOY JEANCUY / {type.toUpperCase()}</div><h1>{config[0]}<em>.</em></h1><p className="muted">{config[1]}</p></section>
  <div className="listing">{data.length?data.map(x=><article className="list-card" key={x.id}>
   <div className="list-icon">{type==='projects'?<Briefcase/>:type==='credentials'?<GraduationCap/>:<FileText/>}</div>
   <div className="list-info"><h3>{x.title||x.original_name}</h3><p>{x.summary||x.description||x.institution||''}</p>{x.technologies&&<small>{Array.isArray(x.technologies)?x.technologies.join(' · '):String(x.technologies)}</small>}</div>
   {(x.file_id||type==='files')&&<button type="button" className="icon-btn" title="Vista previa" aria-label={`Vista previa de ${x.title||x.original_name}`} onClick={()=>setPreview({id:x.file_id||x.id,name:x.original_name||x.title,mimeType:x.mime_type})}><Eye/></button>}
   {x.project_url&&<a className="icon-btn" href={x.project_url} target="_blank" rel="noreferrer" aria-label={`Abrir proyecto ${x.title}`}><ExternalLink/></a>}
  </article>):<div className="empty">{config[3]}</div>}</div>
  {preview&&<div className="modal-backdrop preview-backdrop" onClick={()=>setPreview(null)}>
   <section className="modal preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onClick={e=>e.stopPropagation()}>
    <header className="preview-header"><div><span className="eyebrow">VISTA PREVIA</span><h2 id="preview-title">{preview.name}</h2></div><div className="preview-actions"><a className="btn primary" href={`${API}/content/files/${preview.id}/download`}><Download size={16}/> Descargar</a><button type="button" className="preview-close" onClick={()=>setPreview(null)} aria-label="Cerrar vista previa"><X/></button></div></header>
    <div className="preview-frame">{previewError?<p className="preview-message" role="alert">{previewError}</p>:!canPreview?<p className="preview-message">Este tipo de archivo no admite vista previa aquí. Puedes descargarlo con el botón superior.</p>:previewUrl?<iframe src={previewUrl} title={`Vista previa de ${preview.name}`} />:<p className="preview-message">Cargando vista previa...</p>}</div>
   </section>
  </div>}
 </Shell>
}
function Login(){const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('');const navg=useNavigate();async function submit(e){e.preventDefault();setError('');try{const r=await api.post('/auth/login',{email,password});localStorage.setItem('sj_token',r.data.token);navg('/admin/panel');}catch(err){setError(err.response?.data?.message||'No fue posible iniciar sesión.');}}return <Shell><div className="login-wrap"><form className="login-card" onSubmit={submit}><div className="brandmark large">SJ</div><div className="eyebrow">ÁREA RESTRINGIDA</div><h1>Bienvenido<br/>de nuevo.</h1><p className="muted">Inicia sesión para administrar tu espacio.</p><label>Correo electrónico<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@soyjeancuy.com"/></label><label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Tu contraseña"/></label>{error&&<p className="error">{error}</p>}<button className="btn primary full">Ingresar al panel <ArrowUpRight size={16}/></button></form></div></Shell>}
const tabs=[['Resumen','dashboard',LayoutDashboard],['Archivos','files',Folder],['Proyectos','projects',Briefcase],['Diplomas','credentials',GraduationCap],['Mi perfil','profile',UserRound],['Papelera','trash',Trash2]];
function Admin(){const navg=useNavigate(),[tab,setTab]=useState('dashboard'),[stats,setStats]=useState({}),[folders,setFolders]=useState([]),[files,setFiles]=useState([]),[projects,setProjects]=useState([]),[credentials,setCredentials]=useState([]),[trash,setTrash]=useState([]),[profile,setProfile]=useState({}),[activity,setActivity]=useState([]),[notice,setNotice]=useState(''),[search,setSearch]=useState(''),[folder,setFolder]=useState(''),[modal,setModal]=useState(''),[editing,setEditing]=useState(null),[mobile,setMobile]=useState(false);
 const load=async()=>{try{const [s,f,d,p,c,t,pr,a]=await Promise.all([api.get('/admin/stats'),api.get('/admin/folders'),api.get('/admin/files'),api.get('/admin/projects'),api.get('/admin/credentials'),api.get('/admin/trash'),api.get('/admin/profile'),api.get('/admin/activity')]);setStats(s.data);setFolders(f.data);setFiles(d.data);setProjects(p.data);setCredentials(c.data);setTrash(t.data);setProfile(pr.data);setActivity(a.data);}catch(e){if(e.response?.status===401){localStorage.removeItem('sj_token');navg('/admin');}}};
 useEffect(()=>{load()},[]);
 const msg=(m)=>{setNotice(m);setTimeout(()=>setNotice(''),3500)};
 const logout=()=>{localStorage.removeItem('sj_token');navg('/admin')};
 const filtered=useMemo(()=>files.filter(f=>f.original_name.toLowerCase().includes(search.toLowerCase())&&(folder===''||String(f.folder_id||'')===folder)),[files,search,folder]);
 async function saveFolder(e){e.preventDefault();const fd=new FormData(e.currentTarget);try{await api.post('/admin/folders',{name:fd.get('name'),description:fd.get('description'),parent_id:fd.get('parent_id')||null});setModal('');load();msg('Carpeta creada correctamente.')}catch(e){msg(e.response?.data?.message||'No se pudo crear la carpeta.')}}
 async function uploadFiles(e){e.preventDefault();const el=e.currentTarget,selected=[...el.elements.file.files];if(!selected.length)return;try{for(const file of selected){const form=new FormData();form.append('file',file);form.append('folder_id',el.elements.folder_id.value);form.append('is_public',el.elements.is_public.checked?'true':'false');await api.post('/admin/files',form,{headers:{'Content-Type':'multipart/form-data'}})}el.reset();load();msg(`${selected.length} archivo(s) subido(s) correctamente.`)}catch(e){msg(e.response?.data?.message||'No se pudo subir uno de los archivos.')}}
 async function saveEntity(e){e.preventDefault();const fd=new FormData(e.currentTarget),data=Object.fromEntries(fd.entries());data.is_public=fd.get('is_public')==='on';try{if(modal==='project'){data.technologies=(data.technologies||'').split(',').map(x=>x.trim()).filter(Boolean);editing?await api.patch(`/admin/projects/${editing.id}`,data):await api.post('/admin/projects',data)}else{data.file_id=data.file_id||null;editing?await api.patch(`/admin/credentials/${editing.id}`,data):await api.post('/admin/credentials',data)}setModal('');setEditing(null);load();msg('Información guardada correctamente.')}catch(e){msg(e.response?.data?.message||'No se pudo guardar.')}}
 async function saveProfile(e){e.preventDefault();const fd=new FormData(e.currentTarget),data=Object.fromEntries(fd.entries());try{await api.put('/admin/profile',data);const assets=new FormData();['avatar','logo','cv'].forEach(k=>{const f=fd.get(k);if(f&&f.size)assets.append(k,f)});if([...assets.keys()].length)await api.post('/admin/profile/assets',assets,{headers:{'Content-Type':'multipart/form-data'}});load();msg('Perfil actualizado y publicado.')}catch(e){msg(e.response?.data?.message||'No se pudo actualizar el perfil.')}}
 async function openPrivateFile(id){try{const r=await api.get(`/admin/private-file/${id}`,{responseType:'blob'});const url=URL.createObjectURL(r.data);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000)}catch{msg('No se pudo abrir la vista previa.')}}
 async function fileAction(id,action){try{if(action==='delete')await api.delete(`/admin/files/${id}`);if(action==='visibility'){const f=files.find(x=>x.id===id);await api.patch(`/admin/files/${id}`,{folder_id:f.folder_id,is_public:!f.is_public})}if(action==='rename'){const n=prompt('Nuevo nombre del archivo',files.find(x=>x.id===id)?.original_name);if(n)await api.patch(`/admin/files/${id}`,{original_name:n,folder_id:files.find(x=>x.id===id)?.folder_id})}if(action==='move'){const choice=prompt('ID de carpeta destino (0 para raíz):\\n'+folders.map(x=>`${x.id}: ${x.name}`).join('\\n'));if(choice!==null){const f=files.find(x=>x.id===id);await api.patch(`/admin/files/${id}`,{original_name:f.original_name,folder_id:choice==='0'?null:Number(choice)})}}load();msg('Cambios guardados.')}catch(e){msg('No se pudo completar la acción.')}}
 async function trashAction(item,restore){try{if(restore)await api.post(`/admin/trash/${item.type}/${item.id}/restore`);else if(confirm('¿Eliminar definitivamente este elemento?'))await api.delete(`/admin/trash/${item.type}/${item.id}`);load();msg(restore?'Elemento restaurado.':'Elemento eliminado definitivamente.')}catch(e){msg('No se pudo completar la acción.')}}
 return <div className="admin-shell"><aside className={`admin-sidebar ${mobile?'open':''}`}><Link className="brand" to="/"><span className="brandmark">SJ</span><span>SOY <b>JEANCUY</b></span></Link><div className="side-label">ESPACIO DE TRABAJO</div>{tabs.map(([label,id,I])=><button key={id} className={`side-item ${tab===id?'active':''}`} onClick={()=>{setTab(id);setMobile(false)}}><I size={17}/>{label}{id==='trash'&&stats.trash>0&&<small>{stats.trash}</small>}</button>)}<div className="sidebar-bottom"><Link to="/" className="side-item"><Globe size={17}/> Ver sitio público</Link><button className="side-item" onClick={logout}><LogOut size={17}/> Cerrar sesión</button><div className="admin-user"><div className="mini-avatar">SJ</div><div><b>Administrador</b><small>SOY JEANCUY</small></div><ShieldCheck size={17}/></div></div></aside>
 <main className="admin-content"><header className="admin-top"><button className="mobile-menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div><span className="eyebrow">PANEL DE CONTROL / {tabs.find(t=>t[1]===tab)?.[0].toUpperCase()}</span><h1>{tab==='dashboard'?'Tu espacio, tus reglas.':tabs.find(t=>t[1]===tab)?.[0]}</h1></div><a className="site-preview" href="/" target="_blank"><Eye size={16}/> Ver sitio <ExternalLink size={13}/></a></header>
 {notice&&<div className="notice">{notice}</div>}
 {tab==='dashboard'&&<><p className="muted">Resumen general de tu repositorio personal.</p><div className="stats-grid">{[['Archivos',stats.files,FileText],['Carpetas',stats.folders,Folder],['Proyectos',stats.projects,Briefcase],['Diplomas',stats.credentials,GraduationCap],['Papelera',stats.trash,Trash2]].map(([t,v,I])=><div className="stat" key={t}><I/><span>{t}</span><b>{v??0}</b></div>)}</div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h3>Accesos rápidos</h3><p>Gestiona tu contenido</p></div></div><div className="quick-grid"><button onClick={()=>setModal('folder')}><Folder/>Crear carpeta</button><button onClick={()=>setTab('files')}><Upload/>Subir archivos</button><button onClick={()=>{setEditing(null);setModal('project')}}><Briefcase/>Nuevo proyecto</button><button onClick={()=>{setEditing(null);setModal('credential')}}><GraduationCap/>Añadir diploma</button><button onClick={()=>setTab('profile')}><UserRound/>Editar perfil</button><button onClick={()=>setTab('trash')}><Trash2/>Abrir papelera</button></div></section><section className="panel"><div className="panel-head"><div><h3>Actividad reciente</h3><p>Últimos cambios en tu espacio</p></div><Clock/></div>{activity.length?activity.slice(0,8).map((a,i)=><div className="activity-row" key={i}><span className="activity-dot"/><div><b>{a.action}</b><small>{a.details||a.entity_type} · {new Date(a.created_at).toLocaleString()}</small></div></div>):<div className="empty">Todavía no hay actividad registrada.</div>}</section></div></>}
 {tab==='files'&&<><div className="toolbar"><div className="searchbox"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar archivos..."/></div><button className="btn secondary" onClick={()=>setModal('folder')}><Plus size={16}/> Nueva carpeta</button></div><div className="upload-panel"><form onSubmit={uploadFiles}><div><Upload/><b>Subir documentos al repositorio</b><small>PDF, Word, Excel, PowerPoint, imágenes, ZIP. Máximo configurable por archivo.</small></div><select name="folder_id" defaultValue=""><option value="">Carpeta raíz</option>{folders.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select><label className="file-pick"><input type="file" name="file" multiple required/><span>Seleccionar archivo</span></label><label className="check"><input type="checkbox" name="is_public" value="true"/> Publicar</label><button className="btn primary">Subir archivo <Upload size={15}/></button></form></div><div className="folder-strip"><button className={folder===''?'selected':''} onClick={()=>setFolder('')}><HardDrive/> Todas las carpetas</button>{folders.map(f=><button className={folder===String(f.id)?'selected':''} key={f.id} onClick={()=>setFolder(String(f.id))}><Folder/>{f.name}</button>)}</div><div className="file-list">{filtered.map(f=><div className="file-row" key={f.id}><div className="file-type">{f.mime_type?.startsWith('image/')?<Image/>:<FileText/>}</div><div className="file-name"><b>{f.original_name}</b><small>{f.folder_name||'Carpeta raíz'} · {(f.size_bytes/1024/1024).toFixed(2)} MB</small></div><span className={f.is_public?'public-label':'private-label'}>{f.is_public?'Público':'Privado'}</span><button className="mini-btn" onClick={()=>openPrivateFile(f.id)} title="Vista previa"><Eye size={15}/></button><button className="mini-btn" onClick={()=>fileAction(f.id,'rename')} title="Renombrar"><Edit3 size={15}/></button><button className="mini-btn" onClick={()=>fileAction(f.id,'move')} title="Mover a carpeta"><Folder size={15}/></button><button className="mini-btn" onClick={()=>fileAction(f.id,'visibility')} title="Cambiar visibilidad">{f.is_public?<EyeOff size={15}/>:<Globe size={15}/>}</button><button className="mini-btn danger" onClick={()=>fileAction(f.id,'delete')} title="Papelera"><Trash2 size={15}/></button></div>)}{!filtered.length&&<div className="empty">No hay archivos que coincidan. Sube tu primer documento.</div>}</div></>}
 {tab==='projects'&&<><div className="toolbar"><p className="muted">Publica tus trabajos, ideas y experiencias.</p><button className="btn primary" onClick={()=>{setEditing(null);setModal('project')}}><Plus size={16}/> Nuevo proyecto</button></div><div className="admin-cards">{projects.map(x=><article className="manage-card" key={x.id}><span className={x.is_public?'public-label':'private-label'}>{x.is_public?'Público':'Borrador'}</span><h3>{x.title}</h3><p>{x.summary}</p><small>{Array.isArray(x.technologies)?x.technologies.join(' · '):''}</small><div className="card-actions"><button onClick={()=>{setEditing(x);setModal('project')}}><Edit3/> Editar</button><button className="danger-text" onClick={async()=>{if(confirm('¿Enviar proyecto a papelera?')){await api.delete(`/admin/projects/${x.id}`);load()}}}><Trash2/> Eliminar</button></div></article>)}{!projects.length&&<div className="empty">Aún no tienes proyectos. Crea el primero.</div>}</div></>}
 {tab==='credentials'&&<><div className="toolbar"><p className="muted">Administra tus diplomas y certificados.</p><button className="btn primary" onClick={()=>{setEditing(null);setModal('credential')}}><Plus size={16}/> Añadir diploma</button></div><div className="file-list">{credentials.map(c=><div className="file-row" key={c.id}><div className="file-type"><GraduationCap/></div><div className="file-name"><b>{c.title}</b><small>{c.institution} · {c.issue_date||'Fecha no indicada'}</small></div><span className={c.is_public?'public-label':'private-label'}>{c.is_public?'Público':'Borrador'}</span><button className="mini-btn" onClick={()=>{setEditing(c);setModal('credential')}}><Edit3/></button><button className="mini-btn danger" onClick={async()=>{if(confirm('¿Enviar diploma a papelera?')){await api.delete(`/admin/credentials/${c.id}`);load()}}}><Trash2/></button></div>)}{!credentials.length&&<div className="empty">Todavía no has agregado diplomas.</div>}</div></>}
 {tab==='profile'&&<form className="profile-form panel" onSubmit={saveProfile}><div className="panel-head"><div><h3>Identidad profesional</h3><p>Estos datos se reflejan en el sitio público.</p></div><Settings/></div><div className="form-grid"><label>Nombre o marca<input name="display_name" defaultValue={profile.display_name}/></label><label>Profesión o titular<input name="headline" defaultValue={profile.headline}/></label><label>Ubicación<input name="location" defaultValue={profile.location}/></label><label>Correo público<input type="email" name="email_public" defaultValue={profile.email_public}/></label><label>Sitio web<input name="website" defaultValue={profile.website}/></label><label>GitHub<input name="github" defaultValue={profile.github}/></label><label>LinkedIn<input name="linkedin" defaultValue={profile.linkedin}/></label><label className="span2">Biografía<textarea name="bio" rows="5" defaultValue={profile.bio}/></label><label className="span2">Habilidades (una por línea)<textarea name="skills" rows="3" defaultValue={profile.skills}/></label><label className="span2">Experiencia y trayectoria<textarea name="experience" rows="4" defaultValue={profile.experience}/></label><label>Fotografía de perfil<input type="file" name="avatar" accept="image/*"/></label><label>Logo de marca<input type="file" name="logo" accept="image/*"/></label><label>Hoja de vida (PDF)<input type="file" name="cv" accept=".pdf,application/pdf"/></label></div><button className="btn primary"><Upload size={16}/> Guardar y publicar perfil</button></form>}
 {tab==='trash'&&<><p className="muted">Los archivos y carpetas enviados aquí se pueden restaurar o eliminar definitivamente.</p><div className="file-list">{trash.map(x=><div className="file-row" key={`${x.type}-${x.id}`}><div className="file-type">{x.type==='folder'?<Folder/>:<FileText/>}</div><div className="file-name"><b>{x.name}</b><small>{x.type==='folder'?'Carpeta':'Archivo'} · Eliminado {new Date(x.deleted_at).toLocaleDateString()}</small></div><button className="mini-btn" onClick={()=>trashAction(x,true)}><RotateCcw size={15}/> Restaurar</button><button className="mini-btn danger" onClick={()=>trashAction(x,false)}><Trash2 size={15}/> Eliminar</button></div>)}{!trash.length&&<div className="empty">La papelera está vacía.</div>}</div></>}
 </main>
 {modal&&<div className="modal-backdrop" onClick={()=>{setModal('');setEditing(null)}}><form className="modal" onClick={e=>e.stopPropagation()} onSubmit={modal==='folder'?saveFolder:saveEntity}><button type="button" className="modal-close" onClick={()=>{setModal('');setEditing(null)}}><X/></button><div className="eyebrow">SOY JEANCUY / ADMINISTRACIÓN</div><h2>{modal==='folder'?'Crear carpeta':modal==='project'?(editing?'Editar proyecto':'Nuevo proyecto'):(editing?'Editar diploma':'Añadir diploma')}</h2>{modal==='folder'?<><label>Nombre<input name="name" required placeholder="Ej. Documentos académicos"/></label><label>Descripción<input name="description" placeholder="Descripción opcional"/></label><label>Carpeta superior<select name="parent_id"><option value="">Carpeta raíz</option>{folders.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></label></>:modal==='project'?<><label>Nombre del proyecto<input name="title" required defaultValue={editing?.title}/></label><label>Resumen<input name="summary" defaultValue={editing?.summary}/></label><label>Descripción<textarea name="description" rows="4" defaultValue={editing?.description}/></label><label>Tecnologías (separadas por coma)<input name="technologies" defaultValue={Array.isArray(editing?.technologies)?editing.technologies.join(', '):''}/></label><label>Enlace del proyecto<input name="project_url" type="url" defaultValue={editing?.project_url}/></label><label className="check"><input type="checkbox" name="is_public" defaultChecked={!!editing?.is_public}/> Publicar en el portafolio</label></>:<><label>Nombre del diploma<input name="title" required defaultValue={editing?.title}/></label><label>Institución<input name="institution" defaultValue={editing?.institution}/></label><label>Fecha de expedición<input name="issue_date" type="date" defaultValue={editing?.issue_date?.slice?.(0,10)||''}/></label><label>Descripción<textarea name="description" rows="3" defaultValue={editing?.description}/></label><label>Archivo asociado<select name="file_id" defaultValue={editing?.file_id||''}><option value="">Sin archivo</option>{files.map(f=><option value={f.id} key={f.id}>{f.original_name}</option>)}</select></label><label className="check"><input type="checkbox" name="is_public" defaultChecked={!!editing?.is_public}/> Publicar en el portafolio</label></>}<button className="btn primary full"><Plus size={16}/> Guardar cambios</button></form></div>}
 </div>}
function AdminRedirect(){useEffect(()=>{window.location.replace(ADMIN_URL)},[]);return <p className="page-intro">Abriendo el panel de administración… <a href={ADMIN_URL}>Continuar</a></p>}
export default function App(){useEffect(()=>{const events=new EventSource(`${API}/events`),notify=()=>window.dispatchEvent(new Event('soy-content-updated'));events.addEventListener('content-updated',notify);return()=>events.close()},[]);return <Routes><Route path="/" element={<Home/>}/><Route path="/sobre-mi" element={<About/>}/><Route path="/proyectos" element={<Listing type="projects"/>}/><Route path="/diplomas" element={<Listing type="credentials"/>}/><Route path="/repositorio" element={<Listing type="files"/>}/><Route path="/admin/*" element={<AdminRedirect/>}/></Routes>}
