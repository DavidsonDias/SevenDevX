import service0w640 from "@/assets/optimized-services/desenvolvimento-web-personalizado-1782350224358-640.webp";
import service0w1024 from "@/assets/optimized-services/desenvolvimento-web-personalizado-1782350224358-1024.webp";
import service0w1600 from "@/assets/optimized-services/desenvolvimento-web-personalizado-1782350224358-1600.webp";
import service1w640 from "@/assets/optimized-services/landing-pages-1782408514895-640.webp";
import service1w1024 from "@/assets/optimized-services/landing-pages-1782408514895-1024.webp";
import service1w1600 from "@/assets/optimized-services/landing-pages-1782408514895-1600.webp";
import service2w640 from "@/assets/optimized-services/consultoria-tecnologica-1782348642384-640.webp";
import service2w1024 from "@/assets/optimized-services/consultoria-tecnologica-1782348642384-1024.webp";
import service2w1600 from "@/assets/optimized-services/consultoria-tecnologica-1782348642384-1600.webp";

// Exact URL matching preserves every future CMS image change. Original Storage files remain intact.
const images: Record<string, {src:string;srcSet:string}> = {
"https://ajxsfjmcpolfgzpzpehl.supabase.co/storage/v1/object/public/blog-images/services/desenvolvimento-web-personalizado-1782350224358.png": { src: service0w1600, srcSet: `${service0w640} 640w, ${service0w1024} 1024w, ${service0w1600} 1600w` },
"https://ajxsfjmcpolfgzpzpehl.supabase.co/storage/v1/object/public/blog-images/services/landing-pages-1782408514895.png": { src: service1w1600, srcSet: `${service1w640} 640w, ${service1w1024} 1024w, ${service1w1600} 1600w` },
"https://ajxsfjmcpolfgzpzpehl.supabase.co/storage/v1/object/public/blog-images/services/consultoria-tecnologica-1782348642384.jpg": { src: service2w1600, srcSet: `${service2w640} 640w, ${service2w1024} 1024w, ${service2w1600} 1600w` }
};
export const optimizedServiceImage = (source: string) => images[source] || {src: source, srcSet: undefined};
