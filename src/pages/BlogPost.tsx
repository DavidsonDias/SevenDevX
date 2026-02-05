 /**
  * 📝 BlogPost - Página de artigo individual
  * SevenDevX Enterprise Edition
  */
 
 import { useState, useEffect } from "react";
 import { useParams, Link, useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import ReactMarkdown from "react-markdown";
 import { Calendar, Clock, Eye, ArrowLeft, Share2, Tag } from "lucide-react";
 import Header from "@/components/Header";
 import Footer from "@/components/Footer";
 import WhatsAppButton from "@/components/WhatsAppButton";
 import AIChatbot from "@/components/AIChatbot";
 import SEOHead from "@/components/SEOHead";
 import GlassCard from "@/components/GlassCard";
 import { BlogPostSkeleton } from "@/components/SkeletonLoader";
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
 
 const BlogPost = () => {
   const { slug } = useParams<{ slug: string }>();
   const navigate = useNavigate();
   const { toast } = useToast();
   const [post, setPost] = useState<BlogPostData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
 
   useEffect(() => {
     const fetchPost = async () => {
       if (!slug) return;
       
       setIsLoading(true);
 
       // Fetch post by slug
       const { data: postData, error } = await supabase
         .from("blog_posts")
         .select(`
           id,
           title,
           slug,
           content,
           excerpt,
           cover_image,
           published_at,
           read_time,
           views_count,
           tags,
           category:blog_categories(name, slug, color),
           author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
         `)
         .eq("slug", slug)
         .eq("status", "published")
         .single();
 
       if (error || !postData) {
         console.error("[BlogPost] Error fetching post:", error);
         setIsLoading(false);
         return;
       }
 
       // Transform data
       const transformedPost: BlogPostData = {
         ...postData,
         category: Array.isArray(postData.category) ? postData.category[0] || null : postData.category,
         author: Array.isArray(postData.author) ? postData.author[0] || null : postData.author,
       };
 
       setPost(transformedPost);
 
       // Increment view count
       await supabase
         .from("blog_posts")
         .update({ views_count: (transformedPost.views_count || 0) + 1 })
         .eq("id", transformedPost.id);
 
       // Fetch related posts (same category)
       if (transformedPost.category) {
         const { data: related } = await supabase
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
           .neq("id", transformedPost.id)
           .limit(3);
 
         if (related) {
           const transformedRelated = related.map(p => ({
             ...p,
             content: "",
             category: Array.isArray(p.category) ? p.category[0] || null : p.category,
             author: null,
           }));
           setRelatedPosts(transformedRelated);
         }
       }
 
       setIsLoading(false);
     };
 
     fetchPost();
   }, [slug]);
 
   const formatDate = (dateString: string | null) => {
     if (!dateString) return "";
     return new Date(dateString).toLocaleDateString("pt-BR", {
       day: "2-digit",
       month: "long",
       year: "numeric",
     });
   };
 
   const handleShare = async () => {
     if (navigator.share) {
       try {
         await navigator.share({
           title: post?.title,
           text: post?.excerpt || "",
           url: window.location.href,
         });
       } catch {
         // User cancelled or error
       }
     } else {
       await navigator.clipboard.writeText(window.location.href);
       toast({
         title: "Link copiado!",
         description: "O link do artigo foi copiado para a área de transferência.",
       });
     }
   };
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-black text-white">
         <Header />
         <main className="pt-20 container mx-auto px-6 py-20">
           <BlogPostSkeleton />
         </main>
         <Footer />
       </div>
     );
   }
 
   if (!post) {
     return (
       <div className="min-h-screen bg-black text-white">
         <Header />
         <main className="pt-20 container mx-auto px-6 py-20 text-center">
           <div className="text-6xl mb-4">📝</div>
           <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
           <p className="text-white/60 mb-8">
             O artigo que você procura não existe ou foi removido.
           </p>
           <Link
             to="/blog"
             className="inline-flex items-center gap-2 border-2 border-white px-6 py-3 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all"
           >
             <ArrowLeft className="w-4 h-4" />
             Voltar ao Blog
           </Link>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <>
       <SEOHead
         title={`${post.title} - SevenDevX Blog`}
         description={post.excerpt || `Leia o artigo "${post.title}" no blog da SevenDevX.`}
         keywords={post.tags?.join(", ") || "blog, tecnologia, desenvolvimento"}
         url={`https://www.sevendevx.com/blog/${post.slug}`}
         type="article"
         image={post.cover_image || undefined}
       />
 
       <div className="min-h-screen bg-black text-white">
         <Header />
 
         <main className="pt-20">
           {/* Hero Image */}
           {post.cover_image && (
             <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
               <img
                 src={post.cover_image}
                 alt={post.title}
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
             </div>
           )}
 
           {/* Content */}
           <article className="container mx-auto px-6 py-12">
             <div className="max-w-3xl mx-auto">
               {/* Back Button */}
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="mb-8"
               >
                 <Link
                   to="/blog"
                   className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Voltar ao Blog
                 </Link>
               </motion.div>
 
               {/* Header */}
               <motion.header
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mb-12"
               >
                 {/* Category */}
                 {post.category && (
                   <span
                     className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                     style={{
                       backgroundColor: `${post.category.color}20`,
                       color: post.category.color,
                     }}
                   >
                     {post.category.name}
                   </span>
                 )}
 
                 {/* Title */}
                 <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                   {post.title}
                 </h1>
 
                 {/* Meta */}
                 <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6">
                   <span className="flex items-center gap-2">
                     <Calendar className="w-4 h-4" />
                     {formatDate(post.published_at)}
                   </span>
                   <span className="flex items-center gap-2">
                     <Clock className="w-4 h-4" />
                     {post.read_time || 5} min de leitura
                   </span>
                   <span className="flex items-center gap-2">
                     <Eye className="w-4 h-4" />
                     {post.views_count || 0} visualizações
                   </span>
                 </div>
 
                 {/* Author & Share */}
                 <div className="flex items-center justify-between border-t border-b border-white/10 py-4">
                   {post.author && (
                     <div className="flex items-center gap-3">
                       {post.author.avatar_url ? (
                         <img
                           src={post.author.avatar_url}
                           alt={post.author.full_name || "Autor"}
                           className="w-10 h-10 rounded-full object-cover"
                         />
                       ) : (
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                           <span className="text-lg">👤</span>
                         </div>
                       )}
                       <div>
                         <p className="font-medium">{post.author.full_name || "SevenDevX Team"}</p>
                         <p className="text-xs text-white/50">Autor</p>
                       </div>
                     </div>
                   )}
                   <button
                     onClick={handleShare}
                     className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                   >
                     <Share2 className="w-5 h-5" />
                     Compartilhar
                   </button>
                 </div>
               </motion.header>
 
               {/* Content */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="prose prose-invert prose-lg max-w-none
                   prose-headings:font-bold prose-headings:tracking-tight
                   prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                   prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                   prose-p:text-white/80 prose-p:leading-relaxed
                   prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                   prose-code:bg-white/10 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                   prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10
                   prose-blockquote:border-l-4 prose-blockquote:border-white/30 prose-blockquote:italic
                   prose-ul:text-white/80 prose-ol:text-white/80
                   prose-img:rounded-lg prose-img:my-8"
               >
                 <ReactMarkdown>{post.content}</ReactMarkdown>
               </motion.div>
 
               {/* Tags */}
               {post.tags && post.tags.length > 0 && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.2 }}
                   className="mt-12 pt-8 border-t border-white/10"
                 >
                   <div className="flex items-center gap-2 flex-wrap">
                     <Tag className="w-4 h-4 text-white/50" />
                     {post.tags.map((tag) => (
                       <span
                         key={tag}
                         className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/70"
                       >
                         {tag}
                       </span>
                     ))}
                   </div>
                 </motion.div>
               )}
             </div>
           </article>
 
           {/* Related Posts */}
           {relatedPosts.length > 0 && (
             <section className="py-20 border-t border-white/10">
               <div className="container mx-auto px-6">
                 <h2 className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-tight">
                   Artigos Relacionados
                 </h2>
                 <div className="grid md:grid-cols-3 gap-8">
                   {relatedPosts.map((relatedPost) => (
                     <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                       <GlassCard className="h-full overflow-hidden group" padding="none">
                         <div className="aspect-video overflow-hidden bg-white/5">
                           {relatedPost.cover_image ? (
                             <img
                               src={relatedPost.cover_image}
                               alt={relatedPost.title}
                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <span className="text-4xl opacity-20">📝</span>
                             </div>
                           )}
                         </div>
                         <div className="p-6">
                           <h3 className="font-bold group-hover:text-white/80 transition-colors line-clamp-2">
                             {relatedPost.title}
                           </h3>
                           <p className="text-white/60 text-sm mt-2 line-clamp-2">
                             {relatedPost.excerpt}
                           </p>
                         </div>
                       </GlassCard>
                     </Link>
                   ))}
                 </div>
               </div>
             </section>
           )}
 
           {/* CTA */}
           <section className="py-20 border-t border-white/10">
             <div className="container mx-auto px-6 text-center">
               <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase">
                 Gostou do conteúdo?
               </h2>
               <p className="text-white/70 mb-8 max-w-xl mx-auto">
                 Entre em contato conosco para transformar suas ideias em realidade.
               </p>
               <Link
                 to="/#contact"
                 className="inline-flex items-center gap-2 border-2 border-white px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all"
               >
                 Fale Conosco
               </Link>
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
 
 export default BlogPost;