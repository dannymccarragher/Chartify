"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { theme } from "@/constants/theme";
import { API } from "../../../lib/api";

const RANGES = [
  { key: "4weeks", label: "4 Weeks" },
  { key: "6months", label: "6 Months" },
  { key: "1year", label: "1 Year" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Avatar({ src, name, size = 72 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: theme.bg.highlight,
        color: theme.text.secondary,
        fontSize: size * 0.36,
      }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function RankBadge({ rank }) {
  return (
    <span
      className="absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none z-10"
      style={{
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        backdropFilter: "blur(4px)",
      }}
    >
      {rank}
    </span>
  );
}

function TrackCard({ title, artist, imageUrl, rank }) {
  return (
    <div
      className="relative flex flex-col gap-2.5 p-3 rounded-2xl transition-all duration-150 hover:scale-[1.03] cursor-default"
      style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
    >
      {rank != null && <RankBadge rank={rank} />}
      <div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full aspect-square rounded-xl object-cover"
          />
        ) : (
          <div
            className="w-full aspect-square rounded-xl flex items-center justify-center text-2xl"
            style={{ background: theme.bg.highlight, color: theme.text.muted }}
          >
            ♪
          </div>
        )}
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-sm font-semibold truncate" style={{ color: theme.text.primary }}>
          {title}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: theme.text.muted }}>
          {artist}
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      className="text-xs uppercase tracking-widest font-semibold mb-3"
      style={{ color: theme.text.muted }}
    >
      {children}
    </h2>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topRange, setTopRange] = useState("1year");
  const [topTracks, setTopTracks] = useState([]);
  const [topTracksLoading, setTopTracksLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`${API}/auth/me`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/stats/user/${userId}`, { credentials: "include" }).then((r) => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([me, profileData]) => {
        setCurrentUser(me);
        setProfile(profileData);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    setTopTracksLoading(true);
    fetch(`${API}/stats/user/top/${topRange}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setTopTracks)
      .catch(() => setTopTracks([]))
      .finally(() => setTopTracksLoading(false));
  }, [topRange]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: theme.text.muted }}>Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: theme.accent.purple }}>Failed to load profile.</p>
      </div>
    );
  }

  const { user } = profile;
  const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

  return (
    <div className="px-6 py-8" style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div className="flex items-center gap-5 mb-10">
        <Avatar src={user.avatar_url} name={user.display_name} size={isOwnProfile ? 72 : 80} />
        <div>
          {isOwnProfile && (
            <p className="text-sm mb-0.5" style={{ color: theme.text.muted }}>
              {getGreeting()}
            </p>
          )}
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.text.primary, letterSpacing: "-0.5px" }}
          >
            {user.display_name}
          </h1>
        </div>
      </div>

      {/* Spotify Top Tracks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Top Tracks</SectionTitle>
          <div className="flex gap-1.5 mb-3">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setTopRange(r.key)}
                className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 hover:scale-[1.05]"
                style={{
                  background: topRange === r.key ? theme.accent.purple : theme.bg.elevated,
                  color: topRange === r.key ? "#fff" : theme.text.muted,
                  border: `1px solid ${topRange === r.key ? theme.accent.purple : theme.border.subtle}`,
                  cursor: "pointer",
                  fontWeight: topRange === r.key ? 600 : 400,
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {topTracksLoading ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}>
            <p style={{ color: theme.text.muted }}>Loading…</p>
          </div>
        ) : topTracks.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}>
            <p style={{ color: theme.text.muted }}>No data for this range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {topTracks.slice(0, 20).map((track, i) => {
              const imgs = track.album?.images ?? [];
              const imageUrl = imgs[0]?.url ?? null;
              return (
                <TrackCard
                  key={track.id}
                  title={track.name}
                  artist={track.artists?.map((a) => a.name).join(", ")}
                  imageUrl={imageUrl}
                  rank={i + 1}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
