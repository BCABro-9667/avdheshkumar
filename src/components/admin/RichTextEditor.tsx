import React, { useEffect, useRef } from "react";
import Quill from "quill";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write content here...",
  height = 350,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container to prevent duplicate toolbars on re-renders / React strict mode
    containerRef.current.innerHTML = "";
    const editorDiv = document.createElement("div");
    containerRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
      placeholder: placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    quillInstance.current = quill;

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on("text-change", () => {
      isInternalChange.current = true;
      const html = quill.root.innerHTML;
      onChange(html === "<p><br></p>" ? "" : html);
      isInternalChange.current = false;
    });

    return () => {
      quillInstance.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    if (quillInstance.current && !isInternalChange.current) {
      const currentHTML = quillInstance.current.root.innerHTML;
      if (value !== currentHTML && (value || currentHTML !== "<p><br></p>")) {
        quillInstance.current.root.innerHTML = value || "";
      }
    }
  }, [value]);

  return (
    <div className="rounded-2xl border-2 border-[#141413] overflow-hidden bg-[#FAF8F2] shadow-[2px_2px_0px_#141413]">
      <div ref={containerRef} style={{ minHeight: `${height}px` }} className="font-sans text-sm text-[#141413] bg-[#FAF8F2]" />
    </div>
  );
};
