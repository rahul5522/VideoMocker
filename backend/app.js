const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const cron = require('node-cron');
const moment = require('moment');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get("/", async(req, res) => {
  console.log("Working");
});

app.post('/api/generate-video', async (req, res) => {
  console.log("API hit");
  
  const { width, height, duration, format } = req.body;
  const outputFileName = `video_${width}x${height}_d${duration}s${Date.now()}.${format}`;
  const publicDir = path.join(__dirname, 'public');
  const outputPath = path.join(publicDir, outputFileName);

  try {
    await fs.mkdir(publicDir, { recursive: true });
  } catch (err) {
    console.error('Error creating public directory:', err);
    return res.status(500).json({ error: 'Failed to create public directory' });
  }

  try{
    const ffmpeg = spawn('ffmpeg', [
     '-f', 'lavfi',
     '-i', `color=c=0xD3D3D3:s=${width}x${height}:d=${duration}`,
     '-f', 'lavfi',
     '-i', `sine=frequency=440:duration=${duration}`,
     '-vf', `drawtext=fontsize=60:fontcolor=black:x=(w-tw)/2:y=(h-th)/2:text='${width} x ${height} PX'`,
     '-t', duration,
     '-shortest',
     '-metadata', `comment=${moment().add(1, 'h').toISOString()}`,
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
  } catch(err) {
    console.log("Error occurred", err);
  }
});

// Cron job to delete expired videos
cron.schedule('*/5 * * * *', async () => {  // Runs every hour
  console.log('Running cron job to delete expired videos');
  const publicDir = path.join(__dirname, 'public');
  
  try {
    await fs.mkdir(publicDir, { recursive: true });

    const files = await fs.readdir(publicDir);
    for (const file of files) {
      const filePath = path.join(publicDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile() && file.startsWith('video_')) {
        const metadata = await getVideoMetadata(filePath);
        if (metadata && metadata?.comment) {
          const expiryDate = new Date(metadata.comment);
          if (expiryDate < new Date()) {
            await fs.unlink(filePath);
            console.log(`Deleted expired video: ${file}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  }
});

async function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      filePath
    ]);

    let output = '';
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(output);
          resolve(metadata.format.tags);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`ffprobe process exited with code ${code}`));
      }
    });
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));