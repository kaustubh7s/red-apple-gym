'use client';

import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';

interface DynamicQrCodeProps {
  value: string;
  size?: number;
  includeMargin?: boolean;
  fgColor?: string;
  bgColor?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  label?: string;
  memberId?: string;
  noCardWrapper?: boolean;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = ({
  value,
  size = 140,
  includeMargin = true,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  showDownload = false,
  showCopy = false,
  label,
  memberId,
  noCardWrapper = false
}) => {
  const [copied, setCopied] = React.useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Safe fallback if value is empty so QR SVG never breaks or renders blank
  const safeValue =
    value && value.trim().length > 0
      ? value.trim()
      : memberId && memberId.trim().length > 0
      ? `https://redapplegym.in/pass/${memberId.trim()}`
      : 'RED-APPLE-GYM-PASS';

  const handleCopy = () => {
    navigator.clipboard.writeText(safeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `RedApple-QR-${memberId || 'Pass'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const qrElement = (
    <QRCodeSVG
      value={safeValue}
      size={size}
      level="H"
      includeMargin={includeMargin}
      fgColor={fgColor}
      bgColor={bgColor}
      className="block select-none"
    />
  );

  return (
    <div className="flex flex-col items-center space-y-1.5" suppressHydrationWarning>
      {/* Visual QR SVG with hydration suppression for client-server consistency */}
      {noCardWrapper ? (
        <div suppressHydrationWarning>{qrElement}</div>
      ) : (
        <div
          suppressHydrationWarning
          className="p-2.5 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-white/20 select-none"
          style={{ minWidth: size + 20, minHeight: size + 20 }}
        >
          {qrElement}
        </div>
      )}

      {/* Hidden canvas for downloading */}
      <div ref={canvasRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas
          value={safeValue}
          size={400}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </div>

      {label && (
        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider text-center">
          {label}
        </span>
      )}

      {(showDownload || showCopy) && (
        <div className="flex items-center gap-1.5 pt-1">
          {showDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
              title="Download QR Code PNG"
            >
              <Download className="w-3 h-3 text-[#00F59B]" />
              <span>Save QR</span>
            </button>
          )}

          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
              title="Copy QR Link"
            >
              {copied ? <Check className="w-3 h-3 text-[#00F59B]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Pass'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
