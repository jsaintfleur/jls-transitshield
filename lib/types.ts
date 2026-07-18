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
  station_hazard_score: number;
  coastal_proximity_proxy: number;
  reliability_index: number;
  hardening_priority: number;
}

export interface StormScenario {
  return_period_years: number;
  intensity: number;
  outage_hours: number;
  threshold_score: number;
  stations_over_threshold: number;
  annual_ridership_over_threshold: number;
  passenger_hours_at_risk: number;
}

export interface HardeningStation extends TopStation {
  hardening_priority: number;
  station_hazard_score: number;
  coastal_proximity_proxy: number;
  recommended_action: string;
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
    station_hazard_proxy: string;
    storm_scenario: string;
    weights: Record<string, number>;
  };
  components: {
    computed: string[];
    proposed: string[];
  };
  freshness: {
    ridership_year: number;
    incidents_window: string;
    fema_nri_resolution: string;
    station_hazard_resolution: string;
  };
  borough_exposure: Record<string, BoroughExposure>;
  storm_scenarios: StormScenario[];
  hardening_list: HardeningStation[];
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
  station_hazard_score: number;
  coastal_proximity_proxy: number;
  hazard_confidence: string;
  coastal_flood_risk: number;
  hurricane_risk: number;
  risk_score: number;
  hardening_priority: number;
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
