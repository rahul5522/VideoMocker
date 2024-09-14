const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const cron = require('node-cron');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/tmp', express.static('/tmp'));

app.get("/", async(req, res) => {
  console.log("Working");
  res.status(200).json({
    msg: "Working properly",
  })
});

app.post('/api/generate-video', async (req, res) => {
  console.log("API hit");
  
  const { width, height, duration, format, audioEnabled } = req.body;
  const outputFileName = `video_${width}x${height}_d${duration}s${Date.now()}.${format}`;
  const outputPath = path.join('/tmp', outputFileName);

  console.log(`Attempting to generate video: ${outputPath}`);

  try {
    await fs.access('/tmp', fs.constants.W_OK);
    console.log('/tmp directory is writable');
  } catch (err) {
    console.error('Error accessing /tmp directory:', err);
    return res.status(500).json({ error: 'Server configuration error', details: err.message });
  }

  try {
    let ffmpegArgs = [
      '-y',  // Overwrite output file if it exists
      '-f', 'lavfi',
      '-i', `color=c=blue:s=${width}x${height}:d=${duration}`,
      '-vf', `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=60:fontcolor=white:x=(w-tw)/2:y=(h-th)/2:text='${width}x${height}'`
    ];

    if (audioEnabled) {
      // Add audio input
      ffmpegArgs.push('-f', 'lavfi', '-i', `sine=frequency=1000:duration=${duration}`);
      // Map both video and audio to output
      ffmpegArgs.push('-map', '0:v', '-map', '1:a');
    }

    ffmpegArgs = [
      ...ffmpegArgs,
      '-t', duration,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p'
    ];

    if (audioEnabled) {
      ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k');
    }

    ffmpegArgs.push(outputPath);

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
  
    let ffmpegLogs = '';
  
    ffmpeg.stdout.on('data', (data) => {
      console.log(`FFmpeg stdout: ${data}`);
      ffmpegLogs += data;
    });
  
    ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg stderr: ${data}`);
      ffmpegLogs += data;
    });

    ffmpeg.on('error', (err) => {
      console.error('FFmpeg error:', err);
      ffmpegLogs += `FFmpeg error: ${err.message}\n`;
    });
  
    ffmpeg.on('close', async (code) => {
      console.log(`FFmpeg process closed with code ${code}`);
      if (code === 0) {
        try {
          await fs.access(outputPath, fs.constants.F_OK);
          console.log(`File successfully created: ${outputPath}`);
          const stats = await fs.stat(outputPath);
          console.log(`File size: ${stats.size} bytes`);
          res.json({ videoUrl: `/tmp/${outputFileName}` });
        } catch (err) {
          console.error('Error verifying output file:', err);
          res.status(500).json({ 
            error: 'Error verifying video file', 
            logs: ffmpegLogs,
            details: err.message
          });
        }
      } else {
        console.error('FFmpeg logs:', ffmpegLogs);
        res.status(500).json({ 
          error: 'Error generating video', 
          logs: ffmpegLogs,
          details: `FFmpeg process exited with code ${code}`
        });
      }
    });
  } catch(err) {
    console.log("Error occurred", err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Cron job to delete expired videos
cron.schedule('*/5 * * * *', async () => {
  console.log('Running cron job to delete expired videos');
  const publicDir = '/tmp';
  
  try {
    const files = await fs.readdir(publicDir);
    console.log(`Found ${files.length} files in ${publicDir}`);
    for (const file of files) {
      if (file.startsWith('video_')) {
        const filePath = path.join(publicDir, file);
        try {
          const stats = await fs.stat(filePath);
          console.log(`Processing file: ${file}, size: ${stats.size} bytes, created: ${stats.birthtime}`);
          // For simplicity, let's delete files older than 1 hour
          if (Date.now() - stats.birthtime.getTime() > 60 * 60 * 1000) {
            await fs.unlink(filePath);
            console.log(`Deleted expired video: ${file}`);
          }
        } catch (err) {
          console.error(`Error processing file ${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));