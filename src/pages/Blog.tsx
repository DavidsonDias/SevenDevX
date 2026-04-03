/**
 * 📝 Blog — SevenDevX Elite Content Hub
 * Apple/Stripe/Vercel-inspired blog experience
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, Eye, Search, ArrowRight, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatbot from "@/components/AIChatbot";
import SEOHead from "@/components/SEOHead";
import { BlogPostSkeleton } from "@/components/SkeletonLoader";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import { fadeInUpVariants, staggerContainerVariants } from "@/components/PageTransition";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  read_time: number | null;
  views_count: number | null;
  tags: string[];
  category: {
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  "frontend-engineering": "Frontend Engineering",
  "backend-apis": "Backend & APIs",
  "ux-product": "UX & Product",
  "performance": "Performance",
  "saas-arquitetura": "SaaS & Arquitetura",
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ── Featured Article (Hero) ── */
const FeaturedArticle = ({ post }: { post: BlogPost }) => (
  <Link to={`/blog/${post.slug}`} className="group block">
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative aspect-video lg:aspect-auto lg:min-h-[420px] overflow-hidden">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted/20 flex items-center justify-center">
              <span className="text-6xl opacity-10">✍️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent lg:hidden" />
        </div>

        <div className="flex flex-col justify-center p-8 lg:p-12 space-y-5">
          <div className="flex items-center gap-3">
            {post.category && (
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${post.category.color}15`,
                  color: post.category.color,
                  border: `1px solid ${post.category.color}30`,
                }}
              >
                {post.category.name}
              </span>
            )}
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Artigo em Destaque
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight group-hover:text-primary/90 transition-colors">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm lg:text-base">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time || 5} min
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {post.views_count || 0}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors pt-2">
            Ler artigo completo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.article>
  </Link>
);

/* ── Article Card (Grid) ── */
const ArticleCard = ({ post, index, variant = "default" }: { post: BlogPost; index: number; variant?: "default" | "wide" }) => (
  <motion.article
    variants={fadeInUpVariants}
    custom={index}
    className={variant === "wide" ? "md:col-span-2" : ""}
  >
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <div className={`h-full overflow-hidden rounded-xl border border-border/20 bg-card/30 backdrop-blur-sm hover:border-border/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        variant === "wide" ? "grid grid-cols-1 md:grid-cols-2" : ""
      }`}>
        <div className={`overflow-hidden bg-muted/10 ${variant === "wide" ? "aspect-video md:aspect-auto" : "aspect-video"}`}>
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center min-h-[180px]">
              <span className="text-4xl opacity-10">📝</span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-3 flex flex-col justify-center">
          {post.category && (
            <span
              className="self-start px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `${post.category.color}12`,
                color: post.category.color,
              }}
            >
              {post.category.name}
            </span>
          )}

          <h3 className="text-lg font-bold leading-snug group-hover:text-primary/90 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/10 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.read_time || 5} min
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  </motion.article>
);

/* ── Main Blog Page ── */
const Blog = () => {
  const { t } = useLanguage();
  useAnalytics();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const { data: categoriesData } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (categoriesData) setCategories(categoriesData);

      let query = supabase
        .from("blog_posts")
        .select(`
          id, title, slug, excerpt, cover_image, published_at,
          read_time, views_count, tags,
          category:blog_categories(name, slug, color)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data: postsData } = await query;

      if (postsData) {
        const transformedPosts: BlogPost[] = postsData.map(post => ({
          ...post,
          category: Array.isArray(post.category) ? post.category[0] || null : post.category,
        }));
        setPosts(transformedPosts);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts;
    const q = debouncedSearch.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q) ||
      post.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [posts, debouncedSearch]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <>
      <SEOHead
        title="Blog — SevenDevX | Engenharia, Design & Performance"
        description="Artigos técnicos sobre desenvolvimento web, UX, performance e arquitetura de software. Conteúdo que gera resultado real."
        keywords="blog tecnologia, desenvolvimento web, react, typescript, ux, performance, saas"
        url="https://www.sevendevx.com/blog"
        type="website"
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="py-16 md:py-24 border-b border-border/10">
            <div className="container mx-auto px-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainerVariants}
                className="max-w-3xl"
              >
                <motion.span
                  variants={fadeInUpVariants}
                  custom={0}
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 block"
                >
                  Blog & Insights
                </motion.span>
                <motion.h1
                  variants={fadeInUpVariants}
                  custom={1}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.05]"
                >
                  Engenharia que{" "}
                  <span className="text-muted-foreground">gera resultado</span>
                </motion.h1>
                <motion.p
                  variants={fadeInUpVariants}
                  custom={2}
                  className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
                >
                  Artigos técnicos, estudos de caso e insights práticos sobre
                  desenvolvimento, design e performance.
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Filters — Sticky */}
          <section className="py-5 border-b border-border/10 sticky top-16 bg-background/95 backdrop-blur-xl z-30">
            <div className="container mx-auto px-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Buscar artigos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/10 border border-border/20 rounded-lg text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !selectedCategory
                        ? "bg-foreground text-background"
                        : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === category.id
                          ? "bg-foreground text-background"
                          : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-6">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <BlogPostSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-16">
                  {/* Featured */}
                  {featuredPost && !debouncedSearch && (
                    <FeaturedArticle post={featuredPost} />
                  )}

                  {/* Asymmetric Grid */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {(debouncedSearch ? filteredPosts : gridPosts).map((post, i) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                        index={i}
                        variant={!debouncedSearch && i === 0 ? "wide" : "default"}
                      />
                    ))}
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <div className="text-5xl mb-4 opacity-20">🔍</div>
                  <h3 className="text-xl font-bold mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? `Sem resultados para "${searchQuery}"`
                      : "Novos artigos em breve."}
                  </p>
                </motion.div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 border-t border-border/10">
            <div className="container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-lg mx-auto"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                  Quer conteúdo exclusivo?
                </h2>
                <p className="text-muted-foreground mb-8 text-sm">
                  Entre em contato e descubra como podemos ajudar seu projeto a crescer.
                </p>
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-2 border-2 border-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Fale Conosco
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />
        <AIChatbot />
      </div>
    </>
  );
};

export default Blog;
