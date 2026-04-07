"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Companion, Vibe, Activity } from "@/lib/types";

const COMPANIONS: { value: Companion; label: string; emoji: string }[] = [
  { value: "혼자", label: "혼자", emoji: "🚶" },
  { value: "연인", label: "연인", emoji: "💑" },
  { value: "친구", label: "친구", emoji: "👯" },
  { value: "부모님", label: "부모님", emoji: "👨‍👩‍👧" },
];

const VIBES: { value: Vibe; label: string; emoji: string }[] = [
  { value: "조용히쉬고싶어", label: "조용히 쉬고 싶어", emoji: "🌿" },
  { value: "숨겨진거찾고싶어", label: "숨겨진 거 찾고 싶어", emoji: "🔍" },
  { value: "핫한데가고싶어", label: "핫한 데 가고 싶어", emoji: "⚡" },
  { value: "분위기있는데", label: "분위기 있는 데", emoji: "🌹" },
  { value: "이국감성", label: "이국 감성", emoji: "✈️" },
];

const ACTIVITIES: { value: Activity; label: string; emoji: string }[] = [
  { value: "걷기", label: "걷고 싶어", emoji: "🚶" },
  { value: "카페", label: "카페", emoji: "☕" },
  { value: "맛집", label: "맛집", emoji: "🍽" },
  { value: "쇼핑", label: "쇼핑", emoji: "🛍" },
  { value: "문화", label: "문화 경험", emoji: "🎨" },
];

function Chip({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all whitespace-nowrap ${
        selected
          ? "border-black bg-black text-white"
          : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

export default function MoodInputPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);

  const canSubmit = companion && vibe && activity;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const params = new URLSearchParams({ companion, vibe, activity });
    router.push(`/recommend?${params.toString()}`);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">MoodPlace</h1>
          <p className="text-zinc-500">오늘 어떤 서울을 원해요?</p>
        </div>

        {/* 검색창 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 조용하고 빈티지한 카페가 있는 동네"
          className="w-full text-base border-b-2 border-zinc-200 focus:border-black outline-none pb-3 bg-transparent text-center transition-colors mb-10 placeholder:text-zinc-400"
        />

        {/* 누구랑? */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            누구랑
          </p>
          <div className="flex flex-wrap gap-2">
            {COMPANIONS.map((c) => (
              <Chip
                key={c.value}
                emoji={c.emoji}
                label={c.label}
                selected={companion === c.value}
                onClick={() =>
                  setCompanion(companion === c.value ? null : c.value)
                }
              />
            ))}
          </div>
        </div>

        {/* 어떤 느낌? */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            어떤 느낌
          </p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip
                key={v.value}
                emoji={v.emoji}
                label={v.label}
                selected={vibe === v.value}
                onClick={() => setVibe(vibe === v.value ? null : v.value)}
              />
            ))}
          </div>
        </div>

        {/* 뭐 하고 싶어? */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            뭐 하고 싶어
          </p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <Chip
                key={a.value}
                emoji={a.emoji}
                label={a.label}
                selected={activity === a.value}
                onClick={() =>
                  setActivity(activity === a.value ? null : a.value)
                }
              />
            ))}
          </div>
        </div>

        {/* 추천받기 */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 bg-black text-white rounded-2xl text-base font-semibold disabled:opacity-25 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
        >
          추천받기 →
        </button>
      </div>
    </main>
  );
}
