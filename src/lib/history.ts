import { get, set } from "idb-keyval";

export type HistoryItem = {
  id: string;
  kind: "estudio" | "colagem" | "oferta" | "legenda";
  title: string;
  image?: string; // data URL
  text?: string;
  createdAt: number;
};

const KEY = "afl-history";

export async function listHistory(): Promise<HistoryItem[]> {
  return ((await get(KEY)) as HistoryItem[] | undefined) ?? [];
}

export async function addHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  const all = await listHistory();
  all.unshift({ ...item, id: crypto.randomUUID(), createdAt: Date.now() });
  await set(KEY, all.slice(0, 200));
}

export async function removeHistory(id: string) {
  const all = await listHistory();
  await set(
    KEY,
    all.filter((i) => i.id !== id),
  );
}
