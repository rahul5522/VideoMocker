const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

app.post('/api/generate-video', (req, res) => {
  console.log("Hit the endpoint");
  const { width, height, duration, format } = req.body;
  const outputFileName = `video_${Date.now()}.${format}`;
  const publicDir = path.join(__dirname, 'public');
  const outputPath = path.join(publicDir, outputFileName);

  // Ensure the public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log(`Generating video: ${width}x${height}, ${duration}s, ${format}`);

  const ffmpeg = spawn('ffmpeg', [
    '-f', 'lavfi',
    '-i', `color=c=0xD3D3D3:s=${width}x${height}:d=${duration}`,
    '-vf', `drawtext=fontsize=60:fontcolor=black:x=(w-tw)/2:y=(h-th)/2:text='Placeholder Video'`,
    '-t', duration,
    outputPath
  ]);

  let ffmpegLogs = '';

  ffmpeg.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
    ffmpegLogs += data;
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
    ffmpegLogs += data;
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process closed with code ${code}`);
    if (code === 0) {
      res.json({ videoUrl: `/public/${outputFileName}` });
    } else {
      console.error('FFmpeg logs:', ffmpegLogs);
      res.status(500).json({ 
        error: 'Error generating video', 
        logs: ffmpegLogs,
        details: `Failed to create file: ${outputPath}. Please check directory permissions and FFmpeg installation.`
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));