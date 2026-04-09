"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Companion, Activity } from "@/lib/types";

const COMPANIONS: { value: Companion; label: string; emoji: string }[] = [
  { value: "혼자",   label: "혼자",   emoji: "🚶" },
  { value: "연인",   label: "연인",   emoji: "💑" },
  { value: "친구",   label: "친구",   emoji: "👯" },
  { value: "부모님", label: "부모님", emoji: "👨‍👩‍👧" },
];

const ACTIVITIES: { value: Activity; label: string; emoji: string }[] = [
  { value: "걷기", label: "걷고 싶어",     emoji: "🚶" },
  { value: "카페", label: "카페",           emoji: "☕" },
  { value: "맛집", label: "맛집",           emoji: "🍽" },
  { value: "쇼핑", label: "쇼핑",           emoji: "🛍" },
  { value: "문화", label: "문화 경험",       emoji: "🎨" },
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
  const [activity, setActivity] = useState<Activity | null>(null);

  const canSubmit = companion && activity;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const params = new URLSearchParams({ companion, activity });
    if (query.trim()) params.set("query", query.trim());
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

        {/* B: 느낌 자유 입력 */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            어떤 느낌
          </p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="예: 조용하고 빈티지한, 이국적인, 자연 속에서 여유롭게"
            className="w-full text-base border-b-2 border-zinc-200 focus:border-black outline-none pb-3 bg-transparent transition-colors placeholder:text-zinc-400"
          />
        </div>

        {/* A: 누구랑 */}
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
                onClick={() => setCompanion(companion === c.value ? null : c.value)}
              />
            ))}
          </div>
        </div>

        {/* C: 뭐 하고 싶어 */}
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
                onClick={() => setActivity(activity === a.value ? null : a.value)}
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
