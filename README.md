# >_ AIR_WRITE.exe

Pinch your fingers in the air and write — it renders live on screen. Built as a proper
multi-file project (not a single dumped HTML file), with a hacker-terminal look and
animated UI.

**By Ayushi Shukla** | GSSoC 2026 Contributor
📧 [ayushishukla775@gmail.com](mailto:ayushishukla775@gmail.com) · 🐙 [github.com/ayushishuklaME](https://github.com/ayushishuklaME)

---

## ✨ Features

- **Real-time hand tracking** using TensorFlow.js's Handpose model — a genuine machine-learning
  model running on-device via WebGL, no backend needed.
- **Pinch** thumb + index finger together → pen down, draw a stroke.
- **Open hand** → pen up, move freely without drawing.
- **Fist** → instantly clears the whole canvas.
- 6 pen colors (cycle with the "Change Color" button), plus "Undo" for the last stroke.
- **Animated hacker/terminal UI**: neon-green glow, a scanning line sweeping the page,
  pulsing badges, a button ripple effect on click, and a pulsing "PEN_DOWN" indicator
  while you're actively writing.
- 100% client-side — your camera feed never leaves your browser.

## 📁 Folder Structure

```
air-write-js/
├── index.html          # Page structure & layout
├── css/
│   └── style.css       # All styling + CSS animations (glow, scanline, ripple, pulse)
├── js/
│   └── script.js       # Hand-tracking logic, drawing logic, UI interactions
└── README.md           # This file
```

Keeping HTML, CSS, and JS in separate files (instead of one giant file) makes the
project easier to read, easier to extend, and closer to how a real front-end project
is organised.

## 🚀 How to Run

1. Download / unzip this folder.
2. Open `index.html` directly in a modern browser (Chrome or Edge recommended — needs WebGL).
   - Or, for the most reliable camera permissions, serve it locally instead of using
     `file://` directly, e.g.:
     ```bash
     cd air-write-js
     python -m http.server 8000
     ```
     then open `http://localhost:8000` in your browser.
3. Click **Start Camera** and allow camera access.
4. Wait a moment for the TensorFlow.js model to load, then start pinching to write!

> The first load needs an internet connection to fetch TensorFlow.js and the Handpose
> model from a CDN. After that, your browser may cache it for faster reloads.

## 🎮 Controls

| Action                         | Effect                          |
|---------------------------------|----------------------------------|
| Pinch thumb + index finger      | Pen down — draws a stroke        |
| Open hand                       | Pen up — move without drawing    |
| Make a fist                     | Clears the entire canvas         |
| "Change Color" button           | Cycles to the next pen color     |
| "Undo" button                   | Removes the last stroke          |
| "Clear Canvas" button           | Wipes the canvas                 |
| "Stop Camera" button            | Turns off the webcam             |

## 🛠 Tech Stack

- **HTML5** — structure & the two-canvas drawing layer (ink layer + live cursor layer)
- **CSS3** — hacker-terminal theme, keyframe animations (glow pulse, scanline, ripple, badge float)
- **JavaScript (ES6+)** — hand-tracking loop, gesture detection, canvas drawing
- **TensorFlow.js** + `@tensorflow-models/handpose` — the underlying machine-learning model

## 🙋 About

Built by **Ayushi Shukla**, GSSoC 2026 Contributor.

- GitHub: [github.com/ayushishuklaME](https://github.com/ayushishuklaME)
- Email: [ayushishukla775@gmail.com](mailto:ayushishukla775@gmail.com)
