<div align="center">

# ⚡ CommitPulse

### _Your GitHub contributions — as a cinematic SVG monolith._

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://commitpulse.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?style=flat-square&logo=graphql)](https://graphql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

> **Drop this into your GitHub profile README and stop being boring.**

## 📖 Table of Contents

- [Live Demo](#live-demo)
- [Documentation Index](#documentation-index)
- [Contributing](#contributing)
- [License](#license)
- [Maintainers](#maintainers)
- [Themes](#themes)
- [Contributors](#contributors)

---

![CommitPulse Live Demo](https://commitpulse.vercel.app/api/streak?user=jhasourav07&theme=neon)

[![Join CommitPulse Discord](https://img.shields.io/badge/Join-CommitPulse%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/Cb73bS79j)

```md
![CommitPulse](https://commitpulse.vercel.app/api/streak?user=YOUR_USERNAME)
```

</div>

---

## 🔴 Live Demo

Transform your GitHub contribution history into a cinematic 3D monolith.

### ✨ Theme Showcase

<table align="center">
<tr>

<td align="center">

#### Default

<a href="https://commitpulse.vercel.app/api/streak?user=jhasourav07">
  <img 
    src="https://commitpulse.vercel.app/api/streak?user=jhasourav07" 
    width="600"
  />
</a>

</td>

<td align="center">

#### Neon

<a href="https://commitpulse.vercel.app/api/streak?user=jhasourav07&theme=neon">
  <img 
    src="https://commitpulse.vercel.app/api/streak?user=jhasourav07&theme=neon" 
    width="600"
  />
</a>

</td>

<td align="center">

#### Custom

<a href="https://commitpulse.vercel.app/api/streak?user=jhasourav07&bg=0a0a0a&accent=ff6b35&text=ffffff">
  <img 
    src="https://commitpulse.vercel.app/api/streak?user=jhasourav07&bg=0a0a0a&accent=ff6b35&text=ffffff" 
    width="600"
  />
</a>

</td>

</tr>
</table>

---

### 📋 Copy Examples

#### 🌑 Default

```md
![CommitPulse](https://commitpulse.vercel.app/api/streak?user=jhasourav07)
```

#### 🌟 Neon

```md
![CommitPulse](https://commitpulse.vercel.app/api/streak?user=jhasourav07&theme=neon)
```

#### 🔥 Custom

```md
![CommitPulse](https://commitpulse.vercel.app/api/streak?user=jhasourav07&bg=0a0a0a&accent=ff6b35&text=ffffff)
```

---

## 📚 Documentation Index

To keep this guide concise and easy to read, we have modularized our technical documentation. Click any of the links below to access detailed guides and resources:

- **[🎨 Customization Guide & Parameters](docs/customization.md)**: Explore the list of over 30 URL parameters including `theme`, `view` (e.g. `skyline` or `languages`), `radius`, `grace`, `tz`, `entrance`, `versus`, and layout dimensions to style your monolith.
- **[🏛️ Architecture & Design Philosophy](docs/architecture.md)**: Read about why we built isometric 3D monolith landscapes instead of flat meters, and check out our Next.js 16 Edge computing pipeline.
- **[🚀 Self-Hosting & Deployment](docs/self_hosting.md)**: Step-by-step instructions to clone, configure `.env.local` with GitHub Personal Access Tokens (PAT), set up MongoDB tracking, and deploy to Vercel with one click.
- **[🤖 Automated Contributor Workflow](docs/contributor_workflow.md)**: Overview of GSSoC contribution automation, self-claiming comments `/claim`, anti-hoarding rules, stale unassign scripts, and Gemini AI-powered semantic issue duplication check.
- **[🎯 Real-Time Accuracy & Caching](docs/accuracy.md)**: Deep dive into the "off-by-N contributions" problem and how CommitPulse solves it with UTC midnight CDN expiration and no-store GraphQL fetches.
- **[❓ FAQ & Troubleshooting](docs/faq.md)**: Answers to common questions regarding timezone overrides, private contribution visibility, GitHub API rate limits, and troubleshooting.

---

## 🎯 Real-Time Accuracy — The Contribution Count Problem

GitHub's contribution graph can return **different totals** depending on _when_ and _how_ you query it. We solved this at the infrastructure level.

### The Problem: Off-by-N Contributions

The GitHub GraphQL API calculates `totalContributions` and daily contribution windows using **UTC-based ISO 8601 timestamps**. A naive implementation that queries at any arbitrary time — without anchoring to UTC midnight boundaries — will produce counts that are _inconsistent_ between requests. This is the root cause of the classic "my card shows 378 but GitHub shows 385" discrepancy.

### The Solution: UTC Midnight Synchronization

CommitPulse uses a two-part fix:

**1. Cache invalidation anchored to UTC midnight (`utils/time.ts`)**

```typescript
export function getSecondsUntilUTCMidnight(): number {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}
```

The CDN cache TTL is set to expire at **exactly the next UTC midnight**, not at some fixed-interval offset. This guarantees that when GitHub's contribution window rolls over, our cache does too — simultaneously.

**2. No internal fetch caching (`lib/github.ts`)**

```typescript
const res = await fetch(GITHUB_API_URL, {
  cache: 'no-store', // Bypass Next.js's internal fetch cache
});
```

Caching is handled entirely at the HTTP response layer (`Cache-Control: s-maxage`), giving us surgical control over what gets cached and for how long — without stale data poisoning the GraphQL response.

**Result:** CommitPulse's contribution counts are always in sync with GitHub's actual UTC day boundaries.

---

## 🏗️ Architecture & Tech Stack

```
app/api/streak/route.ts       →  Next.js 16 Edge-compatible API Route
app/api/track-user/route.ts   →  User tracking API — records GitHub usernames to MongoDB
lib/github.ts                 →  GitHub GraphQL API client
lib/calculate.ts              →  Streak algorithm (current + longest + grace period)
lib/mongodb.ts                →  Cached MongoDB connection utility (serverless-safe)
lib/svg/generator.ts          →  3D Isometric SVG renderer + CSS animations
lib/svg/themes.ts             →  Prebuilt theme palette system
models/User.ts                →  Mongoose User schema
utils/time.ts                 →  UTC midnight synchronization utilities
types/index.ts                →  TypeScript interfaces (StreakStats, BadgeParams, BadgeTheme)
```

| Layer           | Technology                               | Purpose                                                            |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| **Framework**   | Next.js 16 (App Router)                  | API routes, edge deployment                                        |
| **Language**    | TypeScript 5                             | Type-safe parameters and interfaces                                |
| **Data Source** | GitHub GraphQL API v4                    | `contributionsCollection` query                                    |
| **Database**    | MongoDB + Mongoose                       | Tracks GitHub usernames of users who generate a monolith           |
| **Rendering**   | Pure SVG + SVG Filters                   | `<feGaussianBlur>` for the glow effect                             |
| **Animation**   | SVG `<animate>`                          | Radar scan line + current-day block pulsing, no external libraries |
| **Typography**  | Google Fonts (Syncopate + Space Grotesk) | Loaded inline via `@import`                                        |
| **Deployment**  | Vercel Edge Network                      | Auto-scaling, global CDN                                           |
| **Caching**     | `Cache-Control: s-maxage`                | UTC-midnight-synced cache invalidation                             |

---

🏗️ Architecture Diagram

```
GitHub GraphQL API
↓
Contribution Processing
↓
Streak Calculation Engine
↓
SVG Geometry Renderer
↓
Animation Layer
↓
Edge Cache/CDN
↓
Generated SVG Badge
```

---

## 🚀 Self-Hosting in 4 Steps

```bash
# 1. Clone the repository
git clone https://github.com/JhaSourav07/commitpulse.git && cd commitpulse

# 2. Install dependencies
npm install

# 3. Create your environment file
cat > .env.local << 'EOF'
GITHUB_TOKEN=your_github_pat_here

# Optional — enables user tracking (see below)
# MONGODB_URI=mongodb+srv://...
EOF

# 4. Start the development server
npm run dev
```

> **📌 Token Scope:** Your GitHub Personal Access Token needs the `read:user` scope only. No write permissions required.

Then visit: `http://localhost:3000/api/streak?user=YOUR_USERNAME`

### Optional: MongoDB User Tracking

CommitPulse records the GitHub username of everyone who generates a monolith from the landing page into a MongoDB collection. This is **entirely optional for local development** — the app works perfectly without it.

If `MONGODB_URI` is not set, the `/api/track-user` endpoint will log a warning and skip the database write gracefully:

```
WARN: MONGODB_URI is not set. Bypassing user tracking for local development.
```

To enable tracking locally, add your connection string to `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/commitpulse
```

For production (Vercel), add `MONGODB_URI` to your project's **Environment Variables** settings.

---

## 🌐 Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JhaSourav07/commitpulse&env=GITHUB_PAT&envDescription=GitHub%20Personal%20Access%20Token%20with%20read%3Auser%20scope)

Set the `GITHUB_PAT` environment variable in your Vercel project settings, and you're live.

---

## 🤖 Automated Contributor Workflow

CommitPulse features a fully custom, GitHub Actions-powered **Issue Management System** designed for large open-source events like GSSoC.

We built an anti-hoarding, self-service automation layer right into the repository:

- **Structured Issue Templates:** We use specific templates for Bug Reports and Feature Requests to maintain high quality and clarity.
- **Self-Claiming:** Issue authors can grab their issues instantly by commenting `/claim` (only the author of the issue can claim it, unless it was authored by `jhasourav07`, in which case anyone can claim it).
- **Fair Play:** A strict one-active-issue-per-contributor rule prevents issue hoarding.
- **Stale Expiry:** A scheduled chron job automatically unassigns inactive contributors after 2 days.
- **Self-Service Labels:** Anyone can tag issues using `/addlabel <tag>`.
- **Semantic Duplicate Detection:** An AI-powered duplicate detector automatically scans open issues using the Google Gemini API (`gemini-embedding-001`) to generate vector embeddings. It calculates cosine similarity and flags potential duplicate issues with a comment and a `possible-duplicate` label.

This ensures maintainers aren't bottlenecks and the community moves incredibly fast.

---

## ❓ FAQ

### Why does my contribution count differ from GitHub?

GitHub calculates contribution data using UTC timestamps. CommitPulse syncs cache invalidation with UTC midnight to ensure consistent results.

### Why are my latest commits not visible immediately?

Data is cached for performance. Use `&refresh=true` to force fresh data.

### Can I use my local timezone?

Yes. Use the `tz` parameter with any valid IANA timezone.

Example:
`?tz=Asia/Kolkata`

### Can I configure the grace period?

Yes. Use the `grace` parameter to control how many days of inactivity are forgiven before your streak resets:

- `?grace=0` — strict mode, resets on any missed day
- `?grace=1` — default behavior (1 day grace)
- `?grace=2` — lenient, forgives up to 2 consecutive missed days

Valid range is 0–7. Values outside this range are clamped automatically.

### Do private contributions count?

Yes — if private contributions visibility is enabled in your GitHub settings.

### Are there GitHub API rate limits?

Yes. CommitPulse minimizes API usage via caching and optimized GraphQL queries, but if you hit the GitHub API rate limit (typically 5,000 requests per hour for authenticated users), you might see errors or missing data.

#### Troubleshooting Rate Limit Errors

1. **Wait it out:** Rate limits automatically reset every hour.
2. **Provide your own PAT:** If self-hosting, ensure you've provided a valid `GITHUB_TOKEN` in `.env.local` to get the authenticated rate limit.
3. **Avoid aggressive bypassing:** Avoid repeatedly using the `&refresh=true` parameter, which bypasses the cache and consumes API quota on every load.
4. **Check GitHub API Status:** Occasionally, GitHub's GraphQL API itself experiences degradation. Check [githubstatus.com](https://www.githubstatus.com/).

---

## 🤝 Contributing

CommitPulse is an open project built for the Web3 and open-source community. Whether you want to design a new theme, refine the isometric geometry, or improve timezone edge cases — you are welcome here.

Read the full guide: **[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## 📄 License

MIT © [Sourav Jha](https://github.com/JhaSourav07)

---

## 👥 Maintainers

- **Sourav Jha** ([@jhasourav07](https://github.com/jhasourav07)) - [LinkedIn](https://linkedin.com/in/souravjhahind)
- **Aamod Kumar** ([@Aamod007](https://github.com/Aamod007)) - [LinkedIn](https://linkedin.com/in/aamod-kumar/)

For details on the project leads and roles, please see [MAINTAINER.md](MAINTAINER.md).

---

## 🎨 Themes

Browse theme previews here: [Theme Gallery](THEMES.md)

---

  <div align="center">

_Built with obsession, shipped with precision._

⭐ **If CommitPulse made your profile look elite, drop a star.** ⭐

### This project is an official participant in GSSoC 2026.

  </div>

---

## 💖 Contributors

Thanks to all contributors who have helped make CommitPulse better!

  <a href="https://github.com/JhaSourav07/commitpulse/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=JhaSourav07/commitpulse&max=300&columns=14" alt="Contributors" />
  </a>

<sub>View the [full contributor list →](https://github.com/JhaSourav07/commitpulse/graphs/contributors)</sub>
