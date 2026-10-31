"use client";

import { useEffect, useRef, useState } from "react";
import { getPeople, type Person } from "@/lib/api";

type FaceBox = { x: number; y: number; width: number; height: number };
type TrackedFace = { box: FaceBox; person: Person | null; recognized: boolean };

const FACE_MATCH_THRESHOLD = 0.55;
const RECOGNITION_DELAY_MS = 1200;

let faceModelsLoad: Promise<void> | null = null;

export default function FaceCamera() {
  const [open, setOpen] = useState(false);
  const [cameraState, setCameraState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [scanState, setScanState] = useState<
    "loading" | "searching" | "scanning" | "error"
  >("loading");
  const [scanError, setScanError] = useState("");
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [videoSize, setVideoSize] = useState<{ width: number; height: number } | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
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

  useEffect(() => {
    if (!open || cameraState !== "ready") return;

    let active = true;
    let timer: number | undefined;
    const recognizedSince = new Map<number, number>();

    const scanForFaces = async () => {
      try {
        const faceapi = await import("@vladmandic/face-api");
        if (
          !faceapi.nets.tinyFaceDetector.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded ||
          !faceapi.nets.faceRecognitionNet.isLoaded
        ) {
          faceModelsLoad ??= Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          ]).then(() => undefined);
          try {
            await faceModelsLoad;
          } catch (error) {
            faceModelsLoad = null;
            throw error;
          }
        }

        let people: Person[];
        try {
          people = await getPeople();
        } catch {
          throw new Error("Could not load enrolled people. Make sure the backend is running.");
        }

        if (people.some((person) =>
          person.descriptor.length !== 128 || person.descriptor.some((value) => !Number.isFinite(value)),
        )) {
          throw new Error("An enrolled face descriptor is invalid. Please re-enroll that person.");
        }

        const peopleById = new Map(people.map((person) => [person.id, person]));
        const matcher = people.length
          ? new faceapi.FaceMatcher(
              people.map(
                (person) =>
                  new faceapi.LabeledFaceDescriptors(
                    String(person.id),
                    [new Float32Array(person.descriptor)],
                  ),
              ),
              FACE_MATCH_THRESHOLD,
            )
          : null;

        if (!active) return;
        const scan = async () => {
          if (!active) return;

          try {
            const video = videoRef.current;
            if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              setVideoSize((current) =>
                current?.width === video.videoWidth && current.height === video.videoHeight
                  ? current
                  : { width: video.videoWidth, height: video.videoHeight },
              );
              const faces = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }),
              ).withFaceLandmarks().withFaceDescriptors();
              if (!active) return;

              const now = Date.now();
              const visiblePeople = new Set<number>();
              const nextFaces = faces.map(({ detection, descriptor }) => {
                const match = matcher?.findBestMatch(descriptor);
                const person =
                  match && match.distance <= FACE_MATCH_THRESHOLD
                    ? peopleById.get(Number(match.label)) ?? null
                    : null;

                if (!person) return { box: detection.box, person: null, recognized: false };

                visiblePeople.add(person.id);
                const startedAt = recognizedSince.get(person.id) ?? now;
                recognizedSince.set(person.id, startedAt);
                return {
                  box: detection.box,
                  person,
                  recognized: now - startedAt >= RECOGNITION_DELAY_MS,
                };
              });

              for (const id of recognizedSince.keys()) {
                if (!visiblePeople.has(id)) recognizedSince.delete(id);
              }

              setTrackedFaces(nextFaces);
              setScanState(faces.length > 0 ? "scanning" : "searching");
            }
            timer = window.setTimeout(() => void scan(), 300);
          } catch {
            if (active) {
              setScanError("Face scanning stopped unexpectedly. Close the camera and try again.");
              setScanState("error");
            }
          }
        };

        setScanState("searching");
        void scan();
      } catch (error) {
        if (active) {
          setScanError(
            error instanceof Error ? error.message : "The face scanner could not load. Check the connection and try again.",
          );
          setScanState("error");
        }
      }
    };

    void scanForFaces();

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [open, cameraState]);

  useEffect(() => {
    if (!open || cameraState !== "ready" || scanState !== "scanning") return;

    const timer = window.setInterval(() => {
      setScanProgress((progress) => (progress >= 100 ? 0 : progress + 2.5));
    }, 50);

    return () => window.clearInterval(timer);
  }, [open, cameraState, scanState]);

  const toggleCamera = () => {
    if (!open) {
      setCameraState("loading");
      setErrorMessage("");
      setScanState("loading");
      setScanError("");
      setTrackedFaces([]);
      setVideoSize(null);
      setScanProgress(0);
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
          {cameraState === "ready" && trackedFaces.length > 0 && videoSize && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${videoSize.width} ${videoSize.height}`}
              preserveAspectRatio="xMidYMid slice"
            >
              {trackedFaces.map(({ box, person, recognized }, index) => {
                const padding = box.width * 0.18;
                const x = Math.max(0, box.x - padding);
                const y = Math.max(0, box.y - padding);
                const right = Math.min(videoSize.width, box.x + box.width + padding);
                const bottom = Math.min(videoSize.height, box.y + box.height + padding);
                const width = right - x;
                const height = bottom - y;
                const cornerLength = Math.min(width, height) * 0.22;
                const color = recognized ? "#86efac" : "#67e8f9";
                const label = recognized && person
                  ? `Friendly human, ${person.name} — DO NOT EAT`
                  : person
                    ? "Checking identity..."
                    : "Unknown person";
                const labelWidth = Math.min(videoSize.width, Math.max(width, 240));
                const labelX = Math.max(0, Math.min(x, videoSize.width - labelWidth));
                const labelY = Math.max(0, y - 42);
                const corners = [
                  `M ${x + cornerLength} ${y} H ${x} V ${y + cornerLength}`,
                  `M ${x + width - cornerLength} ${y} H ${x + width} V ${y + cornerLength}`,
                  `M ${x} ${y + height - cornerLength} V ${y + height} H ${x + cornerLength}`,
                  `M ${x + width - cornerLength} ${y + height} H ${x + width} V ${y + height - cornerLength}`,
                ].join(" ");

                return (
                  <g key={`${person?.id ?? "unknown"}-${index}`}>
                    <path
                      d={corners}
                      fill="none"
                      stroke={color}
                      strokeWidth={4}
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      vectorEffect="non-scaling-stroke"
                    />
                    {scanState === "scanning" && (
                      <line
                        x1={x}
                        x2={x + width}
                        y1={y + (height * scanProgress) / 100}
                        y2={y + (height * scanProgress) / 100}
                        stroke={color}
                        strokeWidth={3}
                        opacity={0.9}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    <rect
                      x={labelX}
                      y={labelY}
                      width={labelWidth}
                      height={36}
                      rx={5}
                      fill={recognized ? "#14532d" : "#164e63"}
                      stroke={color}
                      strokeWidth={2}
                    />
                    <text
                      x={labelX + labelWidth / 2}
                      y={labelY + 24}
                      fill="white"
                      fontSize={16}
                      fontWeight={700}
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
          {cameraState === "ready" && scanState === "error" && (
            <div
              role="alert"
              className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-950/80 px-4 py-3 text-center text-white"
            >
              {scanError}
            </div>
          )}
        </div>
      )}
      {open && cameraState === "ready" && (
        <p className="mt-3 text-center text-sm text-slate-600">
          Face matching runs on this device using enrolled people. Results can be wrong.
        </p>
      )}
    </section>
  );
}
