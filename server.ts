import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./src/server/db";
import { User, Project, BlogPost, Gallery, Category, SEOPageSettings } from "./src/server/models";
import { generateToken, verifyAdminToken, AdminAuthRequest } from "./src/server/auth";
import { uploadToCloudinary, deleteFromCloudinary } from "./src/server/cloudinary";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Multer memory storage for Cloudinary image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Connect to MongoDB on startup
connectDB();

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Auth Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const admin = await User.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken({ id: admin._id, email: admin.email, role: admin.role });
    return res.json({
      token,
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// Verify Token
app.get("/api/auth/verify", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  return res.json({ valid: true, admin: req.admin });
});

// Public Projects
app.get("/api/projects", async (req: Request, res: Response) => {
  try {
    const { category, search, tag } = req.query;
    const query: any = { status: "published" };

    if (category && category !== "All") {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query).sort({ publishedAt: -1, createdAt: -1 });
    return res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.get("/api/projects/:slug", async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, status: "published" });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // Find related projects (same category or tech stack)
    const relatedProjects = await Project.find({
      status: "published",
      _id: { $ne: project._id },
      $or: [{ category: project.category }, { techStack: { $in: project.techStack } }]
    }).limit(2);

    // Find related blog posts
    const relatedBlogs = await BlogPost.find({
      status: "published",
      $or: [{ category: project.category }, { tags: { $in: project.tags } }]
    }).limit(2);

    return res.json({ project, relatedProjects, relatedBlogs });
  } catch (err) {
    console.error("Error fetching project by slug:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Public Blog
app.get("/api/blog", async (req: Request, res: Response) => {
  try {
    const { category, search, tag } = req.query;
    const query: any = { status: "published" };

    if (category && category !== "All") {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await BlogPost.find(query).sort({ publishedAt: -1, createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    return res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

app.get("/api/blog/:slug", async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: "published" });
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const relatedArticles = await BlogPost.find({
      status: "published",
      _id: { $ne: post._id },
      $or: [{ category: post.category }, { tags: { $in: post.tags } }]
    }).limit(2);

    const relatedProjects = await Project.find({
      status: "published",
      $or: [{ category: post.category }, { tags: { $in: post.tags } }]
    }).limit(2);

    return res.json({ post, relatedArticles, relatedProjects });
  } catch (err) {
    console.error("Error fetching blog post by slug:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Public Gallery
app.get("/api/gallery", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const query: any = { status: "published" };
    if (category && category !== "All") {
      query.category = category;
    }
    const galleryItems = await Gallery.find(query).sort({ createdAt: -1 });
    return res.json(galleryItems);
  } catch (err) {
    console.error("Error fetching gallery:", err);
    return res.status(500).json({ error: "Failed to fetch gallery items" });
  }
});

// Public Categories
app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const query: any = {};
    if (type) query.type = type;
    const categories = await Category.find(query).sort({ name: 1 });
    return res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Public SEO Settings
app.get("/api/seo", async (req: Request, res: Response) => {
  try {
    const seoSettings = await SEOPageSettings.find({});
    return res.json(seoSettings);
  } catch (err) {
    console.error("Error fetching SEO settings:", err);
    return res.status(500).json({ error: "Failed to fetch SEO settings" });
  }
});

app.get("/api/seo/:page", async (req: Request, res: Response) => {
  try {
    const setting = await SEOPageSettings.findOne({ page: req.params.page });
    if (!setting) {
      return res.status(404).json({ error: "SEO settings not found for page" });
    }
    return res.json(setting);
  } catch (err) {
    console.error("Error fetching page SEO:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// ==========================================
// ADMIN CMS API ROUTES (Protected)
// ==========================================

// Dashboard Stats
app.get("/api/admin/stats", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalGallery,
      recentProjects,
      recentBlogs
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: "published" }),
      Project.countDocuments({ status: "draft" }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: "published" }),
      BlogPost.countDocuments({ status: "draft" }),
      Gallery.countDocuments(),
      Project.find().sort({ createdAt: -1 }).limit(5),
      BlogPost.find().sort({ createdAt: -1 }).limit(5),
    ]);

    return res.json({
      stats: {
        totalProjects,
        publishedProjects,
        draftProjects,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalGallery,
      },
      recentContent: {
        projects: recentProjects,
        blogs: recentBlogs,
      }
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

// Media Upload to Cloudinary
app.post("/api/admin/upload", verifyAdminToken, upload.single("image"), async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
    const uploadResult = await uploadToCloudinary(req.file.buffer, "portfolio_cms");
    return res.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Failed to upload image to Cloudinary." });
  }
});

// --- Projects Admin CRUD ---
app.get("/api/admin/projects", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post("/api/admin/projects", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const project = await Project.create(data);
    return res.status(201).json(project);
  } catch (err: any) {
    console.error("Create project error:", err);
    return res.status(400).json({ error: err.message || "Failed to create project" });
  }
});

app.put("/api/admin/projects/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    data.updatedAt = new Date();
    const updated = await Project.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: "Project not found" });
    return res.json(updated);
  } catch (err: any) {
    console.error("Update project error:", err);
    return res.status(400).json({ error: err.message || "Failed to update project" });
  }
});

app.delete("/api/admin/projects/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    return res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

// --- Blog Admin CRUD ---
app.get("/api/admin/blog", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

app.post("/api/admin/blog", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const post = await BlogPost.create(data);
    return res.status(201).json(post);
  } catch (err: any) {
    console.error("Create blog error:", err);
    return res.status(400).json({ error: err.message || "Failed to create blog post" });
  }
});

app.put("/api/admin/blog/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    data.updatedAt = new Date();
    const updated = await BlogPost.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: "Blog post not found" });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update blog post" });
  }
});

