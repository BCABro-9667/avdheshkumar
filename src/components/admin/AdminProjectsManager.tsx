import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit3, X, Upload, ArrowLeft, Save, CheckCircle2, FolderPlus, Clock, RotateCcw } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

interface AdminProjectsManagerProps {
  token: string;
  action?: "list" | "create" | "edit";
  targetId?: string | null;
  onNavigate?: (action: "list" | "create" | "edit", targetId?: string | null) => void;
}

const AUTOSAVE_PROJECT_STORAGE_KEY = "portfolio_admin_project_autosave_v2";

export const AdminProjectsManager: React.FC<AdminProjectsManagerProps> = ({
  token,
  action = "list",
  targetId = null,
  onNavigate,
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [viewMode, setViewMode] = useState<"list" | "form">(action === "create" || action === "edit" ? "form" : "list");
  const [editingId, setEditingId] = useState<string | null>(targetId);

  const [draftRecovered, setDraftRecovered] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const initialFormState = {
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    featuredImage: "",
    imageAlt: "",
    category: "",
    keywords: "",
    tags: "",
    techStack: "",
    liveUrl: "",
    githubUrl: "",
    status: "published",
  };

  const [formData, setFormData] = useState(() => {
    if (action === "create") {
      const saved = localStorage.getItem(AUTOSAVE_PROJECT_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.data) return parsed.data;
        } catch (e) {}
      }
    }
    return initialFormState;
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // New Category Modal & Quick Create State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Sync internal viewMode with action and targetId props
  useEffect(() => {
    if (action === "create") {
      setViewMode("form");
      setEditingId(null);
      const saved = localStorage.getItem(AUTOSAVE_PROJECT_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.data) {
            setFormData(parsed.data);
            return;
          }
        } catch (e) {}
      }
      setFormData({
        ...initialFormState,
        category: categories[0]?.name || "Full-Stack",
      });
    } else if (action === "edit" && targetId) {
      setViewMode("form");
      setEditingId(targetId);
      const existing = projects.find((p) => p._id === targetId);
      if (existing) {
        populateForm(existing);
      }
    } else {
      setViewMode("list");
      setEditingId(null);
    }
  }, [action, targetId, projects]);

  const populateForm = (proj: any) => {
    setFormData({
      title: proj.title || "",
      slug: proj.slug || "",
      shortDescription: proj.shortDescription || "",
      description: proj.description || "",
      featuredImage: proj.featuredImage || "",
      imageAlt: proj.imageAlt || proj.title || "Project preview",
      category: proj.category || categories[0]?.name || "",
      keywords: Array.isArray(proj.keywords) ? proj.keywords.join(", ") : proj.keywords || "",
      tags: Array.isArray(proj.tags) ? proj.tags.join(", ") : proj.tags || "",
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack || "",
      liveUrl: proj.liveUrl || "",
      githubUrl: proj.githubUrl || "",
      status: proj.status || "published",
    });
  };

  // Autosave to localStorage whenever form data changes in form mode
  useEffect(() => {
    if (viewMode === "form") {
      const hasContent = Boolean(
        formData.title?.trim() ||
        formData.description?.trim() ||
        formData.shortDescription?.trim()
      );
      if (hasContent) {
        const now = Date.now();
        const payload = {
          data: formData,
          editingId: editingId || null,
          timestamp: now,
        };
        localStorage.setItem(AUTOSAVE_PROJECT_STORAGE_KEY, JSON.stringify(payload));
        const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(timeFormatted);
      }
    }
  }, [formData, viewMode, editingId]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projRes, catRes] = await Promise.all([
        fetch("/api/admin/projects", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/categories?type=project"),
      ]);
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData);
        if (targetId) {
          const target = pData.find((p: any) => p._id === targetId);
          if (target) populateForm(target);
        }
      }
      if (catRes.ok) {
        const cData = await catRes.json();
        setCategories(cData);
        if (!formData.category && cData.length > 0) {
          setFormData((prev: any) => ({ ...prev, category: cData[0].name }));
        }
      }
    } catch (err) {
      console.error("Error loading admin projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData((prev: any) => ({ ...prev, title: val, slug }));
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
      setFormData((prev: any) => ({
        ...prev,
        featuredImage: result.secure_url,
        imageAlt: prev.imageAlt || prev.title || "Project preview"
      }));
      setMessage({ type: "success", text: "Image uploaded successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to upload image" });
    } finally {
      setUploading(false);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(AUTOSAVE_PROJECT_STORAGE_KEY);
    setFormData({
      ...initialFormState,
      category: categories[0]?.name || "Full-Stack",
    });
    setEditingId(null);
    setDraftRecovered(null);
    setLastSavedTime(null);
    setMessage({ type: "success", text: "Draft cleared. Started fresh project form." });
  };

  const triggerOpenCreate = () => {
    if (onNavigate) {
      onNavigate("create");
    } else {
      setEditingId(null);
      setViewMode("form");
    }
    const scrollEl = document.getElementById("admin-content-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerOpenEdit = (proj: any) => {
    if (onNavigate) {
      onNavigate("edit", proj._id);
    } else {
      setEditingId(proj._id);
      populateForm(proj);
      setViewMode("form");
    }
    const scrollEl = document.getElementById("admin-content-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerBackToList = () => {
    if (onNavigate) {
      onNavigate("list");
    } else {
      setViewMode("list");
      setEditingId(null);
    }
    const scrollEl = document.getElementById("admin-content-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelectChange = (val: string) => {
    if (val === "__create_new__") {
      setShowCategoryModal(true);
    } else {
      setFormData((prev: any) => ({ ...prev, category: val }));
    }
  };

  const executeCreateCategory = async (nameToCreate: string) => {
    const trimmed = nameToCreate.trim();
    if (!trimmed) return;
    setCreatingCat(true);
    try {
      const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: trimmed, slug, type: "project" }),
      });
      const data = await res.json();
      const createdCat = data.name ? data : { name: trimmed, slug, type: "project" };

      setCategories((prev) => {
        const exists = prev.some((c) => (c.name || "").toLowerCase() === trimmed.toLowerCase());
        if (exists) return prev;
        return [...prev, createdCat];
      });

      setFormData((prev: any) => ({ ...prev, category: createdCat.name }));
      setNewCatName("");
      setShowCategoryModal(false);
      setQuickAddOpen(false);
      setMessage({ type: "success", text: `Category "${createdCat.name}" created and auto-selected!` });
    } catch (err: any) {
      setCategories((prev) => {
        const exists = prev.some((c) => (c.name || "").toLowerCase() === trimmed.toLowerCase());
        if (exists) return prev;
        return [...prev, { name: trimmed, slug: trimmed.toLowerCase(), type: "project" }];
      });
      setFormData((prev: any) => ({ ...prev, category: trimmed }));
      setNewCatName("");
      setShowCategoryModal(false);
      setQuickAddOpen(false);
      setMessage({ type: "success", text: `Category "${trimmed}" auto-selected!` });
    } finally {
      setCreatingCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.title?.trim()) {
      setMessage({ type: "error", text: "Please enter a project title." });
      return;
    }
    if (!formData.shortDescription?.trim()) {
      setMessage({ type: "error", text: "Please enter a short overview / description." });
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const finalSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const finalImageAlt = formData.imageAlt?.trim() || formData.title.trim() || "Project preview";
    const finalCategory = formData.category || categories[0]?.name || "Full-Stack";

    const payload = {
      ...formData,
      slug: finalSlug,
      imageAlt: finalImageAlt,
      category: finalCategory,
      featuredImage: formData.featuredImage || "",
      keywords: typeof formData.keywords === "string" ? formData.keywords.split(",").map((s: string) => s.trim()).filter(Boolean) : formData.keywords,
      tags: typeof formData.tags === "string" ? formData.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : formData.tags,
      techStack: typeof formData.techStack === "string" ? formData.techStack.split(",").map((s: string) => s.trim()).filter(Boolean) : formData.techStack,
    };

    try {
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save project");

      localStorage.removeItem(AUTOSAVE_PROJECT_STORAGE_KEY);

      setProjects((prev) => {
        const exists = prev.some((p) => p._id === resData._id);
        if (exists) {
          return prev.map((p) => (p._id === resData._id ? resData : p));
        }
        return [resData, ...prev];
      });

      setMessage({ type: "success", text: editingId ? "✓ Project updated successfully!" : "✓ Project created successfully!" });
      setEditingId(null);
      setDraftRecovered(null);
      triggerBackToList();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save project" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setMessage({ type: "success", text: "Project deleted." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchSearch = (proj.title || "").toLowerCase().includes(search.toLowerCase()) ||
                        (proj.shortDescription || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || proj.status === statusFilter;
    const matchCat = categoryFilter === "all" || proj.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Category Creation Modal Popup */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F2] border-2 border-[#141413] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_#141413] space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4F050] text-[#141413] flex items-center justify-center border-2 border-[#141413]">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#141413]">Create Project Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-2 rounded-xl text-[#141413] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-[#6B6862] uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      executeCreateCategory(newCatName);
                    }
                  }}
                  placeholder="e.g. Next.js SaaS, Mobile Apps..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050]"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-[#141413] font-mono text-xs uppercase tracking-wider font-bold hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeCreateCategory(newCatName)}
                  disabled={creatingCat || !newCatName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#D4F050] border-2 border-[#141413] font-mono text-xs uppercase tracking-wider font-bold text-[#141413] shadow-[3px_3px_0px_#141413] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  {creatingCat ? "Creating..." : "Save & Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F2] border-2 border-[#141413] p-6 rounded-3xl shadow-[4px_4px_0px_#141413]">
        <div>
          <div className="font-mono text-xs text-[#6B6862] uppercase tracking-wider">Portfolio Management</div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#141413]">
            {viewMode === "list" ? `Projects (${projects.length})` : (editingId ? "Edit Project" : "Create New Project")}
          </h2>
        </div>
        {viewMode === "list" ? (
          <button
            type="button"
            onClick={triggerOpenCreate}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#D4F050] border-2 border-[#141413] font-mono text-xs font-bold uppercase tracking-wider text-[#141413] shadow-[4px_4px_0px_#141413] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerBackToList}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FAF8F2] border-2 border-[#141413] font-mono text-xs font-bold uppercase tracking-wider text-[#141413] shadow-[4px_4px_0px_#141413] cursor-pointer hover:bg-black/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to List</span>
            </button>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border-2 border-[#141413] font-mono text-xs flex items-center justify-between shadow-[2px_2px_0px_#141413] ${
          message.type === "success" ? "bg-[#D4F050]/20 text-[#141413]" : "bg-red-500/20 text-red-900"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: "", text: "" })} className="p-1 hover:bg-black/5 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6862]" />
              <input
                type="text"
                placeholder="Search projects by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#141413] bg-[#FAF8F2] font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#141413] bg-[#FAF8F2] font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0px_#141413] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-[#141413] bg-[#FAF8F2] font-mono text-xs uppercase tracking-wider shadow-[2px_2px_0px_#141413] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-sm text-[#6B6862]">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-[#FAF8F2] border-2 border-[#141413] rounded-3xl p-12 text-center shadow-[4px_4px_0px_#141413]">
              <p className="font-mono text-sm text-[#6B6862] mb-4">No projects found.</p>
              <button
                type="button"
                onClick={triggerOpenCreate}
                className="px-6 py-3 rounded-2xl bg-[#D4F050] border-2 border-[#141413] font-mono text-xs font-bold uppercase text-[#141413] shadow-[3px_3px_0px_#141413] cursor-pointer"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <div key={proj._id} className="bg-[#FAF8F2] border-2 border-[#141413] rounded-3xl p-6 shadow-[4px_4px_0px_#141413] flex flex-col justify-between hover:shadow-[6px_6px_0px_#141413] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold border border-[#141413] ${
                        proj.status === "published" ? "bg-[#D4F050] text-[#141413]" : "bg-neutral-200 text-[#141413]"
                      }`}>
                        {proj.status}
                      </span>
                      <span className="font-mono text-[10px] text-[#6B6862]">{proj.category || "Full-Stack"}</span>
                    </div>

                    {proj.featuredImage ? (
                      <div className="mb-4 aspect-[16/9] rounded-xl overflow-hidden border border-[#141413]/20">
                        <img src={proj.featuredImage} alt={proj.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="mb-4 aspect-[16/9] rounded-xl bg-[#141413] text-[#D4F050] flex items-center justify-center font-mono text-xs font-bold border border-[#141413]">
                        No Cover Image
                      </div>
                    )}

                    <h3 className="font-display font-bold text-xl text-[#141413] mb-2 line-clamp-2">{proj.title}</h3>
                    <p className="font-sans text-xs text-[#6B6862] line-clamp-3 mb-4">{proj.shortDescription}</p>

                    {proj.techStack && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(Array.isArray(proj.techStack) ? proj.techStack : proj.techStack.split(",")).map((t: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-[#141413]/20 font-mono text-[10px] text-[#141413]">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#141413]/10 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#6B6862]">
                      {new Date(proj.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerOpenEdit(proj)}
                        className="p-2 rounded-xl bg-[#FAF8F2] border-2 border-[#141413] text-[#141413] hover:bg-[#D4F050] shadow-[2px_2px_0px_#141413] cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(proj._id)}
                        className="p-2 rounded-xl bg-red-100 border-2 border-[#141413] text-red-700 hover:bg-red-200 shadow-[2px_2px_0px_#141413] cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM VIEW (Create / Edit Project) */}
      {viewMode === "form" && (
        <form onSubmit={handleSubmit} className="bg-[#FAF8F2] border-2 border-[#141413] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_#141413] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#141413]/10 gap-3">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#141413]">
                {editingId ? "Edit Project" : "Create New Project"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs text-[#6B6862]">
                  {lastSavedTime ? (
                    <>Auto-saved locally at <strong className="text-[#141413]">{lastSavedTime}</strong></>
                  ) : (
                    "Auto-saving locally to protect work from page refresh"
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={discardDraft}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#141413]/30 bg-white font-mono text-[11px] text-[#6B6862] hover:text-[#141413] hover:border-[#141413] cursor-pointer"
                title="Discard cached draft"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset / Discard Draft</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Next-Gen AI Analytics Dashboard"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              />
              <p className="mt-1 font-mono text-[10px] text-[#6B6862]">Slug: /projects/{formData.slug || "auto-generated-slug"}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-xs text-[#6B6862] uppercase">Category *</label>
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  className="font-mono text-[11px] text-[#141413] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{quickAddOpen ? "Hide Input" : "Add New Category"}</span>
                </button>
              </div>

              {quickAddOpen && (
                <div className="mb-3 p-3 bg-white border-2 border-[#141413] rounded-2xl shadow-[2px_2px_0px_#141413] space-y-2">
                  <div className="font-mono text-[10px] text-[#6B6862] uppercase">Quick Create Category</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          executeCreateCategory(newCatName);
                        }
                      }}
                      placeholder="Category name..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#141413] font-sans text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={creatingCat || !newCatName.trim()}
                      onClick={() => executeCreateCategory(newCatName)}
                      className="px-3 py-1.5 bg-[#D4F050] border border-[#141413] rounded-xl font-mono text-[10px] font-bold uppercase cursor-pointer disabled:opacity-50"
                    >
                      {creatingCat ? "Adding..." : "Add & Select"}
                    </button>
                  </div>
                </div>
              )}

              <select
                value={formData.category}
                onChange={(e) => handleCategorySelectChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
                <option value="__create_new__" className="font-bold text-[#141413] bg-[#D4F050]">
                  + Create New Category...
                </option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">Tech Stack (comma separated)</label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="React, TypeScript, Tailwind CSS, Node.js"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">Short Description / Summary *</label>
              <textarea
                rows={2}
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief summary for project cards..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">Cover Image (Optional)</label>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://images.unsplash.com/... or upload"
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
                />
                <label className="px-5 py-3 rounded-2xl bg-[#FAF8F2] border-2 border-[#141413] font-mono text-xs font-bold uppercase tracking-wider text-[#141413] shadow-[2px_2px_0px_#141413] hover:bg-[#D4F050] cursor-pointer shrink-0 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Uploading..." : "Upload File"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {formData.featuredImage && (
                <div className="mt-3 aspect-[16/9] max-h-48 rounded-xl overflow-hidden border-2 border-[#141413]">
                  <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">Detailed Project Description (Quill Editor)</label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="In-depth project breakdown, architecture, challenge and solution..."
                height={320}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">Live Demo URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://myproject.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#6B6862] uppercase mb-2">GitHub / Source Repository</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#141413] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F050] shadow-[2px_2px_0px_#141413]"
              />
            </div>

            {/* Publication Status */}
            <div className="md:col-span-2 pt-4 border-t border-[#141413]/10">
              <label className="block font-mono text-xs text-[#141413] font-bold uppercase mb-2">Publication Status *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#141413] bg-white cursor-pointer hover:bg-black/5">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === "draft"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="accent-[#141413]"
                  />
                  <span className="font-mono text-xs uppercase font-bold">Save as Draft</span>
                </label>
                <label className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#141413] bg-[#D4F050] cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === "published"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="accent-[#141413]"
                  />
                  <span className="font-mono text-xs uppercase font-bold">Publish Immediately</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#141413]/10">
            <button
              type="button"
              onClick={triggerBackToList}
              className="px-6 py-3 rounded-2xl border-2 border-[#141413] font-mono text-xs uppercase tracking-wider font-bold hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#D4F050] border-2 border-[#141413] font-mono text-xs uppercase tracking-wider font-bold text-[#141413] shadow-[4px_4px_0px_#141413] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#141413] border-t-transparent rounded-full animate-spin" />
                  <span>Saving Project...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingId ? "Update Project" : "Submit / Save Project"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
