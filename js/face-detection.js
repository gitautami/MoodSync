// Face detection module
let isModelLoaded = false;
let stream = null;

export async function initFaceDetection() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('../models');
        await faceapi.nets.faceExpressionNet.loadFromUri('../models');
        isModelLoaded = true;
    } catch (error) {
        console.error('Error loading face detection models:', error);
        throw error;
    }
}

export async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing camera:', error);
        throw error;
    }
}

export function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        const video = document.getElementById('video');
        video.srcObject = null;
    }
}

export async function detectExpression(video, canvas) {
    if (!isModelLoaded) {
        throw new Error('Face detection models not loaded');
    }

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

    if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        // Get the dominant expression
        const expressions = detections.expressions;
        const dominantExpression = Object.keys(expressions).reduce((a, b) => 
            expressions[a] > expressions[b] ? a : b
        );

        // Map expression to mood score
        const moodMap = {
            happy: 5,
            surprised: 4,
            neutral: 3,
            sad: 2,
            fearful: 1,
            angry: 1,
            disgusted: 1
        };

        return {
            expression: dominantExpression,
            score: moodMap[dominantExpression] || 3
        };
    }

    return null;
}