app.delete("/api/admin/blog/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Blog post not found" });
    return res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// --- Gallery Admin CRUD ---
app.get("/api/admin/gallery", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch gallery items" });
  }
});

app.post("/api/admin/gallery", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const item = await Gallery.create(req.body);
    return res.status(201).json(item);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to create gallery item" });
  }
});

app.put("/api/admin/gallery/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const updated = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Gallery item not found" });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update gallery item" });
  }
});

app.delete("/api/admin/gallery/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Gallery item not found" });

    if (item.public_id) {
      await deleteFromCloudinary(item.public_id);
    }
    await Gallery.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete gallery item" });
  }
});

// --- Categories Admin CRUD ---
app.get("/api/admin/categories", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/admin/categories", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { name, slug, type } = req.body;
    const existing = await Category.findOne({ slug, type });
    if (existing) {
      return res.status(400).json({ error: "Category with this slug and type already exists." });
    }
    const cat = await Category.create({ name, slug, type });
    return res.status(201).json(cat);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to create category" });
  }
});

app.put("/api/admin/categories/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Category not found" });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update category" });
  }
});

app.delete("/api/admin/categories/:id", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    return res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

// --- SEO Settings Admin ---
app.put("/api/admin/seo/:page", verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const page = req.params.page;
    const data = req.body;
    data.updatedAt = new Date();
    const updated = await SEOPageSettings.findOneAndUpdate({ page }, data, { new: true, upsert: true });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update SEO settings" });
  }
});


// ==========================================
// DYNAMIC SITEMAP & ROBOTS.TXT
// ==========================================

app.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || "https://ais-dev-2evl5cli54boiv62bbeocg-271997554173.asia-southeast1.run.app";
    
    const [publishedProjects, publishedBlogs] = await Promise.all([
      Project.find({ status: "published" }).select("slug updatedAt"),
      BlogPost.find({ status: "published" }).select("slug updatedAt"),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = ["", "about", "projects", "blog", "gallery", "contact"];
    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/${page}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${page === "" ? "1.0" : "0.8"}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Project dynamic pages
    publishedProjects.forEach((proj) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/projects/${proj.slug}</loc>\n`;
      xml += `    <lastmod>${proj.updatedAt ? proj.updatedAt.toISOString() : new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    // Blog dynamic pages
    publishedBlogs.forEach((post) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updatedAt ? post.updatedAt.toISOString() : new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    return res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    return res.status(500).send("Error generating sitemap");
  }
});

app.get("/robots.txt", (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || "https://ais-dev-2evl5cli54boiv62bbeocg-271997554173.asia-southeast1.run.app";
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml`;

  res.header("Content-Type", "text/plain");
  return res.send(robots);
});


// ==========================================
// VITE / STATIC MIDDLEWARE SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
