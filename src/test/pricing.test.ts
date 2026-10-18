import { describe, it, expect } from "vitest";
import { priceBreakdown } from "@/lib/pricing";

describe("second hour 40% off", () => {
  it("1 hour is full base price", () => expect(priceBreakdown(300, 1).total).toBe(300));
  it("Luna 2h = 480 (300 + 180)", () => {
    const p = priceBreakdown(300, 2);
    expect(p.second).toBe(180);
    expect(p.total).toBe(480);
    expect(p.full).toBe(600);
  });
  it("Isabela 2h = 560", () => expect(priceBreakdown(350, 2).total).toBe(560));
  it("Marina 2h = 672", () => expect(priceBreakdown(420, 2).total).toBe(672));
  it("Perfil 4/5/6 2h = 448/608/720", () => {
    expect(priceBreakdown(280, 2).total).toBe(448);
    expect(priceBreakdown(380, 2).total).toBe(608);
    expect(priceBreakdown(450, 2).total).toBe(720);
  });
});
