'use client';

import { CaughtItem } from '@/lib/fishing/types';
import { RARITY_COLORS, RARITY_NAMES } from '@/lib/fishing/constants';
import ReactCSSTransition from '@/components/CSSTransition';
import styles from '@/styles/fishing/LootPopup.module.css';

interface Props {
    caught: CaughtItem | null;
    onClick?: () => void;
}

export default function LootPopup({ caught, onClick }: Props) {
    const item = caught?.item;
    const weight = caught?.weight;
    const color = item ? RARITY_COLORS[item.rarity] : '#fff';

    return (
        <ReactCSSTransition
            state={!!caught}
            timeout={300}
            classNames={{
                exitActive: styles.hide
            }}
        >
            <div className={styles.lootOverlay} onClick={onClick}>
                <div className={styles.lootCard} style={{ borderColor: color + '44' }}>
                    {item && (
                        <>
                            <span className={styles.lootEmoji}>{item.emoji}</span>
                            <div className={styles.lootName} style={{ color }}>
                                {item.name}
                            </div>
                            <div className={styles.lootRarity} style={{ color }}>
                                {RARITY_NAMES[item.rarity]}
                            </div>
                            <div className={styles.lootDesc}>{item.description}</div>
                            {weight !== undefined && weight > 0 && (
                                <div className={styles.lootWeight}>Вес: {weight} кг</div>
                            )}
                            <div className={styles.lootPrice}>💰 Стоимость: {item.price}</div>
                            <div className={styles.lootHint}>Нажмите для продолжения</div>
                        </>
                    )}
                </div>
            </div>
        </ReactCSSTransition>
    );
}
