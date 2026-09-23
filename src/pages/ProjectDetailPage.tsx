import React, { useEffect, useState } from "react";
import { fetchProjects, fetchProjectBySlug } from "../lib/apiClient";
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, CheckCircle2, ChevronRight, Share2, ArrowRight, Quote } from "lucide-react";
import { LikeButton } from "../components/LikeButton";

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (page: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [res, projectsList] = await Promise.all([
        fetchProjectBySlug(slug),
        fetchProjects()
      ]);
      setData(res);
      setAllProjects(projectsList || []);
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
          className="px-6 py-3 rounded-2xl bg-[#141413] text-[#D4F050] font-mono text-xs uppercase font-bold tracking-wider cursor-pointer"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const { project, relatedProjects, relatedBlogs } = data;

  // Determine previous and next projects based on allProjects list
  const currentIndex = allProjects.findIndex((p: any) => p.slug === slug || p._id === project._id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  // Categorize tech stack if available or split
  const techList = project.techStack || [];
  const frontendStack = techList.filter((t: string) => /react|next|tailwind|css|html|bootstrap|vue/i.test(t));
  const backendStack = techList.filter((t: string) => /node|express|mongodb|sql|postgres|api/i.test(t));
  const otherStack = techList.filter((t: string) => !frontendStack.includes(t) && !backendStack.includes(t));

  return (
    <div className="pt-32 pb-24 px-6 sm:px-12 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 font-mono text-xs text-[#6B6862] mb-8">
        <button onClick={() => onNavigate("home")} className="hover:text-[#141413] cursor-pointer">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate("projects")} className="hover:text-[#141413] cursor-pointer">Projects</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#141413] font-semibold truncate max-w-[200px]">{project.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b-2 border-[#141413]/15">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#141413] text-[#D4F050] font-mono text-xs uppercase tracking-wider font-bold">
              {project.category}
            </span>
            {project.publishedAt && (
              <span className="font-mono text-xs text-[#6B6862] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(project.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-6xl text-[#141413] tracking-tight">
            {project.title}
          </h1>

          <p className="font-sans text-lg sm:text-xl text-[#6B6862] leading-relaxed">
            {project.shortDescription}
          </p>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <LikeButton
            itemId={project._id || slug}
            type="project"
            initialLikes={project.likes || 0}
            size="md"
          />

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> Live URL ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FAF8F2] text-[#141413] hover:bg-[#141413] hover:text-[#FAF8F2] border-2 border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] transition-all cursor-pointer"
            >
              <Github className="w-4 h-4" /> GitHub ↗
            </a>
          )}
        </div>
      </div>

      {/* Project Preview Image */}
      <div className="rounded-3xl overflow-hidden border-2 border-[#141413] shadow-[8px_8px_0px_#141413] mb-16 bg-[#FAF8F2]">
        <img
          src={project.featuredImage}
          alt={project.imageAlt || project.title}
          className="w-full h-auto max-h-[550px] object-cover hover:scale-[1.01] transition-transform duration-500"
        />
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
        {/* Main Left Column (Overview & Features) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Overview */}
          <section className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-8 sm:p-10 shadow-[6px_6px_0px_rgba(20,20,19,0.06)] space-y-4">
            <h2 className="font-display font-bold text-2xl text-[#141413]">Overview</h2>
            <div className="font-sans text-base text-[#6B6862] leading-relaxed whitespace-pre-line">
              {project.description}
            </div>
          </section>

          {/* Features */}
          {project.tags && project.tags.length > 0 && (
            <section className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-8 sm:p-10 shadow-[6px_6px_0px_rgba(20,20,19,0.06)] space-y-6">
              <h2 className="font-display font-bold text-2xl text-[#141413]">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.tags.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5F2EA] border border-[#141413]/10">
                    <div className="w-5 h-5 rounded-full bg-[#141413] text-[#D4F050] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-sans text-sm text-[#141413] font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Optional Quote / Highlight Block */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#E8E5F7] border-2 border-[#141413] shadow-[6px_6px_0px_#141413] relative overflow-hidden">
            <Quote className="absolute right-6 bottom-6 w-20 h-20 text-[#141413]/10 pointer-events-none" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#141413] font-bold mb-3">Project Highlight</h3>
            <blockquote className="font-display text-xl sm:text-2xl font-bold text-[#141413] leading-snug">
              "{project.shortDescription}"
            </blockquote>
          </div>
        </div>

        {/* Sidebar Right Column (Technical Stack) */}
        <div className="space-y-6">
          <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-8 shadow-[6px_6px_0px_rgba(20,20,19,0.06)] space-y-6 sticky top-28">
            <h3 className="font-display font-bold text-xl text-[#141413] pb-3 border-b border-[#141413]/10">Technical Stack</h3>

            {frontendStack.length > 0 && (
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#6B6862] mb-3">Frontend</h4>
                <div className="flex flex-wrap gap-2">
                  {frontendStack.map((t: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/15 font-mono text-xs text-[#141413] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {backendStack.length > 0 && (
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#6B6862] mb-3">Backend & Database</h4>
                <div className="flex flex-wrap gap-2">
                  {backendStack.map((t: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/15 font-mono text-xs text-[#141413] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(otherStack.length > 0 || techList.length === 0) && (
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#6B6862] mb-3">Architecture & Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {(otherStack.length > 0 ? otherStack : techList).map((t: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/15 font-mono text-xs text-[#141413] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Navigation Footer (Previous / Next Project) */}
      <div className="pt-10 border-t-2 border-[#141413]/15 flex flex-col sm:flex-row items-center justify-between gap-6">
        {prevProject ? (
          <button
            onClick={() => onNavigate(`projects/${prevProject.slug || prevProject.id}`)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#FAF8F2] border-2 border-[#141413] hover:bg-[#141413] hover:text-[#FAF8F2] transition-all shadow-[4px_4px_0px_#141413] group text-left w-full sm:w-auto cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider opacity-60">Previous Project</div>
              <div className="font-display font-bold text-base truncate max-w-[220px]">{prevProject.title}</div>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextProject ? (
          <button
            onClick={() => onNavigate(`projects/${nextProject.slug || nextProject.id}`)}
            className="flex items-center justify-between sm:justify-end gap-3 px-6 py-4 rounded-2xl bg-[#FAF8F2] border-2 border-[#141413] hover:bg-[#141413] hover:text-[#FAF8F2] transition-all shadow-[4px_4px_0px_#141413] group text-right w-full sm:w-auto cursor-pointer ml-auto"
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider opacity-60">Next Project</div>
              <div className="font-display font-bold text-base truncate max-w-[220px]">{nextProject.title}</div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

