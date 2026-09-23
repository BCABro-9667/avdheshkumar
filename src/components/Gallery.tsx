import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Filter, Trophy, Award, Code2, ExternalLink } from "lucide-react";
import { PORTFOLIO_DATA, GalleryItem } from "../data/portfolio";
import { SectionHeading } from "./SectionHeading";
import { MagneticButton } from "./MagneticButton";
import { fetchGallery } from "../lib/apiClient";

const DEFAULT_CATEGORIES = ["All", "Chess", "Certificates", "Hackathons", "Inventions"];

interface GalleryProps {
  onNavigate?: (page: string) => void;
  isPage?: boolean;
}

export const Gallery: React.FC<GalleryProps> = ({ onNavigate, isPage = false }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(PORTFOLIO_DATA.gallery);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchGallery();
        if (data && data.length > 0 && isMounted) {
          const mapped: GalleryItem[] = data.map((item: any, idx: number) => ({
            id: item._id || String(idx),
            title: item.title,
            category: item.category || "Milestones",
            date: item.date || "Recent",
            description: item.description || item.title,
            imageUrl: item.image || item.imageUrl || "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
          }));
          setItems(mapped);

          const uniqueCats = Array.from(new Set(["All", ...mapped.map((m) => m.category).filter(Boolean)]));
          setCategories(uniqueCats.length > 1 ? uniqueCats : DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.warn("Could not load dynamic gallery items:", err);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const filteredItems = isPage
    ? activeCategory === "All"
      ? items
      : items.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase())
    : items.slice(0, 4); // show 4 on home section

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-[#FAF8F2] border-t border-[#141413]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading
            label={isPage ? "04 / VISUAL ARCHIVE" : "03 / GALLERY & ARCHIVE"}
            title="Chess, Trophies & Milestones."
            subtitle="A visual documentation of competitive chess championships, professional certificates, hackathon triumphs, and software engineering labs."
          />

          {!isPage && onNavigate && (
            <MagneticButton strength={0.3}>
              <button
                onClick={() => onNavigate("gallery")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors border border-[#141413] cursor-pointer shrink-0"
              >
                <span>Explore more gallery ↗</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </MagneticButton>
          )}
        </div>

        {/* Filters if on page */}
        {isPage && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-10">
            <div className="flex items-center gap-1.5 text-[#6B6862] font-mono text-xs uppercase tracking-wider mr-2 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer border ${
                    isActive
                      ? "bg-[#141413] text-[#F5F2EA] border-[#141413] shadow-xs"
                      : "bg-[#F5F2EA] text-[#6B6862] border-[#141413]/15 hover:border-[#141413] hover:text-[#141413]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-3xl overflow-hidden border-2 border-[#141413] aspect-[4/3] shadow-[6px_6px_0px_#141413] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#141413] transition-all duration-200 cursor-pointer bg-[#141413]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/90 via-[#141413]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#D4F050] text-[#141413] font-bold uppercase tracking-wider w-max mb-2">
                  {item.category}
                </span>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="font-mono text-xs text-[#9E9A91]">
                  {item.date} — Click to inspect ↗
                </p>
              </div>

              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#141413]/80 backdrop-blur-md text-[#F5F2EA] font-mono text-[10px] uppercase tracking-wider border border-white/20 group-hover:opacity-0 transition-opacity">
                {item.category}
              </div>
            </motion.div>
          ))}
        </div>

        {!isPage && onNavigate && (
          <div className="mt-12 text-center sm:hidden">
            <button
              onClick={() => onNavigate("gallery")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors border border-[#141413]"
            >
              <span>Explore more gallery ↗</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Photo Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl rounded-3xl bg-[#FAF8F2] border-2 border-[#141413] overflow-hidden shadow-[8px_8px_0px_#141413] relative max-h-[90vh] flex flex-col"
              >
                <div className="relative aspect-video bg-[#141413]">
                  <img
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors cursor-pointer border border-white/20"
                  >
                    Close ✕
                  </button>
                </div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#D4F050] text-[#141413] font-bold uppercase tracking-wider">
                      {selectedPhoto.category}
                    </span>
                    <span className="font-mono text-xs text-[#6B6862]">{selectedPhoto.date}</span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-[#141413] mb-3">
                    {selectedPhoto.title}
                  </h3>

                  <p className="font-sans text-sm text-[#6B6862] leading-relaxed mb-6">
                    {selectedPhoto.description}
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="px-6 py-2.5 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors cursor-pointer"
                    >
                      Done viewing
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
