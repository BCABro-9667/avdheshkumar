import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X, Upload, Image as ImageIcon } from "lucide-react";

interface AdminGalleryManagerProps {
  token: string;
}

export const AdminGalleryManager: React.FC<AdminGalleryManagerProps> = ({ token }) => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    image: "",
    imageAlt: "",
    category: "Portfolio Work",
    status: "published",
    public_id: "",
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [galRes, catRes] = await Promise.all([
        fetch("/api/admin/gallery", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/categories?type=gallery"),
      ]);
      if (galRes.ok) setGallery(await galRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (err) {
      console.error("Error loading gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      setFormData((prev) => ({
        ...prev,
        image: result.secure_url,
        public_id: result.public_id || "",
        imageAlt: prev.imageAlt || formData.title || "Gallery image",
      }));
      setMessage({ type: "success", text: "Image uploaded to Cloudinary successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      image: "",
      imageAlt: "",
      category: categories[0]?.name || "Portfolio Work",
      status: "published",
      public_id: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "",
      image: item.image || "",
      imageAlt: item.imageAlt || "",
      category: item.category || "",
      status: item.status || "published",
      public_id: item.public_id || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save gallery item");

      setMessage({ type: "success", text: editingId ? "Gallery item updated!" : "Gallery item added!" });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gallery image? This will also remove the asset from Cloudinary.")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMessage({ type: "success", text: "Gallery image deleted successfully." });
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error deleting" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#141413]">Gallery Management</h1>
          <p className="font-mono text-xs sm:text-sm text-[#6B6862] mt-1">Upload and manage visual assets via Cloudinary storage.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload Image
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border font-mono text-xs flex items-center justify-between ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: "", text: "" })}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="p-8 text-center font-mono text-sm text-[#6B6862]">Loading gallery...</div>
      ) : gallery.length === 0 ? (
        <div className="p-12 text-center bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl font-mono text-sm text-[#6B6862]">
          No gallery images uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div key={item._id} className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl overflow-hidden shadow-[4px_4px_0px_rgba(20,20,19,0.06)] flex flex-col">
              <div className="relative aspect-video bg-[#F5F2EA] overflow-hidden group">
                <img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 rounded-xl bg-[#FAF8F2] border border-[#141413]/20 hover:border-[#141413] text-[#141413] shadow cursor-pointer">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#141413]">{item.title}</h3>
                  <p className="font-mono text-xs text-[#6B6862] mt-1">{item.category}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141413]/10 flex items-center justify-between font-mono text-[11px] text-[#6B6862]">
                  <span>Alt: {item.imageAlt}</span>
                  <span className="uppercase text-emerald-700 font-bold">{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F2] border-2 border-[#141413] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[10px_10px_0px_#141413]">
            <div className="flex items-center justify-between pb-4 border-b border-[#141413]/10 mb-6">
              <h2 className="font-display font-bold text-xl text-[#141413]">
                {editingId ? "Edit Gallery Item" : "Upload Gallery Asset"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-[#F5F2EA]">
                <X className="w-5 h-5 text-[#141413]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="e.g. System Architecture Diagram"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Image URL (Cloudinary) *</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] font-mono text-xs uppercase font-bold flex items-center gap-2 cursor-pointer shrink-0">
                    <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Image Alt Text (SEO) *</label>
                <input
                  type="text"
                  required
                  value={formData.imageAlt}
                  onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  placeholder="Detailed description of the image"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#141413]/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-mono text-xs uppercase font-bold text-[#141413] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[3px_3px_0px_#141413] cursor-pointer">
                  {editingId ? "Update Asset" : "Save Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
