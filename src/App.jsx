import React, { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import './public-site.css';
import BrandLogo from './components/BrandLogo';
import PageMetadata from './components/PageMetadata';
import WebsiteTracking from './components/WebsiteTracking';
import NotFound from './pages/NotFound';
import ThankYou from './pages/ThankYou';
import Footer from './components/Footer';
import Home from './pages/Home';
import { Articles, ArticleDetail, Resources, CreditScore, ClientLogin } from './pages/PublicResources';
import Reviews from './pages/Reviews';
import GetStarted from './pages/GetStarted';
import CreditFunnel from './pages/CreditFunnel';
import FAQ from './pages/FAQ';

// Legal Imports
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import FCRARights from './pages/legal/FCRARights';
import CROADisclosure from './pages/legal/CROADisclosure';

import { AuthProvider } from './context/AuthContext';
import { AdminToastProvider } from './admin/context/AdminToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteLoadBoundary from './components/RouteLoadBoundary';
// Private workflow code is fetched only when its route is opened.
const PortalLogin = lazy(() => import('./pages/portal/PortalLogin'));
const AddClient = lazy(() => import('./pages/portal/AddClient'));
const AdminJointClient = lazy(() => import('./admin/pages/AdminJointClient'));
const ProspectsPage = lazy(() => import('./admin/pages/AdminMarketingPages').then(module => ({ default: module.ProspectsPage })));
const ProspectNewPage = lazy(() => import('./admin/pages/AdminMarketingPages').then(module => ({ default: module.ProspectNewPage })));
const HelpDeskPage = lazy(() => import('./admin/pages/AdminOpsPages').then(module => ({ default: module.HelpDeskPage })));
const HelpDeskAllPage = lazy(() => import('./admin/pages/AdminOpsPages').then(module => ({ default: module.HelpDeskAllPage })));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminRequests = lazy(() => import('./admin/pages/AdminRequests'));
const AdminClientsList = lazy(() => import('./admin/pages/AdminClientsList'));
const AdminClientDetail = lazy(() => import('./admin/pages/AdminClientDetail'));
const AdminTrainingPage = lazy(() => import('./admin/pages/AdminTrainingPage'));
const AdminDeferred = lazy(() => import('./admin/pages/AdminDeferred'));
const AdminReports = lazy(() => import('./admin/pages/AdminReports'));
const AdminGuide = lazy(() => import('./admin/pages/AdminGuide'));
const AdminFunnel = lazy(() => import('./admin/pages/AdminFunnel'));
const AdminContracts = lazy(() => import('./admin/pages/AdminContracts'));
const ContractSigning = lazy(() => import('./pages/ContractSigning'));

function EnrollmentPage() {
  const {search} = useLocation();
  return <GetStarted funnelMode={new URLSearchParams(search).get('funnel') === '1'} cardStepPreview={import.meta.env.DEV && import.meta.env.VITE_HRS_CARD_STEP_PREVIEW === 'true'} />;
}

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
  const hideChrome = pathname.startsWith('/portal') || pathname.startsWith('/admin') || pathname === '/sign-contract';

  const isFunnel = pathname === '/credit-help';
  const Content = hideChrome ? 'div' : 'main';

  return (
    <div className={hideChrome ? 'staff-site' : 'public-site flex min-h-screen flex-col'}>
      {!hideChrome && !isFunnel && <Navbar />}
      <Content id={hideChrome ? undefined : "public-main"} className={hideChrome ? '' : 'flex-grow'}><RouteLoadBoundary key={pathname}>{children}</RouteLoadBoundary></Content>
      {!hideChrome && !isFunnel && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AdminToastProvider>
      <Router>
        <ScrollToTop />
      <PageMetadata />
      <WebsiteTracking />
        <AppLayout>
          <Suspense fallback={<div className="p-8 text-navy"><BrandLogo width={216} /><p role="status" className="mt-4">Loading page…</p></div>}>
          <Routes>
            {/* Public website routes */}
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<Navigate to="/get-started" replace />} />
            <Route path="/articles" element={<Articles/>}/>
            <Route path="/articles/:slug" element={<ArticleDetail/>}/>
            <Route path="/resources" element={<Resources/>}/>
            <Route path="/get-your-credit-score" element={<CreditScore/>}/>
            <Route path="/client-login" element={<ClientLogin/>}/>
            <Route path="/about-results" element={<Navigate to="/reviews" replace/>}/>
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/credit-help" element={<CreditFunnel />} />
            <Route path="/get-started" element={<EnrollmentPage />} />
                <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Legal routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/fcra-rights" element={<FCRARights />} />
            <Route path="/croa-disclosure" element={<CROADisclosure />} />

            {/* Auth */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/sign-contract" element={<ContractSigning />} />

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

            {/* Protected staff operations; unfinished modules have an explicit deferred page. */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminRequests />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="credit-funnel" element={<AdminFunnel />} />
              <Route path="training" element={<AdminTrainingPage />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="guide" element={<AdminGuide />} />
              <Route path="contracts" element={<AdminContracts />} />
              <Route path="clients" element={<AdminClientsList />} />
              <Route path="clients/new" element={<AddClient />} />
              <Route path="clients/joint" element={<AdminJointClient />} />
              <Route path="clients/:id" element={<AdminClientDetail />} />
              <Route path="prospects" element={<ProspectsPage />} />
              <Route path="prospects/new" element={<ProspectNewPage />} />
              <Route path="help-desk" element={<HelpDeskPage />} />
              <Route path="help-desk/all" element={<HelpDeskAllPage />} />
              <Route path="appointments" element={<Navigate to="/admin/requests" replace />} />
              <Route path="*" element={<AdminDeferred />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AppLayout>
      </Router>
      </AdminToastProvider>
    </AuthProvider>
  );
};

export default App;
