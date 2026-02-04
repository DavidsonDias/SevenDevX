/**
 * 📝 Blog - Sistema de Blog Enterprise
 * SevenDevX Enterprise Edition
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, Eye, Tag, Search, Filter, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatbot from "@/components/AIChatbot";
import SEOHead from "@/components/SEOHead";
import GlassCard from "@/components/GlassCard";
import { BlogPostSkeleton } from "@/components/SkeletonLoader";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
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

const Blog = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch published posts
      let query = supabase
        .from("blog_posts")
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image,
          published_at,
          read_time,
          views_count,
          tags,
          category:blog_categories(name, slug, color)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data: postsData } = await query;
      
      if (postsData) {
        // Transform the data to handle the category array
        const transformedPosts: BlogPost[] = postsData.map(post => ({
          ...post,
          category: Array.isArray(post.category) ? post.category[0] || null : post.category
        }));
        setPosts(transformedPosts);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  // Filter posts by search
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <SEOHead
        title="Blog - SevenDevX | Artigos sobre Tecnologia e Desenvolvimento"
        description="Descubra artigos sobre desenvolvimento web, tecnologia, design e negócios. Dicas, tutoriais e insights da equipe SevenDevX."
        keywords="blog tecnologia, desenvolvimento web, tutoriais, react, typescript, ui ux"
        url="https://www.sevendevx.com/blog"
        type="website"
      />

      <div className="min-h-screen bg-black text-white">
        <Header />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-20 border-b border-white/10">
            <div className="container mx-auto px-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainerVariants}
                className="max-w-4xl"
              >
                <motion.span 
                  variants={fadeInUpVariants}
                  custom={0}
                  className="text-sm uppercase tracking-widest text-white/60 mb-4 block"
                >
                  Blog & Insights
                </motion.span>
                <motion.h1 
                  variants={fadeInUpVariants}
                  custom={1}
                  className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tight"
                >
                  Conhecimento <br />
                  <span className="text-white/60">que Transforma</span>
                </motion.h1>
                <motion.p 
                  variants={fadeInUpVariants}
                  custom={2}
                  className="text-lg text-white/70 max-w-2xl"
                >
                  Artigos, tutoriais e insights sobre desenvolvimento, design e tecnologia. 
                  Compartilhamos nossa experiência para ajudar você a crescer.
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Filters Section */}
          <section className="py-8 border-b border-white/10 sticky top-16 bg-black/95 backdrop-blur-lg z-30">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar artigos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      !selectedCategory 
                        ? "bg-white text-black" 
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        selectedCategory === category.id 
                          ? "bg-white text-black" 
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Posts Grid */}
          <section className="py-20">
            <div className="container mx-auto px-6">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <BlogPostSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainerVariants}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredPosts.map((post, i) => (
                    <motion.article
                      key={post.id}
                      variants={fadeInUpVariants}
                      custom={i}
                    >
                      <Link to={`/blog/${post.slug}`}>
                        <GlassCard className="h-full overflow-hidden group" padding="none">
                          {/* Cover Image */}
                          <div className="aspect-video overflow-hidden bg-white/5">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl opacity-20">📝</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-4">
                            {/* Category & Tags */}
                            <div className="flex gap-2 flex-wrap">
                              {post.category && (
                                <span 
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{ 
                                    backgroundColor: `${post.category.color}20`,
                                    color: post.category.color 
                                  }}
                                >
                                  {post.category.name}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold group-hover:text-white/80 transition-colors line-clamp-2">
                              {post.title}
                            </h2>

                            {/* Excerpt */}
                            {post.excerpt && (
                              <p className="text-white/60 text-sm line-clamp-3">
                                {post.excerpt}
                              </p>
                            )}

                            {/* Meta */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/50">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(post.published_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {post.read_time || 5} min
                                </span>
                              </div>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views_count || 0}
                              </span>
                            </div>

                            {/* Read More */}
                            <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                              Ler artigo
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-white/60">
                    {searchQuery 
                      ? `Não encontramos resultados para "${searchQuery}"`
                      : "Novos artigos em breve!"}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 border-t border-white/10">
            <div className="container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase">
                  Quer Conteúdo Exclusivo?
                </h2>
                <p className="text-white/70 mb-8">
                  Entre em contato e descubra como podemos ajudar seu projeto a crescer.
                </p>
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-2 border-2 border-white px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all"
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
