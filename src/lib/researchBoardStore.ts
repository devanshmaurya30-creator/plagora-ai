export interface BoardCard {
  id: string;
  collectionId: string;
  documentId: string;
  versionId: string;
  analysisId: string;
  type: 'source' | 'evidence' | 'match' | 'claim' | 'citation' | 'note' | 'section' | 'review';
  title: string;
  snippet: string;
  entityId: string;
  metadata?: Record<string, any>;
  x: number;
  y: number;
  createdAt: string;
}

export interface BoardConnection {
  id: string;
  collectionId: string;
  fromCardId: string;
  toCardId: string;
  relationLabel: string;
}

export interface BoardCollection {
  id: string;
  name: string;
  type: 'Research Project' | 'Literature Review' | 'Thesis' | 'Assignment' | 'Report' | 'Custom';
  description?: string;
  createdAt: string;
}

const CARDS_KEY = 'plagora_board_cards_v1';
const CONNECTIONS_KEY = 'plagora_board_connections_v1';
const COLLECTIONS_KEY = 'plagora_board_collections_v1';

class ResearchBoardStore {
  private getStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }

  public getCollections(): BoardCollection[] {
    const collections = this.getStorage<BoardCollection>(COLLECTIONS_KEY);
    if (collections.length === 0) {
      const defaultColl: BoardCollection = {
        id: 'coll-default',
        name: 'Primary Research Project',
        type: 'Research Project',
        description: 'Default collection for current document investigation',
        createdAt: new Date().toISOString(),
      };
      this.saveStorage(COLLECTIONS_KEY, [defaultColl]);
      return [defaultColl];
    }
    return collections;
  }

  public createCollection(name: string, type: BoardCollection['type'], description?: string): BoardCollection {
    const collections = this.getCollections();
    const newColl: BoardCollection = {
      id: `coll-${Date.now()}`,
      name,
      type,
      description,
      createdAt: new Date().toISOString(),
    };
    collections.unshift(newColl);
    this.saveStorage(COLLECTIONS_KEY, collections);
    return newColl;
  }

  public getCards(collectionId: string, documentId?: string): BoardCard[] {
    const cards = this.getStorage<BoardCard>(CARDS_KEY);
    return cards.filter((c) => c.collectionId === collectionId && (!documentId || c.documentId === documentId));
  }

  public addCard(card: Omit<BoardCard, 'id' | 'createdAt'>): BoardCard {
    const cards = this.getStorage<BoardCard>(CARDS_KEY);
    const newCard: BoardCard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    cards.unshift(newCard);
    this.saveStorage(CARDS_KEY, cards);
    return newCard;
  }

  public updateCardPos(id: string, x: number, y: number): void {
    const cards = this.getStorage<BoardCard>(CARDS_KEY);
    const card = cards.find((c) => c.id === id);
    if (card) {
      card.x = x;
      card.y = y;
      this.saveStorage(CARDS_KEY, cards);
    }
  }

  public removeCard(id: string): void {
    const cards = this.getStorage<BoardCard>(CARDS_KEY);
    const filtered = cards.filter((c) => c.id !== id);
    this.saveStorage(CARDS_KEY, filtered);

    // Also remove connections attached to this card
    const connections = this.getStorage<BoardConnection>(CONNECTIONS_KEY);
    const filteredConn = connections.filter((conn) => conn.fromCardId !== id && conn.toCardId !== id);
    this.saveStorage(CONNECTIONS_KEY, filteredConn);
  }

  public getConnections(collectionId: string): BoardConnection[] {
    const connections = this.getStorage<BoardConnection>(CONNECTIONS_KEY);
    return connections.filter((c) => c.collectionId === collectionId);
  }

  public connectCards(collectionId: string, fromCardId: string, toCardId: string, relationLabel = 'Relates to'): BoardConnection {
    const connections = this.getStorage<BoardConnection>(CONNECTIONS_KEY);
    const newConn: BoardConnection = {
      id: `conn-${Date.now()}`,
      collectionId,
      fromCardId,
      toCardId,
      relationLabel,
    };
    connections.push(newConn);
    this.saveStorage(CONNECTIONS_KEY, connections);
    return newConn;
  }
}

export const researchBoardStore = new ResearchBoardStore();
