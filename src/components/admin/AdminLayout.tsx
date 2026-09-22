import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminDashboardHome } from "./AdminDashboardHome";
import { AdminProjectsManager } from "./AdminProjectsManager";
import { AdminBlogManager } from "./AdminBlogManager";
import { AdminGalleryManager } from "./AdminGalleryManager";
import { AdminCategoriesManager } from "./AdminCategoriesManager";
import { AdminSEOManager } from "./AdminSEOManager";

interface AdminLayoutProps {
  token: string;
  adminUser: any;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ token, adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#F5F2EA] flex flex-col md:flex-row">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-[#141413]/10">
          <div>
            <div className="font-mono text-xs text-[#6B6862] uppercase tracking-wider">Logged in as</div>
            <div className="font-display font-bold text-sm text-[#141413]">{adminUser?.email || "Admin"}</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-[#141413] text-[#D4F050] font-mono text-xs font-bold uppercase tracking-wider">
            Secure Admin
          </div>
        </header>

        {activeTab === "dashboard" && <AdminDashboardHome token={token} setActiveTab={setActiveTab} />}
        {activeTab === "projects" && <AdminProjectsManager token={token} />}
        {activeTab === "blog" && <AdminBlogManager token={token} />}
        {activeTab === "gallery" && <AdminGalleryManager token={token} />}
        {activeTab === "categories" && <AdminCategoriesManager token={token} />}
        {activeTab === "seo" && <AdminSEOManager token={token} />}
      </main>
    </div>
  );
};
