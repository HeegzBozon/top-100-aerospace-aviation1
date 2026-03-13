import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGame } from '../GameContext';
import { useLayer } from './layers';

const brandColors = {
  navyDeep: 0x1e3a5a,
  skyBlue: 0x4a90b8,
  holoCyan: 0x00d4ff,
  goldPrestige: 0xb8860b,
  pineappleGold: 0xffd700,
};

export default function OutsideScene({ onAreaChange, onInteractableNear, cameraMode = 'follow' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({});
  const animatedObjectsRef = useRef([]);
  const cameraAngleRef = useRef({ yaw: 0, pitch: 0.15 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef(null);
  const waypointsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const floorMeshRef = useRef(null);
  const buildingsRef = useRef([]);
  const [currentArea, setCurrentArea] = useState('entrance');
  const { player } = useGame();
  const { currentLayer } = useLayer();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    // Scene setup - Dynamic sky based on local time
    const hour = new Date().getHours();
    const isDawn = hour >= 5 && hour < 8;
    const isDay = hour >= 8 && hour < 17;
    const isDusk = hour >= 17 && hour < 20;
    const isNight = hour >= 20 || hour < 5;

    const skyColor = isDawn ? 0xffa07a : isDay ? 0x87ceeb : isDusk ? 0xff7f50 : 0x1a1a3a;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(skyColor, 100, 800);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 15, 50);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === DYNAMIC LIGHTING BASED ON TIME ===
    const ambientIntensity = isDawn ? 0.5 : isDay ? 0.6 : isDusk ? 0.4 : 0.3;
    const ambientColor = isDawn ? 0xffaa88 : isDay ? 0xffffff : isDusk ? 0xff8855 : 0x4a5a6a;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    const sunColor = isDawn ? 0xffbb88 : isDay ? 0xfff5e6 : isDusk ? 0xff7744 : 0x6a7a9a;
    const sunIntensity = isDawn ? 0.9 : isDay ? 1.2 : isDusk ? 0.8 : 0.4;
    const sunLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    sunLight.position.set(200, 300, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -400;
    sunLight.shadow.camera.right = 400;
    sunLight.shadow.camera.top = 400;
    sunLight.shadow.camera.bottom = -400;
    scene.add(sunLight);

    const skyHemiColor = isDawn ? 0xffa07a : isDay ? 0x87ceeb : isDusk ? 0xff7f50 : 0x2a3a4a;
    const groundHemiColor = isDawn ? 0x8b6a55 : isDay ? 0x8b7355 : isDusk ? 0x7a5a45 : 0x3a3a3a;
    const skyLight = new THREE.HemisphereLight(skyHemiColor, groundHemiColor, 0.5);
    scene.add(skyLight);

    // === GROUND (Grass + Concrete) ===
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundTexture = new THREE.CanvasTexture(createGrassTexture());
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    floorMeshRef.current = ground;

    // === ROADS (Concrete pathways) ===
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    
    // Main road (horizontal)
    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(600, 20), roadMaterial);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.y = 0.02;
    scene.add(mainRoad);

    // Vertical roads
    [-150, 0, 150].forEach(x => {
      const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(20, 400), roadMaterial);
      vRoad.rotation.x = -Math.PI / 2;
      vRoad.position.set(x, 0.02, -100);
      scene.add(vRoad);
    });

    // === YOU ARE HERE - SKY CADET HANGAR (Main building, center-right) ===
    const hangarGroup = new THREE.Group();
    
    // Main hangar shell
    const hangarBody = new THREE.Mesh(
      new THREE.BoxGeometry(80, 40, 60),
      new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.6, roughness: 0.3 })
    );
    hangarBody.position.y = 20;
    hangarBody.castShadow = true;
    hangarGroup.add(hangarBody);

    // Curved roof
    const roofGeometry = new THREE.CylinderGeometry(40, 40, 60, 32, 1, true, 0, Math.PI);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1e2a3a, metalness: 0.7, roughness: 0.2 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.y = 20;
    hangarGroup.add(roof);

    // "SKY CADET HANGAR" sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d');
    signCtx.fillStyle = '#1e3a5a';
    signCtx.fillRect(0, 0, 512, 128);
    signCtx.fillStyle = '#ffd700';
    signCtx.font = 'bold 48px Arial';
    signCtx.textAlign = 'center';
    signCtx.fillText('SKY CADET HANGAR', 256, 80);
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const hangarSign = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 5),
      new THREE.MeshBasicMaterial({ map: signTexture })
    );
    hangarSign.position.set(0, 42, 31);
    hangarGroup.add(hangarSign);

    // Entrance door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(12, 18, 2),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    door.position.set(0, 9, 31);
    hangarGroup.add(door);

    hangarGroup.position.set(150, 0, 0);
    hangarGroup.userData = { 
      type: 'building', 
      name: 'SKY CADET HANGAR',
      boundingBox: new THREE.Box3().setFromObject(hangarBody)
    };
    scene.add(hangarGroup);

    // === STARDUST GATEWAY (Top-left, tall vertical rockets) ===
    const gatewayGroup = new THREE.Group();
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.7, roughness: 0.2 });
    
    for (let i = 0; i < 5; i++) {
      const rocketHeight = 60 + i * 5;
      const rocket = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2.5, rocketHeight, 16),
        rocketMat
      );
      rocket.position.set(i * 8 - 16, rocketHeight / 2, 0);
      rocket.castShadow = true;
      gatewayGroup.add(rocket);
      
      const noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(2, 6, 16),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
      );
      noseCone.position.set(i * 8 - 16, rocketHeight + 3, 0);
      gatewayGroup.add(noseCone);
    }
    
    gatewayGroup.position.set(-200, 0, -200);
    gatewayGroup.userData = { 
      type: 'building',
      name: 'STARDUST GATEWAY',
      bounds: { x: -200, z: -200, radius: 25 }
    };
    scene.add(gatewayGroup);

    // === LAUNCH COMPLEX 01A (Top-right, circular pad with rocket) ===
    const complex01A = new THREE.Group();
    
    // Circular pad
    const padA = new THREE.Mesh(
      new THREE.CylinderGeometry(35, 35, 2, 32),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 })
    );
    padA.position.y = 1;
    padA.castShadow = true;
    complex01A.add(padA);

    // Flame trench
    const trenchA = new THREE.Mesh(
      new THREE.BoxGeometry(10, 3, 40),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    trenchA.position.y = -0.5;
    complex01A.add(trenchA);

    // Starship-style rocket
    const starshipBody = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 50, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.8, roughness: 0.2 })
    );
    starshipBody.position.y = 27;
    starshipBody.castShadow = true;
    complex01A.add(starshipBody);

    const starshipNose = new THREE.Mesh(
      new THREE.ConeGeometry(4, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    starshipNose.position.y = 56;
    complex01A.add(starshipNose);

    complex01A.position.set(200, 0, -200);
    complex01A.userData = { 
      type: 'building',
      name: 'LAUNCH COMPLEX 01A',
      bounds: { x: 200, z: -200, radius: 40 }
    };
    scene.add(complex01A);

    // === LAUNCH COMPLEX 01B (Right side, smaller rocket) ===
    const complex01B = new THREE.Group();
    
    const padB = new THREE.Mesh(
      new THREE.CylinderGeometry(30, 30, 2, 32),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 })
    );
    padB.position.y = 1;
    padB.castShadow = true;
    complex01B.add(padB);

    const falconBody = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3.5, 40, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.7 })
    );
    falconBody.position.y = 22;
    falconBody.castShadow = true;
    complex01B.add(falconBody);

    const falconNose = new THREE.Mesh(
      new THREE.ConeGeometry(3, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    falconNose.position.y = 45;
    complex01B.add(falconNose);

    complex01B.position.set(280, 0, -80);
    complex01B.userData = { 
      type: 'building',
      name: 'LAUNCH COMPLEX 01B',
      bounds: { x: 280, z: -80, radius: 35 }
    };
    scene.add(complex01B);

    // === ASSEMBLY SPIRE (Left-center, tall VAB-style building) ===
    const assemblySpire = new THREE.Group();
    
    const spireBody = new THREE.Mesh(
      new THREE.BoxGeometry(50, 80, 60),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.7 })
    );
    spireBody.position.y = 40;
    spireBody.castShadow = true;
    assemblySpire.add(spireBody);

    // Blue vertical stripes
    const stripe1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 80, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a3a6a })
    );
    stripe1.position.set(25.3, 40, -15);
    assemblySpire.add(stripe1);

    const stripe2 = stripe1.clone();
    stripe2.position.set(25.3, 40, 15);
    assemblySpire.add(stripe2);

    assemblySpire.position.set(-80, 0, -50);
    assemblySpire.userData = { 
      type: 'building',
      name: 'ASSEMBLY SPIRE',
      bounds: { x: -80, z: -50, width: 50, depth: 60 }
    };
    scene.add(assemblySpire);

    // === MYTHOS THEATER 1 (Center-left, rectangular building) ===
    const theater1 = new THREE.Group();
    
    const theaterBody1 = new THREE.Mesh(
      new THREE.BoxGeometry(60, 20, 30),
      new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.5 })
    );
    theaterBody1.position.y = 10;
    theaterBody1.castShadow = true;
    theater1.add(theaterBody1);

    const theaterRoof1 = new THREE.Mesh(
      new THREE.BoxGeometry(62, 2, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a3a4a })
    );
    theaterRoof1.position.y = 21;
    theater1.add(theaterRoof1);

    theater1.position.set(0, 0, -50);
    theater1.userData = { 
      type: 'building',
      name: 'MYTHOS THEATER 1',
      bounds: { x: 0, z: -50, width: 60, depth: 30 }
    };
    scene.add(theater1);

    // === MYTHOS THEATER 2 (Below theater 1) ===
    const theater2 = theater1.clone();
    theater2.position.set(-30, 0, 30);
    theater2.userData = { 
      type: 'building',
      name: 'MYTHOS THEATER 2',
      bounds: { x: -30, z: 30, width: 60, depth: 30 }
    };
    scene.add(theater2);

    // === STARSHIPH AURORA HALL (Center-right, modern glass building) ===
    const auroraHall = new THREE.Group();
    
    const hallBody = new THREE.Mesh(
      new THREE.BoxGeometry(50, 25, 40),
      new THREE.MeshStandardMaterial({ 
        color: 0x4a6a8a, 
        metalness: 0.8, 
        roughness: 0.1,
        transparent: true,
        opacity: 0.7
      })
    );
    hallBody.position.y = 12.5;
    hallBody.castShadow = true;
    auroraHall.add(hallBody);

    auroraHall.position.set(80, 0, 30);
    auroraHall.userData = { 
      type: 'building',
      name: 'AURORA HALL',
      bounds: { x: 80, z: 30, width: 50, depth: 40 }
    };
    scene.add(auroraHall);

    // === ENTRANCE (Bottom-left marker) ===
    const entranceMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 10, 0.5, 32),
      new THREE.MeshStandardMaterial({ color: brandColors.goldPrestige, emissive: 0xffd700, emissiveIntensity: 0.3 })
    );
    entranceMarker.position.set(-150, 0.3, 100);
    entranceMarker.rotation.x = -Math.PI / 2;
    scene.add(entranceMarker);
    animatedObjectsRef.current.push({ mesh: entranceMarker, type: 'pulse' });

    // === PLAYER (Space Cat Model) ===
    const playerGroup = createSpaceCat();
    playerGroup.position.set(-130, 0, 90);
    scene.add(playerGroup);
    playerRef.current = playerGroup;

    // === AREA MARKERS ===
    const areaMarkers = [];
    const createAreaMarker = (x, z, label, color) => {
      const marker = new THREE.Mesh(
        new THREE.RingGeometry(5, 6, 32),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(x, 0.05, z);
      marker.userData = { area: label };
      scene.add(marker);
      areaMarkers.push(marker);
      return marker;
    };

    createAreaMarker(-130, 90, 'entrance', brandColors.goldPrestige);
    createAreaMarker(-200, -200, 'stardust_gateway', 0x9966ff);
    createAreaMarker(200, -200, 'launch_complex_01a', 0xff6b35);
    createAreaMarker(280, -80, 'launch_complex_01b', 0xff6b35);
    createAreaMarker(-80, -50, 'assembly_spire', 0x4a90b8);
    createAreaMarker(0, -50, 'mythos_theater_1', 0xffc107);
    createAreaMarker(-30, 30, 'mythos_theater_2', 0xffc107);
    createAreaMarker(80, 30, 'aurora_hall', 0x00d4ff);
    createAreaMarker(150, 0, 'hangar_entrance', brandColors.goldPrestige);

    // Store all buildings for collision detection
    buildingsRef.current = [
      hangarGroup, gatewayGroup, complex01A, complex01B, 
      assemblySpire, theater1, theater2, auroraHall
    ];

    // Controls
    const handleKeyDown = (e) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse controls
    const handleMouseDown = (e) => {
      isDraggingRef.current = false;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (e.buttons !== 1) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDraggingRef.current = true;
      }
      if (isDraggingRef.current) {
        const sensitivity = 0.005;
        cameraAngleRef.current.yaw -= dx * sensitivity;
        cameraAngleRef.current.pitch -= dy * sensitivity;
        cameraAngleRef.current.pitch = Math.max(-1.5, Math.min(1.5, cameraAngleRef.current.pitch));
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e) => {
      if (!isDraggingRef.current && floorMeshRef.current) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycasterRef.current.setFromCamera(mouse, camera);
        const intersects = raycasterRef.current.intersectObject(floorMeshRef.current);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          const clampedPoint = {
            x: Math.max(-450, Math.min(450, point.x)),
            z: Math.max(-450, Math.min(450, point.z))
          };
          
          // Right click = add to waypoint queue
          if (e.button === 2) {
            waypointsRef.current.push(clampedPoint);
          } else {
            // Left click = replace all waypoints
            waypointsRef.current = [clampedPoint];
            targetPositionRef.current = null;
          }
        }
      }
      isDraggingRef.current = false;
    };
    
    const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent right-click menu
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    const moveSpeed = 0.5;
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      // Animate objects
      animatedObjectsRef.current.forEach(({ mesh, type }) => {
        if (type === 'pulse') {
          mesh.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
          mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
        }
      });

      // Check for nearby building entrances
      let nearestBuilding = null;
      let nearestDist = 8;
      buildingsRef.current.forEach(building => {
        const bounds = building.userData.bounds;
        const bPos = building.position;
        let dist;
        
        if (bounds) {
          if (bounds.radius) {
            // Circular collision
            dist = Math.hypot(
              playerRef.current.position.x - (bPos.x + bounds.x),
              playerRef.current.position.z - (bPos.z + bounds.z)
            ) - bounds.radius;
          } else {
            // Box collision
            const dx = Math.max(
              Math.abs(playerRef.current.position.x - (bPos.x + bounds.x)) - bounds.width / 2,
              0
            );
            const dz = Math.max(
              Math.abs(playerRef.current.position.z - (bPos.z + bounds.z)) - bounds.depth / 2,
              0
            );
            dist = Math.sqrt(dx * dx + dz * dz);
          }
        } else {
          dist = playerRef.current.position.distanceTo(building.position);
        }
        
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestBuilding = {
            type: 'building_entrance',
            name: building.userData.name,
            promptLabel: `Press X to enter ${building.userData.name}`,
            promptSubLabel: 'Building Entrance'
          };
        }
      });
      
      onInteractableNear?.(nearestBuilding);

      if (playerRef.current) {
        const keys = keysRef.current;
        const yaw = cameraAngleRef.current.yaw;

        // Waypoint-based movement
        if (!targetPositionRef.current && waypointsRef.current.length > 0) {
          targetPositionRef.current = waypointsRef.current[0];
        }
        
        // Move toward current target
        if (targetPositionRef.current) {
          const tx = targetPositionRef.current.x - playerRef.current.position.x;
          const tz = targetPositionRef.current.z - playerRef.current.position.z;
          const dist = Math.sqrt(tx * tx + tz * tz);
          if (dist > 1) {
            const newX = playerRef.current.position.x + (tx / dist) * moveSpeed;
            const newZ = playerRef.current.position.z + (tz / dist) * moveSpeed;
            
            // Check collision before moving
            if (!checkCollision(newX, newZ)) {
              playerRef.current.position.x = newX;
              playerRef.current.position.z = newZ;
              playerRef.current.rotation.y = Math.atan2(tx, tz);
            } else {
              // Hit wall, clear path
              targetPositionRef.current = null;
              waypointsRef.current = [];
            }
          } else {
            // Reached waypoint, move to next
            waypointsRef.current.shift();
            targetPositionRef.current = null;
          }
        }

        // Keyboard movement
        let moveX = 0, moveZ = 0;
        if (keys['ArrowUp']) { moveX -= Math.sin(yaw); moveZ -= Math.cos(yaw); }
        if (keys['ArrowDown']) { moveX += Math.sin(yaw); moveZ += Math.cos(yaw); }
        if (keys['ArrowLeft']) { moveX -= Math.cos(yaw); moveZ += Math.sin(yaw); }
        if (keys['ArrowRight']) { moveX += Math.cos(yaw); moveZ -= Math.sin(yaw); }

        const moveMag = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (moveMag > 0) {
          targetPositionRef.current = null;
          waypointsRef.current = []; // Clear waypoints on keyboard input
          const newX = playerRef.current.position.x + (moveX / moveMag) * moveSpeed;
          const newZ = playerRef.current.position.z + (moveZ / moveMag) * moveSpeed;
          
          if (!checkCollision(newX, newZ)) {
            playerRef.current.position.x = newX;
            playerRef.current.position.z = newZ;
            playerRef.current.rotation.y = Math.atan2(moveX, moveZ);
          }
        }

        // Boundaries
        playerRef.current.position.x = Math.max(-450, Math.min(450, playerRef.current.position.x));
        playerRef.current.position.z = Math.max(-450, Math.min(450, playerRef.current.position.z));

        // Camera control based on mode
        if (cameraMode === 'manual') {
          // Manual: Allow full Q/E/W/S control (already handled by existing key listeners)
        } else {
          // Follow mode - intelligent camera
          const targetYaw = playerRef.current.rotation.y + Math.PI;
          const yawDiff = targetYaw - cameraAngleRef.current.yaw;
          const normalizedDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
          cameraAngleRef.current.yaw += normalizedDiff * 0.015; // Much slower, smoother turn

          // Dynamic pitch based on movement - lower for horizontal view
          const targetPitch = 0.15 + Math.abs(moveMag) * 0.05;
          cameraAngleRef.current.pitch += (targetPitch - cameraAngleRef.current.pitch) * 0.02;
        }

        // Camera orbit
        const camDist = 25;
        const pitch = cameraAngleRef.current.pitch;
        const horizontalDist = camDist * Math.cos(pitch);
        const verticalOffset = Math.sin(pitch) * camDist;
        const playerX = playerRef.current.position.x;
        const playerZ = playerRef.current.position.z;

        camera.position.x = playerX + Math.sin(yaw) * horizontalDist;
        camera.position.z = playerZ + Math.cos(yaw) * horizontalDist;
        camera.position.y = Math.max(2, 5 + verticalOffset);
        camera.lookAt(playerX, 1.5, playerZ);

        // Area detection
        const px = playerRef.current.position.x;
        const pz = playerRef.current.position.z;
        let newArea = 'campus';

        if (Math.hypot(px + 130, pz - 90) < 15) newArea = 'entrance';
        else if (Math.hypot(px + 200, pz + 200) < 40) newArea = 'stardust_gateway';
        else if (Math.hypot(px - 200, pz + 200) < 40) newArea = 'launch_complex_01a';
        else if (Math.hypot(px - 280, pz + 80) < 35) newArea = 'launch_complex_01b';
        else if (Math.hypot(px + 80, pz + 50) < 35) newArea = 'assembly_spire';
        else if (Math.hypot(px, pz + 50) < 35) newArea = 'mythos_theater_1';
        else if (Math.hypot(px + 30, pz - 30) < 35) newArea = 'mythos_theater_2';
        else if (Math.hypot(px - 80, pz - 30) < 30) newArea = 'aurora_hall';
        else if (Math.hypot(px - 150, pz) < 45) newArea = 'hangar_entrance';

        if (newArea !== currentArea) {
          setCurrentArea(newArea);
          onAreaChange?.(newArea);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    
    // Collision detection helper
    function checkCollision(newX, newZ) {
      let collides = false;
      buildingsRef.current.forEach(building => {
        const bounds = building.userData.bounds;
        const bPos = building.position;
        
        if (bounds) {
          if (bounds.radius) {
            // Circular collision with buffer
            const dist = Math.hypot(
              newX - (bPos.x + bounds.x),
              newZ - (bPos.z + bounds.z)
            );
            if (dist < bounds.radius + 3) collides = true;
          } else if (bounds.width && bounds.depth) {
            // Box collision with buffer
            const halfW = bounds.width / 2 + 3;
            const halfD = bounds.depth / 2 + 3;
            const dx = Math.abs(newX - (bPos.x + bounds.x));
            const dz = Math.abs(newZ - (bPos.z + bounds.z));
            if (dx < halfW && dz < halfD) collides = true;
          }
        }
      });
      return collides;
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ minHeight: '100vh' }}
    />
  );
}

