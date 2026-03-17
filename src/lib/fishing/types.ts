export enum GameState {
    IDLE = 'idle',
    CASTING = 'casting',
    FLYING = 'flying',
    FLOATING = 'floating',
    BITE = 'bite',
    REELING = 'reeling',
    CAUGHT = 'caught',
    ESCAPED = 'escaped'
}

export enum Rarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export interface LootItem {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    emoji: string;
    isFish: boolean;
    weight?: { min: number; max: number };
    resistance: number;
    price: number;
}

export interface CaughtItem {
    item: LootItem;
    weight?: number;
    timestamp: number;
}

export interface UnobtainedInventoryEntry {
    item: LootItem;
}

export type InventoryEntry = {
    count: number;
    lastCaught: number;
    maxWeight: number;
} & UnobtainedInventoryEntry

export interface RodUpgrade {
    level: number;
    name: string;
    cost: number;
    resistanceReduction: number;
    rarityBoost: number;
    description: string;
}

export interface PlayerData {
    coins: number;
    rodLevel: number;
    catchesWithoutBadge: number;
    hasBadge: boolean;
    pendingBadgeAchievement: boolean;
}

export interface Vec2 {
    x: number;
    y: number;
}

export interface InputState {
    isHolding: boolean;
    justPressed: boolean;
    justReleased: boolean;
}

export interface BobberPhysics {
    position: Vec2;
    velocity: Vec2;
    isInWater: boolean;
    landedTime: number;
}

export interface CloudData {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    opacity: number;
}

export interface FishSilhouetteData {
    x: number;
    y: number;
    speed: number;
    size: number;
    direction: number;
    tailPhase: number;
}

export interface BubbleData {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

export interface SplashParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
}

export interface RippleData {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    opacity: number;
}

export interface DecorativeEvent {
    type: 'jumping_fish' | 'log';
    x: number;
    y: number;
    progress: number;
    speed: number;
    direction: number;
    size: number;
}

export interface GameConfig {
    waterLevelRatio: number;
    gravity: number;
    castChargeSpeed: number;
    biteMinTime: number;
    biteMaxTime: number;
    biteReactTime: number;
    reelSpeed: number;
    tensionDecayRate: number;
    tensionIncreaseRate: number;
    fishResistanceInterval: number;
}

export interface FullGameState {
    gameState: GameState;
    castPower: number;
    bobber: BobberPhysics;
    tension: number;
    reelProgress: number;
    biteTimer: number;
    biteReactTimer: number;
    currentLoot: LootItem | null;
    currentWeight: number;
    lastCatch: CaughtItem | null;

    clouds: CloudData[];
    fishSilhouettes: FishSilhouetteData[];
    bubbles: BubbleData[];
    splashParticles: SplashParticle[];
    ripples: RippleData[];
    decorativeEvents: DecorativeEvent[];

    time: number;
    waterLevel: number;
    boatX: number;
    boatY: number;
    rodTipX: number;
    rodTipY: number;
    playerIdlePhase: number;

    tooltipText: string;
    tooltipTimer: number;
    showInstructions: boolean;

    fishResistTimer: number;
    fishPulling: boolean;
    reelStartX: number;

    totalCatches: number;
    totalEscapes: number;
    rodResistanceReduction: number;
    rodRarityBoost: number;
}
