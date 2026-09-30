# FREEzzzGames Live Monitor

The service does not store or proxy video. It checks registered YouTube channels and returns the current LIVE state plus the exact active video embed URL.

## Required Render environment variable

- `YOUTUBE_API_KEY` — YouTube Data API v3 key.

## Optional environment variables

- `STREAMER_REGISTRY` — JSON array of additional/overridden channel records.
- `ALLOW_ORIGIN` — allowed browser origin; defaults to `*`.
- `YOUTUBE_POLL_MS` — server polling interval in milliseconds; minimum/default is 300000 (5 minutes).

## How detection works

1. Resolve each registered YouTube channel to its uploads playlist.
2. Read the newest videos from that playlist.
3. Batch-check the video IDs with `videos.list`.
4. A channel is marked LIVE only when YouTube reports `liveBroadcastContent=live`, an `actualStartTime` exists, and `actualEndTime` is absent.
5. Only then is an iframe `embedUrl` returned to the frontend.

Temporary API errors keep the previous cache instead of inventing an online stream.

## Endpoints

- `GET /health`
- `GET /api/live`
- `GET /api/streamers`

The frontend reads `/api/live`.
