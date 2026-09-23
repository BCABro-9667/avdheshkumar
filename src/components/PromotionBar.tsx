import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { PORTFOLIO_DATA } from "../data/portfolio";

interface PromotionBarProps {
  onNavigate: (pageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PromotionBar: React.FC<PromotionBarProps> = ({
  onNavigate,
  isOpen,
  onClose,
}) => {
  const [promoConfig, setPromoConfig] = useState({
    active: true,
    reasonText: "My New Blog",
    blogId: "building-polished-nextjs-project",
  });
  const [blogs, setBlogs] = useState<any[]>(PORTFOLIO_DATA.blogs || []);

  useEffect(() => {
    const loadConfig = () => {
      const saved = localStorage.getItem("portfolio_promo_settings");
      if (saved) {
        try {
          setPromoConfig(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadConfig();
    window.addEventListener("storage", loadConfig);

    // Also fetch latest blogs if available
    fetch("/api/admin/blog")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data && data.length > 0) setBlogs(data);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("storage", loadConfig);
    };
  }, []);

  if (!promoConfig.active || !isOpen) return null;

  // Find the selected blog
  const targetBlog = blogs.find(
    (b) => b.slug === promoConfig.blogId || b._id === promoConfig.blogId
  ) || blogs[0] || {
    slug: "building-polished-nextjs-project",
    title: "Building a polished Next.js project from scratch",
  };

  const handleBlogClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(`blog/${targetBlog.slug || targetBlog.id}`);
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative w-full z-40 bg-[#D4F050] text-[#141413] border-b-2 border-[#141413] overflow-hidden select-none"
        aria-label="New Blog Announcement"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Clickable Announcement Area */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center sm:justify-start md:justify-center">
            {/* Reason Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141413] text-[#D4F050] font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 shadow-[1px_1px_0px_#141413]">
              <span>{promoConfig.reasonText || "My New Blog"}</span>
            </span>

            {/* Clickable Blog Title */}
            <button
              type="button"
              onClick={handleBlogClick}
              className="inline-flex items-center gap-1.5 font-display font-bold text-xs sm:text-sm text-[#141413] hover:opacity-85 transition-all text-left truncate cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] rounded-sm"
              title={`Read: ${targetBlog.title}`}
            >
              <span className="truncate underline decoration-[#141413]/40 decoration-1 underline-offset-2 group-hover:decoration-[#141413] font-semibold">
                {targetBlog.title}
              </span>

              <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] font-bold shrink-0 bg-[#141413]/10 px-2 py-0.5 rounded-full group-hover:bg-[#141413] group-hover:text-[#D4F050] transition-colors ml-1">
                <span>Read Now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#141413]/80 hover:text-[#141413] hover:bg-[#141413]/15 transition-colors shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
            aria-label="Close promotion bar"
            title="Close announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
