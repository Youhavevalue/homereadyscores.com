import { Inbox, Users, UserPlus, GraduationCap, Headphones, FileText, BarChart3, CircleHelp } from 'lucide-react';
export const adminNavGroups = [
  { id: 'workspace', label: 'Workspace', items: [
    { to: '/admin', label: 'Enrollments', icon: Inbox, end: true },
    { to: '/admin/reports', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/credit-funnel', label: 'Credit-help requests', icon: Inbox },
    { to: '/admin/clients', label: 'Clients', icon: Users },
    { to: '/admin/prospects', label: 'Prospects', icon: UserPlus },
  ] },
  { id: 'manage', label: 'Manage', items: [
    { to: '/admin/contracts', label: 'Agreements', icon: FileText },
    { to: '/admin/help-desk', label: 'Team help desk', icon: Headphones },
    { to: '/admin/training', label: 'Training', icon: GraduationCap },
  ] },
  { id: 'guidance', label: 'Getting oriented', items: [
    { to: '/admin/guide', label: 'System guide', icon: CircleHelp },
  ] },
];
export const adminQuickLinks = [
  { to: '/admin', label: 'Enrollments' },
  { to: '/admin/reports', label: 'Analytics and reports' },
  { to: '/admin/credit-funnel', label: 'Credit-help requests' },
  { to: '/admin/clients', label: 'All clients' },
  { to: '/admin/clients/new', label: 'Add pending client' },
  { to: '/admin/clients/joint', label: 'Add pending joint clients' },
  { to: '/admin/prospects', label: 'Prospects' },
  { to: '/admin/help-desk', label: 'Team help desk' },
  { to: '/admin/training', label: 'Training' },
  { to: '/admin/contracts', label: 'Agreements' },
  { to: '/admin/guide', label: 'Login, email and system guide' },
];
export const adminHubLinks = [];
