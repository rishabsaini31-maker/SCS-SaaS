"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type BarcodeScannerModalProps = {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

export default function BarcodeScannerModal({
  open,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);

  const [status, setStatus] = useState<
    "initializing" | "scanning" | "success" | "error" | "unsupported"
  >("initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedCode, setScannedCode] = useState("");

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleSuccessfulScan = useCallback(
    (code: string) => {
      if (cooldownRef.current) return;
      if (code === lastScannedRef.current) return;

      cooldownRef.current = true;
      lastScannedRef.current = code;
      setScannedCode(code);
      setStatus("success");

      // Vibrate on successful scan
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Notify parent after a short delay so user sees the confirmation
      setTimeout(() => {
        onScan(code);
        cooldownRef.current = false;
        lastScannedRef.current = "";
        setScannedCode("");
        setStatus("scanning");
      }, 800);
    },
    [onScan],
  );

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStatus("initializing");
      setErrorMessage("");
      setScannedCode("");
      lastScannedRef.current = "";
      cooldownRef.current = false;
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      // Check for BarcodeDetector support
      const hasBarcodeDetector = "BarcodeDetector" in window;
      if (!hasBarcodeDetector) {
        setStatus("unsupported");
        setErrorMessage(
          "Camera barcode scanning is not supported in this browser. Please use Chrome on Android, or type the barcode manually.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("scanning");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({
          formats: [
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_128",
            "code_39",
            "code_93",
            "codabar",
            "itf",
            "qr_code",
            "data_matrix",
          ],
        });

        const detectLoop = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
            if (!cancelled) {
              animFrameRef.current = requestAnimationFrame(detectLoop);
            }
            return;
          }

          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleSuccessfulScan(barcodes[0].rawValue);
            }
          } catch {
            // Detection errors are normal, continue scanning
          }

          if (!cancelled) {
            animFrameRef.current = requestAnimationFrame(detectLoop);
          }
        };

        animFrameRef.current = requestAnimationFrame(detectLoop);
      } catch (err: unknown) {
        if (cancelled) return;

        const error = err as { name?: string; message?: string };
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setStatus("error");
          setErrorMessage(
            "Camera permission denied. Please allow camera access in your browser settings.",
          );
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          setStatus("error");
          setErrorMessage("No camera found on this device.");
        } else {
          setStatus("error");
          setErrorMessage(`Failed to start camera: ${error.message || "Unknown error"}`);
        }
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera, handleSuccessfulScan]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <h2 className="text-white font-semibold text-lg">Scan Barcode</h2>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Scan overlay */}
        {status === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative w-[280px] h-[180px]">
              {/* Clear scanning window */}
              <div className="absolute inset-0 bg-transparent" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)" }} />

              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-lg" style={{ borderTop: "3px solid #60a5fa", borderLeft: "3px solid #60a5fa" }} />
              <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-lg" style={{ borderTop: "3px solid #60a5fa", borderRight: "3px solid #60a5fa" }} />
              <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-lg" style={{ borderBottom: "3px solid #60a5fa", borderLeft: "3px solid #60a5fa" }} />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-lg" style={{ borderBottom: "3px solid #60a5fa", borderRight: "3px solid #60a5fa" }} />

              {/* Animated scan line */}
              <div
                className="absolute left-2 right-2 h-0.5 bg-blue-400 opacity-80 animate-[scanline_2s_ease-in-out_infinite]"
              />
            </div>
          </div>
        )}

        {/* Success flash */}
        {status === "success" && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 mx-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-green-600" style={{ fontSize: 40 }}>
                  check_circle
                </span>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                Barcode Found!
              </p>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                {scannedCode}
              </p>
            </div>
          </div>
        )}

        {/* Error / Unsupported state */}
        {(status === "error" || status === "unsupported") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-8">
            <div className="bg-white rounded-2xl p-6 text-center max-w-sm shadow-2xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: 40 }}>
                  {status === "unsupported" ? "no_photography" : "error"}
                </span>
              </div>
              <p className="text-base font-semibold text-slate-900 mb-2">
                {status === "unsupported"
                  ? "Scanner Not Supported"
                  : "Camera Error"}
              </p>
              <p className="text-sm text-slate-600">{errorMessage}</p>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Initializing state */}
        {status === "initializing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/80 text-sm">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-4 bg-black/80 backdrop-blur-sm text-center">
        <p className="text-white/70 text-sm">
          {status === "scanning"
            ? "Point camera at a barcode"
            : status === "success"
              ? "Adding product..."
              : ""}
        </p>
      </div>
    </div>
  );
}
