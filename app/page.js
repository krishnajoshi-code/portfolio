"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════
const C = {
  bg: "#050505",
  card: "#0a0a0a",
  border: "#1a1a1a",
  surface: "#111111",
  white: "#ffffff",
  text: "#999999",
  muted: "#555555",
  accent: "#0ea5e9",
  accentDim: "rgba(14, 165, 233, 0.15)",
  accentGlow: "rgba(14, 165, 233, 0.4)",
};

// ═══════════════════════════════════════════════════════════
// MOUSE POSITION CONTEXT — shared across components
// ═══════════════════════════════════════════════════════════
const MouseContext = createContext({ x: 0, y: 0 });

function MouseProvider({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <MouseContext.Provider value={pos}>{children}</MouseContext.Provider>;
}

// ═══════════════════════════════════════════════════════════
// SPOTLIGHT CURSOR — Large radial glow follows mouse
// ═══════════════════════════════════════════════════════════
function SpotlightCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 20, stiffness: 300 });
  const springY = useSpring(cursorY, { damping: 20, stiffness: 300 });
  const trailX = useSpring(cursorX, { damping: 40, stiffness: 90 });
  const trailY = useSpring(cursorY, { damping: 40, stiffness: 90 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = (e) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    const hoverIn = () => setHovering(true);
    const hoverOut = () => setHovering(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    const bindHovers = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
        el.removeEventListener("mouseenter", hoverIn);
        el.removeEventListener("mouseleave", hoverOut);
        el.addEventListener("mouseenter", hoverIn);
        el.addEventListener("mouseleave", hoverOut);
      });
    };
    const observer = new MutationObserver(bindHovers);
    observer.observe(document.body, { childList: true, subtree: true });
    bindHovers();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Soft trailing glow — follows with delay */}
      <motion.div
        style={{
          position: "fixed",
          left: trailX,
          top: trailY,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 1,
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Cursor ring — expands on hover */}
      <motion.div
        className="cursor-glow"
        style={{
          position: "fixed",
          left: springX,
          top: springY,
          width: hovering ? 44 : 24,
          height: hovering ? 44 : 24,
          borderRadius: "50%",
          border: `1.5px solid ${hovering ? C.accent : "rgba(14,165,233,0.3)"}`,
          background: "transparent",
          pointerEvents: "none",
          zIndex: 9998,
          transform: "translate(-50%, -50%)",
          transition: "width 0.25s ease, height 0.25s ease, border-color 0.25s ease",
        }}
      />
      {/* Cursor dot */}
      <motion.div
        className="custom-cursor"
        style={{
          position: "fixed",
          left: springX,
          top: springY,
          width: clicking ? 4 : 5,
          height: clicking ? 4 : 5,
          borderRadius: "50%",
          background: C.accent,
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          transition: "width 0.15s, height 0.15s",
        }}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// FLOATING PARTICLES — Tiny dots drifting across sections
// ═══════════════════════════════════════════════════════════
function FloatingParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  );

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: C.accent,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        background: C.accent, transformOrigin: "0%", scaleX, zIndex: 10000,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// RIPPLE EFFECT — Expanding circle on click
// ═══════════════════════════════════════════════════════════
function useRipple() {
  const [ripples, setRipples] = useState([]);

  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, []);

  const RippleContainer = useCallback(() => (
    <>
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: C.accentGlow,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  ), [ripples]);

  return { addRipple, RippleContainer };
}


// ═══════════════════════════════════════════════════════════
// TEXT SCRAMBLE
// ═══════════════════════════════════════════════════════════
function TextScramble({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [text, setText] = useState("");
  const target = typeof children === "string" ? children : "";
  const chars = "!@#$%^&*_+-=[]{}|;:<>?/~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  useEffect(() => {
    if (!isInView || !target) return;
    let iter = 0;
    const max = target.length * 3;
    const interval = setInterval(() => {
      setText(target.split("").map((c, i) => (c === " " ? " " : i < iter / 3 ? target[i] : chars[Math.floor(Math.random() * chars.length)])).join(""));
      iter++;
      if (iter > max) { setText(target); clearInterval(interval); }
    }, 30);
    return () => clearInterval(interval);
  }, [isInView, target]);

  return <span ref={ref}>{isInView ? text : "\u00A0"}</span>;
}

// ═══════════════════════════════════════════════════════════
// WORD REVEAL — Words appear with blur
// ═══════════════════════════════════════════════════════════
function WordReveal({ children, style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const words = typeof children === "string" ? children.split(" ") : [];
  return (
    <span ref={ref} style={{ display: "inline", ...style }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.35, delay: i * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: "inline-block", marginRight: "0.3em" }}
        >{w}</motion.span>
      ))}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// COUNTER
// ═══════════════════════════════════════════════════════════
function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let s = 0; const end = parseInt(value);
    const t = setInterval(() => { s += end / 120; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 1000 / 60);
    return () => clearInterval(t);
  }, [isInView, value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ═══════════════════════════════════════════════════════════
// STAGGERED LIST — Items bounce in one by one
// ═══════════════════════════════════════════════════════════
const staggerItem = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }, // overshoot bounce
  }),
};

