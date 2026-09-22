import React from "react";
import { LayoutDashboard, FolderGit2, BookOpen, Image as ImageIcon, FolderTree, Globe, LogOut, ArrowLeft } from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "blog", label: "Blog CMS", icon: BookOpen },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "seo", label: "SEO Settings", icon: Globe },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#141413] text-[#F5F2EA] flex flex-col border-r border-white/10 shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4F050] text-[#141413] flex items-center justify-center font-display font-bold">
            AK
          </div>
          <div>
            <div className="font-display font-bold text-base tracking-tight">Admin CMS</div>
            <div className="font-mono text-[10px] text-[#9E9A91]">Portfolio Control</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#D4F050] text-[#141413] font-bold shadow-[3px_3px_0px_rgba(255,255,255,0.2)]"
                  : "text-[#9E9A91] hover:text-[#F5F2EA] hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <a
          href="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-[#9E9A91] hover:text-[#F5F2EA] hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View Site</span>
        </a>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
