"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { recommendRegions } from "@/lib/recommend";
import type { Companion, Activity, Region } from "@/lib/types";

const ACTIVITY_LABEL: Record<Activity, string> = {
  걷기: "걷기",
  "카페/맛집": "카페·맛집",
  쇼핑: "쇼핑",
  유적지: "유적지",
  예술: "예술",
};

const COMPANION_LABEL: Record<Companion, string> = {
  혼자: "혼자",
  연인: "연인",
  친구: "친구",
  부모님: "부모님",
};

function PhotoSlot({
  imageUrl,
  name,
  className = "",
}: {
  imageUrl: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
    </div>
  );
}

function HeroCard({
  region,
  idx,
  onClick,
}: {
  region: Region;
  idx: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group w-full text-left">
      <PhotoSlot
        imageUrl={region.image_url}
        name={region.name}
        className="w-full h-72 sm:h-80"
      />
      <div className="flex items-start gap-5 mt-5">
        <span className="text-xs text-zinc-300 font-light mt-1 shrink-0 tabular-nums">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="font-serif text-2xl text-zinc-900 leading-snug mb-1.5 group-hover:text-zinc-600 transition-colors">
            {region.name}
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {region.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function SmallCard({
  region,
  idx,
  onClick,
}: {
  region: Region;
  idx: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group w-full text-left">
      <PhotoSlot
        imageUrl={region.image_url}
        name={region.name}
        className="w-full aspect-[4/3]"
      />
      <div className="mt-3">
        <span className="text-xs text-zinc-300 tabular-nums">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <h3 className="font-serif text-lg text-zinc-900 leading-snug mt-0.5 mb-1 group-hover:text-zinc-600 transition-colors">
          {region.name}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {region.description}
        </p>
      </div>
    </button>
  );
}

function RecommendContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const companion = searchParams.get("companion") as Companion | null;
  const activitiesParam = searchParams.get("activities") ?? "";
  const activities = activitiesParam
    ? (activitiesParam.split(",") as Activity[])
    : [];
  const query = searchParams.get("query") ?? "";

  const results = useMemo(() => {
    if (!companion) return [];
    return recommendRegions(companion, activities, query, 3);
  }, [companion, activitiesParam, query]);

  const handleRegionClick = (region: Region) => {
    const params = new URLSearchParams({
      region: region.name,
      lat: String(region.center_lat),
      lng: String(region.center_lng),
    });
    router.push(`/places?${params.toString()}`);
  };

  if (!companion) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-zinc-400 mb-6 text-sm">잘못된 접근이에요.</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 transition-colors"
        >
          처음으로
        </button>
      </main>
    );
  }

  if (results.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="font-serif text-xl text-zinc-700 mb-2">
          딱 맞는 동네를 아직 못 찾았어요.
        </p>
        <p className="text-sm text-zinc-400 mb-8">다른 조합을 시도해보세요.</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 transition-colors"
        >
          다시 선택하기
        </button>
      </main>
    );
  }

  const conditionParts = [
    COMPANION_LABEL[companion],
    ...activities.map((a) => ACTIVITY_LABEL[a]),
    ...(query ? [`"${query}"`] : []),
  ];

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">

        {/* 에디터리얼 헤더 */}
        <div className="mb-10 pb-8 border-b border-zinc-100">
          <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase mb-3">
            {conditionParts.join(" · ")}
          </p>
          <h2 className="font-serif text-3xl text-zinc-900 leading-snug">
            당신을 위한 동네
          </h2>
        </div>

        {/* 히어로 카드 — #01 */}
        <HeroCard
          region={results[0]}
          idx={0}
          onClick={() => handleRegionClick(results[0])}
        />

        {/* 2열 그리드 — #02, #03 */}
        {results.length > 1 && (
          <>
            <div className="border-t border-zinc-100 my-8" />
            <div className="grid grid-cols-2 gap-5">
              {results.slice(1).map((region, i) => (
                <SmallCard
                  key={region.id}
                  region={region}
                  idx={i + 1}
                  onClick={() => handleRegionClick(region)}
                />
              ))}
            </div>
          </>
        )}

        {/* 하단 */}
        <div className="mt-14 pt-8 border-t border-zinc-100 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-zinc-400 tracking-widest uppercase hover:text-zinc-800 transition-colors"
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
          <p className="text-zinc-300 text-sm">잠시만요...</p>
        </main>
      }
    >
      <RecommendContent />
    </Suspense>
  );
}
