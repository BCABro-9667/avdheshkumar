import React, { useEffect, useState } from "react";
import { FolderGit2, BookOpen, Image as ImageIcon, CheckCircle, Clock, ArrowRight, ExternalLink } from "lucide-react";

interface AdminDashboardHomeProps {
  token: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ token, setActiveTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecent(data.recentContent);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 font-mono text-sm text-[#6B6862] animate-pulse">
        Loading dashboard metrics...
      </div>
    );
  }

  const statCards = [
    { label: "Total Projects", value: stats?.totalProjects || 0, sub: `${stats?.publishedProjects || 0} Live, ${stats?.draftProjects || 0} Draft`, icon: FolderGit2, tab: "projects", color: "bg-blue-50 text-blue-800 border-blue-200" },
    { label: "Blog Posts", value: stats?.totalBlogs || 0, sub: `${stats?.publishedBlogs || 0} Published, ${stats?.draftBlogs || 0} Draft`, icon: BookOpen, tab: "blog", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { label: "Gallery Assets", value: stats?.totalGallery || 0, sub: "Cloudinary Managed", icon: ImageIcon, tab: "gallery", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#141413]">Dashboard Overview</h1>
        <p className="font-mono text-xs sm:text-sm text-[#6B6862] mt-1">
          Welcome back, Avdhesh. Manage your portfolio content and technical SEO below.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(card.tab)}
              className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-6 shadow-[4px_4px_0px_rgba(20,20,19,0.06)] hover:border-[#141413] hover:shadow-[6px_6px_0px_#141413] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#141413] text-[#D4F050] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-[#6B6862] flex items-center gap-1 group-hover:text-[#141413]">
                  Manage <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="font-display font-bold text-3xl text-[#141413] mb-1">{card.value}</div>
              <div className="font-mono text-xs text-[#6B6862] uppercase tracking-wider">{card.label}</div>
              <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-[#F5F2EA] font-mono text-[11px] text-[#141413]">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-6 shadow-[4px_4px_0px_rgba(20,20,19,0.06)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#141413]/10">
            <h2 className="font-display font-bold text-lg text-[#141413]">Recent Projects</h2>
            <button
              onClick={() => setActiveTab("projects")}
              className="font-mono text-xs text-[#6B6862] hover:text-[#141413] uppercase tracking-wider"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recent?.projects?.length === 0 ? (
              <p className="font-mono text-xs text-[#6B6862] py-4">No projects found.</p>
            ) : (
              recent?.projects?.map((proj: any) => (
                <div key={proj._id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F2EA] border border-[#141413]/10">
                  <div className="flex items-center gap-3">
                    <img src={proj.featuredImage} alt={proj.title} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="font-display font-semibold text-sm text-[#141413]">{proj.title}</div>
                      <div className="font-mono text-[11px] text-[#6B6862]">{proj.category}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold ${proj.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {proj.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-6 shadow-[4px_4px_0px_rgba(20,20,19,0.06)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#141413]/10">
            <h2 className="font-display font-bold text-lg text-[#141413]">Recent Blog Articles</h2>
            <button
              onClick={() => setActiveTab("blog")}
              className="font-mono text-xs text-[#6B6862] hover:text-[#141413] uppercase tracking-wider"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recent?.blogs?.length === 0 ? (
              <p className="font-mono text-xs text-[#6B6862] py-4">No blog posts found.</p>
            ) : (
              recent?.blogs?.map((blog: any) => (
                <div key={blog._id} className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F2EA] border border-[#141413]/10">
                  <div className="flex items-center gap-3">
                    <img src={blog.featuredImage} alt={blog.title} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="font-display font-semibold text-sm text-[#141413]">{blog.title}</div>
                      <div className="font-mono text-[11px] text-[#6B6862]">{blog.category}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold ${blog.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {blog.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
