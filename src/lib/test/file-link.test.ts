import { describe, expect, it } from "vitest";
import { fileLink, nodeIdOfLinkHash } from "../file-link";

describe("file link", () => {
    it("puts the id of the item after a #, encoded", () => {
        expect(fileLink("https://owload.example/p/abc_DEF-123", "a/b+c=")).toBe("https://owload.example/p/abc_DEF-123#a%2Fb%2Bc%3D");
    });

    it("replaces an id the link of the drive already has", () => {
        expect(fileLink("https://owload.example/p/abc#old", "new")).toBe("https://owload.example/p/abc#new");
    });

    it("reads the id back, and nothing from a link to the drive", () => {
        expect(nodeIdOfLinkHash("#a%2Fb%2Bc%3D")).toBe("a/b+c=");
        expect(nodeIdOfLinkHash("")).toBeUndefined();
        expect(nodeIdOfLinkHash("#")).toBeUndefined();
        expect(nodeIdOfLinkHash("#%E0%A4%A")).toBeUndefined();
    });
});
