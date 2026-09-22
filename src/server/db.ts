import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Category, SEOPageSettings } from "./models";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("username:password")) {
    console.warn("⚠️ MONGODB_URI is not configured or is using default placeholder. Database features will be simulated or require a valid connection string.");
    return;
  }

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("📦 Connected to MongoDB successfully.");
    
    // Seed default admin and initial categories if not present
    await seedDefaults();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

async function seedDefaults() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "avdhesh6968@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "Avdhesh Kumar",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`👤 Default admin user created: ${adminEmail}`);
    }

    // Seed default categories if none exist
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: "Full-Stack", slug: "full-stack", type: "project" },
        { name: "Frontend", slug: "frontend", type: "project" },
        { name: "React & Next.js", slug: "react-nextjs", type: "blog" },
        { name: "Web Development", slug: "web-development", type: "blog" },
        { name: "Portfolio Work", slug: "portfolio-work", type: "gallery" },
      ]);
      console.log("📂 Default categories seeded.");
    }

    // Seed default SEO settings if none exist
    const seoCount = await SEOPageSettings.countDocuments();
    if (seoCount === 0) {
      await SEOPageSettings.insertMany([
        {
          page: "home",
          title: "Avdhesh Kumar — Full-Stack & Frontend Web Developer",
          description: "Avdhesh Kumar is a frontend and full-stack web developer building responsive digital experiences with React, Next.js and Node.js.",
          canonical: "https://ais-dev-2evl5cli54boiv62bbeocg-271997554173.asia-southeast1.run.app",
          ogTitle: "Avdhesh Kumar — Portfolio & CMS",
          ogDescription: "Full-Stack & Frontend Web Developer crafting responsive web apps.",
          robots: "index, follow"
        },
        {
          page: "about",
          title: "About Me — Avdhesh Kumar",
          description: "Learn more about Avdhesh Kumar, MCA student and full-stack web developer based in Gurgaon, India.",
          robots: "index, follow"
        },
        {
          page: "projects",
          title: "Projects & Works — Avdhesh Kumar",
          description: "Explore web development projects, full-stack applications, and interactive code portfolios.",
          robots: "index, follow"
        },
        {
          page: "blog",
          title: "Journal & Articles — Avdhesh Kumar",
          description: "Read technical articles, thoughts on React, Node.js, full-stack engineering, and web development.",
          robots: "index, follow"
        },
        {
          page: "gallery",
          title: "Gallery & Media — Avdhesh Kumar",
          description: "Visual assets, project screenshots, and design snapshots.",
          robots: "index, follow"
        },
        {
          page: "contact",
          title: "Get in Touch — Avdhesh Kumar",
          description: "Connect with Avdhesh Kumar for freelance projects, full-stack development, and collaborations.",
          robots: "index, follow"
        }
      ]);
      console.log("🔍 Default SEO page settings seeded.");
    }
  } catch (err) {
    console.error("Error seeding defaults:", err);
  }
}
