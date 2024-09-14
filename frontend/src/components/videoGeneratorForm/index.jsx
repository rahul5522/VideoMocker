import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Video } from "lucide-react";
import { Puff } from "react-loader-spinner";

import { useTheme } from "../../contexts/themeContext";

const VideoGeneratorForm = () => {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [duration, setDuration] = useState("");
  const [format, setFormat] = useState("mp4");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { theme } = useTheme();

  const popularDimensions = [
    { label: "Custom", value: "custom" },
    { label: "360p (640x360)", value: "640x360" },
    { label: "480p (854x480)", value: "854x480" },
    { label: "720p (1280x720)", value: "1280x720" },
    { label: "1080p (1920x1080)", value: "1920x1080" },
    { label: "1440p (2560x1440)", value: "2560x1440" },
    // { label: "4K (3840x2160)", value: "3840x2160" },
  ];

  const videoFormats = [
    { label: "MP4", value: "mp4" },
    { label: "WebM", value: "webm" },
    { label: "GIF", value: "gif" },
    { label: "AVI", value: "avi" },
    { label: "MOV", value: "mov" },
    { label: "MKV", value: "mkv" },
    { label: "WMV", value: "wmv" },
  ];

  const handleDimensionSelect = (value) => {
    if (value === "custom") {
      setWidth("");
      setHeight("");
    } else {
      const [w, h] = value.split("x");
      setWidth(w);
      setHeight(h);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const response = await fetch("https://videomocker.onrender.com/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ width, height, duration, format, audioEnabled }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate video");
      }
      const data = await response.json();
      setVideoUrl(`https://videomocker.onrender.com${data.videoUrl}`);
      setLoading(false);
    } catch (error) {
      console.error("Error generating video:", error);
      setLoading(false);
      setError("Failed to generate video. Please try again.");
    }
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Select onValueChange={handleDimensionSelect} defaultValue="custom">
            <SelectTrigger>
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {popularDimensions.map((dim) => (
                <SelectItem key={dim.value} value={dim.value}>
                  {dim.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            onChange={(e) => setDuration(Math.min(300, Math.max(1, e.target.value)))}
            placeholder="e.g. 10 (max 300)"
            required
            min="1"
            max="300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {videoFormats.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={audioEnabled} onChange={() => setAudioEnabled((prev) => !prev)} />
          <Label>Enable Audio</Label>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          <Video className="mr-2 h-4 w-4" /> Generate Video
        </Button>
      </form>
    );
  };

  const renderVideo = () => {
    if (format === "gif") {
      return <img src={videoUrl} alt="Generated GIF" className="w-full rounded-lg shadow-lg" />;
    } else {
      return (
        <video
          src={videoUrl}
          controls
          className="w-full rounded-lg shadow-lg"
        >
          Your browser does not support the video tag. Please download the video.
        </video>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Vid-Mocker</CardTitle>
          <CardDescription>
            Create custom placeholder videos for your demos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!videoUrl && renderForm()}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {videoUrl && (
            <div className="mt-4 space-y-4">
              {renderVideo()}
              <Button asChild className="w-full">
                <a href={videoUrl} target="_blank" download>
                  Download Video
                </a>
              </Button>
              <Separator />
              <Button className="w-full" onClick={() => setVideoUrl(null)} >
                ✨ Generate New Video
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Puff color={theme === "light" ? "black" : "white"} height={50} width={50} />
        </div>
      )}
    </div>
  );
};

export default VideoGeneratorForm;