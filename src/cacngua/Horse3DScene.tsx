import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  BOARD_CENTER,
  TRACK_POINTS,
  YARD_RECTS,
  homeLanePoint,
  trackPoint,
  yardPoint
} from './geometry';
import type { BoardPoint } from './geometry';
import { START_INDEX, trackIndexForHorse } from './engine';
import type { HorseGameState, HorsePiece, HorseSeat } from './types';

export type HorseMotionKind = 'fly' | 'kick' | 'deploy';

export interface HorseMotion3D {
  id: number;
  kind: HorseMotionKind;
  horseId: string;
  seat: HorseSeat;
  from: BoardPoint;
  to: BoardPoint;
  durationMs: number;
}

interface Horse3DSceneProps {
  game: HorseGameState;
  actionableHorseIds: string[];
  selectedHorseId: string | null;
  hiddenHorseIds: string[];
  visualPoints: Record<string, BoardPoint>;
  motionFx: HorseMotion3D | null;
  impactPoint: BoardPoint | null;
  rolling: boolean;
  rollingValues: number[];
  selectedDie: number | null;
  onHorseClick: (horseId: string) => void;
  onDieClick: (dieIndex: number) => void;
}

const WORLD_SCALE = 0.018;
const BOARD_TOP_Y = 0.52;
const HORSE_Y = 0.70;
const COLORS: Record<HorseSeat, string> = {
  0: '#c94250',
  1: '#3973c3',
  2: '#349761',
  3: '#c99b25'
};

const LIGHT_COLORS: Record<HorseSeat, string> = {
  0: '#f2b3b7',
  1: '#b9d3ff',
  2: '#b8e7c7',
  3: '#f0dda0'
};

const PIPS: Record<number, Array<[number, number]>> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
};

function toWorld(point: BoardPoint, y = BOARD_TOP_Y): [number, number, number] {
  return [
    (point.x - BOARD_CENTER) * WORLD_SCALE,
    y,
    (point.y - BOARD_CENTER) * WORLD_SCALE
  ];
}

function seatRotation(seat: HorseSeat) {
  if (seat === 0) return 0;
  if (seat === 1) return -Math.PI / 2;
  if (seat === 2) return Math.PI;
  return Math.PI / 2;
}

function facingAngle(from: BoardPoint, to: BoardPoint): number {
  const dx = to.x - from.x;
  const dz = to.y - from.y;
  if (Math.abs(dx) < 0.001 && Math.abs(dz) < 0.001) return 0;
  return Math.atan2(dx, dz);
}

