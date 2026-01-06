// ============ 날씨 타입 ============

export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "foggy";

export interface Weather {
  currentWeather: WeatherType;
  weatherProgress: number; // 0-100%
  nextWeatherIn: number; // ms
  cycleHours: number;
}

export interface WeatherSettings {
  weather_cycle_hours: number;
  weather_epoch: string;
  current_weather: WeatherType;
}

// ============ 날씨 정보 ============

export interface WeatherInfo {
  id: WeatherType;
  nameKo: string;
  nameEn: string;
  icon: string;
  description: string;
}

export const WEATHER_INFO: Record<WeatherType, WeatherInfo> = {
  sunny: {
    id: "sunny",
    nameKo: "맑음",
    nameEn: "Sunny",
    icon: "☀️",
    description: "화창한 날씨",
  },
  cloudy: {
    id: "cloudy",
    nameKo: "흐림",
    nameEn: "Cloudy",
    icon: "☁️",
    description: "구름이 낀 날씨",
  },
  rainy: {
    id: "rainy",
    nameKo: "비",
    nameEn: "Rainy",
    icon: "🌧️",
    description: "비가 내리는 날씨",
  },
  stormy: {
    id: "stormy",
    nameKo: "폭풍",
    nameEn: "Stormy",
    icon: "⛈️",
    description: "천둥번개가 치는 날씨",
  },
  foggy: {
    id: "foggy",
    nameKo: "안개",
    nameEn: "Foggy",
    icon: "🌫️",
    description: "안개가 자욱한 날씨",
  },
};

// 날씨 순서 (5등분 순환)
export const WEATHER_ORDER: WeatherType[] = [
  "sunny",
  "cloudy",
  "rainy",
  "stormy",
  "foggy",
];
