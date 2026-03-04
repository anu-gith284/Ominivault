import { AIEntry, CreateEntryDTO } from "../types";

export const vaultService = {
  async getEntries(): Promise<AIEntry[]> {
    const response = await fetch("/api/entries");
    if (!response.ok) throw new Error("Failed to fetch entries");
    return response.json();
  },

  async createEntry(entry: CreateEntryDTO): Promise<AIEntry> {
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error("Failed to create entry");
    return response.json();
  },

  async toggleFavorite(id: number, isFavorite: boolean): Promise<AIEntry> {
    const response = await fetch(`/api/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: isFavorite }),
    });
    if (!response.ok) throw new Error("Failed to update favorite");
    return response.json();
  },

  async deleteEntry(id: number): Promise<void> {
    const response = await fetch(`/api/entries/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete entry");
  },

  async updateEntry(id: number, updates: Partial<AIEntry>): Promise<AIEntry> {
    const response = await fetch(`/api/entries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update entry");
    return response.json();
  }
};
