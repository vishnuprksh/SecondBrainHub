# FindYourSecondBrain

A community-driven directory of second brain and personal knowledge management apps. Discover, rate, and review tools like Obsidian, Notion, Logseq, and more.

**Live:** [findyoursecondbrain.web.app](https://findyoursecondbrain.web.app)

## Features

- **Browse & Search** — Discover second brain apps with search and category filters
- **Submit Apps** — Register new second brain tools for the community
- **Rate & Review** — Rate apps (1–5 stars) and leave comments
- **Google Auth** — Sign in with Google to submit, rate, and comment
- **Real-time Updates** — Powered by Firestore for instant data sync

## Tech Stack

- **React 18** + **Vite** — Fast development and builds
- **Tailwind CSS** — Utility-first styling
- **Firebase** — Auth, Firestore, and Hosting
- **react-router-dom** — Client-side routing
- **react-hot-toast** — Toast notifications

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm i -g firebase-tools`)

### Local Development
```bash
npm install
npm run dev
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```

## Firestore Structure

```
apps/ (collection)
  ├── {appId}
  │   ├── name, description, websiteUrl, logoUrl
  │   ├── category, pricing
  │   ├── ratingSum, ratingCount, commentCount
  │   ├── submittedBy, submittedByName, createdAt
  │   ├── ratings/ (subcollection)
  │   │   └── {userId} → { rating, userName, updatedAt }
  │   └── comments/ (subcollection)
  │       └── {commentId} → { text, userId, userName, userPhoto, createdAt }
```

## License

MIT