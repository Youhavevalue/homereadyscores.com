import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Reviews from './pages/Reviews';
import GetStarted from './pages/GetStarted';
import FAQ from './pages/FAQ';

// Legal Imports
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import FCRARights from './pages/legal/FCRARights';
import CROADisclosure from './pages/legal/CROADisclosure';

// Portal imports
import { AuthProvider } from './context/AuthContext';
import { AdminToastProvider } from './admin/context/AdminToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLogin from './pages/portal/PortalLogin';
import AddClient from './pages/portal/AddClient';

// Admin shell
import AdminLayout from './admin/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import AdminClientsList from './admin/pages/AdminClientsList';
import AdminClientDetail from './admin/pages/AdminClientDetail';
import AdminJointClient from './admin/pages/AdminJointClient';
import AdminSystemHub from './admin/pages/AdminSystemHub';
import AdminAutorespondersPage from './admin/pages/AdminAutorespondersPage';
import AdminAPIPage from './admin/pages/AdminAPIPage';
import {
  ProspectsPage,
  ProspectNewPage,
  AffiliatesPage,
  AffiliateNewPage,
  AffiliateReferralsPage,
  BrokersPage,
  BrokerNewPage,
  BrokerGlobalPage,
  BrokerReferralReportPage,
  BrokerCreationReportPage,
} from './admin/pages/AdminMarketingPages';
import {
  FAQAdminPage,
  HelpDeskPage,
  HelpDeskAllPage,
  AppointmentsPage,
} from './admin/pages/AdminOpsPages';
import {
  CMSPage,
  LettersHubPage,
  LetterMenuPage,
  HotlinksPage,
} from './admin/pages/AdminContentPages';
import {
  ContractsPage,
  InvoicesPage,
  SettingsPage,
  SystemEmailsPage,
  UsersPage,
  ReportsPage,
  CommunicationPage,
} from './admin/pages/AdminSystemPages';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function PortalClientRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/clients/${id}`} replace />;
}

// Layout wrapper that conditionally hides Navbar/Footer for team / portal pages
const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const hideChrome = pathname.startsWith('/portal') || pathname.startsWith('/admin');

  return (
    <div className={hideChrome ? '' : 'flex min-h-screen flex-col'}>
      {!hideChrome && <Navbar />}
      <main className={hideChrome ? '' : 'flex-grow'}>{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AdminToastProvider>
      <Router>
        <ScrollToTop />
        <AppLayout>
          <Routes>
            {/* Public website routes */}
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Legal routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/fcra-rights" element={<FCRARights />} />
            <Route path="/croa-disclosure" element={<CROADisclosure />} />

            {/* Auth */}
            <Route path="/portal/login" element={<PortalLogin />} />

            {/* Legacy portal paths → admin */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/clients"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/clients" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/clients/new"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/clients/new" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/clients/:id"
              element={
                <ProtectedRoute>
                  <PortalClientRedirect />
                </ProtectedRoute>
              }
            />

            {/* Admin panel (full LegacyCredits-style module map) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="clients" element={<AdminClientsList />} />
              <Route path="clients/new" element={<AddClient />} />
              <Route path="clients/joint" element={<AdminJointClient />} />
              <Route path="clients/:id" element={<AdminClientDetail />} />

              <Route path="prospects" element={<ProspectsPage />} />
              <Route path="prospects/new" element={<ProspectNewPage />} />

              <Route path="affiliates" element={<AffiliatesPage />} />
              <Route path="affiliates/new" element={<AffiliateNewPage />} />
              <Route path="affiliates/referrals" element={<AffiliateReferralsPage />} />

              <Route path="brokers" element={<BrokersPage />} />
              <Route path="brokers/new" element={<BrokerNewPage />} />
              <Route path="brokers/global" element={<BrokerGlobalPage />} />
              <Route path="brokers/referrals" element={<BrokerReferralReportPage />} />
              <Route path="brokers/creation-report" element={<BrokerCreationReportPage />} />

              <Route path="faq" element={<FAQAdminPage />} />
              <Route path="help-desk" element={<HelpDeskPage />} />
              <Route path="help-desk/all" element={<HelpDeskAllPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />

              <Route path="cms" element={<CMSPage />} />
              <Route path="letters" element={<LettersHubPage />} />

              <Route path="system" element={<AdminSystemHub />} />

              <Route path="autoresponders" element={<Navigate to="/admin/autoresponders/prospect" replace />} />
              <Route path="autoresponders/:type" element={<AdminAutorespondersPage />} />

              <Route path="api" element={<Navigate to="/admin/api/deferred" replace />} />
              <Route path="api/:section" element={<AdminAPIPage />} />

              <Route path="contracts" element={<ContractsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="system-emails" element={<SystemEmailsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="communication" element={<CommunicationPage />} />
              <Route path="letter-menu" element={<LetterMenuPage />} />
              <Route path="hotlinks" element={<HotlinksPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AppLayout>
      </Router>
      </AdminToastProvider>
    </AuthProvider>
  );
};

export default App;
