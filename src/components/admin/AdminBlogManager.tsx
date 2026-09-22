import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit3, X, Upload } from "lucide-react";

interface AdminBlogManagerProps {
  token: string;
}

export const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({ token }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    imageAlt: "",
    category: "",
    keywords: "",
    tags: "",
    author: "Avdhesh Kumar",
    status: "draft",
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [blogRes, catRes] = await Promise.all([
        fetch("/api/admin/blog", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/categories?type=blog"),
      ]);
      if (blogRes.ok) setPosts(await blogRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (err) {
      console.error("Error loading blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, title: val, slug: prev.slug || slug }));
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
      setFormData((prev) => ({ ...prev, featuredImage: result.secure_url }));
      setMessage({ type: "success", text: "Image uploaded successfully!" });
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
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      imageAlt: "",
      category: categories[0]?.name || "React & Next.js",
      keywords: "",
      tags: "",
      author: "Avdhesh Kumar",
      status: "draft",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: any) => {
    setEditingId(post._id);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featuredImage: post.featuredImage || "",
      imageAlt: post.imageAlt || "",
      category: post.category || "",
      keywords: (post.keywords || []).join(", "),
      tags: (post.tags || []).join(", "),
      author: post.author || "Avdhesh Kumar",
      status: post.status || "draft",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      keywords: formData.keywords.split(",").map((s) => s.trim()).filter(Boolean),
      tags: formData.tags.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save blog post");

      setMessage({ type: "success", text: editingId ? "Blog updated successfully!" : "Blog created successfully!" });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save blog post" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMessage({ type: "success", text: "Blog post deleted." });
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error deleting" });
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#141413]">Blog CMS</h1>
          <p className="font-mono text-xs sm:text-sm text-[#6B6862] mt-1">Manage technical journal articles and insights.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[4px_4px_0px_#141413] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Article
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border font-mono text-xs flex items-center justify-between ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: "", text: "" })}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl p-5 shadow-[4px_4px_0px_rgba(20,20,19,0.06)] flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6862]" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 focus:border-[#141413] focus:outline-none font-sans text-sm text-[#141413]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-mono text-xs text-[#141413] focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Articles List */}
      <div className="bg-[#FAF8F2] border-2 border-[#141413]/15 rounded-3xl shadow-[4px_4px_0px_rgba(20,20,19,0.06)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-mono text-sm text-[#6B6862]">Loading articles...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center font-mono text-sm text-[#6B6862]">No articles found.</div>
        ) : (
          <div className="divide-y divide-[#141413]/10">
            {filteredPosts.map((post) => (
              <div key={post._id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F5F2EA]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={post.featuredImage} alt={post.title} className="w-16 h-16 rounded-2xl object-cover border border-[#141413]/20 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-[#141413]">{post.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold ${post.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[#6B6862] mt-0.5">{post.category} • /{post.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button onClick={() => openEditModal(post)} className="p-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 hover:border-[#141413] text-[#141413] cursor-pointer">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post._id)} className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F2] border-2 border-[#141413] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-[10px_10px_0px_#141413] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#141413]/10 mb-6">
              <h2 className="font-display font-bold text-xl text-[#141413]">
                {editingId ? "Edit Article" : "Create Article"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-[#F5F2EA]">
                <X className="w-5 h-5 text-[#141413]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Featured Image URL *</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    required
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
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
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Image Alt Text *</label>
                <input
                  type="text"
                  required
                  value={formData.imageAlt}
                  onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#141413] mb-1.5">Article Content (Markdown / HTML) *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-sans text-sm text-[#141413]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#141413]/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#F5F2EA] border border-[#141413]/20 font-mono text-xs uppercase font-bold text-[#141413] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#141413] text-[#D4F050] hover:bg-[#D4F050] hover:text-[#141413] border border-[#141413] font-mono text-xs uppercase tracking-wider font-bold shadow-[3px_3px_0px_#141413] cursor-pointer">
                  {editingId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
