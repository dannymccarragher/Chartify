"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { theme } from "@/constants/theme";

const API = "http://127.0.0.1:5000";


export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/auth/me`, { credentials: "include" }),
      fetch(`${API}/stats/leaderboard`, { credentials: "include" }),
    ])
      .then(async ([meRes, lbRes]) => {
        const me = meRes.ok ? await meRes.json() : null;
        const lb = lbRes.ok ? await lbRes.json() : [];
        setUserId(me?.id ?? null);
        setLeaderboard(Array.isArray(lb) ? lb : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? leaderboard.filter((u) =>
        u.display_name?.toLowerCase().includes(search.toLowerCase())
      )
    : leaderboard;

  const maxMinutes = leaderboard[0] ? Number(leaderboard[0].total_minutes ?? 0) : 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: theme.text.muted }}>Loading leaderboard…</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8" style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: theme.text.primary, letterSpacing: "-0.5px" }}
        >
          Leaderboard
        </h1>
        <p className="text-sm" style={{ color: theme.text.muted }}>
          Ranked by minutes listened this week · friends only ·{" "}
          <span style={{ color: theme.text.secondary }}>
            {leaderboard.length} {leaderboard.length === 1 ? "listener" : "listeners"}
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: theme.bg.elevated,
            border: `1px solid ${theme.border.subtle}`,
            color: theme.text.primary,
          }}
        />
      </div>

      {/* Full list */}
      {filtered.length === 0 ? (
        <p className="text-center py-12" style={{ color: theme.text.muted }}>
          {search ? "No friends found matching your search." : "Add friends to see them on the leaderboard."}
        </p>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${theme.border.subtle}` }}
        >
          {filtered.map((user, i) => {
            const origIdx = leaderboard.findIndex((u) => u.id === user.id);
            const isYou = user.id === userId;
            const pct =
              maxMinutes > 0
                ? Math.round((Number(user.total_minutes ?? 0) / maxMinutes) * 100)
                : 0;

            return (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  background: isYou ? "rgba(162,89,255,0.06)" : theme.bg.surface,
                  borderTop: i > 0 ? `1px solid ${theme.border.subtle}` : "none",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isYou
                    ? "rgba(162,89,255,0.12)"
                    : theme.bg.elevated)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = isYou
                    ? "rgba(162,89,255,0.06)"
                    : theme.bg.surface)
                }
              >
                {/* Rank */}
                <span
                  className="w-7 text-center text-sm font-semibold flex-shrink-0"
                  style={{ color: theme.text.muted }}
                >
                  {origIdx + 1}
                </span>

                {/* Avatar */}
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: theme.bg.highlight, color: theme.text.secondary }}
                  >
                    {user.display_name?.[0]?.toUpperCase()}
                  </div>
                )}

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: theme.text.primary }}
                  >
                    {user.display_name}
                    {isYou && (
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(162,89,255,0.2)",
                          color: theme.accent.purple,
                        }}
                      >
                        you
                      </span>
                    )}
                  </p>
                  {user.top_artist && (
                    <p className="text-sm truncate" style={{ color: theme.text.muted }}>
                      {user.top_artist}
                    </p>
                  )}
                  <div
                    className="mt-1.5 h-0.5 rounded-full overflow-hidden"
                    style={{ background: theme.bg.highlight, maxWidth: 140 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: isYou ? theme.accent.purple : theme.accent.green,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold" style={{ color: theme.text.primary }}>
                    {Math.round(user.total_minutes ?? 0)} min
                  </p>
                  <p className="text-sm" style={{ color: theme.text.muted }}>
                    {user.total_songs} songs
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
