import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Update this path to your Tesseract-OCR installation if needed
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def detect_arrow(image_bytes):
    """
    Simulated arrow detection using basic image processing.
    We look for specific contours or color signatures.
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return False

    # Logic: Look for red colored arrows (Hue range for red)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Red has two ranges in HSV
    lower_red1 = np.array([0, 100, 100])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 100, 100])
    upper_red2 = np.array([180, 255, 255])
    
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask = cv2.bitwise_or(mask1, mask2)
    
    # OR: Just look for any significant arrow-like shapes if no specific color
    # For this mock, we'll check if there's a significant amount of "red" or specific shapes
    red_pixel_count = cv2.countNonZero(mask)
    
    # If red is found (e.g. > 100 pixels), assume it's an arrow
    if red_pixel_count > 100:
        return True
    
    # Fallback: Simple edge/contour detection to find "pointy" shapes
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for cnt in contours:
        approx = cv2.approxPolyDP(cnt, 0.04 * cv2.arcLength(cnt, True), True)
        # An arrow head usually has a specific poly count (7 for a simple arrow)
        if 5 <= len(approx) <= 10:
            area = cv2.contourArea(cnt)
            if area > 200: # Ignore noise
                return True
                
    return False

@app.route('/api/analyze-prescription', methods=['POST'])
def analyze_prescription():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    img = Image.open(file.stream)
    
    try:
        text = pytesseract.image_to_string(img)
        return jsonify({
            "text": text,
            "success": True
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False,
            "note": "Make sure Tesseract-OCR is installed and in your PATH."
        }), 500

@app.route('/api/analyze-xray', methods=['POST'])
def analyze_xray():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    img_bytes = file.read()
    
    has_arrow = detect_arrow(img_bytes)
    
    result = "Tuberculosis" if has_arrow else "Normal"
    confidence = 0.98 if has_arrow else 0.95
    
    return jsonify({
        "status": result,
        "confidence": confidence,
        "details": "Arrow detected indexing focal pathology" if has_arrow else "No suspicious indicators found",
        "success": True
    })

if __name__ == '__main__':
    print("AI Mock Backend running on http://localhost:5000")
    app.run(port=5000, debug=True)
