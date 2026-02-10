import { InventoryEntry, PlayerData } from './types';
import { LOOT_TABLE } from './constants';

const STORAGE_KEY = 'fishing_inventory';
const PLAYER_KEY = 'fishing_player';

/** Build a lookup map from LOOT_TABLE for fast hydration */
const LOOT_MAP = new Map(LOOT_TABLE.map(i => [i.id, i]));

function loadFromStorage(): InventoryEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const entries: InventoryEntry[] = JSON.parse(raw);
        /* Hydrate items against current LOOT_TABLE to pick up new fields (e.g. price) */
        return entries
            .map(e => {
                const fresh = LOOT_MAP.get(e.item.id);
                if (!fresh) return null;
                return { ...e, item: fresh };
            })
            .filter((e): e is InventoryEntry => e !== null);
    } catch (e) {
        console.warn('fishing: localStorage parse error', e);
    }
    return [];
}

function saveToStorage(entries: InventoryEntry[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
        console.warn('fishing: localStorage save error', e);
    }
}

function loadPlayerData(): PlayerData {
    try {
        const raw = localStorage.getItem(PLAYER_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            // Ensure new fields exist with defaults
            return {
                coins: data.coins ?? 0,
                rodLevel: data.rodLevel ?? 0,
                catchesWithoutBadge: data.catchesWithoutBadge ?? 0,
                hasBadge: data.hasBadge ?? false
            };
        }
    } catch (e) {
        console.warn('fishing: player data parse error', e);
    }
    return { coins: 0, rodLevel: 0, catchesWithoutBadge: 0, hasBadge: false };
}

function savePlayerData(data: PlayerData): void {
    try {
        localStorage.setItem(PLAYER_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('fishing: player data save error', e);
    }
}

export function apiLoadInventory(): Promise<InventoryEntry[]> {
    return Promise.resolve(loadFromStorage());
}

export function apiSaveInventory(entries: InventoryEntry[]): Promise<void> {
    saveToStorage(entries);
    return Promise.resolve();
}

export function apiLoadPlayerData(): Promise<PlayerData> {
    return Promise.resolve(loadPlayerData());
}

export function apiSavePlayerData(data: PlayerData): Promise<void> {
    savePlayerData(data);
    return Promise.resolve();
}
