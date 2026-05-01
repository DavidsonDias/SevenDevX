import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useNavHistoryTracker } from "@/hooks/useSmartBack";

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
const ProjectDetailAdmin = lazy(() => import("@/pages/admin/ProjectDetailAdmin"));
const ProjectsDebug = lazy(() => import("@/pages/admin/ProjectsDebug"));
const TechnologiesAdmin = lazy(() => import("@/pages/admin/TechnologiesAdmin"));
const TagsAdmin = lazy(() => import("@/pages/admin/TagsAdmin"));
const ClientsAdmin = lazy(() => import("@/pages/admin/ClientsAdmin"));
const PipelineAdmin = lazy(() => import("@/pages/admin/PipelineAdmin"));
const ProcessAdmin = lazy(() => import("@/pages/admin/ProcessAdmin"));
const FaqAdmin = lazy(() => import("@/pages/admin/FaqAdmin"));
const ServicesAdmin = lazy(() => import("@/pages/admin/ServicesAdmin"));
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
  useNavHistoryTracker();

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
            <Route path="/admin/projects/debug" element={
              <ProtectedRoute requiredRole="admin"><ProjectsDebug /></ProtectedRoute>
            } />
            <Route path="/admin/projects/:id" element={
              <ProtectedRoute requiredRole="admin"><ProjectDetailAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/technologies" element={
              <ProtectedRoute requiredRole="admin">
                <TechnologiesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/tags" element={
              <ProtectedRoute requiredRole="admin">
                <TagsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute requiredRole="admin"><ClientsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/pipeline" element={
              <ProtectedRoute requiredRole="admin"><PipelineAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/process" element={
              <ProtectedRoute requiredRole="admin"><ProcessAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/faq" element={
              <ProtectedRoute requiredRole="admin"><FaqAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute requiredRole="admin"><ServicesAdmin /></ProtectedRoute>
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
