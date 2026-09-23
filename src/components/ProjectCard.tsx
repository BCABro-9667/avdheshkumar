import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, Sparkles, ExternalLink } from "lucide-react";
import { Project } from "../data/portfolio";
import { MagneticButton } from "./MagneticButton";
import { LikeButton } from "./LikeButton";

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
  onNavigate?: (page: string) => void;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onNavigate }) => {
  // Theme variations
  const isDark = project.style === "dark";
  const isLavender = project.style === "lavender";

  const cardBg = isDark
    ? "bg-[#141413] text-[#F5F2EA] border-[#2E2E2C]"
    : isLavender
    ? "bg-[#E8E5F7] text-[#141413] border-[#7A74A8]/30"
    : "bg-[#FAF8F2] text-[#141413] border-[#141413]/20";

  const shadowStyle = isDark
    ? "shadow-[6px_6px_0px_#D4F050]"
    : isLavender
    ? "shadow-[6px_6px_0px_#141413]"
    : "shadow-[6px_6px_0px_#141413]";

  const slug = project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <motion.article
      data-cursor="project"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full rounded-3xl p-7 sm:p-9 border-2 flex flex-col justify-between overflow-hidden group transition-all duration-300 ${cardBg} ${shadowStyle}`}
    >
      {/* Hover Image Preview Overlay */}
      {project.imageUrl && (
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover filter blur-xs"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Subtle Card Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b pb-4 mb-6 border-current/10">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-2xl tracking-tighter">
              {project.number}
            </span>
            <span className="h-3 w-[1px] bg-current/20" />
            <span className="font-mono text-xs tracking-wider uppercase opacity-75">
              {project.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-current/10 font-medium">
              {project.technology}
            </span>
            {project.highlightMetric && (
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isDark
                    ? "bg-[#D4F050] text-[#141413]"
                    : "bg-[#141413] text-[#F5F2EA]"
                }`}
              >
                {project.highlightMetric}
              </span>
            )}
          </div>
        </div>

        {/* Project Title & Narrative */}
        <h3 
          onClick={() => onNavigate && onNavigate(`projects/${slug}`)}
          className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3 group-hover:translate-x-1 transition-transform duration-300 cursor-pointer hover:underline"
        >
          {project.title}
        </h3>

        <p className="text-sm sm:text-base font-normal leading-relaxed opacity-85 mb-6">
          {project.description}
        </p>

        {/* Hover Thumbnail Image Preview */}
        {project.imageUrl && (
          <div 
            onClick={() => onNavigate && onNavigate(`projects/${slug}`)}
            className="relative mb-6 rounded-2xl overflow-hidden border border-current/20 aspect-[16/9] shadow-md group-hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
            <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#141413]/80 text-[#F5F2EA] backdrop-blur-md">
              View Dedicated Page ↗
            </span>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2 mb-6">
          <div className="font-mono text-[11px] uppercase tracking-wider opacity-60 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Key Engineering Highlights</span>
          </div>
          <ul className="grid grid-cols-1 gap-2">
            {project.features.map((feat, i) => (
              <li
                key={i}
                className="flex items-center gap-2 font-mono text-xs opacity-85"
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isDark
                      ? "bg-[#D4F050] text-[#141413]"
                      : "bg-[#141413] text-[#F5F2EA]"
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 pt-4 border-t border-current/10 flex items-center justify-between">
        <MagneticButton strength={0.3} asAnchor href={project.url} target="_blank" rel="noopener noreferrer">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 border ${
              isDark
                ? "bg-[#D4F050] text-[#141413] border-[#D4F050] hover:bg-white hover:text-black"
                : "bg-[#141413] text-[#F5F2EA] border-[#141413] hover:bg-[#D4F050] hover:text-[#141413]"
            }`}
          >
            <span>{project.ctaText}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
          </span>
        </MagneticButton>

        {onNavigate && (
          <button
            onClick={() => onNavigate(`projects/${slug}`)}
            className="font-mono text-xs opacity-75 hover:opacity-100 underline underline-offset-4 decoration-current/40 hover:decoration-current flex items-center gap-1 cursor-pointer font-bold"
          >
            <span>Get Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.article>
  );
};
