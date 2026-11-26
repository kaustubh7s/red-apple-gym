'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Check, X, User } from 'lucide-react';
import { compressAthletePhoto } from '@/lib/imageCompression';

interface PhotoCaptureProps {
  value: string;
  onChange: (photoUrl: string) => void;
  label?: string;
  required?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  value,
  onChange,
  label = 'Athlete Passport Photo',
  required = true
}) => {
  const [mode, setMode] = useState<'idle' | 'camera'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSwitching, setIsSwitching] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when component unmounts or mode changes
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setMode('idle');
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start live webcam with specific facingMode (front 'user' or back 'environment')
  const startCamera = async (requestedFacingMode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: requestedFacingMode },
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setFacingMode(requestedFacingMode);
      setStream(mediaStream);
      setMode('camera');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.error('Camera access error with facingMode:', err);
      // Fallback without facingMode constraint if ideal constraint fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setStream(fallbackStream);
        setMode('camera');
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch((e) => console.warn('Video play fallback error:', e));
        }
      } catch (fallbackErr) {
        setCameraError('Camera access denied or unavailable. Please upload a photo instead.');
        setMode('idle');
      }
    }
  };

  // Switch between Front (user) and Back (environment) camera
  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setIsSwitching(true);
    await startCamera(nextFacing);
    setIsSwitching(false);
  };

  // Sync video element when stream is ready
  useEffect(() => {
    if (mode === 'camera' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn('Video play error:', e));
    }
  }, [mode, stream]);

  // Snap photo from canvas & auto-compress with orientation correction
  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Automatic Orientation Correction:
      // Front Camera: Mirror like a selfie mirror
      // Back Camera: Natural unmirrored view from rear lens
      if (facingMode === 'user') {
        ctx.translate(480, 0);
        ctx.scale(-1, 1);
      }

      // Crop square from center of video
      const minDim = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      const startX = ((video.videoWidth || 480) - minDim) / 2;
      const startY = ((video.videoHeight || 480) - minDim) / 2;

      ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 480, 480);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

      // Auto-compress photo to avoid storage quota overflow
      const compressed = await compressAthletePhoto(dataUrl);
      onChange(compressed);
    }
    stopCamera();
  };

  // Handle local file upload with auto-compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressAthletePhoto(file);
      if (compressed) {
        onChange(compressed);
      }
    } catch (err) {
      console.warn('File upload compression fallback:', err);
    }
  };

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#1A1A1A] block">
          {label} {required && <span className="text-[#C41E3A]">*</span>}
        </label>
        <span className="text-[10px] text-[#71717A] hidden sm:inline">
          Required for Biometric Gym ID Pass
        </span>
      </div>

      <div className="flex flex-row items-center gap-3 sm:gap-4 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F8F6F4] border border-black/10">
        {/* Photo Preview / Live Camera Box */}
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border-2 border-[#C41E3A]/60 shrink-0 shadow-2xs flex items-center justify-center">
          {mode === 'camera' ? (
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform ${
                  facingMode === 'user' ? '-scale-x-100' : 'scale-x-100'
                }`}
              />
              <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-xl" />

              {/* Floating Camera Flip Icon in the corner of preview */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                disabled={isSwitching}
                title={facingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
                className="absolute bottom-1 right-1 p-1 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <RefreshCw className={`w-3 h-3 ${isSwitching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : value ? (
            <img
              src={value}
              alt="Athlete Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400 p-1 text-center">
              <User className="w-5 h-5 sm:w-7 sm:h-7 mb-0.5 text-neutral-500" />
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-400">No Photo</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-1.5 w-full min-w-0">
          {mode === 'camera' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Snap Photo Button */}
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="flex-1 py-1.5 sm:py-2 px-3 rounded-lg sm:rounded-xl bg-[#00C853] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#00B046] shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Snap Photo</span>
                </button>

                {/* Back Cam / Front Cam Switch Button */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  disabled={isSwitching}
                  title="Switch between front and back camera"
                  className="py-1.5 sm:py-2 px-2.5 rounded-lg sm:rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1 border border-white/10 cursor-pointer active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSwitching ? 'animate-spin text-amber-400' : ''}`} />
                  <span className="text-[10px] hidden sm:inline">
                    {facingMode === 'user' ? 'Back Cam' : 'Front Cam'}
                  </span>
                </button>

                {/* Cancel Camera Button */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white hover:bg-neutral-100 text-[#1A1A1A] border border-black/10 cursor-pointer active:scale-95 transition-all"
                  title="Cancel Camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Camera State Badge */}
              <div className="flex items-center justify-between text-[10px] text-neutral-500 px-0.5">
                <span>
                  Active:{' '}
                  <strong className="text-neutral-700 capitalize">
                    {facingMode === 'user' ? 'Front Camera (Selfie)' : 'Back Camera (Desk)'}
                  </strong>
                </span>
                <span className="text-[#C41E3A] font-medium">Click Snap to save</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-row gap-1.5 sm:gap-2">
              {/* Take Live Photo Button */}
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="flex-1 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-white hover:bg-neutral-100 border border-black/10 text-[#1A1A1A] font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#C41E3A]" />
                <span className="truncate">Take Photo</span>
              </button>

              {/* Upload Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-white hover:bg-neutral-100 border border-black/10 text-[#1A1A1A] font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span className="truncate">Upload</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {cameraError && (
            <p className="text-[10px] text-[#C41E3A] font-semibold">{cameraError}</p>
          )}

          <div className="text-[10px] text-[#71717A] truncate">
            {value
              ? '✅ Photo attached for gym ID pass.'
              : 'Switch front & back cam or upload a photo.'}
          </div>
        </div>
      </div>
    </div>
  );
};
