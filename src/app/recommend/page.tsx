"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { recommendRegions } from "@/lib/recommend";
import type { Companion, Vibe, Activity } from "@/lib/types";

const VIBE_LABEL: Record<Vibe, string> = {
  조용히쉬고싶어: "🌿 조용히 쉬고 싶어",
  숨겨진거찾고싶어: "🔍 숨겨진 거 찾고 싶어",
  핫한데가고싶어: "⚡ 핫한 데 가고 싶어",
  분위기있는데: "🌹 분위기 있는 데",
  이국감성: "✈️ 이국 감성",
};

const ACTIVITY_LABEL: Record<Activity, string> = {
  걷기: "🚶 걷기",
  카페: "☕ 카페",
  맛집: "🍽 맛집",
  쇼핑: "🛍 쇼핑",
  문화: "🎨 문화",
};

const COMPANION_LABEL: Record<Companion, string> = {
  혼자: "🚶 혼자",
  연인: "💑 연인",
  친구: "👯 친구",
  부모님: "👨‍👩‍👧 부모님",
};

function RecommendContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const companion = searchParams.get("companion") as Companion | null;
  const vibe = searchParams.get("vibe") as Vibe | null;
  const activity = searchParams.get("activity") as Activity | null;

  const regions = useMemo(() => {
    if (!companion || !vibe || !activity) return [];
    return recommendRegions(companion, vibe, activity, 3);
  }, [companion, vibe, activity]);

  const handleRegionClick = (regionName: string, lat: number, lng: number) => {
    const params = new URLSearchParams({
      region: regionName,
      lat: String(lat),
      lng: String(lng),
    });
    router.push(`/places?${params.toString()}`);
  };

  if (!companion || !vibe || !activity) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-zinc-500 mb-6">잘못된 접근이에요.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 border border-zinc-300 rounded-full hover:border-black transition-colors"
        >
          처음으로
        </button>
      </main>
    );
  }

  if (regions.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-zinc-500 mb-2">딱 맞는 동네를 아직 못 찾았어요.</p>
        <p className="text-sm text-zinc-400 mb-6">다른 조합을 시도해보세요!</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 border border-zinc-300 rounded-full hover:border-black transition-colors"
        >
          다시 선택하기
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* 선택 요약 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full">
            {COMPANION_LABEL[companion]}
          </span>
          <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full">
            {VIBE_LABEL[vibe]}
          </span>
          <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full">
            {ACTIVITY_LABEL[activity]}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-6">이런 동네는 어때요?</h2>

        {/* 지역 카드 */}
        <div className="flex flex-col gap-4">
          {regions.map((region, i) => (
            <button
              key={region.id}
              onClick={() =>
                handleRegionClick(
                  region.name,
                  region.center_lat,
                  region.center_lng
                )
              }
              className="group relative w-full h-48 rounded-2xl overflow-hidden text-left border-2 border-transparent hover:border-black transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-950" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* 순위 */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-xs font-bold text-white/60">
                  #{i + 1}
                </span>
              </div>

              <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">{region.name}</h3>
                <p className="text-sm text-white/75">{region.description}</p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {region.mood_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-white/20 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-zinc-300 rounded-full text-sm text-zinc-600 hover:border-black hover:text-black transition-colors"
          >
            다시 선택하기
          </button>
        </div>
      </div>
    </main>
  );
}

export default function RecommendPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">로딩 중...</p>
        </main>
      }
    >
      <RecommendContent />
    </Suspense>
  );
}