// Helper: Create Space Cat avatar (stylized proxy for Sketchfab model)
function createSpaceCat() {
  const group = new THREE.Group();
  
  // Cat colors
  const catFur = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });
  const catNose = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.4 });
  const spaceSuit = new THREE.MeshStandardMaterial({ color: 0x4a90b8, metalness: 0.6, roughness: 0.3 });
  const visorGlass = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6, metalness: 0.9, roughness: 0.1 });
  
  // Body (cat torso with space suit)
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 0.6, 16, 16),
    spaceSuit
  );
  body.position.y = 1.2;
  body.castShadow = true;
  group.add(body);
  
  // Head (cat face)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 24, 24),
    catFur
  );
  head.position.y = 2.1;
  head.scale.set(1, 0.9, 0.95);
  head.castShadow = true;
  group.add(head);
  
  // Helmet visor
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6),
    visorGlass
  );
  visor.position.set(0, 2.1, 0.15);
  visor.rotation.x = -0.3;
  group.add(visor);
  
  // Ears (triangular)
  const earGeo = new THREE.ConeGeometry(0.15, 0.3, 8);
  const leftEar = new THREE.Mesh(earGeo, catFur);
  leftEar.position.set(-0.25, 2.5, -0.1);
  leftEar.rotation.z = -0.3;
  group.add(leftEar);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.25;
  rightEar.rotation.z = 0.3;
  group.add(rightEar);
  
  // Nose
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    catNose
  );
  nose.position.set(0, 2.0, 0.4);
  group.add(nose);
  
  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.12, 0.4, 8, 8);
  const leftArm = new THREE.Mesh(armGeo, spaceSuit);
  leftArm.position.set(-0.55, 1.2, 0);
  leftArm.rotation.z = 0.5;
  group.add(leftArm);
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.55;
  rightArm.rotation.z = -0.5;
  group.add(rightArm);
  
  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.15, 0.4, 8, 8);
  const leftLeg = new THREE.Mesh(legGeo, spaceSuit);
  leftLeg.position.set(-0.2, 0.5, 0);
  group.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.2;
  group.add(rightLeg);
  
  // Tail (cat signature)
  const tailCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0.8, -0.3),
    new THREE.Vector3(0, 1.5, -0.7),
    new THREE.Vector3(0, 2.0, -0.5)
  );
  const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.08, 8, false);
  const tail = new THREE.Mesh(tailGeo, catFur);
  group.add(tail);
  
  // Boombox accessory (on back)
  const boombox = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.4 })
  );
  boombox.position.set(0, 1.2, -0.4);
  group.add(boombox);
  
  // Speaker grills
  const speakerGeo = new THREE.CircleGeometry(0.08, 16);
  const speakerMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const leftSpeaker = new THREE.Mesh(speakerGeo, speakerMat);
  leftSpeaker.position.set(-0.12, 1.2, -0.32);
  leftSpeaker.rotation.y = Math.PI;
  group.add(leftSpeaker);
  const rightSpeaker = leftSpeaker.clone();
  rightSpeaker.position.x = 0.12;
  group.add(rightSpeaker);
  
  // Scale to match previous avatar size
  group.scale.set(1.2, 1.2, 1.2);
  
  return group;
}

// Helper: Create grass texture
function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#5a8a3a';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#4a7a2a' : '#6a9a4a';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  return canvas;
}