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
  { value: "카페", label: "카페 가고 싶어", emoji: "☕" },
  { value: "맛집", label: "맛있는 거 먹고 싶어", emoji: "🍽" },
  { value: "쇼핑", label: "쇼핑하고 싶어", emoji: "🛍" },
  { value: "문화", label: "문화 경험하고 싶어", emoji: "🎨" },
];

const STEPS = ["누구랑?", "어떤 느낌?", "뭐 하고 싶어?"];

export default function MoodInputPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);

  const handleCompanion = (v: Companion) => {
    setCompanion(v);
    setStep(1);
  };

  const handleVibe = (v: Vibe) => {
    setVibe(v);
    setStep(2);
  };

  const handleActivity = (v: Activity) => {
    setActivity(v);
  };

  const handleSubmit = () => {
    if (!companion || !vibe || !activity) return;
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

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  i === step
                    ? "text-black"
                    : i < step
                    ? "text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    : "text-zinc-300 cursor-default"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    i < step
                      ? "bg-black text-white"
                      : i === step
                      ? "border-2 border-black text-black"
                      : "border-2 border-zinc-200 text-zinc-300"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && (
                <span className="text-zinc-200">—</span>
              )}
            </div>
          ))}
        </div>

        {/* Step 0: 동행자 */}
        {step === 0 && (
          <div>
            <p className="text-lg font-semibold mb-5 text-center">
              누구랑 가요?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {COMPANIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => handleCompanion(value)}
                  className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-zinc-200 rounded-2xl hover:border-black hover:bg-zinc-50 transition-all"
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-base font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: 느낌 */}
        {step === 1 && (
          <div>
            <p className="text-lg font-semibold mb-5 text-center">
              어떤 느낌이에요?
            </p>
            <div className="flex flex-col gap-3">
              {VIBES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => handleVibe(value)}
                  className="flex items-center gap-4 px-6 py-4 border-2 border-zinc-200 rounded-2xl hover:border-black hover:bg-zinc-50 transition-all text-left"
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-base font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 행위 */}
        {step === 2 && (
          <div>
            <p className="text-lg font-semibold mb-5 text-center">
              뭐 하고 싶어요?
            </p>
            <div className="flex flex-col gap-3">
              {ACTIVITIES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => handleActivity(value)}
                  className={`flex items-center gap-4 px-6 py-4 border-2 rounded-2xl transition-all text-left ${
                    activity === value
                      ? "border-black bg-zinc-50"
                      : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-base font-medium">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!activity}
              className="mt-8 w-full py-4 bg-black text-white rounded-2xl text-base font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              추천받기 →
            </button>
          </div>
        )}

        {/* 선택 요약 (step > 0) */}
        {step > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {companion && (
              <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full">
                {COMPANIONS.find((c) => c.value === companion)?.emoji}{" "}
                {companion}
              </span>
            )}
            {vibe && (
              <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full">
                {VIBES.find((v) => v.value === vibe)?.emoji}{" "}
                {VIBES.find((v) => v.value === vibe)?.label}
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
