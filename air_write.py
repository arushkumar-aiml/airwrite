"""
Air Write - Python Edition
---------------------------
Real hand tracking (your actual hand, not a cartoon character) using
OpenCV + MediaPipe (via cvzone). Pinch your thumb and index finger
together in the air to draw directly on your live camera feed.

By Ayushi Shukla | GSSoC 2026 Contributor

Controls
--------
  Pinch (thumb + index finger together) : Pen down / draw
  Open hand                             : Pen up (move without drawing)
  Fist                                  : Clear the whole canvas
  Keyboard 'c'                          : Change pen color
  Keyboard 'r'                          : Clear canvas
  Keyboard 's'                          : Save the current drawing as a PNG
  Keyboard 'q' or ESC                   : Quit
"""

import os
import time

import cv2
import numpy as np
from cvzone.HandTrackingModule import HandDetector

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CAM_WIDTH, CAM_HEIGHT = 1280, 720
PINCH_THRESHOLD = 40            # pixels: distance between thumb tip & index tip counted as a "pinch"
FIST_CONFIDENCE = 0.8
BRUSH_THICKNESS = 8
SAVE_DIR = "saved_drawings"

# BGR colors (OpenCV uses BGR, not RGB)
COLORS = [
    (65, 255, 0),     # green
    (0, 0, 255),      # red
    (255, 167, 59),   # blue
    (10, 214, 255),   # yellow
    (255, 255, 255),  # white
]


def overlay_canvas_on_frame(frame, canvas):
    """Merge the persistent ink canvas onto the live camera frame."""
    gray_canvas = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)
    _, inv_mask = cv2.threshold(gray_canvas, 20, 255, cv2.THRESH_BINARY_INV)
    inv_mask = cv2.cvtColor(inv_mask, cv2.COLOR_GRAY2BGR)
    frame = cv2.bitwise_and(frame, inv_mask)
    frame = cv2.bitwise_or(frame, canvas)
    return frame


def draw_color_palette(frame, color_index):
    """Draw small color-swatch boxes at the bottom-left so you can see the active color."""
    for i, color in enumerate(COLORS):
        x0 = 20 + i * 60
        y0 = CAM_HEIGHT - 70
        cv2.rectangle(frame, (x0, y0), (x0 + 50, y0 + 50), color, cv2.FILLED)
        if i == color_index:
            cv2.rectangle(frame, (x0, y0), (x0 + 50, y0 + 50), (255, 255, 255), 3)
    return frame


def main():
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAM_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAM_HEIGHT)

    detector = HandDetector(detectionCon=FIST_CONFIDENCE, maxHands=1)

    os.makedirs(SAVE_DIR, exist_ok=True)

    canvas = None
    color_index = 0
    prev_point = None
    is_drawing = False
    was_fist = False
    prev_time = 0.0

    print("Air Write (Python) is running.")
    print("Pinch thumb + index finger to draw. Make a fist to clear. Press 'q' to quit.")

    while True:
        success, frame = cap.read()
        if not success:
            print("Could not read from webcam. Exiting.")
            break

        frame = cv2.flip(frame, 1)  # mirror, feels natural

        if canvas is None:
            canvas = np.zeros_like(frame)

        # findHands draws the REAL hand skeleton (landmarks + connections)
        # directly on your actual camera feed -- this is genuine tracking,
        # not a stylised cartoon overlay.
        hands, frame = detector.findHands(frame, draw=True)

        if hands:
            hand = hands[0]
            lm_list = hand["lmList"]              # 21 landmarks, each [x, y, z]
            fingers = detector.fingersUp(hand)     # [thumb, index, middle, ring, pinky]

            index_tip = lm_list[8][:2]
            thumb_tip = lm_list[4][:2]

            distance, _, frame = detector.findDistance(
                index_tip, thumb_tip, frame, color=(255, 0, 255)
            )

            is_fist = fingers == [0, 0, 0, 0, 0]

            if is_fist and not was_fist:
                canvas = np.zeros_like(frame)
                print("Fist detected -> canvas cleared")
            was_fist = is_fist

            pinching = distance < PINCH_THRESHOLD

            if pinching and not is_fist:
                if prev_point is None:
                    prev_point = index_tip
                cv2.line(canvas, prev_point, index_tip, COLORS[color_index], BRUSH_THICKNESS)
                prev_point = index_tip
                is_drawing = True
            else:
                prev_point = None
                is_drawing = False

            cv2.circle(
                frame,
                index_tip,
                12,
                COLORS[color_index] if pinching else (200, 200, 200),
                cv2.FILLED,
            )
        else:
            prev_point = None
            is_drawing = False

        frame = overlay_canvas_on_frame(frame, canvas)

        # FPS counter
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time) if prev_time else 0
        prev_time = curr_time
        cv2.putText(frame, f"FPS: {int(fps)}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(
            frame,
            f"PEN: {'DOWN' if is_drawing else 'UP'}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0) if is_drawing else (0, 0, 255),
            2,
        )

        frame = draw_color_palette(frame, color_index)

        cv2.imshow("Air Write - by Ayushi Shukla", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("q") or key == 27:  # 'q' or ESC
            break
        elif key == ord("c"):
            color_index = (color_index + 1) % len(COLORS)
        elif key == ord("r"):
            canvas = np.zeros_like(frame)
        elif key == ord("s"):
            filename = os.path.join(SAVE_DIR, f"air_write_{int(time.time())}.png")
            cv2.imwrite(filename, canvas)
            print(f"Saved drawing: {filename}")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
