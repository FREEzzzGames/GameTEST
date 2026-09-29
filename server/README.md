# FREEzzzGames Live Monitor

No video is stored or proxied. The service only checks approved YouTube channels and returns current LIVE status and metadata.

Required for YouTube monitoring:
- `YOUTUBE_API_KEY`
- `STREAMER_REGISTRY`
- `ALLOW_ORIGIN`

Optional:
- `STREAMER_REGISTRY`: JSON array of approved channel records.

Example:
```json
[
  {
    "id": "yt-demo",
    "platform": "youtube",
    "channelId": "UCxxxxxxxxxxxxxxxxxxxxxx",
    "name": "Streamer",
    "avatar": "🎮",
    "category": "Gaming"
  }
]
```

The service polls YouTube every 30 seconds.

Frontend endpoint: GET /api/live
