import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VideoGeneratorForm = () => {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [duration, setDuration] = useState('');
  const [format, setFormat] = useState('mp4');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  console.log({videoUrl});
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ width, height, duration, format }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate video');
      }
      const data = await response.json();
      setVideoUrl(`http://localhost:3001${data.videoUrl}`);
    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Video Generator</CardTitle>
          <CardDescription>Create custom placeholder videos for your demos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 1280"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 720"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              <Video className="mr-2 h-4 w-4" /> Generate Video
            </Button>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {videoUrl && (
            <div className="mt-4 space-y-4">
              <video src={videoUrl} controls className="w-full rounded-lg shadow-lg" />
              <Button asChild className="w-full">
                <a href={videoUrl} download>Download Video</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGeneratorForm;