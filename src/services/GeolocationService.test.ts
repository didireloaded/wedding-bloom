import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeolocationService } from "./GeolocationService";

// Mock Supabase / Repository dependencies
vi.mock("@/repositories", () => {
  return {
    WeddingRepository: class {
      async findById(id: string) {
        if (id === "wedding-123") {
          return {
            data: {
              id: "wedding-123",
              couple_names: "Elena & Julian",
              ceremony_venue: "Villa Balbianello, Lake Como",
              venue_address: "Via Como 1, Italy"
            },
            error: null
          };
        }
        return { data: null, error: "Not found" };
      }
    },
    AccommodationRepository: class {
      async findByWeddingId(weddingId: string) {
        if (weddingId === "wedding-123") {
          return {
            data: [
              { id: "acc-1", name: "Grand Hotel Tremezzo", distance: "2.5", price: "$450/night", booking_url: "https://example.com" }
            ],
            error: null
          };
        }
        return { data: [], error: null };
      }
    },
    VenueMarkerRepository: class {
      async findByWeddingId(weddingId: string) {
        if (weddingId === "wedding-123") {
          return {
            data: [
              { id: "mark-1", title: "Ceremony Garden", category: "Ceremony", icon: "MapPin", description: "Lakeside lawn", x: 45.9872, y: 9.2621 }
            ],
            error: null
          };
        }
        return { data: [], error: null };
      }
    }
  };
});

describe("GeolocationService", () => {
  let service: GeolocationService;

  beforeEach(() => {
    service = new GeolocationService();
  });

  describe("calculateDistance", () => {
    it("calculates distance between two geographical coordinates accurately using Haversine formula", () => {
      // Distance between Paris (48.8566, 2.3522) and London (51.5074, -0.1278) is approx 344 km
      const paris = { lat: 48.8566, lng: 2.3522 };
      const london = { lat: 51.5074, lng: -0.1278 };

      const res = service.calculateDistance(paris, london);
      expect(res.km).toBeGreaterThan(340);
      expect(res.km).toBeLessThan(350);
      expect(res.miles).toBeGreaterThan(210);
      expect(res.miles).toBeLessThan(220);
    });

    it("returns 0 distance when coordinates are identical", () => {
      const coord = { lat: 40.7580, lng: -73.9855 };
      const res = service.calculateDistance(coord, coord);
      expect(res.km).toBe(0);
      expect(res.miles).toBe(0);
    });
  });

  describe("estimateTravelTime", () => {
    it("estimates driving and walking times based on distance", () => {
      // 20 km -> 30 min driving (40 km/h), 4 hours walking (5 km/h)
      const estimate = service.estimateTravelTime(20);
      expect(estimate.drivingMinutes).toBe(30);
      expect(estimate.walkingMinutes).toBe(240);
      expect(estimate.formattedDriving).toBe("30 min");
      expect(estimate.formattedWalking).toBe("4 h");
    });

    it("formats duration correctly when exceeding 60 minutes with remaining minutes", () => {
      // 50 km -> 75 min driving -> 1 h 15 min
      const estimate = service.estimateTravelTime(50);
      expect(estimate.drivingMinutes).toBe(75);
      expect(estimate.formattedDriving).toBe("1 h 15 min");
    });
  });

  describe("checkVIPGeofenceArrival", () => {
    const venue = { lat: 45.9872, lng: 9.2621 };

    it("returns 'arrived' status when guest is within the 100-meter radius", () => {
      // Very close coordinate (approx 30 meters away)
      const guest = { lat: 45.9874, lng: 9.2621 };
      const result = service.checkVIPGeofenceArrival(guest, venue, 100);

      expect(result.isWithinGeofence).toBe(true);
      expect(result.status).toBe("arrived");
      expect(result.distanceMeters).toBeLessThanOrEqual(100);
    });

    it("returns 'approaching' status when guest is outside 100m but within 10x radius (1km)", () => {
      // Approx 500 meters away
      const guest = { lat: 45.9917, lng: 9.2621 };
      const result = service.checkVIPGeofenceArrival(guest, venue, 100);

      expect(result.isWithinGeofence).toBe(false);
      expect(result.status).toBe("approaching");
    });

    it("returns 'en_route' status when guest is far away", () => {
      // Far away (several km)
      const guest = { lat: 46.1000, lng: 9.3000 };
      const result = service.checkVIPGeofenceArrival(guest, venue, 100);

      expect(result.isWithinGeofence).toBe(false);
      expect(result.status).toBe("en_route");
    });
  });

  describe("generateDirectionsUrl", () => {
    it("generates correct Google Maps directions URL for a string address", () => {
      const url = service.generateDirectionsUrl("Villa Balbianello, Italy");
      expect(url).toBe("https://www.google.com/maps/dir/?api=1&destination=Villa%20Balbianello%2C%20Italy");
    });

    it("generates correct Google Maps directions URL for geo coordinates", () => {
      const url = service.generateDirectionsUrl({ lat: 45.9872, lng: 9.2621 });
      expect(url).toBe("https://www.google.com/maps/dir/?api=1&destination=45.9872,9.2621");
    });
  });

  describe("getMultiPinMapData", () => {
    it("aggregates venue, accommodations, and markers for a valid wedding ID", async () => {
      const res = await service.getMultiPinMapData("wedding-123");
      expect(res.error).toBeNull();
      expect(res.data).toBeDefined();

      const mapData = res.data!;
      expect(mapData.weddingId).toBe("wedding-123");
      expect(mapData.venueName).toBe("Villa Balbianello, Lake Como");
      expect(mapData.venueCoords).toEqual({ lat: 45.9872, lng: 9.2621 }); // Derived from "como" / "italy"
      expect(mapData.accommodations).toHaveLength(1);
      expect(mapData.accommodations[0].name).toBe("Grand Hotel Tremezzo");
      expect(mapData.markers).toHaveLength(1);
      expect(mapData.markers[0].title).toBe("Ceremony Garden");
    });

    it("returns an error if wedding ID is not found", async () => {
      const res = await service.getMultiPinMapData("non-existent-id");
      expect(res.data).toBeNull();
      expect(res.error).toBe("Not found");
    });
  });
});
