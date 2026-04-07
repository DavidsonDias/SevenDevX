/**
 * 📝 BlogPost — Elite Article Reading Experience
 * Vercel/Stripe-inspired: progress bar, premium typography, author section
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Calendar, Clock, Eye, ArrowLeft, Share2, Tag, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatbot from "@/components/AIChatbot";
import SEOHead from "@/components/SEOHead";
import { BlogPostSkeleton } from "@/components/SkeletonLoader";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
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
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const formatDate = (dateString: string | null, lang: string) => {
  if (!dateString) return "";
  const locale = lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US";
  return new Date(dateString).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  const [readProgress, setReadProgress] = useState(0);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById("article-content");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setReadProgress(Math.min(Math.max(scrolled / total, 0), 1) * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setIsLoading(true);

      const { data: postData, error } = await supabase
        .from("blog_posts")
        .select(`
          id, title, slug, content, excerpt, cover_image,
          published_at, read_time, views_count, tags,
          category:blog_categories(name, slug, color)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !postData) {
        setIsLoading(false);
        return;
      }

      const transformedPost: BlogPostData = {
        ...postData,
        category: Array.isArray(postData.category) ? postData.category[0] || null : postData.category,
        author: null,
      };

      setPost(transformedPost);

      await supabase
        .from("blog_posts")
        .update({ views_count: (transformedPost.views_count || 0) + 1 })
        .eq("id", transformedPost.id);

      const { data: related } = await supabase
        .from("blog_posts")
        .select(`
          id, title, slug, excerpt, cover_image, published_at,
          read_time, views_count, tags,
          category:blog_categories(name, slug, color)
        `)
        .eq("status", "published")
        .neq("id", transformedPost.id)
        .limit(3);

      if (related) {
        setRelatedPosts(related.map(p => ({
          ...p,
          content: "",
          category: Array.isArray(p.category) ? p.category[0] || null : p.category,
          author: null,
        })));
      }

      setIsLoading(false);
    };

    fetchPost();
  }, [slug]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url: window.location.href,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!", description: "Link do artigo copiado para a área de transferência." });
    }
  }, [post, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20">
          <Container narrow className="py-20">
            <BlogPostSkeleton />
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20">
          <Container className="py-20 text-center">
            <div className="text-6xl mb-4 opacity-20">📝</div>
            <h1 className="text-3xl font-bold mb-4">{t.blog.noResults}</h1>
            <p className="text-muted-foreground mb-8">
              O artigo que você procura não existe ou foi removido.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 border-2 border-foreground px-6 py-3 text-sm tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.blog.backToBlog}
            </Link>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    image: post.cover_image || "",
    datePublished: post.published_at,
    author: {
      "@type": "Organization",
      name: "SevenDevX",
      url: "https://www.sevendevx.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SevenDevX",
      url: "https://www.sevendevx.com",
    },
  };

  return (
    <>
      <SEOHead
        title={`${post.title} — SevenDevX Blog`}
        description={post.excerpt || `Leia "${post.title}" no blog da SevenDevX.`}
        keywords={post.tags?.join(", ") || "blog, tecnologia, desenvolvimento"}
        url={`https://www.sevendevx.com/blog/${post.slug}`}
        type="article"
        image={post.cover_image || undefined}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${readProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <Header />

        <main className="pt-20" id="article-content">
          {/* Hero Image */}
          {post.cover_image && (
            <div className="relative h-[35vh] md:h-[45vh] w-full overflow-hidden">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>
          )}

          {/* Article */}
          <article>
            <Container narrow className="py-12">
              {/* Back */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
              >
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.blog.backToBlog}
                </Link>
              </motion.div>

              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-14"
              >
                {post.category && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                    style={{
                      backgroundColor: `${post.category.color}15`,
                      color: post.category.color,
                    }}
                  >
                    {post.category.name}
                  </span>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-[1.1] tracking-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.published_at, language)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.read_time || 5} {t.blog.readingTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {post.views_count || 0} {t.blog.views}
                  </span>
                </div>

                {/* Author bar */}
                <div className="flex items-center justify-between border-t border-b border-border/20 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">S</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {post.author?.full_name || "SevenDevX"}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.blog.authorTeam}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    {t.blog.share}
                  </button>
                </div>
              </motion.header>

              {/* Content — Premium Typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-5
                  prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                  prose-p:text-foreground/80 prose-p:leading-[1.85] prose-p:text-[16.5px]
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-card prose-pre:border prose-pre:border-border/20 prose-pre:rounded-xl
                  prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-ul:text-foreground/80 prose-ol:text-foreground/80
                  prose-li:leading-[1.8]
                  prose-img:rounded-xl prose-img:my-10
                  prose-strong:text-foreground prose-strong:font-semibold"
              >
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </motion.div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-14 pt-8 border-t border-border/20"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground/50" />
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-muted/10 rounded-full text-xs text-muted-foreground border border-border/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Author Signature */}
              <div className="mt-14 p-6 rounded-xl bg-card/30 border border-border/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary">S</span>
                  </div>
                  <div>
                    <p className="font-bold">SevenDevX</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t.blog.authorDescription}
                    </p>
                    <Link
                      to="/#contact"
                      className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1 hover:underline"
                    >
                      {t.blog.contactLink} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Container>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <Section className="border-t border-border/10">
              <Container>
                <h2 className="text-xl md:text-2xl font-bold mb-8 tracking-tight">
                  {t.blog.continuReading}
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group">
                      <div className="h-full overflow-hidden rounded-xl border border-border/20 bg-card/30 hover:border-border/40 transition-all">
                        <div className="aspect-video overflow-hidden bg-muted/10">
                          {relatedPost.cover_image ? (
                            <img
                              src={relatedPost.cover_image}
                              alt={relatedPost.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl opacity-10">📝</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-sm group-hover:text-primary/90 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Container>
            </Section>
          )}

          {/* CTA */}
          <Section className="border-t border-border/10">
            <Container className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                {t.blog.likedContent}
              </h2>
              <p className="text-muted-foreground mb-8 text-sm max-w-md mx-auto">
                {t.blog.likedContentSubtitle}
              </p>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 border-2 border-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300"
              >
                {t.blog.ctaButton}
              </Link>
            </Container>
          </Section>
        </main>

        <Footer />
        <WhatsAppButton />
        <AIChatbot />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </div>
    </>
  );
};

export default BlogPost;
