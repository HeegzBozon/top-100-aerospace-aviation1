import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { linkedInCommunity } from "@/functions/linkedInCommunity";
import CommunityPostCard from "./CommunityPostCard";
import { RefreshCw, Users, AlertCircle, Loader2 } from "lucide-react";

export default function CommunityFeed({ channels }) {
  const queryClient = useQueryClient();
  const [authorUrn, setAuthorUrn] = useState(null);

  // Resolve author URN once
  const { isLoading: loadingUrn, error: urnError } = useQuery({
    queryKey: ["linkedin-me"],
    queryFn: async () => {
      const res = await linkedInCommunity({ action: "get_me" });
      setAuthorUrn(res.data.urn);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const { data: postsData, isLoading: loadingPosts, error: postsError, refetch } = useQuery({
    queryKey: ["linkedin-posts", authorUrn],
    queryFn: () => linkedInCommunity({ action: "get_posts", author_urn: authorUrn }),
    enabled: !!authorUrn,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data.posts || [],
  });

  const posts = postsData || [];
  const isLoading = loadingUrn || loadingPosts;
  const error = urnError || postsError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(201,168,124,0.5)" }} />
        <p className="text-xs" style={{ color: "rgba(232,220,200,0.3)" }}>Connecting to LinkedIn…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 rounded-2xl p-5 border"
        style={{ background: "rgba(224,122,95,0.06)", borderColor: "rgba(224,122,95,0.2)" }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#e07a5f" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#e07a5f" }}>LinkedIn connection error</p>
          <p className="text-xs mt-1" style={{ color: "rgba(232,220,200,0.4)" }}>
            {error?.response?.data?.error || error.message || "Could not fetch data. Ensure LinkedIn is connected with r_organization_social scope."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: "rgba(123,159,212,0.7)" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(123,159,212,0.7)" }}>
            Community
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(123,159,212,0.1)", color: "rgba(123,159,212,0.7)" }}
          >
            {posts.length} posts
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors hover:bg-white/5 min-h-[36px]"
          style={{ color: "rgba(232,220,200,0.4)" }}
          aria-label="Refresh feed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(123,159,212,0.08)", border: "1px solid rgba(123,159,212,0.15)" }}
          >
            <Users className="w-5 h-5" style={{ color: "rgba(123,159,212,0.4)" }} />
          </div>
          <p className="text-sm" style={{ color: "rgba(232,220,200,0.3)" }}>No posts found on your LinkedIn profile.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              authorUrn={authorUrn}
            />
          ))}
        </div>
      )}
    </div>
  );
}