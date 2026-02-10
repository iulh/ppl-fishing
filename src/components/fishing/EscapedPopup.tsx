'use client';

import { GameState } from '@/lib/fishing/types';
import styles from '@/styles/fishing/fishing.module.css';

interface Props {
    gameState: GameState;
    onClick?: () => void;
}

export default function EscapedPopup({ gameState, onClick }: Props) {
    if (gameState !== GameState.ESCAPED) return null;

    return (
        <div className={styles.escapedOverlay} onClick={onClick}>
            <div className={styles.escapedCard}>
                <span className={styles.lootEmoji}>💨</span>
                <div className={styles.lootName}>Сорвалась!</div>
                <div className={styles.lootDesc} style={{ color: '#aaa' }}>
                    Рыба ушла... Попробуйте ещё раз!
                </div>
                <div className={styles.lootHint}>Нажмите для продолжения</div>
            </div>
        </div>
    );
}
