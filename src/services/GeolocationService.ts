import { WeddingRepository, AccommodationRepository, VenueMarkerRepository } from "@/repositories";
import type { Wedding, Accommodation, VenueMarker } from "@/types/wedding";

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface TravelTimeEstimate {
  drivingMinutes: number;
  walkingMinutes: number;
  formattedDriving: string;
  formattedWalking: string;
}

export interface MultiPinMapData {
  weddingId: string;
  venueName: string;
  venueAddress: string | null;
  venueCoords: GeoCoordinates | null;
  accommodations: Array<{
    id: string;
    name: string;
    distance: string | null;
    price: string | null;
    bookingUrl: string | null;
    directionsUrl: string;
  }>;
  markers: Array<{
    id: string;
    title: string;
    category: string;
    icon: string;
    description: string | null;
    x: number;
    y: number;
  }>;
}

export interface GeofenceResult {
  isWithinGeofence: boolean;
  distanceMeters: number;
  distanceKm: number;
  status: "arrived" | "approaching" | "en_route";
}

export class GeolocationService {
  /**
   * Calculate distance between two coordinates using the Haversine formula
   * @returns distance in kilometers and miles
   */
  calculateDistance(coord1: GeoCoordinates, coord2: GeoCoordinates): { km: number; miles: number } {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLon = this.toRad(coord2.lng - coord1.lng);
    const lat1 = this.toRad(coord1.lat);
    const lat2 = this.toRad(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    const miles = km * 0.621371;
    return {
      km: Math.round(km * 100) / 100,
      miles: Math.round(miles * 100) / 100
    };
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Estimate travel time for driving and walking
   * Assumes average urban/suburban driving speed of 40 km/h and walking speed of 5 km/h
   */
  estimateTravelTime(distanceKm: number): TravelTimeEstimate {
    const drivingHours = distanceKm / 40;
    const walkingHours = distanceKm / 5;

    const drivingMinutes = Math.max(1, Math.round(drivingHours * 60));
    const walkingMinutes = Math.max(1, Math.round(walkingHours * 60));

    const formatDuration = (mins: number) => {
      if (mins < 60) return `${mins} min`;
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return rem > 0 ? `${hrs} h ${rem} min` : `${hrs} h`;
    };

    return {
      drivingMinutes,
      walkingMinutes,
      formattedDriving: formatDuration(drivingMinutes),
      formattedWalking: formatDuration(walkingMinutes)
    };
  }

  /**
   * Check if a VIP guest or vendor has entered the arrival geofence (default 100 meters)
   */
  checkVIPGeofenceArrival(guestCoords: GeoCoordinates, venueCoords: GeoCoordinates, radiusMeters = 100): GeofenceResult {
    const { km } = this.calculateDistance(guestCoords, venueCoords);
    const distanceMeters = Math.round(km * 1000);
    const isWithinGeofence = distanceMeters <= radiusMeters;

    let status: "arrived" | "approaching" | "en_route" = "en_route";
    if (isWithinGeofence) {
      status = "arrived";
    } else if (distanceMeters <= radiusMeters * 10) { // Within 10x radius (e.g. 1km)
      status = "approaching";
    }

    return {
      isWithinGeofence,
      distanceMeters,
      distanceKm: km,
      status
    };
  }

  /**
   * Generate universal navigation URL for Google Maps / Apple Maps
   */
  generateDirectionsUrl(destination: string | GeoCoordinates): string {
    if (typeof destination === "string") {
      const encoded = encodeURIComponent(destination);
      return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
  }

  /**
   * Aggregate multi-pin map dataset for a wedding
   */
  async getMultiPinMapData(weddingId: string): Promise<{ data: MultiPinMapData | null; error: string | null }> {
    try {
      const weddingRepo = new WeddingRepository();
      const accommodationRepo = new AccommodationRepository();
      const markerRepo = new VenueMarkerRepository();

      const [wRes, aRes, mRes] = await Promise.all([
        weddingRepo.findById(weddingId),
        accommodationRepo.findByWeddingId(weddingId),
        markerRepo.findByWeddingId(weddingId)
      ]);

      if (wRes.error || !wRes.data) {
        return { data: null, error: wRes.error || "Wedding not found" };
      }

      const wedding = wRes.data;
      const venueName = wedding.ceremony_venue || "Main Celebration Venue";
      const venueAddress = wedding.venue_address || wedding.ceremony_venue || null;
      
      // Derive approximate coordinates if not explicitly mapped
      const venueCoords = this.deriveCoordinatesFromLocation(venueAddress || venueName);

      const accommodations = (aRes.data || []).map((acc) => ({
        id: acc.id,
        name: acc.name,
        distance: acc.distance,
        price: acc.price,
        bookingUrl: acc.booking_url,
        directionsUrl: this.generateDirectionsUrl(`${acc.name} ${venueAddress || ""}`.trim())
      }));

      const markers = (mRes.data || []).map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category || "General",
        icon: m.icon || "MapPin",
        description: m.description,
        x: m.x,
        y: m.y
      }));

      return {
        data: {
          weddingId,
          venueName,
          venueAddress,
          venueCoords,
          accommodations,
          markers
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err?.message || "Failed to aggregate map data" };
    }
  }

  private deriveCoordinatesFromLocation(location: string): GeoCoordinates {
    const loc = location.toLowerCase();
    if (loc.includes("como") || loc.includes("italy")) return { lat: 45.9872, lng: 9.2621 };
    if (loc.includes("napa") || loc.includes("california")) return { lat: 38.5025, lng: -122.2654 };
    if (loc.includes("york") || loc.includes("manhattan")) return { lat: 40.7580, lng: -73.9855 };
    if (loc.includes("paris") || loc.includes("france")) return { lat: 48.8566, lng: 2.3522 };
    if (loc.includes("london") || loc.includes("uk")) return { lat: 51.5074, lng: -0.1278 };
    if (loc.includes("sydney") || loc.includes("australia")) return { lat: -33.8688, lng: 151.2093 };
    // Default fallback (scenic Villa sanctuary)
    return { lat: 43.7696, lng: 11.2558 }; // Florence, Italy
  }
}
