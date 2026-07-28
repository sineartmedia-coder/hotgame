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
      y: [0, -30, 0, 20, 0],
      x: [0, 10, -8, 14, 0],
      rotate: [0, 15, -12, 8, 0],
      opacity: [0.1, 0.2, 0.1, 0.16, 0.1],
      scale: [1, 1.08, 0.96, 1.04, 1],
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
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: `${Math.random() * 92}%`,
      top: `${Math.random() * 92}%`,
      size: `${1.0 + Math.random() * 1.8}rem`,
      duration: 5 + Math.random() * 7,
      delay: Math.random() * 4,
    }))
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'radial-gradient(ellipse at 20% 20%, #3a0050 0%, #0a0010 40%, #1a000a 70%, #0a0010 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px 16px',
    }}>

      {/* Floating Emojis */}
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
        width: '180px', height: '180px',
        background: 'radial-gradient(circle, rgba(157,78,221,0.3) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(255,121,0,0.25) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Main Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        gap: '0',
      }}>

        {/* Top Emoji Row */}
        <motion.div
          style={{ fontSize: 'clamp(1.8rem, 7vw, 2.5rem)', marginBottom: '8px', letterSpacing: '6px' }}
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
              fontSize: 'clamp(2.6rem, 14vw, 6rem)',
              fontWeight: 900,
              cursor: 'pointer',
              lineHeight: 1.05,
              background: 'linear-gradient(135deg, #ff6eb4, #ff3c78, #ff7900, #ffd600, #ff3c78)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-1px',
              marginBottom: '4px',
            }}
          >
            YANMAYLI<br />MI?
          </motion.h1>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '20px' }}
        >
          <motion.div
            animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, rgba(157,78,221,0.3), rgba(255,60,120,0.3))',
              border: '1.5px solid rgba(255,100,150,0.5)',
              borderRadius: '50px',
              padding: '14px 32px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{
              fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
              fontWeight: 700,
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
            marginTop: '16px',
            fontSize: 'clamp(0.75rem, 3vw, 0.95rem)',
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
          style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginTop: '20px', letterSpacing: '5px' }}
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