function nearestTrackIndex(point: BoardPoint): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  TRACK_POINTS.forEach((candidate, index) => {
    const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function horseFacingAngle(horse: HorsePiece, point: BoardPoint): number {
  if (horse.zone === 'yard') {
    return facingAngle(point, trackPoint(START_INDEX[horse.owner]));
  }

  if (horse.zone === 'home') {
    const rank = horse.homeRank ?? 0;
    const target = rank < 6
      ? homeLanePoint(horse.owner, rank + 1)
      : { x: BOARD_CENTER, y: BOARD_CENTER };
    return facingAngle(point, target);
  }

  const currentIndex = nearestTrackIndex(point);
  return facingAngle(point, trackPoint(currentIndex + 1));
}

function horsePoint(horse: HorsePiece): BoardPoint {
  if (horse.zone === 'track') {
    return trackPoint(trackIndexForHorse(horse) ?? START_INDEX[horse.owner]);
  }
  if (horse.zone === 'home') {
    return homeLanePoint(horse.owner, horse.homeRank ?? 0);
  }
  const match = horse.id.match(/-h(\d+)$/);
  return yardPoint(horse.owner, match ? Number(match[1]) : 0);
}

function CameraRig() {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.position.set(7.0, 14.2, 8.4);
    camera.lookAt(0, 0, 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = size.width < 700 ? 48 : 39;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width]);

  return null;
}

function BoardBase({ activeSeats }: { activeSeats: HorseSeat[] }) {
  const wood = '#8b633e';
  const woodTop = '#d6b47d';

  return (
    <group>
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[13.65, 0.55, 13.65]} />
        <meshStandardMaterial color={wood} roughness={0.55} metalness={0.03} />
      </mesh>
      <mesh receiveShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[12.65, 0.16, 12.65]} />
        <meshStandardMaterial color={woodTop} roughness={0.6} />
      </mesh>

      {([0, 1, 2, 3] as HorseSeat[]).map((seat) => {
        const rect = YARD_RECTS[seat];
        const center: BoardPoint = {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2
        };
        const [x, , z] = toWorld(center);
        const width = rect.width * WORLD_SCALE;
        const depth = rect.height * WORLD_SCALE;
        const active = activeSeats.includes(seat);

        return (
          <group key={seat} position={[x, 0, z]}>
            <mesh receiveShadow position={[0, 0.51, 0]}>
              <boxGeometry args={[width, 0.11, depth]} />
              <meshStandardMaterial
                color={COLORS[seat]}
                roughness={0.52}
                transparent={!active}
                opacity={active ? 0.93 : 0.2}
              />
            </mesh>
            {[0, 1, 2, 3].map((horseIndex) => {
              const point = yardPoint(seat, horseIndex);
              const [sx, , sz] = toWorld(point, 0.59);
              return (
                <mesh
                  key={horseIndex}
                  receiveShadow
                  position={[sx - x, 0.59, sz - z]}
                >
                  <cylinderGeometry args={[0.30, 0.30, 0.055, 24]} />
                  <meshStandardMaterial
                    color={LIGHT_COLORS[seat]}
                    roughness={0.7}
                    transparent={!active}
                    opacity={active ? 0.9 : 0.2}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {TRACK_POINTS.map((point, index) => {
        const [x, , z] = toWorld(point, 0.57);
        const gateSeat = index % 14 === 0 ? (index / 14) as HorseSeat : null;
        const color = gateSeat === null ? '#f5ead4' : COLORS[gateSeat];
        return (
          <mesh key={index} castShadow receiveShadow position={[x, 0.57, z]}>
            <boxGeometry args={[0.56, 0.13, 0.56]} />
            <meshStandardMaterial color={color} roughness={0.62} />
          </mesh>
        );
      })}

      {([0, 1, 2, 3] as HorseSeat[]).map((seat) => (
        <group key={seat}>
          {Array.from({ length: 6 }, (_, index) => index + 1).map((rank) => {
            const [x, , z] = toWorld(homeLanePoint(seat, rank), 0.60);
            return (
              <mesh key={rank} castShadow receiveShadow position={[x, 0.60, z]}>
                <boxGeometry args={[0.57, 0.18, 0.57]} />
                <meshStandardMaterial color={COLORS[seat]} roughness={0.48} />
              </mesh>
            );
          })}
        </group>
      ))}

      <mesh castShadow receiveShadow position={[0, 0.61, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.55, 0.20, 1.55]} />
        <meshStandardMaterial color="#5a3d2e" roughness={0.5} />
      </mesh>
    </group>
  );
}

function HorseModel({
  seat,
  actionable = false,
  selected = false,
  facingRotation,
  onPointerDown
}: {
  seat: HorseSeat;
  actionable?: boolean;
  selected?: boolean;
  facingRotation?: number;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}) {
  const color = COLORS[seat];
  const accent = selected ? '#fff4a8' : actionable ? '#ffe16a' : '#ffffff';

  return (
    <group
      rotation={[0, facingRotation ?? seatRotation(seat), 0]}
      onPointerDown={onPointerDown}
    >
      {(actionable || selected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, selected ? 0.075 : 0.052, 12, 32]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={selected ? 1.2 : 0.72}
          />
        </mesh>
      )}

      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.27, 0.34, 0.28, 24]} />
        <meshStandardMaterial color={color} roughness={0.38} />
      </mesh>

      <mesh castShadow position={[0, 0.53, 0.03]} rotation={[-0.34, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.20, 0.55, 20]} />
        <meshStandardMaterial color={color} roughness={0.38} />
      </mesh>

      <mesh castShadow position={[0, 0.82, 0.16]} scale={[0.25, 0.22, 0.35]}>
        <sphereGeometry args={[1, 22, 16]} />
        <meshStandardMaterial color={color} roughness={0.34} />
      </mesh>

      <mesh castShadow position={[0, 0.80, 0.45]} scale={[0.19, 0.15, 0.25]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color={color} roughness={0.36} />
      </mesh>

      {[-0.12, 0.12].map((x) => (
        <mesh
          key={x}
          castShadow
          position={[x, 1.03, 0.09]}
          rotation={[0.05, 0, x < 0 ? 0.08 : -0.08]}
        >
          <coneGeometry args={[0.075, 0.25, 12]} />
          <meshStandardMaterial color={color} roughness={0.38} />
        </mesh>
      ))}

      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.88, 0.40]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#201b18" roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function StaticHorse({
  horse,
  point,
  actionable,
  selected,
  onHorseClick
}: {
  horse: HorsePiece;
  point: BoardPoint;
  actionable: boolean;
  selected: boolean;
  onHorseClick: (horseId: string) => void;
}) {
  const [x, , z] = toWorld(point, HORSE_Y);
  return (
    <group position={[x, HORSE_Y, z]}>
      <HorseModel
        seat={horse.owner}
        facingRotation={horseFacingAngle(horse, point)}
        actionable={actionable}
        selected={selected}
        onPointerDown={(event) => {
          event.stopPropagation();
          onHorseClick(horse.id);
        }}
      />
    </group>
  );
}

function MovingHorse({ motion }: { motion: HorseMotion3D }) {
  const group = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);
  const from = useMemo(() => toWorld(motion.from, HORSE_Y), [motion.from]);
  const to = useMemo(() => toWorld(motion.to, HORSE_Y), [motion.to]);
  const travelFacing = useMemo(
    () => facingAngle(motion.from, motion.to),
    [motion.from, motion.to]
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    const now = clock.getElapsedTime();
    const started = startedAt.current ?? now;
    if (startedAt.current === null) startedAt.current = now;
    const t = Math.min(1, (now - started) / (motion.durationMs / 1000));
    const eased = 1 - Math.pow(1 - t, 3);
    const height =
      motion.kind === 'fly' ? 2.5 :
      motion.kind === 'kick' ? 2.1 :
      0.9;

    group.current.position.set(
      THREE.MathUtils.lerp(from[0], to[0], eased),
      HORSE_Y + Math.sin(Math.PI * t) * height,
      THREE.MathUtils.lerp(from[2], to[2], eased)
    );

    if (motion.kind === 'kick') {
      group.current.rotation.y = travelFacing + t * Math.PI * 4.5;
      group.current.rotation.z = Math.sin(t * Math.PI * 5) * 0.32;
    } else {
      group.current.rotation.y = travelFacing + Math.sin(t * Math.PI) * 0.14;
    }
  });

  return (
    <group ref={group} position={from}>
      <HorseModel seat={motion.seat} facingRotation={0} />
    </group>
  );
}

function ImpactBurst({ point }: { point: BoardPoint }) {
  const group = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);
  const [x, , z] = toWorld(point, 0.76);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const now = clock.getElapsedTime();
    const started = startedAt.current ?? now;
    if (startedAt.current === null) startedAt.current = now;
    const t = Math.min(1, (now - started) / 0.45);
    group.current.scale.setScalar(0.3 + t * 2.0);
    group.current.rotation.y = t * Math.PI;
    group.current.visible = t < 1;
  });

  return (
    <group ref={group} position={[x, 0.76, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.28, 0.07, 10, 30]} />
        <meshStandardMaterial
          color="#ffbf58"
          emissive="#ff6a3c"
          emissiveIntensity={1.7}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function DiceFacePips({
  value,
  rotation = [0, 0, 0]
}: {
  value: number;
  rotation?: [number, number, number];
}) {
  return (
    <group rotation={rotation}>
      {(PIPS[value] ?? PIPS[1]).map(([gx, gz], index) => (
        <mesh key={index} position={[gx * 0.17, 0.365, gz * 0.17]}>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshStandardMaterial color="#2c2723" roughness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function DiceAllFacePips() {
  return (
    <group>
      <DiceFacePips value={1} />
      <DiceFacePips value={6} rotation={[Math.PI, 0, 0]} />
      <DiceFacePips value={2} rotation={[Math.PI / 2, 0, 0]} />
      <DiceFacePips value={5} rotation={[-Math.PI / 2, 0, 0]} />
      <DiceFacePips value={3} rotation={[0, 0, -Math.PI / 2]} />
      <DiceFacePips value={4} rotation={[0, 0, Math.PI / 2]} />
    </group>
  );
}

function settledDieRotation(value: number): [number, number, number] {
  if (value === 6) return [Math.PI, 0, 0];
  if (value === 2) return [-Math.PI / 2, 0, 0];
  if (value === 5) return [Math.PI / 2, 0, 0];
  if (value === 3) return [0, 0, Math.PI / 2];
  if (value === 4) return [0, 0, -Math.PI / 2];
  return [0, 0, 0];
}

const DICE_ROLL_SECONDS = 1.68;

function WorldDie({
  value,
  index,
  rolling,
  selected,
  used,
  onDieClick
}: {
  value: number;
  index: number;
  rolling: boolean;
  selected: boolean;
  used: boolean;
  onDieClick: (index: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);
  const end: [number, number, number] = index === 0
    ? [-1.25, 1.05, 2.15]
    : [1.20, 1.05, 2.45];
  const start: [number, number, number] = index === 0
    ? [-5.4, 1.35, -4.7]
    : [5.1, 1.55, -4.3];

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    if (!rolling) {
      group.current.position.set(...end);
      const [rx, ry, rz] = settledDieRotation(value);
      group.current.rotation.set(rx, ry, rz);
      return;
    }

    const now = clock.getElapsedTime();
    const started = startedAt.current ?? now;
    if (startedAt.current === null) startedAt.current = now;
    const t = Math.min(1, (now - started) / DICE_ROLL_SECONDS);
    const eased = 1 - Math.pow(1 - t, 2.5);
    const lateral = Math.sin(t * Math.PI * 3 + index) * (1 - t) * 1.05;
    const bounce = Math.abs(Math.sin(t * Math.PI * 4.2)) * (1 - t) * 0.65;

    group.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], eased) + lateral,
      0.92 + Math.sin(Math.PI * t) * 2.25 + bounce,
      THREE.MathUtils.lerp(start[2], end[2], eased) + Math.sin(t * Math.PI * 2) * 0.35
    );
    group.current.rotation.x += delta * (12 + index * 2);
    group.current.rotation.y += delta * (9 + index);
    group.current.rotation.z += delta * (7 + index * 1.5);
  });

  return (
    <group
      ref={group}
      position={rolling ? start : end}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        if (!rolling && !used) onDieClick(index);
      }}
    >
      {selected && !rolling && (
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52, 0.055, 12, 32]} />
          <meshStandardMaterial
            color="#ffe06a"
            emissive="#ffe06a"
            emissiveIntensity={1.2}
          />
        </mesh>
      )}

      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.72, 0.72]} />
        <meshStandardMaterial
          color={used ? '#b8b0a3' : '#fff7e9'}
          roughness={0.34}
          transparent={used}
          opacity={used ? 0.42 : 1}
        />
      </mesh>
      <DiceAllFacePips />
    </group>
  );
}

