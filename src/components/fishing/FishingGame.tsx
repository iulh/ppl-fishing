'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import {
    FullGameState,
    GameState,
    InputState,
    InventoryEntry,
    CaughtItem,
    PlayerData
} from '@/lib/fishing/types';
import { createInitialState, updateGame } from '@/lib/fishing/engine';
import { render } from '@/lib/fishing/renderer';
import {
    apiLoadInventory,
    apiSaveInventory,
    apiLoadPlayerData,
    apiSavePlayerData
} from '@/lib/fishing/api';
import {
    ROD_UPGRADES,
    BADGE_ESCAPE_PENALTY_MIN,
    BADGE_ESCAPE_PENALTY_MAX
} from '@/lib/fishing/constants';
import Inventory from './Inventory';
import LootPopup from './LootPopup';
import EscapedPopup from './EscapedPopup';
import styles from '@/styles/fishing/FishingGame.module.css';

const CANVAS_W = 1000;
const CANVAS_H = 580;

export default function FishingGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<FullGameState | null>(null);
    const sizeRef = useRef({ w: CANVAS_W, h: CANVAS_H });
    const inputRef = useRef<InputState>({
        isHolding: false,
        justPressed: false,
        justReleased: false
    });
    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const addToInvRef = useRef<(c: CaughtItem) => void>(() => {});
    const rodReductionRef = useRef(0);
    const playerDataRef = useRef<PlayerData>({
        coins: 0,
        rodLevel: 0,
        catchesWithoutBadge: 0,
        hasBadge: false
    });

    const [invOpen, setInvOpen] = useState(false);
    const [inventory, setInventory] = useState<InventoryEntry[]>([]);
    const [invLoading, setInvLoading] = useState(true);
    const [playerData, setPlayerData] = useState<PlayerData>({
        coins: 0,
        rodLevel: 0,
        catchesWithoutBadge: 0,
        hasBadge: false
    });
    const [displayState, setDisplayState] = useState<GameState>(GameState.IDLE);
    const [lastCatch, setLastCatch] = useState<CaughtItem | null>(null);

    /* ── inventory management ── */
    const addToInventory = useCallback((c: CaughtItem) => {
        setInventory(prev => {
            const idx = prev.findIndex(e => e.item.id === c.item.id);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = {
                    ...copy[idx],
                    count: copy[idx].count + 1,
                    lastCaught: c.timestamp,
                    maxWeight: Math.max(copy[idx].maxWeight, c.weight ?? 0)
                };
                return copy;
            }
            return [
                ...prev,
                {
                    item: c.item,
                    count: 1,
                    lastCaught: c.timestamp,
                    maxWeight: c.weight ?? 0
                }
            ];
        });
    }, []);

    /* ── load inventory & player data from API on mount ── */
    useEffect(() => {
        Promise.all([apiLoadInventory(), apiLoadPlayerData()])
            .then(([entries, pd]) => {
                console.log('📂 Loading player data from storage:', pd);
                setInventory(entries);
                setPlayerData(pd);
            })
            .finally(() => setInvLoading(false));
    }, []);

    /* ── save inventory on changes (skip initial load) ── */
    const initialLoadDone = useRef(false);
    useEffect(() => {
        if (invLoading) return;
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            return;
        }
        apiSaveInventory(inventory);
    }, [inventory, invLoading]);

    /* ── save player data on changes ── */
    const playerDataInitDone = useRef(false);
    useEffect(() => {
        if (invLoading) return;
        if (!playerDataInitDone.current) {
            playerDataInitDone.current = true;
            console.log('📊 Player data loaded:', playerData);
            return;
        }
        console.log('💾 Saving player data:', playerData);
        apiSavePlayerData(playerData);
    }, [playerData, invLoading]);

    /* ── sell items ── */
    const handleSell = useCallback((itemId: string, count: number) => {
        setInventory(prev => {
            const idx = prev.findIndex(e => e.item.id === itemId);
            if (idx < 0) return prev;
            const entry = prev[idx];
            const sellCount = Math.min(count, entry.count);
            const earned = sellCount * entry.item.price;
            setPlayerData(pd => ({ ...pd, coins: pd.coins + earned }));
            if (entry.count <= sellCount) {
                return prev.filter((_, i) => i !== idx);
            }
            const copy = [...prev];
            copy[idx] = { ...copy[idx], count: copy[idx].count - sellCount };
            return copy;
        });
    }, []);

    /* ── upgrade rod ── */
    const handleUpgradeRod = useCallback(() => {
        setPlayerData(pd => {
            const nextRod = ROD_UPGRADES[pd.rodLevel + 1];
            if (!nextRod || pd.coins < nextRod.cost) return pd;
            return {
                ...pd,
                coins: pd.coins - nextRod.cost,
                rodLevel: pd.rodLevel + 1
            };
        });
    }, []);

    /* ── input handlers ── */
    const onDown = useCallback(() => {
        const inp = inputRef.current;
        if (!inp.isHolding) inp.justPressed = true;
        inp.isHolding = true;
    }, []);

    const onUp = useCallback(() => {
        const inp = inputRef.current;
        if (inp.isHolding) inp.justReleased = true;
        inp.isHolding = false;
    }, []);

    /** Quick press+release — for UI buttons / popup dismiss */
    const onTap = useCallback(() => {
        const inp = inputRef.current;
        inp.justPressed = true;
        inp.justReleased = true;
        inp.isHolding = false;
    }, []);

    const onKey = useCallback(
        (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                if (e.type === 'keydown' && !e.repeat) onDown();
                if (e.type === 'keyup') onUp();
            }
            if (e.code === 'KeyI' && e.type === 'keydown') {
                setInvOpen(p => !p);
            }
        },
        [onDown, onUp]
    );

    /* ── keep addToInventory ref fresh ── */
    useEffect(() => {
        addToInvRef.current = addToInventory;
    }, [addToInventory]);

    /* ── keep rod reduction ref in sync ── */
    const rodBoostRef = useRef(0);
    useEffect(() => {
        const rod = ROD_UPGRADES[playerData.rodLevel] ?? ROD_UPGRADES[0];
        rodReductionRef.current = rod.resistanceReduction;
        rodBoostRef.current = rod.rarityBoost;
    }, [playerData.rodLevel]);

    /* ── keep playerData ref in sync ── */
    useEffect(() => {
        playerDataRef.current = playerData;
    }, [playerData]);

    /* ── resize canvas to fill viewport ── */
    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            const w = wrap!.clientWidth;
            const h = wrap!.clientHeight;
            canvas!.width = w * dpr;
            canvas!.height = h * dpr;
            canvas!.style.width = w + 'px';
            canvas!.style.height = h + 'px';
            const ctx = canvas!.getContext('2d');
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            sizeRef.current = { w, h };

            /* update dimension-dependent fields without resetting game */
            const s = stateRef.current;
            if (s) {
                const wl = h * 0.55;
                const bx = w * 0.5;
                const by = wl - 10;
                s.waterLevel = wl;
                s.boatX = bx;
                s.boatY = by;
                s.rodTipX = bx + 60;
                s.rodTipY = by - 60;
            }
        }

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);
        return () => ro.disconnect();
    }, []);

    /* ── game loop (runs once) ── */
    useEffect(() => {
        console.log('🎮 Game loop started');

        function loop(time: number) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (!stateRef.current) {
                stateRef.current = createInitialState(
                    sizeRef.current.w,
                    sizeRef.current.h
                );
                lastTimeRef.current = time;
                console.log('🎲 Game state initialized');
            }

            const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = time;

            const cw = sizeRef.current.w;
            const ch = sizeRef.current.h;
            const prevState = stateRef.current;
            prevState.rodResistanceReduction = rodReductionRef.current;
            prevState.rodRarityBoost = rodBoostRef.current;
            const inp = { ...inputRef.current };
            const newState = updateGame(prevState, inp, dt, cw, {
                catchesWithoutBadge: playerDataRef.current.catchesWithoutBadge,
                hasBadge: playerDataRef.current.hasBadge
            });

            inputRef.current.justPressed = false;
            inputRef.current.justReleased = false;

            if (
                newState.gameState === GameState.CAUGHT &&
                prevState.gameState !== GameState.CAUGHT &&
                newState.lastCatch
            ) {
                console.log('🎣 Caught something!', newState.lastCatch);
                addToInvRef.current(newState.lastCatch);
                setLastCatch(newState.lastCatch);

                const caughtItem = newState.lastCatch.item;
                console.log('📦 Item details:', {
                    id: caughtItem.id,
                    name: caughtItem.name,
                    isFish: caughtItem.isFish
                });

                // Check if fisherman badge was caught
                if (caughtItem.id === 'fisherman_badge') {
                    console.log('🎖️ Fisherman badge caught! Resetting progress.');
                    setPlayerData(pd => ({
                        ...pd,
                        hasBadge: true,
                        catchesWithoutBadge: 0
                    }));

                    fetch('/api/v1/users/@me/fisherman-badge', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log('Fisherman badge achievement sent:', data);
                        })
                        .catch(err => {
                            console.error('Failed to send fisherman badge achievement:', err);
                        });
                } else if (caughtItem.isFish) {
                    // Increment catch counter only for fish (not badge, not trash)
                    setPlayerData(pd => {
                        const newCount = pd.catchesWithoutBadge + 1;
                        console.log(`🐟 Fish caught! Progress: ${newCount}/50`);
                        return {
                            ...pd,
                            catchesWithoutBadge: newCount
                        };
                    });
                }
            }
            if (
                newState.gameState === GameState.ESCAPED &&
                prevState.gameState !== GameState.ESCAPED
            ) {
                console.log('💨 Fish escaped!');

                // Check if the escaped item was fisherman badge - penalize progress
                if (prevState.currentLoot?.id === 'fisherman_badge') {
                    const range = BADGE_ESCAPE_PENALTY_MAX - BADGE_ESCAPE_PENALTY_MIN + 1;
                    const penalty = Math.floor(Math.random() * range) + BADGE_ESCAPE_PENALTY_MIN;
                    setPlayerData(pd => {
                        const newProgress = Math.max(0, pd.catchesWithoutBadge - penalty);
                        console.log(
                            `😱 FISHERMAN BADGE ESCAPED! Progress penalty: -${penalty} (${pd.catchesWithoutBadge} → ${newProgress})`
                        );
                        return {
                            ...pd,
                            catchesWithoutBadge: newProgress
                        };
                    });
                }

                setLastCatch(null);
            }
            if (
                newState.gameState === GameState.IDLE &&
                prevState.gameState !== GameState.IDLE
            ) {
                console.log('⏸️ Returned to idle state');
                setLastCatch(null);
            }

            // Log state transitions
            if (prevState.gameState !== newState.gameState) {
                console.log(`🔄 State: ${prevState.gameState} → ${newState.gameState}`);
            }

            stateRef.current = newState;
            setDisplayState(newState.gameState);

            render(ctx, newState, cw, ch, {
                catchesWithoutBadge: playerDataRef.current.catchesWithoutBadge,
                hasBadge: playerDataRef.current.hasBadge
            });
            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKey);
        };
    }, [onKey]);

    return (
        <div className={styles.container}>
            <div className={styles.canvasWrap} ref={wrapRef}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={e => {
                        e.preventDefault();
                        setInvOpen(false);
                        onDown();
                    }}
                    onMouseUp={onUp}
                    onTouchStart={e => {
                        e.preventDefault();
                        setInvOpen(false);
                        onDown();
                    }}
                    onTouchEnd={onUp}
                    style={{ cursor: 'pointer' }}
                />

                {/* UI overlay buttons */}
                <button
                    className={styles.invBtn}
                    onClick={() => setInvOpen(p => !p)}
                    title="Инвентарь (I)"
                >
                    📦
                </button>

                {/* Inventory panel */}
                <Inventory
                    open={invOpen}
                    entries={inventory}
                    loading={invLoading}
                    playerData={playerData}
                    onClose={() => setInvOpen(false)}
                    onSell={handleSell}
                    onUpgradeRod={handleUpgradeRod}
                />

                {/* Loot popup */}
                <LootPopup
                    caught={displayState === GameState.CAUGHT ? lastCatch : null}
                    onClick={onTap}
                />

                {/* Escaped popup */}
                <EscapedPopup gameState={displayState} onClick={onTap} />
            </div>
        </div>
    );
}
