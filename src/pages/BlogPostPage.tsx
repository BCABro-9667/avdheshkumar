import React, { useState, useEffect } from "react";
import { motion, useScroll } from "motion/react";
import { ArrowLeft, Clock, Tag, Share2, Sparkles, BookOpen, Quote, CheckCircle2, ChevronRight } from "lucide-react";
import { PORTFOLIO_DATA, BlogPostItem } from "../data/portfolio";
import { MagneticButton } from "../components/MagneticButton";
import { LikeButton } from "../components/LikeButton";
import { fetchBlogPostBySlug } from "../lib/apiClient";

interface BlogPostPageProps {
  postId: string;
  onNavigate: (page: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ postId, onNavigate }) => {
  const localMatch = PORTFOLIO_DATA.blogs.find((b) => b.id === postId || b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === postId);
  const [post, setPost] = useState<BlogPostItem>(localMatch || PORTFOLIO_DATA.blogs[0]);
  const [loading, setLoading] = useState(!localMatch);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let isMounted = true;
    if (localMatch) {
      setPost(localMatch);
      setLoading(false);
      return;
    }

    async function loadRemotePost() {
      setLoading(true);
      try {
        const res = await fetchBlogPostBySlug(postId);
        if (res && res.post && isMounted) {
          const apiPost = res.post;
          const mapped: BlogPostItem = {
            id: apiPost.slug || apiPost._id || postId,
            title: apiPost.title,
            status: apiPost.status || "published",
            category: apiPost.category || "Engineering",
            readTime: apiPost.readTime || `${Math.max(3, Math.ceil((apiPost.content?.length || 500) / 400))} min read`,
            excerpt: apiPost.excerpt || apiPost.content?.slice(0, 140) || "",
            tags: Array.isArray(apiPost.tags) && apiPost.tags.length > 0 ? apiPost.tags : [apiPost.category || "Full-Stack"],
            content: apiPost.content,
            imageUrl: apiPost.featuredImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
          };
          setPost(mapped);
        }
      } catch (e) {
        console.warn("Could not fetch remote blog post:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRemotePost();
    return () => { isMounted = false; };
  }, [postId]);

  // Update document title for SEO & Lighthouse compliance when opening blog
  React.useEffect(() => {
    if (post) {
      document.title = `${post.title} — Avdhesh Kumar Journal`;
      window.history.replaceState(null, "", `#blog/${post.id}`);
    }
    return () => {
      document.title = "Avdhesh Kumar — Full-Stack Developer & Software Engineer";
    };
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  return (
    <article className="pt-24 sm:pt-36 pb-24 min-h-screen bg-[#F5F2EA] relative outline-none">
      {/* Reading Progress Bar - Borderless on mobile */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#D4F050] z-50 border-b-0 sm:border-b sm:border-[#141413]/20 outline-none"
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => onNavigate("blogs")}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#6B6862] hover:text-[#141413] transition-colors cursor-pointer outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </button>
        </div>

        {/* Header Metadata */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-[#D4F050] text-[#141413] font-bold uppercase tracking-wider border-0 sm:border sm:border-[#141413]/10">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-[#6B6862]">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-[#6B6862]">• Written by Avdhesh Kumar</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-[#141413] tracking-tight leading-[1.12]">
            {post.title}
          </h1>

          <p className="font-sans text-base sm:text-xl text-[#6B6862] leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-0 sm:border-t sm:border-[#141413]/15">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 font-mono text-xs px-3 py-1 rounded-full bg-[#FAF8F2] text-[#141413] border-0 sm:border sm:border-[#141413]/15 outline-none"
                >
                  <Tag className="w-3 h-3 text-[#A5C418]" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LikeButton
                itemId={post.id}
                type="blog"
                size="md"
              />

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F2] border-0 sm:border sm:border-[#141413]/20 font-mono text-xs uppercase tracking-wider text-[#141413] hover:bg-[#141413] hover:text-[#F5F2EA] transition-colors cursor-pointer outline-none"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Article</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Banner Card - Borderless & shadowless on mobile */}
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl bg-[#141413] text-[#F5F2EA] p-6 sm:p-12 mb-8 sm:mb-12 flex flex-col justify-between relative overflow-hidden border-0 sm:border-2 border-[#141413] shadow-none sm:shadow-[8px_8px_0px_#D4F050] outline-none">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#D4F050]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 font-mono text-xs text-[#D4F050]">
            <Sparkles className="w-4 h-4" />
            <span>AVDHESH KUMAR JOURNAL • TECHNICAL ESSAY</span>
          </div>
          <div>
            <div className="font-display text-xl sm:text-3xl font-bold mb-2 tracking-tight">
              {post.title}
            </div>
            <p className="font-mono text-[11px] sm:text-xs text-[#9E9A91]">
              Published on 2026 • Gurgaon Engineering Lab
            </p>
          </div>
        </div>

        {/* Full Article Content - Borderless, outline-free & shadowless on mobile */}
        <div className="bg-[#FAF8F2] rounded-2xl sm:rounded-3xl border-0 sm:border sm:border-[#141413]/15 p-4 sm:p-12 space-y-6 sm:space-y-8 font-sans text-base sm:text-lg text-[#141413]/90 leading-relaxed shadow-none sm:shadow-xs outline-none">
          {/* Main article content intro */}
          {post.content && (
            <p className="text-base sm:text-xl font-serif sm:font-sans italic sm:not-italic text-[#141413]/85 leading-relaxed border-0 outline-none">
              {post.content}
            </p>
          )}

          {/* Render Rich Sections if available */}
          {post.sections && post.sections.length > 0 ? (
            <div className="space-y-6 sm:space-y-8 border-0 outline-none">
              {post.sections.map((sec, idx) => {
                if (sec.type === "heading") {
                  return (
                    <h2
                      key={idx}
                      className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#141413] pt-6 sm:pt-8 border-0 outline-none tracking-tight"
                    >
                      {sec.title}
                    </h2>
                  );
                }

                if (sec.type === "subheading") {
                  return (
                    <h3
                      key={idx}
                      className="font-display text-xl sm:text-2xl font-bold text-[#141413] pt-4 border-0 outline-none tracking-tight"
                    >
                      {sec.title}
                    </h3>
                  );
                }

                if (sec.type === "text") {
                  return (
                    <p
                      key={idx}
                      className="text-base sm:text-lg text-[#141413]/90 leading-relaxed border-0 outline-none"
                    >
                      {sec.content}
                    </p>
                  );
                }

                if (sec.type === "image") {
                  return (
                    <figure
                      key={idx}
                      className="my-6 sm:my-10 rounded-xl sm:rounded-2xl overflow-hidden border-0 sm:border sm:border-[#141413]/15 outline-none bg-[#141413]/5"
                    >
                      <img
                        src={sec.src}
                        alt={sec.alt || post.title}
                        className="w-full h-auto object-cover max-h-[520px] border-0 outline-none"
                        referrerPolicy="no-referrer"
                      />
                      {sec.caption && (
                        <figcaption className="p-3 sm:p-4 text-center font-mono text-xs text-[#6B6862] bg-[#FAF8F2] border-0 outline-none">
                          {sec.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                if (sec.type === "quote") {
                  return (
                    <blockquote
                      key={idx}
                      className="my-6 sm:my-10 p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-[#F5F2EA] border-0 sm:border-l-4 sm:border-[#141413] outline-none shadow-none"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-[#A5C418] shrink-0 mt-1 opacity-80" />
                        <div className="space-y-3">
                          <p className="font-display italic text-lg sm:text-2xl text-[#141413] leading-snug">
                            "{sec.content}"
                          </p>
                          {(sec.author || sec.source) && (
                            <footer className="font-mono text-xs text-[#6B6862] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 border-0 outline-none">
                              <span className="font-bold text-[#141413]">{sec.author}</span>
                              {sec.source && <span className="text-[#6B6862]">• {sec.source}</span>}
                            </footer>
                          )}
                        </div>
                      </div>
                    </blockquote>
                  );
                }

                if (sec.type === "callout") {
                  return (
                    <div
                      key={idx}
                      className="my-6 sm:my-8 p-5 sm:p-7 rounded-2xl bg-[#EFECE3] border-0 sm:border-2 sm:border-[#141413] shadow-none sm:shadow-[4px_4px_0px_#D4F050] outline-none space-y-2"
                    >
                      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#141413] font-bold">
                        <Sparkles className="w-4 h-4 text-[#A5C418]" />
                        <span>{sec.calloutTitle || "Key Architecture Takeaway"}</span>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-[#141413] leading-relaxed">
                        {sec.content}
                      </p>
                    </div>
                  );
                }

                if (sec.type === "list") {
                  return (
                    <div
                      key={idx}
                      className="my-6 sm:my-8 p-5 sm:p-7 rounded-2xl bg-[#F5F2EA] border-0 sm:border sm:border-[#141413]/15 outline-none space-y-4"
                    >
                      {sec.title && (
                        <h4 className="font-display font-bold text-lg text-[#141413]">
                          {sec.title}
                        </h4>
                      )}
                      <ul className="space-y-3">
                        {sec.items?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#141413]/90">
                            <span className="w-5 h-5 rounded-full bg-[#D4F050] text-[#141413] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border-0 sm:border sm:border-[#141413]/30">
                              0{i + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : null}

          {/* Article Appreciation & Like Bar */}
          <div className="my-8 p-6 sm:p-8 rounded-3xl bg-[#FAF8F2] border-2 border-[#141413] shadow-[4px_4px_0px_#141413] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-bold text-xl text-[#141413]">
                Enjoyed this article?
              </h4>
              <p className="font-sans text-sm text-[#6B6862] mt-1">
                Drop a like to support the research and open-source writeups.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LikeButton
                itemId={post.id}
                type="blog"
                size="lg"
              />
            </div>
          </div>

          {/* About Author Section */}
          <div className="pt-8 border-t-0 sm:border-t sm:border-[#141413]/10 space-y-4 outline-none">
            <h3 className="font-display text-xl font-bold text-[#141413]">
              About the Author
            </h3>
            <p className="text-sm text-[#6B6862] leading-relaxed">
              Avdhesh Kumar is a Full-Stack and Frontend Developer based in Gurgaon, India, specializing in React, Next.js, Node.js, and high-performance SEO architectures. 3-time College Chess Champion applying tactical foresight to scalable software systems.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate("contact")}
                className="px-6 py-2.5 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors cursor-pointer border-0 sm:border sm:border-[#141413] outline-none"
              >
                Discuss this article with Avdhesh ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

