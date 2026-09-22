import React, { useEffect, useState } from "react";
import { fetchProjectBySlug } from "../lib/apiClient";
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, CheckCircle2, ChevronRight, Share2 } from "lucide-react";

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (page: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchProjectBySlug(slug);
      setData(res);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-sm text-[#6B6862]">
        Loading project details...
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display font-bold text-3xl text-[#141413] mb-4">Project Not Found</h1>
        <p className="font-mono text-sm text-[#6B6862] mb-6">The project you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => onNavigate("projects")}
          className="px-6 py-3 rounded-2xl bg-[#141413] text-[#D4F050] font-mono text-xs uppercase font-bold tracking-wider"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const { project, relatedProjects, relatedBlogs } = data;

  return (
    <div className="pt-32 pb-24 px-6 sm:px-12 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 font-mono text-xs text-[#6B6862] mb-8">
        <button onClick={() => onNavigate("home")} className="hover:text-[#141413]">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate("projects")} className="hover:text-[#141413]">Projects</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#141413] font-semibold truncate max-w-[200px]">{project.title}</span>
      </nav>

      {/* Header */}
      <div className="space-y-6 mb-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#D4F050] text-[#141413] font-mono text-xs uppercase tracking-wider font-bold">
            {project.category}
          </span>
          {project.publishedAt && (
            <span className="font-mono text-xs text-[#6B6862] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#141413] tracking-tight">
          {project.title}
        </h1>

        <p className="font-sans text-lg sm:text-xl text-[#6B6862] leading-relaxed max-w-3xl">
          {project.shortDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FAF8F2] text-[#141413] hover:bg-[#141413] hover:text-[#FAF8F2] border-2 border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] transition-all"
            >
              <Github className="w-4 h-4" /> Source Code
            </a>
          )}
        </div>
      </div>

      {/* Featured Image */}
      <div className="rounded-3xl overflow-hidden border-2 border-[#141413] shadow-[8px_8px_0px_#141413] mb-16 bg-[#FAF8F2]">
        <img
          src={project.featuredImage}
          alt={project.imageAlt || project.title}
          className="w-full h-auto max-h-[500px] object-cover"
        />
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Description */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-8 shadow-[6px_6px_0px_rgba(20,20,19,0.06)] space-y-4">
            <h2 className="font-display font-bold text-2xl text-[#141413]">Project Overview & Architecture</h2>
            <div className="font-sans text-base text-[#6B6862] leading-relaxed whitespace-pre-line">
              {project.description}
            </div>
          </section>
        </div>

        {/* Sidebar Meta */}
        <div className="space-y-6">
          <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-6 shadow-[6px_6px_0px_rgba(20,20,19,0.06)] space-y-6">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#6B6862] mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/15 font-mono text-xs text-[#141413] font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#6B6862] mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F2] border border-[#141413]/10 font-mono text-[11px] text-[#6B6862]">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Projects / Blogs */}
      {(relatedProjects?.length > 0 || relatedBlogs?.length > 0) && (
        <div className="mt-20 pt-12 border-t border-[#141413]/15 space-y-8">
          <h2 className="font-display font-bold text-2xl text-[#141413]">Related Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedProjects?.map((rel: any) => (
              <div
                key={rel._id}
                onClick={() => onNavigate(`projects/${rel.slug}`)}
                className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-6 shadow-[4px_4px_0px_rgba(20,20,19,0.06)] hover:border-[#141413] hover:shadow-[6px_6px_0px_#141413] transition-all cursor-pointer group"
              >
                <div className="font-mono text-xs text-[#6B6862] uppercase tracking-wider mb-1">Project</div>
                <h3 className="font-display font-bold text-lg text-[#141413] group-hover:text-blue-600 transition-colors">{rel.title}</h3>
                <p className="font-sans text-sm text-[#6B6862] mt-2 line-clamp-2">{rel.shortDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
