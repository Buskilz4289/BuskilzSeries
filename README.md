# BuskilzSeries

Tinder-style app for discovering TV series. Swipe right to add shows to your list, left to skip.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Where the data comes from

- **By default** the app uses the [TVmaze API](https://www.tvmaze.com/api) — no API key required. You get real TV series from the network as soon as you run the app.
- **Optional:** Add a [TMDB](https://www.themoviedb.org/settings/api) API key in `.env` as `VITE_TMDB_API_KEY=...` to use TMDB instead of TVmaze.

## Use

- **Swipe** cards left (nope) or right (like), or use the buttons.
- **Keyboard**: `←` skip, `→` like.
- **My List** shows everything you’ve liked; **Discover** brings you back to swiping.

Built with React, Vite, and Framer Motion.

## GitHub Pages

The app deploys to **https://buskilz4289.github.io/BuskilzSeries/** via GitHub Actions.

1. In the repo go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the “Deploy to GitHub Pages” workflow). The first run may need to be triggered from the **Actions** tab.
4. Open **https://buskilz4289.github.io/BuskilzSeries/** (no 404s).
