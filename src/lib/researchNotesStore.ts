import type { ResearchNote } from '../types/research';

const STORAGE_KEY = 'plagora_research_notes_v1';

class ResearchNotesStore {
  private getStorage(): ResearchNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveStorage(notes: ResearchNote[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save research notes:', e);
    }
  }

  public getNotes(documentId: string, versionId?: string): ResearchNote[] {
    const notes = this.getStorage();
    return notes.filter((n) => n.documentId === documentId && (!versionId || n.versionId === versionId));
  }

  public getNotesForEntity(documentId: string, entityId: string): ResearchNote[] {
    const notes = this.getStorage();
    return notes.filter((n) => n.documentId === documentId && n.entityId === entityId);
  }

  public addNote(note: Omit<ResearchNote, 'id' | 'createdAt' | 'updatedAt'>): ResearchNote {
    const notes = this.getStorage();
    const newNote: ResearchNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    this.saveStorage(notes);
    return newNote;
  }

  public updateNote(id: string, content: string, tags?: string[]): ResearchNote | null {
    const notes = this.getStorage();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;

    notes[idx] = {
      ...notes[idx],
      content,
      tags: tags !== undefined ? tags : notes[idx].tags,
      updatedAt: new Date().toISOString(),
    };

    this.saveStorage(notes);
    return notes[idx];
  }

  public deleteNote(id: string): boolean {
    const notes = this.getStorage();
    const filtered = notes.filter((n) => n.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveStorage(filtered);
    return true;
  }

  public searchNotes(documentId: string, query: string): ResearchNote[] {
    if (!query.trim()) return this.getNotes(documentId);
    const q = query.toLowerCase();
    return this.getNotes(documentId).filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        (n.entityTitle && n.entityTitle.toLowerCase().includes(q)) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}

export const researchNotesStore = new ResearchNotesStore();
