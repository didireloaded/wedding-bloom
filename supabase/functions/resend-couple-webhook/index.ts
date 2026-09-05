import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleResendWebhook } from "../_shared/resendWebhook.ts";

serve((req) => handleResendWebhook(req, "couple", "RESEND_COUPLE_WEBHOOK_SECRET"));
