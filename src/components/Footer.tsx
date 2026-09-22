import React from "react";
import { ArrowUp, Github, Instagram, Linkedin, Globe, Mail, Facebook, MessageCircle } from "lucide-react";
import { PORTFOLIO_DATA } from "../data/portfolio";
import { MagneticButton } from "./MagneticButton";

interface FooterProps {
  onBackToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBackToTop }) => {
  return (
    <footer className="border-t border-[#141413]/15 bg-[#141413] text-[#F5F2EA] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Platforms Row */}
        <div className="pb-8 border-b border-white/10 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 font-mono text-xs text-center">
          <span className="text-[#9E9A91] uppercase tracking-widest text-[11px]">
            Connect & Follow:
          </span>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a
              href="https://github.com/BCABro-9667"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <a
              href={PORTFOLIO_DATA.personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>

            <a
              href="https://wa.me/919667346203"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href="https://www.chess.com/member/prankmaster5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <span className="text-sm">♞</span>
              <span>Chess.com</span>
            </a>

            <a
              href="https://avdheshh-portfolio.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </a>

            <a
              href={`mailto:${PORTFOLIO_DATA.personal.email}`}
              className="flex items-center gap-1.5 text-[#F5F2EA] hover:text-[#D4F050] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Grand Bold Editorial Name Typography */}
        <div className="pt-12 sm:pt-16 pb-4 overflow-hidden select-none">
          <div className="font-display font-black text-5xl sm:text-7xl md:text-9xl lg:text-[12.5vw] tracking-tighter text-[#F5F2EA] text-center leading-none uppercase transition-all duration-300 hover:text-[#D4F050]">
            AVDHESH KUMAR
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[#9E9A91] tracking-widest uppercase mt-6 pt-4 border-t border-white/10 gap-2">
            <span>FULL-STACK & FRONTEND WEB DEVELOPER</span>
            <span>GURGAON, HARYANA, INDIA</span>
            <span>© 2026 ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
