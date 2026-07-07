import { describe, it, expect, vi, beforeEach } from "vitest";
import { MediaService } from "./MediaService";
import { DomainEventBus } from "./events/DomainEventBus";

// Mock Supabase / Repository dependencies
vi.mock("@/repositories", () => {
  return {
    GalleryRepository: class {
      async updatePhotoStatus(photoId: string, status: string) {
        if (photoId === "photo-1") {
          return { error: null };
        }
        return { error: "Photo not found" };
      }

      async promoteGuestPhotoToGallery(weddingId: string, photo: any) {
        if (weddingId === "wedding-123" && photo.id === "photo-1") {
          return {
            data: {
              id: "gal-100",
              wedding_id: "wedding-123",
              url: photo.photo_url,
              caption: `Photo by ${photo.guest_name}`,
              promoted_from_guest_photo_id: photo.id,
              created_at: new Date().toISOString()
            },
            error: null
          };
        }
        return { data: null, error: "Promotion failed" };
      }

      async createGuestPhoto(payload: any) {
        return { data: { id: "new-photo-1", ...payload }, error: null };
      }
    }
  };
});

describe("MediaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateDimensions", () => {
    it("returns original dimensions when within maxDimension limit", () => {
      const res = MediaService.calculateDimensions(1000, 800, 1920);
      expect(res).toEqual({ width: 1000, height: 800, scale: 1 });
    });

    it("scales down landscape image correctly when width exceeds maxDimension", () => {
      // 4000 x 3000 with max 1920 -> scale = 1920 / 4000 = 0.48 -> width 1920, height 1440
      const res = MediaService.calculateDimensions(4000, 3000, 1920);
      expect(res.width).toBe(1920);
      expect(res.height).toBe(1440);
      expect(res.scale).toBeCloseTo(0.48, 2);
    });

    it("scales down portrait image correctly when height exceeds maxDimension", () => {
      // 2000 x 4000 with max 1000 -> scale = 1000 / 4000 = 0.25 -> width 500, height 1000
      const res = MediaService.calculateDimensions(2000, 4000, 1000);
      expect(res.width).toBe(500);
      expect(res.height).toBe(1000);
      expect(res.scale).toBe(0.25);
    });
  });

  describe("compressImage (Node / SSR fallback mode)", () => {
    it("simulates compression and returns reduced size File and statistics", async () => {
      const mockFile = new File(["dummy image content that is decently long to test size"], "test-photo.png", { type: "image/png" });
      const res = await MediaService.compressImage(mockFile, { format: "image/webp" });

      expect(res.file.name).toBe("test-photo.webp");
      expect(res.file.type).toBe("image/webp");
      expect(res.compressedSize).toBeLessThan(res.originalSize);
      expect(res.reductionPercentage).toBeGreaterThan(0);
      expect(res.dataUrl).toContain("data:image/webp;base64,");
    });
  });

  describe("generateResponsiveSrcset", () => {
    it("generates multi-resolution srcset string for standard URL without query params", () => {
      const url = "https://cdn.example.com/photo.jpg";
      const srcset = MediaService.generateResponsiveSrcset(url, [400, 800, 1200]);
      expect(srcset).toBe(
        "https://cdn.example.com/photo.jpg?w=400&q=80 400w, https://cdn.example.com/photo.jpg?w=800&q=80 800w, https://cdn.example.com/photo.jpg?w=1200&q=80 1200w"
      );
    });

    it("generates multi-resolution srcset string for URL with existing query params", () => {
      const url = "https://cdn.example.com/photo.jpg?token=abc";
      const srcset = MediaService.generateResponsiveSrcset(url, [400, 800]);
      expect(srcset).toBe(
        "https://cdn.example.com/photo.jpg?token=abc&w=400&q=80 400w, https://cdn.example.com/photo.jpg?token=abc&w=800&q=80 800w"
      );
    });

    it("returns empty string when baseUrl is empty", () => {
      expect(MediaService.generateResponsiveSrcset("")).toBe("");
    });
  });

  describe("moderatePhoto", () => {
    it("updates photo status to approved upon approve action", async () => {
      const res = await MediaService.moderatePhoto("photo-1", "approve");
      expect(res.error).toBeNull();
    });

    it("updates photo status to rejected upon reject action", async () => {
      const res = await MediaService.moderatePhoto("photo-1", "reject");
      expect(res.error).toBeNull();
    });

    it("returns error if photo ID is not found", async () => {
      const res = await MediaService.moderatePhoto("non-existent", "pin");
      expect(res.error).toBe("Photo not found");
    });
  });

  describe("promoteToCuratedGallery", () => {
    it("promotes guest photo to curated gallery and publishes domain event", async () => {
      const spy = vi.spyOn(DomainEventBus, "publish");
      const guestPhoto = {
        id: "photo-1",
        wedding_id: "wedding-123",
        guest_name: "Uncle Bob",
        photo_url: "https://cdn.example.com/bob.jpg",
        likes: 5,
        created_at: new Date().toISOString()
      };

      const res = await MediaService.promoteToCuratedGallery("wedding-123", guestPhoto);
      expect(res.error).toBeNull();
      expect(res.data).toBeDefined();
      expect(res.data?.caption).toBe("Photo by Uncle Bob");
      expect(res.data?.promoted_from_guest_photo_id).toBe("photo-1");

      expect(spy).toHaveBeenCalledWith(
        "PhotoUploaded",
        "wedding-123",
        "Guest photo by Uncle Bob promoted to official gallery",
        { url: "https://cdn.example.com/bob.jpg" }
      );
    });
  });
});
