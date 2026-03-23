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

export default function GalagaGame() {
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
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
      {!started ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Space Invaders</h2>
          <p className="text-gray-400 mb-6">Use Arrow Keys or A/D to move, Space to shoot</p>
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-[600px] mb-4 text-white">
            <div className="text-lg">Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div className="text-lg">Lives: <span className="font-bold text-red-400">{"❤️".repeat(lives)}</span></div>
          </div>
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="border-2 border-purple-500 rounded-lg"
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-2xl text-yellow-400 mb-6">Final Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}