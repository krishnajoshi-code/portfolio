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

const SKILL_ICONS = { React: "⚛️", JavaScript: "✨", TypeScript: "🔷", HTML5: "🧱", CSS3: "🎨", Tailwind: "💨", Git: "🌿", Webpack: "📦", Vite: "⚡", "Next.js": "▲", Jest: "🧪", Cypress: "🌲", SASS: "💅", Redux: "🔄", "REST APIs": "🌐" };

// ── Interactive Skill Demos ──

// React Demo: Live mini app with counter + color changer
function ReactDemo() {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState(C.accent);
  const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 16 }}>A live React component — try clicking!</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setCount(c => c + 1)}
          style={{ width: 120, height: 120, borderRadius: 16, background: color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff" }}>{count}</span>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>tap me</span>
        </motion.div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 120 }}>
          {colors.map(c => (
            <motion.div key={c} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.8 }} onClick={() => setColor(c)}
              style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "2px solid #fff" : "2px solid transparent" }} />
          ))}
        </div>
      </div>
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.3 }} key={count}
        style={{ marginTop: 16, padding: "8px 16px", background: C.surface, borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: C.text }}>
        {"<Counter value={"}{count}{"} color={\"" + color + "\"} />"}
      </motion.div>
    </div>
  );
}

// JavaScript Demo: Live console
function JavaScriptDemo() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState([{ type: "info", text: '> Try: 2**10, "hello".split(""), Date.now()' }]);
  function runCode() {
    if (!input.trim()) return;
    try {
      const result = String(new Function("return " + input)());
      setLogs(l => [...l, { type: "input", text: "> " + input }, { type: "output", text: result }]);
    } catch (e) {
      setLogs(l => [...l, { type: "input", text: "> " + input }, { type: "error", text: e.message }]);
    }
    setInput("");
  }
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>A mini JS console — type any expression!</p>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", maxHeight: 180, overflowY: "auto" }}>
        {logs.slice(-8).map((l, i) => (
          <div key={i} style={{ color: l.type === "error" ? "#ef4444" : l.type === "output" ? "#22c55e" : l.type === "input" ? C.accent : C.muted, marginBottom: 4 }}>{l.text}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && runCode()}
          placeholder="Type JavaScript here..."
          style={{ flex: 1, padding: "8px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", outline: "none" }} />
        <motion.button whileHover={{ background: C.accent }} whileTap={{ scale: 0.95 }} onClick={runCode}
          style={{ padding: "8px 16px", background: C.accentDim, border: "none", borderRadius: 6, color: C.white, cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>Run</motion.button>
      </div>
    </div>
  );
}

// CSS Demo: Live flexbox playground
function CSSDemo() {
  const [justify, setJustify] = useState("center");
  const [align, setAlign] = useState("center");
  const [gap, setGap] = useState(12);
  const [radius, setRadius] = useState(8);
  const justifyOpts = ["flex-start", "center", "flex-end", "space-between", "space-around"];
  const alignOpts = ["flex-start", "center", "flex-end", "stretch"];
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Play with flexbox properties live!</p>
      <div style={{ display: "flex", justifyContent: justify, alignItems: align, gap, height: 140, background: C.surface, borderRadius: 10, padding: 12, marginBottom: 12, transition: "all 0.3s" }}>
        {[C.accent, "#22c55e", "#f59e0b"].map((bg, i) => (
          <motion.div layout key={i} style={{ width: 40, height: align === "stretch" ? "auto" : 40, borderRadius: radius, background: bg, minHeight: 30 }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.75rem" }}>
        <div>
          <label style={{ color: C.muted, display: "block", marginBottom: 4 }}>justify-content</label>
          <select value={justify} onChange={e => setJustify(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
            {justifyOpts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: C.muted, display: "block", marginBottom: 4 }}>align-items</label>
          <select value={align} onChange={e => setAlign(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
            {alignOpts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: C.muted, display: "block", marginBottom: 4 }}>gap: {gap}px</label>
          <input type="range" min="0" max="40" value={gap} onChange={e => setGap(Number(e.target.value))} style={{ width: "100%", accentColor: C.accent }} />
        </div>
        <div>
          <label style={{ color: C.muted, display: "block", marginBottom: 4 }}>border-radius: {radius}px</label>
          <input type="range" min="0" max="50" value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: "100%", accentColor: C.accent }} />
        </div>
      </div>
    </div>
  );
}

// TypeScript Demo: Animated type annotations
function TypeScriptDemo() {
  const [step, setStep] = useState(0);
  const lines = [
    { code: "let name", type: ": string", val: ' = "Krishna"' },
    { code: "let age", type: ": number", val: " = 25" },
    { code: "let skills", type: ": string[]", val: ' = ["React", "JS"]' },
    { code: "let isDev", type: ": boolean", val: " = true" },
  ];
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % (lines.length + 1)), 1200); return () => clearInterval(t); }, []);
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Watch TypeScript add type safety to JavaScript!</p>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginBottom: 8, opacity: i < step ? 1 : 0.3, transition: "opacity 0.5s" }}>
            <span style={{ color: "#ff7b72" }}>{l.code}</span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={i < step ? { opacity: 1, x: 0 } : { opacity: 0 }}
              style={{ color: "#79c0ff" }}>{l.type}</motion.span>
            <span style={{ color: "#e6edf3" }}>{l.val}</span>
          </div>
        ))}
      </div>
      <motion.button whileHover={{ borderColor: C.accent }} whileTap={{ scale: 0.95 }} onClick={() => setStep(0)}
        style={{ marginTop: 10, padding: "6px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, cursor: "pointer", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
        Replay Animation
      </motion.button>
    </div>
  );
}

