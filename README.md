# ForeverVow / Wedding Bloom

## Native Web Push

The browser only needs the public VAPID key as `VITE_VAPID_PUBLIC_KEY`. Configure `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `NOTIFICATION_ENGINE_SECRET` as Supabase Edge Function secrets. Never place the private key in `.env`, `VITE_*`, the service worker, or Git. Invoke `process-notifications` from a protected Supabase Cron job using the engine secret.

Resend delivery webhooks are handled by the public `resend-admin-webhook` and `resend-couple-webhook` Edge Functions. Configure `RESEND_ADMIN_WEBHOOK_SECRET` and `RESEND_COUPLE_WEBHOOK_SECRET` as Supabase Edge Function secrets; never expose either signing secret through a `VITE_*` variable. Both handlers verify the raw signed request, deduplicate it with the `svix-id`, and store the verified event in `resend_webhook_events`.

## How can I edit this code?

Work in the existing repository with Codex or your preferred IDE. Keep changes scoped and preserve working guest, couple, and admin flows.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

The public PWA is deployed through ChatGPT Sites. Supabase provides authentication, database, storage, realtime, and Edge Functions.
