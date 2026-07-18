export type Tier = "Critical" | "High" | "Moderate" | "Lower";

export interface BoroughExposure {
  county_fips: string;
  county: string;
  coastal_flood_risk: number;
  hurricane_risk: number;
  flood_risk: number;
  composite_risk: number;
  social_vulnerability: number;
  coastal_flood_eal_usd: number;
  hurricane_eal_usd: number;
  exposure_score: number;
}

export interface TopStation {
  rank: number;
  station_complex: string;
  borough: string;
  risk_score: number;
  annual_ridership: number;
  exposure_score: number;
  reliability_index: number;
}

export interface Summary {
  product: string;
  generated_utc: string;
  station_count: number;
  total_annual_ridership: number;
  ridership_year: number;
  method: {
    composite_formula: string;
    reliability_index: string;
    reliability_assumption: string;
    exposure: string;
    weights: Record<string, number>;
  };
  components: {
    computed: string[];
    proposed: string[];
  };
  borough_exposure: Record<string, BoroughExposure>;
  top_risk_stations: TopStation[];
}

export interface StationProps {
  station_complex: string;
  station_complex_id: string;
  borough: string;
  annual_ridership: number;
  lines: string[];
  reliability_index: number;
  reliability_zscore: number;
  exposure_score: number;
  coastal_flood_risk: number;
  hurricane_risk: number;
  risk_score: number;
}

export interface StationFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: StationProps;
}

export interface StationCollection {
  type: "FeatureCollection";
  features: StationFeature[];
}

export interface SourcesMeta {
  product: string;
  keyless: boolean;
  note: string;
  sources: {
    name: string;
    id: string;
    provider: string;
    license: string;
    url: string;
    role: string;
  }[];
}
