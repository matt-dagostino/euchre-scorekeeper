# Euchre Scorekeeper

A clean, fast, and friendly scorekeeper for Euchre. Built with React + Vite and Tailwind CSS, it focuses on clarity and speed so your game keeps moving.

## Highlights
- Simple setup: enter 4 player names in a 2×2 grid
- Pick the initial dealer right after starting
- Big, legible “Power Suit” selection with color-safe backgrounds
- Compact sticky scoreboard during rounds
- One-tap outcomes: `+1`, `+2` (euchre or sweep), `+4` (loner)
- Round history with inline edits and automatic recompute
- Clean end‑game stats: suit breakdown, calls, outcomes, final score
- Play Again vs New Game flows (keep or reset names)

## Quick Start
1. Install dependencies
	```bash
	npm install
	```
2. Run the dev server
	```bash
	npm run dev
	```
3. Open `http://localhost:5173` and start scoring.

## How It Works
- Setup: Enter player names (Blue team is players 1 & 3; Red team is players 2 & 4).
- Dealer: Tap the starting dealer in the 2×2 grid.
- Round: Select the trump suit, then record the outcome using `+1`, `+2`, or `+4`.
- History: Fix mistakes by editing past rounds; scores and stats recompute automatically.
- Finish: When a team reaches 10 points, view the final stats and choose Play Again or New Game.

## Tech Stack
- React (Vite)
- Tailwind CSS
- framer‑motion (animations)

## Project Structure
```
public/
src/
  App.jsx
  main.jsx
  index.css
index.html
``` 

## Attribution
Made by Matteo Dagostino

## Roadmap
- Optional: suit/caller edits in history, delete/undo entries
- Optional: accessibility improvements and color‑blind cues

