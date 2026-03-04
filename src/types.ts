export type EntryType = 'text' | 'image' | 'document' | 'note';

export interface AIEntry {
  id: number;
  title: string;
  content: string;
  type: EntryType;
  source_tool: string;
  tags: string[];
  category: string;
  is_favorite: boolean;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryDTO {
  title: string;
  content?: string;
  type: EntryType;
  source_tool?: string;
  tags?: string[];
  category?: string;
  file_path?: string;
}
