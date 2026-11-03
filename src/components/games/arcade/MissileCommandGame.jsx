import { useEffect, useRef, useState } from "react";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 500;
const CITY_WIDTH = 40;
const CITY_HEIGHT = 20;
const SILO_WIDTH = 30;
const SILO_HEIGHT = 25;
const MISSILE_SPEED = 1.5;
const DEFENSE_SPEED = 6;
const EXPLOSION_MAX_RADIUS = 40;
const EXPLOSION_DURATION = 30;

// Played inside the Arcade's cabinet (src/components/arcade/ArcadeStage.jsx). The score
// is offered up as it changes so the house record can be kept, and the picture takes
// whatever width the cabinet gives it — a tap is mapped back to the tube's own size.
export default function MissileCommandGame({ onScore }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [ammo, setAmmo] = useState(30);
  const [citiesLeft, setCitiesLeft] = useState(6);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => { onScore?.(score); }, [score]);

  const initGame = () => ({
    cities: [
      { x: 60, alive: true },
      { x: 140, alive: true },
      { x: 220, alive: true },
      { x: 340, alive: true },
      { x: 420, alive: true },
      { x: 500, alive: true },
    ],
    silo: { x: GAME_WIDTH / 2 - SILO_WIDTH / 2, ammo: 30 },
    enemyMissiles: [],
    defenseMissiles: [],
    explosions: [],
    score: 0,
    wave: 1,
    waveTimer: 0,
    missilesPerWave: 5,
    missilesFired: 0,
    gameOver: false,
  });

  const resetGame = () => {
    gameRef.current = initGame();
    setScore(0);
    setWave(1);
    setAmmo(30);
    setCitiesLeft(6);
    setGameOver(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    gameRef.current = initGame();

    const handleClick = (e) => {
      const game = gameRef.current;
      if (game.gameOver || game.silo.ammo <= 0) return;

      // The picture is drawn at the tube's size and may be shown smaller (a handheld,
      // a narrow cabinet), so a tap is read back in the tube's own coordinates.
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (GAME_WIDTH / rect.width);
      const y = (e.clientY - rect.top) * (GAME_HEIGHT / rect.height);

      // Don't allow targeting below cities
      if (y > GAME_HEIGHT - 60) return;

      game.defenseMissiles.push({
        x: game.silo.x + SILO_WIDTH / 2,
        y: GAME_HEIGHT - SILO_HEIGHT - 20,
        targetX: x,
        targetY: y,
        trail: [],
      });
      game.silo.ammo--;
      setAmmo(game.silo.ammo);
    };

    canvas.addEventListener('click', handleClick);

    const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const gameLoop = (timestamp) => {
      const game = gameRef.current;

      if (game.gameOver) {
        setGameOver(true);
        return;
      }

      // Clear
      ctx.fillStyle = '#0a0020';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 60; i++) {
        const x = (i * 97) % GAME_WIDTH;
        const y = (i * 53) % (GAME_HEIGHT - 100);
        ctx.fillRect(x, y, 1, 1);
      }

      // Ground
      ctx.fillStyle = '#1a1a4a';
      ctx.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30);

      // Spawn enemy missiles
      game.waveTimer++;
      if (game.missilesFired < game.missilesPerWave && game.waveTimer % (80 - game.wave * 5) === 0) {
        const targetCity = game.cities.filter(c => c.alive)[Math.floor(Math.random() * game.cities.filter(c => c.alive).length)];
        if (targetCity) {
          game.enemyMissiles.push({
            x: Math.random() * GAME_WIDTH,
            y: 0,
            targetX: targetCity.x + CITY_WIDTH / 2,
            targetY: GAME_HEIGHT - 30 - CITY_HEIGHT,
            trail: [],
          });
          game.missilesFired++;
        }
      }

      // Update enemy missiles
      game.enemyMissiles = game.enemyMissiles.filter(m => {
        const angle = Math.atan2(m.targetY - m.y, m.targetX - m.x);
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 20) m.trail.shift();
        m.x += Math.cos(angle) * (MISSILE_SPEED + game.wave * 0.2);
        m.y += Math.sin(angle) * (MISSILE_SPEED + game.wave * 0.2);

        // Check if hit city
        if (m.y >= m.targetY) {
          game.cities.forEach(city => {
            if (city.alive && Math.abs(city.x + CITY_WIDTH / 2 - m.x) < CITY_WIDTH) {
              city.alive = false;
              setCitiesLeft(game.cities.filter(c => c.alive).length);
            }
          });
          return false;
        }
        return true;
      });

      // Update defense missiles
      game.defenseMissiles = game.defenseMissiles.filter(m => {
        const angle = Math.atan2(m.targetY - m.y, m.targetX - m.x);
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 15) m.trail.shift();
        m.x += Math.cos(angle) * DEFENSE_SPEED;
        m.y += Math.sin(angle) * DEFENSE_SPEED;

        // Check if reached target
        if (distance(m.x, m.y, m.targetX, m.targetY) < 10) {
          game.explosions.push({
            x: m.targetX,
            y: m.targetY,
            radius: 5,
            expanding: true,
            life: EXPLOSION_DURATION,
          });
          return false;
        }
        return true;
      });

      // Update explosions
      game.explosions = game.explosions.filter(exp => {
        if (exp.expanding) {
          exp.radius += 2;
          if (exp.radius >= EXPLOSION_MAX_RADIUS) exp.expanding = false;
        } else {
          exp.life--;
          exp.radius -= 1;
        }

        // Check if explosion destroys enemy missiles
        game.enemyMissiles = game.enemyMissiles.filter(m => {
          if (distance(m.x, m.y, exp.x, exp.y) < exp.radius) {
            game.score += 25;
            setScore(game.score);
            return false;
          }
          return true;
        });

        return exp.life > 0 && exp.radius > 0;
      });

      // Check wave completion
      if (game.missilesFired >= game.missilesPerWave && game.enemyMissiles.length === 0) {
        game.wave++;
        game.missilesFired = 0;
        game.missilesPerWave = 5 + game.wave * 2;
        game.silo.ammo = Math.min(game.silo.ammo + 10, 30);
        setWave(game.wave);
        setAmmo(game.silo.ammo);
      }

      // Check game over
      if (!game.cities.some(c => c.alive)) {
        game.gameOver = true;
      }

      // Draw enemy missile trails
      game.enemyMissiles.forEach(m => {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        m.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Warhead
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw defense missile trails
      game.defenseMissiles.forEach(m => {
        ctx.strokeStyle = '#44ff44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        m.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Warhead
        ctx.fillStyle = '#66ff66';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw explosions
      game.explosions.forEach(exp => {
        const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 50, 0.7)');
        gradient.addColorStop(0.6, 'rgba(255, 100, 50, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 50, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cities
      game.cities.forEach(city => {
        if (city.alive) {
          ctx.fillStyle = '#4488ff';
          // Building shapes
          ctx.fillRect(city.x + 5, GAME_HEIGHT - 30 - 20, 10, 20);
          ctx.fillRect(city.x + 18, GAME_HEIGHT - 30 - 25, 12, 25);
          ctx.fillRect(city.x + 28, GAME_HEIGHT - 30 - 15, 8, 15);
          // Windows
          ctx.fillStyle = '#ffff88';
          ctx.fillRect(city.x + 7, GAME_HEIGHT - 30 - 15, 3, 3);
          ctx.fillRect(city.x + 21, GAME_HEIGHT - 30 - 20, 3, 3);
          ctx.fillRect(city.x + 21, GAME_HEIGHT - 30 - 12, 3, 3);
        } else {
          // Rubble
          ctx.fillStyle = '#333355';
          ctx.fillRect(city.x + 5, GAME_HEIGHT - 30 - 5, 30, 5);
        }
      });

      // Draw silo
      ctx.fillStyle = '#44aa44';
      ctx.beginPath();
      ctx.moveTo(game.silo.x + SILO_WIDTH / 2, GAME_HEIGHT - 30 - SILO_HEIGHT);
      ctx.lineTo(game.silo.x, GAME_HEIGHT - 30);
      ctx.lineTo(game.silo.x + SILO_WIDTH, GAME_HEIGHT - 30);
      ctx.closePath();
      ctx.fill();

      // Ammo indicator
      ctx.fillStyle = '#88ff88';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${game.silo.ammo}`, game.silo.x + SILO_WIDTH / 2, GAME_HEIGHT - 35 - SILO_HEIGHT);

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [started]);

  return (
    <div className="relative flex w-full flex-col items-center justify-center p-3">
      {!started ? (
        <div className="py-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold/80">Attract mode</p>
          <h2 className="mb-3 mt-2 font-heading text-3xl text-editorial-cream">Missile Command</h2>
          <p className="mb-1 text-sm text-editorial-cream/60">Tap the sky to launch an interceptor.</p>
          <p className="mb-6 text-sm text-editorial-cream/60">Six cities. Keep them lit.</p>
          <button
            onClick={resetGame}
            className="rounded border border-editorial-copper/70 bg-editorial-copper/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-editorial-cream transition-colors hover:bg-editorial-copper/35"
          >
            Insert coin
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex w-full max-w-[600px] flex-wrap justify-between gap-2 text-sm text-editorial-cream">
            <div>Score: <span className="font-bold text-editorial-gold">{score}</span></div>
            <div>Wave: <span className="font-bold text-editorial-cream">{wave}</span></div>
            <div>Ammo: <span className="font-bold text-editorial-cream/70">{ammo}</span></div>
            <div>Cities: <span className="font-bold text-editorial-cream/70">{citiesLeft}</span></div>
          </div>
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="arcade-canvas h-auto w-full max-w-[600px] cursor-crosshair"
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold/80">Machine closed</p>
                <h2 className="mb-2 mt-1 font-heading text-4xl text-editorial-cream">Game over</h2>
                <p className="mb-1 text-sm text-editorial-cream/60">Wave {wave}</p>
                <p className="mb-6 font-heading text-2xl text-editorial-gold">{score.toLocaleString()}</p>
                <button
                  onClick={resetGame}
                  className="rounded border border-editorial-copper/70 bg-editorial-copper/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-editorial-cream transition-colors hover:bg-editorial-copper/35"
                >
                  Play again
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}