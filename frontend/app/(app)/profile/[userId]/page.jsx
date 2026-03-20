"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { theme } from "@/constants/theme";

const API = "http://127.0.0.1:5000";

const RANGES = [
  { key: "4weeks", label: "4 Weeks" },
  { key: "6months", label: "6 Months" },
  { key: "1year", label: "1 Year" },
];

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now - date) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
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

function StatCard({ label, value, accent = false }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-5 rounded-2xl flex-1"
      style={{
        background: accent ? "rgba(162,89,255,0.08)" : theme.bg.elevated,
        border: `1px solid ${accent ? "rgba(162,89,255,0.2)" : theme.border.subtle}`,
      }}
    >
      <p className="text-xs uppercase tracking-widest" style={{ color: theme.text.muted }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold truncate"
        style={{ color: accent ? theme.accent.purple : theme.text.primary }}
      >
        {value}
      </p>
    </div>
  );
}

function Bar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-1 rounded-full overflow-hidden flex-shrink-0"
      style={{ background: theme.bg.highlight, width: 72 }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: theme.accent.purple,
          transition: "width 0.5s ease",
        }}
      />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topRange, setTopRange] = useState("1week");
  const [topTracks, setTopTracks] = useState([]);
  const [topTracksLoading, setTopTracksLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/stats/user/${userId}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) return r.json().then((b) => Promise.reject(b?.error ?? `HTTP ${r.status}`));
        return r.json();
      })
      .then(setProfile)
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: theme.accent.purple }}>{error}</p>
        <Link href="/leaderboard" style={{ color: theme.text.muted, fontSize: 14, textDecoration: "none" }}>
          ← Back to leaderboard
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  const { user, stats, rank, top_artists, top_songs, last_played_song } = profile;
  const isEmpty = !stats || Number(stats.total_songs) === 0;
  const maxArtist = top_artists?.[0] ? Number(top_artists[0].play_count) : 1;
  const maxSong = top_songs?.[0] ? Number(top_songs[0].play_count) : 1;

  return (
    <div className="px-6 py-8" style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1.5 text-sm mb-8"
        style={{ color: theme.text.muted, textDecoration: "none", transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = theme.text.primary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.muted)}
      >
        ← Leaderboard
      </Link>

      {/* Hero */}
      <div className="flex items-center gap-5 mb-8">
        <Avatar src={user.avatar_url} name={user.display_name} size={80} />
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.text.primary, letterSpacing: "-0.5px" }}
          >
            {user.display_name}
          </h1>
          {rank && (
            <p className="text-sm mt-1" style={{ color: theme.text.muted }}>
              Ranked{" "}
              <span style={{ color: theme.accent.purple, fontWeight: 600 }}>
                #{rank}
              </span>{" "}
              this week
            </p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      {isEmpty ? (
        <div
          className="rounded-2xl p-6 text-center mb-8"
          style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
        >
          <p style={{ color: theme.text.muted }}>No plays recorded this week yet.</p>
        </div>
      ) : (
        <div className="flex gap-3 mb-8">
          <StatCard label="Songs" value={stats.total_songs} />
          <StatCard label="Minutes" value={Math.round(stats.total_minutes)} />
          <StatCard label="Last active" value={timeAgo(stats.last_played)} accent />
        </div>
      )}

      {/* Last played */}
      {last_played_song && (
        <section className="mb-8">
          <SectionTitle>Last Played</SectionTitle>
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
          >
            {last_played_song.image_url ? (
              <img
                src={last_played_song.image_url}
                alt={last_played_song.track_name}
                className="rounded-xl object-cover flex-shrink-0"
                style={{ width: 52, height: 52 }}
              />
            ) : (
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ width: 52, height: 52, background: "rgba(162,89,255,0.12)", color: theme.accent.purple }}
              >
                ♪
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: theme.text.primary }}>
                {last_played_song.track_name}
              </p>
              <p className="text-sm truncate" style={{ color: theme.text.muted }}>
                {last_played_song.artist_name}
              </p>
            </div>
            <span className="text-sm flex-shrink-0" style={{ color: theme.text.muted }}>
              {timeAgo(last_played_song.played_at)}
            </span>
          </div>
        </section>
      )}

      {/* Top artists */}
      {top_artists?.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Top Artists This Week</SectionTitle>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${theme.border.subtle}` }}
          >
            {top_artists.map((artist, i) => (
              <div
                key={artist.artist_name}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  background: theme.bg.surface,
                  borderTop: i > 0 ? `1px solid ${theme.border.subtle}` : "none",
                }}
              >
                <span className="text-sm w-5 text-right flex-shrink-0" style={{ color: theme.text.muted }}>
                  {i + 1}
                </span>
                {artist.image_url ? (
                  <img
                    src={artist.image_url}
                    alt={artist.artist_name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: theme.bg.highlight, color: theme.text.secondary }}
                  >
                    {artist.artist_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <p className="flex-1 text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                  {artist.artist_name}
                </p>
                <Bar value={Number(artist.play_count)} max={maxArtist} />
                <span className="text-xs text-right flex-shrink-0" style={{ color: theme.text.muted, minWidth: 52 }}>
                  {artist.play_count} plays
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Spotify Top Tracks */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Top Tracks</SectionTitle>
          <div className="flex gap-1.5 mb-3">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setTopRange(r.key)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
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
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${theme.border.subtle}` }}>
            {topTracks.slice(0, 50).map((track, i) => {
              const imgs = track.album?.images ?? [];
              const imageUrl = imgs[imgs.length - 1]?.url ?? null;
              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{
                    background: theme.bg.surface,
                    borderTop: i > 0 ? `1px solid ${theme.border.subtle}` : "none",
                  }}
                >
                  <span className="text-sm w-5 text-right flex-shrink-0" style={{ color: theme.text.muted }}>
                    {i + 1}
                  </span>
                  {imageUrl ? (
                    <img src={imageUrl} alt={track.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: theme.bg.highlight, color: theme.text.muted }}
                    >
                      ♪
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                      {track.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: theme.text.muted }}>
                      {track.artists?.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Top songs */}
      {top_songs?.length > 0 && (
        <section>
          <SectionTitle>Top Songs This Week</SectionTitle>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${theme.border.subtle}` }}
          >
            {top_songs.map((song, i) => (
              <div
                key={`${song.track_name}-${i}`}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  background: theme.bg.surface,
                  borderTop: i > 0 ? `1px solid ${theme.border.subtle}` : "none",
                }}
              >
                <span className="text-sm w-5 text-right flex-shrink-0" style={{ color: theme.text.muted }}>
                  {i + 1}
                </span>
                {song.image_url ? (
                  <img
                    src={song.image_url}
                    alt={song.track_name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: theme.bg.highlight, color: theme.text.muted }}
                  >
                    ♪
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                    {song.track_name}
                  </p>
                  <p className="text-xs truncate" style={{ color: theme.text.muted }}>
                    {song.artist_name}
                  </p>
                </div>
                <Bar value={Number(song.play_count)} max={maxSong} />
                <span className="text-xs text-right flex-shrink-0" style={{ color: theme.text.muted, minWidth: 52 }}>
                  {song.play_count} plays
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {isEmpty && !last_played_song && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
        >
          <p style={{ color: theme.text.muted }}>Nothing to show yet.</p>
        </div>
      )}
    </div>
  );
}
