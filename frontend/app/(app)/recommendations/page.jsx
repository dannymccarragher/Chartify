"use client";

import { useState } from "react";
import { theme } from "@/constants/theme";
import { API } from "../../lib/api";

function SparkleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.88 5.47a1 1 0 0 0 .65.65L20 11l-5.47 1.88a1 1 0 0 0-.65.65L12 19l-1.88-5.47a1 1 0 0 0-.65-.65L4 11l5.47-1.88a1 1 0 0 0 .65-.65L12 3z" />
      <path d="M5 3l.88 2.12a.5.5 0 0 0 .32.32L8 6l-1.8.56a.5.5 0 0 0-.32.32L5 9l-.88-2.12a.5.5 0 0 0-.32-.32L2 6l1.8-.56a.5.5 0 0 0 .32-.32L5 3z" />
      <path d="M19 13l.6 1.45a.4.4 0 0 0 .22.22L21 15l-1.18.33a.4.4 0 0 0-.22.22L19 17l-.6-1.45a.4.4 0 0 0-.22-.22L17 15l1.18-.33a.4.4 0 0 0 .22-.22L19 13z" />
    </svg>
  );
}

function MusicNoteIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: theme.text.muted }}>
      {children}
    </h2>
  );
}

function RecommendationCard({ track, artist, reason, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-150"
      style={{
        background: hovered ? theme.bg.elevated : theme.bg.surface,
        border: `1px solid ${hovered ? theme.border.default : theme.border.subtle}`,
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Index + icon */}
      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center relative"
        style={{ background: "rgba(162,89,255,0.1)", color: theme.accent.purple }}
      >
        <MusicNoteIcon size={22} />
        <span
          className="absolute -top-1.5 -left-1.5 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
          style={{ background: theme.accent.purple, color: "#fff" }}
        >
          {index + 1}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: theme.text.primary }}>
          {track}
        </p>
        <p className="text-sm mt-0.5 truncate" style={{ color: theme.text.secondary }}>
          {artist}
        </p>
        {reason && (
          <p className="text-xs mt-2 leading-relaxed" style={{ color: theme.text.muted }}>
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingPulse() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-2xl animate-pulse"
          style={{
            background: theme.bg.surface,
            border: `1px solid ${theme.border.subtle}`,
            opacity: 1 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  async function fetchRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/recommendations`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setRecommendations(data.recommendations);
      setFetched(true);
    } catch (err) {
      setError(err.message ?? "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-8" style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <span style={{ color: theme.accent.purple }}>
            <SparkleIcon size={20} />
          </span>
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.text.primary, letterSpacing: "-0.5px" }}
          >
            AI Recommendations
          </h1>
        </div>
        <p className="text-sm" style={{ color: theme.text.muted }}>
          Powered by AI. Personalized picks based on your listening data this week.
        </p>
      </div>

      {/* CTA / Refresh button */}
      {!loading && (
        <div className="mb-8">
          <button
            onClick={fetchRecommendations}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-150 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #a259ff 0%, #7c3aed 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(162,89,255,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 28px rgba(162,89,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(162,89,255,0.35)";
            }}
          >
            <SparkleIcon size={15} />
            {fetched ? "Refresh Recommendations" : "Get My Recommendations"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl mb-6 text-sm"
          style={{
            background: "rgba(162,89,255,0.08)",
            border: "1px solid rgba(162,89,255,0.2)",
            color: theme.accent.purple,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div>
          <div className="mb-3 h-3 w-40 rounded-full animate-pulse" style={{ background: theme.bg.elevated }} />
          <LoadingPulse />
          <p className="text-xs text-center mt-4" style={{ color: theme.text.muted }}>
            Analysing your taste profile…
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && recommendations && recommendations.length > 0 && (
        <section>
          <SectionTitle>Picked for you this week</SectionTitle>
          <div className="flex flex-col gap-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard
                key={`${rec.track}-${i}`}
                track={rec.track}
                artist={rec.artist}
                reason={rec.reason}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty initial state */}
      {!loading && !fetched && !error && (
        <div
          className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center"
          style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(162,89,255,0.1)", color: theme.accent.purple }}
          >
            <SparkleIcon size={28} />
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: theme.text.primary }}>
              Your personal mixtape awaits
            </p>
            <p className="text-sm" style={{ color: theme.text.muted }}>
              Hit the button above and Gemini will analyse your top artists and audio fingerprint
              from this week to find 8 songs you&apos;ll love.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
