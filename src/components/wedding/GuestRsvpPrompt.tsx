type GuestRsvpPromptProps = {
  onRsvp: () => void;
};

export default function GuestRsvpPrompt({ onRsvp }: GuestRsvpPromptProps) {
  return (
    <div className="guest-form-panel mx-auto max-w-lg text-center">
      <h3 className="font-body text-lg font-semibold">Respond before sharing</h3>
      <p className="mt-3 font-body text-sm text-muted-foreground">
        Send your RSVP first. It gives you a private guest session for messages and photos.
      </p>
      <button
        type="button"
        onClick={onRsvp}
        className="mt-6 min-h-11 rounded-full bg-foreground px-6 font-body text-sm font-semibold text-background"
      >
        Go to RSVP
      </button>
    </div>
  );
}
