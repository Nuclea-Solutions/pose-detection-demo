import * as poseDetection from '@tensorflow-models/pose-detection';
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';

const detectorConfig = {
  modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  enableTracking: true,
  trackerType: poseDetection.TrackerType.BoundingBox
};
const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

// @ts-ignore
let rafId = null;

// load video demo-video.mp4 and read frame by frame
const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const connections = [
  [0, 1], [0, 2], [1, 3], [2, 4], [0, 5], [0, 6], [5, 7], [7, 9], [6, 8], [8, 10], [5, 6], [5, 11], [6, 12], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
];

async function processFrame() {
  if (video.paused || video.ended) {
    return;
  }

  if (video.videoWidth === 0 || video.videoHeight === 0) {
    rafId = requestAnimationFrame(processFrame);
    return;
  }

  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;

  // do pose detection
  const poses = await detector.estimatePoses(video, { maxPoses: 6 });

  ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

  /// draw poses
  poses.forEach((pose) => {
    pose.keypoints.forEach((keypoint) => {
      ctx!.beginPath();
      ctx!.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
      ctx!.fillStyle = 'green';
      ctx!.fill();
    });

    // draw unions between keypoints
    connections.forEach((connection) => {
      ctx!.beginPath();
      ctx!.moveTo(pose.keypoints[connection[0]].x, pose.keypoints[connection[0]].y);
      ctx!.lineTo(pose.keypoints[connection[1]].x, pose.keypoints[connection[1]].y);
      ctx!.strokeStyle = 'green';
      ctx!.stroke();
    });

  });

  rafId = requestAnimationFrame(processFrame);
}

video.addEventListener('play', async () => {
    rafId = requestAnimationFrame(processFrame);
  });

  video.addEventListener('pause', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });

  video.addEventListener('ended', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    video.play();
  });

  video.src = 'video-demo.mp4';
  video.load();
  video.play();
  video.volume = 0;
