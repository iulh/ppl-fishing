import { FullGameState, GameState } from './types';
import { getWaveSurfaceY } from './physics';

/* ────────────────────────────
   Main render entry
   ──────────────────────────── */

export function render(
    ctx: CanvasRenderingContext2D,
    s: FullGameState,
    w: number,
    h: number,
    playerData?: { catchesWithoutBadge: number; hasBadge: boolean }
): void {
    ctx.clearRect(0, 0, w, h);
    const wl = s.waterLevel;

    drawSky(ctx, w, h, wl, s.time);
    drawSun(ctx, w, s.time);
    drawClouds(ctx, s);
    drawHills(ctx, w, wl);
    drawWater(ctx, w, h, wl, s.time);
    drawUnderwaterFish(ctx, s);
    drawBubbles(ctx, s);
    drawDecorativeEvents(ctx, s, wl);
    drawRipples(ctx, s);
    drawPlayer(ctx, s.boatX, wl, s);
    drawBoat(ctx, s.boatX, wl, s.time);
    drawRodAndLine(ctx, s, wl);
    drawBobber(ctx, s);
    drawSplashParticles(ctx, s);
    drawHUD(ctx, s, w, h, playerData);
}

/* ────────────────────────────
   Sky
   ──────────────────────────── */

function drawSky(
    ctx: CanvasRenderingContext2D,
    w: number,
    _h: number,
    wl: number,
    time: number
): void {
    const grad = ctx.createLinearGradient(0, 0, 0, wl);
    const hue = 210 + Math.sin(time * 0.05) * 5;
    grad.addColorStop(0, `hsl(${hue}, 60%, 65%)`);
    grad.addColorStop(1, `hsl(${hue + 10}, 70%, 85%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, wl);
}

/* ────────────────────────────
   Sun
   ──────────────────────────── */

function drawSun(ctx: CanvasRenderingContext2D, w: number, time: number): void {
    const sx = w * 0.82;
    const sy = 70;
    const pulse = 40 + Math.sin(time * 0.3) * 4;

    ctx.save();
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, pulse * 2);
    glow.addColorStop(0, 'rgba(255,240,150,0.4)');
    glow.addColorStop(1, 'rgba(255,240,150,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - pulse * 2, sy - pulse * 2, pulse * 4, pulse * 4);

    ctx.beginPath();
    ctx.arc(sx, sy, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#fff4a3';
    ctx.fill();
    ctx.restore();
}

/* ────────────────────────────
   Clouds
   ──────────────────────────── */

function drawClouds(ctx: CanvasRenderingContext2D, s: FullGameState): void {
    for (const c of s.clouds) {
        ctx.save();
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = '#fff';
        const cx = c.x;
        const cy = c.y;
        ellipse(ctx, cx, cy, c.width * 0.5, c.height * 0.4);
        ellipse(ctx, cx - c.width * 0.25, cy + 5, c.width * 0.35, c.height * 0.35);
        ellipse(ctx, cx + c.width * 0.25, cy + 3, c.width * 0.3, c.height * 0.3);
        ctx.restore();
    }
}

/* ────────────────────────────
   Distant hills
   ──────────────────────────── */

function drawHills(ctx: CanvasRenderingContext2D, w: number, wl: number): void {
    const base = wl - 10;
    ctx.save();
    ctx.fillStyle = '#5a8f5a';
    ctx.beginPath();
    ctx.moveTo(0, wl);
    for (let x = 0; x <= w; x += 4) {
        const y =
            base -
            20 -
            Math.sin(x * 0.008) * 25 -
            Math.sin(x * 0.003 + 1) * 15 -
            Math.cos(x * 0.012) * 10;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, wl);
    ctx.closePath();
    ctx.fill();

    /* trees */
    ctx.fillStyle = '#3d6e3d';
    for (let x = 30; x < w; x += 60 + Math.sin(x) * 20) {
        const tb =
            base -
            20 -
            Math.sin(x * 0.008) * 25 -
            Math.sin(x * 0.003 + 1) * 15 -
            Math.cos(x * 0.012) * 10;
        const th = 15 + Math.sin(x * 0.7) * 8;
        ctx.beginPath();
        ctx.moveTo(x, tb);
        ctx.lineTo(x - 6, tb);
        ctx.lineTo(x, tb - th);
        ctx.lineTo(x + 6, tb);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

/* ────────────────────────────
   Water
   ──────────────────────────── */

function drawWater(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    wl: number,
    time: number
): void {
    /* wave surface */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, wl);
    for (let x = 0; x <= w; x += 3) {
        ctx.lineTo(x, getWaveSurfaceY(wl, x, time));
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, wl, 0, h);
    grad.addColorStop(0, 'rgba(30,110,180,0.65)');
    grad.addColorStop(0.4, 'rgba(20,80,140,0.75)');
    grad.addColorStop(1, 'rgba(10,40,80,0.9)');
    ctx.fillStyle = grad;
    ctx.fill();

    /* surface highlights */
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const y = wl + 3 + i * 8;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
            const wy = y + Math.sin(time * 1.2 + x * 0.03 + i) * 2;
            if (x === 0) ctx.moveTo(x, wy);
            else ctx.lineTo(x, wy);
        }
        ctx.stroke();
    }
    ctx.restore();
}

/* ────────────────────────────
   Underwater fish silhouettes
   ──────────────────────────── */

function drawUnderwaterFish(ctx: CanvasRenderingContext2D, s: FullGameState): void {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#0a2e4a';
    for (const f of s.fishSilhouettes) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.direction, 1);

        /* body */
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size, f.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        /* tail */
        const tw = Math.sin(f.tailPhase) * 4;
        ctx.beginPath();
        ctx.moveTo(-f.size, 0);
        ctx.lineTo(-f.size - f.size * 0.5 + tw, -f.size * 0.35);
        ctx.lineTo(-f.size - f.size * 0.5 + tw, f.size * 0.35);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
    ctx.restore();
}

/* ────────────────────────────
   Bubbles
   ──────────────────────────── */

function drawBubbles(ctx: CanvasRenderingContext2D, s: FullGameState): void {
    ctx.save();
    for (const b of s.bubbles) {
        ctx.globalAlpha = b.opacity;
        ctx.strokeStyle = 'rgba(180,220,255,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

/* ────────────────────────────
   Ripples
   ──────────────────────────── */

function drawRipples(ctx: CanvasRenderingContext2D, s: FullGameState): void {
    ctx.save();
    for (const r of s.ripples) {
        ctx.globalAlpha = r.opacity;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

/* ────────────────────────────
   Decorative events
   ──────────────────────────── */

function drawDecorativeEvents(
    ctx: CanvasRenderingContext2D,
    s: FullGameState,
    wl: number
): void {
    ctx.save();
    for (const e of s.decorativeEvents) {
        if (e.type === 'jumping_fish') {
            const p = e.progress;
            const jumpH = (60 * e.size) / 15;
            const fx = e.x + p * 40 * e.direction;
            const fy = wl - Math.sin(p * Math.PI) * jumpH;
            ctx.save();
            ctx.translate(fx, fy);
            ctx.rotate(-e.direction * (p - 0.5) * 1.2);
            ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
            ctx.beginPath();
            ctx.ellipse(0, 0, e.size, e.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            /* tail */
            ctx.beginPath();
            ctx.moveTo(-e.size, 0);
            ctx.lineTo(-e.size * 1.3, -e.size * 0.3);
            ctx.lineTo(-e.size * 1.3, e.size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (e.type === 'log') {
            const ly = wl - 3 + Math.sin(s.time * 1.5 + e.x * 0.05) * 2;
            ctx.save();
            ctx.fillStyle = '#6b4226';
            ctx.beginPath();
            roundRect(ctx, e.x - e.size / 2, ly - 5, e.size, 10, 4);
            ctx.fill();
            /* bark detail */
            ctx.strokeStyle = '#4a2e14';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(e.x - e.size * 0.3, ly);
            ctx.lineTo(e.x + e.size * 0.3, ly);
            ctx.stroke();
            ctx.restore();
        }
    }
    ctx.restore();
}

/* ────────────────────────────
   Splash particles
   ──────────────────────────── */

function drawSplashParticles(ctx: CanvasRenderingContext2D, s: FullGameState): void {
    ctx.save();
    for (const p of s.splashParticles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(150,200,255,0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

/* ────────────────────────────
   Boat
   ──────────────────────────── */

function getTensionTilt(s: FullGameState): number {
    if (s.gameState !== GameState.REELING) return 0;
    const t = Math.max(0, Math.min(s.tension, 100)) / 100;
    return Math.pow(t, 1.4) * 0.18;
}

function drawBoat(
    ctx: CanvasRenderingContext2D,
    bx: number,
    wl: number,
    time: number
): void {
    const bob = Math.sin(time * 1.2) * 2;
    const rot = Math.sin(time * 0.8) * 0.015;
    const by = wl - 12 + bob;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);

    /* hull */
    ctx.fillStyle = '#6b3a1f';
    ctx.beginPath();
    ctx.moveTo(-55, 0);
    ctx.quadraticCurveTo(-60, 18, -40, 22);
    ctx.lineTo(40, 22);
    ctx.quadraticCurveTo(60, 18, 55, 0);
    ctx.closePath();
    ctx.fill();

    /* rim */
    ctx.strokeStyle = '#8b5e3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-55, 0);
    ctx.quadraticCurveTo(-60, 18, -40, 22);
    ctx.lineTo(40, 22);
    ctx.quadraticCurveTo(60, 18, 55, 0);
    ctx.stroke();

    /* planks */
    ctx.strokeStyle = 'rgba(90,50,20,0.3)';
    ctx.lineWidth = 1;
    for (let i = -30; i <= 30; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 2);
        ctx.lineTo(i, 20);
        ctx.stroke();
    }

    ctx.restore();
}

/* ────────────────────────────
   Player character
   ──────────────────────────── */

function drawPlayer(
    ctx: CanvasRenderingContext2D,
    bx: number,
    wl: number,
    s: FullGameState
): void {
    const bob = Math.sin(s.time * 1.2) * 2;
    const rot = Math.sin(s.time * 0.8) * 0.015;
    const by = wl - 12 + bob + 8;
    const idle = Math.sin(s.playerIdlePhase * 1.5) * 1;
    const breathe = Math.sin(s.time * 2) * 0.5;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);

    /* ── Torso (black tuxedo) ── */
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(-9, -28 + breathe);
    ctx.lineTo(9, -28 + breathe);
    ctx.lineTo(10, -2);
    ctx.closePath();
    ctx.fill();
    /* lapels */
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(-9, -28 + breathe);
    ctx.lineTo(-3, -18 + breathe);
    ctx.lineTo(-8, -10 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, -28 + breathe);
    ctx.lineTo(3, -18 + breathe);
    ctx.lineTo(8, -10 + breathe);
    ctx.closePath();
    ctx.fill();
    /* white shirt front */
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.moveTo(-3, -26 + breathe);
    ctx.lineTo(3, -26 + breathe);
    ctx.lineTo(2, -4);
    ctx.lineTo(-2, -4);
    ctx.closePath();
    ctx.fill();
    /* bow tie */
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, -25 + breathe);
    ctx.lineTo(-4, -27 + breathe);
    ctx.lineTo(-4, -23 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -25 + breathe);
    ctx.lineTo(4, -27 + breathe);
    ctx.lineTo(4, -23 + breathe);
    ctx.closePath();
    ctx.fill();
    /* button */
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, -14 + breathe, 1.2, 0, Math.PI * 2);
    ctx.fill();

    /* ── Neck ── */
    ctx.fillStyle = '#f0c2a0';
    ctx.fillRect(-3, -32 + breathe, 6, 5);

    /* ── Head ── */
    ctx.fillStyle = '#f0c2a0';
    ctx.beginPath();
    ctx.arc(0, -40 + breathe + idle, 10, 0, Math.PI * 2);
    ctx.fill();

    /* ── Tall black hat (covers entire head/face) ── */
    const headY = -40 + breathe + idle;
    const hatBrimY = headY + 5;
    const hatTopY = headY - 28;
    /* hat body — tall cylinder */
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-10, hatBrimY);
    ctx.lineTo(-10, hatTopY + 4);
    ctx.quadraticCurveTo(-10, hatTopY, -7, hatTopY);
    ctx.lineTo(7, hatTopY);
    ctx.quadraticCurveTo(10, hatTopY, 10, hatTopY + 4);
    ctx.lineTo(10, hatBrimY);
    ctx.closePath();
    ctx.fill();
    /* hat top rim */
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, hatTopY + 2, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    /* brim */
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(0, hatBrimY, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    /* yellow band near brim */
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(-10, hatBrimY - 5, 20, 3);
    /* subtle highlight on hat */
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-4, hatTopY + 6, 8, hatBrimY - hatTopY - 12);

    /* ── Right arm (holding rod) ── */
    ctx.strokeStyle = '#f0c2a0';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const tensionDroop = getTensionTilt(s);
    const armAngle =
        s.gameState === GameState.CASTING
            ? -0.6 - (s.castPower / 100) * 0.4
            : s.gameState === GameState.REELING
              ? -0.5 + Math.sin(s.time * 8) * 0.08 + tensionDroop * 2.5
              : -0.5;
    const armLen = 18;
    const elbowX = 9;
    const elbowY = -18 + breathe;
    const handX = elbowX + Math.cos(armAngle) * armLen;
    const handY = elbowY + Math.sin(armAngle) * armLen;
    /* upper arm */
    ctx.beginPath();
    ctx.moveTo(9, -24 + breathe);
    ctx.lineTo(elbowX, elbowY);
    ctx.stroke();
    /* forearm */
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    /* ── Left arm (also holding rod) ── */
    const lElbowX = -7;
    const lElbowY = -16 + breathe;
    const lHandX = handX - 4;
    const lHandY = handY + 2;
    /* upper arm */
    ctx.beginPath();
    ctx.moveTo(-9, -24 + breathe);
    ctx.lineTo(lElbowX, lElbowY);
    ctx.stroke();
    /* forearm to same rod grip */
    ctx.beginPath();
    ctx.moveTo(lElbowX, lElbowY);
    ctx.lineTo(lHandX, lHandY);
    ctx.stroke();

    ctx.restore();
}

/* ────────────────────────────
   Fishing rod & line
   ──────────────────────────── */

function drawRodAndLine(
    ctx: CanvasRenderingContext2D,
    s: FullGameState,
    wl: number
): void {
    const bob = Math.sin(s.time * 1.2) * 2;
    const rot = Math.sin(s.time * 0.8) * 0.015;
    const by = wl - 12 + bob + 8;
    const breathe = Math.sin(s.time * 2) * 0.5;

    /* Compute hand position to match drawPlayer arm */
    const tensionDroop = getTensionTilt(s);
    const armAngle =
        s.gameState === GameState.CASTING
            ? -0.6 - (s.castPower / 100) * 0.4
            : s.gameState === GameState.REELING
              ? -0.5 + Math.sin(s.time * 8) * 0.08 + tensionDroop * 2.5
              : -0.5;
    const armLen = 18;
    const elbowX = 9;
    const elbowY = -18 + breathe;
    const localHandX = elbowX + Math.cos(armAngle) * armLen;
    const localHandY = elbowY + Math.sin(armAngle) * armLen;

    /* Apply same transform as drawPlayer (translate + rotate) */
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const handX = s.boatX + (localHandX * cosR - localHandY * sinR);
    const handY = by + (localHandX * sinR + localHandY * cosR);

    /* rod direction and bend */
    let tipX: number, tipY: number;
    const casting = s.gameState === GameState.CASTING;
    const reeling = s.gameState === GameState.REELING;

    const rodLen = 70;
    if (casting) {
        const angle = -0.8 - (s.castPower / 100) * 0.6;
        tipX = handX + Math.cos(angle) * rodLen;
        tipY = handY + Math.sin(angle) * rodLen;
    } else if (reeling) {
        const bend = Math.max(0, Math.min(s.tension, 100)) / 100;
        /* base angle ~-0.68 rad (same as idle), bends down up to +0.75 rad */
        const angle = Math.atan2(-45, 55) + bend * 0.75;
        tipX = handX + Math.cos(angle) * rodLen;
        tipY = handY + Math.sin(angle) * rodLen;
    } else {
        const angle = Math.atan2(-45, 55);
        tipX = handX + Math.cos(angle) * rodLen;
        tipY = handY + Math.sin(angle) * rodLen;
    }

    /* rod */
    ctx.save();
    ctx.strokeStyle = '#4a3520';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    /* rod tip (thinner) */
    ctx.strokeStyle = '#7a5a3a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const midX = (handX + tipX) / 2;
    const midY = (handY + tipY) / 2;
    ctx.moveTo(midX, midY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.restore();

    /* line to bobber */
    const bobState = s.gameState;
    if (
        bobState === GameState.FLYING ||
        bobState === GameState.FLOATING ||
        bobState === GameState.BITE ||
        bobState === GameState.REELING
    ) {
        ctx.save();
        ctx.strokeStyle = 'rgba(200,200,200,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);

        /* simple catenary curve */
        const bpx = s.bobber.position.x;
        const bpy = s.bobber.position.y;
        const cpx = (tipX + bpx) / 2;
        const sag =
            bobState === GameState.REELING
                ? Math.max(5, 35 - s.tension * 0.28)
                : bobState === GameState.BITE
                  ? 15
                  : 30;
        const cpy = Math.max(tipY, bpy) + sag;

        ctx.quadraticCurveTo(cpx, cpy, bpx, bpy);
        ctx.stroke();
        ctx.restore();
    }

    /* update state's rodTip for reference */
    s.rodTipX = tipX;
    s.rodTipY = tipY;
}

/* ────────────────────────────
   Bobber
   ──────────────────────────── */

function drawBobber(ctx: CanvasRenderingContext2D, s: FullGameState): void {
    const gs = s.gameState;
    if (
        gs !== GameState.FLYING &&
        gs !== GameState.FLOATING &&
        gs !== GameState.BITE &&
        gs !== GameState.REELING
    )
        return;

    const { x, y } = s.bobber.position;

    ctx.save();

    /* ── Thin antenna (палочка торчащая вверх) ── */
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 13);
    ctx.lineTo(x, y - 3);
    ctx.stroke();

    /* small red tip on antenna */
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x, y - 14, 1.8, 0, Math.PI * 2);
    ctx.fill();

    /* ── Body — oval / egg shape ── */
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 4, 6.5, 0, 0, Math.PI * 2);

    /* gradient: red top half → white bottom half */
    const grad = ctx.createLinearGradient(x, y - 5, x, y + 8);
    grad.addColorStop(0, '#e74c3c');
    grad.addColorStop(0.45, '#e74c3c');
    grad.addColorStop(0.55, '#ecf0f1');
    grad.addColorStop(1, '#ecf0f1');
    ctx.fillStyle = grad;
    ctx.fill();

    /* subtle outline */
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    /* highlight glare */
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(x - 1.5, y - 1, 1.3, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    /* ── Small keel (нижний стержень) ── */
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 7.5);
    ctx.lineTo(x, y + 12);
    ctx.stroke();

    /* bite exclamation */
    if (gs === GameState.BITE) {
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', x, y - 22);
    }

    ctx.restore();
}

/* ────────────────────────────
   HUD
   ──────────────────────────── */

function drawHUD(
    ctx: CanvasRenderingContext2D,
    s: FullGameState,
    w: number,
    h: number,
    playerData?: { catchesWithoutBadge: number; hasBadge: boolean }
): void {
    /* cast power bar */
    if (s.gameState === GameState.CASTING) {
        const barW = 260;
        const barH = 18;
        const bx = (w - barW) / 2;
        const by = h - 55;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, bx - 2, by - 2, barW + 4, barH + 4, 6);
        ctx.fill();

        const ratio = s.castPower / 100;
        const grad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
        grad.addColorStop(0, '#2ecc71');
        grad.addColorStop(0.6, '#f1c40f');
        grad.addColorStop(1, '#e74c3c');
        ctx.fillStyle = grad;
        roundRect(ctx, bx, by, barW * ratio, barH, 4);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Сила: ${Math.round(s.castPower)}%`, w / 2, by - 8);
        ctx.restore();
    }

    /* tension bar during reeling */
    if (s.gameState === GameState.REELING) {
        const barW = 22;
        const barH = 250;
        const bx = w - 55;
        const by = (h - barH) / 2;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, bx - 2, by - 2, barW + 4, barH + 4, 6);
        ctx.fill();

        const ratio = s.tension / 100;
        const fillH = barH * ratio;
        const color = ratio > 0.75 ? '#e74c3c' : ratio > 0.5 ? '#f1c40f' : '#2ecc71';
        ctx.fillStyle = color;
        roundRect(ctx, bx, by + barH - fillH, barW, fillH, 4);
        ctx.fill();

        /* label */
        ctx.save();
        ctx.translate(bx - 8, by + barH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Натяжение', 0, 0);
        ctx.restore();

        /* reel progress bar */
        const pBarW = 260;
        const pBarH = 14;
        const px = (w - pBarW) / 2;
        const py = h - 45;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, px - 2, py - 2, pBarW + 4, pBarH + 4, 5);
        ctx.fill();
        ctx.fillStyle = '#3498db';
        roundRect(ctx, px, py, pBarW * (s.reelProgress / 100), pBarH, 3);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Подтяжка: ${Math.round(s.reelProgress)}%`, w / 2, py - 7);

        ctx.restore();
    }

    /* bite react timer */
    if (s.gameState === GameState.BITE) {
        const ratio = s.biteReactTimer / 2;
        const bx = (w - 100) / 2;
        const by = h - 45;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, bx - 2, by - 2, 104, 14, 5);
        ctx.fill();
        ctx.fillStyle = ratio > 0.3 ? '#e67e22' : '#e74c3c';
        roundRect(ctx, bx, by, 100 * ratio, 10, 3);
        ctx.fill();
        ctx.restore();
    }

    /* tooltip */
    if (s.tooltipText) {
        ctx.save();
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        const tw = ctx.measureText(s.tooltipText).width + 20;
        const tx = (w - tw) / 2;
        const ty = h - 110;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        roundRect(ctx, tx, ty, tw, 24, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(s.tooltipText, w / 2, ty + 16);
        ctx.restore();
    }

    /* stats */
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, 10, 10, 180, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🐟 Улов: ${s.totalCatches}`, 20, 30);
    ctx.fillText(`💨 Сходов: ${s.totalEscapes}`, 20, 50);
    ctx.restore();

    /* instructions overlay */
    if (s.showInstructions) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('🎣 Рыбалка', w / 2, h / 2 - 80);

        ctx.font = '16px sans-serif';
        const lines = [
            'ПРОБЕЛ / ЛКМ — заброс (удерживайте для силы)',
            'ПРОБЕЛ / ЛКМ — подсечка при поклёвке',
            'Удерживайте ПРОБЕЛ / ЛКМ — подтяжка лески',
            'Не перетяните леску! Следите за натяжением.',
            '',
            'Нажмите для начала...'
        ];
        lines.forEach((l, i) => {
            ctx.fillText(l, w / 2, h / 2 - 30 + i * 24);
        });

        ctx.restore();
    }
}

/* ────────────────────────────
   Helpers
   ──────────────────────────── */

function ellipse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rx: number,
    ry: number
): void {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
): void {
    if (w < 0) w = 0;
    if (h < 0) h = 0;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}
