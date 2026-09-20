import { Link } from "react-router-dom";

const GuestPrivacyNote = ({ media = false }: { media?: boolean }) => (
  <p className="font-body text-[11px] leading-5 text-muted-foreground">
    Your details are shared with the couple to manage this wedding.
    {media ? " Photos and messages are reviewed before they become visible to other guests. " : " "}
    <Link className="font-semibold text-foreground underline underline-offset-2" to="/privacy">How your information is used</Link>
  </p>
);

export default GuestPrivacyNote;
