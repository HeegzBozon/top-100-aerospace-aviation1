import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGame } from '../GameContext';

const brandColors = {
  navyDeep: 0x1e3a5a,
  skyBlue: 0x4a90b8,
  holoCyan: 0x00d4ff,
  goldPrestige: 0xb8860b,
  cream: 0xfaf8f5,
};

export default function HangarScene({ onAreaChange, onInteractableNear, cameraMode = 'follow' }) {
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
  const raycasterRef = useRef(new THREE.Raycaster());
  const floorMeshRef = useRef(null);
  const [currentArea, setCurrentArea] = useState('main_hall');
  const { player } = useGame();
  const initializedRef = useRef(false);
  const playerDataRef = useRef(player);

  // Keep ref in sync without triggering re-init
  useEffect(() => {
    playerDataRef.current = player;
  }, [player]);

  useEffect(() => {
    // Prevent re-initialization on player data changes
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    // Scene setup - dynamic based on local time
    const hour = new Date().getHours();
    const isDawn = hour >= 5 && hour < 8;
    const isDay = hour >= 8 && hour < 17;
    const isDusk = hour >= 17 && hour < 20;
    const isNight = hour >= 20 || hour < 5;

    const skyColor = isDawn ? 0x4a2a4a : isDay ? 0x1a3a5a : isDusk ? 0x5a3a2a : 0x0a1525;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(skyColor, 100, 300);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 25);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === DYNAMIC LIGHTING BASED ON TIME ===
    const ambientIntensity = isDawn ? 0.4 : isDay ? 0.7 : isDusk ? 0.5 : 0.3;
    const ambientColor = isDawn ? 0xff8a5a : isDay ? 0x4a6a8a : isDusk ? 0xff6a3a : 0x2a3a4a;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    const hemiSkyColor = isDawn ? 0xffaa88 : isDay ? 0xadd8e6 : isDusk ? 0xff7755 : 0x1a2a3a;
    const hemiGroundColor = isDawn ? 0x6a4a3a : isDay ? 0x5a4a3a : isDusk ? 0x4a3a2a : 0x2a2a2a;
    const hemiLight = new THREE.HemisphereLight(hemiSkyColor, hemiGroundColor, 0.6);
    scene.add(hemiLight);

    const mainLightColor = isDawn ? 0xffaa77 : isDay ? 0xfff5e6 : isDusk ? 0xff8855 : 0x6a7a9a;
    const mainLightIntensity = isDawn ? 0.8 : isDay ? 1.0 : isDusk ? 0.6 : 0.4;
    const mainLight = new THREE.DirectionalLight(mainLightColor, mainLightIntensity);
    mainLight.position.set(0, 80, -20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Secondary fill light from front
    const fillLight = new THREE.DirectionalLight(0xe6f0ff, isDay ? 0.4 : 0.2);
    fillLight.position.set(0, 40, 60);
    scene.add(fillLight);

    // Blue accent lights for holographic glow
    const holoLight1 = new THREE.PointLight(brandColors.holoCyan, 3, 50);
    holoLight1.position.set(0, 8, -20);
    scene.add(holoLight1);

    const holoLight2 = new THREE.PointLight(brandColors.holoCyan, 1.5, 30);
    holoLight2.position.set(0, 3, -20);
    scene.add(holoLight2);

    // Warm accent lights for heritage wing
    const heritageLight = new THREE.PointLight(0xffaa55, 1.2, 40);
    heritageLight.position.set(-35, 10, 0);
    scene.add(heritageLight);

    // Cool accent for R&D lab
    const labLight = new THREE.PointLight(0x55aaff, 1.2, 40);
    labLight.position.set(35, 10, -15);
    scene.add(labLight);

    // Runway deck lighting
    const runwayLight1 = new THREE.PointLight(0x44ff44, 0.8, 25);
    runwayLight1.position.set(-10, 2, 35);
    scene.add(runwayLight1);
    const runwayLight2 = new THREE.PointLight(0x44ff44, 0.8, 25);
    runwayLight2.position.set(10, 2, 35);
    scene.add(runwayLight2);

    // === DYNAMIC STARFIELD SKYBOX ===
    const starfieldGroup = new THREE.Group();
    
    // Create stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const radius = 250 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi) + 100;
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Varied star colors (white, blue-white, yellow)
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1;
      } else if (colorChoice < 0.8) {
        starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1;
      } else {
        starColors[i * 3] = 1; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 0.8;
      }
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    starfieldGroup.add(stars);
    
    // Add Earth in background
    const earthGeometry = new THREE.SphereGeometry(80, 64, 64);
    const earthTexture = new THREE.TextureLoader().load(
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=2048&q=80'
    );
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
    earthSphere.position.set(100, 180, -200);
    starfieldGroup.add(earthSphere);
    
    // Florida coastline horizon (visible through hangar opening)
    const coastlineGeo = new THREE.PlaneGeometry(300, 60);
    const coastlineMat = new THREE.MeshBasicMaterial({ 
      color: 0x1a5a8a, 
      transparent: true, 
      opacity: 0.3 
    });
    const coastline = new THREE.Mesh(coastlineGeo, coastlineMat);
    coastline.position.set(0, 10, 80);
    scene.add(coastline);
    
    // Ocean horizon
    const oceanGeo = new THREE.PlaneGeometry(400, 100);
    const oceanMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a3a5a, 
      roughness: 0.3,
      metalness: 0.6
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -2, 120);
    scene.add(ocean);
    
    scene.add(starfieldGroup);
    animatedObjectsRef.current.push({ mesh: starfieldGroup, type: 'rotate_sky' });

    // === FLOOR (brighter, reflective) ===
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a4a5a,
      metalness: 0.5,
      roughness: 0.4
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorMeshRef.current = floor;

    // Floor grid lines (brighter)
    const gridHelper = new THREE.GridHelper(200, 80, 0x5a7a9a, 0x3a5a7a);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);
    
    // Floor accent lighting
    const floorLight1 = new THREE.PointLight(0x6688aa, 0.6, 60);
    floorLight1.position.set(0, 1, 0);
    scene.add(floorLight1);
    const floorLight2 = new THREE.PointLight(0x6688aa, 0.4, 50);
    floorLight2.position.set(-20, 1, -20);
    scene.add(floorLight2);
    const floorLight3 = new THREE.PointLight(0x6688aa, 0.4, 50);
    floorLight3.position.set(20, 1, -20);
    scene.add(floorLight3);

    // === HANGAR CURVED SHELL ===
    const hangarMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2a3a,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    // Main curved roof (half cylinder)
    const roofGeometry = new THREE.CylinderGeometry(55, 55, 120, 32, 1, true, 0, Math.PI);
    const roof = new THREE.Mesh(roofGeometry, hangarMaterial);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, 0, -20);
    scene.add(roof);

    // Structural ribs
    const ribMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.8, roughness: 0.2 });
    for (let z = -70; z <= 40; z += 15) {
      const ribGeometry = new THREE.TorusGeometry(54, 1.5, 8, 32, Math.PI);
      const rib = new THREE.Mesh(ribGeometry, ribMaterial);
      rib.rotation.y = Math.PI / 2;
      rib.rotation.x = Math.PI / 2;
      rib.position.set(0, 0, z);
      scene.add(rib);
    }

    // Skylight opening (cutout effect with emissive ring)
    const skylightRing = new THREE.Mesh(
      new THREE.RingGeometry(18, 22, 32),
      new THREE.MeshBasicMaterial({ color: 0x3a5a7a, side: THREE.DoubleSide })
    );
    skylightRing.rotation.x = Math.PI / 2;
    skylightRing.position.set(0, 54, -20);
    scene.add(skylightRing);

    // === SPACE CAT AVATAR (consistent with outside) ===
    const playerGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.35, 0.5, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.6,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.scale.set(1, 0.9, 1);
    head.castShadow = true;
    playerGroup.add(head);

    // Cat ears
    const earGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
    const earMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.25, 1.85, 0);
    leftEar.rotation.z = -Math.PI / 6;
    leftEar.castShadow = true;
    playerGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.25, 1.85, 0);
    rightEar.rotation.z = Math.PI / 6;
    rightEar.castShadow = true;
    playerGroup.add(rightEar);

    // Visor
    const visorGeometry = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const visorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x88ccff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.9
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.y = 1.55;
    visor.position.z = 0.25;
    playerGroup.add(visor);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ffff, 
      emissive: 0x00cccc,
      emissiveIntensity: 0.8
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 1.55, 0.35);
    playerGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 1.55, 0.35);
    playerGroup.add(rightEye);

    // Nose
    const noseGeometry = new THREE.ConeGeometry(0.05, 0.08, 3);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 1.45, 0.38);
    nose.rotation.x = Math.PI;
    playerGroup.add(nose);

    // Whiskers
    const whiskerGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4);
    const whiskerMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    
    [-0.15, 0.15].forEach((x) => {
      const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
      whisker.position.set(x, 1.45, 0.35);
      whisker.rotation.z = x < 0 ? -Math.PI / 4 : Math.PI / 4;
      playerGroup.add(whisker);
    });

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.1, 0.45, 4, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.45, 0.9, 0);
    leftArm.rotation.z = Math.PI / 5;
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.45, 0.9, 0);
    rightArm.rotation.z = -Math.PI / 5;
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.12, 0.4, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xe8e8e8 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.18, 0.25, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.18, 0.25, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    // Tail
    const tailSegments = [];
    for (let i = 0; i < 5; i++) {
      const segment = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 - i * 0.015, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
      );
      segment.position.set(0, 0.8 - i * 0.08, -0.35 - i * 0.08);
      segment.castShadow = true;
      playerGroup.add(segment);
      tailSegments.push(segment);
    }

    // Backpack
    const backpackGeometry = new THREE.BoxGeometry(0.45, 0.5, 0.25);
    const backpackMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc9a87c,
      roughness: 0.5,
      metalness: 0.3
    });
    const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
    backpack.position.set(0, 0.9, -0.35);
    backpack.castShadow = true;
    playerGroup.add(backpack);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0.15, 1.9, 0.1);
    playerGroup.add(antenna);

    const antennaBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshStandardMaterial({ 
        color: 0x00ff88, 
        emissive: 0x00cc66,
        emissiveIntensity: 1.5
      })
    );
    antennaBall.position.set(0.15, 2.05, 0.1);
    playerGroup.add(antennaBall);
    animatedObjectsRef.current.push({ mesh: antennaBall, type: 'blink' });

    playerGroup.position.set(0, 0, 15);
    scene.add(playerGroup);
    playerRef.current = playerGroup;

    // === CENTRAL HOLOGRAPHIC PODIUM (TOP 100) ===
    // Base pedestal
    const podiumBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3.5, 1.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.1 })
    );
    podiumBase.position.set(0, 0.75, -20);
    podiumBase.castShadow = true;
    scene.add(podiumBase);

    // Glowing ring at base
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.15, 16, 64),
      new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, transparent: true, opacity: 0.8 })
    );
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.set(0, 1.6, -20);
    scene.add(glowRing);
    animatedObjectsRef.current.push({ mesh: glowRing, type: 'pulse' });

    // TOP 100 label cylinder
    const labelCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 3, 32),
      new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.8, roughness: 0.2 })
    );
    labelCylinder.position.set(0, 3, -20);
    scene.add(labelCylinder);

    // Holographic figure (translucent humanoid placeholder)
    const holoBodyGroup = new THREE.Group();
    
    // Torso
    const holoTorso = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 0.8, 4, 16),
      new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, transparent: true, opacity: 0.35, wireframe: false })
    );
    holoTorso.position.y = 2;
    holoBodyGroup.add(holoTorso);

    // Head
    const holoHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, transparent: true, opacity: 0.4 })
    );
    holoHead.position.y = 4.8;
    holoBodyGroup.add(holoHead);

    // Arms (crossed)
    const holoArmGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const holoArmMat = new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, transparent: true, opacity: 0.3 });
    const holoLeftArm = new THREE.Mesh(holoArmGeo, holoArmMat);
    holoLeftArm.rotation.z = Math.PI / 4;
    holoLeftArm.position.set(-0.8, 2.5, 0.5);
    holoBodyGroup.add(holoLeftArm);

    const holoRightArm = new THREE.Mesh(holoArmGeo, holoArmMat);
    holoRightArm.rotation.z = -Math.PI / 4;
    holoRightArm.position.set(0.8, 2.5, 0.5);
    holoBodyGroup.add(holoRightArm);

    // Hologram scan lines effect
    const scanLines = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 6, 32, 20, true),
      new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, transparent: true, opacity: 0.15, wireframe: true })
    );
    scanLines.position.y = 3;
    holoBodyGroup.add(scanLines);

    holoBodyGroup.position.set(0, 5, -20);
    scene.add(holoBodyGroup);
    animatedObjectsRef.current.push({ mesh: holoBodyGroup, type: 'float' });

    // === LEFT WING: AIRPLANE + ROCKETS ===
    // Commercial airplane
    const planeFuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, 25, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.4, roughness: 0.3 })
    );
    planeFuselage.rotation.z = Math.PI / 2;
    planeFuselage.position.set(-30, 4, 0);
    scene.add(planeFuselage);

    // Plane wings
    const wingGeo = new THREE.BoxGeometry(3, 0.3, 18);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.5, roughness: 0.3 });
    const planeWing = new THREE.Mesh(wingGeo, wingMat);
    planeWing.position.set(-30, 4, 0);
    scene.add(planeWing);

    // Plane tail
    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, 3),
      wingMat
    );
    tailFin.position.set(-42, 7, 0);
    scene.add(tailFin);

    // NASA-style logo stripe (red)
    const logoStripe = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.5, 2.6),
      new THREE.MeshBasicMaterial({ color: 0xcc0000 })
    );
    logoStripe.position.set(-35, 5.5, 2.5);
    scene.add(logoStripe);

    // Rockets in background
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.2 });
    const rocketPositions = [[-45, -40], [-38, -45], [-32, -38]];
    rocketPositions.forEach(([x, z], i) => {
      const height = 25 + i * 5;
      const rocketBody = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, height, 16),
        rocketMat
      );
      rocketBody.position.set(x, height / 2, z);
      scene.add(rocketBody);

      const noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 4, 16),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5, roughness: 0.3 })
      );
      noseCone.position.set(x, height + 2, z);
      scene.add(noseCone);
    });

    // === VEHICLE ASSEMBLY BUILDING (VAB) ===
    const vabGroup = new THREE.Group();
    
    // Main VAB structure
    const vabBody = new THREE.Mesh(
      new THREE.BoxGeometry(35, 50, 40),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.7, metalness: 0.1 })
    );
    vabBody.position.y = 25;
    vabGroup.add(vabBody);
    
    // VAB vertical stripes (blue)
    const vabStripe1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 50, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a3a6a })
    );
    vabStripe1.position.set(17.3, 25, -10);
    vabGroup.add(vabStripe1);
    const vabStripe2 = vabStripe1.clone();
    vabStripe2.position.set(17.3, 25, 10);
    vabGroup.add(vabStripe2);
    
    // American flag on VAB (red stripes)
    for (let i = 0; i < 7; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 2, 12),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xcc0000 : 0xffffff })
      );
      stripe.position.set(17.4, 40 - i * 2, 0);
      vabGroup.add(stripe);
    }
    // Blue canton
    const canton = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 8, 5),
      new THREE.MeshBasicMaterial({ color: 0x002868 })
    );
    canton.position.set(17.4, 43, -3.5);
    vabGroup.add(canton);
    
    // NASA logo circle
    const nasaLogo = new THREE.Mesh(
      new THREE.CircleGeometry(6, 32),
      new THREE.MeshBasicMaterial({ color: 0x0033aa })
    );
    nasaLogo.position.set(17.4, 18, 0);
    nasaLogo.rotation.y = -Math.PI / 2;
    vabGroup.add(nasaLogo);
    
    vabGroup.position.set(-60, 0, -60);
    scene.add(vabGroup);

    // === LAUNCH PAD 39A ===
    const launchPadGroup = new THREE.Group();
    
    // Pad base
    const padBase = new THREE.Mesh(
      new THREE.BoxGeometry(30, 3, 30),
      new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 })
    );
    padBase.position.y = 1.5;
    launchPadGroup.add(padBase);
    
    // Flame trench
    const trench = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 35),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    trench.position.set(0, -0.5, 5);
    launchPadGroup.add(trench);
    
    // Launch tower (Fixed Service Structure)
    const towerBase = new THREE.Mesh(
      new THREE.BoxGeometry(8, 60, 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.4 })
    );
    towerBase.position.set(-8, 30, 0);
    launchPadGroup.add(towerBase);
    
    // Tower crane arm
    const craneArm = new THREE.Mesh(
      new THREE.BoxGeometry(20, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0xcc4400, metalness: 0.5 })
    );
    craneArm.position.set(2, 55, 0);
    launchPadGroup.add(craneArm);
    
    // Swing arms
    for (let i = 0; i < 3; i++) {
      const swingArm = new THREE.Mesh(
        new THREE.BoxGeometry(12, 1, 2),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
      );
      swingArm.position.set(-2, 20 + i * 15, 0);
      launchPadGroup.add(swingArm);
    }
    
    // Water tower (for sound suppression)
    const waterTower = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 25, 16),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    waterTower.position.set(18, 12.5, -10);
    launchPadGroup.add(waterTower);
    
    // Lightning towers
    const createLightningTower = (x, z) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 70, 8),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
      );
      pole.position.set(x, 35, z);
      launchPadGroup.add(pole);
    };
    createLightningTower(-18, -18);
    createLightningTower(18, -18);
    createLightningTower(-18, 18);
    
    launchPadGroup.position.set(60, 0, -70);
    scene.add(launchPadGroup);

    // === SATURN V (Horizontal Display) ===
    const saturnVGroup = new THREE.Group();
    
    // S-IC First Stage (white with black roll pattern)
    const sIC = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 42, 24),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.5 })
    );
    sIC.rotation.z = Math.PI / 2;
    sIC.position.x = 0;
    saturnVGroup.add(sIC);
    
    // S-IC black stripes
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(42, 0.8, 5.1),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
      );
      stripe.position.set(0, Math.cos(i * Math.PI/2) * 4.5, Math.sin(i * Math.PI/2) * 4.5);
      saturnVGroup.add(stripe);
    }
    
    // S-II Second Stage
    const sII = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 25, 24),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4 })
    );
    sII.rotation.z = Math.PI / 2;
    sII.position.x = 33.5;
    saturnVGroup.add(sII);
    
    // S-IVB Third Stage
    const sIVB = new THREE.Mesh(
      new THREE.CylinderGeometry(3.3, 5, 18, 24),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.4 })
    );
    sIVB.rotation.z = Math.PI / 2;
    sIVB.position.x = 55;
    saturnVGroup.add(sIVB);
    
    // Command/Service Module
    const csm = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 3.3, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.4 })
    );
    csm.rotation.z = Math.PI / 2;
    csm.position.x = 68;
    saturnVGroup.add(csm);
    
    // Launch Escape Tower
    const escTower = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xaa0000 })
    );
    escTower.rotation.z = -Math.PI / 2;
    escTower.position.x = 76;
    saturnVGroup.add(escTower);
    
    // F-1 Engines
    for (let i = 0; i < 5; i++) {
      const angle = i === 0 ? 0 : (i - 1) * Math.PI / 2;
      const radius = i === 0 ? 0 : 3;
      const engine = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 4, 12),
        new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 })
      );
      engine.rotation.z = Math.PI / 2;
      engine.position.set(-23, Math.cos(angle) * radius, Math.sin(angle) * radius);
      saturnVGroup.add(engine);
    }
    
    // Display cradles
    const cradleMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    [-15, 15, 45].forEach(x => {
      const cradle = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 12), cradleMat);
      cradle.position.set(x, -2, 0);
      saturnVGroup.add(cradle);
    });
    
    // "USA" text simulation (red boxes)
    const usaStripe = new THREE.Mesh(
      new THREE.BoxGeometry(15, 3, 5.1),
      new THREE.MeshBasicMaterial({ color: 0xcc0000 })
    );
    usaStripe.position.set(33.5, 5, 0);
    saturnVGroup.add(usaStripe);
    
    saturnVGroup.position.set(-30, 6, 35);
    saturnVGroup.rotation.y = Math.PI / 6;
    scene.add(saturnVGroup);

    // === ROCKET GARDEN ===
    const rocketGardenGroup = new THREE.Group();
    
    // Mercury-Redstone
    const mercuryRocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    mercuryRocket.position.set(0, 9, 0);
    rocketGardenGroup.add(mercuryRocket);
    const mercuryCapsule = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 3, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    mercuryCapsule.position.set(0, 19.5, 0);
    rocketGardenGroup.add(mercuryCapsule);
    
    // Gemini-Titan
    const titanRocket = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.5, 28, 12),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
    );
    titanRocket.position.set(8, 14, 0);
    rocketGardenGroup.add(titanRocket);
    const geminiCapsule = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    geminiCapsule.position.set(8, 30, 0);
    rocketGardenGroup.add(geminiCapsule);
    
    // Atlas
    const atlasRocket = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2, 25, 16),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5 })
    );
    atlasRocket.position.set(-8, 12.5, 0);
    rocketGardenGroup.add(atlasRocket);
    const atlasCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 5, 16),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    atlasCone.position.set(-8, 27.5, 0);
    rocketGardenGroup.add(atlasCone);
    
    rocketGardenGroup.position.set(50, 0, 30);
    scene.add(rocketGardenGroup);

    // === SHUTTLE ATLANTIS (Angled Display) ===
    const atlantisGroup = new THREE.Group();
    
    // Orbiter fuselage
    const orbiterBody = new THREE.Mesh(
      new THREE.BoxGeometry(8, 5, 22),
      new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.4 })
    );
    orbiterBody.position.y = 8;
    atlantisGroup.add(orbiterBody);
    
    // Nose cone
    const orbiterNose = new THREE.Mesh(
      new THREE.ConeGeometry(3, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    orbiterNose.rotation.x = -Math.PI / 2;
    orbiterNose.position.set(0, 8, 15);
    atlantisGroup.add(orbiterNose);
    
    // Delta wings
    const shuttleWingShape = new THREE.Shape();
    shuttleWingShape.moveTo(0, 0);
    shuttleWingShape.lineTo(-12, -8);
    shuttleWingShape.lineTo(-12, -10);
    shuttleWingShape.lineTo(0, -5);
    shuttleWingShape.lineTo(0, 0);
    const shuttleWingGeo = new THREE.ExtrudeGeometry(shuttleWingShape, { depth: 0.5, bevelEnabled: false });
    const shuttleWingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const leftShuttleWing = new THREE.Mesh(shuttleWingGeo, shuttleWingMat);
    leftShuttleWing.rotation.x = Math.PI / 2;
    leftShuttleWing.position.set(-4, 6, 0);
    atlantisGroup.add(leftShuttleWing);
    const rightShuttleWing = leftShuttleWing.clone();
    rightShuttleWing.scale.x = -1;
    rightShuttleWing.position.set(4, 6, 0);
    atlantisGroup.add(rightShuttleWing);
    
    // Vertical stabilizer
    const shuttleTailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    shuttleTailFin.position.set(0, 13, -8);
    atlantisGroup.add(shuttleTailFin);
    
    // OMS pods
    const omsPod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.5, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    omsPod.rotation.x = Math.PI / 2;
    omsPod.position.set(3, 9, -8);
    atlantisGroup.add(omsPod);
    const omsPod2 = omsPod.clone();
    omsPod2.position.set(-3, 9, -8);
    atlantisGroup.add(omsPod2);
    
    // Payload bay doors (open)
    const bayDoor = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.3, 14),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    bayDoor.position.set(5.5, 11, 0);
    bayDoor.rotation.z = -0.5;
    atlantisGroup.add(bayDoor);
    const bayDoor2 = bayDoor.clone();
    bayDoor2.position.set(-5.5, 11, 0);
    bayDoor2.rotation.z = 0.5;
    atlantisGroup.add(bayDoor2);
    
    // Display mount (angled like real exhibit)
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 2, 12, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    mount.position.set(0, 0, 0);
    atlantisGroup.add(mount);
    
    atlantisGroup.position.set(35, 3, -25);
    atlantisGroup.rotation.x = 0.2;
    atlantisGroup.rotation.y = -0.3;
    scene.add(atlantisGroup);

    // === PUZZLE ROOM SIGNS ===
    const createSign = (text, x, y, z) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, 256, 75);

      const texture = new THREE.CanvasTexture(canvas);
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 2),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      );
      signMesh.position.set(x, y, z);
      scene.add(signMesh);
    };

    createSign('Zero-G Puzzle Room', 25, 18, -48);
    createSign('Zero-D-R Puzzle Room', 42, 18, -48);
    createSign('Space Debris Hangar', 35, 8, -30);

    // === INTERACTIVE TERMINALS ===
    const terminals = [];
    const createTerminal = (x, z, data) => {
      const terminalGroup = new THREE.Group();
      
      // Base
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.8, roughness: 0.2 })
      );
      base.position.y = 0.15;
      terminalGroup.add(base);
      
      // Stand
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.7, roughness: 0.3 })
      );
      stand.position.y = 0.9;
      terminalGroup.add(stand);
      
      // Screen (angled)
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.08),
        new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, transparent: true, opacity: 0.8 })
      );
      screen.position.set(0, 1.8, 0.2);
      screen.rotation.x = -0.3;
      terminalGroup.add(screen);
      
      // Screen glow
      const screenGlow = new THREE.PointLight(brandColors.holoCyan, 0.5, 5);
      screenGlow.position.set(0, 1.8, 0.5);
      terminalGroup.add(screenGlow);
      
      // Floating holographic icon
      const iconGeo = new THREE.OctahedronGeometry(0.2, 0);
      const iconMat = new THREE.MeshBasicMaterial({ color: brandColors.holoCyan, wireframe: true });
      const icon = new THREE.Mesh(iconGeo, iconMat);
      icon.position.set(0, 2.5, 0);
      terminalGroup.add(icon);
      
      terminalGroup.position.set(x, 0, z);
      terminalGroup.userData = { type: 'terminal', ...data };
      scene.add(terminalGroup);
      terminals.push(terminalGroup);
      animatedObjectsRef.current.push({ mesh: icon, type: 'terminal_icon' });
      return terminalGroup;
    };
    
    createTerminal(-8, -18, { 
      id: 'lore_terminal_1', 
      name: 'Aviation History Database',
      promptLabel: 'Access History Archives',
      content: 'From the Wright Brothers to supersonic flight...'
    });
    createTerminal(12, -22, { 
      id: 'lore_terminal_2', 
      name: 'Space Exploration Timeline',
      promptLabel: 'View Space Milestones',
      content: 'Humanity\'s journey beyond Earth...'
    });
    createTerminal(0, 8, { 
      id: 'nominee_terminal', 
      name: 'TOP 100 Directory',
      promptLabel: 'Browse Innovators',
      content: 'Meet the aerospace leaders...'
    });
    
    // === MISSION CONTROL TERMINAL ===
    createTerminal(0, -45, {
      id: 'mission_control',
      name: 'Mission Control Console',
      promptLabel: 'Initiate Launch Sequence',
      content: 'T-minus 10... 9... 8... All systems nominal...'
    });

    // === MAINTENANCE DROIDS (NPCs) ===
    const droids = [];
    const createDroid = (x, z, patrolPath) => {
      const droidGroup = new THREE.Group();
      
      // Body (cylindrical)
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 1, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a4a5a, metalness: 0.8, roughness: 0.3 })
      );
      body.position.y = 0.8;
      droidGroup.add(body);
      
      // Head dome
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x4a5a6a, metalness: 0.7, roughness: 0.2 })
      );
      head.position.y = 1.3;
      droidGroup.add(head);
      
      // Eye (glowing)
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ff88 })
      );
      eye.position.set(0, 1.2, 0.3);
      droidGroup.add(eye);
      
      // Antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      antenna.position.set(0, 1.7, 0);
      droidGroup.add(antenna);
      
      // Antenna tip (blinking)
      const antennaTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff3333 })
      );
      antennaTip.position.set(0, 1.9, 0);
      droidGroup.add(antennaTip);
      
      // Hover base
      const hoverBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.3, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.9, roughness: 0.1 })
      );
      hoverBase.position.y = 0.2;
      droidGroup.add(hoverBase);
      
      // Hover glow
      const hoverGlow = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.45, 16),
        new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      hoverGlow.rotation.x = -Math.PI / 2;
      hoverGlow.position.y = 0.05;
      droidGroup.add(hoverGlow);
      
      droidGroup.position.set(x, 0.3, z);
      droidGroup.userData = { 
        patrolPath, 
        pathIndex: 0, 
        speed: 0.02 + Math.random() * 0.01,
        pauseTimer: 0
      };
      scene.add(droidGroup);
      droids.push(droidGroup);
      animatedObjectsRef.current.push({ mesh: antennaTip, type: 'blink' });
      animatedObjectsRef.current.push({ mesh: hoverGlow, type: 'pulse' });
      return droidGroup;
    };
    
    // Create patrolling droids
    createDroid(-25, 5, [
      { x: -25, z: 5 }, { x: -35, z: 5 }, { x: -35, z: -5 }, { x: -25, z: -5 }
    ]);
    createDroid(30, -5, [
      { x: 30, z: -5 }, { x: 40, z: -5 }, { x: 40, z: -20 }, { x: 30, z: -20 }
    ]);
    createDroid(5, -30, [
      { x: 5, z: -30 }, { x: -5, z: -30 }, { x: -5, z: -40 }, { x: 5, z: -40 }
    ]);

    // === AREA MARKERS (matching blueprint) ===
    const areaMarkers = [];
    const createAreaMarker = (x, z, label, color) => {
      const marker = new THREE.Mesh(
        new THREE.RingGeometry(2, 2.5, 32),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
      );
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(x, 0.03, z);
      marker.userData = { area: label };
      scene.add(marker);
      areaMarkers.push(marker);
      return marker;
    };

    // Blueprint zones
    createAreaMarker(0, -55, 'observation_deck', brandColors.skyBlue);
    createAreaMarker(-35, -30, 'airside_exhibit', brandColors.goldPrestige);
    createAreaMarker(35, -30, 'space_systems_north', brandColors.holoCyan);
    createAreaMarker(0, -20, 'central_atrium', brandColors.holoCyan);
    createAreaMarker(0, 5, 'circulation_hallway', brandColors.skyBlue);
    createAreaMarker(-35, 25, 'space_systems_south', brandColors.holoCyan);
    createAreaMarker(0, 25, 'hall_of_fame', brandColors.goldPrestige);
    createAreaMarker(35, 25, 'space_systems_east', brandColors.holoCyan);
    createAreaMarker(-20, 50, 'gallery_hall', brandColors.goldPrestige);
    createAreaMarker(30, 50, 'archive_vault', brandColors.goldPrestige);
    createAreaMarker(0, 70, 'legends_ring', brandColors.holoCyan);

    // === COLLECTIBLE ARTIFACTS ===
    const collectibles = [];
    const createCollectible = (x, z, data) => {
      const group = new THREE.Group();
      
      // Floating crystal/orb
      const orbGeo = new THREE.IcosahedronGeometry(0.5, 1);
      const orbMat = new THREE.MeshStandardMaterial({
        color: data.rarity === 'legendary' ? 0xf59e0b : 
               data.rarity === 'epic' ? 0xa855f7 :
               data.rarity === 'rare' ? 0x3b82f6 : 0x22c55e,
        emissive: data.rarity === 'legendary' ? 0xf59e0b : 0x3b82f6,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 1.5;
      group.add(orb);

      // Glow ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1, 32),
        new THREE.MeshBasicMaterial({ 
          color: orbMat.color, 
          transparent: true, 
          opacity: 0.4, 
          side: THREE.DoubleSide 
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      group.add(ring);

      group.position.set(x, 0, z);
      group.userData = { 
        type: 'artifact',
        ...data,
        collected: false
      };
      scene.add(group);
      collectibles.push(group);
      animatedObjectsRef.current.push({ mesh: orb, type: 'collectible', parent: group });
      return group;
    };

    // Place artifacts in various locations
    createCollectible(-20, 10, { 
      id: 'wright_flyer_model',
      name: 'Wright Flyer Replica', 
      description: 'A miniature model of the first powered aircraft.',
      category: 'lore',
      rarity: 'rare',
      points: 50
    });
    createCollectible(25, 5, { 
      id: 'apollo_badge',
      name: 'Apollo Mission Badge', 
      description: 'Commemorative badge from the Apollo program.',
      category: 'trophy',
      rarity: 'epic',
      points: 75
    });
    createCollectible(-15, -25, { 
      id: 'satellite_chip',
      name: 'Vintage Satellite Chip', 
      description: 'A piece of early satellite computing history.',
      category: 'lore',
      rarity: 'uncommon',
      points: 30
    });
    createCollectible(40, -30, { 
      id: 'starship_fragment',
      name: 'Starship Heat Shield Fragment', 
      description: 'A rare fragment from a Starship test flight.',
      category: 'trophy',
      rarity: 'legendary',
      points: 100
    });

    // Controls
    const handleKeyDown = (e) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse controls - click to move, drag to rotate camera
    const handleMouseDown = (e) => {
      isDraggingRef.current = false;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (e.buttons !== 1) return; // Left mouse button only

      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;

      // If moved enough, it's a drag
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        const sensitivity = 0.005;
        cameraAngleRef.current.yaw -= dx * sensitivity;
        cameraAngleRef.current.pitch -= dy * sensitivity;
        // Allow full range: -1.5 (looking straight up) to 1.5 (looking down from above)
        cameraAngleRef.current.pitch = Math.max(-1.5, Math.min(1.5, cameraAngleRef.current.pitch));
      }

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e) => {
      if (!isDraggingRef.current && floorMeshRef.current) {
        // Click to move - cast ray to floor
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        raycasterRef.current.setFromCamera(mouse, camera);
        const intersects = raycasterRef.current.intersectObject(floorMeshRef.current);

        if (intersects.length > 0) {
          const point = intersects[0].point;
          // Clamp to boundaries
          targetPositionRef.current = {
            x: Math.max(-48, Math.min(48, point.x)),
            z: Math.max(-48, Math.min(48, point.z))
          };
        }
      }
      isDraggingRef.current = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    const moveSpeed = 0.3;
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      // Animate objects
      animatedObjectsRef.current.forEach(({ mesh, type, parent }) => {
        if (type === 'pulse') {
          mesh.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
        } else if (type === 'float') {
          mesh.position.y = 5 + Math.sin(time * 1.5) * 0.3;
          mesh.rotation.y = time * 0.2;
        } else if (type === 'collectible' && parent && !parent.userData.collected) {
          mesh.position.y = 1.5 + Math.sin(time * 2) * 0.2;
          mesh.rotation.y = time * 1.5;
          mesh.rotation.x = Math.sin(time * 0.8) * 0.1;
        } else if (type === 'rotate_sky') {
          mesh.rotation.y = time * 0.01;
        } else if (type === 'terminal_icon') {
          mesh.rotation.y = time * 2;
          mesh.rotation.x = Math.sin(time) * 0.3;
          mesh.position.y = 2.5 + Math.sin(time * 1.5) * 0.1;
        } else if (type === 'blink') {
          mesh.material.opacity = Math.sin(time * 4) > 0.5 ? 1 : 0.2;
        }
      });
      
      // Animate droids patrol
      droids.forEach(droid => {
        const data = droid.userData;
        if (data.pauseTimer > 0) {
          data.pauseTimer -= 0.016;
          return;
        }
        
        const target = data.patrolPath[data.pathIndex];
        const dx = target.x - droid.position.x;
        const dz = target.z - droid.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 0.5) {
          data.pathIndex = (data.pathIndex + 1) % data.patrolPath.length;
          data.pauseTimer = 1 + Math.random() * 2; // Pause at waypoints
        } else {
          droid.position.x += (dx / dist) * data.speed;
          droid.position.z += (dz / dist) * data.speed;
          droid.rotation.y = Math.atan2(dx, dz);
        }
        
        // Hover bob
        droid.position.y = 0.3 + Math.sin(time * 3 + droid.position.x) * 0.05;
      });

      // Check for nearby interactables (collectibles + terminals)
      let nearestInteractable = null;
      let nearestDist = 4; // Interaction range
      
      collectibles.forEach(collectible => {
        if (collectible.userData.collected) return;
        const dist = playerRef.current.position.distanceTo(collectible.position);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestInteractable = {
            type: 'artifact',
            id: collectible.userData.id,
            name: collectible.userData.name,
            description: collectible.userData.description,
            category: collectible.userData.category,
            rarity: collectible.userData.rarity,
            points: collectible.userData.points,
            promptLabel: `Collect ${collectible.userData.name}`,
            promptSubLabel: `${collectible.userData.rarity} artifact`,
            mesh: collectible
          };
        }
      });
      
      terminals.forEach(terminal => {
        const dist = playerRef.current.position.distanceTo(terminal.position);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestInteractable = {
            type: 'terminal',
            id: terminal.userData.id,
            name: terminal.userData.name,
            content: terminal.userData.content,
            promptLabel: terminal.userData.promptLabel,
            promptSubLabel: 'Information Terminal'
          };
        }
      });
      
      onInteractableNear?.(nearestInteractable);

      if (playerRef.current) {
        const keys = keysRef.current;
        const yaw = cameraAngleRef.current.yaw;

        // Click-to-move: smoothly move toward target
        if (targetPositionRef.current) {
          const tx = targetPositionRef.current.x - playerRef.current.position.x;
          const tz = targetPositionRef.current.z - playerRef.current.position.z;
          const dist = Math.sqrt(tx * tx + tz * tz);

          if (dist > 0.5) {
            playerRef.current.position.x += (tx / dist) * moveSpeed;
            playerRef.current.position.z += (tz / dist) * moveSpeed;
            playerRef.current.rotation.y = Math.atan2(tx, tz);
          } else {
            targetPositionRef.current = null;
          }
        }

        // Keyboard movement (arrow keys) - cancels click-to-move
        let moveX = 0, moveZ = 0;
        if (keys['ArrowUp']) { moveX -= Math.sin(yaw); moveZ -= Math.cos(yaw); }
        if (keys['ArrowDown']) { moveX += Math.sin(yaw); moveZ += Math.cos(yaw); }
        if (keys['ArrowLeft']) { moveX -= Math.cos(yaw); moveZ += Math.sin(yaw); }
        if (keys['ArrowRight']) { moveX += Math.cos(yaw); moveZ -= Math.sin(yaw); }

        const moveMag = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (moveMag > 0) {
          targetPositionRef.current = null; // Cancel click-to-move
          playerRef.current.position.x += (moveX / moveMag) * moveSpeed;
          playerRef.current.position.z += (moveZ / moveMag) * moveSpeed;
          playerRef.current.rotation.y = Math.atan2(moveX, moveZ);
        }

        // Boundary limits
        playerRef.current.position.x = Math.max(-48, Math.min(48, playerRef.current.position.x));
        playerRef.current.position.z = Math.max(-48, Math.min(48, playerRef.current.position.z));

        // Camera control based on mode
        if (cameraMode === 'manual') {
          // Manual camera - Q/E for yaw, W/S for pitch
          const rotSpeed = 0.03;
          if (keys['KeyQ']) cameraAngleRef.current.yaw += rotSpeed;
          if (keys['KeyE']) cameraAngleRef.current.yaw -= rotSpeed;
          if (keys['KeyW']) cameraAngleRef.current.pitch = Math.min(1.5, cameraAngleRef.current.pitch + rotSpeed);
          if (keys['KeyS']) cameraAngleRef.current.pitch = Math.max(0.1, cameraAngleRef.current.pitch - rotSpeed);
        } else {
          // Follow mode - intelligent camera that follows player movement
          const targetYaw = playerRef.current.rotation.y + Math.PI;
          const yawDiff = targetYaw - cameraAngleRef.current.yaw;
          const normalizedDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
          cameraAngleRef.current.yaw += normalizedDiff * 0.03; // Slower, smoother follow

          // Dynamic pitch based on movement speed - lower angle for better view
          const targetPitch = 0.25 + Math.abs(moveMag) * 0.15;
          cameraAngleRef.current.pitch += (targetPitch - cameraAngleRef.current.pitch) * 0.05;
        }

        // Orbit camera around player based on yaw/pitch
        const camDist = 12;
        const pitch = cameraAngleRef.current.pitch;
        
        // Calculate camera position
        const horizontalDist = camDist * Math.cos(pitch);
        const verticalOffset = Math.sin(pitch) * camDist;
        
        // When looking up (negative pitch), camera moves close to player and looks up
        const playerX = playerRef.current.position.x;
        const playerZ = playerRef.current.position.z;
        
        if (pitch < 0) {
          // Looking up: camera at player position, looking at sky
          const upFactor = Math.abs(pitch) / 1.5; // 0 to 1
          const reducedDist = camDist * (1 - upFactor * 0.9); // Camera moves closer
          camera.position.x = playerX + Math.sin(yaw) * reducedDist;
          camera.position.z = playerZ + Math.cos(yaw) * reducedDist;
          camera.position.y = 2 + upFactor * 1; // Slightly raise camera
          // Look target goes up into the sky
          camera.lookAt(playerX, 2 + Math.abs(pitch) * 30, playerZ - Math.cos(yaw) * 5);
        } else {
          // Normal orbit camera
          camera.position.x = playerX + Math.sin(yaw) * horizontalDist;
          camera.position.z = playerZ + Math.cos(yaw) * horizontalDist;
          camera.position.y = Math.max(2, 2 + verticalOffset);
          camera.lookAt(playerX, 1.5, playerZ);
        }

        // Check area transitions (matching blueprint layout)
        const px = playerRef.current.position.x;
        const pz = playerRef.current.position.z;
        let newArea = 'central_atrium';

        if (pz < -45) newArea = 'observation_deck';
        else if (pz < -10 && px < -20) newArea = 'airside_exhibit';
        else if (pz < -10 && px > 20) newArea = 'space_systems_north';
        else if (pz >= -10 && pz < 15) newArea = 'circulation_hallway';
        else if (pz >= 15 && pz < 40 && px < -20) newArea = 'space_systems_south';
        else if (pz >= 15 && pz < 40 && px > 20) newArea = 'space_systems_east';
        else if (pz >= 15 && pz < 40 && Math.abs(px) <= 20) newArea = 'hall_of_fame';
        else if (pz >= 40 && pz < 60 && px < 10) newArea = 'gallery_hall';
        else if (pz >= 40 && pz < 60 && px >= 10) newArea = 'archive_vault';
        else if (pz >= 60) newArea = 'legends_ring';

        if (newArea !== currentArea) {
          setCurrentArea(newArea);
          onAreaChange?.(newArea);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ minHeight: '100vh' }}
    />
  );
}