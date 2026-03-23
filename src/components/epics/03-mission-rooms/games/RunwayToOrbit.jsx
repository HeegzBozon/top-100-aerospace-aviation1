import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

export default function RunwayToOrbit({ onComplete }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for WebGL support
    let renderer;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.warn('WebGL not supported, skipping 3D animation');
        setTimeout(() => setReady(true), 500);
        return;
      }
    } catch (e) {
      console.warn('WebGL initialization failed:', e);
      setTimeout(() => setReady(true), 500);
      return;
    }

    // Three.js scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent to show parallax
    scene.fog = new THREE.Fog(0x1e3a5a, 50, 500);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 5, 20);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setClearColor(0x000000, 0); // Transparent background
      containerRef.current.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL renderer creation failed:', e);
      setTimeout(() => setReady(true), 500);
      return;
    }

    // Runway
    const runwayGroup = new THREE.Group();
    
    // Main runway surface
    const runwayGeo = new THREE.PlaneGeometry(40, 800);
    const runwayMat = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.2
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runwayGroup.add(runway);

    // Center line markings
    for (let i = 0; i < 40; i++) {
      const marking = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 15),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.02, -i * 20);
      runwayGroup.add(marking);
    }

    // Edge lights (sequential activation)
    const edgeLights = [];
    for (let i = 0; i < 80; i++) {
      const side = i % 2 === 0 ? -18 : 18;
      
      // Light housing
      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      housing.position.set(side, 0.25, -i * 10);
      runwayGroup.add(housing);

      // Glowing light
      const lightGeo = new THREE.SphereGeometry(0.25, 12, 12);
      const lightMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0
      });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.set(side, 0.5, -i * 10);
      runwayGroup.add(light);
      edgeLights.push({ mesh: light, index: i });

      // Point light for glow
      const pointLight = new THREE.PointLight(0x00ff00, 0, 8);
      pointLight.position.set(side, 0.5, -i * 10);
      runwayGroup.add(pointLight);
      edgeLights.push({ light: pointLight, index: i });
    }

    scene.add(runwayGroup);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 2000;
      starPos[i * 3 + 1] = Math.random() * 500 + 100;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xaaddff, 0.5);
    moonLight.position.set(50, 100, -100);
    scene.add(moonLight);

    // Smooth continuous animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      // Rapid light activation (0-1s)
      if (time < 1) {
        const lightIndex = Math.floor((time / 1) * edgeLights.length / 2);
        edgeLights.forEach(({ mesh, light, index }) => {
          if (mesh && index <= lightIndex) {
            mesh.material.opacity = 1;
          }
          if (light && index <= lightIndex) {
            light.intensity = 2;
          }
        });
      }

      // Quick tilt and rise (1-2s)
      if (time >= 1 && time < 2) {
        const tiltProgress = (time - 1);
        runwayGroup.rotation.x = -Math.PI / 2 + tiltProgress * Math.PI / 3;
        camera.position.y = 5 + tiltProgress * 50;
        camera.position.z = 20 - tiltProgress * 10;
        camera.lookAt(0, 0, -200);
        starMat.opacity = tiltProgress;
        
        if (time >= 1.5 && !ready) {
          setReady(true);
        }
      }

      // Steady orbital glow (2s+)
      if (time >= 2) {
        runwayGroup.rotation.x = -Math.PI / 2 + Math.PI / 3;
        edgeLights.forEach(({ mesh, light }) => {
          if (mesh) {
            mesh.material.color.setHex(0x00ffff);
            mesh.material.opacity = 0.8 + Math.sin(time * 2) * 0.2;
          }
          if (light) {
            light.color.setHex(0x00ffff);
            light.intensity = 3 + Math.sin(time * 3) * 1;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    const handleResize = () => {
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Dynamic sky based on local time
  const hour = new Date().getHours();
  const isDawn = hour >= 5 && hour < 8;
  const isDay = hour >= 8 && hour < 17;
  const isDusk = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 5;

  const skyGradient = isDawn 
    ? `linear-gradient(135deg, #4a2a4a 0%, #7a4a5a 100%)`
    : isDay 
    ? `linear-gradient(135deg, ${brandColors.skyBlue} 0%, ${brandColors.navyDeep} 100%)`
    : isDusk
    ? `linear-gradient(135deg, #5a2a4a 0%, #aa5a3a 100%)`
    : `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0a1525 100%)`;

  return (
    <div className="fixed inset-0" style={{ background: skyGradient }}>
      {/* Dynamic Atmospheric Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sunbeams / Light rays */}
        {(isDawn || isDusk) && (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${20 + i * 15}%`,
                  width: '2px',
                  background: `linear-gradient(180deg, ${isDawn ? 'rgba(255,170,136,0.3)' : 'rgba(255,119,68,0.3)'} 0%, transparent 60%)`,
                  transformOrigin: 'top',
                  transform: `rotate(${-15 + i * 8}deg)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>
        )}

        {/* Ambient glow orbs */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{
            top: isDay ? '10%' : isDusk ? '20%' : '5%',
            left: isDay ? '60%' : isDusk ? '80%' : '20%',
            width: '400px',
            height: '400px',
            background: isDay 
              ? 'radial-gradient(circle, rgba(255,230,100,0.15) 0%, transparent 70%)'
              : isDusk
              ? 'radial-gradient(circle, rgba(255,120,68,0.2) 0%, transparent 70%)'
              : isDawn
              ? 'radial-gradient(circle, rgba(255,160,122,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(100,130,180,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Stars at night */}
        {isNight && (
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Atmospheric haze */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: isDawn
              ? 'linear-gradient(0deg, rgba(255,170,136,0.1) 0%, transparent 100%)'
              : isDay
              ? 'linear-gradient(0deg, rgba(135,206,235,0.05) 0%, transparent 100%)'
              : isDusk
              ? 'linear-gradient(0deg, rgba(255,127,80,0.15) 0%, transparent 100%)'
              : 'linear-gradient(0deg, rgba(30,58,90,0.2) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* 7-Layer Parallax Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1: Enhanced Starfield (slowest) */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                         radial-gradient(2px 2px at 60% 70%, white, transparent),
                         radial-gradient(1px 1px at 50% 50%, white, transparent),
                         radial-gradient(1px 1px at 80% 10%, white, transparent),
                         radial-gradient(2px 2px at 90% 60%, white, transparent),
                         radial-gradient(1px 1px at 33% 80%, white, transparent),
                         radial-gradient(1px 1px at 15% 45%, white, transparent),
                         radial-gradient(2px 2px at 75% 25%, white, transparent),
                         radial-gradient(1px 1px at 40% 65%, white, transparent),
                         radial-gradient(1px 1px at 85% 85%, white, transparent),
                         radial-gradient(2px 2px at 25% 15%, white, transparent),
                         radial-gradient(1px 1px at 95% 40%, white, transparent)`,
            backgroundSize: '300% 300%',
            opacity: 0.6
          }}
        />
        {/* Shooting stars */}
        <motion.div
          animate={{ x: [-100, 2000], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="absolute top-20 left-0 w-32 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
        />
        <motion.div
          animate={{ x: [-100, 2000], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, delay: 1 }}
          className="absolute top-60 left-0 w-40 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${brandColors.skyBlue}, transparent)` }}
        />
        {/* Twinkling stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}

        {/* Layer 2: Distant Nebula */}
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 70% 30%, ${brandColors.skyBlue}15, transparent 60%)`,
            opacity: 0.3
          }}
        />

        {/* Layer 3: Iconic Mountain Ranges (Alps, Rockies, Himalayas silhouettes) */}
        <motion.div
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 right-0 h-80"
        >
          {/* Himalayan-style peaks */}
          <div className="absolute bottom-0 left-0 w-full h-full opacity-30" 
            style={{
              clipPath: 'polygon(0 100%, 5% 45%, 12% 38%, 18% 42%, 25% 35%, 32% 40%, 38% 30%, 45% 35%, 52% 25%, 58% 32%, 65% 28%, 72% 35%, 78% 30%, 85% 38%, 92% 42%, 100% 45%, 100% 100%)',
              background: `linear-gradient(to top, ${brandColors.navyDeep} 0%, #2a3a4a 50%, transparent 100%)`
            }}
          />
          {/* Mid-range peaks */}
          <div className="absolute bottom-0 left-10 w-full h-full opacity-35" 
            style={{
              clipPath: 'polygon(0 100%, 8% 55%, 15% 50%, 22% 58%, 30% 48%, 38% 52%, 45% 45%, 52% 50%, 60% 42%, 68% 48%, 75% 45%, 82% 52%, 90% 48%, 100% 55%, 100% 100%)',
              background: `linear-gradient(to top, ${brandColors.navyDeep}ee 0%, #1a2a3a 60%, transparent 100%)`
            }}
          />
        </motion.div>

        {/* Layer 4: City Lights & Clouds */}
        <motion.div
          animate={{ x: [0, -60, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          {/* Mid-ground cityscape with lit windows */}
          <div className="absolute bottom-32 left-[10%] w-[180%] h-64 opacity-25">
            {/* Dense urban blocks with window lights */}
            {[...Array(40)].map((_, i) => (
              <div 
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${i * 4.5}%`,
                  width: `${2 + Math.random() * 2}rem`,
                  height: `${8 + Math.random() * 16}rem`,
                  background: `linear-gradient(to top, #1a2a3a, #0a1520)`,
                  boxShadow: 'inset 0 0 20px rgba(255,200,100,0.1)'
                }}
              >
                {/* Window lights pattern */}
                <div className="absolute inset-2 grid grid-cols-2 gap-1">
                  {[...Array(Math.floor(Math.random() * 8 + 4))].map((_, j) => (
                    <motion.div
                      key={j}
                      animate={{ opacity: Math.random() > 0.3 ? [0.6, 0.9, 0.6] : 0 }}
                      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                      className="w-1 h-1"
                      style={{ background: brandColors.goldLight }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Clouds */}
          <div className="absolute top-20 left-10 w-96 h-32 rounded-full blur-3xl opacity-20" style={{ background: brandColors.cream }} />
          <div className="absolute top-32 right-20 w-80 h-28 rounded-full blur-3xl opacity-15" style={{ background: brandColors.goldLight }} />
        </motion.div>

        {/* Layer 5: Iconic World Skylines */}
        <motion.div
          animate={{ x: [0, -80, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[200%] h-96"
        >
          {/* Empire State-style Art Deco tower */}
          <div className="absolute bottom-0 left-[5%] w-16 h-72 opacity-45" 
            style={{ 
              background: `linear-gradient(to top, #1a2a3a, #2a3a4a)`,
              clipPath: 'polygon(20% 0, 25% 5%, 30% 100%, 70% 100%, 75% 5%, 80% 0, 80% 100%, 20% 100%)'
            }} 
          />
          {/* Burj Khalifa-style needle spire */}
          <div className="absolute bottom-0 left-[15%] w-12 h-96 opacity-50" 
            style={{ 
              background: `linear-gradient(to top, #2a3a4a 0%, #3a4a5a 80%, ${brandColors.goldPrestige}40 100%)`,
              clipPath: 'polygon(35% 0, 40% 3%, 42% 100%, 58% 100%, 60% 3%, 65% 0)'
            }} 
          />
          {/* Willis/Sears Tower-style twin antenna */}
          <div className="absolute bottom-0 left-[25%] w-20 h-64 opacity-40" 
            style={{ 
              background: `linear-gradient(to top, #1a2a3a, #2a3a4a)`,
              clipPath: 'polygon(10% 100%, 15% 15%, 20% 0, 25% 0, 30% 15%, 35% 100%, 65% 100%, 70% 15%, 75% 0, 80% 0, 85% 15%, 90% 100%)'
            }} 
          />
          {/* Space Needle-style observation tower */}
          <div className="absolute bottom-0 left-[35%]" style={{ opacity: 0.45 }}>
            <div className="relative w-8 h-56" style={{ background: `linear-gradient(to top, #2a3a4a, #3a4a5a)`, marginLeft: '8px' }} />
            <div className="absolute top-32 left-0 w-24 h-4 rounded-full" style={{ background: '#3a4a5a' }} />
            <div className="absolute top-28 left-2 w-20 h-8 rounded-t-full" style={{ background: '#2a3a4a' }} />
          </div>
          {/* Shanghai Tower-style twisted spire */}
          <div className="absolute bottom-0 left-[48%] w-14 h-80 opacity-48" 
            style={{ 
              background: `linear-gradient(135deg, #1a2a3a 0%, #2a3a4a 50%, #1a2a3a 100%)`,
              clipPath: 'polygon(30% 0, 35% 5%, 38% 100%, 62% 100%, 65% 5%, 70% 0)'
            }} 
          />
          {/* Chrysler Building-style Art Deco crown */}
          <div className="absolute bottom-0 left-[60%] w-18 h-68 opacity-42" 
            style={{ 
              background: `linear-gradient(to top, #1a2a3a 0%, #2a3a4a 70%, ${brandColors.goldPrestige}30 100%)`,
              clipPath: 'polygon(25% 100%, 30% 25%, 35% 20%, 40% 10%, 45% 5%, 50% 0, 55% 5%, 60% 10%, 65% 20%, 70% 25%, 75% 100%)'
            }} 
          />
          {/* One World Trade-style modern tower */}
          <div className="absolute bottom-0 left-[72%] w-16 h-76 opacity-44" 
            style={{ 
              background: `linear-gradient(to top, #2a3a4a, #3a4a5a)`,
              clipPath: 'polygon(25% 100%, 30% 20%, 35% 5%, 40% 0, 60% 0, 65% 5%, 70% 20%, 75% 100%)'
            }} 
          />
          {/* Taipei 101-style pagoda segments */}
          <div className="absolute bottom-0 left-[85%] w-20 h-88 opacity-46" 
            style={{ 
              background: `linear-gradient(to top, #1a2a3a 0%, #2a3a4a 100%)`,
              clipPath: 'polygon(25% 100%, 28% 85%, 25% 84%, 28% 70%, 25% 69%, 28% 55%, 25% 54%, 28% 40%, 25% 39%, 30% 25%, 35% 10%, 40% 0, 60% 0, 65% 10%, 70% 25%, 75% 39%, 72% 40%, 75% 54%, 72% 55%, 75% 69%, 72% 70%, 75% 84%, 72% 85%, 75% 100%)'
            }} 
          />
        </motion.div>

        {/* Layer 6: Eiffel Tower & Airport Control Tower */}
        <motion.div
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[200%] h-96"
        >
          {/* Eiffel Tower silhouette */}
          <div className="absolute bottom-0 left-[20%] w-32 h-80 opacity-38" 
            style={{ 
              clipPath: 'polygon(45% 0, 46% 5%, 47% 20%, 40% 35%, 35% 50%, 30% 100%, 70% 100%, 65% 50%, 60% 35%, 53% 20%, 54% 5%, 55% 0)',
              background: `linear-gradient(to top, #2a3a4a 0%, #1a2a3a 60%, ${brandColors.goldPrestige}20 100%)`
            }} 
          />
          {/* Control Tower with rotating beacon */}
          <div className="absolute bottom-0 right-[15%] w-16 h-80 opacity-50"
            style={{ background: `linear-gradient(to top, #1a2a3a 0%, #2a3a4a 100%)` }}
          >
            <motion.div
              animate={{ 
                opacity: [1, 0.3, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                opacity: { duration: 2, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
              className="absolute top-4 left-1/2 w-12 h-12 -translate-x-1/2 rounded-full"
              style={{ background: brandColors.goldPrestige, filter: 'blur(8px)' }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-20 left-0 w-full h-1"
              style={{ background: `linear-gradient(90deg, transparent, ${brandColors.goldPrestige}, transparent)` }}
            />
          </div>
        </motion.div>

        {/* Layer 7: Foreground City with Street Lights */}
        <motion.div
          animate={{ x: [0, -150, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[250%] h-64"
        >
          {/* Near-ground city buildings with neon accents */}
          {[...Array(25)].map((_, i) => (
            <div 
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${i * 8}%`,
                width: `${3 + Math.random() * 4}rem`,
                height: `${12 + Math.random() * 24}rem`,
                background: `linear-gradient(to top, #0a1520 0%, #1a2a3a 100%)`,
                opacity: 0.6
              }}
            >
              {/* Neon signs */}
              {Math.random() > 0.5 && (
                <motion.div
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                  className="absolute top-4 left-1 right-1 h-2"
                  style={{ 
                    background: Math.random() > 0.5 ? brandColors.goldPrestige : brandColors.skyBlue,
                    filter: 'blur(2px)'
                  }}
                />
              )}
              {/* Window grid */}
              <div className="absolute inset-3 grid grid-cols-3 gap-1">
                {[...Array(12)].map((_, j) => (
                  <motion.div
                    key={j}
                    animate={{ opacity: Math.random() > 0.2 ? [0.7, 1, 0.7] : 0 }}
                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
                    className="w-2 h-2"
                    style={{ background: '#ffcc88' }}
                  />
                ))}
              </div>
            </div>
          ))}
          {/* Street lamps */}
          {[...Array(30)].map((_, i) => (
            <div key={`lamp-${i}`} className="absolute bottom-0" style={{ left: `${i * 6.5}%` }}>
              <div className="w-1 h-16 bg-gray-800" />
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-4 h-4 -mt-2 -ml-1.5 rounded-full"
                style={{ background: brandColors.goldLight, filter: 'blur(4px)' }}
              />
            </div>
          ))}
        </motion.div>
        {/* Ground mist */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: `linear-gradient(to top, ${brandColors.navyDeep}40 0%, transparent 100%)`
          }}
        />
      </div>

      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading or Menu */}
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
              className="text-8xl mb-4"
            >
              ☁️
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl tracking-widest uppercase text-center"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: brandColors.goldPrestige,
              }}
            >
              Initializing Flight Systems...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 text-center px-4"
            >
          <Link to={createPageUrl('MissionControl')} className="block relative mx-auto mb-4 w-fit cursor-pointer">
            <div 
              className="absolute inset-0 blur-3xl opacity-60 scale-110"
              style={{ background: `radial-gradient(circle, ${brandColors.goldPrestige}80, transparent 70%)` }}
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                filter: [
                  `drop-shadow(0 0 20px ${brandColors.goldPrestige}aa)`,
                  `drop-shadow(0 0 40px ${brandColors.goldLight}cc)`,
                  `drop-shadow(0 0 20px ${brandColors.goldPrestige}aa)`,
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
              alt="TOP 100 Aerospace & Aviation"
              className="relative h-56 md:h-80 w-auto mx-auto"
            />
          </Link>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm tracking-wider uppercase"
            style={{
              fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.15em',
            }}
          >
            Recognizing Excellence. Elevating Influence.
          </motion.p>
        </motion.div>

            {/* Apple Liquid Glass Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3 w-full max-w-md px-4"
            >
            {[
            { label: 'TOP 100 Women Season 3', icon: '⭐', page: 'Home' },
            { label: 'Play: Runway to Orbit', icon: '🛩️', page: 'TheHangar' },
            { label: 'Hall of Fame', icon: '🏆', page: 'Arena' },
            { label: 'Learn More', icon: '📖', page: 'Landing' },
              ].map((btn, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                >
                  <Link to={createPageUrl(btn.page)}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative rounded-3xl backdrop-blur-2xl border border-white/20 overflow-hidden cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        touchAction: 'manipulation',
                      }}
                    >
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 opacity-30" style={{
                        background: `linear-gradient(135deg, ${brandColors.goldPrestige}20, transparent)`,
                      }} />

                      <div className="relative flex items-center gap-4 p-4">
                        {/* Icon */}
                        <div className="text-4xl flex-shrink-0">
                          {btn.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white" style={{
                            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            letterSpacing: '-0.01em',
                          }}>
                            {btn.label}
                          </h3>
                        </div>

                        {/* Chevron */}
                        <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}