// ═══════════════════════════════════════════════════════════
// EASTER EGG TERMINAL
// ═══════════════════════════════════════════════════════════
function Terminal({ onClose }) {
  const [history, setHistory] = useState([
    { type: "system", text: "Krishna Joshi Terminal v1.0" },
    { type: "system", text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const commands = {
    help: () => 'Commands: help, about, skills, experience, contact, projects, hire, cv, clear, exit',
    about: () => `
  ╔═══════════════════════════════════════╗
  ║  Krishna Joshi                        ║
  ║  Front-End Developer | London, UK     ║
  ║  5+ years | React Specialist          ║
  ║  MCA Graduate | Full UK Work Rights   ║
  ╚═══════════════════════════════════════╝`,
    skills: () => `
  [████████████████████░] React      95%
  [███████████████████░░] JavaScript 90%
  [██████████████████░░░] TypeScript 85%
  [█████████████████░░░░] Next.js    80%
  [████████████████░░░░░] CSS/Tailw  75%`,
    experience: () => `
  > Freelance Dev    | London  | 2025-now
  > Mid Frontend Dev | RHAD    | 2021-2025
  > Jr Frontend Dev  | RHAD    | 2020-2021
  > Apprentice Dev   | RHAD    | 2019-2020`,
    contact: () => `
  Email:    krishna.h.joshi@hotmail.com
  Phone:    +44 7557 792153
  LinkedIn: linkedin.com/in/krishnajoshi-dev
  GitHub:   github.com/krishnajoshi`,
    projects: () => `
  01. Ashley Hotel Group   ashleyhotelgroup.com
  02. Singapore Cruise     singaporecruise.com.sg
  03. CentralHR Australia  centralhr.com.au
  04. M2 Wellness          m2wellness.sg
  05. Gallant              gallant.sg
  06. React Learning       React 19 + Next.js + Hooks`,
    hire: () => `
  ╔═════════════════════════════════════════════╗
  ║  🟢 AVAILABLE FOR HIRE                      ║
  ║                                             ║
  ║  Looking for: Front-End / React roles       ║
  ║  Location:    London, UK (Full Work Rights) ║
  ║  Notice:      Available immediately         ║
  ║                                             ║
  ║  → krishna.h.joshi@hotmail.com              ║
  ╚═════════════════════════════════════════════╝`,
    cv: () => 'Opening CV... (just kidding, type "contact" for details)',
    clear: () => "__CLEAR__",
    exit: () => "__EXIT__",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, { type: "input", text: `> ${input}` }];

    if (commands[cmd]) {
      const result = commands[cmd]();
      if (result === "__CLEAR__") { setHistory([]); setInput(""); return; }
      if (result === "__EXIT__") { onClose(); return; }
      newHistory.push({ type: "output", text: result });
    } else if (cmd) {
      newHistory.push({ type: "error", text: `Command not found: ${cmd}. Type "help" for available commands.` });
    }
    setHistory(newHistory);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "min(700px, 90vw)",
        maxHeight: "70vh",
        background: "#0c0c0c",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Title bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: "#111",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", cursor: "pointer" }} onClick={onClose} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <span style={{ marginLeft: 12, color: C.muted, fontSize: "0.75rem" }}>krishna@portfolio ~ %</span>
        </div>

        {/* Content */}
        <div ref={scrollRef} style={{ padding: 16, height: 400, overflowY: "auto" }}>
          {history.map((line, i) => (
            <div key={i} style={{
              fontSize: "0.8rem",
              lineHeight: 1.6,
              color: line.type === "error" ? "#ff6b6b" : line.type === "system" ? C.accent : line.type === "input" ? C.white : C.text,
              whiteSpace: "pre",
              marginBottom: 4,
            }}>
              {line.text}
            </div>
          ))}

          <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ color: C.accent, fontSize: "0.8rem" }}>{">"}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: C.white,
                fontSize: "0.8rem",
                fontFamily: "'JetBrains Mono', monospace",
                caretColor: C.accent,
              }}
              autoFocus
            />
          </form>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROJECT DRAWER — Side panel with live preview
