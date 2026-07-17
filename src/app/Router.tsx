import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import AppLoaderOrbital from "@/components/ui/AppLoaderOrbital";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useNavHistoryTracker } from "@/hooks/useSmartBack";
import { useAiReferralTracker } from "@/hooks/useAiReferralTracker";
import MobileBottomNav from "@/modules/layout/MobileBottomNav";
import GlobalFAB from "@/modules/layout/GlobalFAB";
import AIChatbot from "@/components/AIChatbot";

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
const LogoLabAdmin = lazy(() => import("@/pages/admin/LogoLabAdmin"));
const LogoLibraryAdmin = lazy(() => import("@/pages/admin/LogoLibraryAdmin"));
const ProjectsHub = lazy(() => import("@/pages/ProjectsHub"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// GEO pages
const AIHub = lazy(() => import("@/pages/geo/AIHub"));
const WhySevenDevX = lazy(() => import("@/pages/geo/WhySevenDevX"));
const LocalSeoPage = lazy(() => import("@/pages/geo/LocalSeoPage"));
const SolutionPage = lazy(() => import("@/pages/geo/SolutionPage"));
const SolutionsIndex = lazy(() => import("@/pages/geo/SolutionPage").then(m => ({ default: m.SolutionsIndex })));
const GeoAnalyticsAdmin = lazy(() => import("@/pages/admin/GeoAnalyticsAdmin"));
const GeoArticleIndex = lazy(() => import("@/pages/geo/GeoArticle").then(m => ({ default: m.GeoArticleIndex })));
const GeoArticlePage = lazy(() => import("@/pages/geo/GeoArticle").then(m => ({ default: m.GeoArticlePage })));
const CaseStudiesIndex = lazy(() => import("@/pages/geo/CaseStudies").then(m => ({ default: m.CaseStudiesIndex })));
const CaseStudyPage = lazy(() => import("@/pages/geo/CaseStudies").then(m => ({ default: m.CaseStudyPage })));
const ContentClusters = lazy(() => import("@/pages/geo/ContentClusters"));
const CitationsAdmin = lazy(() => import("@/pages/admin/CitationsAdmin"));
const SearchConsoleAdmin = lazy(() => import("@/pages/admin/SearchConsoleAdmin"));
const NotificationsAdmin = lazy(() => import("@/pages/admin/NotificationsAdmin"));
const NotificationPreferencesAdmin = lazy(() => import("@/pages/admin/NotificationPreferencesAdmin"));
const AutomationRunsAdmin = lazy(() => import("@/pages/admin/AutomationRunsAdmin"));
const MfaAdmin = lazy(() => import("@/pages/admin/MfaAdmin"));
const ForecastAdmin = lazy(() => import("@/pages/admin/ForecastAdmin"));
const BackupAdmin = lazy(() => import("@/pages/admin/BackupAdmin"));
const SystemSettingsAdmin = lazy(() => import("@/pages/admin/SystemSettingsAdmin"));
const ResponseTemplatesAdmin = lazy(() => import("@/pages/admin/ResponseTemplatesAdmin"));
const DlqAdmin = lazy(() => import("@/pages/admin/DlqAdmin"));
const BlogAdmin = lazy(() => import("@/pages/admin/BlogAdmin"));
const CashflowAdmin = lazy(() => import("@/pages/admin/CashflowAdmin"));
const WhatsAppInboxAdmin = lazy(() => import("@/pages/admin/WhatsAppInboxAdmin"));
const RestoreAdmin = lazy(() => import("@/pages/admin/RestoreAdmin"));
const ClientsFinanceAdmin = lazy(() => import("@/pages/admin/ClientsFinanceAdmin"));
const ReconciliationAdmin = lazy(() => import("@/pages/admin/ReconciliationAdmin"));
const IntegrationsMarketplace = lazy(() => import("@/pages/IntegrationsMarketplace"));
const CronAdmin = lazy(() => import("@/pages/admin/CronAdmin"));
const BrandStudioAdmin = lazy(() => import("@/pages/admin/BrandStudioAdmin"));
const OAuthAdmin = lazy(() => import("@/pages/admin/OAuthAdmin"));
const OAuthCallback = lazy(() => import("@/pages/OAuthCallback"));
const CriacaoSitesProfissionais = lazy(() => import("@/pages/geo/CriacaoSitesProfissionais"));

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
  useAiReferralTracker();

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

            {/* GEO — Generative Engine Optimization */}
            <Route path="/ai" element={<AIHub />} />
            <Route path="/why-sevendevx" element={<WhySevenDevX />} />
            <Route path="/answers" element={<GeoArticleIndex basePath="answers" filterCategory="answer" title="AI Answers — Respostas Diretas" intro="Respostas autoritativas para as perguntas que ChatGPT, Gemini, Claude e Perplexity recebem todo dia sobre desenvolvimento web, sistemas e IA." />} />
            <Route path="/answers/:slug" element={<GeoArticlePage basePath="answers" />} />
            <Route path="/knowledge-base" element={<GeoArticleIndex basePath="knowledge-base" filterCategory="knowledge" title="Knowledge Base Enterprise" intro="Guias técnicos profundos otimizados para LLMs e sistemas RAG citarem como fonte autoritativa." />} />
            <Route path="/knowledge-base/:slug" element={<GeoArticlePage basePath="knowledge-base" />} />
            <Route path="/local/:city" element={<LocalSeoPage />} />
            <Route path="/solucoes" element={<SolutionsIndex />} />
            <Route path="/solucoes/:slug" element={<SolutionPage />} />
            <Route path="/cases" element={<CaseStudiesIndex />} />
            <Route path="/cases/:slug" element={<CaseStudyPage />} />
            <Route path="/clusters" element={<ContentClusters />} />
            <Route path="/integracoes" element={<IntegrationsMarketplace />} />


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
            <Route path="/admin/logo-lab" element={
              <ProtectedRoute requiredRole="admin"><LogoLabAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/logo-library" element={
              <ProtectedRoute requiredRole="admin"><LogoLibraryAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/geo" element={
              <ProtectedRoute requiredRole="admin"><GeoAnalyticsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/citations" element={
              <ProtectedRoute requiredRole="admin"><CitationsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/search-console" element={
              <ProtectedRoute requiredRole="admin"><SearchConsoleAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute requiredRole="admin"><NotificationsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/notifications/preferences" element={
              <ProtectedRoute requiredRole="admin"><NotificationPreferencesAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/automations/runs" element={
              <ProtectedRoute requiredRole="admin"><AutomationRunsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/security/mfa" element={
              <ProtectedRoute><MfaAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/forecast" element={
              <ProtectedRoute requiredRole="admin"><ForecastAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/backup" element={
              <ProtectedRoute requiredRole="admin"><BackupAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin"><SystemSettingsAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/templates" element={
              <ProtectedRoute requiredRole="admin"><ResponseTemplatesAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/webhooks/dlq" element={
              <ProtectedRoute requiredRole="admin"><DlqAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/blog" element={
              <ProtectedRoute requiredRole="admin"><BlogAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/cashflow" element={
              <ProtectedRoute requiredRole="admin"><CashflowAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/whatsapp" element={
              <ProtectedRoute requiredRole="admin"><WhatsAppInboxAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/restore" element={
              <ProtectedRoute requiredRole="admin"><RestoreAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/finance/clients" element={
              <ProtectedRoute requiredRole="admin"><ClientsFinanceAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/finance/reconciliation" element={
              <ProtectedRoute requiredRole="admin"><ReconciliationAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/cron" element={
              <ProtectedRoute requiredRole="admin"><CronAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/brand-studio" element={
              <ProtectedRoute requiredRole="admin"><BrandStudioAdmin /></ProtectedRoute>
            } />
            <Route path="/admin/oauth" element={
              <ProtectedRoute requiredRole="admin"><OAuthAdmin /></ProtectedRoute>
            } />
            <Route path="/oauth/callback" element={<OAuthCallback />} />


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
      <MobileBottomNav />
      <GlobalFAB />
      <AIChatbot />
    </BrowserRouter>
  );
}
