import React, { useEffect, useState } from "react";
import { Globe, Save, Check, X } from "lucide-react";

interface AdminSEOManagerProps {
  token: string;
}

export const AdminSEOManager: React.FC<AdminSEOManagerProps> = ({ token }) => {
  const [seoList, setSeoList] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState("home");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robots: "index, follow",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    try {
      const res = await fetch("/api/seo");
      if (res.ok) {
        const data = await res.json();
        setSeoList(data);
        if (data.length > 0) {
          const current = data.find((d: any) => d.page === selectedPage) || data[0];
          setSelectedPage(current.page);
          setFormData({
            title: current.title || "",
            description: current.description || "",
            canonical: current.canonical || "",
            ogTitle: current.ogTitle || "",
            ogDescription: current.ogDescription || "",
            ogImage: current.ogImage || "",
            robots: current.robots || "index, follow",
          });
        }
      }
    } catch (err) {
      console.error("Error loading SEO:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageKey: string) => {
    setSelectedPage(pageKey);
    const found = seoList.find((d) => d.page === pageKey);
    if (found) {
      setFormData({
        title: found.title || "",
        description: found.description || "",
        canonical: found.canonical || "",
        ogTitle: found.ogTitle || "",
        ogDescription: found.ogDescription || "",
        ogImage: found.ogImage || "",
        robots: found.robots || "index, follow",
      });
    } else {
      setFormData({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogImage: "", robots: "index, follow" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/seo/${selectedPage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update SEO");

      setMessage({ type: "success", text: `SEO settings for '${selectedPage}' updated successfully!` });
      loadSEO();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error updating SEO" });
    }
  };

  const pages = [
    { key: "home", label: "Home Page" },
    { key: "about", label: "About Page" },
    { key: "projects", label: "Projects Page" },
    { key: "blog", label: "Blog Page" },
    { key: "gallery", label: "Gallery Page" },
    { key: "contact", label: "Contact Page" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#141413]">Technical SEO & OpenGraph</h1>
        <p className="font-mono text-xs sm:text-sm text-[#6B6862] mt-1">Configure meta titles, descriptions, canonical URLs, and social cards.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border font-mono text-xs flex items-center justify-between ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: "", text: "" })}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePageSelect(p.key)}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
              selectedPage === p.key
                ? "bg-[#141413] text-[#D4F050] shadow-[3px_3px_0px_#D4F050]"
                : "bg-[#FAF8F2] border border-[#141413]/20 text-[#141413] hover:bg-[#F5F2EA]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* SEO Form */}
      <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_rgba(20,20,19,0.06)]">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Meta Title (SEO Title) *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="Page title for search engines"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Meta Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="Compelling description under 160 characters..."
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Canonical URL</label>
                <input
                  type="url"
                  value={formData.canonical}
                  onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="https://.../page-url"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Open Graph Title (OG:Title)</label>
                <input
                  type="text"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="Social share card title"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Open Graph Description</label>
                <textarea
                  rows={3}
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="Social share summary..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Open Graph Image URL</label>
                  <input
                    type="url"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Robots Directive</label>
                  <select
                    value={formData.robots}
                    onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  >
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                    <option value="index, nofollow">index, nofollow</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#141413]/10">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save SEO Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
