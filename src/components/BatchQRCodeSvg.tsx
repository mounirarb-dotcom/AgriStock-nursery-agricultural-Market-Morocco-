import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface Props {
  value: string;
  size?: number; // Size in pixels
  className?: string;
  fgColor?: string;
  bgColor?: string;
  title?: string;
}

/**
 * Generates high-res PNG Data URL for standard QR code, usable for downloads and mobile sharing
 */
export async function getQRCodeDataURL(
  value: string,
  options?: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(value, {
      width: options?.width || 600,
      margin: options?.margin ?? 2,
      color: {
        dark: options?.color?.dark || '#062817',
        light: options?.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

/**
 * Standard-compliant SVG QR Code component that is 100% scannable by all smartphones
 */
export const BatchQRCodeSvg: React.FC<Props> = ({
  value,
  size = 160,
  className = '',
  fgColor = '#062817',
  bgColor = '#FFFFFF',
  title = 'QR Code de traçabilité inventaire',
}) => {
  const [svgHtml, setSvgHtml] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(
      value,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      },
      (err, string) => {
        if (!err && string && isMounted) {
          // Add custom title and accessibility attributes
          const styledSvg = string
            .replace(/<svg\s+/, `<svg class="w-full h-full select-none" aria-label="${title}" role="img" `)
            .replace(/width="[^"]*"/, '')
            .replace(/height="[^"]*"/, '');
          setSvgHtml(styledSvg);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [value, fgColor, bgColor, title]);

  if (!svgHtml) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-stone-100 rounded-xl animate-pulse ${className}`}
      >
        <span className="text-[10px] font-mono text-stone-400">QR Loading...</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-block overflow-hidden rounded-xl ${className}`}
      title={title}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};
