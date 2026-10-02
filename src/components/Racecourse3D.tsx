import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Race, Runner } from '../types/racing';
import { Camera, Eye, Play, Pause, RotateCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface Racecourse3DProps {
  race: Race;
  selectedRunnerId: string | null;
  onSelectRunner: (runnerId: string) => void;
  className?: string;
}

export const Racecourse3D: React.FC<Racecourse3DProps> = ({
  race,
  selectedRunnerId,
  onSelectRunner,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraMode, setCameraMode] = useState<'aerial' | 'straight' | 'bend' | 'gates'>('aerial');
  const [raceProgress, setRaceProgress] = useState(0.35); // 0 to 1 around track

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const horseMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 110, 160);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio & Stadium Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.6);
    rimLight.position.set(-60, 40, -80);
    scene.add(rimLight);

    // 5. Infield Ground & Kolkata Hastings Turf Oval Track
    // Track Oval Geometry (Kolkata RCTC shape: 2200m circumference with sweeping Hastings bend)
    const trackRadiusX = 85;
    const trackRadiusZ = 55;
    const trackWidth = 14;

    // Turf base ground
    const groundGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x091410,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Outer and Inner Turf Rings to form track surface
    const curvePoints: THREE.Vector3[] = [];
    const segments = 80;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * trackRadiusX;
      const z = Math.sin(theta) * trackRadiusZ;
      curvePoints.push(new THREE.Vector3(x, 0.2, z));
    }
    const trackCurve = new THREE.CatmullRomCurve3(curvePoints);

    // Track surface mesh using TubeGeometry
    const trackGeo = new THREE.TubeGeometry(trackCurve, 120, trackWidth / 2, 4, true);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Emerald turf
      roughness: 0.75,
      metalness: 0.05,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.scale.set(1, 0.05, 1); // Flatten into a track ribbon
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);

    // White Running Rails (Outer & Inner)
    const outerRailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const innerRailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const createRail = (radiusX: number, radiusZ: number, heightOffset: number) => {
      const railCurvePoints: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        railCurvePoints.push(new THREE.Vector3(Math.cos(theta) * radiusX, heightOffset, Math.sin(theta) * radiusZ));
      }
      const railCurve = new THREE.CatmullRomCurve3(railCurvePoints);
      const railGeo = new THREE.TubeGeometry(railCurve, 120, 0.35, 6, true);
      const railMesh = new THREE.Mesh(railGeo, outerRailMat);
      railMesh.castShadow = true;
      scene.add(railMesh);
    };

    createRail(trackRadiusX + trackWidth / 2, trackRadiusZ + trackWidth / 2, 1.2);
    createRail(trackRadiusX - trackWidth / 2, trackRadiusZ - trackWidth / 2, 1.2);

    // 6. Historic Kolkata Landmark Silhouette (Victoria Memorial dome in distance)
    const memorialGroup = new THREE.Group();
    const domeGeo = new THREE.SphereGeometry(12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    memorialGroup.add(dome);

    const baseGeo = new THREE.BoxGeometry(45, 8, 20);
    const baseMesh = new THREE.Mesh(baseGeo, domeMat);
    baseMesh.position.y = -4;
    memorialGroup.add(baseMesh);

    memorialGroup.position.set(0, 4, -110);
    scene.add(memorialGroup);

    // Distance Markers: 400m, 200m, Finish Post
    const createMarker = (x: number, z: number, labelColor: number, text: string) => {
      const poleGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 3, z);
      scene.add(pole);

      const discGeo = new THREE.CylinderGeometry(2, 2, 0.4, 16);
      const discMat = new THREE.MeshStandardMaterial({ color: labelColor });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(x, 6, z);
      disc.rotation.x = Math.PI / 2;
      scene.add(disc);
    };

    createMarker(-trackRadiusX, 0, 0xef4444, 'FINISH'); // Red Finish Post
    createMarker(-trackRadiusX + 15, -trackRadiusZ * 0.4, 0xf59e0b, '200m'); // 200m
    createMarker(-trackRadiusX + 30, -trackRadiusZ * 0.8, 0x10b981, '400m'); // 400m

    // 7. 3D Thoroughbred Runner Avatars on Track
    const horseMeshes = new Map<string, THREE.Group>();
    const activeRunners = race.runners.filter(r => r.status !== 'Scratched');

    activeRunners.forEach((runner, index) => {
      const runnerGroup = new THREE.Group();

      // Horse body
      const bodyColor = runner.color === 'Chestnut' ? 0x9a3412 : runner.color === 'Grey' ? 0xd1d5db : 0x451a03;
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 });
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 4.2);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.2;
      body.castShadow = true;
      runnerGroup.add(body);

      // Horse Neck & Head
      const neckGeo = new THREE.BoxGeometry(1.2, 2.2, 1.8);
      const neck = new THREE.Mesh(neckGeo, bodyMat);
      neck.position.set(0, 3.2, 1.8);
      neck.rotation.x = -Math.PI / 5;
      runnerGroup.add(neck);

      // Jockey Torso in owner silks
      const silkColors: Record<number, number> = {
        1: 0x991b1b, // Maroon / Gold (Vijay Singh)
        2: 0x1e40af, // Royal Blue (B. Singh)
        3: 0xd97706, // Amber Gold (C. Alford)
        4: 0x047857, // Emerald
        5: 0x4338ca, // Indigo
      };
      const silkMat = new THREE.MeshStandardMaterial({
        color: silkColors[runner.saddleNumber] || 0x10b981,
        roughness: 0.4,
      });
      const jockeyGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const jockey = new THREE.Mesh(jockeyGeo, silkMat);
      jockey.position.set(0, 3.6, 0.4);
      runnerGroup.add(jockey);

      // Saddle Cloth with saddle number
      const saddleGeo = new THREE.BoxGeometry(2.5, 0.8, 2);
      const saddleMat = new THREE.MeshStandardMaterial({
        color: runner.modelRole === 'Top Pick' ? 0x10b981 : 0x0f172a,
      });
      const saddle = new THREE.Mesh(saddleGeo, saddleMat);
      saddle.position.set(0, 2.3, 0);
      runnerGroup.add(saddle);

      // Floating Glow Ring for selected runner
      const ringGeo = new THREE.RingGeometry(2.5, 3.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.3;
      ring.name = 'selectionRing';
      ring.visible = runner.id === selectedRunnerId;
      runnerGroup.add(ring);

      scene.add(runnerGroup);
      horseMeshes.set(runner.id, runnerGroup);
    });

    horseMeshesRef.current = horseMeshes;

    // Animation Loop
    let currentProgress = 0.35;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      if (isPlaying) {
        currentProgress = (currentProgress + 0.0008) % 1;
        setRaceProgress(currentProgress);
      }

      // Position each runner along track with lane offsets based on draw and running style
      activeRunners.forEach((runner) => {
        const mesh = horseMeshes.get(runner.id);
        if (!mesh) return;

        // Front runners are slightly ahead, deep closers slightly back
        const styleOffset =
          runner.runningStyle === 'Front Runner' ? 0.02 :
          runner.runningStyle === 'Prominent' ? 0.01 :
          runner.runningStyle === 'Mid-division' ? 0 : -0.015;

        const runnerProgress = (currentProgress + styleOffset + 1) % 1;
        const theta = runnerProgress * Math.PI * 2;

        // Lane width offset based on draw (Draw 1 is closest to inside rails)
        const laneOffset = (runner.draw - 1) * 1.4 - (trackWidth / 2 - 2.5);
        const rX = trackRadiusX + laneOffset * 0.4;
        const rZ = trackRadiusZ + laneOffset * 0.6;

        const x = Math.cos(theta) * rX;
        const z = Math.sin(theta) * rZ;

        mesh.position.set(x, 0, z);

        // Orient horse in the direction of the tangent
        const tangentX = -Math.sin(theta);
        const tangentZ = Math.cos(theta);
        mesh.rotation.y = Math.atan2(tangentX, tangentZ);

        // Highlight ring visibility
        const selRing = mesh.getObjectByName('selectionRing');
        if (selRing) {
          selRing.visible = runner.id === selectedRunnerId;
        }
      });

      // Camera views
      if (cameraMode === 'aerial') {
        camera.position.set(0, 110, 160);
        camera.lookAt(0, 0, 0);
      } else if (cameraMode === 'straight') {
        camera.position.set(-trackRadiusX - 25, 12, 10);
        camera.lookAt(-trackRadiusX, 2, -20);
      } else if (cameraMode === 'bend') {
        camera.position.set(trackRadiusX * 0.7, 24, trackRadiusZ * 1.2);
        camera.lookAt(trackRadiusX * 0.5, 0, trackRadiusZ * 0.4);
      } else if (cameraMode === 'gates') {
        camera.position.set(0, 20, trackRadiusZ + 35);
        camera.lookAt(0, 4, trackRadiusZ);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [race.id, isPlaying, cameraMode, selectedRunnerId]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#06090e] shadow-2xl ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="h-72 sm:h-96 w-full cursor-grab active:cursor-grabbing" />

      {/* Broadcast Telemetry Overlay HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
        
        {/* Top HUD: Broadcast Track Info & Camera Director Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 px-3.5 py-1.5 shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              3D HASTINGS TURF CAM · R{race.raceNumber} ({race.distanceMeters}m)
            </span>
            <span className="text-slate-500 font-mono">|</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              3.6cm Good to Firm
            </span>
          </div>

          {/* Camera Angles Switcher */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 p-1 shadow-lg">
            {[
              { id: 'aerial', label: 'Aerial 3D' },
              { id: 'straight', label: 'Straight' },
              { id: 'bend', label: 'Hastings Bend' },
              { id: 'gates', label: 'Stalls' },
            ].map(cam => (
              <button
                key={cam.id}
                onClick={() => setCameraMode(cam.id as any)}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-bold tracking-tight transition ${
                  cameraMode === cam.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom HUD: Playback Controls & Runner Tactical Order Chips */}
        <div className="flex flex-wrap items-end justify-between gap-3 pointer-events-auto">
          {/* Runner Quick Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full">
            {race.runners
              .filter(r => r.status !== 'Scratched')
              .map(runner => {
                const isSelected = runner.id === selectedRunnerId;
                const isTop = runner.modelRole === 'Top Pick';

                return (
                  <button
                    key={runner.id}
                    onClick={() => onSelectRunner(runner.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition backdrop-blur-md border ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isTop
                        ? 'border-emerald-500/40 bg-black/70 text-emerald-300'
                        : 'border-white/15 bg-black/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-[10px] font-mono font-black">
                      {runner.saddleNumber}
                    </span>
                    <span className="truncate max-w-[90px]">{runner.name}</span>
                  </button>
                );
              })}
          </div>

          {/* Pause / Play 3D Track Simulation */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition shadow-lg shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Hold Pace</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Simulate Run</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
