import { describe, expect, it } from "vitest";
import { chooseMemberWeddingId } from "./coupleMembership";

describe("chooseMemberWeddingId", () => {
  const memberships = [{ wedding_id: "mine" }, { wedding_id: "other-mine" }];

  it("keeps a stored wedding only when the user is a member", () => {
    expect(chooseMemberWeddingId(memberships, "other-mine")).toBe("other-mine");
    expect(chooseMemberWeddingId(memberships, "someone-elses")).toBe("mine");
  });

  it("starts onboarding when the user has no wedding", () => {
    expect(chooseMemberWeddingId([], "someone-elses")).toBeNull();
  });
});
