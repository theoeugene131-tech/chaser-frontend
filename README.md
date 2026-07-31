# Chaser — frontend

The real, deployable dashboard — same design you've seen in Claude, now a
proper Vite + React project you can host at a permanent URL and hand to
clients.

## Deploy to Vercel (recommended — simplest option)

Vercel is built specifically for frontend apps like this one — it auto-detects
Vite projects, no configuration needed.

1. Unzip this folder.
2. Go to [vercel.com](https://vercel.com), sign up/log in (GitHub login is easiest).
3. Click **Add New → Project**.
4. Since this isn't in GitHub yet, use the **"Deploy"** button's drag-and-drop
   option, or push this folder to a new GitHub repo first (same process as
   the backend — GitHub Desktop → Publish repository) and import it from there.
5. Vercel detects it's a Vite app automatically. Click **Deploy**.
6. In ~30 seconds you'll get a live URL like `chaser-frontend.vercel.app`.

That's it — no build command to configure, no environment variables needed
for the frontend itself (the backend URL is entered by whoever logs into the
app, right on the login screen).

## Running it locally first (optional, to double check before deploying)

```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`.

## Connecting it to your backend

Once deployed, open your new Vercel URL. On the login screen, enter your
Railway backend's URL (e.g. `https://chaser-backend-production.up.railway.app`)
as the "API base URL", then log in with a real account (or the seeded demo
login) to see live data.

## Giving this to a client

Once deployed, you have a permanent link (e.g. `https://chaser.vercel.app`)
you can send to anyone — no login to your own accounts needed on their end,
they just need their own login credentials for their own org's data.

Optional next step: connect a custom domain (e.g. `app.yourcompany.com`) —
Vercel's dashboard has a **Domains** tab under project settings for this,
it's a few clicks once you own the domain name.
