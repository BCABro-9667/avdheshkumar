import { PORTFOLIO_DATA } from "../data/portfolio";

const API_BASE = "/api";

export async function fetchProjects(category?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE}/projects?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch from backend");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Using fallback local projects data");
  }
  // Fallback to PORTFOLIO_DATA projects
  return PORTFOLIO_DATA.projects.map((p, idx) => ({
    _id: p.id || String(idx),
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    shortDescription: p.description,
    description: p.features.join("\n"),
    featuredImage: p.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: p.title,
    category: p.category,
    keywords: [p.category, p.technology],
    tags: [p.technology],
    techStack: [p.technology],
    liveUrl: p.url,
    githubUrl: p.githubUrl,
    status: "published",
    seo: { title: `${p.title} — Avdhesh Kumar`, description: p.description },
    publishedAt: new Date(),
  }));
}

export async function fetchProjectBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/projects/${slug}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("API project fetch error, fallback to local");
  }
  // Fallback
  const found = PORTFOLIO_DATA.projects.find(
    (p) => p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
  );
  if (found) {
    return {
      project: {
        _id: found.id,
        title: found.title,
        slug,
        shortDescription: found.description,
        description: found.features.join("\n"),
        featuredImage: found.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        imageAlt: found.title,
        category: found.category,
        keywords: [found.category],
        tags: [found.technology],
        techStack: [found.technology],
        liveUrl: found.url,
        githubUrl: found.githubUrl,
        status: "published",
      },
      relatedProjects: [],
      relatedBlogs: [],
    };
  }
  return null;
}

export async function fetchBlogPosts(category?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE}/blog?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch blog posts");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Using fallback blog posts");
  }
  // Fallback
  return PORTFOLIO_DATA.blogs.map((art: any, idx: number) => ({
    _id: art.id || String(idx),
    title: art.title,
    slug: art.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    excerpt: art.excerpt,
    featuredImage: art.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    imageAlt: art.title,
    category: art.category,
    keywords: [art.category],
    tags: art.tags || [art.category],
    author: art.author || "Avdhesh Kumar",
    content: art.content || art.excerpt,
    status: "published",
    publishedAt: new Date(),
  }));
}

export async function fetchBlogPostBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/blog/${slug}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Fallback blog item");
  }
  const found = PORTFOLIO_DATA.blogs.find(
    (art: any) => art.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
  );
  if (found) {
    return {
      post: {
        _id: found.id,
        title: found.title,
        slug,
        excerpt: found.excerpt,
        featuredImage: found.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        imageAlt: found.title,
        category: found.category,
        keywords: [found.category],
        tags: found.tags || [found.category],
        author: "Avdhesh Kumar",
        content: found.content || found.excerpt,
        status: "published",
        publishedAt: new Date(),
      },
      relatedArticles: [],
      relatedProjects: [],
    };
  }
  return null;
}

export async function fetchGallery(category?: string) {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    const res = await fetch(`${API_BASE}/gallery?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {}
  return [
    {
      _id: "gal-1",
      title: "Full-Stack Dashboard Architecture",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Dashboard screenshot",
      category: "Architecture",
      status: "published",
    },
    {
      _id: "gal-2",
      title: "React & Tailwind Component Suite",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Code editor screenshot",
      category: "Frontend",
      status: "published",
    },
  ];
}
