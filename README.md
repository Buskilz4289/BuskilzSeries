# BuskilzSeries

Tinder-style app for discovering TV series. Swipe right to add shows to your list, left to skip.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### TMDB API key (required for discovery feed)

The app fetches real TV series from [The Movie Database (TMDB)](https://www.themoviedb.org/).

1. Get a free API key at [TMDB Settings → API](https://www.themoviedb.org/settings/api).
2. Copy `.env.example` to `.env` and set your key:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and set `VITE_TMDB_API_KEY=your_key_here`.
4. Restart the dev server.

## Use

- **Swipe** cards left (nope) or right (like), or use the buttons.
- **Keyboard**: `←` skip, `→` like.
- **My List** shows everything you’ve liked; **Discover** brings you back to swiping.

Built with React, Vite, and Framer Motion.
