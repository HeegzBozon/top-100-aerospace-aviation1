import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Gamepad2, Rocket, Target, ArrowLeft, Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import GalagaGame from "@/components/games/arcade/GalagaGame";
import AsteroidsGame from "@/components/games/arcade/AsteroidsGame";
import MissileCommandGame from "@/components/games/arcade/MissileCommandGame";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const GAMES = [
  {
    id: 'galaga',
    name: 'Space Invaders',
    description: 'Classic alien shooter - defend Earth!',
    icon: Target,
    color: brandColors.skyBlue,
    component: GalagaGame,
  },
  {
    id: 'asteroids',
    name: 'Asteroids',
    description: 'Navigate and destroy asteroids!',
    icon: Rocket,
    color: brandColors.goldPrestige,
    component: AsteroidsGame,
  },
  {
    id: 'missile',
    name: 'Missile Command',
    description: 'Defend your cities from incoming missiles!',
    icon: Target,
    color: '#ef4444',
    component: MissileCommandGame,
  },
];

export default function Arcade() {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame) {
    const GameComponent = GAMES.find(g => g.id === activeGame)?.component;
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="flex items-center gap-4 p-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveGame(null)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
          <h1 className="text-white font-bold">
            {GAMES.find(g => g.id === activeGame)?.name}
          </h1>
        </div>
        <div className="flex-1 overflow-hidden">
          {GameComponent && <GameComponent />}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6" style={{ background: brandColors.cream }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: `${brandColors.navyDeep}15` }}
          >
            <Gamepad2 className="w-8 h-8" style={{ color: brandColors.navyDeep }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
              TOP 100 Arcade
            </h1>
            <p className="text-gray-600">Take a break and play some classic games!</p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ 
                background: 'white',
                border: `2px solid ${brandColors.navyDeep}15`,
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ background: game.color }}
              />
              <div className="relative z-10">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${game.color}20` }}
                >
                  <game.icon className="w-7 h-7" style={{ color: game.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                  {game.name}
                </h3>
                <p className="text-gray-600 text-sm">{game.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: game.color }}>
                  Play Now
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chess Club Card */}
        <div className="mt-6">
          <Link
            to={createPageUrl('ChessClub')}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl flex gap-5 items-center"
            style={{ background: 'white', border: `2px solid ${brandColors.navyDeep}15` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
              style={{ background: brandColors.navyDeep }}
            />
            <div className="relative z-10 flex items-center gap-5 w-full">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${brandColors.navyDeep}15` }}
              >
                <Swords className="w-7 h-7" style={{ color: brandColors.navyDeep }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                  Chess Club ♟
                </h3>
                <p className="text-gray-600 text-sm">Challenge your peers in the TOP 100 private chess club. Turn-based &amp; real-time games.</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                  Enter Club
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Coming Soon */}
        <div className="mt-6 p-6 rounded-2xl text-center" style={{ background: `${brandColors.navyDeep}08` }}>
          <Trophy className="w-8 h-8 mx-auto mb-3" style={{ color: brandColors.goldPrestige }} />
          <h3 className="font-semibold mb-1" style={{ color: brandColors.navyDeep }}>
            Leaderboards Coming Soon!
          </h3>
          <p className="text-sm text-gray-600">
            Compete with other TOP 100 members for high scores.
          </p>
        </div>
      </div>
    </div>
  );
}