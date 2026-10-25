import { describe, expect, it } from "vitest";
import { faceFill, rolesLine } from "../drive-access-text";

describe("rolesLine", () => {
    it("counts the roles in the order of their rank, with the plural where it belongs", () => {
        expect(rolesLine({ reader: 1, admin: 1, writer: 2 })).toBe("1 admin · 2 writers · 1 reader");
        expect(rolesLine({ writer: 1 })).toBe("1 writer");
        expect(rolesLine({})).toBe("");
        expect(rolesLine({ owner: 1, reader: 0 })).toBe("");
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
