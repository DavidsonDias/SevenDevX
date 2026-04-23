import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const Projects = lazy(() => import("@/pages/Projects"));
const Store = lazy(() => import("@/pages/Store"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Fornecedores = lazy(() => import("@/pages/Fornecedores"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ProjectsAdmin = lazy(() => import("@/pages/admin/ProjectsAdmin"));
const ProjectsHub = lazy(() => import("@/pages/ProjectsHub"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  },
  exit: { 
    opacity: 0, y: -8, scale: 0.99,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="min-h-screen"
      >
        <Suspense fallback={<AppLoaderOrbital />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/store" element={<Store />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/projects-hub" element={<ProjectsHub />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/projects" element={
              <ProtectedRoute requiredRole="admin">
                <ProjectsAdmin />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL || "/"}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
