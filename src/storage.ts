import type { MemoryTicket, Session, User } from "./types";

const DB_NAME = "memory-ticket-db";
const DB_VERSION = 1;
const STORE_USERS = "users";
const STORE_MEMORIES = "memories";
const STORE_SESSION = "session";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        const store = db.createObjectStore(STORE_USERS, { keyPath: "id" });
        store.createIndex("email", "email", { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_MEMORIES)) {
        db.createObjectStore(STORE_MEMORIES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => console.warn("IndexedDB open blocked");
  });
}

async function withStore<T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = Promise.resolve(callback(store));

    tx.oncomplete = () => result.then(resolve, reject);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function initDatabase() {
  await openDatabase();
}

export async function getUsers(): Promise<User[]> {
  return withStore(STORE_USERS, "readonly", store => requestToPromise(store.getAll() as IDBRequest<User[]>));
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const normalized = email.trim().toLowerCase();
  return withStore(STORE_USERS, "readonly", store => {
    const index = store.index("email");
    return requestToPromise(index.get(normalized) as IDBRequest<User | undefined>);
  });
}

export async function createUser(u: Omit<User, "id" | "createdAt">): Promise<User> {
  const existing = await findUserByEmail(u.email);
  if (existing) throw new Error("An account with this email already exists.");

  const user: User = {
    ...u,
    id: crypto.randomUUID(),
    email: u.email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  await withStore(STORE_USERS, "readwrite", store => requestToPromise(store.add(user) as IDBRequest<unknown>));
  return user;
}

export async function getSession(): Promise<Session | null> {
  const stored = await withStore(STORE_SESSION, "readonly", store =>
    requestToPromise(store.get("current") as IDBRequest<{ key: string } & Session | undefined>),
  );
  return stored ? { userId: stored.userId, email: stored.email } : null;
}

export async function setSession(s: Session | null): Promise<void> {
  await withStore(STORE_SESSION, "readwrite", store => {
    if (s) {
      return requestToPromise(store.put({ key: "current", ...s }) as IDBRequest<unknown>);
    }
    return requestToPromise(store.delete("current") as IDBRequest<unknown>);
  });
}

export async function getMemories(): Promise<MemoryTicket[]> {
  const memories = await withStore(STORE_MEMORIES, "readonly", store => requestToPromise(store.getAll() as IDBRequest<MemoryTicket[]>));
  return memories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveMemory(m: MemoryTicket): Promise<void> {
  await withStore(STORE_MEMORIES, "readwrite", store => requestToPromise(store.put(m) as IDBRequest<unknown>));
}

export async function deleteMemory(id: string): Promise<void> {
  await withStore(STORE_MEMORIES, "readwrite", store => requestToPromise(store.delete(id) as IDBRequest<unknown>));
}

export async function toggleFavorite(id: string): Promise<void> {
  await withStore(STORE_MEMORIES, "readwrite", async store => {
    const memory = await requestToPromise(store.get(id) as IDBRequest<MemoryTicket | undefined>);
    if (!memory) return;
    memory.favorite = !memory.favorite;
    await requestToPromise(store.put(memory) as IDBRequest<unknown>);
  });
}

export async function clearAllMemories(): Promise<void> {
  await withStore(STORE_MEMORIES, "readwrite", store => requestToPromise(store.clear() as IDBRequest<unknown>));
}

export async function ensureSeed(): Promise<void> {
  const existing = await getMemories();
  if (existing.length > 0) return;

  const now = new Date();
  const months = (n: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
  };

  const seed: MemoryTicket[] = [
    {
      id: crypto.randomUUID(),
      title: "Golden Hour, Bali",
      description: "We walked barefoot until the tide caught up with us. The sky bled into the sea.",
      location: "Seminyak, Bali",
      mood: "Nostalgic",
      imageUrl: "https://images.pexels.com/photos/28286665/pexels-photo-28286665.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      caption: "Golden skies and unforgettable moments frozen forever.",
      theme: "travel",
      favorite: true,
      createdAt: months(0),
      tags: ["#travel", "#sunset", "#bali"],
      latitude: -8.6914, longitude: 115.1552,
    },
    {
      id: crypto.randomUUID(),
      title: "The Encore",
      description: "Twenty thousand voices, one chorus. My ears rang for two days and I didn't care.",
      location: "Madison Square Garden",
      mood: "Energetic",
      imageUrl: "https://images.pexels.com/photos/26447528/pexels-photo-26447528.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      caption: "A night that turned strangers into a single, beating heart.",
      theme: "concert",
      favorite: false,
      createdAt: months(1),
      tags: ["#concert", "#friends"],
      latitude: 40.7505, longitude: -73.9934,
    },
    {
      id: crypto.randomUUID(),
      title: "Rooftop Laughs",
      description: "Cheap wine, expensive view. Sasha tried to teach us to whistle. None of us learned.",
      location: "Brooklyn Heights",
      mood: "Joyful",
      imageUrl: "https://images.pexels.com/photos/5054646/pexels-photo-5054646.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      caption: "City lights below, our laughter above.",
      theme: "cinematic",
      favorite: true,
      createdAt: months(2),
      tags: ["#friends", "#nyc"],
      latitude: 40.6960, longitude: -73.9934,
    },
    {
      id: crypto.randomUUID(),
      title: "Cloud Line",
      description: "Six hours up. Lungs burning, knees gone, but the ridge made us forget our names.",
      location: "Tatra Mountains",
      mood: "Adventurous",
      imageUrl: "https://images.pexels.com/photos/2629320/pexels-photo-2629320.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      caption: "Where the trail ends, the sky begins.",
      theme: "boardingPass",
      favorite: false,
      createdAt: months(4),
      tags: ["#hiking", "#adventure"],
      latitude: 49.1833, longitude: 20.0833,
    },
    {
      id: crypto.randomUUID(),
      title: "Quiet Coast",
      description: "No phone signal. No agenda. Just shells, tea, and the slow language of waves.",
      location: "Algarve, Portugal",
      mood: "Peaceful",
      imageUrl: "https://images.pexels.com/photos/35256294/pexels-photo-35256294.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      caption: "Stillness, dressed in salt and gold.",
      theme: "minimal",
      favorite: false,
      createdAt: months(7),
      tags: ["#travel", "#solo"],
      latitude: 37.0171, longitude: -8.0016,
    },
    {
      id: crypto.randomUUID(),
      title: "Ossetia Crossing",
      description: "Two of us, a flask of coffee, and a country we couldn't pronounce. Perfect.",
      location: "North Ossetia",
      mood: "Reflective",
      imageUrl: "https://images.pexels.com/photos/8659357/pexels-photo-8659357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      caption: "The map ran out, but we kept walking anyway.",
      theme: "retro",
      favorite: true,
      createdAt: months(10),
      tags: ["#travel", "#wander"],
      latitude: 43.0543, longitude: 44.6676,
    },
  ];

  await withStore(STORE_MEMORIES, "readwrite", store => {
    seed.forEach(item => store.add(item));
    return Promise.resolve();
  });
}
