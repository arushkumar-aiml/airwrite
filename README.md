# ✍️ Air Write

Draw in the air with your finger — it appears live on the screen next to you.

**By Ayushi Shukla | GSSoC 2026 Contributor**

## What it does
- Tracks your hand in real time using Google MediaPipe (Hand Landmarker, 21 landmarks/frame)
- **Pinch** thumb + index finger together = pen down, and moving your hand writes on the canvas
- **Open hand** = pen up (move freely without drawing)
- **Fist** = clears the whole canvas
- "Change Color" cycles through 6 pen colors, "Undo" removes your last stroke
- 100% browser-based, no backend, your camera never leaves your device

## How to run
Just open `index.html` in a modern browser (Chrome/Edge recommended) and allow camera access.
No build step, no install — it's a single self-contained HTML file.

## Tech
JavaScript, HTML5 Canvas, MediaPipe Tasks Vision (Hand Landmarker)
