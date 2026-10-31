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

export type Alert = { id: number; created_at: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
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
export const reportLost = () => request<Alert>("/lost", { method: "POST" });
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

/** Send POST /lost in the background, retrying quietly. Never throws. */
export async function reportLostWithRetry(attempts = 5): Promise<Alert | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await reportLost();
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return null;
}
