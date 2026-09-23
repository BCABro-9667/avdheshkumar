import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Clock, Tag, ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { PORTFOLIO_DATA, BlogPostItem } from "../data/portfolio";
import { MagneticButton } from "./MagneticButton";
import { LikeButton } from "./LikeButton";
import { fetchBlogPosts } from "../lib/apiClient";

interface BlogProps {
  onNavigate?: (page: string) => void;
}

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const [blogsList, setBlogsList] = useState<BlogPostItem[]>(PORTFOLIO_DATA.blogs);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const posts = await fetchBlogPosts();
        if (posts && posts.length > 0 && isMounted) {
          const mapped: BlogPostItem[] = posts.map((p: any, idx: number) => ({
            id: p.slug || p._id || `blog-${idx}`,
            title: p.title,
            status: p.status || "published",
            category: p.category || "Web Development",
            readTime: p.readTime || `${Math.max(3, Math.ceil((p.content?.length || 500) / 400))} min read`,
            excerpt: p.excerpt || p.content?.slice(0, 140) || "",
            tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : [p.category || "Full-Stack"],
            content: p.content,
            imageUrl: p.featuredImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
          }));
          setBlogsList(mapped);
        }
      } catch (err) {
        console.warn("Could not load dynamic blog posts:", err);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handlePostClick = (postId: string) => {
    window.location.hash = `blog/${postId}`;
    if (onNavigate) {
      onNavigate(`blog/${postId}`);
    }
  };

  return (
    <section id="journal" className="py-24 sm:py-32 relative bg-[#FAF8F2]/60 border-t border-[#141413]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading
            label="04 / JOURNAL & ARTICLES"
            title="Ideas, builds & lessons."
            subtitle="Thoughts, architectural case studies, and engineering notes on modern web craftsmanship."
          />

          {onNavigate && (
            <MagneticButton strength={0.3}>
              <button
                onClick={() => onNavigate("blogs")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors border border-[#141413] cursor-pointer shrink-0"
              >
                <span>Explore more journal ↗</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </MagneticButton>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogsList.slice(0, 3).map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              onClick={() => handlePostClick(post.id)}
              className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F2] border-2 border-[#141413] flex flex-col justify-between group shadow-[6px_6px_0px_#141413] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#141413] transition-all duration-300 cursor-pointer"
            >
              <div>
                {/* Photo Banner Preview */}
                {post.imageUrl && (
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-[#141413]/10 border border-[#141413]/15">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#141413]/80 backdrop-blur-md text-[#F5F2EA] font-mono text-[10px] uppercase tracking-wider border border-white/20">
                      {post.category}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-[#141413]/10 pb-4 mb-6">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#D4F050] text-[#141413] font-bold uppercase tracking-wider">
                    {post.status}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs text-[#6B6862]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {!post.imageUrl && (
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#A5C418] font-semibold mb-2">
                    {post.category}
                  </div>
                )}

                <h3 className="font-display text-2xl font-bold text-[#141413] mb-4 group-hover:translate-x-1 transition-transform duration-200">
                  {post.title}
                </h3>

                <p className="font-sans text-sm text-[#6B6862] leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#F5F2EA] text-[#6B6862] border border-[#141413]/10"
                    >
                      <Tag className="w-2.5 h-2.5 opacity-60" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#141413]/10 flex items-center justify-between font-mono text-xs text-[#141413] font-medium">
                <span className="group-hover:underline">Read full article ↗</span>
                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <LikeButton itemId={post.id} type="blog" size="sm" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#141413] text-[#F5F2EA] flex items-center justify-center group-hover:bg-[#D4F050] group-hover:text-[#141413] transition-colors">
                    <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {onNavigate && (
          <div className="mt-12 text-center sm:hidden">
            <button
              onClick={() => onNavigate("blogs")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors border border-[#141413]"
            >
              <span>Explore more journal ↗</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
