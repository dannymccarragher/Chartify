"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/constants/theme";

const API = "http://127.0.0.1:5000";

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const features = [
  {
    icon: "📊",
    title: "Weekly Stats",
    desc: "Songs played, minutes listened, and your top artists — refreshed every week.",
  },
  {
    icon: "🏆",
    title: "Leaderboard",
    desc: "Compete with friends. See who's been listening the most this week.",
  },
  {
    icon: "🎸",
    title: "Concert Discovery",
    desc: "Follow artists and find upcoming shows near you, powered by Ticketmaster.",
  },
];

export default function LandingPage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user) router.replace("/dashboard");
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.bg.base }}
      >
        <div style={{ color: theme.text.muted, fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.bg.base }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            height: "70vh",
            background:
              "radial-gradient(ellipse at center, rgba(162,89,255,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "10%",
            width: "50vw",
            height: "50vh",
            background:
              "radial-gradient(ellipse at center, rgba(30,215,96,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Top nav */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-5"
      >
        <span
          className="text-xl font-bold"
          style={{ color: theme.text.primary, letterSpacing: "-0.5px" }}
        >
          Chartify
        </span>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div
          className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(30,215,96,0.1)",
            border: "1px solid rgba(30,215,96,0.2)",
            color: theme.accent.green,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: theme.accent.green,
              display: "inline-block",
            }}
          />
          Powered by Spotify
        </div>

        <h1
          className="text-5xl sm:text-7xl font-bold mb-6"
          style={{
            color: theme.text.primary,
            letterSpacing: "-2px",
            lineHeight: 1.05,
          }}
        >
          Your music.
          <br />
          <span style={{ color: theme.accent.green }}>Your stats.</span>
        </h1>

        <p
          className="text-lg sm:text-xl mb-10"
          style={{ color: theme.text.secondary, maxWidth: 480 }}
        >
          Track your weekly listening, compete on the leaderboard, and discover
          concerts for the artists you love.
        </p>

        <a href={`${API}/auth/login`} style={{ textDecoration: "none" }}>
          <button
            className="flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold"
            style={{
              background: theme.accent.green,
              color: "#000",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 40px rgba(30,215,96,0.2)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 0 60px rgba(30,215,96,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 40px rgba(30,215,96,0.2)";
            }}
          >
            <SpotifyIcon />
            Continue with Spotify
          </button>
        </a>
      </main>

      {/* Feature cards */}
      <section className="relative z-10 px-6 pb-20">
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl"
              style={{
                background: theme.bg.surface,
                border: `1px solid ${theme.border.subtle}`,
              }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3
                className="font-semibold mb-1.5"
                style={{ color: theme.text.primary }}
              >
                {f.title}
              </h3>
              <p className="text-sm" style={{ color: theme.text.muted }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