// ═══════════════════════════════════════════════════════════
function ProjectDrawer({ project, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 15000,
        display: "flex",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Info panel */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -60, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: "35%",
          minWidth: 300,
          maxWidth: 420,
          background: C.bg,
          borderRight: `1px solid ${C.border}`,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            background: "none",
            border: `1px solid ${C.border}`,
            color: C.text,
            width: 36,
            height: 36,
            borderRadius: 6,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          ✕
        </button>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: C.accent,
          fontSize: "0.7rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>
          // project {project.num}
        </p>

        <h2 style={{ fontSize: "2rem", fontWeight: 900, color: C.white, marginBottom: 20, letterSpacing: "-1px" }}>
          {project.name}
        </h2>

        <p style={{ color: C.text, fontSize: "1rem", lineHeight: 1.7, marginBottom: 28 }}>
          {project.desc}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {project.tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              style={{
                border: `1px solid ${C.border}`,
                color: C.muted,
                padding: "6px 14px",
                borderRadius: 4,
                fontSize: "0.75rem",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <motion.a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.accent,
              color: C.bg,
              padding: "12px 28px",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            Visit Live Site →
          </motion.a>

        <p style={{
          marginTop: 24,
          color: C.muted,
          fontSize: "0.7rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Press Esc or click outside to close
        </p>
      </motion.div>

      {/* Live preview */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          background: C.surface,
          position: "relative",
        }}>
          {/* Browser chrome */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#111",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <div style={{
              marginLeft: 12,
              flex: 1,
              background: "#1a1a1a",
              borderRadius: 4,
              padding: "4px 12px",
              fontSize: "0.7rem",
              color: C.muted,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {project.url}
            </div>
          </div>
          <iframe
            src={project.url}
            title={project.name}
            style={{ width: "100%", height: "calc(100% - 38px)", border: "none" }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
function Nav({ onTerminal }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["contact", "experience", "projects", "skills", "about"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 200) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) { onTerminal(); setLogoClicks(0); }
  };

  const links = ["About", "Skills", "Projects", "Experience", "Contact"];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "12px 40px" : "20px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: scrolled ? "rgba(5,5,5,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.4s",
      }}
    >
      <a
          href="#hero"
          onClick={handleLogoClick}
          data-hover
          style={{
            fontSize: "1.2rem", fontWeight: 800, color: C.white,
            textDecoration: "none", letterSpacing: "-1px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          KJ<span style={{ color: C.accent }}>.</span>
          {logoClicks > 0 && logoClicks < 5 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ fontSize: "0.5rem", color: C.muted, marginLeft: 4, verticalAlign: "super" }}
            >
              {5 - logoClicks}
            </motion.span>
          )}
        </a>

      <div className="nav-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {links.map((link, i) => {
          const isActive = active === link.toLowerCase();
          return (
            <motion.a
                href={`#${link.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                data-hover
                style={{
                  textDecoration: "none",
                  color: isActive ? C.accent : C.text,
                  fontSize: "0.85rem", fontWeight: 500,
                  letterSpacing: "0.5px", textTransform: "uppercase",
                  transition: "color 0.3s", position: "relative",
                }}
                onMouseEnter={(e) => (e.target.style.color = C.white)}
                onMouseLeave={(e) => (e.target.style.color = isActive ? C.accent : C.text)}
              >
                {link}
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    style={{
                      position: "absolute", bottom: -6, left: "50%",
                      width: 4, height: 4, borderRadius: "50%",
                      background: C.accent, transform: "translateX(-50%)",
                    }}
                  />
                )}
              </motion.a>
          );
        })}
      </div>

      <button
        className="nav-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: "none", background: "none", border: "none",
          color: C.white, fontSize: "1.3rem",
          alignItems: "center", justifyContent: "center", width: 40, height: 40,
        }}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "rgba(5,5,5,0.98)", backdropFilter: "blur(20px)",
              padding: "24px 40px", display: "flex", flexDirection: "column", gap: 20,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {links.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                style={{ color: C.text, textDecoration: "none", fontSize: "1rem", fontWeight: 500 }}
              >{link}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════
function Hero() {
  const [typed, setTyped] = useState("");
  const roles = ["Front-End Developer", "React Specialist", "UI Engineer", "Web Craftsman"];
  const roleIdx = useRef(0);
  const charIdx = useRef(0);
  const isDeleting = useRef(false);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  useEffect(() => {
    const type = () => {
      const current = roles[roleIdx.current];
      if (!isDeleting.current) {
        charIdx.current++;
        setTyped(current.slice(0, charIdx.current));
        if (charIdx.current === current.length) { isDeleting.current = true; return setTimeout(type, 2000); }
      } else {
        charIdx.current--;
        setTyped(current.slice(0, charIdx.current));
        if (charIdx.current === 0) { isDeleting.current = false; roleIdx.current = (roleIdx.current + 1) % roles.length; }
      }
      setTimeout(type, isDeleting.current ? 40 : 70);
    };
    const timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { addRipple, RippleContainer } = useRipple();

  return (
    <motion.section
      id="hero"
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", position: "relative",
        overflow: "hidden", padding: "80px 24px 60px",
        opacity: heroOpacity, scale: heroScale, y: heroY,
      }}
    >
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 800 }}>
        {/* Available badge — recruiter magnet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: 28 }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: `1px solid ${C.border}`, borderRadius: 50,
            padding: "6px 16px", fontSize: "0.75rem",
            fontFamily: "'JetBrains Mono', monospace", color: C.text,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.6)",
              animation: "blink 2s ease-in-out infinite",
            }} />
            Available for work in London, UK
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, fontSize: "0.8rem", fontWeight: 500,
            letterSpacing: "3px", textTransform: "uppercase", marginBottom: 32,
          }}>// portfolio</p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontSize: "clamp(3rem, 9vw, 6rem)", fontWeight: 900, color: C.white,
            margin: "0 0 16px 0", lineHeight: 1.05, letterSpacing: "-3px",
          }}
        >
          Krishna<br />
          <span style={{ WebkitTextStroke: `1.5px ${C.white}`, WebkitTextFillColor: "transparent" }}>Joshi</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(1rem, 3vw, 1.4rem)", fontWeight: 400,
            minHeight: 50, marginBottom: 40, color: C.text,
          }}
        >
          <span style={{ color: C.muted }}>{">"}</span>{" "}
          <span style={{ color: C.accent }}>{typed}</span>
          <span style={{ color: C.accent, animation: "blink 1s step-end infinite" }}>_</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          style={{ maxWidth: 520, margin: "0 auto 48px", fontSize: "1.05rem", lineHeight: 1.7, color: C.text }}
        >
          5+ years crafting responsive, high-performance web experiences. React, JavaScript & modern CSS.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}
        >
          <motion.a
              href="#projects"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={addRipple}
              style={{
                background: C.white, color: C.bg,
                padding: "14px 36px", borderRadius: 6,
                textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                position: "relative", overflow: "hidden",
              }}
            >
              View Work
              <RippleContainer />
            </motion.a>
          <motion.a
              href="#contact"
              whileHover={{ scale: 1.04, borderColor: C.accent }}
              whileTap={{ scale: 0.97 }}
              onClick={addRipple}
              style={{
                border: `1px solid ${C.border}`, color: C.white,
                padding: "14px 36px", borderRadius: 6,
                textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                transition: "border-color 0.3s", position: "relative", overflow: "hidden",
              }}
            >
              Get in Touch
              <RippleContainer />
            </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}
        >
          {[
            { num: "5", suffix: "+", label: "Years" },
            { num: "10", suffix: "+", label: "Projects" },
            { num: "3", suffix: "", label: "Countries" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: C.white, fontFamily: "'JetBrains Mono', monospace" }}>
                <Counter value={s.num} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "0.7rem", color: C.muted, textTransform: "uppercase", letterSpacing: "2px", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}
      >
        <span style={{ fontSize: "0.7rem", color: C.muted, letterSpacing: "2px", textTransform: "uppercase" }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1, height: 24, background: `linear-gradient(to bottom, ${C.accent}, transparent)` }}
        />
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════
function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} style={{ padding: "120px 24px", position: "relative" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 20 }}>// about</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: C.white, marginBottom: 48, letterSpacing: "-1px", lineHeight: 1.15 }}>
            <TextScramble>About Me</TextScramble>
          </h2>
        </motion.div>

        <div style={{ fontSize: "1.15rem", lineHeight: 1.9, color: C.text, marginBottom: 48 }}>
          <WordReveal>
            I'm a Front-End Developer based in London with a passion for building web experiences that look great and perform even better. Over 5+ years, I've worked across hospitality, wellness, HR, and e-commerce, turning Figma designs into pixel-perfect, responsive realities.
          </WordReveal>
        </div>
        <div style={{ fontSize: "1.15rem", lineHeight: 1.9, color: C.text, marginBottom: 48 }}>
          <WordReveal>
            At RHAD, I grew from an apprentice to leading front-end development across 10+ production projects. I enjoy mentoring other developers, optimising performance, and finding creative solutions to tricky UI challenges.
          </WordReveal>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["London, UK", "5+ Years", "MCA Graduate", "Full UK Work Rights", "Available Immediately"].map((tag, i) => (
            <motion.span
                variants={staggerItem}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={i}
                whileHover={{ borderColor: C.accent, color: C.accent }}
                data-hover
                style={{
                  padding: "8px 18px", borderRadius: 4,
                  border: `1px solid ${C.border}`, color: C.text,
                  fontSize: "0.8rem", fontWeight: 500,
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "border-color 0.3s, color 0.3s",
                }}
              >{tag}</motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════
const ALL_SKILLS = ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind", "Git", "Webpack", "Vite", "Next.js", "Jest", "Cypress", "SASS", "Redux", "REST APIs"];

const SKILL_CHALLENGES = {
  React: {
    title: "React Component Challenge",
    description: "What will this component render?",
    code: `function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Clicked {count} times\n    </button>\n  );\n}`,
    question: "What happens when the button is clicked 3 times?",
    options: ["Clicked 0 times", "Clicked 3 times", "Error: useState not defined", "Nothing happens"],
    correct: 1,
    explanation: "Each click calls setCount which increments the state. After 3 clicks, count = 3, so it renders 'Clicked 3 times'."
  },
  JavaScript: {
    title: "JS Output Challenge",
    description: "Predict the console output:",
    code: `console.log(typeof null);\nconsole.log(0.1 + 0.2 === 0.3);\nconsole.log("5" + 3);\nconsole.log("5" - 3);`,
    question: "What are the 4 outputs in order?",
    options: ["object, false, 53, 2", "null, true, 8, 2", "object, true, 53, 2", "undefined, false, 8, 2"],
    correct: 0,
    explanation: "typeof null is 'object' (JS quirk), 0.1+0.2 is 0.30000...04 (not 0.3), '5'+3 concatenates to '53', '5'-3 coerces to number giving 2."
  },
  TypeScript: {
    title: "TypeScript Type Challenge",
    description: "Which type definition is correct?",
    code: `interface User {\n  name: string;\n  age: number;\n  email?: string;\n}\n\nconst user: User = ???`,
    question: "Which object satisfies the User interface?",
    options: [
      '{ name: "Krishna", age: "25" }',
      '{ name: "Krishna", age: 25 }',
      '{ name: "Krishna" }',
      '{ name: "Krishna", age: 25, phone: 123 }'
    ],
    correct: 1,
    explanation: "name (string) and age (number) are required. email is optional (?). Option B has correct types. Option D fails because 'phone' is not in the interface."
  },
  HTML5: {
    title: "Semantic HTML Challenge",
    description: "Which is the most semantic HTML5 structure?",
    code: `<!-- Option A -->\n<div class="header">\n  <div class="nav">...</div>\n</div>\n\n<!-- Option B -->\n<header>\n  <nav>...</nav>\n</header>`,
    question: "Which structure is better for accessibility?",
    options: ["Option A (div-based)", "Option B (semantic tags)", "Both are identical", "Neither is correct"],
    correct: 1,
    explanation: "Semantic HTML5 tags like <header>, <nav>, <main>, <article> provide meaning to screen readers and search engines. Divs have no semantic value."
  },
  CSS3: {
    title: "CSS Flexbox Challenge",
    description: "What does this CSS do?",
    code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}`,
    question: "Where will the child element appear?",
    options: ["Top-left corner", "Center of the page", "Bottom-right corner", "Stretched to full width"],
    correct: 1,
    explanation: "justify-content: center (horizontal center) + align-items: center (vertical center) + height: 100vh (full viewport) = perfectly centered on the page."
  },
  Tailwind: {
    title: "Tailwind CSS Challenge",
    description: "Convert this CSS to Tailwind classes:",
    code: `/* CSS */\n.button {\n  background-color: #3b82f6;\n  color: white;\n  padding: 8px 16px;\n  border-radius: 8px;\n  font-weight: 700;\n}`,
    question: "Which Tailwind classes are correct?",
    options: [
      "bg-blue-500 text-white p-2 rounded font-bold",
      "bg-blue-500 text-white py-2 px-4 rounded-lg font-bold",
      "blue-bg white-text pad-2 round-lg bold",
      "bg-primary text-light p-2-4 rad-8 fw-700"
    ],
    correct: 1,
    explanation: "bg-blue-500 = #3b82f6, text-white, py-2 px-4 = 8px 16px, rounded-lg = 8px border-radius, font-bold = 700 weight."
  },
  Git: {
    title: "Git Workflow Challenge",
    description: "You accidentally committed to main. What do you do?",
    code: `$ git log --oneline\nabc1234 bad commit (HEAD -> main)\ndef5678 previous good commit`,
    question: "What's the safest way to undo without losing changes?",
    options: [
      "git reset --hard HEAD~1",
      "git reset --soft HEAD~1",
      "git revert HEAD",
      "git push --force"
    ],
    correct: 1,
    explanation: "git reset --soft HEAD~1 moves HEAD back but keeps your changes staged. You can then switch to a new branch and commit there safely."
  },
  Webpack: {
    title: "Webpack Config Challenge",
    description: "What does this webpack config do?",
    code: `module.exports = {\n  entry: './src/index.js',\n  output: {\n    filename: 'bundle.js',\n    path: path.resolve(__dirname, 'dist')\n  },\n  mode: 'production'\n};`,
    question: "What happens when you run webpack?",
    options: [
      "Starts a dev server",
      "Bundles & minifies src/index.js into dist/bundle.js",
      "Only copies files",
      "Runs tests"
    ],
    correct: 1,
    explanation: "entry: starting file, output: bundled result in dist/bundle.js, mode: 'production' enables minification and tree-shaking."
  },
  Vite: {
    title: "Vite Speed Challenge",
    description: "Why is Vite faster than Webpack for development?",
    code: `// Webpack: Bundles EVERYTHING first\n// Then serves the bundle to browser\n\n// Vite: Uses native ES modules\n// Serves files directly, transforms on-demand`,
    question: "What's Vite's key advantage?",
    options: [
      "It uses a smaller config file",
      "Native ES modules + on-demand transforms (no bundling in dev)",
      "It only works with React",
      "It pre-compiles everything at install time"
    ],
    correct: 1,
    explanation: "Vite leverages native ES modules in the browser. It doesn't bundle during dev — it transforms files on-demand, making HMR (Hot Module Replacement) near-instant."
  },
  "Next.js": {
    title: "Next.js Rendering Challenge",
    description: "What type of rendering is this?",
    code: `// app/page.js\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/data');\n  const data = await res.json();\n  return <div>{data.title}</div>;\n}`,
    question: "When does the data fetching happen?",
    options: [
      "In the browser (client-side)",
      "On the server at request time (SSR)",
      "At build time only (SSG)",
      "Never — it will error"
    ],
    correct: 1,
    explanation: "In Next.js App Router, async Server Components fetch data on the server at request time by default. The HTML is sent pre-rendered to the browser."
  },
  Jest: {
    title: "Testing Challenge",
    description: "Fix this failing test:",
    code: `function add(a, b) { return a + b; }\n\ntest('adds 1 + 2 to equal 3', () => {\n  expect(add(1, 2)).toBe(4); // ❌ FAILS\n});`,
    question: "What should .toBe() value be?",
    options: ["toBe(4)", "toBe(3)", "toBe('3')", "toEqual(12)"],
    correct: 1,
    explanation: "add(1, 2) returns 3, so the assertion should be .toBe(3). The test was expecting 4 which is incorrect."
  },
  Cypress: {
    title: "E2E Testing Challenge",
    description: "What does this Cypress test do?",
    code: `cy.visit('/login');\ncy.get('[data-testid=\"email\"]').type('user@test.com');\ncy.get('[data-testid=\"password\"]').type('pass123');\ncy.get('button[type=\"submit\"]').click();\ncy.url().should('include', '/dashboard');`,
    question: "What is this test verifying?",
    options: [
      "That the login page loads",
      "That form validation works",
      "That login redirects to dashboard on success",
      "That the password is encrypted"
    ],
    correct: 2,
    explanation: "The test fills login credentials, clicks submit, then asserts the URL changed to /dashboard — verifying successful login redirect."
  },
  SASS: {
    title: "SASS Nesting Challenge",
    description: "What CSS does this SASS compile to?",
    code: `.nav {\n  background: #333;\n  &__item {\n    color: white;\n    &--active {\n      color: #0ea5e9;\n    }\n  }\n}`,
    question: "What's the CSS selector for the active item?",
    options: [
      ".nav .item .active",
      ".nav__item--active",
      ".nav--active__item",
      ".nav > .item.active"
    ],
    correct: 1,
    explanation: "SASS & references the parent. &__item becomes .nav__item. &--active inside becomes .nav__item--active. This is the BEM naming convention."
  },
  Redux: {
    title: "Redux Flow Challenge",
    description: "What's the correct Redux data flow?",
    code: `// User clicks "Add to Cart"\n// What happens next?\n\n1. dispatch(addItem(product))\n2. reducer updates state\n3. component re-renders\n4. UI shows new cart count`,
    question: "What's the correct order of Redux data flow?",
    options: [
      "Component → Store → Reducer → Action",
      "Action → Dispatch → Reducer → Store → UI",
      "Store → Action → Component → Reducer",
      "UI → Reducer → Action → Store"
    ],
    correct: 1,
    explanation: "Redux flow: User triggers Action → dispatch() sends it → Reducer processes and returns new state → Store updates → UI re-renders with new data."
  },
  "REST APIs": {
    title: "REST API Challenge",
    description: "Match the HTTP method to its purpose:",
    code: `GET    /api/users      → ???\nPOST   /api/users      → ???\nPUT    /api/users/1    → ???\nDELETE /api/users/1    → ???`,
    question: "What does PUT /api/users/1 do?",
    options: [
      "Creates a new user",
      "Gets user with id 1",
      "Updates/replaces user with id 1",
      "Deletes user with id 1"
    ],
    correct: 2,
    explanation: "GET = read, POST = create, PUT = update/replace entire resource, DELETE = remove. PUT /api/users/1 updates the user with id 1."
  },
};

function SkillChallengeModal({ skill, onClose }) {
  const challenge = SKILL_CHALLENGES[skill];
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  if (!challenge) return null;

  function handleSelect(idx) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
  }

  const isCorrect = selected === challenge.correct;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
          padding: 32, maxWidth: 600, width: "100%", maxHeight: "85vh", overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none", border: "none",
          color: C.muted, fontSize: "1.5rem", cursor: "pointer", lineHeight: 1,
        }}>&times;</button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>// {skill} challenge</span>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.white, marginTop: 8 }}>{challenge.title}</h3>
          <p style={{ color: C.text, fontSize: "0.9rem", marginTop: 4 }}>{challenge.description}</p>
        </div>

        {/* Code block */}
        <div style={{
          background: "#0d1117", borderRadius: 10, padding: 16, marginBottom: 20,
          fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#e6edf3",
          whiteSpace: "pre-wrap", lineHeight: 1.6, overflowX: "auto",
          border: `1px solid ${C.border}`,
        }}>
          {challenge.code}
        </div>

        {/* Question */}
        <p style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: "0.95rem" }}>{challenge.question}</p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {challenge.options.map((opt, idx) => {
            let bg = "transparent";
            let borderCol = C.border;
            let textCol = C.text;

            if (showResult) {
              if (idx === challenge.correct) {
                bg = "rgba(34, 197, 94, 0.15)";
                borderCol = "#22c55e";
                textCol = "#22c55e";
              } else if (idx === selected && !isCorrect) {
                bg = "rgba(239, 68, 68, 0.15)";
                borderCol = "#ef4444";
                textCol = "#ef4444";
              }
            } else if (idx === selected) {
              borderCol = C.accent;
              bg = C.accentDim;
            }

            return (
              <motion.button
                key={idx}
                whileHover={!showResult ? { borderColor: C.accent, background: C.accentDim } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(idx)}
                data-hover
                style={{
                  padding: "12px 16px", border: `1px solid ${borderCol}`, borderRadius: 8,
                  background: bg, color: textCol, textAlign: "left",
                  cursor: showResult ? "default" : "pointer", fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.82rem", transition: "all 0.2s", lineHeight: 1.4,
                }}
              >
                <span style={{ color: C.muted, marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20, padding: 16, borderRadius: 10,
                background: isCorrect ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${isCorrect ? "#22c55e" : "#ef4444"}`,
              }}
            >
              <p style={{ fontWeight: 800, color: isCorrect ? "#22c55e" : "#ef4444", marginBottom: 8, fontSize: "0.95rem" }}>
                {isCorrect ? "Correct! ✅" : "Not quite! ❌"}
              </p>
              <p style={{ color: C.text, fontSize: "0.85rem", lineHeight: 1.6 }}>{challenge.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Try another */}
        {showResult && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            whileHover={{ borderColor: C.accent }}
            data-hover
            style={{
              marginTop: 16, padding: "10px 24px", border: `1px solid ${C.border}`,
              borderRadius: 6, background: "transparent", color: C.white,
              cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem",
              width: "100%", transition: "border-color 0.3s",
            }}
          >
            Close &amp; Try Another Skill
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeSkill, setActiveSkill] = useState(null);

  return (
    <section id="skills" ref={ref} style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 20 }}>// skills</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: C.white, marginBottom: 16, letterSpacing: "-1px" }}>
            <TextScramble>Technical Skills</TextScramble>
          </h2>
          <p style={{ color: C.text, fontSize: "0.9rem", marginBottom: 60, fontFamily: "'JetBrains Mono', monospace" }}>Click any skill to try an interactive challenge</p>
        </motion.div>

        {/* Marquee */}
        <div style={{ overflow: "hidden", marginBottom: 60, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "24px 0" }}>
          <div style={{ display: "flex", gap: 48, animation: "marquee 25s linear infinite", width: "fit-content" }}>
            {[...ALL_SKILLS, ...ALL_SKILLS].map((s, i) => (
              <span key={i} style={{ whiteSpace: "nowrap", fontSize: "0.9rem", fontWeight: 500, color: C.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "1px" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Skill cards with stagger bounce */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {ALL_SKILLS.map((skill, i) => (
            <motion.div
                key={skill}
                variants={staggerItem}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={i}
                whileHover={{ borderColor: C.accent, background: C.accentDim, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSkill(skill)}
                data-hover
                style={{
                  padding: "20px 16px", border: `1px solid ${C.border}`,
                  borderRadius: 8, textAlign: "center", cursor: "pointer",
                  transition: "border-color 0.3s, background 0.3s", background: "transparent",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: C.white, fontFamily: "'JetBrains Mono', monospace" }}>{skill}</span>
                <div style={{ fontSize: "0.6rem", color: C.muted, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>click to play</div>
              </motion.div>
          ))}
        </div>
      </div>

      {/* Challenge Modal */}
      <AnimatePresence>
        {activeSkill && (
          <SkillChallengeModal skill={activeSkill} onClose={() => setActiveSkill(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════
const PROJECTS = [
  { name: "Ashley Hotel Group", url: "https://ashleyhotelgroup.com", desc: "Multi-property hotel website with booking integration, responsive layouts, and brand consistency across the group.", tags: ["Responsive", "Custom Layouts", "SEO"], num: "01" },
  { name: "Singapore Cruise", url: "https://singaporecruise.com.sg", desc: "Cruise booking platform with mobile-first responsive design and custom forms.", tags: ["Mobile-First", "Forms", "JavaScript"], num: "02" },
  { name: "CentralHR Australia", url: "https://centralhr.com.au", desc: "HR services website with clean professional layout, service showcases, and contact integrations.", tags: ["Professional", "HR", "Responsive"], num: "03" },
  { name: "M2 Wellness", url: "https://www.m2wellness.sg", desc: "Wellness platform with serene design aesthetics, service pages, and appointment-oriented UX.", tags: ["UX Design", "Wellness", "Animations"], num: "04" },
  { name: "Gallant", url: "https://gallant.sg", desc: "Corporate website with bold design, modern animations, and seamless content management.", tags: ["Corporate", "Animations", "JavaScript"], num: "05" },
  { name: "React Learning", url: "https://krishnajoshi-code.github.io/portfolio/", desc: "Interactive React learning journey — completed React Essential Training covering hooks, server components, Next.js App Router, and async data fetching with React 19.", tags: ["React 19", "Next.js", "Hooks"], num: "06" },
];

function ProjectCard({ project, index, onSelect }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const { addRipple, RippleContainer } = useRipple();

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={index}
    >
      <motion.div
        data-hover
        whileHover={{ y: -6, borderColor: C.accent + "30" }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => { addRipple(e); onSelect(project); }}
        transition={{ duration: 0.3 }}
        style={{
          borderRadius: 12, border: `1px solid ${C.border}`,
          overflow: "hidden", background: C.card,
          position: "relative", cursor: "none",
          transition: "border-color 0.3s",
        }}
      >
        <RippleContainer />
        <div style={{
          height: 180, position: "relative", background: C.surface,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "3.5rem", fontWeight: 900, color: C.border, lineHeight: 1 }}>{project.num}</span>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: C.white, marginTop: 8 }}>{project.name}</span>
        </div>
        <div style={{ padding: 24 }}>
          <p style={{ color: C.text, fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 16 }}>{project.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {project.tags.map((tag) => (
              <span key={tag} style={{ border: `1px solid ${C.border}`, color: C.muted, padding: "4px 10px", borderRadius: 4, fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>{tag}</span>
            ))}
          </div>
          <div style={{ color: C.accent, fontSize: "0.8rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            Click to preview →
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Projects({ onSelectProject }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" ref={ref} style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 20 }}>// projects</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: C.white, marginBottom: 60, letterSpacing: "-1px" }}>
            <TextScramble>Selected Work</TextScramble>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} onSelect={onSelectProject} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// EXPERIENCE
// ═══════════════════════════════════════════════════════════
const EXPERIENCE = [
  { role: "Freelance Front-End Developer", company: "Self-Employed", location: "London, UK", period: "Mar 2025 – Present", type: "Remote", highlights: ["Building React web apps for startups focused on performance and SEO", "Responsive landing pages, e-commerce interfaces, and dashboards using Tailwind CSS", "Performance audits and Core Web Vitals optimisation for client websites"] },
  { role: "Mid Front-End Developer", company: "RHAD", location: "Ahmedabad, India", period: "Nov 2021 – Feb 2025", type: "On-site", highlights: ["Led front-end for 10+ production websites and web apps", "Built reusable component libraries, reducing dev time by ~30%", "Mentored junior developers on React best practices and clean code"] },
  { role: "Junior Front-End Developer", company: "RHAD", location: "Ahmedabad, India", period: "Apr 2020 – Oct 2021", type: "On-site", highlights: ["Built responsive cross-browser interfaces across multiple sectors", "Translated Figma mockups into pixel-perfect HTML/CSS/JS", "jQuery-to-React migrations and performance tuning"] },
  { role: "Apprentice Front-End Developer", company: "RHAD", location: "Ahmedabad, India", period: "Dec 2019 – Mar 2020", type: "On-site", highlights: ["Foundation in front-end principles and team collaboration"] },
];

function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="experience" ref={ref} style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 20 }}>// experience</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: C.white, marginBottom: 60, letterSpacing: "-1px" }}>
            <TextScramble>Where I've Worked</TextScramble>
          </h2>
        </motion.div>

        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: C.border }} />

          {EXPERIENCE.map((exp, i) => (
            <motion.div
              key={exp.role}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ paddingLeft: 32, marginBottom: 48, position: "relative" }}
            >
              <div style={{
                position: "absolute", left: -4, top: 6,
                width: 9, height: 9, borderRadius: "50%",
                background: i === 0 ? C.accent : C.muted,
                boxShadow: i === 0 ? `0 0 12px ${C.accentGlow}` : "none",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <div>
                  <h3 style={{ color: C.white, fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{exp.role}</h3>
                  <p style={{ color: C.text, fontSize: "0.85rem", fontWeight: 500, margin: "4px 0 0" }}>
                    {exp.company} <span style={{ color: C.muted }}>•</span> {exp.location}
                  </p>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: C.muted }}>{exp.period}</span>
              </div>

              <ul style={{ margin: "12px 0 0", paddingLeft: 0, listStyle: "none" }}>
                {exp.highlights.map((h, j) => (
                  <motion.li
                    key={j}
                    variants={staggerItem}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    custom={i * 3 + j}
                    style={{
                      color: C.text, fontSize: "0.9rem", lineHeight: 1.7,
                      marginBottom: 4, paddingLeft: 16, position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: C.muted }}>—</span>{h}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════
function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { addRipple, RippleContainer } = useRipple();

  return (
    <section id="contact" ref={ref} style={{ padding: "120px 24px 80px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 20 }}>// contact</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: C.white, marginBottom: 32, letterSpacing: "-1px" }}>
            <TextScramble>Let's Build Something</TextScramble>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "1.05rem", lineHeight: 1.7, color: C.text, marginBottom: 48 }}
        >
          Currently looking for front-end / React developer roles in London and open to freelance projects.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}
        >
          {[
            { label: "Send Email", href: "mailto:krishna.h.joshi@hotmail.com", primary: true },
            { label: "LinkedIn", href: "https://linkedin.com/in/krishnajoshi-dev", primary: false },
            { label: "GitHub", href: "https://github.com/krishnajoshi", primary: false },
          ].map((btn) => (
            <motion.a
                href={btn.href}
                target={btn.primary ? undefined : "_blank"}
                rel={btn.primary ? undefined : "noopener noreferrer"}
                whileHover={{ scale: 1.04, ...(btn.primary ? {} : { borderColor: C.accent }) }}
                whileTap={{ scale: 0.97 }}
                onClick={addRipple}
                style={{
                  background: btn.primary ? C.accent : "transparent",
                  color: btn.primary ? C.bg : C.white,
                  border: btn.primary ? "none" : `1px solid ${C.border}`,
                  padding: "14px 36px", borderRadius: 6,
                  textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                  position: "relative", overflow: "hidden",
                  transition: "border-color 0.3s",
                }}
              >
                {btn.label}
                <RippleContainer />
              </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginBottom: 64, paddingBottom: 48, borderBottom: `1px solid ${C.border}` }}
        >
          {[
            { label: "Email", value: "krishna.h.joshi@hotmail.com" },
            { label: "Phone", value: "+44 7557 792153" },
            { label: "Location", value: "London, UK" },
          ].map((c) => (
            <div key={c.label}>
              <p style={{ color: C.muted, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 6px", fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</p>
              <p style={{ color: C.text, fontSize: "0.9rem", fontWeight: 500, margin: 0 }}>{c.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Designed & Built by Krishna Joshi — © 2026
        </motion.p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════
export default function Page() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <MouseProvider>
      <main style={{ background: C.bg, overflowX: "hidden" }}>
        <SpotlightCursor />
        <FloatingParticles />
        <ScrollProgress />
        <Nav onTerminal={() => setTerminalOpen(true)} />
        <Hero />
        <About />
        <Skills />
        <Projects onSelectProject={setSelectedProject} />
        <Experience />
        <Contact />

        {/* Easter egg terminal */}
        <AnimatePresence>
          {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
        </AnimatePresence>

        {/* Project drawer */}
        <AnimatePresence>
          {selectedProject && <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />}
        </AnimatePresence>
      </main>
    </MouseProvider>
  );
}
