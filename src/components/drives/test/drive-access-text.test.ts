import { describe, expect, it } from "vitest";
import { faceFill, peopleLine, readSegmentOf, rolesLine } from "../drive-access-text";

describe("peopleLine", () => {
    it("names the first three and counts the rest", () => {
        expect(peopleLine(["You", "Maria Lopez", "Daniel Kim", "Priya Nair", "Tom B"], 5)).toBe("You, Maria Lopez, Daniel Kim and 2 more");
        expect(peopleLine(["You", "Maria Lopez", "Daniel Kim"], 4)).toBe("You, Maria Lopez, Daniel Kim and 1 more");
    });

    it("lists a few people without counting", () => {
        expect(peopleLine(["You"], 1)).toBe("You");
        expect(peopleLine(["You", "Maria Lopez"], 2)).toBe("You and Maria Lopez");
        expect(peopleLine(["You", "Maria Lopez", "Daniel Kim"], 3)).toBe("You, Maria Lopez and Daniel Kim");
    });
});

describe("rolesLine", () => {
    it("counts the roles in the order of their rank, with the plural where it belongs", () => {
        expect(rolesLine({ reader: 1, admin: 1, writer: 2 })).toBe("1 admin · 2 writers · 1 reader");
        expect(rolesLine({ writer: 1 })).toBe("1 writer");
        expect(rolesLine({})).toBe("");
        expect(rolesLine({ owner: 1, reader: 0 })).toBe("");
    });
});

describe("readSegmentOf", () => {
    const now = new Date(2026, 9, 24, 15, 30).getTime();
    const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute).getTime();

    it("rounds a moment to the stretch of time it falls in", () => {
        expect(readSegmentOf(now - 5 * 60_000, now)).toBe("hour");
        expect(readSegmentOf(at(24, 9), now)).toBe("today");
        expect(readSegmentOf(at(23, 23, 50), now)).toBe("yesterday");
        expect(readSegmentOf(at(20, 12), now)).toBe("week");
        expect(readSegmentOf(at(10, 12), now)).toBe("earlier");
    });

    it("a read just before midnight is yesterday's, and a read in the last hour is recent even across midnight", () => {
        const justAfterMidnight = new Date(2026, 9, 25, 0, 20).getTime();
        expect(readSegmentOf(new Date(2026, 9, 24, 23, 50).getTime(), justAfterMidnight)).toBe("hour");
        expect(readSegmentOf(new Date(2026, 9, 24, 20, 0).getTime(), justAfterMidnight)).toBe("yesterday");
    });
});

describe("faceFill", () => {
    it("is the same for the same person and stays inside the fills", () => {
        for (const id of ["a", "314", "65ea1203-9da0-4b21-96af-11045cc11785", ""]) {
            expect(faceFill(id, 4)).toBe(faceFill(id, 4));
            expect(faceFill(id, 4)).toBeGreaterThanOrEqual(0);
            expect(faceFill(id, 4)).toBeLessThan(4);
        }
        expect(faceFill("anything", 0)).toBe(0);
    });

    it("tells different people apart often enough to be worth having", () => {
        const used = new Set(Array.from({ length: 40 }, (_, i) => faceFill(`user-${i}`, 4)));
        expect(used.size).toBe(4);
    });
});
