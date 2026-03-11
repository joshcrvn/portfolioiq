import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// Module-level guard so the engine is only initialised once
// (handles React 18 StrictMode double-effects and hot reloads)
let engineReady = false;

export function ParticleBackground() {
  const [init, setInit] = useState(engineReady);

  useEffect(() => {
    if (engineReady) {
      setInit(true);
      return;
    }
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      engineReady = true;
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fpsLimit: 40,
        particles: {
          number: {
            value: 55,
            density: { enable: true, width: 1920, height: 1080 },
          },
          color: { value: '#00FF94' },
          opacity: {
            value: { min: 0.08, max: 0.18 },
            animation: { enable: true, speed: 0.4, sync: false },
          },
          size: {
            value: { min: 1, max: 2 },
          },
          move: {
            enable: true,
            speed: 0.25,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
          links: {
            enable: true,
            color: '#00FF94',
            opacity: 0.07,
            distance: 130,
            width: 0.8,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: false },
            onClick: { enable: false },
          },
        },
        detectRetina: true,
        background: { color: 'transparent' },
      }}
    />
  );
}
