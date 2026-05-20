import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useNavHistoryTracker } from "@/hooks/useSmartBack";
import MobileBottomNav from "@/modules/layout/MobileBottomNav";
import GlobalFAB from "@/modules/layout/GlobalFAB";

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
const FinanceAdmin = lazy(() => import("@/pages/admin/FinanceAdmin"));
const IntegrationsAdmin = lazy(() => import("@/pages/admin/IntegrationsAdmin"));
const UsersAdmin = lazy(() => import("@/pages/admin/UsersAdmin"));
const ContactCenterAdmin = lazy(() => import("@/pages/admin/ContactCenterAdmin"));
const WebhooksAdmin = lazy(() => import("@/pages/admin/WebhooksAdmin"));
const LogsAdmin = lazy(() => import("@/pages/admin/LogsAdmin"));
const SessionsAdmin = lazy(() => import("@/pages/admin/SessionsAdmin"));
const SecurityAdmin = lazy(() => import("@/pages/admin/SecurityAdmin"));
const SystemHealthAdmin = lazy(() => import("@/pages/admin/SystemHealthAdmin"));
const EventsAdmin = lazy(() => import("@/pages/admin/EventsAdmin"));
const AutomationsAdmin = lazy(() => import("@/pages/admin/AutomationsAdmin"));
const IncidentsAdmin = lazy(() => import("@/pages/admin/IncidentsAdmin"));
const AiOpsAdmin = lazy(() => import("@/pages/admin/AiOpsAdmin"));
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
            <Route path="/admin/financeiro" element={
              <ProtectedRoute requiredRole="admin"><FinanceAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/integrations" element={
              <ProtectedRoute requiredRole="admin"><IntegrationsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin"><UsersAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/contact-center" element={
              <ProtectedRoute requiredRole="admin"><ContactCenterAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/webhooks" element={
              <ProtectedRoute requiredRole="admin"><WebhooksAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute requiredRole="admin"><LogsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/sessions" element={
              <ProtectedRoute requiredRole="admin"><SessionsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/security" element={
              <ProtectedRoute requiredRole="admin"><SecurityAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/system-health" element={
              <ProtectedRoute requiredRole="admin"><SystemHealthAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute requiredRole="admin"><EventsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/automations" element={
              <ProtectedRoute requiredRole="admin"><AutomationsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/incidents" element={
              <ProtectedRoute requiredRole="admin"><IncidentsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/ai-ops" element={
              <ProtectedRoute requiredRole="admin"><AiOpsAdmin /></ProtectedRoute>
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
