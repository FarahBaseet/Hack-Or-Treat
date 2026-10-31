"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPerson } from "@/lib/api";

const REQUIRED_SAMPLES = 3;

let enrollmentModelsLoad: Promise<void> | null = null;

type CameraState = "idle" | "loading" | "ready" | "error";

export default function EnrollPage() {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Self");
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [samples, setSamples] = useState<number[][]>([]);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    setCameraState("loading");
    setErrorMessage("");

    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access requires HTTPS or localhost and a supported browser.");
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const faceapi = await import("@vladmandic/face-api");
      if (
        !faceapi.nets.tinyFaceDetector.isLoaded ||
        !faceapi.nets.faceLandmark68Net.isLoaded ||
        !faceapi.nets.faceRecognitionNet.isLoaded
      ) {
        enrollmentModelsLoad ??= Promise.all([
          faceapi.nets.tinyFaceDetector.isLoaded
            ? Promise.resolve()
            : faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.isLoaded
            ? Promise.resolve()
            : faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.isLoaded
            ? Promise.resolve()
            : faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]).then(() => undefined);
        try {
          await enrollmentModelsLoad;
        } catch (error) {
          enrollmentModelsLoad = null;
          throw error;
        }
      }

      if (mountedRef.current) setCameraState("ready");
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      if (streamRef.current === stream) streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;

      if (mountedRef.current) {
        setCameraState("error");
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setErrorMessage("Allow camera access in your browser settings, then try again.");
        } else if (error instanceof DOMException && error.name === "NotFoundError") {
          setErrorMessage("No camera was found on this device.");
        } else {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to start the camera. Try again.",
          );
        }
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  };

  const captureSample = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setErrorMessage("The camera is still starting. Try again in a moment.");
      return;
    }

    setCapturing(true);
    setErrorMessage("");
    try {
      const faceapi = await import("@vladmandic/face-api");
      const faces = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (faces.length === 0) {
        setErrorMessage("No face found. Move into the camera view and try again.");
        return;
      }
      if (faces.length > 1) {
        setErrorMessage("More than one face found. Make sure only you are in the frame.");
        return;
      }

      setSamples((current) => [...current, Array.from(faces[0].descriptor)].slice(0, REQUIRED_SAMPLES));
      setSaved(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not capture a face sample. Try again.",
      );
    } finally {
      setCapturing(false);
    }
  };

  const savePerson = async () => {
    if (name.trim().length === 0 || relationship.trim().length === 0) {
      setErrorMessage("Enter a name and relationship before saving.");
      return;
    }
    if (samples.length !== REQUIRED_SAMPLES) {
      setErrorMessage(`Capture all ${REQUIRED_SAMPLES} face samples before saving.`);
      return;
    }

    setSaving(true);
    setErrorMessage("");
    try {
      const descriptor = samples[0].map(
        (_, index) => samples.reduce((sum, sample) => sum + sample[index], 0) / samples.length,
      );
      await createPerson({
        name: name.trim(),
        relationship: relationship.trim(),
        descriptor,
      });
      setSaved(true);
      stopCamera();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save this person. Check the backend and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-5">
      <Link
        href="/dashboard"
        className="flex min-h-14 items-center justify-center rounded-xl border-2 border-white text-xl font-bold"
      >
        ← Dashboard
      </Link>

      <h1 className="text-3xl font-extrabold">Add a familiar face</h1>
      <p className="text-lg text-slate-200">
        Capture three samples of your face to add a person for the camera demo.
      </p>

      <label className="flex flex-col gap-2 text-lg font-semibold">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={100}
          required
          className="min-h-14 rounded-xl bg-white px-4 text-slate-950"
        />
      </label>

      <label className="flex flex-col gap-2 text-lg font-semibold">
        Relationship
        <input
          value={relationship}
          onChange={(event) => setRelationship(event.target.value)}
          maxLength={100}
          required
          className="min-h-14 rounded-xl bg-white px-4 text-slate-950"
        />
      </label>

      <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Camera preview for face enrollment"
          className="h-full w-full object-cover"
        />
        {cameraState !== "ready" && (
          <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-lg text-white">
            {cameraState === "loading"
              ? "Starting camera and loading face scanner..."
              : cameraState === "error"
                ? errorMessage
                : "Camera is off"}
          </p>
        )}
      </div>

      {cameraState === "idle" || cameraState === "error" ? (
        <button
          type="button"
          onClick={() => void startCamera()}
          disabled={name.trim().length === 0 || relationship.trim().length === 0}
          className="min-h-14 rounded-xl bg-indigo-700 px-4 text-xl font-bold text-white disabled:opacity-50"
        >
          Start camera
        </button>
      ) : cameraState === "loading" ? (
        <button
          type="button"
          disabled
          className="min-h-14 rounded-xl bg-slate-600 px-4 text-xl font-bold text-white"
        >
          Starting camera...
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void captureSample()}
          disabled={capturing || samples.length >= REQUIRED_SAMPLES}
          className="min-h-14 rounded-xl bg-indigo-700 px-4 text-xl font-bold text-white disabled:opacity-50"
        >
          {capturing
            ? "Capturing..."
            : samples.length >= REQUIRED_SAMPLES
              ? "Samples complete"
              : `Capture sample ${samples.length + 1} of ${REQUIRED_SAMPLES}`}
        </button>
      )}

      {cameraState === "ready" && (
        <button
          type="button"
          onClick={stopCamera}
          className="min-h-12 rounded-xl border-2 border-white px-4 text-lg font-semibold"
        >
          Stop camera
        </button>
      )}

      <p className="text-center text-lg font-semibold" aria-live="polite">
        {samples.length} of {REQUIRED_SAMPLES} samples captured
      </p>

      {samples.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setSamples([]);
            setSaved(false);
            setErrorMessage("");
          }}
          className="min-h-12 rounded-xl border-2 border-white px-4 text-lg font-semibold"
        >
          Retake samples
        </button>
      )}

      <button
        type="button"
        onClick={() => void savePerson()}
        disabled={saving || saved || samples.length !== REQUIRED_SAMPLES}
        className="min-h-14 rounded-xl bg-green-700 px-4 text-xl font-bold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Person added" : "Save person"}
      </button>

      {saved && (
        <p role="status" className="rounded-xl bg-green-900 p-4 text-center text-lg font-bold">
          Face samples saved. You can return to the dashboard and try the camera.
        </p>
      )}
      {errorMessage && cameraState !== "error" && (
        <p role="alert" className="rounded-xl bg-red-900 p-4 text-center text-lg">
          {errorMessage}
        </p>
      )}

      <p className="text-sm text-slate-300">
        Use only your own face or someone who has agreed. Photos are processed in this browser and
        discarded; the averaged face descriptor is saved unencrypted in the local demo database.
      </p>
    </main>
  );
}