// Git Demo: Mini terminal
function GitDemo() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState([{ text: "~/project (main) $", type: "prompt" }]);
  const [branch, setBranch] = useState("main");
  const cmds = {
    "git status": () => "On branch " + branch + "\nnothing to commit, working tree clean",
    "git branch": () => "* " + branch + "\n  feature/login\n  feature/cart",
    "git log": () => "abc123 feat: add cart\ndef456 fix: navbar bug\nghi789 init: project setup",
    "git checkout -b": (args) => { const b = args || "new-branch"; setBranch(b); return "Switched to new branch '" + b + "'"; },
    "git checkout": (args) => { const b = args || "main"; setBranch(b); return "Switched to branch '" + b + "'"; },
    help: () => "Try: git status, git branch, git log, git checkout main, git checkout -b feature/new",
  };
  function run() {
    if (!input.trim()) return;
    let output = "Command not found. Type 'help' for commands.";
    const cmd = input.trim().toLowerCase();
    if (cmd === "help" || cmd === "clear") {
      if (cmd === "clear") { setLog([{ text: "~/" + branch + " $", type: "prompt" }]); setInput(""); return; }
      output = cmds.help();
    } else {
      for (const [k, fn] of Object.entries(cmds)) {
        if (cmd.startsWith(k)) { output = fn(cmd.replace(k, "").trim()); break; }
      }
    }
    setLog(l => [...l, { text: "$ " + input, type: "input" }, { text: output, type: "output" }]);
    setInput("");
  }
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>A mini Git terminal — try commands!</p>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", maxHeight: 180, overflowY: "auto" }}>
        {log.slice(-10).map((l, i) => (
          <div key={i} style={{ color: l.type === "input" ? C.accent : l.type === "prompt" ? C.muted : "#e6edf3", whiteSpace: "pre-wrap", marginBottom: 2 }}>{l.text}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <span style={{ color: C.accent, fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>({branch}) $</span>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
          placeholder="Type a git command..."
          style={{ flex: 1, padding: "8px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", outline: "none" }} />
      </div>
    </div>
  );
}

// Tailwind Demo: Class playground
function TailwindDemo() {
  const [classes, setClasses] = useState("bg-blue-500 text-white p-4 rounded-lg");
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Type Tailwind classes and see them applied live!</p>
      <div style={{ background: C.surface, borderRadius: 10, padding: 20, marginBottom: 12, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100 }}>
        <div className={classes} style={{ transition: "all 0.3s" }}>Hello World</div>
      </div>
      <input value={classes} onChange={e => setClasses(e.target.value)} placeholder="Type Tailwind classes..."
        style={{ width: "100%", padding: "10px 12px", background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 8, color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", outline: "none" }} />
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {["bg-red-500 text-white p-6 rounded-full text-2xl font-bold", "bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg", "border-2 border-green-500 text-green-500 p-3 rounded-md hover:bg-green-500"].map((preset, i) => (
          <motion.button key={i} whileHover={{ borderColor: C.accent }} whileTap={{ scale: 0.95 }} onClick={() => setClasses(preset)}
            style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer", fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace" }}>
            Preset {i + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Vite Demo: Speed comparison animation
function ViteDemo() {
  const [running, setRunning] = useState(false);
  const [webpack, setWebpack] = useState(0);
  const [vite, setVite] = useState(0);
  function race() {
    setRunning(true); setWebpack(0); setVite(0);
    let w = 0, v = 0;
    const wi = setInterval(() => { w += 2; setWebpack(w); if (w >= 100) clearInterval(wi); }, 80);
    const vi = setInterval(() => { v += 8; setVite(Math.min(v, 100)); if (v >= 100) { clearInterval(vi); setTimeout(() => setRunning(false), 500); } }, 80);
  }
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 16 }}>Watch Vite vs Webpack in a startup speed race!</p>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ color: C.muted, fontSize: "0.75rem", width: 70, fontFamily: "'JetBrains Mono', monospace" }}>Webpack</span>
          <div style={{ flex: 1, height: 24, background: C.surface, borderRadius: 12, overflow: "hidden" }}>
            <motion.div animate={{ width: webpack + "%" }} style={{ height: "100%", background: "#f59e0b", borderRadius: 12 }} />
          </div>
          <span style={{ color: C.muted, fontSize: "0.75rem", width: 35, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(webpack * 40)}ms</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: C.muted, fontSize: "0.75rem", width: 70, fontFamily: "'JetBrains Mono', monospace" }}>Vite ⚡</span>
          <div style={{ flex: 1, height: 24, background: C.surface, borderRadius: 12, overflow: "hidden" }}>
            <motion.div animate={{ width: vite + "%" }} style={{ height: "100%", background: "#a855f7", borderRadius: 12 }} />
          </div>
          <span style={{ color: C.muted, fontSize: "0.75rem", width: 35, textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(vite * 10)}ms</span>
        </div>
      </div>
      <motion.button whileHover={{ borderColor: C.accent }} whileTap={{ scale: 0.95 }} onClick={race} disabled={running}
        style={{ padding: "8px 20px", background: running ? C.surface : C.accentDim, border: `1px solid ${running ? C.border : C.accent}`, borderRadius: 8, color: running ? C.muted : C.white, cursor: running ? "default" : "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 700 }}>
        {running ? "Racing..." : "Start Race! 🏁"}
      </motion.button>
    </div>
  );
}

// Redux Demo: Animated data flow
function ReduxDemo() {
  const [step, setStep] = useState(-1);
  const [count, setCount] = useState(0);
  const steps = ["🖱️ Click", "📤 Dispatch", "⚙️ Reducer", "🏪 Store", "🖥️ UI Update"];
  function trigger() {
    setStep(0);
    [1, 2, 3, 4].forEach((s, i) => setTimeout(() => { setStep(s); if (s === 4) setCount(c => c + 1); }, (i + 1) * 500));
    setTimeout(() => setStep(-1), 3000);
  }
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 16 }}>Click to watch the Redux data flow in action!</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <motion.div animate={{ background: i <= step ? C.accent : C.surface, scale: i === step ? 1.15 : 1, color: i <= step ? "#fff" : C.muted }}
              style={{ padding: "6px 10px", borderRadius: 8, fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", textAlign: "center", transition: "all 0.3s", whiteSpace: "nowrap" }}>
              {s}
            </motion.div>
            {i < steps.length - 1 && <span style={{ color: i < step ? C.accent : C.border }}>→</span>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <motion.div key={count} animate={{ scale: [1, 1.2, 1] }}
          style={{ fontSize: "2rem", fontWeight: 900, color: C.white, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
          Count: {count}
        </motion.div>
        <motion.button whileHover={{ borderColor: C.accent, background: C.accentDim }} whileTap={{ scale: 0.95 }} onClick={trigger} disabled={step >= 0}
          style={{ padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, cursor: step >= 0 ? "default" : "pointer", fontSize: "0.85rem", fontWeight: 700 }}>
          {step >= 0 ? "Flowing..." : "dispatch(increment()) 🚀"}
        </motion.button>
      </div>
    </div>
  );
}

// REST API Demo: Mini API tester
function APIDemo() {
  const [method, setMethod] = useState("GET");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const endpoints = { GET: "/api/users/1", POST: "/api/users", PUT: "/api/users/1", DELETE: "/api/users/1" };
  const responses = {
    GET: { id: 1, name: "Krishna Joshi", role: "Frontend Dev" },
    POST: { id: 4, name: "New User", created: true },
    PUT: { id: 1, name: "Krishna (Updated)", modified: true },
    DELETE: { id: 1, deleted: true, status: "success" },
  };
  const colors = { GET: "#22c55e", POST: "#3b82f6", PUT: "#f59e0b", DELETE: "#ef4444" };
  function send() {
    setLoading(true); setResult(null);
    setTimeout(() => { setResult(responses[method]); setLoading(false); }, 800);
  }
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Test REST API methods — click Send!</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["GET", "POST", "PUT", "DELETE"].map(m => (
          <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => { setMethod(m); setResult(null); }}
            style={{ padding: "6px 12px", background: method === m ? colors[m] : "transparent", border: `1px solid ${method === m ? colors[m] : C.border}`, borderRadius: 6, color: method === m ? "#fff" : C.muted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: 700 }}>
            {m}
          </motion.button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: "8px 12px", background: C.surface, borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: C.text }}>
          <span style={{ color: colors[method], fontWeight: 700 }}>{method}</span> {endpoints[method]}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={send} disabled={loading}
          style={{ padding: "8px 16px", background: colors[method], border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>
          {loading ? "..." : "Send"}
        </motion.button>
      </div>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", minHeight: 60 }}>
        {loading ? <span style={{ color: C.muted }}>Sending request...</span> :
          result ? <pre style={{ color: "#22c55e", margin: 0 }}>{"// 200 OK\n" + JSON.stringify(result, null, 2)}</pre> :
            <span style={{ color: C.muted }}>// Response will appear here</span>}
      </div>
    </div>
  );
}

// Jest Demo: Animated test runner
function JestDemo() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const tests = [
    { name: "renders component correctly", pass: true },
    { name: "handles click event", pass: true },
    { name: "updates state on input", pass: true },
    { name: "displays error message", pass: false },
    { name: "matches snapshot", pass: true },
  ];
  function run() {
    setRunning(true); setResults([]);
    tests.forEach((t, i) => {
      setTimeout(() => {
        setResults(r => [...r, t]);
        if (i === tests.length - 1) setTimeout(() => setRunning(false), 500);
      }, (i + 1) * 600);
    });
  }
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  return (
    <div>
      <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Watch a test suite run in real-time!</p>
      <div style={{ background: "#0d1117", borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", minHeight: 120 }}>
        {results.length === 0 && !running && <span style={{ color: C.muted }}>PASS ./components/App.test.js</span>}
        {results.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            style={{ marginBottom: 4, color: r.pass ? "#22c55e" : "#ef4444" }}>
            {r.pass ? "✓" : "✗"} {r.name} <span style={{ color: C.muted }}>({(Math.random() * 50 + 5).toFixed(0)}ms)</span>
          </motion.div>
        ))}
        {results.length === tests.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            <span style={{ color: "#22c55e" }}>Tests: {passed} passed</span>, <span style={{ color: failed ? "#ef4444" : C.muted }}>{failed} failed</span>, {tests.length} total
          </motion.div>
        )}
      </div>
      <motion.button whileHover={{ borderColor: C.accent }} whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
        style={{ marginTop: 10, padding: "8px 20px", background: running ? C.surface : C.accentDim, border: `1px solid ${running ? C.border : C.accent}`, borderRadius: 8, color: running ? C.muted : C.white, cursor: running ? "default" : "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 700 }}>
        {running ? "Running..." : "npm test 🧪"}
      </motion.button>
    </div>
  );
}

// Generic simple demo for remaining skills
function SimpleDemo({ skill }) {
  const demos = {
    HTML5: { title: "Semantic HTML Builder", desc: "Drag to build a semantic page structure!", elements: ["<header>", "<nav>", "<main>", "<article>", "<aside>", "<footer>"], },
    Webpack: { title: "Bundle Visualizer", desc: "Watch files get bundled together!" },
    "Next.js": { title: "Rendering Modes", desc: "SSR vs CSR vs SSG comparison" },
    Cypress: { title: "E2E Test Replay", desc: "Watch an automated browser test!" },
    SASS: { title: "Nesting Visualizer", desc: "See how SASS compiles to CSS" },
  };
  const d = demos[skill] || { title: skill + " Demo", desc: "Interactive demo coming soon!" };

  if (skill === "HTML5") {
    const [tags, setTags] = useState([]);
    const allTags = ["<header>", "<nav>", "<main>", "<article>", "<aside>", "<footer>"];
    return (
      <div>
        <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Build a semantic HTML page by clicking tags in order!</p>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {allTags.map(t => (
            <motion.button key={t} whileHover={{ borderColor: C.accent }} whileTap={{ scale: 0.9 }}
              onClick={() => !tags.includes(t) && setTags([...tags, t])}
              style={{ padding: "6px 12px", background: tags.includes(t) ? C.accentDim : "transparent", border: `1px solid ${tags.includes(t) ? C.accent : C.border}`, borderRadius: 6, color: tags.includes(t) ? C.accent : C.text, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>
              {t}
            </motion.button>
          ))}
        </div>
        <div style={{ background: "#0d1117", borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", minHeight: 100 }}>
          <span style={{ color: C.muted }}>{"<!DOCTYPE html>"}</span><br />
          <span style={{ color: "#ff7b72" }}>{"<body>"}</span><br />
          {tags.map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ marginLeft: 16, color: "#79c0ff" }}>
              {t}...{t.replace("<", "</")}
            </motion.div>
          ))}
          <span style={{ color: "#ff7b72" }}>{"</body>"}</span>
        </div>
        {tags.length === 6 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#22c55e", marginTop: 8, fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace" }}>
            ✅ Perfect semantic structure! Screen readers love this!
          </motion.p>
        )}
        {tags.length > 0 && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTags([])}
            style={{ marginTop: 8, padding: "4px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer", fontSize: "0.7rem" }}>
            Reset
          </motion.button>
        )}
      </div>
    );
  }

  if (skill === "SASS") {
    const [nesting, setNesting] = useState(1);
    const sassCode = nesting === 1
      ? ".nav {\n  color: white;\n}"
      : nesting === 2
        ? ".nav {\n  color: white;\n  &__item {\n    padding: 8px;\n  }\n}"
        : ".nav {\n  color: white;\n  &__item {\n    padding: 8px;\n    &--active {\n      color: cyan;\n    }\n  }\n}";
    const cssCode = nesting === 1
      ? ".nav {\n  color: white;\n}"
      : nesting === 2
        ? ".nav { color: white; }\n.nav__item { padding: 8px; }"
        : ".nav { color: white; }\n.nav__item { padding: 8px; }\n.nav__item--active { color: cyan; }";
    return (
      <div>
        <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>See how SASS nesting compiles to flat CSS!</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[1, 2, 3].map(n => (
            <motion.button key={n} whileTap={{ scale: 0.95 }} onClick={() => setNesting(n)}
              style={{ padding: "6px 14px", background: nesting === n ? C.accentDim : "transparent", border: `1px solid ${nesting === n ? C.accent : C.border}`, borderRadius: 6, color: nesting === n ? C.accent : C.muted, cursor: "pointer", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
              Level {n}
            </motion.button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={{ color: "#ec4899", fontSize: "0.7rem", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>SASS</div>
            <div style={{ background: "#0d1117", borderRadius: 8, padding: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#e6edf3", whiteSpace: "pre-wrap", minHeight: 80 }}>{sassCode}</div>
          </div>
          <div>
            <div style={{ color: "#22c55e", fontSize: "0.7rem", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Compiled CSS</div>
            <div style={{ background: "#0d1117", borderRadius: 8, padding: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#e6edf3", whiteSpace: "pre-wrap", minHeight: 80 }}>{cssCode}</div>
          </div>
        </div>
      </div>
    );
  }

  if (skill === "Cypress") {
    const [step, setStep] = useState(-1);
    const actions = [
      { action: "visit('/login')", visual: "🌐 Opening login page..." },
      { action: "type('user@test.com')", visual: "⌨️ Typing email..." },
      { action: "type('password')", visual: "🔑 Typing password..." },
      { action: "click('Submit')", visual: "🖱️ Clicking submit..." },
      { action: "url().should('/dashboard')", visual: "✅ Redirected to dashboard!" },
    ];
    function replay() {
      setStep(0);
      actions.forEach((_, i) => setTimeout(() => setStep(i), (i + 1) * 800));
    }
    return (
      <div>
        <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Watch a Cypress E2E test execute step by step!</p>
        <div style={{ background: "#0d1117", borderRadius: 10, padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", minHeight: 100 }}>
          {actions.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: i <= step ? 1 : 0.2 }}
              style={{ marginBottom: 6, display: "flex", gap: 8 }}>
              <span style={{ color: i <= step ? "#22c55e" : C.muted }}>{i <= step ? "✓" : "○"}</span>
              <span style={{ color: i === step ? C.accent : i < step ? C.text : C.muted }}>cy.{a.action}</span>
            </motion.div>
          ))}
          {step >= 0 && (
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 8, padding: "6px 10px", background: C.surface, borderRadius: 6, color: step === 4 ? "#22c55e" : C.accent, fontSize: "0.75rem" }}>
              {actions[Math.min(step, actions.length - 1)].visual}
            </motion.div>
          )}
        </div>
        <motion.button whileHover={{ borderColor: C.accent }} whileTap={{ scale: 0.95 }} onClick={replay}
          style={{ marginTop: 10, padding: "8px 20px", background: C.accentDim, border: `1px solid ${C.accent}`, borderRadius: 8, color: C.white, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: 700 }}>
          Run Test 🌲
        </motion.button>
      </div>
    );
  }

  // Next.js & Webpack: use Vite-style comparison
  if (skill === "Next.js") {
    const [mode, setMode] = useState("SSR");
    const modes = {
      SSR: { time: "~200ms", desc: "Server renders HTML → sends complete page → JS hydrates", color: "#22c55e" },
      CSR: { time: "~800ms", desc: "Empty HTML → download JS → render in browser → content appears", color: "#f59e0b" },
      SSG: { time: "~50ms", desc: "Pre-built at build time → served from CDN → instant load", color: "#a855f7" },
    };
    return (
      <div>
        <p style={{ color: C.text, fontSize: "0.8rem", marginBottom: 12 }}>Compare Next.js rendering modes!</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {Object.keys(modes).map(m => (
            <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setMode(m)}
              style={{ flex: 1, padding: "10px", background: mode === m ? modes[m].color : "transparent", border: `1px solid ${mode === m ? modes[m].color : C.border}`, borderRadius: 8, color: mode === m ? "#fff" : C.muted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700 }}>
              {m}
            </motion.button>
          ))}
        </div>
        <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: C.surface, borderRadius: 10, padding: 16, borderLeft: `3px solid ${modes[mode].color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: C.white, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{mode}</span>
            <span style={{ color: modes[mode].color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{modes[mode].time}</span>
          </div>
          <p style={{ color: C.text, fontSize: "0.82rem", lineHeight: 1.6 }}>{modes[mode].desc}</p>
        </motion.div>
      </div>
    );
  }

  if (skill === "Webpack") {
    return <ViteDemo />;
  }

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>{SKILL_ICONS[skill]}</div>
      <p style={{ color: C.text, fontSize: "0.85rem" }}>{d.desc}</p>
    </div>
  );
}

// Skill Demo Router
const SKILL_DEMOS = { React: ReactDemo, JavaScript: JavaScriptDemo, TypeScript: TypeScriptDemo, CSS3: CSSDemo, Tailwind: TailwindDemo, Git: GitDemo, Vite: ViteDemo, Redux: ReduxDemo, "REST APIs": APIDemo, Jest: JestDemo };

function SkillChallengeModal({ skill, onClose }) {
  const Demo = SKILL_DEMOS[skill];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()}
        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: C.muted, fontSize: "1.5rem", cursor: "pointer", lineHeight: 1 }}>&times;</button>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: "1.5rem", marginRight: 8 }}>{SKILL_ICONS[skill]}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.accent, fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>// interactive playground</span>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: C.white, marginTop: 6 }}>{skill}</h3>
        </div>
        {Demo ? <Demo /> : <SimpleDemo skill={skill} />}
      </motion.div>
    </motion.div>
  );
}

// ── End of Skill Demos ──

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

        {/* Playful Marquee — two rows, opposite directions, with icons */}
        <div style={{ overflow: "hidden", marginBottom: 60, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
          <div style={{ display: "flex", gap: 32, animation: "marquee 20s linear infinite", width: "fit-content", marginBottom: 12 }}>
            {[...ALL_SKILLS, ...ALL_SKILLS].map((s, i) => (
              <span key={"a" + i} style={{ whiteSpace: "nowrap", fontSize: "0.9rem", fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "1.1rem" }}>{SKILL_ICONS[s]}</span>{s}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 32, animation: "marquee-reverse 22s linear infinite", width: "fit-content" }}>
            {[...ALL_SKILLS.slice().reverse(), ...ALL_SKILLS.slice().reverse()].map((s, i) => (
              <span key={"b" + i} style={{ whiteSpace: "nowrap", fontSize: "0.9rem", fontWeight: 600, color: C.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "1.1rem" }}>{SKILL_ICONS[s]}</span>{s}
              </span>
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
