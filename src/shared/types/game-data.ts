// ============ 매핑 아이템 타입 ============

export interface EyeMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
}

export interface HairMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
  race: string;
}

export interface FacehairMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
}

export interface BodyMapping {
  index: number;
  name: string;
  ko: string;
  en: string;
  race: string;
}

// ============ 매핑 파일 타입 ============

export interface MappingFile<T> {
  version: string;
  generatedAt: string;
  summary: { total: number };
}

export interface EyeMappingFile extends MappingFile<EyeMapping> {
  eyes: EyeMapping[];
}

export interface HairMappingFile extends MappingFile<HairMapping> {
  hairs: HairMapping[];
}

export interface FacehairMappingFile extends MappingFile<FacehairMapping> {
  facehairs: FacehairMapping[];
}

export interface BodyMappingFile extends MappingFile<BodyMapping> {
  bodies: BodyMapping[];
}

// ============ 통합 매핑 타입 ============

export interface AllMappings {
  eyes: EyeMapping[];
  hairs: HairMapping[];
  facehairs: FacehairMapping[];
  bodies: BodyMapping[];
}
