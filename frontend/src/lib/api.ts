// All backend calls live here. Shapes match the API contract in CLAUDE.md.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Profile = {
  id: number;
  name: string;
  home_address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

export type Place = { id: number; name: string; address: string };

export type RoutineStep = { id: number; time: string; task: string; done: boolean };

export type Person = { id: number; name: string; relationship: string; descriptor: number[] };

export type NewPerson = Omit<Person, "id">;

export type LostLocation = { lat: number; lng: number; accuracy: number | null };

export type Alert = {
  id: number;
  created_at: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
};

// ---- Sign-in token: the backend only answers signed-in users ----

type ClerkLike = {
  loaded?: boolean;
  session?: { getToken: () => Promise<string | null> } | null;
};

/** Get the signed-in user's token from Clerk (waits up to 5 s for Clerk to load). */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < 50; i++) {
    const clerk = (window as unknown as { Clerk?: ClerkLike }).Clerk;
    if (clerk?.loaded) return (await clerk.session?.getToken()) ?? null;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const getProfile = () => request<Profile>("/profile");
export const getPlaces = () => request<Place[]>("/places");
export const getRoutine = () => request<RoutineStep[]>("/routine");
export const updateStep = (id: number, done: boolean) =>
  request<RoutineStep>(`/routine/${id}`, { method: "PATCH", body: JSON.stringify({ done }) });
export const getPeople = () => request<Person[]>("/people");
export const createPerson = (person: NewPerson) =>
  request<Person>("/people", { method: "POST", body: JSON.stringify(person) });
export const reportLost = (location: LostLocation | null) =>
  request<Alert>("/lost", {
    method: "POST",
    ...(location && { body: JSON.stringify(location) }),
  });
export const getAlerts = () => request<Alert[]>("/alerts");

// ---- Lost Mode: cached so the modal works instantly and offline ----

export type LostInfo = { profile: Profile; places: Place[] };

const LOST_CACHE_KEY = "zombie.lostInfo";

/** Read the cached profile + places. Call only in the browser (effects/handlers). */
export function getCachedLostInfo(): LostInfo | null {
  try {
    const raw = localStorage.getItem(LOST_CACHE_KEY);
    return raw ? (JSON.parse(raw) as LostInfo) : null;
  } catch {
    return null;
  }
}

/** Fetch fresh profile + places and update the cache. Returns null if the backend is down. */
export async function refreshLostInfo(): Promise<LostInfo | null> {
  try {
    const [profile, places] = await Promise.all([getProfile(), getPlaces()]);
    const info = { profile, places };
    localStorage.setItem(LOST_CACHE_KEY, JSON.stringify(info));
    return info;
  } catch {
    return null;
  }
}

// ---- Location for the Lost alert ----

/**
 * Get the current location, or null if it is unavailable or denied.
 * Gives up after `timeoutMs` in total, including time spent on a permission prompt. Never throws.
 */
export function getLocation(timeoutMs = 8000): Promise<LostLocation | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      // A fix up to 1 minute old is fine and comes back instantly.
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}

/** Send POST /lost in the background, retrying quietly. Never throws. */
export async function reportLostWithRetry(
  location: LostLocation | null,
  attempts = 5,
): Promise<Alert | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await reportLost(location);
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return null;
}
