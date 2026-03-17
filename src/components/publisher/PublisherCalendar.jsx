import React, { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, addWeeks, subWeeks, startOfWeek as startOfWeekFn, endOfWeek as endOfWeekFn,
  parseISO, isSameWeek,
} from "date-fns";
import { PLATFORM_CONFIG, POST_STATUS_CONFIG } from "./publisherConfig";

const VIEW_MONTH = "month";
const VIEW_WEEK  = "week";

const PLATFORM_DOTS = {
  linkedin:  "#7b9fd4",
  instagram: "#c9a87c",
  threads:   "rgba(232,220,200,0.55)",
};

export default function PublisherCalendar({ posts, channels, onEditPost, onNewPost }) {
  const [view, setView]       = useState(VIEW_MONTH);
  const [cursor, setCursor]   = useState(new Date());
  const [selected, setSelected] = useState(null); // selected day

  // Map post -> platforms
  const postWithPlatforms = useMemo(() =>
    posts.map(post => ({
      ...post,
      platforms: [...new Set(
        (post.channel_ids || [])
          .map(id => channels.find(c => c.id === id)?.platform)
          .filter(Boolean)
      )],
    })),
    [posts, channels]
  );

  // Group posts by date string "yyyy-MM-dd"
  const postsByDay = useMemo(() => {
    const map = {};
    postWithPlatforms.forEach(post => {
      const dateKey = post.scheduled_at
        ? format(parseISO(post.scheduled_at), "yyyy-MM-dd")
        : null;
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(post);
    });
    return map;
  }, [postWithPlatforms]);

  // Days to render
  const days = useMemo(() => {
    if (view === VIEW_MONTH) {
      const monthStart = startOfMonth(cursor);
      const monthEnd   = endOfMonth(cursor);
      return eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
        end:   endOfWeek(monthEnd,     { weekStartsOn: 0 }),
      });
    } else {
      return eachDayOfInterval({
        start: startOfWeekFn(cursor, { weekStartsOn: 0 }),
        end:   endOfWeekFn(cursor,   { weekStartsOn: 0 }),
      });
    }
  }, [cursor, view]);

  const navigate = useCallback((dir) => {
    if (view === VIEW_MONTH) {
      setCursor(prev => dir === "prev" ? subMonths(prev, 1) : addMonths(prev, 1));
    } else {
      setCursor(prev => dir === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1));
    }
    setSelected(null);
  }, [view]);

  const headerLabel = view === VIEW_MONTH
    ? format(cursor, "MMMM yyyy")
    : `${format(startOfWeekFn(cursor, { weekStartsOn: 0 }), "MMM d")} – ${format(endOfWeekFn(cursor, { weekStartsOn: 0 }), "MMM d, yyyy")}`;

  const selectedDayKey   = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedDayPosts = selectedDayKey ? (postsByDay[selectedDayKey] || []) : [];

  const draftsWithoutDate = postWithPlatforms.filter(p => !p.scheduled_at && p.status === "draft");

  return (
    <div className="flex flex-col lg:flex-row gap-4">

      {/* Calendar panel */}
      <div
        className="flex-1 rounded-2xl border overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("prev")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "rgba(232,220,200,0.5)" }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-sm min-w-[160px] text-center" style={{ color: "rgba(232,220,200,0.85)" }}>
              {headerLabel}
            </span>
            <button
              onClick={() => navigate("next")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: "rgba(232,220,200,0.5)" }}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {[VIEW_MONTH, VIEW_WEEK].map(v => (
              <button
                key={v}
                onClick={() => { setView(v); setSelected(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{
                  background: view === v ? "rgba(201,168,124,0.18)" : "transparent",
                  color: view === v ? "#c9a87c" : "rgba(232,220,200,0.35)",
                  border: view === v ? "1px solid rgba(201,168,124,0.3)" : "1px solid transparent",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="py-2 text-center" style={{ color: "rgba(201,168,124,0.5)" }}>
              <span className="text-[10px] font-bold tracking-wider uppercase">{d}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-7 ${view === VIEW_MONTH ? "auto-rows-fr" : ""}`}>
          {days.map((day, idx) => {
            const key      = format(day, "yyyy-MM-dd");
            const dayPosts = postsByDay[key] || [];
            const inMonth  = isSameMonth(day, cursor);
            const isSelected = selected && isSameDay(day, selected);
            const isTodayDay = isToday(day);
            const maxDots  = 4;

            return (
              <button
                key={key}
                onClick={() => setSelected(isSameDay(day, selected) ? null : day)}
                className="relative text-left border-b border-r transition-colors group min-h-[72px]"
                style={{
                  borderColor: "rgba(255,255,255,0.04)",
                  background: isSelected
                    ? "rgba(201,168,124,0.08)"
                    : isTodayDay
                    ? "rgba(123,159,212,0.06)"
                    : "transparent",
                }}
                aria-label={`${format(day, "MMMM d")}${dayPosts.length ? `, ${dayPosts.length} posts` : ""}`}
              >
                <div className="p-2">
                  {/* Date number */}
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold leading-none"
                    style={{
                      background: isTodayDay ? "#c9a87c" : isSelected ? "rgba(201,168,124,0.2)" : "transparent",
                      color: isTodayDay
                        ? "#0b1120"
                        : inMonth
                        ? "rgba(232,220,200,0.75)"
                        : "rgba(232,220,200,0.2)",
                    }}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Post dots / pills */}
                  {dayPosts.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayPosts.slice(0, maxDots).map((post, i) => {
                        const platform = post.platforms?.[0];
                        const dotColor = PLATFORM_DOTS[platform] || "rgba(232,220,200,0.4)";
                        const statusCfg = POST_STATUS_CONFIG[post.status] || POST_STATUS_CONFIG.draft;
                        return (
                          <div
                            key={post.id}
                            className="flex items-center gap-1 rounded px-1 py-0.5"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                            <span
                              className="text-[9px] leading-tight truncate hidden sm:block"
                              style={{ color: "rgba(232,220,200,0.5)", maxWidth: "60px" }}
                            >
                              {post.content?.slice(0, 20) || "Draft"}
                            </span>
                          </div>
                        );
                      })}
                      {dayPosts.length > maxDots && (
                        <span className="text-[9px] font-semibold" style={{ color: "rgba(201,168,124,0.6)" }}>
                          +{dayPosts.length - maxDots} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover: quick add */}
                  {dayPosts.length === 0 && (
                    <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3" style={{ color: "rgba(201,168,124,0.4)" }} />
                    </div>
                  )}
                </div>

                {/* Selected border ring */}
                {isSelected && (
                  <span className="absolute inset-0 ring-1 ring-inset rounded pointer-events-none" style={{ ringColor: "rgba(201,168,124,0.4)" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar: selected day OR unscheduled drafts */}
      <div
        className="lg:w-72 rounded-2xl border flex flex-col overflow-hidden shrink-0"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,124,0.7)" }}>
            {selected ? format(selected, "MMM d, yyyy") : "Unscheduled"}
          </span>
          {selected && (
            <button
              onClick={() => onNewPost && onNewPost()}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/10 min-h-[32px]"
              style={{ color: "#c9a87c", border: "1px solid rgba(201,168,124,0.25)" }}
              aria-label="New post for this day"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {selected ? (
            selectedDayPosts.length > 0 ? (
              <ul className="divide-y divide-white/[0.04]">
                {selectedDayPosts.map(post => (
                  <PostSidebarItem
                    key={post.id}
                    post={post}
                    onEdit={() => onEditPost && onEditPost(post)}
                  />
                ))}
              </ul>
            ) : (
              <EmptySidebarState
                label="No posts scheduled"
                sub="Click + New to add one"
              />
            )
          ) : (
            draftsWithoutDate.length > 0 ? (
              <ul className="divide-y divide-white/[0.04]">
                {draftsWithoutDate.map(post => (
                  <PostSidebarItem
                    key={post.id}
                    post={post}
                    onEdit={() => onEditPost && onEditPost(post)}
                  />
                ))}
              </ul>
            ) : (
              <EmptySidebarState
                label="No unscheduled drafts"
                sub="Click a day to see its posts"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PostSidebarItem({ post, onEdit }) {
  const statusCfg = POST_STATUS_CONFIG[post.status] || POST_STATUS_CONFIG.draft;
  const platforms = [...new Set(
    (post.channel_ids || []).map(() => null).filter(Boolean)
  )];

  const timeLabel = post.scheduled_at
    ? format(parseISO(post.scheduled_at), "h:mm a")
    : null;

  const platformDots = post.platforms || [];

  return (
    <li>
      <button
        onClick={onEdit}
        className="w-full text-left px-4 py-3 transition-colors hover:bg-white/[0.03] group"
        aria-label={`Edit post: ${post.content?.slice(0, 40)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs line-clamp-2 leading-relaxed flex-1" style={{ color: "rgba(232,220,200,0.65)" }}>
            {post.content || "No content"}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
          {timeLabel && (
            <span className="text-[9px] font-medium" style={{ color: "rgba(123,159,212,0.8)" }}>
              {timeLabel}
            </span>
          )}
          {platformDots.map(p => (
            <span
              key={p}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: PLATFORM_DOTS[p] || "rgba(232,220,200,0.3)" }}
            />
          ))}
        </div>
      </button>
    </li>
  );
}

function EmptySidebarState({ label, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <CalendarDays className="w-8 h-8 mb-3" style={{ color: "rgba(201,168,124,0.2)" }} />
      <p className="text-sm font-medium" style={{ color: "rgba(232,220,200,0.3)" }}>{label}</p>
      <p className="text-xs mt-1" style={{ color: "rgba(232,220,200,0.18)" }}>{sub}</p>
    </div>
  );
}