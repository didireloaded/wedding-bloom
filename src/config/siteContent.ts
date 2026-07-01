export interface TimelineEventConfig {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description: string;
}

export interface TravelOptionConfig {
  id: string;
  category: string;
  title: string;
  description: string;
  iconType: "plane" | "train" | "car";
}

export interface SiteContentConfig {
  coupleNames: string;
  weddingDateISO: string;
  weddingDateFormatted: string;
  hero: {
    label: string;
    legacyLabel: string;
    countdownTitle: string;
    countdownFallbackText: string;
  };
  story: {
    label: string;
    headingPrefix: string;
    headingHighlight: string;
  };
  timeline: {
    label: string;
    heading: string;
    defaultEvents: TimelineEventConfig[];
  };
  venue: {
    label: string;
    heading: string;
    subheading: string;
    primarySettingLabel: string;
    defaultCeremonyVenue: string;
    defaultVenueAddress: string;
    promptlyPrefix: string;
    travelLogisticsLabel: string;
    gettingThereHeading: string;
    travelOptions: TravelOptionConfig[];
    estateBlueprintLabel: string;
    interactiveGroundMapHeading: string;
    hospitalityLabel: string;
    accommodationsHeading: string;
    accommodationsSubheading: string;
    rateLabel: string;
    reserveRoomText: string;
    contactConciergeText: string;
  };
  rsvp: {
    label: string;
    heading: string;
    deadlineText: string;
  };
  registry: {
    label: string;
    heading: string;
    description: string;
  };
  footer: {
    brandName: string;
    homeLinkText: string;
    contactLinkText: string;
    venueCheckinLinkText: string;
  };
}

export const siteContent: SiteContentConfig = {
  coupleNames: "Didier & Reloaded",
  weddingDateISO: "2026-10-18T16:00:00",
  weddingDateFormatted: "18 OCTOBER 2026",
  hero: {
    label: "We Invite You To Celebrate",
    legacyLabel: "A Day In Our Hearts",
    countdownTitle: "Countdown To Our Vows",
    countdownFallbackText: "The Celebration Is Here",
  },
  story: {
    label: "Our Journey",
    headingPrefix: "How Our Path ",
    headingHighlight: "Unfolded",
  },
  timeline: {
    label: "Weekend Schedule",
    heading: "The Order of Celebration",
    defaultEvents: [
      {
        id: "evt-1",
        title: "Welcome Soirée & Cocktails",
        event_date: "2026-10-17",
        event_time: "17:30",
        location: "Château Gardens Terrace",
        description: "Join us under the stars for signature botanical cocktails, artisanal hors d'oeuvres, and acoustic jazz to kick off our wedding weekend."
      },
      {
        id: "evt-2",
        title: "The Ceremony of Vows",
        event_date: "2026-10-18",
        event_time: "16:00",
        location: "Grand Orangerie Lawn",
        description: "Please take your seats by 3:45 PM as we exchange our eternal promises surrounded by the historic forest and rolling hills."
      },
      {
        id: "evt-3",
        title: "Champagne Reception",
        event_date: "2026-10-18",
        event_time: "17:15",
        location: "Cour d'Honneur",
        description: "Raise a crystal coupe to the newlyweds with vintage French champagne, caviar tastings, and live string quartet melodies."
      },
      {
        id: "evt-4",
        title: "Royal Banquet & Revelry",
        event_date: "2026-10-18",
        event_time: "19:00",
        location: "Grand Ballroom",
        description: "An exquisite multi-course culinary journey followed by cake cutting, first dances, and late-night celebration."
      }
    ]
  },
  venue: {
    label: "Destination Guide",
    heading: "Venue & Stay",
    subheading: "Everything you need to navigate arrival, transportation, and lodging for our celebration weekend.",
    primarySettingLabel: "Primary Setting",
    defaultCeremonyVenue: "Château de Chambord",
    defaultVenueAddress: "Château, 41250 Chambord, France",
    promptlyPrefix: "Promptly at ",
    travelLogisticsLabel: "Travel Logistics",
    gettingThereHeading: "Getting There",
    travelOptions: [
      {
        id: "trv-1",
        category: "Nearest Airports",
        title: "Paris CDG & Orly (ORY)",
        description: "Primary international gateways. We recommend booking arrivals at least 24 hours prior to festivities.",
        iconType: "plane"
      },
      {
        id: "trv-2",
        category: "Express TGV Rail",
        title: "TGV to Tours / Blois",
        description: "Direct high-speed rail runs from central Paris (Montparnasse / Austerlitz) to local stations in under 1.5 hours.",
        iconType: "train"
      },
      {
        id: "trv-3",
        category: "Local Shuttles",
        title: "Private Transfer & Rental",
        description: "Scheduled guest shuttles connect rail depots to château lodgings. Car rentals available at airport & rail hubs.",
        iconType: "car"
      }
    ],
    estateBlueprintLabel: "Estate Blueprint",
    interactiveGroundMapHeading: "Interactive Ground Map",
    hospitalityLabel: "Hospitality & Lodging",
    accommodationsHeading: "Recommended Accommodations",
    accommodationsSubheading: "For guests not staying directly on property, we have curated these nearby boutique options.",
    rateLabel: "Rate:",
    reserveRoomText: "Reserve Room",
    contactConciergeText: "Contact Concierge for Booking",
  },
  rsvp: {
    label: "RSVP Verification",
    heading: "Will You Join Us?",
    deadlineText: "Kindly reply by October 14, 2026.",
  },
  registry: {
    label: "Gifts & Registry",
    heading: "Your Presence Is Our Cherished Gift",
    description: "If you wish to commemorate our special weekend with a gift, contributions towards our future adventures are deeply appreciated.",
  },
  footer: {
    brandName: "ForeverVow",
    homeLinkText: "Home",
    contactLinkText: "Contact Assistant",
    venueCheckinLinkText: "Venue Check-in",
  }
};
