import { describe, it, expect } from "vitest";
import { classifyEvent, pickFeaturedEvent } from "./utils";

const today = new Date(2026, 6, 24); // 2026-07-24

describe("classifyEvent", () => {
  it("falls back to manual type when no startDate", () => {
    expect(classifyEvent({ type: "past", }, today)).toBe("past");
  });

  it("classifies upcoming, ongoing, and past from dates", () => {
    expect(classifyEvent({ type: "past", startDate: "2026-08-01" }, today)).toBe("upcoming");
    expect(classifyEvent({ type: "past", startDate: "2026-07-24" }, today)).toBe("ongoing");
    expect(classifyEvent({ type: "past", startDate: "2026-07-01", endDate: "2026-07-30" }, today)).toBe("ongoing");
    expect(classifyEvent({ type: "upcoming", startDate: "2026-07-01" }, today)).toBe("past");
  });
});

describe("pickFeaturedEvent", () => {
  it("prefers an event happening today over any upcoming or past event", () => {
    const events = [
      { id: "past", startDate: "2026-07-01" },
      { id: "today", startDate: "2026-07-20", endDate: "2026-07-30" },
      { id: "upcoming", startDate: "2026-08-01" },
    ];
    const result = pickFeaturedEvent(events, today);
    expect(result?.event.id).toBe("today");
    expect(result?.status).toBe("today");
  });

  it("picks the soonest upcoming event when nothing is happening today", () => {
    const events = [
      { id: "far", startDate: "2026-12-01" },
      { id: "soon", startDate: "2026-08-01" },
      { id: "past", startDate: "2026-01-01" },
    ];
    const result = pickFeaturedEvent(events, today);
    expect(result?.event.id).toBe("soon");
    expect(result?.status).toBe("upcoming");
  });

  it("falls back to the most recently ended event when nothing is upcoming or ongoing", () => {
    const events = [
      { id: "old", startDate: "2026-01-01" },
      { id: "recent", startDate: "2026-07-01", endDate: "2026-07-10" },
    ];
    const result = pickFeaturedEvent(events, today);
    expect(result?.event.id).toBe("recent");
    expect(result?.status).toBe("past");
  });

  it("ignores events without a startDate", () => {
    const events = [
      { id: "undated" },
      { id: "upcoming", startDate: "2026-09-01" },
    ];
    const result = pickFeaturedEvent(events, today);
    expect(result?.event.id).toBe("upcoming");
  });

  it("returns undefined when no event has a startDate", () => {
    const events = [{ id: "undated" }];
    expect(pickFeaturedEvent(events, today)).toBeUndefined();
  });
});
