import { motion } from 'framer-motion';

export function Page3D({ children, delay = 0 }) {
  return (
    <motion.div
      className="page3d"
      initial={{ opacity: 0, y: 60, rotateX: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, rotateX: -6, scale: 0.98 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({ children, className = '', glow = '#38bdf8' }) {
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(6px)`;
    el.style.setProperty('--glow', glow);
  };
  const onLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  };
  return (
    <motion.div
      className={`tilt-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
