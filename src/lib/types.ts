// B: 유저가 선택하는 느낌
export type Vibe =
  | "조용히쉬고싶어"
  | "숨겨진거찾고싶어"
  | "핫한데가고싶어"
  | "분위기있는데"
  | "이국감성";

// C: 유저가 원하는 행위
export type Activity = "걷기" | "카페" | "맛집" | "쇼핑" | "문화";

// A: 동행자
export type Companion = "혼자" | "연인" | "친구" | "부모님";

export interface Region {
  id: string;
  name: string;
  mood_tags: string[];
  vibes: Vibe[];
  activities: Activity[];
  companions: Companion[];
  center_lat: number;
  center_lng: number;
  description: string;
  image_url: string;
}

export interface Place {
  id: string;
  name: string;
  category: "카페" | "음식점" | "기타";
  region: string;
  address: string;
  lat: number;
  lng: number;
  mood_tags: string[];
  phone: string;
  place_url: string;
}

export type CategoryFilter = "전체" | "카페" | "음식점" | "기타";
export type ViewMode = "map" | "list";
