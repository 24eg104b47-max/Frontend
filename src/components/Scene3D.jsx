import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, ContactShadows } from '@react-three/drei';

function Rig({ children }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.08;
    ref.current.position.y = Math.sin(t * 0.6) * 0.15;
  });
  return <group ref={ref}>{children}</group>;
}

function Shapes({ theme = 'dashboard' }) {
  const palette = {
    auth: ['#38bdf8', '#a78bfa', '#f472b6'],
    dashboard: ['#38bdf8', '#a78bfa', '#34d399'],
    tasks: ['#a78bfa', '#fbbf24', '#38bdf8'],
    form: ['#34d399', '#38bdf8', '#f472b6'],
    summary: ['#fbbf24', '#34d399', '#a78bfa']
  }[theme] || ['#38bdf8', '#a78bfa', '#34d399'];

  return (
    <Rig>
      <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
        <mesh position={[-3.2, 0.6, -2]}>
          <torusKnotGeometry args={[0.9, 0.28, 128, 24]} />
          <meshStandardMaterial color={palette[0]} roughness={0.15} metalness={0.7} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={1.5} floatIntensity={2.4}>
        <mesh position={[3.4, 1, -3]}>
          <icosahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial color={palette[1]} roughness={0.2} metalness={0.6} wireframe={false} />
        </mesh>
      </Float>
      <Float speed={2.4} rotationIntensity={2} floatIntensity={1.6}>
        <mesh position={[0.5, -1.4, -1]}>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color={palette[2]} roughness={0.25} metalness={0.55} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={3}>
        <mesh position={[-1.2, 2, -4]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[2.2, -1.8, -2.5]}>
          <torusGeometry args={[0.7, 0.22, 24, 64]} />
          <meshStandardMaterial color={palette[0]} roughness={0.2} metalness={0.7} />
        </mesh>
      </Float>
    </Rig>
  );
}

export default function Scene3D({ theme = 'dashboard' }) {
  return (
    <div className="scene3d">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.75]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} />
        <pointLight position={[-5, -3, 2]} intensity={0.8} color="#a78bfa" />
        <Stars radius={60} depth={40} count={2500} factor={3} saturation={0} fade speed={1.2} />
        <Shapes theme={theme} />
        <ContactShadows position={[0, -3, 0]} opacity={0.35} blur={2.5} />
      </Canvas>
      <div className="scene-gradient" />
    </div>
  );
}
