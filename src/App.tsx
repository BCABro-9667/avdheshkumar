import React, { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { About } from "./components/About";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Gallery } from "./components/Gallery";
import { Experience } from "./components/Experience";
import { Education } from "./components/Education";
import { Testimonials } from "./components/Testimonials";
import { Blog } from "./components/Blog";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Cursor } from "./components/Cursor";
import { LoadingScreen } from "./components/LoadingScreen";
import { ScrollToTop } from "./components/ScrollToTop";

// Dedicated Pages
import { AboutPage } from "./pages/AboutPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { BlogsPage } from "./pages/BlogsPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { ContactPage } from "./pages/ContactPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { EmailStayConnectedModal } from "./components/EmailStayConnectedModal";

type PageType = "home" | "about" | "projects" | "gallery" | "blogs" | "contact" | "admin" | "project-detail" | "blog-detail" | string;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [blogId, setBlogId] = useState<string | null>(null);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [adminUser, setAdminUser] = useState<any>(JSON.parse(localStorage.getItem("admin_user") || "null"));
  const [showEmailModal, setShowEmailModal] = useState(false);

  // 1-minute timer to prompt the user to stay connected (if never submitted before)
  useEffect(() => {
    // If the user already submitted their email in a past session, NEVER prompt again
    const alreadySubmitted = localStorage.getItem("portfolio_user_email_submitted");
    if (alreadySubmitted === "true") {
      return;
    }

    // If dismissed in current tab session, respect dismissal for this session
    const dismissedThisSession = sessionStorage.getItem("portfolio_email_modal_dismissed");
    if (dismissedThisSession === "true") {
      return;
    }

    // Set 1 minute (60,000 ms) timer
    const timer = setTimeout(() => {
      const isDone = localStorage.getItem("portfolio_user_email_submitted");
      if (isDone !== "true") {
        setShowEmailModal(true);
      }
    }, 60000);

    // Provide testing hook for immediate verification without waiting full 60s
    (window as any).__triggerStayConnectedModal = () => {
      setShowEmailModal(true);
    };

    return () => clearTimeout(timer);
  }, []);

  const handleEmailSubmitted = (email: string) => {
    // Persist completion state so the popup will NEVER be shown again
    localStorage.setItem("portfolio_user_email_submitted", "true");
    localStorage.setItem("portfolio_user_email", email);
    localStorage.setItem("portfolio_user_email_timestamp", new Date().toISOString());
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    sessionStorage.setItem("portfolio_email_modal_dismissed", "true");
  };

  // Disable browser automatic scroll restoration and sync scroll to top on page change
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Ensure scroll resets to top immediately upon page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentPage, blogId]);

  // Sync with URL Pathname and Hash on Mount and PopState
  useEffect(() => {
    const handleRouteChange = () => {
      const pathname = window.location.pathname.replace(/^\//, "").toLowerCase();
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const target = hash || pathname;

      if (target.startsWith("admin")) {
        setCurrentPage("admin");
      } else if (target.startsWith("blog/")) {
        const id = target.replace("blog/", "");
        setBlogId(id);
        setCurrentPage("blog-detail");
      } else if (target.startsWith("projects/")) {
        const slug = target.replace("projects/", "");
        setProjectSlug(slug);
        setCurrentPage("project-detail");
      } else if (["home", "about", "projects", "gallery", "blogs", "contact", "admin"].includes(target)) {
        setCurrentPage(target);
        setBlogId(null);
        setProjectSlug(null);
      } else {
        if (target === "" || target === "index.html") {
          setCurrentPage("home");
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    handleRouteChange();
    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const handleNavigate = (pageId: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (pageId.startsWith("blog/")) {
      const id = pageId.replace("blog/", "");
      setBlogId(id);
      setCurrentPage("blog-detail");
      window.history.pushState(null, '', `/${pageId}`);
      window.location.hash = `blog/${id}`;
    } else if (pageId.startsWith("projects/")) {
      const slug = pageId.replace("projects/", "");
      setProjectSlug(slug);
      setCurrentPage("project-detail");
      window.history.pushState(null, '', `/${pageId}`);
      window.location.hash = `projects/${slug}`;
    } else if (pageId === "admin") {
      setCurrentPage("admin");
      window.history.pushState(null, '', '/admin');
      window.location.hash = "admin";
    } else {
      const target = pageId.toLowerCase();
      setCurrentPage(target);
      setBlogId(null);
      setProjectSlug(null);
      window.history.pushState(null, '', target === "home" ? '/' : `/${target}`);
      window.location.hash = target === "home" ? "" : target;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#141413] relative selection:bg-[#D4F050] selection:text-[#141413]">
      {/* Subtle Grain Texture Overlay */}
      <div className="grain-overlay pointer-events-none" />

      {/* Desktop Magnetic Cursor */}
      <Cursor />

      {/* Auto Back to Top Button */}
      <ScrollToTop />

      {/* Minimal Intro Loading Sequence */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* Fixed Sticky Minimalist Navbar */}
      <Navbar
        currentPage={currentPage.startsWith("blog") ? "blogs" : currentPage}
        onNavigate={handleNavigate}
      />

      <main>
        {currentPage === "home" && (
          <>
            {/* Hero Section */}
            <Hero
              onExploreClick={() => {
                const el = document.getElementById("projects");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              onContactClick={() => handleNavigate("contact")}
            />

            {/* Continuous Horizontal Marquee */}
            <Marquee />

            {/* 01 / About Section */}
            <About onNavigate={handleNavigate} />

            {/* Interactive Skills Cloud */}
            <Skills />

            {/* 02 / Selected Work (Grid of 6 + Explore More) */}
            <Projects onNavigate={handleNavigate} />

            {/* 03 / Gallery Section (Preview + Explore More) */}
            <Gallery onNavigate={handleNavigate} />

            {/* 04 / Experience Timeline */}
            <Experience onNavigate={handleNavigate} />

            {/* Education, Certifications & Achievements */}
            <Education />

            {/* 05 / Journal / Blog Section */}
            <Blog onNavigate={handleNavigate} />

            {/* Testimonials */}
            <Testimonials />

            {/* Contact Section */}
            <Contact />
          </>
        )}

        {currentPage === "about" && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === "projects" && (
          <ProjectsPage onNavigate={handleNavigate} />
        )}

        {currentPage === "project-detail" && projectSlug && (
          <ProjectDetailPage slug={projectSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === "gallery" && (
          <GalleryPage />
        )}

        {currentPage === "blogs" && (
          <BlogsPage onNavigate={handleNavigate} />
        )}

        {currentPage === "blog-detail" && blogId && (
          <BlogPostPage postId={blogId} onNavigate={handleNavigate} />
        )}

        {currentPage === "contact" && (
          <ContactPage />
        )}

        {currentPage === "admin" && (
          !adminToken ? (
            <AdminLogin
              onLoginSuccess={(token, user) => {
                setAdminToken(token);
                setAdminUser(user);
              }}
            />
          ) : (
            <AdminLayout
              token={adminToken}
              adminUser={adminUser}
              onLogout={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
                setAdminToken(null);
                setAdminUser(null);
                handleNavigate("home");
              }}
            />
          )
        )}
      </main>

      {/* Minimalist Editorial Footer */}
      <Footer onBackToTop={scrollToTop} />

      {/* 1-Minute Stay Connected Popup Modal */}
      <EmailStayConnectedModal
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        onSuccess={handleEmailSubmitted}
      />
    </div>
  );
}
