import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Existing QR codes point here. Forward them to the single secured check-in
// flow embedded in the guest wedding page instead of maintaining two forms.
const WeddingCheckin = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) navigate(`/wedding/${slug}#checkin`, { replace: true });
  }, [navigate, slug]);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border border-wedding-gold/30 border-t-wedding-gold" />
    </div>
  );
};

export default WeddingCheckin;
