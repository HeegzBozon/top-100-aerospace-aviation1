import React, { useEffect, useRef, useState } from "react";

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

export default function MissileCommandGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [ammo, setAmmo] = useState(30);
  const [citiesLeft, setCitiesLeft] = useState(6);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

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

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

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
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 p-4">
      {!started ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Missile Command</h2>
          <p className="text-gray-400 mb-2">Click to launch defensive missiles</p>
          <p className="text-gray-400 mb-6">Protect your cities from incoming attacks!</p>
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
            <div className="text-lg">Wave: <span className="font-bold text-blue-400">{wave}</span></div>
            <div className="text-lg">Ammo: <span className="font-bold text-green-400">{ammo}</span></div>
            <div className="text-lg">Cities: <span className="font-bold text-cyan-400">{citiesLeft}</span></div>
          </div>
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="border-2 border-blue-500 rounded-lg cursor-crosshair"
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-xl text-blue-400 mb-2">Wave Reached: {wave}</p>
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