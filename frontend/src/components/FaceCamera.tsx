"use client";

import { useEffect, useRef, useState } from "react";

export default function FaceCamera() {
  const [open, setOpen] = useState(false);
  const [cameraState, setCameraState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    let stream: MediaStream | null = null;
    const videoElement = videoRef.current;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("error");
        setErrorMessage("Camera access requires HTTPS or localhost and a supported browser.");
        return;
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user" },
        });

        if (!active) {
          cameraStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = cameraStream;
        if (videoElement) videoElement.srcObject = cameraStream;
        setCameraState("ready");
      } catch (error) {
        if (!active) return;

        setCameraState("error");
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setErrorMessage("Allow camera access in your browser settings, then try again.");
        } else if (error instanceof DOMException && error.name === "NotFoundError") {
          setErrorMessage("No camera was found on this device.");
        } else {
          setErrorMessage("Unable to start the camera. Check permissions and try again.");
        }
      }
    };

    void startCamera();

    return () => {
      active = false;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoElement) videoElement.srcObject = null;
    };
  }, [open]);

  const toggleCamera = () => {
    if (!open) {
      setCameraState("loading");
      setErrorMessage("");
    }
    setOpen((current) => !current);
  };

  return (
    <section className="rounded-3xl bg-white p-6 text-slate-950 shadow">
      <button
        type="button"
        onClick={toggleCamera}
        aria-expanded={open}
        className="flex min-h-20 w-full items-center justify-center rounded-2xl bg-indigo-700 px-4 text-3xl font-extrabold text-white active:bg-indigo-800"
      >
        {open ? "Close camera" : "Who is this?"}
      </button>

      {open && (
        <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-slate-900">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Live camera preview"
            className="h-full w-full object-cover"
          />
          {cameraState === "loading" && (
            <p role="status" className="absolute inset-0 flex items-center justify-center p-4 text-center text-xl text-white">
              Waiting for camera access...
            </p>
          )}
          {cameraState === "error" && (
            <p role="alert" className="absolute inset-0 flex items-center justify-center p-4 text-center text-xl text-white">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
