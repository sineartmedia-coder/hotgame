import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['💋', '🍆', '🍑', '🍒', '😈', '🔥', '💦', '🥵', '👅', '🎲', '❤️‍🔥', '🌶️', '⚡', '💣', '🎰', '🃏', '👄', '😏'];

const FloatingEmoji = ({ emoji, style, duration, delay }) => (
  <motion.div
    style={{
      position: 'absolute',
      fontSize: style.size,
      userSelect: 'none',
      pointerEvents: 'none',
      left: style.left,
      top: style.top,
      opacity: 0.15,
      filter: 'blur(0.5px)',
      zIndex: 0,
    }}
    animate={{
      y: [0, -40, 0, 30, 0],
      x: [0, 15, -10, 20, 0],
      rotate: [0, 20, -15, 10, 0],
      opacity: [0.12, 0.22, 0.12, 0.18, 0.12],
      scale: [1, 1.1, 0.95, 1.05, 1],
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    {emoji}
  </motion.div>
);

const Home = ({ onStart }) => {
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: `${Math.random() * 95}%`,
      top: `${Math.random() * 95}%`,
      size: `${1.2 + Math.random() * 2.2}rem`,
      duration: 5 + Math.random() * 7,
      delay: Math.random() * 4,
    }))
  );

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at 20% 20%, #3a0050 0%, #0a0010 40%, #1a000a 70%, #0a0010 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>

      {/* Floating Emojis Background */}
      {particles.map(p => (
        <FloatingEmoji
          key={p.id}
          emoji={p.emoji}
          style={{ left: p.left, top: p.top, size: p.size }}
          duration={p.duration}
          delay={p.delay}
        />
      ))}

      {/* Glowing Orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(157,78,221,0.3) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(255,121,0,0.25) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(255,0,80,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        {/* Top Emoji Row */}
        <motion.div
          style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '8px' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🔥💋🎲
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        >
          <motion.h1
            onClick={onStart}
            whileTap={{ scale: 0.93 }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255,60,120,0.8), 0 0 40px rgba(157,78,221,0.5)',
                '0 0 30px rgba(255,121,0,0.9), 0 0 60px rgba(255,60,120,0.4)',
                '0 0 20px rgba(157,78,221,0.8), 0 0 40px rgba(255,60,120,0.5)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(3rem, 13vw, 6rem)',
              fontWeight: 900,
              cursor: 'pointer',
              lineHeight: 1.05,
              background: 'linear-gradient(135deg, #ff6eb4, #ff3c78, #ff7900, #ffd600, #ff3c78)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-1px',
              marginBottom: '0.5rem',
            }}
          >
            YANMAYLIM<br />MI?
          </motion.h1>
        </motion.div>

        {/* Tap Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '1.5rem' }}
        >
          <motion.div
            animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, rgba(157,78,221,0.3), rgba(255,60,120,0.3))',
              border: '1.5px solid rgba(255,100,150,0.5)',
              borderRadius: '50px',
              padding: '14px 36px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#ffb3d1',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              👆 Başlamak için dokun
            </span>
          </motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            marginTop: '1.5rem',
            fontSize: '0.95rem',
            color: 'rgba(255,200,220,0.6)',
            fontWeight: 300,
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          Çiftlere Özel · Yetişkin Oyunu
        </motion.p>

        {/* Bottom Emoji Row */}
        <motion.div
          style={{ fontSize: '2rem', marginTop: '2rem', letterSpacing: '6px' }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🍑😈🍒
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