function SceneContent(props: Horse3DSceneProps) {
  const diceValues = props.rolling
    ? props.rollingValues
    : props.game.batch?.values ?? [];
  const diceUsed = props.game.batch?.used ?? diceValues.map(() => false);

  return (
    <>
      <CameraRig />
      <color attach="background" args={['#18242b']} />
      <fog attach="fog" args={['#18242b', 18, 30]} />

      <ambientLight intensity={1.2} />
      <hemisphereLight intensity={0.55} color="#fff3dd" groundColor="#31414a" />
      <directionalLight
        castShadow
        position={[6, 12, 8]}
        intensity={2.4}
        color="#fff0d6"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={35}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <pointLight position={[-7, 4, -5]} intensity={0.9} color="#9fd7ff" />

      <mesh receiveShadow position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[35, 35]} />
        <meshStandardMaterial color="#10181d" roughness={0.95} />
      </mesh>

      <BoardBase activeSeats={props.game.activeSeats} />

      {props.game.horses.map((horse) => {
        if (props.hiddenHorseIds.includes(horse.id)) return null;
        const point = props.visualPoints[horse.id] ?? horsePoint(horse);
        return (
          <StaticHorse
            key={horse.id}
            horse={horse}
            point={point}
            actionable={props.actionableHorseIds.includes(horse.id)}
            selected={props.selectedHorseId === horse.id}
            onHorseClick={props.onHorseClick}
          />
        );
      })}

      {props.motionFx && <MovingHorse key={props.motionFx.id} motion={props.motionFx} />}
      {props.impactPoint && <ImpactBurst point={props.impactPoint} />}

      {diceValues.map((value, index) => (
        <WorldDie
          key={`${props.rolling ? 'rolling' : 'settled'}-${index}`}
          value={value}
          index={index}
          rolling={props.rolling}
          selected={props.selectedDie === index}
          used={Boolean(diceUsed[index])}
          onDieClick={props.onDieClick}
        />
      ))}
    </>
  );
}

export default function Horse3DScene(props: Horse3DSceneProps) {
  return (
    <div className="ccn-three-shell" aria-label="Bàn Cờ cá ngựa 3D">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [7.0, 14.2, 8.4], fov: 39, near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <SceneContent {...props} />
      </Canvas>
      <div className="ccn-three-badge">3D · ISOMETRIC</div>
    </div>
  );
}
