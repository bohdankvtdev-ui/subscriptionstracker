import { describe, expect, it } from "vitest";
import {
  inputToCreateBody,
  parseNextRenewalDateInput,
} from "../subscriptions";

describe("parseNextRenewalDateInput", () => {
  it("accepts YYYY-MM-DD and returns noon UTC ISO", () => {
    const r = parseNextRenewalDateInput("2026-06-15");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.iso).toBe("2026-06-15T12:00:00.000Z");
    }
  });

  it("rejects invalid format and impossible dates", () => {
    expect(parseNextRenewalDateInput("06/15/2026").ok).toBe(false);
    expect(parseNextRenewalDateInput("2026-02-31").ok).toBe(false);
  });
});

describe("inputToCreateBody", () => {
  it("includes renewalDate when nextRenewalDate is set", () => {
    const body = inputToCreateBody({
      name: "Test",
      price: 10,
      frequency: "Monthly",
      category: "Other",
      nextRenewalDate: "2026-07-01T12:00:00.000Z",
    });
    expect(body).toMatchObject({
      name: "Test",
      renewalDate: "2026-07-01T12:00:00.000Z",
    });
  });

  it("omits renewalDate when not provided", () => {
    const body = inputToCreateBody({
      name: "Test",
      price: 10,
      frequency: "Monthly",
      category: "Other",
    });
    expect("renewalDate" in body).toBe(false);
  });
});
