/**
 * AdminDashboard.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/AdminDashboard.tsx
 * @module Public
 * @route /admin
 *
 * @description
 * Dashboard do SevenOS: KPIs, insights e atividade recente.
 *
 * @see src/pages/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📊 Admin Dashboard - Painel Administrativo
 * SevenDevX Enterprise Edition
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, Eye, MessageCircle, TrendingUp, ArrowUp, ArrowDown,
  Calendar, Filter, Download, RefreshCw, LogOut, BarChart3,
  Mail, Phone, Clock, ChevronDown, ExternalLink, Home as HomeIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import AiInsightsBlock from "@/components/admin/AiInsightsBlock";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlobalSearch from "@/components/admin/GlobalSearch";
import KpiCards from "@/components/admin/KpiCards";
import GlassCard from "@/components/GlassCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import SmartInsights from "@/components/admin/SmartInsights";
import OnboardingChecklist from "@/modules/onboarding/OnboardingChecklist";
import OnboardingTour from "@/modules/onboarding/OnboardingTour";
import { ADMIN_TOUR } from "@/modules/onboarding/tourSteps";
import { StatsCardSkeleton } from "@/components/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  service_type: string | null;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalContacts: number;
  newContactsToday: number;
  totalPageViews: number;
  totalChatSessions: number;
  contactGrowth: number;
  viewsGrowth: number;
}

const COLORS = ["#ffffff", "#cccccc", "#999999", "#666666"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pageViewsData, setPageViewsData] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch contacts
        const { data: contactsData } = await supabase
          .from("contacts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (contactsData) {
          setContacts(contactsData as Contact[]);
        }

        // Fetch page views for chart
        const { data: viewsData } = await supabase
          .from("page_views")
          .select("created_at, page_path")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at");

        if (viewsData) {
          // Group by day
          const grouped = viewsData.reduce((acc: any, view) => {
            const date = new Date(view.created_at).toLocaleDateString("pt-BR", { weekday: "short" });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

          setPageViewsData(
            Object.entries(grouped).map(([name, views]) => ({ name, views }))
          );
        }

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: totalContacts },
          { count: newContactsToday },
          { count: totalPageViews },
          { count: totalChatSessions },
          { count: contactsLast30 },
          { count: contactsPrev30 },
          { count: viewsLast7 },
          { count: viewsPrev7 },
        ] = await Promise.all([
          supabase.from("contacts").select("*", { count: "exact", head: true }),
          supabase.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
          supabase.from("page_views").select("*", { count: "exact", head: true }),
          supabase.from("chat_conversations").select("*", { count: "exact", head: true }),
          supabase.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", monthAgo),
          supabase.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", twoMonthsAgo).lt("created_at", monthAgo),
          supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
          supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", twoWeeksAgo).lt("created_at", weekAgo),
        ]);

        const pctGrowth = (curr: number, prev: number) => {
          if (!prev) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 1000) / 10;
        };

        setStats({
          totalContacts: totalContacts || 0,
          newContactsToday: newContactsToday || 0,
          totalPageViews: totalPageViews || 0,
          totalChatSessions: totalChatSessions || 0,
          contactGrowth: pctGrowth(contactsLast30 || 0, contactsPrev30 || 0),
          viewsGrowth: pctGrowth(viewsLast7 || 0, viewsPrev7 || 0),
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for contacts
    const channel = supabase
      .channel("contacts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setContacts(prev => [payload.new as Contact, ...prev]);
            toast({
              title: "Novo lead!",
              description: `${(payload.new as Contact).name} acabou de entrar em contato`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filteredContacts = contacts.filter(contact => 
    statusFilter === "all" || contact.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-400";
      case "contacted": return "bg-yellow-500/20 text-yellow-400";
      case "qualified": return "bg-green-500/20 text-green-400";
      case "proposal": return "bg-purple-500/20 text-purple-400";
      case "closed": return "bg-emerald-500/20 text-emerald-400";
      case "lost": return "bg-red-500/20 text-red-400";
      default: return "bg-white/10 text-white/60";
    }
  };

  if (authLoading || (!user && !isAdmin)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Dashboard Admin - SevenDevX"
        description="Painel administrativo SevenDevX"
        url="https://www.sevendevx.com/admin"
      />

      <AdminPageShell
        title="Dashboard"
        subtitle="Painel Administrativo"
        backFallback="/"
        actions={
          <>
            <GlobalSearch />
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
              title="Abrir site"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              Ver site
            </Link>
            <button
              onClick={() => navigate("/admin/projects")}
              className="px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
            >
              Projetos
            </button>
            <button
              onClick={() => navigate("/admin/technologies")}
              className="hidden sm:inline-flex px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
            >
              Tech
            </button>
            <button
              onClick={() => navigate("/admin/tags")}
              className="hidden sm:inline-flex px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-xs uppercase tracking-wider"
            >
              Tags
            </button>
            <span className="text-sm text-white/60 hidden md:inline">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </>
        }
      >
        <div>
          <OnboardingChecklist />
          <OnboardingTour tourKey="admin_dashboard" steps={ADMIN_TOUR} />
          {/* KPIs avançados (#6) */}
          <KpiCards />

          {/* 🧠 Smart Insights — leads parados + previsão ponderada */}
          <SmartInsights />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : stats && (
              <>
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-white/60">Total Leads</span>
                    <Users className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalContacts}</div>
                  <div className={`flex items-center gap-1 text-xs ${stats.contactGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stats.contactGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(stats.contactGrowth)}% últimos 30d
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-white/60">Novos Hoje</span>
                    <Calendar className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.newContactsToday}</div>
                  <div className="text-xs text-white/40">leads recebidos</div>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-white/60">Page Views</span>
                    <Eye className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalPageViews}</div>
                  <div className={`flex items-center gap-1 text-xs ${stats.viewsGrowth >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stats.viewsGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(stats.viewsGrowth)}% últimos 7d
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-white/60">Chat Sessions</span>
                    <MessageCircle className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalChatSessions}</div>
                  <div className="text-xs text-white/40">conversas iniciadas</div>
                </GlassCard>
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <GlassCard>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Page Views (7 dias)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pageViewsData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#111", 
                        border: "1px solid #333",
                        borderRadius: "8px"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#fff" 
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Status dos Leads
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Novos", value: contacts.filter(c => c.status === "new").length },
                        { name: "Contatados", value: contacts.filter(c => c.status === "contacted").length },
                        { name: "Qualificados", value: contacts.filter(c => c.status === "qualified").length },
                        { name: "Fechados", value: contacts.filter(c => c.status === "closed").length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#111", 
                        border: "1px solid #333",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Activity Feed (audit log em tempo real) + AI Insights */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ActivityFeed />
            <AiInsightsBlock stats={stats} contactsCount={contacts.length} />
          </div>

          {/* Quick Access — Sistema Operacional */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {[
              { to: "/admin/clients", label: "Clientes", section: "CRM", desc: "Perfil + timeline + IA" },
              { to: "/admin/pipeline", label: "Pipeline", section: "Operação", desc: "Kanban de projetos" },
              { to: "/admin/projects", label: "Projetos", section: "Conteúdo", desc: "Cases e portfólio" },
              { to: "/admin/process", label: "Processo", section: "Engine", desc: "6 etapas + IA" },
              { to: "/admin/services", label: "Serviços", section: "CMS", desc: "Catálogo do site" },
              { to: "/admin/faq", label: "FAQ", section: "CMS", desc: "Perguntas dinâmicas" },
              { to: "/admin/technologies", label: "Tecnologias", section: "Registry", desc: "Logos oficiais" },
              { to: "/admin/tags", label: "Tags", section: "Registry", desc: "Categorias visuais" },
            ].map((c) => (
              <button
                key={c.to}
                onClick={() => navigate(c.to)}
                className="text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">{c.section}</div>
                <div className="text-base font-semibold mb-0.5">{c.label}</div>
                <div className="text-xs text-white/60">{c.desc}</div>
              </button>
            ))}
          </div>

          {/* Contacts Table */}
          <GlassCard padding="none">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold">Leads Recentes</h3>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="new">Novos</option>
                  <option value="contacted">Contatados</option>
                  <option value="qualified">Qualificados</option>
                  <option value="proposal">Em Proposta</option>
                  <option value="closed">Fechados</option>
                  <option value="lost">Perdidos</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-white/60">Nome</th>
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-white/60">Contato</th>
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-white/60">Serviço</th>
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-white/60">Status</th>
                    <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-white/60">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredContacts.map((contact) => (
                    <motion.tr 
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          {contact.company && (
                            <div className="text-sm text-white/50">{contact.company}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-white/40" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <Phone className="w-3 h-3 text-white/40" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/70">
                          {contact.service_type || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(contact.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  Nenhum lead encontrado
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </AdminPageShell>
    </>
  );
};

export default AdminDashboard;
