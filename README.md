# Fadeaway Tic-Tac-Toe 🎮

A modern, real-time multiplayer twist on the classic game of Tic-Tac-Toe. 

Instead of ending in a draw, this game features an **Infinite / Fadeaway mechanic**: Each player can only have a maximum of 3 marks on the board at a time. When you place your 4th mark, your oldest mark disappears! 

## ✨ Features

- **Infinite Gameplay Mechanics:** Play strategically knowing that pieces vanish in the order they were placed.
- **Real-Time Multiplayer:** Built on top of Supabase Realtime (WebSockets) to play instantly with friends via a shareable room link.
- **Network Resilience:** Includes an intelligent 1.5-second polling fallback in case strict networks or proxies block WebSocket connections.
- **Seamless Rematches:** Hit "Play Again" to wipe the board and start a new match immediately without needing to generate or share a new room URL!
- **Clear Match Feedback:** Distinct win/loss states for both players at the end of every round. 

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL, Realtime subscriptions)
- **Deployment:** Vercel

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/fadeaway-tic-tac-toe.git
cd fadeaway-tic-tac-toe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add your Supabase credentials. DO NOT commit this file.

```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_TARGET_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
```

### 4. Run the development server
```bash
npm run dev
```

Open up your browser to the local URL provided (usually `http://localhost:8080` or `http://localhost:5173`) to start playing.

## ☁️ Deployment

This project is configured to be easily deployed to [Vercel](https://vercel.com/). 
1. Import the repository into your Vercel dashboard.
2. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.) in the Vercel project settings.
3. Deploy!
