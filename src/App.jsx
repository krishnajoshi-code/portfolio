import { useState, useEffect, useRef } from "react";

const COLORS = {
  black: "#0a0a0a",
  white: "#ffffff",
  text: "#e5e5e5",
  textMuted: "#a0a0a0",
  accentBlue: "#0ea5e9",
  accentCyan: "#06b6d4",
  border: "#1e1e1e",
  cardBg: "#111111",
};

const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 64 };
const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 50 };

// ═══════════════════════════════════════════════════════════
// ANIMATED GRADIENT MESH BACKGROUND
// ═══════════════════════════════════════════════════════════
function GradientMeshHero() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        background: COLORS.black,
      }}
    >
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          filter: "blur(40px)",
          opacity: 0.4,
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>
        <circle
          cx="30"
          cy="20"
          r="35"
          fill="url(#grad1)"
          style={{ animation: "meshFloat1 15s ease-in-out infinite" }}
        />
        <circle
          cx="80"
          cy="70"
          r="40"
          fill="url(#grad2)"
          style={{ animation: "meshFloat2 18s ease-in-out infinite" }}
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="#06b6d4"
          style={{
            opacity: 0.3,
            animation: "meshFloat3 20s ease-in-out infinite",
          }}
        />
      </svg>
      <style>{`
        @keyframes meshFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
        @keyframes meshFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(0.95); }
        }
        @keyframes meshFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 15px); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHIMMER TEXT EFFECT
// ═══════════════════════════════════════════════════════════
function ShimmerText({ children }) {
  return (
    <span
      style={{
        background: `linear-gradient(90deg,
          ${COLORS.white} 0%,
          ${COLORS.accentCyan} 50%,
          ${COLORS.white} 100%)`,
        backgroundSize: "200% auto",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shimmer 3s linear infinite",
      }}
    >
      {children}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// SCROLL REVEAL WITH STAGGER
// ═══════════════════════════════════════════════════════════
function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = ["About", "Skills", "Projects", "Experience", "Contact"];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? "14px 32px" : "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: scrolled
          ? "rgba(10, 10, 10, 0.8)"
          : "rgba(10, 10, 10, 0.5)",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.border}` : "none",
        transition: "all 0.3s ease",
      }}
    >
      <a
        href="#hero"
        style={{
          fontSize: "1.4rem",
          fontWeight: 800,
          background: `linear-gradient(135deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textDecoration: "none",
          letterSpacing: "-1px",
          cursor: "pointer",
        }}
      >
        KJ
      </a>

      <div
        className="nav-links"
        style={{
          display: "flex",
          gap: 32,
          alignItems: "center",
        }}
      >
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            style={{
              textDecoration: "none",
              color: COLORS.textMuted,
              fontSize: "0.95rem",
              fontWeight: 500,
              transition: "color 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = COLORS.accentBlue)}
            onMouseLeave={(e) => (e.target.style.color = COLORS.textMuted)}
          >
            {link}
          </a>
        ))}
      </div>

      <button
        className="nav-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: COLORS.white,
          fontSize: "1.5rem",
          cursor: "pointer",
          padding: "8px 0",
        }}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(10, 10, 10, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              style={{
                color: COLORS.textMuted,
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {link}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════
function Hero() {
  const [typed, setTyped] = useState("");
  const roles = [
    "Front-End Developer",
    "React Specialist",
    "UI Engineer",
    "Web Craftsman",
  ];
  const roleIdx = useRef(0);
  const charIdx = useRef(0);
  const isDeleting = useRef(false);

  useEffect(() => {
    const type = () => {
      const current = roles[roleIdx.current];
      if (!isDeleting.current) {
        charIdx.current++;
        setTyped(current.slice(0, charIdx.current));
        if (charIdx.current === current.length) {
          isDeleting.current = true;
          return setTimeout(type, 2000);
        }
      } else {
        charIdx.current--;
        setTyped(current.slice(0, charIdx.current));
        if (charIdx.current === 0) {
          isDeleting.current = false;
          roleIdx.current = (roleIdx.current + 1) % roles.length;
        }
      }
      setTimeout(type, isDeleting.current ? 50 : 80);
    };
    const timer = setTimeout(type, 800);
    return () => clearTimeout(timer);
  }, []);

  const socialLinks = [
    {
      icon: "GitHub",
      url: "https://github.com/krishnajoshi",
      label: "GitHub",
    },
    {
      icon: "LinkedIn",
      url: "https://linkedin.com/in/krishnajoshi-dev",
      label: "LinkedIn",
    },
    {
      icon: "Email",
      url: "mailto:krishna.h.joshi@hotmail.com",
      label: "Email",
    },
  ];

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "80px 24px 60px",
      }}
    >
      <GradientMeshHero />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <div
          style={{
            animation: "fadeInUp 0.8s ease 0.2s both",
          }}
        >
          <p
            style={{
              color: COLORS.accentBlue,
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "24px",
              opacity: 0.9,
            }}
          >
            Welcome to my portfolio
          </p>
        </div>

        <div
          style={{
            animation: "fadeInUp 0.8s ease 0.4s both",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.8rem, 8vw, 5rem)",
              fontWeight: 900,
              color: COLORS.white,
              margin: "0 0 12px 0",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            <ShimmerText>Krishna Joshi</ShimmerText>
          </h1>
        </div>

        <div
          style={{
            fontSize: "clamp(1.3rem, 4vw, 2rem)",
            fontWeight: 600,
            minHeight: "60px",
            marginBottom: "32px",
            animation: "fadeInUp 0.8s ease 0.6s both",
          }}
        >
          <span style={{ color: COLORS.accentCyan }}>{typed}</span>
          <span
            style={{
              color: COLORS.accentBlue,
              animation: "blink 1s step-end infinite",
              marginLeft: "4px",
            }}
          >
            |
          </span>
        </div>

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 48px",
            animation: "fadeInUp 0.8s ease 0.8s both",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: COLORS.textMuted,
              margin: 0,
            }}
          >
            5+ years crafting responsive, high-performance web experiences with
            React, JavaScript & modern CSS. Recently relocated to London.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "fadeInUp 0.8s ease 1s both",
            marginBottom: "48px",
          }}
        >
          <a
            href="#projects"
            style={{
              background: `linear-gradient(135deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
              color: COLORS.white,
              padding: "16px 40px",
              borderRadius: RADIUS.full,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              boxShadow: `0 8px 24px rgba(14, 165, 233, 0.3)`,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = `0 12px 32px rgba(14, 165, 233, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = `0 8px 24px rgba(14, 165, 233, 0.3)`;
            }}
          >
            View My Work
          </a>
          <a
            href="#contact"
            style={{
              border: `2px solid ${COLORS.accentBlue}`,
              color: COLORS.accentBlue,
              padding: "14px 40px",
              borderRadius: RADIUS.full,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1rem",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `rgba(14, 165, 233, 0.1)`;
              e.target.style.color = COLORS.accentCyan;
              e.target.style.borderColor = COLORS.accentCyan;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = COLORS.accentBlue;
              e.target.style.borderColor = COLORS.accentBlue;
            }}
          >
            Get in Touch
          </a>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            animation: "fadeInUp 0.8s ease 1.2s both",
          }}
        >
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: `2px solid ${COLORS.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.textMuted,
                textDecoration: "none",
                transition: "all 0.3s ease",
                fontSize: "1.2rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.accentBlue;
                e.currentTarget.style.color = COLORS.accentBlue;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(14, 165, 233, 0.25)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.color = COLORS.textMuted;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {link.icon === "GitHub" && "⚙"}
              {link.icon === "LinkedIn" && "in"}
              {link.icon === "Email" && "✉"}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════════════════════════
function About() {
  return (
    <section
      id="about"
      style={{
        padding: `${SPACING.xxl}px ${SPACING.lg}px`,
        position: "relative",
        background: COLORS.black,
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <ScrollReveal>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: COLORS.white,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            About Me
          </h2>
          <div
            style={{
              width: "80px",
              height: "4px",
              background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
              margin: "16px auto 48px",
              borderRadius: "2px",
            }}
          />
        </ScrollReveal>

        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <ScrollReveal delay={100}>
            <div
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.lg,
                padding: `${SPACING.xl}px`,
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.85,
                  color: COLORS.text,
                  marginBottom: "24px",
                }}
              >
                I'm a <span style={{ color: COLORS.accentBlue, fontWeight: 700 }}>
                  Front-End Developer
                </span>{" "}
                based in <span style={{ color: COLORS.accentCyan, fontWeight: 700 }}>
                  London
                </span>{" "}
                with a passion for building web experiences that look great and
                perform even better. Over 5+ years, I've worked across
                hospitality, wellness, HR, and e-commerce, turning Figma designs
                into pixel-perfect, responsive realities.
              </p>

              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.85,
                  color: COLORS.text,
                  marginBottom: "28px",
                }}
              >
                At <span style={{ color: COLORS.accentBlue, fontWeight: 700 }}>
                  RHAD
                </span>
                , I grew from an apprentice to leading front-end development
                across 10+ production projects. I enjoy mentoring other
                developers, optimising performance, and finding creative
                solutions to tricky UI challenges. Currently seeking junior
                front-end / React roles following my recent relocation to the
                UK.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {["London, UK", "5+ Years", "MCA Graduate", "Full Work Rights"].map(
                  (tag, i) => (
                    <span
                      key={tag}
                      style={{
                        padding: "10px 18px",
                        borderRadius: RADIUS.full,
                        background: `rgba(14, 165, 233, 0.1)`,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.accentBlue,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// MARQUEE SKILL ICONS
// ═══════════════════════════════════════════════════════════
function SkillsMarquee() {
  const skills = [
    "React",
    "JavaScript",
    "TypeScript",
    "HTML5",
    "CSS3",
    "Tailwind",
    "Git",
    "Webpack",
    "Vite",
    "Testing",
  ];

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: `rgba(14, 165, 233, 0.05)`,
        padding: `${SPACING.xl}px 0`,
        marginBottom: `${SPACING.xxl}px`,
        borderRadius: RADIUS.lg,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 32,
          animation: "marquee 20s linear infinite",
          width: "fit-content",
        }}
      >
        {[...skills, ...skills].map((skill, i) => (
          <div
            key={i}
            style={{
              whiteSpace: "nowrap",
              fontSize: "1rem",
              fontWeight: 600,
              color: COLORS.accentBlue,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: COLORS.accentCyan }}>◆</span>
            {skill}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ANIMATED SKILL BARS
// ═══════════════════════════════════════════════════════════
function SkillBar({ name, percentage }) {
  const [filled, setFilled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: SPACING.lg }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <span style={{ color: COLORS.text, fontWeight: 600 }}>{name}</span>
        <span style={{ color: COLORS.accentBlue, fontWeight: 700 }}>
          {percentage}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: COLORS.border,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
            width: filled ? `${percentage}%` : "0%",
            transition: "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SKILLS SECTION
// ═══════════════════════════════════════════════════════════
const SKILLS_DATA = [
  { category: "Front-End", skills: ["React", "JavaScript", "TypeScript"] },
  { category: "Styling", skills: ["CSS3", "Tailwind CSS", "SASS/SCSS"] },
  { category: "Tools", skills: ["Git", "Webpack", "Vite"] },
  { category: "Testing", skills: ["Jest", "React Testing Library", "Cypress"] },
];

function Skills() {
  return (
    <section
      id="skills"
      style={{
        padding: `${SPACING.xxl}px ${SPACING.lg}px`,
        background: COLORS.black,
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <ScrollReveal>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: COLORS.white,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Technical Skills
          </h2>
          <div
            style={{
              width: "80px",
              height: "4px",
              background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
              margin: "16px auto 48px",
              borderRadius: "2px",
            }}
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <SkillsMarquee />
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: SPACING.xl,
          }}
        >
          {SKILLS_DATA.map((skillGroup, i) => (
            <ScrollReveal key={skillGroup.category} delay={i * 100}>
              <div
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.xl,
                  backdropFilter: "blur(10px)",
                }}
              >
                <h3
                  style={{
                    color: COLORS.accentBlue,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    marginBottom: SPACING.lg,
                  }}
                >
                  {skillGroup.category}
                </h3>
                {skillGroup.skills.map((skill, j) => (
                  <SkillBar
                    key={skill}
                    name={skill}
                    percentage={90 - j * 3}
                  />
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// ANIMATED BORDER BEAM
// ═══════════════════════════════════════════════════════════
function BorderBeam({ delay = 0 }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: RADIUS.lg,
        padding: "1px",
        background: `conic-gradient(
          from ${delay}deg,
          rgba(14, 165, 233, 0) 0deg,
          rgba(14, 165, 233, 0.8) 90deg,
          rgba(14, 165, 233, 0) 180deg
        )`,
        opacity: 0.6,
        animation: `borderBeam 3s linear infinite`,
        animationDelay: `${delay}ms`,
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes borderBeam {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROJECT CARDS
// ═══════════════════════════════════════════════════════════
const PROJECTS = [
  {
    name: "Ashley Hotel Group",
    url: "https://ashleyhotelgroup.com",
    desc: "Multi-property hotel website with booking integration, responsive layouts, and brand consistency across the group.",
    tags: ["Responsive", "Custom Layouts", "SEO"],
    gradient:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.1))",
  },
  {
    name: "Singapore Cruise",
    url: "https://singaporecruise.com.sg",
    desc: "Cruise booking and information platform with custom layouts, forms, and mobile-first responsive design.",
    tags: ["Mobile-First", "Forms", "JavaScript"],
    gradient:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(6, 182, 212, 0.15))",
  },
  {
    name: "CentralHR Australia",
    url: "https://centralhr.com.au",
    desc: "HR services company website with clean professional layout, service showcases, and contact integrations.",
    tags: ["Professional", "HR", "Responsive"],
    gradient:
      "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.1))",
  },
  {
    name: "M2 Wellness",
    url: "https://www.m2wellness.sg",
    desc: "Wellness and health platform with serene design aesthetics, service pages, and appointment-oriented UX.",
    tags: ["UX Design", "Wellness", "Animations"],
    gradient:
      "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.15))",
  },
  {
    name: "Gallant",
    url: "https://gallant.sg",
    desc: "Corporate website with bold design, modern animations, and seamless content management.",
    tags: ["Corporate", "Animations", "JavaScript"],
    gradient:
      "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.2))",
  },
];

function Projects() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section
      id="projects"
      style={{
        padding: `${SPACING.xxl}px ${SPACING.lg}px`,
        background: COLORS.black,
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <ScrollReveal>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: COLORS.white,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Projects
          </h2>
          <div
            style={{
              width: "80px",
              height: "4px",
              background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
              margin: "16px auto 48px",
              borderRadius: "2px",
            }}
          />
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 28,
          }}
        >
          {PROJECTS.map((project, i) => (
            <ScrollReveal key={project.name} delay={i * 80}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  style={{
                    position: "relative",
                    borderRadius: RADIUS.lg,
                    overflow: "hidden",
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.border}`,
                    transition: "all 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
                    transform:
                      hoveredIdx === i ? "translateY(-8px)" : "translateY(0)",
                    boxShadow:
                      hoveredIdx === i
                        ? `0 20px 40px rgba(14, 165, 233, 0.2)`
                        : `none`,
                  }}
                >
                  {hoveredIdx === i && <BorderBeam />}

                  <div
                    style={{
                      height: "160px",
                      background: project.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: COLORS.white,
                        textAlign: "center",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      {project.name}
                    </h3>
                  </div>

                  <div style={{ padding: SPACING.xl, position: "relative", zIndex: 2 }}>
                    <p
                      style={{
                        color: COLORS.textMuted,
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        marginBottom: SPACING.lg,
                      }}
                    >
                      {project.desc}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: SPACING.lg,
                      }}
                    >
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: `rgba(14, 165, 233, 0.1)`,
                            border: `1px solid ${COLORS.border}`,
                            color: COLORS.accentBlue,
                            padding: "6px 12px",
                            borderRadius: RADIUS.sm,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        color: COLORS.accentCyan,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "gap 0.3s ease",
                      }}
                    >
                      Visit Site{" "}
                      <span
                        style={{
                          transition: "transform 0.3s ease",
                          transform:
                            hoveredIdx === i ? "translateX(4px)" : "translateX(0)",
                        }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// EXPERIENCE TIMELINE
// ═══════════════════════════════════════════════════════════
const EXPERIENCE = [
  {
    role: "Freelance Front-End Developer",
    company: "Self-Employed",
    location: "London, UK",
    period: "Mar 2025 – Present",
    type: "Remote",
    color: COLORS.accentBlue,
    highlights: [
      "Building React web apps for startups focused on performance and SEO",
      "Responsive landing pages, e-commerce interfaces, and dashboards using Tailwind CSS",
      "Performance audits and Core Web Vitals optimisation for client websites",
    ],
  },
  {
    role: "Mid Front-End Developer",
    company: "RHAD",
    location: "Ahmedabad, India",
    period: "Nov 2021 – Feb 2025",
    type: "On-site",
    color: COLORS.accentCyan,
    highlights: [
      "Led front-end for 10+ production websites and web apps",
      "Built reusable component libraries, reducing dev time by ~30%",
      "Mentored junior developers on React best practices and clean code",
    ],
  },
  {
    role: "Junior Front-End Developer",
    company: "RHAD",
    location: "Ahmedabad, India",
    period: "Apr 2020 – Oct 2021",
    type: "On-site",
    color: COLORS.accentBlue,
    highlights: [
      "Built responsive cross-browser interfaces across multiple sectors",
      "Translated Figma mockups into pixel-perfect HTML/CSS/JS",
      "jQuery-to-React migrations and performance tuning",
    ],
  },
  {
    role: "Apprentice Front-End Developer",
    company: "RHAD",
    location: "Ahmedabad, India",
    period: "Dec 2019 – Mar 2020",
    type: "On-site",
    color: COLORS.accentCyan,
    highlights: ["Foundation in front-end principles and team collaboration"],
  },
];

function Experience() {
  return (
    <section
      id="experience"
      style={{
        padding: `${SPACING.xxl}px ${SPACING.lg}px`,
        background: COLORS.black,
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <ScrollReveal>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: COLORS.white,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Experience
          </h2>
          <div
            style={{
              width: "80px",
              height: "4px",
              background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
              margin: "16px auto 48px",
              borderRadius: "2px",
            }}
          />
        </ScrollReveal>

        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "28px",
              top: "0",
              bottom: "0",
              width: "2px",
              background: `linear-gradient(180deg, ${COLORS.accentBlue} 0%, ${COLORS.accentCyan} 50%, ${COLORS.accentBlue} 100%)`,
              borderRadius: "1px",
            }}
          />

          {EXPERIENCE.map((exp, i) => (
            <ScrollReveal key={exp.role} delay={i * 100}>
              <div
                style={{
                  display: "flex",
                  gap: SPACING.xl,
                  marginBottom: SPACING.xxl,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    minWidth: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: COLORS.black,
                    border: `3px solid ${exp.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    boxShadow: `0 0 24px ${exp.color}40`,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: exp.color,
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.xl,
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(8px)";
                    e.currentTarget.style.borderColor = exp.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: SPACING.md,
                      flexWrap: "wrap",
                      gap: SPACING.md,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          color: COLORS.white,
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          margin: "0 0 8px 0",
                        }}
                      >
                        {exp.role}
                      </h3>
                      <p
                        style={{
                          color: exp.color,
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {exp.company} • {exp.location}
                      </p>
                    </div>
                    <span
                      style={{
                        background: `${exp.color}20`,
                        color: exp.color,
                        padding: "6px 14px",
                        borderRadius: RADIUS.sm,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {exp.type}
                    </span>
                  </div>

                  <p
                    style={{
                      color: COLORS.textMuted,
                      fontSize: "0.9rem",
                      marginBottom: SPACING.lg,
                    }}
                  >
                    {exp.period}
                  </p>

                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 0,
                      listStyle: "none",
                    }}
                  >
                    {exp.highlights.map((highlight, j) => (
                      <li
                        key={j}
                        style={{
                          color: COLORS.text,
                          fontSize: "0.95rem",
                          lineHeight: 1.7,
                          marginBottom: "8px",
                          paddingLeft: "24px",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            color: exp.color,
                            fontWeight: 700,
                          }}
                        >
                          ▸
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// CONTACT SECTION
// ═══════════════════════════════════════════════════════════
function Contact() {
  return (
    <section
      id="contact"
      style={{
        padding: `${SPACING.xxl}px ${SPACING.lg}px`,
        background: COLORS.black,
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <ScrollReveal>
          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: COLORS.white,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Let's Connect
          </h2>
          <div
            style={{
              width: "80px",
              height: "4px",
              background: `linear-gradient(90deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
              margin: "16px auto 48px",
              borderRadius: "2px",
            }}
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: COLORS.textMuted,
              textAlign: "center",
              marginBottom: SPACING.xxl,
            }}
          >
            I'm currently looking for front-end / React developer roles and open
            to freelance projects. Whether you have a role, a project, or just
            want to connect, I'd love to hear from you.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div
            style={{
              display: "flex",
              gap: SPACING.lg,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: SPACING.xxl,
            }}
          >
            <a
              href="mailto:krishna.h.joshi@hotmail.com"
              style={{
                background: `linear-gradient(135deg, ${COLORS.accentBlue}, ${COLORS.accentCyan})`,
                color: COLORS.white,
                padding: "16px 48px",
                borderRadius: RADIUS.full,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                transition: "all 0.3s ease",
                boxShadow: `0 8px 24px rgba(14, 165, 233, 0.3)`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = `0 12px 32px rgba(14, 165, 233, 0.5)`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 8px 24px rgba(14, 165, 233, 0.3)`;
              }}
            >
              Send Me an Email
            </a>
            <a
              href="https://linkedin.com/in/krishnajoshi-dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: `2px solid ${COLORS.accentBlue}`,
                color: COLORS.accentBlue,
                padding: "14px 48px",
                borderRadius: RADIUS.full,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `rgba(14, 165, 233, 0.1)`;
                e.target.style.color = COLORS.accentCyan;
                e.target.style.borderColor = COLORS.accentCyan;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = COLORS.accentBlue;
                e.target.style.borderColor = COLORS.accentBlue;
              }}
            >
              Connect on LinkedIn
            </a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: SPACING.lg,
              marginBottom: SPACING.xxl,
              paddingBottom: SPACING.xl,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            {[
              { icon: "📧", label: "Email", value: "krishna.h.joshi@hotmail.com" },
              { icon: "📱", label: "Phone", value: "+44 7557 792153" },
              { icon: "📍", label: "Location", value: "London, UK" },
            ].map((contact) => (
              <div
                key={contact.label}
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: SPACING.md,
                  }}
                >
                  {contact.icon}
                </div>
                <p
                  style={{
                    color: COLORS.textMuted,
                    fontSize: "0.9rem",
                    marginBottom: "4px",
                    margin: 0,
                  }}
                >
                  {contact.label}
                </p>
                <p
                  style={{
                    color: COLORS.text,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {contact.value}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div
            style={{
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: COLORS.textMuted,
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              Designed & Built by{" "}
              <span style={{ color: COLORS.accentBlue, fontWeight: 700 }}>
                Krishna Joshi
              </span>{" "}
              — © 2026
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: COLORS.black,
        color: COLORS.text,
        overflowX: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      <Nav />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Contact />
    </div>
  );
}
