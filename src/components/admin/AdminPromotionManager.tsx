import React, { useState, useEffect } from "react";
import { Sparkles, Save, CheckCircle2, Megaphone } from "lucide-react";

interface AdminPromotionManagerProps {
  token: string;
}

export const AdminPromotionManager: React.FC<AdminPromotionManagerProps> = ({ token }) => {
  const [promoData, setPromoData] = useState({
    active: true,
    reasonText: "My New Blog",
    blogId: "building-polished-nextjs-project",
    customTitle: "",
  });
  const [blogs, setBlogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Load existing promo settings from localStorage / API
    const saved = localStorage.getItem("portfolio_promo_settings");
    if (saved) {
      try {
        setPromoData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    // Load blogs for selection
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blog", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("portfolio_promo_settings", JSON.stringify(promoData));
    sessionStorage.removeItem("portfolio_promo_bar_dismissed"); // Reset dismissal so it shows up with new details
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: "success", text: "Promotion bar settings updated successfully!" });
      window.dispatchEvent(new Event("storage"));
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#141413]">Promotion Bar CMS</h2>
          <p className="font-sans text-xs text-[#6B6862]">
            Configure the announcement banner displayed at the top of your website.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#D4F050] border-2 border-[#141413] flex items-center justify-center text-[#141413] shadow-[2px_2px_0px_#141413]">
          <Megaphone className="w-5 h-5" />
        </div>
      </div>

      {message.text && (
        <div className="p-4 rounded-2xl bg-[#DCFCE7] border-2 border-[#16A34A] text-[#14532D] font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-[#FAF8F2] border-2 border-[#141413] shadow-[6px_6px_0px_#141413] space-y-6">
        {/* Active Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141413]/10">
          <div>
            <label className="font-display font-bold text-base text-[#141413]">Enable Promotion Bar</label>
            <p className="font-sans text-xs text-[#6B6862]">Show or hide the announcement banner across the site.</p>
          </div>
          <button
            type="button"
            onClick={() => setPromoData((prev) => ({ ...prev, active: !prev.active }))}
            className={`w-14 h-8 rounded-full border-2 border-[#141413] transition-colors relative cursor-pointer ${
              promoData.active ? "bg-[#D4F050]" : "bg-[#E5E2D9]"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-[#141413] transition-transform ${
                promoData.active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reason / Badge Text */}
        <div className="space-y-2">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#141413]">
            Announcement Badge / Reason Text
          </label>
          <input
            type="text"
            value={promoData.reasonText}
            onChange={(e) => setPromoData((prev) => ({ ...prev, reasonText: e.target.value }))}
            placeholder="e.g. My New Blog"
            className="w-full px-4 py-3 rounded-2xl bg-[#F5F2EA] border-2 border-[#141413] text-[#141413] font-display font-bold text-sm focus:outline-none focus:bg-[#FAF8F2] shadow-[2px_2px_0px_#141413]"
            required
          />
        </div>

        {/* Select Blog Post to Promote */}
        <div className="space-y-2">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#141413]">
            Select Blog Post to Link
          </label>
          <select
            value={promoData.blogId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const found = blogs.find((b) => b.slug === selectedId || b._id === selectedId);
              setPromoData((prev) => ({
                ...prev,
                blogId: selectedId,
                customTitle: found ? found.title : prev.customTitle,
              }));
            }}
            className="w-full px-4 py-3 rounded-2xl bg-[#F5F2EA] border-2 border-[#141413] text-[#141413] font-display font-bold text-sm focus:outline-none focus:bg-[#FAF8F2] shadow-[2px_2px_0px_#141413]"
          >
            {blogs.map((blog) => (
              <option key={blog._id || blog.slug} value={blog.slug}>
                {blog.title}
              </option>
            ))}
          </select>
          <p className="font-mono text-[11px] text-[#6B6862]">
            Clicking the title will immediately navigate visitors to this selected blog post.
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-2 pt-2">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#141413]">
            Live Banner Preview
          </label>
          <div className="bg-[#D4F050] text-[#141413] border-2 border-[#141413] p-3 rounded-2xl shadow-[3px_3px_0px_#141413] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="px-2.5 py-0.5 rounded-full bg-[#141413] text-[#D4F050] font-mono text-[10px] font-black uppercase tracking-wider shrink-0">
                {promoData.reasonText}
              </span>
              <span className="font-display font-bold text-xs truncate underline">
                {blogs.find((b) => b.slug === promoData.blogId)?.title || "Building a polished Next.js project from scratch"}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold bg-[#141413]/10 px-2 py-0.5 rounded-full shrink-0">
              Read Now →
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#141413] text-[#D4F050] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors border-2 border-[#141413] shadow-[4px_4px_0px_#141413] cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save & Publish Promotion Bar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
