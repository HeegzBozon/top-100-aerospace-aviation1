import { useEffect, useRef, useState } from "react";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 500;
const SHIP_SIZE = 15;
const BULLET_SPEED = 8;
const ROTATION_SPEED = 0.1;
const THRUST = 0.15;
const FRICTION = 0.99;
const ASTEROID_SPEED = 1.5;

export default function AsteroidsGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, space: false });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const createAsteroid = (x, y, size) => ({
    x: x ?? Math.random() * GAME_WIDTH,
    y: y ?? Math.random() * GAME_HEIGHT,
    vx: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
    vy: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
    size: size || 40,
    vertices: Array.from({ length: 8 }, () => 0.7 + Math.random() * 0.6),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
  });

  const initGame = () => ({
    ship: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: 0,
      vy: 0,
      rotation: -Math.PI / 2,
      invulnerable: 0,
    },
    bullets: [],
    asteroids: Array.from({ length: 5 }, () => createAsteroid()),
    score: 0,
    lives: 3,
    gameOver: false,
    lastShot: 0,
  });

  const resetGame = () => {
    gameRef.current = initGame();
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

    gameRef.current = initGame();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = true;
      if (e.key === ' ') keysRef.current.space = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = false;
      if (e.key === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const wrapPosition = (obj) => {
      if (obj.x < 0) obj.x = GAME_WIDTH;
      if (obj.x > GAME_WIDTH) obj.x = 0;
      if (obj.y < 0) obj.y = GAME_HEIGHT;
      if (obj.y > GAME_HEIGHT) obj.y = 0;
    };

    const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const gameLoop = (timestamp) => {
      const game = gameRef.current;
      if (game.gameOver) {
        setGameOver(true);
        return;
      }

      // Clear
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 80; i++) {
        const x = (i * 73) % GAME_WIDTH;
        const y = (i * 137) % GAME_HEIGHT;
        ctx.fillRect(x, y, 1, 1);
      }

      const ship = game.ship;

      // Ship rotation
      if (keysRef.current.left) ship.rotation -= ROTATION_SPEED;
      if (keysRef.current.right) ship.rotation += ROTATION_SPEED;

      // Thrust
      if (keysRef.current.up) {
        ship.vx += Math.cos(ship.rotation) * THRUST;
        ship.vy += Math.sin(ship.rotation) * THRUST;
      }

      // Friction
      ship.vx *= FRICTION;
      ship.vy *= FRICTION;

      // Move ship
      ship.x += ship.vx;
      ship.y += ship.vy;
      wrapPosition(ship);

      // Shooting
      if (keysRef.current.space && timestamp - game.lastShot > 150) {
        game.bullets.push({
          x: ship.x + Math.cos(ship.rotation) * SHIP_SIZE,
          y: ship.y + Math.sin(ship.rotation) * SHIP_SIZE,
          vx: Math.cos(ship.rotation) * BULLET_SPEED,
          vy: Math.sin(ship.rotation) * BULLET_SPEED,
          life: 60,
        });
        game.lastShot = timestamp;
      }

      // Update bullets
      game.bullets = game.bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        wrapPosition(b);
        return b.life > 0;
      });

      // Update asteroids
      game.asteroids.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.rotationSpeed;
        wrapPosition(a);
      });

      // Bullet-asteroid collision
      game.bullets.forEach((bullet, bi) => {
        game.asteroids.forEach((asteroid, ai) => {
          if (distance(bullet.x, bullet.y, asteroid.x, asteroid.y) < asteroid.size) {
            game.bullets.splice(bi, 1);
            
            // Split asteroid
            if (asteroid.size > 15) {
              const newSize = asteroid.size * 0.6;
              game.asteroids.push(createAsteroid(asteroid.x, asteroid.y, newSize));
              game.asteroids.push(createAsteroid(asteroid.x, asteroid.y, newSize));
            }
            game.asteroids.splice(ai, 1);
            
            game.score += Math.round(100 / asteroid.size * 10);
            setScore(game.score);
          }
        });
      });

      // Ship-asteroid collision
      if (ship.invulnerable <= 0) {
        game.asteroids.forEach(asteroid => {
          if (distance(ship.x, ship.y, asteroid.x, asteroid.y) < asteroid.size + SHIP_SIZE - 5) {
            game.lives--;
            setLives(game.lives);
            ship.invulnerable = 120;
            ship.x = GAME_WIDTH / 2;
            ship.y = GAME_HEIGHT / 2;
            ship.vx = 0;
            ship.vy = 0;
            if (game.lives <= 0) game.gameOver = true;
          }
        });
      } else {
        ship.invulnerable--;
      }

      // Spawn more asteroids if needed
      if (game.asteroids.length < 3) {
        game.asteroids.push(createAsteroid());
        game.asteroids.push(createAsteroid());
      }

      // Draw ship
      if (ship.invulnerable <= 0 || Math.floor(ship.invulnerable / 5) % 2 === 0) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.rotation);
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(SHIP_SIZE, 0);
        ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.7);
        ctx.lineTo(-SHIP_SIZE * 0.5, 0);
        ctx.lineTo(-SHIP_SIZE, SHIP_SIZE * 0.7);
        ctx.closePath();
        ctx.stroke();

        // Thrust flame
        if (keysRef.current.up) {
          ctx.strokeStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-SHIP_SIZE * 0.5, -SHIP_SIZE * 0.3);
          ctx.lineTo(-SHIP_SIZE * 1.2, 0);
          ctx.lineTo(-SHIP_SIZE * 0.5, SHIP_SIZE * 0.3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw bullets
      ctx.fillStyle = '#fbbf24';
      game.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw asteroids
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2;
      game.asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.beginPath();
        a.vertices.forEach((v, i) => {
          const angle = (i / a.vertices.length) * Math.PI * 2;
          const r = a.size * v;
          if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
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
          <h2 className="text-3xl font-bold text-white mb-4">Asteroids</h2>
          <p className="text-gray-400 mb-2">Arrow Keys or WASD to move</p>
          <p className="text-gray-400 mb-6">Space to shoot</p>
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
            className="border-2 border-green-500 rounded-lg"
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