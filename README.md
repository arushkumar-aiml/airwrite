# ✍️ Air Write — Python Edition

Real hand tracking. Your actual hand, your actual camera feed — no browser, no cartoon
character standing in for you. Pinch your fingers in the air and watch the stroke appear
live on your own video, drawn straight onto your webcam feed.

**By Ayushi Shukla | GSSoC 2026 Contributor**

## Why this version
The earlier browser build depended on loading a machine-learning model from a CDN
(TensorFlow.js / MediaPipe over the internet), which could fail to load depending on
network or browser. This version runs entirely **locally in Python** using OpenCV and
Google's MediaPipe hand-tracking model (wrapped by `cvzone`) — no browser, no CDN,
no internet dependency once installed. It draws the **real, live hand skeleton** on your
actual camera image, so what you see is genuine tracking of your hand, not a stylised
robot or character.

## Features
- Real-time hand landmark tracking (21 points) drawn directly on your live camera feed
- **Pinch** thumb + index finger together = pen down, draw in the air
- **Open hand** = pen up (move without drawing)
- **Fist** = instantly clears the whole canvas
- 5 pen colors, cycle with the `c` key
- Save your drawing as a PNG any time with the `s` key
- Live FPS counter and pen-state indicator on screen

## Setup

1. Make sure you have **Python 3.8+** installed.
2. (Recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate      # on Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run it

```bash
python air_write.py
```

A window will open showing your webcam feed. Allow camera access if your OS prompts you.

## Controls

| Action                              | Effect                          |
|--------------------------------------|----------------------------------|
| Pinch thumb + index finger           | Pen down — draws a stroke        |
| Open hand                            | Pen up — move without drawing    |
| Make a fist                          | Clears the entire canvas         |
| `c` key                              | Cycle to the next pen color      |
| `r` key                              | Clear canvas (same as fist)      |
| `s` key                              | Save the current drawing as PNG  |
| `q` key or `ESC`                     | Quit the app                     |

Saved drawings are written to the `saved_drawings/` folder (created automatically).

## Tech stack
- **Python 3**
- **OpenCV** (`opencv-python`) — camera capture, drawing, and image compositing
- **MediaPipe** — the underlying hand-tracking ML model
- **cvzone** — a thin, convenient wrapper around MediaPipe's hand tracking
- **NumPy** — canvas / array operations

## Troubleshooting
- **Camera doesn't open**: make sure no other app is using the webcam, and that your OS
  has granted the terminal/IDE camera permission.
- **Low FPS**: try closing other heavy applications, or lower `CAM_WIDTH`/`CAM_HEIGHT`
  at the top of `air_write.py` (e.g. to 640x480).
- **Hand not detected**: improve lighting and keep your hand fully inside the frame.
