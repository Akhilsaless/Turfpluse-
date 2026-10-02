import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Runner, Race } from '../types/racing';
import { Sparkles, Trophy, ShieldCheck, Star } from 'lucide-react';

interface CinematicPaddockStageProps {
  runner: Runner;
  race: Race;
  onAskAi: (runnerName: string) => void;
  className?: string;
}

export const CinematicPaddockStage: React.FC<CinematicPaddockStageProps> = ({
  runner,
  race,
  onAskAi,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isTop = runner.modelRole === 'Top Pick';

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d14);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 10, 26);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Three-Point Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Warm Key Light
    const keyLight = new THREE.SpotLight(0xfff5e6, 2.5, 50, Math.PI / 4, 0.3, 1);
    keyLight.position.set(12, 18, 15);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cool Rim Light for distinct outline
    const rimLight = new THREE.DirectionalLight(isTop ? 0x10b981 : 0x06b6d4, 1.8);
    rimLight.position.set(-14, 12, -12);
    scene.add(rimLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.7);
    fillLight.position.set(0, 6, 20);
    scene.add(fillLight);

    // Pedestal Stage Group
    const stageGroup = new THREE.Group();

    // Brushed Titanium Circular Rotating Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(9, 9.8, 1.4, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    // Glowing Neon Ring on Pedestal Edge
    const ringGeo = new THREE.TorusGeometry(8.9, 0.15, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isTop ? 0x10b981 : 0x38bdf8,
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = 0.7;
    stageGroup.add(glowRing);

    // 3D Stylized Thoroughbred Silhouette & Saddle Model
    const horseColor =
      runner.color === 'Chestnut' ? 0x9a3412 :
      runner.color === 'Grey' ? 0xd1d5db :
      runner.color === 'Dark Bay' ? 0x271406 : 0x451a03;

    const horseGroup = new THREE.Group();
    const horseMat = new THREE.MeshStandardMaterial({
      color: horseColor,
      roughness: 0.45,
      metalness: 0.2,
    });

    // Body Musculature
    const bodyGeo = new THREE.CapsuleGeometry(2.2, 4.2, 8, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, horseMat);
    bodyMesh.rotation.x = Math.PI / 2;
    bodyMesh.position.y = 5.2;
    bodyMesh.castShadow = true;
    horseGroup.add(bodyMesh);

    // Powerful Crested Neck & Thoroughbred Head
    const neckGeo = new THREE.CylinderGeometry(1.2, 1.8, 3.8, 12);
    const neckMesh = new THREE.Mesh(neckGeo, horseMat);
    neckMesh.position.set(0, 7.2, 2.2);
    neckMesh.rotation.x = -Math.PI / 6;
    neckMesh.castShadow = true;
    horseGroup.add(neckMesh);

    const headGeo = new THREE.BoxGeometry(1.4, 1.6, 2.6);
    const headMesh = new THREE.Mesh(headGeo, horseMat);
    headMesh.position.set(0, 8.8, 3.4);
    headMesh.rotation.x = -Math.PI / 8;
    horseGroup.add(headMesh);

    // Thoroughbred Legs (Sculpted)
    const legGeo = new THREE.CylinderGeometry(0.35, 0.25, 4.5, 8);
    const legOffsets = [
      [-1.1, 2.2, 1.8],
      [1.1, 2.2, 1.8],
      [-1.1, 2.2, -1.8],
      [1.1, 2.2, -1.8],
    ];
    legOffsets.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, horseMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      horseGroup.add(leg);
    });

    // Owner Silk Colors on Saddle Cloth
    const silkColors: Record<number, number> = {
      1: 0x881337, // Maroon / Gold (Vijay Singh)
      2: 0x1d4ed8, // Royal Blue (B. Singh)
      3: 0xb45309, // Amber (C. Alford)
      4: 0x065f46, // Dark Emerald
      5: 0x3730a3, // Deep Violet
    };
    const saddleMat = new THREE.MeshStandardMaterial({
      color: silkColors[runner.saddleNumber] || 0x10b981,
      roughness: 0.3,
      metalness: 0.3,
    });
    const saddleGeo = new THREE.BoxGeometry(2.6, 1.8, 2.4);
    const saddle = new THREE.Mesh(saddleGeo, saddleMat);
    saddle.position.set(0, 5.8, 0.1);
    horseGroup.add(saddle);

    stageGroup.add(horseGroup);
    scene.add(stageGroup);

    // Continuous 360-degree Cinematic Rotation
    let animId: number;
    let rotationSpeed = 0.006;
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      stageGroup.rotation.y += deltaX * 0.01;
      prevMouseX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        stageGroup.rotation.y += rotationSpeed;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      camera.aspect = w / 300;
      camera.updateProjectionMatrix();
      renderer.setSize(w, 300);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [runner.id, runner.color, runner.saddleNumber, isTop]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#070c14] shadow-2xl ${className}`}>
      {/* 3D WebGL Paddock Stage */}
      <div ref={mountRef} className="h-[300px] w-full cursor-grab active:cursor-grabbing" />

      {/* Floating Cinematic Overlay HUD */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-950 font-mono font-black text-base shadow-lg">
              #{runner.saddleNumber}
            </span>
            <div className="rounded-xl bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Stall {runner.draw} · {runner.age}yo {runner.gender}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
            Rating {runner.rating} · {runner.weightKg}kg
          </div>
        </div>

        {/* Bottom Stage Controls: Name, Jockey & AI Brain Trigger */}
        <div className="flex flex-wrap items-end justify-between gap-3 pointer-events-auto">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              {runner.pedigree.sire} × {runner.pedigree.dam}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {runner.name}
            </h3>
            <div className="text-xs text-slate-300 font-medium mt-0.5">
              Jockey: <strong className="text-white">{runner.jockey}</strong> · Trainer: <strong className="text-white">{runner.trainer}</strong>
            </div>
          </div>

          <button
            onClick={() => onAskAi(runner.name)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze with AI Brain</span>
          </button>
        </div>
      </div>
    </div>
  );
};
