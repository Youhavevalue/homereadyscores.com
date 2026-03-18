import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Reviews from './pages/Reviews';
import GetStarted from './pages/GetStarted';

// Portal imports
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLogin from './pages/portal/PortalLogin';
import PortalDashboard from './pages/portal/PortalDashboard';
import ClientDirectory from './pages/portal/ClientDirectory';
import ClientProfile from './pages/portal/ClientProfile';
import AddClient from './pages/portal/AddClient';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper that conditionally hides Navbar/Footer for portal pages
const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isPortalPage = pathname.startsWith('/portal');

  return (
    <div className={isPortalPage ? '' : 'flex flex-col min-h-screen'}>
      {!isPortalPage && <Navbar />}
      <main className={isPortalPage ? '' : 'flex-grow'}>
        {children}
      </main>
      {!isPortalPage && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppLayout>
          <Routes>
            {/* Public website routes */}
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/get-started" element={<GetStarted />} />

            {/* Portal routes */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal" element={
              <ProtectedRoute><PortalDashboard /></ProtectedRoute>
            } />
            <Route path="/portal/clients" element={
              <ProtectedRoute><ClientDirectory /></ProtectedRoute>
            } />
            <Route path="/portal/clients/new" element={
              <ProtectedRoute><AddClient /></ProtectedRoute>
            } />
            <Route path="/portal/clients/:id" element={
              <ProtectedRoute><ClientProfile /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
