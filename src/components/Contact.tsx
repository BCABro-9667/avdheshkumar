import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  ArrowUpRight,
  Send,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { PORTFOLIO_DATA } from "../data/portfolio";
import { MagneticButton } from "./MagneticButton";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Your name is required";
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) {
      errs.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Please include a bit more detail (min 10 characters)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    // Simulated network transmission / Frontend ready state
    // TODO: Connect to Resend, Formspree, or an Express /api/contact endpoint
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch {
      setStatus("error");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section id="contact" className="py-24 sm:py-36 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Big Editorial Headline */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[#6B6862] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D4F050] border border-[#141413]/30" />
            <span>06 / GET IN TOUCH</span>
          </div>

          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#141413] leading-[1.02] max-w-4xl">
            Have an idea? <br />
            <span className="text-[#141413] underline decoration-[#D4F050] decoration-[5px] underline-offset-8">
              Let's build it.
            </span>
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-[#6B6862] max-w-2xl font-normal leading-relaxed">
            I'm always open to interesting projects, collaborations and opportunities. Feel free to send a message or connect through social links.
          </p>
        </div>

        {/* Grid: Direct Contact Details (Left) + Contact Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Unified Direct Info & Social Profiles Card */}
          <div className="lg:col-span-5">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F2] border-2 border-[#141413] shadow-[8px_8px_0px_#141413] space-y-8">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#6B6862] border-b border-[#141413]/10 pb-3 mb-6">
                  DIRECT CHANNELS & PROFILES
                </div>

                <div className="space-y-4">
                  {/* Email Block */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2EA] border border-[#141413]/15 hover:border-[#141413]/35 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#141413] text-[#D4F050] border border-[#141413] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#D4F050]">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-[#6B6862] uppercase tracking-wider">
                            Email
                          </div>
                          <a
                            href={`mailto:${PORTFOLIO_DATA.personal.email}`}
                            className="font-display font-semibold text-xs sm:text-sm md:text-base text-[#141413] hover:text-[#8EAE00] hover:underline break-all transition-colors block"
                          >
                            {PORTFOLIO_DATA.personal.email}
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(PORTFOLIO_DATA.personal.email, "email")}
                        title="Copy email"
                        className="p-2 rounded-xl bg-[#FAF8F2] border border-[#141413]/20 hover:border-[#141413] hover:bg-[#141413] hover:text-[#D4F050] text-[#6B6862] transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Phone Block */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2EA] border border-[#141413]/15 hover:border-[#141413]/35 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#141413] text-[#D4F050] border border-[#141413] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#D4F050]">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-[#6B6862] uppercase tracking-wider">
                            Phone / WhatsApp
                          </div>
                          <a
                            href={`tel:${PORTFOLIO_DATA.personal.phone.replace(/\s+/g, "")}`}
                            className="font-display font-semibold text-sm sm:text-base text-[#141413] hover:text-[#8EAE00] hover:underline transition-colors block"
                          >
                            {PORTFOLIO_DATA.personal.phone}
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(PORTFOLIO_DATA.personal.phone, "phone")}
                        title="Copy phone"
                        className="p-2 rounded-xl bg-[#FAF8F2] border border-[#141413]/20 hover:border-[#141413] hover:bg-[#141413] hover:text-[#D4F050] text-[#6B6862] transition-colors cursor-pointer shrink-0"
                      >
                        {copiedField === "phone" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Location (Local) Block */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F2EA] border border-[#141413]/15 hover:border-[#141413]/35 transition-all duration-200">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#141413] text-[#D4F050] border border-[#141413] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#D4F050]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-mono text-[11px] text-[#6B6862] uppercase tracking-wider">
                          Location
                        </div>
                        <div className="font-display font-semibold text-sm sm:text-base text-[#141413]">
                          {PORTFOLIO_DATA.personal.location}
                        </div>
                        <div className="font-mono text-xs text-[#6B6862] mt-0.5">
                          Available for onsite in Delhi-NCR & remote worldwide
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF8F2] border-2 border-[#141413] shadow-[8px_8px_0px_#141413]">
              <div className="flex items-center justify-between border-b border-[#141413]/10 pb-4 mb-8">
                <div className="font-display text-2xl font-bold text-[#141413]">
                  Send a Direct Message
                </div>
                <div className="font-mono text-xs text-[#6B6862]">
                  Responds in ~24 hrs
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-xs uppercase tracking-wider text-[#141413] font-semibold"
                    >
                      Your Name <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border text-sm font-sans text-[#141413] placeholder:text-[#6B6862]/60 focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                        errors.name ? "border-red-500 bg-red-50/50" : "border-[#141413]/20 focus:border-[#141413]"
                      }`}
                    />
                    {errors.name && (
                      <p className="font-mono text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-xs uppercase tracking-wider text-[#141413] font-semibold"
                    >
                      Your Email <span className="text-[#FF6B35]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border text-sm font-sans text-[#141413] placeholder:text-[#6B6862]/60 focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                        errors.email ? "border-red-500 bg-red-50/50" : "border-[#141413]/20 focus:border-[#141413]"
                      }`}
                    />
                    {errors.email && (
                      <p className="font-mono text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-subject"
                    className="block font-mono text-xs uppercase tracking-wider text-[#141413] font-semibold"
                  >
                    Subject <span className="text-[#FF6B35]">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border text-sm font-sans text-[#141413] placeholder:text-[#6B6862]/60 focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                      errors.subject ? "border-red-500 bg-red-50/50" : "border-[#141413]/20 focus:border-[#141413]"
                    }`}
                  />
                  {errors.subject && (
                    <p className="font-mono text-xs text-red-600">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-message"
                    className="block font-mono text-xs uppercase tracking-wider text-[#141413] font-semibold"
                  >
                    Message <span className="text-[#FF6B35]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-[#F5F2EA] border text-sm font-sans text-[#141413] placeholder:text-[#6B6862]/60 focus:outline-none focus:ring-1 focus:ring-[#141413] resize-y ${
                      errors.message ? "border-red-500 bg-red-50/50" : "border-[#141413]/20 focus:border-[#141413]"
                    }`}
                  />
                  {errors.message && (
                    <p className="font-mono text-xs text-red-600">{errors.message}</p>
                  )}
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-xl bg-[#D4F050]/50 border border-[#141413] flex items-center gap-3 text-sm text-[#141413] font-medium"
                    >
                      <CheckCircle className="w-5 h-5 text-[#141413] shrink-0" />
                      <div>
                        <strong>Message sent successfully!</strong> Thank you for reaching out. Avdhesh will get back to you shortly.
                      </div>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-xl bg-red-50 border border-red-300 flex items-center gap-3 text-sm text-red-700"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        Unable to send right now. Please email directly at{" "}
                        <a
                          href={`mailto:${PORTFOLIO_DATA.personal.email}`}
                          className="underline font-medium"
                        >
                          {PORTFOLIO_DATA.personal.email}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between">
                  <MagneticButton strength={0.25}>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#141413] text-[#F5F2EA] font-mono text-xs uppercase tracking-wider hover:bg-[#D4F050] hover:text-[#141413] transition-colors border border-[#141413] disabled:opacity-60 cursor-pointer"
                    >
                      {status === "loading" ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send message</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </MagneticButton>

                 
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
