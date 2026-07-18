import { describe, it, expect } from "vitest";
import {
  riskColor,
  RISK_STOPS,
  TIER_META,
  tierOf,
  fmtInt,
  fmtPct,
  fmtCompact,
} from "@/lib/format";

describe("riskColor", () => {
  it("returns exact stop colors at anchors", () => {
    expect(riskColor(0).toLowerCase()).toBe(RISK_STOPS[0][1].toLowerCase());
    expect(riskColor(100).toLowerCase()).toBe(RISK_STOPS[RISK_STOPS.length - 1][1].toLowerCase());
  });
  it("clamps out-of-range input", () => {
    expect(riskColor(-20)).toBe(riskColor(0));
    expect(riskColor(200)).toBe(riskColor(100));
  });
  it("produces valid hex for interpolated values", () => {
    for (const s of [12, 47, 73, 91]) expect(riskColor(s)).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it("moves warmer from low to high (red channel non-decreasing)", () => {
    const red = (h: string) => parseInt(h.slice(1, 3), 16);
    expect(red(riskColor(95))).toBeGreaterThan(red(riskColor(5)));
  });
});

describe("tierOf", () => {
  it("bins the 0-100 score into the four tiers", () => {
    expect(tierOf(100)).toBe("Critical");
    expect(tierOf(80)).toBe("Critical");
    expect(tierOf(79.9)).toBe("High");
    expect(tierOf(60)).toBe("High");
    expect(tierOf(40)).toBe("Moderate");
    expect(tierOf(39.9)).toBe("Lower");
    expect(tierOf(0)).toBe("Lower");
  });
});

describe("tier metadata", () => {
  it("defines all four tiers with color + blurb", () => {
    for (const t of ["Critical", "High", "Moderate", "Lower"]) {
      expect(TIER_META[t]?.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(TIER_META[t]?.blurb.length).toBeGreaterThan(10);
    }
  });
});

describe("formatters", () => {
  it("formats integers and percents", () => {
    expect(fmtInt(1298516032)).toBe("1,298,516,032");
    expect(fmtPct(18)).toBe("18.0%");
    expect(fmtPct(null)).toBe("—");
  });
  it("formats compact ridership magnitudes", () => {
    expect(fmtCompact(1298516032)).toBe("1.30B");
    expect(fmtCompact(48509290)).toBe("48.5M");
    expect(fmtCompact(972133)).toBe("972K");
    expect(fmtCompact(430)).toBe("430");
    expect(fmtCompact(null)).toBe("—");
  });
});
