import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "@/lib/pushNotifications";

describe("push notification key decoding", () => {
  it("decodes an unpadded URL-safe VAPID public key", () => {
    expect(Array.from(urlBase64ToUint8Array("AQID-_8"))).toEqual([1, 2, 3, 251, 255]);
  });
});
