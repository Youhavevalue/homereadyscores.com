import {
  LayoutDashboard,
  Users,
  UserPlus,
  Handshake,
  Building2,
  HelpCircle,
  Headphones,
  Calendar,
  Globe,
  Shield,
  Mail,
  Plug,
  FileText,
  BarChart3,
  Settings,
  Link2,
  ScrollText,
} from 'lucide-react';

/**
 * Sidebar navigation — mirrors LegacyCredits-style module map.
 * `badge` is optional (e.g. open tickets).
 */
export const adminNavGroups = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    id: 'people',
    label: 'People & partners',
    items: [
      { to: '/admin/clients', label: 'Clients', icon: Users },
      { to: '/admin/prospects', label: 'Prospects', icon: UserPlus },
      { to: '/admin/affiliates', label: 'Affiliates', icon: Handshake },
      { to: '/admin/brokers', label: 'Brokers', icon: Building2 },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { to: '/admin/faq', label: 'FAQ', icon: HelpCircle },
      { to: '/admin/help-desk', label: 'Help Desk', icon: Headphones, badgeKey: 'openTickets' },
      { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    id: 'content',
    label: 'Content & letters',
    items: [
      { to: '/admin/cms', label: 'Web CMS', icon: Globe },
      { to: '/admin/letters', label: 'Letter system', icon: ScrollText },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { to: '/admin/system', label: 'System admin', icon: Shield },
      { to: '/admin/autoresponders', label: 'Autoresponders', icon: Mail },
      { to: '/admin/api', label: 'API', icon: Plug },
    ],
  },
];

/** Flat list for search / quick jump */
export const adminQuickLinks = [
  { to: '/admin/clients', label: 'All clients' },
  { to: '/admin/clients/new', label: 'Add client' },
  { to: '/admin/clients/joint', label: 'Add joint client' },
  { to: '/admin/prospects/new', label: 'Add prospect' },
  { to: '/admin/affiliates/new', label: 'Add affiliate' },
  { to: '/admin/brokers/new', label: 'Add broker' },
  { to: '/admin/help-desk', label: 'Open tickets' },
  { to: '/admin/settings', label: 'System settings' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/communication', label: 'Communication' },
];

/** Sub-nav for /admin/system hub */
export const adminHubLinks = [
  { to: '/admin/contracts', label: 'Contracts', icon: FileText },
  { to: '/admin/invoices', label: 'Invoices', icon: FileText },
  { to: '/admin/settings', label: 'System settings', icon: Settings },
  { to: '/admin/system-emails', label: 'System emails', icon: Mail },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/communication', label: 'Communication', icon: Headphones },
  { to: '/admin/letter-menu', label: 'Letter menu', icon: ScrollText },
  { to: '/admin/hotlinks', label: 'Hotlinks', icon: Link2 },
];
