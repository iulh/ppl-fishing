'use client';

import { useState } from 'react';
import { InventoryEntry, PlayerData, UnobtainedInventoryEntry } from '@/lib/fishing/types';
import {
    RARITY_COLORS,
    RARITY_NAMES,
    RARITY_BG,
    ROD_UPGRADES
} from '@/lib/fishing/constants';
import ReactCSSTransition from '@/components/CSSTransition';
import styles from '@/styles/fishing/Inventory.module.css';

interface TabProps {
    entry: Partial<InventoryEntry> & UnobtainedInventoryEntry
    isSelected?: boolean;
    onClick?: () => void;
}

function InventoryTab({entry, isSelected, onClick}: TabProps) {
    const {item, count} = entry

    return <div
        className={`${styles.invItem} ${isSelected ? styles.invItemSelected : ''}`}
        style={{
            background: RARITY_BG[item.rarity],
            borderColor:
                RARITY_COLORS[item.rarity] + '44'
        }}
        title={item.name}
        onClick={onClick}
    >
        {item.emoji}
        {count != 1 ? (
            <span className={styles.invCount}>{count}</span>
        ) : <></>}
    </div>
}

interface InventoryProps {
    open: boolean;
    entries: InventoryEntry[];
    loading?: boolean;
    playerData: PlayerData;
    onClose: () => void;
    onSell: (itemId: string, count: number) => void;
    onUpgradeRod: () => void;
}

export default function Inventory({
    open,
    entries,
    loading,
    playerData,
    onClose,
    onSell,
    onUpgradeRod
}: InventoryProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tab, setTab] = useState<'inv' | 'rod'>('inv');

    /* Derive selected from entries so it's always fresh after sell */
    const selected = selectedId
        ? (entries.find(e => e.item.id === selectedId) ?? null)
        : null;

    const currentRod = ROD_UPGRADES[playerData.rodLevel] ?? ROD_UPGRADES[0];
    const nextRod = ROD_UPGRADES[playerData.rodLevel + 1] ?? null;

    return (
        <ReactCSSTransition
            state={open}
            timeout={300}
            classNames={{
                exitActive: styles.hide
            }}
        >
            <div className={styles.invPanel}>
                <div className={styles.invHeader}>
                    <div className={styles.invTabs}>
                        <button
                            className={`${styles.invTab} ${tab === 'inv' ? styles.invTabActive : ''}`}
                            onClick={() => setTab('inv')}
                        >
                            📦 Улов
                        </button>
                        <button
                            className={`${styles.invTab} ${tab === 'rod' ? styles.invTabActive : ''}`}
                            onClick={() => setTab('rod')}
                        >
                            🎣 Удочка
                        </button>
                    </div>
                    <button className={styles.invCloseBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

            {/* Coins bar */}
            <div className={styles.coinsBar}>💰 {playerData.coins} монет</div>

            {tab === 'inv' ? (
                <>
                    {loading ? (
                        <div className={styles.invEmpty}>Загрузка улова...</div>
                    ) : (
                        <div className={styles.invGrid}>
                            
                            {(entries.length === 0) ? entries.map(e => 
                                <InventoryTab key={e.item.id} entry={e} isSelected={selected?.item.id === e.item.id} onClick={() => setSelectedId(e.item.id)} />) : <></>}
                        </div>
                    )}

                    {selected != undefined ? (
                        <div className={styles.itemDetail}>
                            <div
                                className={styles.itemDetailName}
                                style={{
                                    color: RARITY_COLORS[selected.item.rarity]
                                }}
                            >
                                {selected.item.emoji} {selected.item.name}
                            </div>
                            <div
                                className={styles.itemDetailRarity}
                                style={{
                                    color: RARITY_COLORS[selected.item.rarity]
                                }}
                            >
                                {RARITY_NAMES[selected.item.rarity]}
                            </div>
                            <div className={styles.itemDetailDesc}>
                                {selected.item.description}
                            </div>
                            {selected.maxWeight > 0 && (
                                <div className={styles.itemDetailWeight}>
                                    Макс. вес: {selected.maxWeight} кг
                                </div>
                            )}
                            <div className={styles.sellRow}>
                                <span className={styles.sellPrice}>
                                    💰 {selected.item.price} за шт.
                                </span>
                                <button
                                    className={styles.sellBtn}
                                    onClick={() => {
                                        onSell(selected.item.id, 1);
                                        if (selected.count <= 1) setSelectedId(null);
                                    }}
                                >
                                    Продать 1 за {selected.item.price} 💰
                                </button>
                                {selected.count > 1 && (
                                    <button
                                        className={styles.sellAllBtn}
                                        onClick={() => {
                                            onSell(selected.item.id, selected.count);
                                            setSelectedId(null);
                                        }}
                                    >
                                        Все ({selected.count * selected.item.price}{' '}
                                        💰)
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : <></>}
                </>
            ) : (
                <div className={styles.rodPanel}>
                    <div className={styles.rodCurrent}>
                        <div className={styles.rodName}>🎣 {currentRod.name}</div>
                        <div className={styles.rodDesc}>
                            {currentRod.description}
                        </div>
                        {currentRod.resistanceReduction > 0 && (
                            <div className={styles.rodStat}>
                                Снижение сопротивления: −
                                {Math.round(currentRod.resistanceReduction * 100)}%
                            </div>
                        )}
                        {currentRod.rarityBoost > 0 && (
                            <div className={styles.rodStat}>
                                Шанс редкого улова: +
                                {Math.round(currentRod.rarityBoost * 100)}%
                            </div>
                        )}
                    </div>

                    {nextRod ? (
                        <div className={styles.rodUpgrade}>
                            <div className={styles.rodUpgradeTitle}>
                                Следующее улучшение:
                            </div>
                            <div className={styles.rodName}>🎣 {nextRod.name}</div>
                            <div className={styles.rodDesc}>
                                {nextRod.description}
                            </div>
                            <div className={styles.rodStat}>
                                Снижение сопротивления: −
                                {Math.round(nextRod.resistanceReduction * 100)}%
                            </div>
                            <div className={styles.rodStat}>
                                Шанс редкого улова: +
                                {Math.round(nextRod.rarityBoost * 100)}%
                            </div>
                            <button
                                className={`${styles.upgradeBtn} ${playerData.coins >= nextRod.cost ? '' : styles.upgradeBtnDisabled}`}
                                onClick={() => {
                                    if (playerData.coins >= nextRod.cost)
                                        onUpgradeRod();
                                }}
                                disabled={playerData.coins < nextRod.cost}
                            >
                                Улучшить за {nextRod.cost} 💰
                            </button>
                            {playerData.coins < nextRod.cost && (
                                <div className={styles.rodHint}>
                                    Не хватает {nextRod.cost - playerData.coins}{' '}
                                    монет
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.rodMaxed}>
                            ✨ Удочка максимального уровня!
                        </div>
                    )}
                </div>
            )}
            </div>
        </ReactCSSTransition>
    );
}
