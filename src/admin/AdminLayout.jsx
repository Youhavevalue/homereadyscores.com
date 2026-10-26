import BrandLogo from '../components/BrandLogo';
import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminNavGroups, adminQuickLinks } from './navConfig';
import { Search, LogOut, Menu, X, ExternalLink, ChevronDown, ArrowUpRight, CircleHelp } from 'lucide-react';
import './admin.css';
import './analytics.css';
import './requests.css';
import './clients.css';
import './dashboard-theme.css';

export default function AdminLayout() {
  const { user, logout, sessionError } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const searchDialog = useRef(null);
  const searchInput = useRef(null);
  const menuButton = useRef(null);
  const closeMenuButton = useRef(null);
  const sidebar = useRef(null);
  const title = pathname.includes('/credit-funnel') ? 'Credit-help requests' : pathname.includes('/reports') ? 'Analytics' : pathname.includes('/guide') ? 'System guide' : pathname.includes('/clients') ? 'Clients' : pathname.includes('/prospects') ? 'Prospects' : pathname.includes('/contracts') ? 'Agreements' : pathname.includes('/help-desk') ? 'Team help desk' : pathname.includes('/training') ? 'Training' : 'Enrollments';
  const filtered = adminQuickLinks.filter(item => `${item.label} ${item.to}`.toLowerCase().includes(searchQ.trim().toLowerCase()));

  useEffect(() => {
    if (!searchOpen) return;
    const dialog = searchDialog.current;
    dialog?.showModal(); searchInput.current?.focus();
    return () => { dialog?.close(); };
  }, [searchOpen]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => closeMenuButton.current?.focus());
    const desktop = window.matchMedia('(min-width: 1024px)');
    const resetAtDesktop = () => {
      if (desktop.matches) { setSidebarOpen(false); sidebar.current?.querySelector('.is-active')?.focus(); }
    };
    desktop.addEventListener('change', resetAtDesktop);
    resetAtDesktop();
    const handle = event => {
      if (event.key === 'Escape') { setSidebarOpen(false); requestAnimationFrame(() => menuButton.current?.focus()); }
      if (event.key === 'Tab') {
        const items = sidebar.current?.querySelectorAll('a[href],button:not([disabled])');
        if (!items?.length) return;
        const first=items[0], last=items[items.length-1];
        if (!sidebar.current?.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown',handle);
    return () => { cancelAnimationFrame(focusFrame); desktop.removeEventListener('change', resetAtDesktop); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown',handle); };
  }, [sidebarOpen]);
  const closeMenu = () => { setSidebarOpen(false); requestAnimationFrame(() => menuButton.current?.focus()); };

  return <div className="admin-shell" data-admin-theme="navy">
    <a href="#admin-main" className="admin-skip">Skip to main content</a>
    {sidebarOpen && <button className="admin-backdrop" aria-label="Close navigation" onClick={closeMenu}/>}
    <aside ref={sidebar} className={`admin-sidebar ${sidebarOpen?'is-open':''}`} aria-label="Main navigation">
      <div className="admin-brand"><Link to="/admin" aria-label="HomeReady Scores staff home"><BrandLogo reverse width={180}/></Link><button ref={closeMenuButton} className="admin-icon-button admin-menu-close" onClick={closeMenu} aria-label="Close menu"><X size={20}/></button></div>
      <div className="admin-workspace-label"><span className="admin-workspace-dot"/> Staff workspace</div>
      <nav>{adminNavGroups.map(group=><div className="admin-nav-group" key={group.id}><p>{group.label}</p>{group.items.map(item=>{const Icon=item.icon;const active=item.to==='/admin' ? ['/admin','/admin/requests'].includes(pathname):undefined;return <NavLink key={item.to} to={item.to} end={item.end} onClick={()=>setSidebarOpen(false)} className={({isActive})=>`admin-nav-link ${(active??isActive)?'is-active':''}`}><Icon size={19}/><span>{item.label}</span></NavLink>;})}</div>)}</nav>
      <div className="admin-sidebar-foot"><a href="/?hrs_traffic=internal" target="_blank" rel="noreferrer"><ExternalLink size={17}/> View website <ArrowUpRight size={15}/></a><p>HomeReady Scores<br/><span>Private team access</span></p></div>
    </aside>
    <div className="admin-workspace" inert={sidebarOpen || undefined}>
      <header className="admin-topbar">
        <button ref={menuButton} type="button" className="admin-icon-button admin-menu-toggle" aria-label="Open menu" aria-expanded={sidebarOpen} onClick={()=>setSidebarOpen(true)}><Menu size={21}/></button>
        <div className="admin-breadcrumb"><span>Workspace</span><span>/</span><strong>{title}</strong></div>
        <button className="admin-search-trigger" onClick={()=>setSearchOpen(true)} aria-label="Search workspace"><Search size={17}/><span>Find a page</span><kbd>Search</kbd></button>
        <Link className="admin-icon-button admin-help-link" to="/admin/guide" aria-label="Open system guide"><CircleHelp size={20}/></Link>
        <details className="admin-account"><summary aria-label="Your account"><span className="admin-avatar">{user?.name?.replace(/^Dr\.?\s*/i,'').slice(0,1)||'T'}</span><span className="admin-account-name">{user?.name||'Team'}</span><ChevronDown size={14}/></summary><div className="admin-account-menu"><p>Signed in as<strong>{user?.email}</strong></p><Link to="/admin/guide#accounts">Login & email explained</Link><button onClick={async()=>{if(await logout())navigate('/portal/login');}}><LogOut size={16}/> Sign out</button></div></details>
      </header>
      <main id="admin-main" tabIndex={-1} className="admin-main">{sessionError&&<div role="alert" className="admin-notice is-error">{sessionError}</div>}<Outlet/></main>
      <footer className="admin-workspace-footer"><span>HomeReady Scores · Staff workspace</span><Link to="/admin/guide#status">View launch status <ArrowUpRight size={13}/></Link></footer>
    </div>
    <dialog ref={searchDialog} className="admin-search-dialog" onCancel={()=>setSearchOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setSearchOpen(false);}} aria-label="Find a page">
      <div className="admin-search-field"><Search size={20}/><input ref={searchInput} value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search pages, reports, help…" aria-label="Search pages"/><button className="admin-icon-button" onClick={()=>{setSearchOpen(false);setSearchQ('');}} aria-label="Close search"><X size={19}/></button></div>
      <p className="admin-search-caption">Go to a page</p><div className="admin-search-results">{filtered.length?filtered.map(item=><button key={item.to} onClick={()=>{navigate(item.to);setSearchOpen(false);setSearchQ('');}}><span>{item.label}</span><ArrowUpRight size={17}/></button>):<p>No matching pages. Try “Analytics” or “Clients”.</p>}</div>
    </dialog>
  </div>;
}
