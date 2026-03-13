import React, { useEffect, useRef } from "react";
import { MessageSquare, Users, Zap, Star } from "lucide-react";
import { brandColors } from "@/components/core/brandTheme";

// Animated constellation canvas
function ConstellationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Nodes
    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(74, 144, 184, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 124, ${glow * 0.8})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const cultureCards = [
  {
    icon: MessageSquare,
    color: brandColors.skyBlue,
    title: "Start a Conversation",
    desc: "Pick a channel or DM from the sidebar.",
  },
  {
    icon: Users,
    color: brandColors.goldPrestige,
    title: "Build Together",
    desc: "Channels are your team's heartbeat.",
  },
  {
    icon: Zap,
    color: brandColors.roseAccent,
    title: "Move Fast",
    desc: "Ideas shared here become momentum.",
  },
  {
    icon: Star,
    color: brandColors.navyDeep,
    title: "Culture Starts Here",
    desc: "Every message is part of the story.",
  },
];

export default function NoConversationPlaceholder() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center h-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${brandColors.navyDark} 0%, ${brandColors.navyMid} 50%, ${brandColors.navyDeep} 100%)` }}
    >
      {/* Constellation background */}
      <ConstellationCanvas />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(201,168,124,0.08) 0%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-xl">
        {/* Logo mark */}
        <div className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}
        >
          <MessageSquare className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: brandColors.goldLight }}>
          Welcome to Comms
        </h2>
        <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
          Your hub for real conversations, shared ideas, and the culture we're building together. Select a channel or DM to dive in.
        </p>

        {/* Culture cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {cultureCards.map(({ icon: Icon, color, title, desc }) => (
            <div key={title}
              className="flex flex-col items-start gap-2 rounded-xl p-4 text-left"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}22` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: brandColors.goldLight }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}