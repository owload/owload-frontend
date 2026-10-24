import { describe, expect, it } from "vitest";
import { formatBytes, formatWhen, usedPercent } from "../drive-stats-format";

describe("formatBytes", () => {
    it("writes sizes short", () => {
        expect(formatBytes(0)).toBe("0 B");
        expect(formatBytes(-5)).toBe("0 B");
        expect(formatBytes(900)).toBe("900 B");
        expect(formatBytes(1536)).toBe("1.5 KB");
        expect(formatBytes(12 * 1024 * 1024)).toBe("12 MB");
        expect(formatBytes(1.5 * 1024 ** 3)).toBe("1.5 GB");
        expect(formatBytes(3 * 1024 ** 4)).toBe("3 TB");
        expect(formatBytes(2 * 1024 ** 2)).toBe("2 MB");
        expect(formatBytes(2.5 * 1024 ** 2)).toBe("2.5 MB");
    });
});

describe("usedPercent", () => {
    it("is the share the files take of what is stored, kept between 0 and 100", () => {
        expect(usedPercent(50, 200)).toBe(25);
        expect(usedPercent(300, 200)).toBe(100);
        expect(usedPercent(0, 200)).toBe(0);
    });

    it("is unknown when the files are not counted yet or nothing is stored", () => {
        expect(usedPercent(undefined, 200)).toBeUndefined();
        expect(usedPercent(10, 0)).toBeUndefined();
        expect(usedPercent(10, null)).toBeUndefined();
    });
});


describe("formatWhen", () => {
    const now = new Date(2026, 9, 21, 15, 30).getTime(); // Oct 21, 2026, 15:30 local time
    const at = (month: number, day: number, hour: number, minute: number, year = 2026) => new Date(year, month, day, hour, minute).getTime();

    it("counts minutes and hours for what is recent", () => {
        expect(formatWhen(now - 20_000, now)).toBe("just now");
        expect(formatWhen(now - 12 * 60_000, now)).toBe("12 min ago");
        expect(formatWhen(now - 59 * 60_000, now)).toBe("59 min ago");
        expect(formatWhen(now - 2 * 3_600_000, now)).toBe("2 h ago");
        expect(formatWhen(now - 5.9 * 3_600_000, now)).toBe("5 h ago");
    });

    it("names today and yesterday, and gives a date for anything older", () => {
        expect(formatWhen(at(9, 21, 8, 5), now)).toMatch(/^Today, /);
        expect(formatWhen(at(9, 20, 18, 40), now)).toMatch(/^Yesterday, /);
        const older = formatWhen(at(9, 18, 9, 12), now);
        expect(older).not.toMatch(/Today|Yesterday|ago/);
        expect(older).toContain("18");
        expect(formatWhen(at(8, 3, 9, 12, 2025), now)).toContain("2025");
    });

    it("does not call the previous night yesterday's morning: just after midnight is yesterday for the evening before", () => {
        const justAfterMidnight = new Date(2026, 9, 21, 0, 10).getTime();
        expect(formatWhen(new Date(2026, 9, 20, 22, 0).getTime(), justAfterMidnight)).toBe("2 h ago");
        expect(formatWhen(new Date(2026, 9, 20, 9, 0).getTime(), justAfterMidnight)).toMatch(/^Yesterday, /);
    });
});
