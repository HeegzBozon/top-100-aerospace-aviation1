import { useEffect, useRef, useState } from "react";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 500;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const ENEMY_WIDTH = 35;
const ENEMY_HEIGHT = 25;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 8;

// Played inside the Arcade's cabinet (src/components/arcade/ArcadeStage.jsx). The score
// is offered up as it changes so the house record can be kept, and the picture takes
// whatever width the cabinet gives it — a desk and a handheld play the same machine.
export default function GalagaGame({ onScore }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    player: { x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - 60 },
    bullets: [],
    enemies: [],
    enemyBullets: [],
    score: 0,
    lives: 3,
    gameOver: false,
    paused: false,
    enemyDirection: 1,
    enemySpeed: 0.5,
    lastEnemyShot: 0,
  });
  const keysRef = useRef({ left: false, right: false, space: false });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => { onScore?.(score); }, [score]);

  // The console's centre and its A key reach the machine as a Space press, so a cabinet can
  // be opened from the hardware as well as from the coin key on the glass.
  useEffect(() => {
    if (started) return undefined;
    const onKey = (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      resetGame();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  const initEnemies = () => {
    const enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        enemies.push({
          x: 50 + col * 60,
          y: 50 + row * 45,
          alive: true,
          type: row < 2 ? 'strong' : 'weak',
        });
      }
    }
    return enemies;
  };

  const resetGame = () => {
    gameRef.current = {
      player: { x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - 60 },
      bullets: [],
      enemies: initEnemies(),
      enemyBullets: [],
      score: 0,
      lives: 3,
      gameOver: false,
      paused: false,
      enemyDirection: 1,
      enemySpeed: 0.5,
      lastEnemyShot: 0,
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = 0;
    let lastBulletTime = 0;

    gameRef.current.enemies = initEnemies();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === ' ') keysRef.current.space = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
      if (e.key === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = (timestamp) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      const game = gameRef.current;

      if (game.gameOver) {
        setGameOver(true);
        return;
      }

      // Clear
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Stars background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 123) % GAME_WIDTH;
        const y = ((i * 456) + timestamp * 0.02) % GAME_HEIGHT;
        ctx.fillRect(x, y, 1, 1);
      }

      // Player movement
      if (keysRef.current.left) game.player.x -= 5;
      if (keysRef.current.right) game.player.x += 5;
      game.player.x = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, game.player.x));

      // Shooting
      if (keysRef.current.space && timestamp - lastBulletTime > 200) {
        game.bullets.push({
          x: game.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: game.player.y,
        });
        lastBulletTime = timestamp;
      }

      // Update bullets
      game.bullets = game.bullets.filter(b => {
        b.y -= 8;
        return b.y > -BULLET_HEIGHT;
      });

      // Update enemy bullets
      game.enemyBullets = game.enemyBullets.filter(b => {
        b.y += 4;
        return b.y < GAME_HEIGHT;
      });

      // Enemy movement
      let shouldReverse = false;
      game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        enemy.x += game.enemySpeed * game.enemyDirection;
        if (enemy.x <= 10 || enemy.x >= GAME_WIDTH - ENEMY_WIDTH - 10) {
          shouldReverse = true;
        }
      });

      if (shouldReverse) {
        game.enemyDirection *= -1;
        game.enemies.forEach(enemy => {
          if (enemy.alive) enemy.y += 20;
        });
      }

      // Enemy shooting
      if (timestamp - game.lastEnemyShot > 1000) {
        const aliveEnemies = game.enemies.filter(e => e.alive);
        if (aliveEnemies.length > 0) {
          const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          game.enemyBullets.push({
            x: shooter.x + ENEMY_WIDTH / 2,
            y: shooter.y + ENEMY_HEIGHT,
          });
          game.lastEnemyShot = timestamp;
        }
      }

      // Collision: bullets hitting enemies
      game.bullets.forEach((bullet, bi) => {
        game.enemies.forEach(enemy => {
          if (!enemy.alive) return;
          if (
            bullet.x < enemy.x + ENEMY_WIDTH &&
            bullet.x + BULLET_WIDTH > enemy.x &&
            bullet.y < enemy.y + ENEMY_HEIGHT &&
            bullet.y + BULLET_HEIGHT > enemy.y
          ) {
            enemy.alive = false;
            game.bullets.splice(bi, 1);
            game.score += enemy.type === 'strong' ? 20 : 10;
            setScore(game.score);
          }
        });
      });

      // Collision: enemy bullets hitting player
      game.enemyBullets.forEach((bullet, bi) => {
        if (
          bullet.x < game.player.x + PLAYER_WIDTH &&
          bullet.x + BULLET_WIDTH > game.player.x &&
          bullet.y < game.player.y + PLAYER_HEIGHT &&
          bullet.y + BULLET_HEIGHT > game.player.y
        ) {
          game.enemyBullets.splice(bi, 1);
          game.lives--;
          setLives(game.lives);
          if (game.lives <= 0) game.gameOver = true;
        }
      });

      // Check win
      if (game.enemies.every(e => !e.alive)) {
        game.enemies = initEnemies();
        game.enemySpeed += 0.2;
      }

      // Check lose (enemies reach bottom)
      if (game.enemies.some(e => e.alive && e.y + ENEMY_HEIGHT > game.player.y - 20)) {
        game.gameOver = true;
      }

      // Draw player (spaceship)
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(game.player.x + PLAYER_WIDTH / 2, game.player.y);
      ctx.lineTo(game.player.x, game.player.y + PLAYER_HEIGHT);
      ctx.lineTo(game.player.x + PLAYER_WIDTH, game.player.y + PLAYER_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw bullets
      ctx.fillStyle = '#fbbf24';
      game.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
      });

      // Draw enemy bullets
      ctx.fillStyle = '#ef4444';
      game.enemyBullets.forEach(b => {
        ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
      });

      // Draw enemies
      game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        ctx.fillStyle = enemy.type === 'strong' ? '#a855f7' : '#3b82f6';
        ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + ENEMY_WIDTH - 14, enemy.y + 8, 6, 6);
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [started]);

  return (
    <div className="relative flex w-full flex-col items-center justify-center p-3">
      {!started ? (
        <div className="py-6 text-center md:py-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold/80">Attract mode</p>
          <h2 className="mb-2 mt-1 font-heading text-2xl text-editorial-cream md:mb-3 md:mt-2 md:text-3xl">Space Invaders</h2>
          <p className="mb-5 text-xs text-editorial-cream/60 md:mb-6 md:text-sm">Steer left and right. Fire to answer.</p>
          <button
            onClick={resetGame}
            className="rounded border border-editorial-copper/70 bg-editorial-copper/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-editorial-cream transition-colors hover:bg-editorial-copper/35"
          >
            Insert coin
          </button>
        </div>
      ) : (
        <>
          <div className="mb-2 flex w-full max-w-[600px] justify-between text-[11px] text-editorial-cream md:mb-3 md:text-lg">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Lives: <span className="font-bold text-red-400">{"❤️".repeat(lives)}</span></div>
          </div>
          {/* The picture keeps its 6:5 plate and sits inside the glass it is given: it is
              measured from the height of the glass as well as its width, so the cabinet's
              keys are never pushed below the screen on a phone. */}
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="arcade-canvas mx-auto block h-auto max-h-[44vh] w-auto max-w-full touch-none md:max-h-[62vh]"
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold/80">Machine closed</p>
                <h2 className="mb-2 mt-1 font-heading text-4xl text-editorial-cream">Game over</h2>
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