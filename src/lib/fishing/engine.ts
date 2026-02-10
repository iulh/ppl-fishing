import {
    FullGameState,
    GameState,
    InputState,
    LootItem,
    Rarity,
    CloudData,
    FishSilhouetteData,
    CaughtItem
} from './types';
import {
    LOOT_TABLE,
    RARITY_WEIGHTS,
    DEFAULT_CONFIG,
    TOOLTIP_MESSAGES,
    BADGE_PITY_THRESHOLD
} from './constants';
import {
    updateBobberFlight,
    updateBobberFloat,
    calculateCastVelocity,
    calculateTension,
    calculateReelProgress
} from './physics';
import { soundManager } from './sounds';

/* ───── helpers ───── */

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function pickLoot(
    castPower: number,
    rodRarityBoost: number = 0,
    catchesWithoutBadge: number = 0,
    hasBadge: boolean = false
): LootItem {
    /* Pity system: guarantee fisherman badge after threshold */
    if (!hasBadge && catchesWithoutBadge >= BADGE_PITY_THRESHOLD) {
        const badge = LOOT_TABLE.find(i => i.id === 'fisherman_badge');
        if (badge) return badge;
    }

    /* castPower 0-100 → multiplier for rare+ weights: 1x at 0, up to 4x at 100 */
    const boost = 1 + (castPower / 100) * 3;
    /* rodRarityBoost adds a flat multiplier to rare+ drop rates */
    const rodBoost = 1 + rodRarityBoost;
    const weights: Record<string, number> = {
        [Rarity.COMMON]: RARITY_WEIGHTS[Rarity.COMMON] / boost / rodBoost,
        [Rarity.UNCOMMON]:
            RARITY_WEIGHTS[Rarity.UNCOMMON] * (1 + (boost - 1) * 0.5) * rodBoost,
        [Rarity.RARE]: RARITY_WEIGHTS[Rarity.RARE] * boost * rodBoost,
        [Rarity.EPIC]: RARITY_WEIGHTS[Rarity.EPIC] * boost * rodBoost,
        [Rarity.LEGENDARY]: RARITY_WEIGHTS[Rarity.LEGENDARY] * boost * rodBoost
    };
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    let rarity: Rarity = Rarity.COMMON;
    for (const [r, w] of Object.entries(weights)) {
        roll -= w;
        if (roll <= 0) {
            rarity = r as Rarity;
            break;
        }
    }
    const pool = LOOT_TABLE.filter(i => i.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
}

function makeClouds(n: number, cw: number, ch: number): CloudData[] {
    return Array.from({ length: n }, () => ({
        x: Math.random() * cw * 1.5 - cw * 0.25,
        y: 30 + Math.random() * ch * 0.2,
        width: 80 + Math.random() * 120,
        height: 30 + Math.random() * 40,
        speed: 5 + Math.random() * 15,
        opacity: 0.4 + Math.random() * 0.4
    }));
}

function makeFish(
    n: number,
    cw: number,
    wl: number,
    ch: number
): FishSilhouetteData[] {
    return Array.from({ length: n }, () => {
        const dir = Math.random() > 0.5 ? 1 : -1;
        return {
            x: Math.random() * cw,
            y: wl + 40 + Math.random() * (ch - wl - 80),
            speed: 20 + Math.random() * 40,
            size: 15 + Math.random() * 25,
            direction: dir,
            tailPhase: Math.random() * Math.PI * 2
        };
    });
}

/* ───── create initial state ───── */

export function createInitialState(cw: number, ch: number): FullGameState {
    const wl = ch * DEFAULT_CONFIG.waterLevelRatio;
    const bx = cw * 0.5;
    const by = wl - 10;
    return {
        gameState: GameState.IDLE,
        castPower: 0,
        bobber: {
            position: { x: bx + 60, y: by - 40 },
            velocity: { x: 0, y: 0 },
            isInWater: false,
            landedTime: 0
        },
        tension: 0,
        reelProgress: 0,
        biteTimer: 0,
        biteReactTimer: 0,
        currentLoot: null,
        currentWeight: 0,
        lastCatch: null,

        clouds: makeClouds(6, cw, ch),
        fishSilhouettes: makeFish(5, cw, wl, ch),
        bubbles: [],
        splashParticles: [],
        ripples: [],
        decorativeEvents: [],

        time: 0,
        waterLevel: wl,
        boatX: bx,
        boatY: by,
        rodTipX: bx + 60,
        rodTipY: by - 60,
        playerIdlePhase: 0,

        tooltipText: TOOLTIP_MESSAGES.idle,
        tooltipTimer: 0,
        showInstructions: true,

        fishResistTimer: 0,
        fishPulling: false,
        reelStartX: 0,

        totalCatches: 0,
        totalEscapes: 0,
        rodResistanceReduction: 0,
        rodRarityBoost: 0
    };
}

/* ───── main update ───── */

export function updateGame(
    state: FullGameState,
    input: InputState,
    dt: number,
    cw: number,
    playerData: { catchesWithoutBadge: number; hasBadge: boolean }
): FullGameState {
    dt = Math.min(dt, 0.05);
    let s = { ...state };
    s.time += dt;
    s.playerIdlePhase += dt;

    if (input.justPressed) soundManager.init();
    if (s.showInstructions && input.justPressed) s.showInstructions = false;

    /* visuals */
    s = tickClouds(s, dt, cw);
    s = tickFish(s, dt, cw);
    s = tickBubbles(s, dt);
    s = tickSplash(s, dt);
    s = tickRipples(s, dt);
    s = tickDecorative(s, dt, cw);

    if (Math.random() < 0.002) s = spawnDeco(s, cw);
    if (Math.random() < 0.05) s = spawnBubble(s, cw);

    /* state machine */
    switch (s.gameState) {
        case GameState.IDLE:
            return stIdle(s, input);
        case GameState.CASTING:
            return stCasting(s, input, dt);
        case GameState.FLYING:
            return stFlying(s, dt, playerData);
        case GameState.FLOATING:
            return stFloating(s, dt);
        case GameState.BITE:
            return stBite(s, input, dt);
        case GameState.REELING:
            return stReeling(s, input, dt);
        case GameState.CAUGHT:
            return stCaught(s, input);
        case GameState.ESCAPED:
            return stEscaped(s, input);
    }
    return s;
}

/* ───── state handlers ───── */

function resetBobber(s: FullGameState): FullGameState {
    return {
        ...s,
        gameState: GameState.IDLE,
        castPower: 0,
        bobber: {
            position: { x: s.boatX + 60, y: s.boatY - 40 },
            velocity: { x: 0, y: 0 },
            isInWater: false,
            landedTime: 0
        },
        tension: 0,
        reelProgress: 0,
        currentLoot: null,
        tooltipText: TOOLTIP_MESSAGES.idle
    };
}

function stIdle(s: FullGameState, inp: InputState): FullGameState {
    if (inp.justPressed) {
        return {
            ...s,
            gameState: GameState.CASTING,
            castPower: 0,
            tooltipText: TOOLTIP_MESSAGES.casting
        };
    }
    return { ...s, tooltipText: TOOLTIP_MESSAGES.idle };
}

function stCasting(s: FullGameState, inp: InputState, dt: number): FullGameState {
    let pw = s.castPower + DEFAULT_CONFIG.castChargeSpeed * dt;
    if (pw > 100) pw = 100;
    if (inp.justReleased || pw >= 100) {
        const vel = calculateCastVelocity(pw);
        soundManager.playSplash();
        return {
            ...s,
            gameState: GameState.FLYING,
            castPower: pw,
            bobber: {
                position: { x: s.rodTipX, y: s.rodTipY },
                velocity: vel,
                isInWater: false,
                landedTime: 0
            },
            tooltipText: ''
        };
    }
    return { ...s, castPower: pw, tooltipText: TOOLTIP_MESSAGES.casting };
}

function stFlying(
    s: FullGameState,
    dt: number,
    playerData: { catchesWithoutBadge: number; hasBadge: boolean }
): FullGameState {
    const nb = updateBobberFlight(
        s.bobber,
        DEFAULT_CONFIG.gravity,
        dt,
        s.waterLevel
    );
    if (nb.isInWater && !s.bobber.isInWater) {
        soundManager.playSplash();
        const sp = Array.from({ length: 8 }, () => ({
            x: nb.position.x,
            y: s.waterLevel,
            vx: (Math.random() - 0.5) * 100,
            vy: -50 - Math.random() * 100,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            size: 2 + Math.random() * 3
        }));
        return {
            ...s,
            gameState: GameState.FLOATING,
            bobber: nb,
            biteTimer: rand(DEFAULT_CONFIG.biteMinTime, DEFAULT_CONFIG.biteMaxTime),
            currentLoot: pickLoot(
                s.castPower,
                s.rodRarityBoost,
                playerData.catchesWithoutBadge,
                playerData.hasBadge
            ),
            splashParticles: [...s.splashParticles, ...sp],
            ripples: [
                ...s.ripples,
                {
                    x: nb.position.x,
                    y: s.waterLevel,
                    radius: 0,
                    maxRadius: 40,
                    opacity: 0.8
                }
            ],
            tooltipText: TOOLTIP_MESSAGES.floating
        };
    }
    return { ...s, bobber: nb };
}

function stFloating(s: FullGameState, dt: number): FullGameState {
    const bob = updateBobberFloat(s.bobber, s.waterLevel, s.time, dt, 2);
    const bt = s.biteTimer - dt;
    if (bt <= 0) {
        soundManager.playBite();
        return {
            ...s,
            gameState: GameState.BITE,
            bobber: bob,
            biteTimer: 0,
            biteReactTimer: DEFAULT_CONFIG.biteReactTime,
            tooltipText: TOOLTIP_MESSAGES.bite,
            ripples: [
                ...s.ripples,
                {
                    x: bob.position.x,
                    y: s.waterLevel,
                    radius: 0,
                    maxRadius: 30,
                    opacity: 1
                }
            ]
        };
    }
    return {
        ...s,
        bobber: bob,
        biteTimer: bt,
        tooltipText: TOOLTIP_MESSAGES.floating
    };
}

function stBite(s: FullGameState, inp: InputState, dt: number): FullGameState {
    const rt = s.biteReactTimer - dt;
    const dip = Math.sin(s.time * 15) * 8;
    const bob = {
        ...s.bobber,
        position: { x: s.bobber.position.x, y: s.waterLevel + dip }
    };

    if (inp.justPressed) {
        return {
            ...s,
            gameState: GameState.REELING,
            bobber: bob,
            tension: 20,
            reelProgress: 0,
            fishResistTimer: 0,
            fishPulling: false,
            reelStartX: bob.position.x,
            tooltipText: TOOLTIP_MESSAGES.reeling
        };
    }
    if (rt <= 0) {
        soundManager.playEscape();
        return {
            ...resetBobber(s),
            gameState: GameState.ESCAPED,
            tooltipText: TOOLTIP_MESSAGES.escaped,
            totalEscapes: s.totalEscapes + 1
        };
    }
    return { ...s, bobber: bob, biteReactTimer: rt };
}

function stReeling(s: FullGameState, inp: InputState, dt: number): FullGameState {
    if (!s.currentLoot) return resetBobber(s);
    const reeling = inp.isHolding;

    let frt = s.fishResistTimer - dt;
    let fp = s.fishPulling;
    if (frt <= 0) {
        fp = !fp;
        frt = DEFAULT_CONFIG.fishResistanceInterval * (0.5 + Math.random());
        if (fp) soundManager.playLineTension();
    }

    /* Higher cast power → fish resists harder, reel is slower */
    const powerFactor = 1 + (s.castPower / 100) * 0.8; /* 1.0 – 1.8 */
    const effectiveResistance = Math.max(
        0.01,
        s.currentLoot.resistance - s.rodResistanceReduction
    );
    const tension = calculateTension(
        s.tension,
        reeling,
        effectiveResistance * powerFactor,
        fp,
        DEFAULT_CONFIG.tensionIncreaseRate,
        DEFAULT_CONFIG.tensionDecayRate,
        dt
    );
    const reel = calculateReelProgress(
        s.reelProgress,
        reeling,
        tension,
        DEFAULT_CONFIG.reelSpeed / powerFactor,
        dt
    );

    if (reeling && Math.random() < 0.3) soundManager.playReelClick();

    const pr = reel / 100;
    const endX = s.boatX + 60;

    const bob = {
        ...s.bobber,
        position: {
            x: s.reelStartX + (endX - s.reelStartX) * pr,
            y: s.waterLevel + Math.sin(s.time * 3) * (fp ? 6 : 2) - pr * 10
        }
    };

    if (tension >= 100 || tension <= 0) {
        soundManager.playEscape();
        return {
            ...resetBobber(s),
            gameState: GameState.ESCAPED,
            tooltipText: TOOLTIP_MESSAGES.escaped,
            totalEscapes: s.totalEscapes + 1
        };
    }

    if (reel >= 100) {
        const item = s.currentLoot;
        let w = 0;
        if (item.isFish && item.weight) {
            w = Math.round(rand(item.weight.min, item.weight.max) * 100) / 100;
        }
        soundManager.playCatch(item.rarity);

        const caught: CaughtItem = {
            item,
            weight: w || undefined,
            timestamp: Date.now()
        };
        const sp = Array.from({ length: 12 }, () => ({
            x: bob.position.x,
            y: s.waterLevel,
            vx: (Math.random() - 0.5) * 150,
            vy: -80 - Math.random() * 120,
            life: 0.8 + Math.random() * 0.5,
            maxLife: 1.3,
            size: 2 + Math.random() * 4
        }));
        return {
            ...resetBobber(s),
            gameState: GameState.CAUGHT,
            lastCatch: caught,
            currentWeight: w,
            tooltipText: TOOLTIP_MESSAGES.caught,
            totalCatches: s.totalCatches + 1,
            splashParticles: [...s.splashParticles, ...sp]
        };
    }

    return {
        ...s,
        bobber: bob,
        tension,
        reelProgress: reel,
        fishResistTimer: frt,
        fishPulling: fp,
        tooltipText: TOOLTIP_MESSAGES.reeling
    };
}

function stCaught(s: FullGameState, inp: InputState): FullGameState {
    if (inp.justPressed) return resetBobber(s);
    return s;
}

function stEscaped(s: FullGameState, inp: InputState): FullGameState {
    if (inp.justPressed) return resetBobber(s);
    return s;
}

/* ───── visual tickers ───── */

function tickClouds(s: FullGameState, dt: number, cw: number): FullGameState {
    return {
        ...s,
        clouds: s.clouds.map(c => {
            let x = c.x + c.speed * dt;
            if (x > cw + c.width) x = -c.width;
            return { ...c, x };
        })
    };
}

function tickFish(s: FullGameState, dt: number, cw: number): FullGameState {
    return {
        ...s,
        fishSilhouettes: s.fishSilhouettes.map(f => {
            let x = f.x + f.speed * f.direction * dt;
            const tp = f.tailPhase + dt * 5;
            if (x > cw + 50 || x < -50) x = f.direction > 0 ? -50 : cw + 50;
            return { ...f, x, tailPhase: tp };
        })
    };
}

function tickBubbles(s: FullGameState, dt: number): FullGameState {
    return {
        ...s,
        bubbles: s.bubbles
            .map(b => ({
                ...b,
                y: b.y - b.speed * dt,
                opacity: b.opacity - 0.2 * dt
            }))
            .filter(b => b.opacity > 0 && b.y > s.waterLevel - 20)
    };
}

function tickSplash(s: FullGameState, dt: number): FullGameState {
    return {
        ...s,
        splashParticles: s.splashParticles
            .map(p => ({
                ...p,
                x: p.x + p.vx * dt,
                y: p.y + p.vy * dt,
                vy: p.vy + 300 * dt,
                life: p.life - dt
            }))
            .filter(p => p.life > 0)
    };
}

function tickRipples(s: FullGameState, dt: number): FullGameState {
    return {
        ...s,
        ripples: s.ripples
            .map(r => ({
                ...r,
                radius: r.radius + 40 * dt,
                opacity: r.opacity - 0.8 * dt
            }))
            .filter(r => r.opacity > 0)
    };
}

function tickDecorative(s: FullGameState, dt: number, cw: number): FullGameState {
    return {
        ...s,
        decorativeEvents: s.decorativeEvents
            .map(e =>
                e.type === 'jumping_fish'
                    ? { ...e, progress: e.progress + dt * e.speed }
                    : {
                          ...e,
                          x: e.x + e.speed * e.direction * dt,
                          progress: e.progress + dt * 0.1
                      }
            )
            .filter(e =>
                e.type === 'jumping_fish'
                    ? e.progress < 1
                    : e.x > -100 && e.x < cw + 100
            )
    };
}

function spawnDeco(s: FullGameState, cw: number): FullGameState {
    const evts = [...s.decorativeEvents];
    if (Math.random() > 0.5) {
        evts.push({
            type: 'jumping_fish',
            x: 100 + Math.random() * (cw - 200),
            y: s.waterLevel,
            progress: 0,
            speed: 0.8 + Math.random() * 0.5,
            direction: Math.random() > 0.5 ? 1 : -1,
            size: 10 + Math.random() * 15
        });
    } else {
        const d = Math.random() > 0.5 ? 1 : -1;
        evts.push({
            type: 'log',
            x: d > 0 ? -80 : cw + 80,
            y: s.waterLevel,
            progress: 0,
            speed: 15 + Math.random() * 10,
            direction: d,
            size: 40 + Math.random() * 30
        });
    }
    return { ...s, decorativeEvents: evts };
}

function spawnBubble(s: FullGameState, cw: number): FullGameState {
    return {
        ...s,
        bubbles: [
            ...s.bubbles,
            {
                x: 50 + Math.random() * (cw - 100),
                y: s.waterLevel + 30 + Math.random() * 150,
                size: 2 + Math.random() * 4,
                speed: 20 + Math.random() * 30,
                opacity: 0.3 + Math.random() * 0.4
            }
        ]
    };
}
