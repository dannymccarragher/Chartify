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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

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

function SyncIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
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
      className="flex flex-col gap-1.5 p-5 rounded-2xl flex-1 transition-transform duration-150 hover:scale-[1.02]"
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

function ArtistCard({ artist, rank }) {
  return (
    <div
      className="relative flex flex-col gap-2.5 p-3 rounded-2xl transition-all duration-150 hover:scale-[1.03] cursor-default"
      style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
    >
      <RankBadge rank={rank} />
      <div>
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.artist_name}
            className="w-full aspect-square rounded-full object-cover"
          />
        ) : (
          <div
            className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: theme.bg.highlight, color: theme.text.secondary }}
          >
            {artist.artist_name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-sm font-semibold truncate" style={{ color: theme.text.primary }}>
          {artist.artist_name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: theme.text.muted }}>
          {artist.play_count} plays
        </p>
      </div>
    </div>
  );
}

function TrackCard({ title, artist, imageUrl, sub, rank }) {
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
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: theme.accent.purple }}>
            {sub}
          </p>
        )}
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
  const [topRange, setTopRange] = useState("1week");
  const [topTracks, setTopTracks] = useState([]);
  const [topTracksLoading, setTopTracksLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  async function syncPlays() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`${API}/stats/sync`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncMsg({ type: "ok", text: `Synced ${data.new_plays ?? ""} new plays` });
    } catch (err) {
      setSyncMsg({ type: "error", text: err.message ?? "Sync failed" });
    } finally {
      setSyncing(false);
    }
  }

  async function fetchProfile() {
    const res = await fetch(`${API}/stats/user/${userId}`, { credentials: "include" });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b?.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  }

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`${API}/auth/me`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetchProfile(),
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
  const isOwnProfile = currentUser && String(currentUser.id) === String(userId);
  const isEmpty = !stats || Number(stats.total_songs) === 0;

  return (
    <div className="px-6 py-8" style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb — only show when viewing someone else's profile */}
      {!isOwnProfile && (
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors duration-150"
          style={{ color: theme.text.muted, textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = theme.text.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.muted)}
        >
          ← Leaderboard
        </Link>
      )}

      {/* Hero */}
      <div className={`flex items-center justify-between gap-5 ${isOwnProfile ? "mb-2" : "mb-8"}`}>
        <div className="flex items-center gap-5">
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

        {/* Sync button — only for own profile */}
        {isOwnProfile && (
          <button
            onClick={async () => {
              await syncPlays();
              const data = await fetchProfile().catch(() => null);
              if (data) setProfile(data);
            }}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold flex-shrink-0 transition-all duration-150 hover:scale-[1.03]"
            style={{
              background: syncing ? theme.bg.elevated : theme.accent.green,
              color: syncing ? theme.text.muted : "#000",
              border: `1px solid ${syncing ? theme.border.subtle : "transparent"}`,
              cursor: syncing ? "not-allowed" : "pointer",
            }}
          >
            <SyncIcon />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        )}
      </div>

      {/* Sync feedback */}
      {syncMsg && (
        <div
          className="px-4 py-3 rounded-xl mb-6 text-sm"
          style={{
            background: syncMsg.type === "ok" ? "rgba(30,215,96,0.08)" : "rgba(162,89,255,0.08)",
            border: `1px solid ${syncMsg.type === "ok" ? "rgba(30,215,96,0.2)" : "rgba(162,89,255,0.2)"}`,
            color: syncMsg.type === "ok" ? theme.accent.green : theme.accent.purple,
          }}
        >
          {syncMsg.text}
        </div>
      )}

      {/* Spacer when own profile */}
      {isOwnProfile && <div className="mb-8" />}

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
            className="flex items-center gap-4 p-4 rounded-2xl transition-colors duration-150"
            style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.bg.elevated)}
            onMouseLeave={(e) => (e.currentTarget.style.background = theme.bg.surface)}
          >
            {last_played_song.image_url ? (
              <img
                src={last_played_song.image_url}
                alt={last_played_song.track_name}
                className="rounded-xl object-cover flex-shrink-0"
                style={{ width: 72, height: 72 }}
              />
            ) : (
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ width: 72, height: 72, background: "rgba(162,89,255,0.12)", color: theme.accent.purple }}
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
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {top_artists.map((artist, i) => (
              <ArtistCard key={artist.artist_name} artist={artist} rank={i + 1} />
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

      {/* Top songs */}
      {top_songs?.length > 0 && (
        <section>
          <SectionTitle>Top Songs This Week</SectionTitle>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {top_songs.map((song, i) => (
              <TrackCard
                key={`${song.track_name}-${i}`}
                title={song.track_name}
                artist={song.artist_name}
                imageUrl={song.image_url}
                sub={`${song.play_count} plays`}
                rank={i + 1}
              />
            ))}
          </div>
        </section>
      )}

      {isEmpty && !last_played_song && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: theme.bg.surface, border: `1px solid ${theme.border.subtle}` }}
        >
          <p style={{ color: theme.text.muted }}>Nothing to show yet. Hit sync to load your data.</p>
        </div>
      )}
    </div>
  );
}
