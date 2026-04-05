import { useState, useMemo, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminNavGroups, adminQuickLinks } from './navConfig';
import { fetchOpenTicketCount } from './lib/adminData';
import {
  Search,
  Maximize2,
  Minimize2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';

function matchBadge(item, openCount) {
  if (item.badgeKey === 'openTickets') return openCount;
  return null;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [fs, setFs] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const n = await fetchOpenTicketCount();
      if (!cancelled) setOpenTickets(n);
    })();
    const onFocus = () => {
      void fetchOpenTicketCount().then((n) => setOpenTickets(n));
    };
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [location.pathname]);

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin') return [{ label: 'Dashboard', to: null }];
    const segs = path.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
    const labels = {
      system: 'System admin',
      clients: 'Clients',
      prospects: 'Prospects',
      affiliates: 'Affiliates',
      brokers: 'Brokers',
      new: 'Add new',
      joint: 'Joint client',
      faq: 'FAQ',
      'help-desk': 'Help Desk',
      appointments: 'Appointments',
      cms: 'Web CMS',
      letters: 'Letters',
      autoresponders: 'Autoresponders',
      api: 'API',
      settings: 'Settings',
      reports: 'Reports',
      communication: 'Communication',
      contracts: 'Contracts',
      invoices: 'Invoices',
      users: 'Users',
      'system-emails': 'System emails',
      'letter-menu': 'Letter menu',
      hotlinks: 'Hotlinks',
      referrals: 'Referrals',
      'creation-report': 'Creation report',
      global: 'Global view',
      deferred: 'Deferred subscriptions',
      config: 'Config',
      credentials: 'API credentials',
      prospect: 'Prospect',
      broker: 'Broker',
      client: 'Client',
      css: 'CSS editor',
      pages: 'Pages',
    };
    const crumbs = [{ label: 'Dashboard', to: '/admin' }];
    let acc = '/admin';
    segs.forEach((seg, i) => {
      acc += `/${seg}`;
      const isLast = i === segs.length - 1;
      const isUuid = /^[0-9a-f-]{36}$/i.test(seg) || /^[a-z0-9_-]{20,}$/i.test(seg);
      const label = isUuid ? 'Client profile' : labels[seg] || seg.replace(/-/g, ' ');
      crumbs.push({ label, to: isLast ? null : acc });
    });
    return crumbs;
  }, [location.pathname]);

  const filteredQuick = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    if (!q) return adminQuickLinks.slice(0, 8);
    return adminQuickLinks.filter(
      (l) => l.label.toLowerCase().includes(q) || l.to.toLowerCase().includes(q)
    );
  }, [searchQ]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setFs(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFs(false)).catch(() => {});
    }
  };

  return (
    <div className="admin-shell flex min-h-screen bg-[#eef1f6] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-white/60 bg-[#002D5B] text-white shadow-xl transition-transform duration-200 lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2562FF] to-[#0078C1] text-xs font-black tracking-widest shadow-lg">
            HRS
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Operations
            </div>
            <div className="font-display text-sm font-bold tracking-tight">Home Ready Scores</div>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {adminNavGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/35">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const badge = matchBadge(item, openTickets);
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                          ${isActive ? 'bg-white/12 text-white shadow-inner' : 'text-white/70 hover:bg-white/8 hover:text-white'}`
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        <span className="flex-1">{item.label}</span>
                        {badge != null && (
                          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                            {badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4 text-[11px] text-white/40">
          Credit repair operations suite
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md md:px-6">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden min-w-0 flex-1 items-center gap-1 text-sm text-slate-500 md:flex">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1 truncate">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />}
                {c.to ? (
                  <button
                    type="button"
                    onClick={() => navigate(c.to)}
                    className="truncate hover:text-[#2562FF]"
                  >
                    {c.label}
                  </button>
                ) : (
                  <span className="truncate font-semibold text-[#002D5B]">{c.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:ml-auto">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-500 transition hover:border-slate-300 md:min-w-[220px]"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden truncate md:inline">Quick find…</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"
              title={fs ? 'Exit full screen' : 'Full screen'}
            >
              {fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-semibold text-[#002D5B]">{user?.name || 'Team'}</div>
                <div className="max-w-[140px] truncate text-[10px] text-slate-500">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/portal/login');
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-[12vh] backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-slate-400"
                placeholder="Jump to module or client…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQ('');
                }}
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                Esc
              </button>
            </div>
            <ul className="max-h-72 overflow-auto py-2">
              {filteredQuick.map((l) => (
                <li key={l.to}>
                  <button
                    type="button"
                    className="flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      navigate(l.to);
                      setSearchOpen(false);
                      setSearchQ('');
                    }}
                  >
                    {l.label}
                    <span className="ml-auto text-xs text-slate-400">{l.to}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="Close"
            onClick={() => {
              setSearchOpen(false);
              setSearchQ('');
            }}
          />
        </div>
      )}

      {/* Help widget */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
        {helpOpen && (
          <div className="w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <p className="text-sm font-semibold text-[#002D5B]">Help & shortcuts</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Use quick search for modules. Client search lives on the dashboard and client list.
              Open Help Desk tickets from the sidebar badge.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2562FF] text-white shadow-lg transition hover:bg-[#1d52d8]"
          title="Help"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
