import { Vec2, BobberPhysics } from './types';

export function updateBobberFlight(
    bobber: BobberPhysics,
    gravity: number,
    dt: number,
    waterLevel: number
): BobberPhysics {
    if (bobber.isInWater) return bobber;

    const newVy = bobber.velocity.y + gravity * dt;
    const newX = bobber.position.x + bobber.velocity.x * dt;
    const newY = bobber.position.y + newVy * dt;

    if (newY >= waterLevel) {
        return {
            position: { x: newX, y: waterLevel },
            velocity: { x: 0, y: 0 },
            isInWater: true,
            landedTime: 0
        };
    }

    return {
        ...bobber,
        position: { x: newX, y: newY },
        velocity: { x: bobber.velocity.x * 0.999, y: newVy }
    };
}

export function updateBobberFloat(
    bobber: BobberPhysics,
    waterLevel: number,
    time: number,
    dt: number,
    driftSpeed: number = 0.3
): BobberPhysics {
    if (!bobber.isInWater) return bobber;
    const wave = Math.sin(time * 2 + bobber.position.x * 0.05) * 3;
    const newX = bobber.position.x + driftSpeed * dt;
    return {
        ...bobber,
        position: { x: newX, y: waterLevel + wave },
        landedTime: bobber.landedTime + dt
    };
}

export function calculateCastVelocity(power: number): Vec2 {
    const norm = power / 100;
    const speed = 200 + norm * 400;
    const angle = -Math.PI / 4 - (norm * Math.PI) / 8;
    return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

export function getWaveSurfaceY(base: number, x: number, time: number): number {
    return (
        base +
        Math.sin(time * 1.5 + x * 0.02) * 3 +
        Math.sin(time * 2.5 + x * 0.04) * 1.5 +
        Math.sin(time * 0.5 + x * 0.01) * 5
    );
}

export function calculateTension(
    current: number,
    isReeling: boolean,
    fishResistance: number,
    fishPulling: boolean,
    incRate: number,
    decRate: number,
    dt: number
): number {
    let t = current;
    if (isReeling) t += incRate * dt;
    else t -= decRate * dt;
    if (fishPulling) t += fishResistance * 25 * dt;
    return Math.max(0, Math.min(100, t));
}

export function calculateReelProgress(
    current: number,
    isReeling: boolean,
    tension: number,
    speed: number,
    dt: number
): number {
    let p = current;
    if (isReeling && tension < 95) {
        const eff = tension > 70 ? 0.5 : tension > 40 ? 1.0 : 0.7;
        p += speed * eff * dt;
    } else if (!isReeling) {
        p -= 3 * dt;
    }
    return Math.max(0, Math.min(100, p));
}
