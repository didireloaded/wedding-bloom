import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleResendWebhook } from "../_shared/resendWebhook.ts";

serve((req) => handleResendWebhook(req, "admin", "RESEND_ADMIN_WEBHOOK_SECRET"));
