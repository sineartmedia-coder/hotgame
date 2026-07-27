import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PENALTIES } from '../data/cards';

const PenaltyGrid = ({ onClose }) => {
  const [flipped, setFlipped] = useState({});
  const penalties = MOCK_PENALTIES.slice(0, 9);

  const flip = (id) => setFlipped(prev => ({ ...prev, [id]: true }));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'radial-gradient(circle at center, #3c1053 0%, #0a0010 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px'
      }}
    >
      <motion.h1
        initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ color: 'white', fontSize: '2.2rem', fontWeight: '900', marginBottom: '8px',
          textShadow: '0 0 20px rgba(157,78,221,0.8)' }}
      >🎭 CEZA SEÇ</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '28px', fontSize: '1rem' }}>
        Bir karta tıkla ve cezanı öğren!
      </motion.p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', maxWidth: '400px' }}>
        {penalties.map((pen, idx) => {
          const isFlipped = flipped[pen.id];
          return (
            <motion.div
              key={pen.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.06, type: 'spring', bounce: 0.4 }}
              onClick={() => !isFlipped && flip(pen.id)}
              style={{
                height: '120px', borderRadius: '16px', cursor: isFlipped ? 'default' : 'pointer',
                position: 'relative', perspective: '600px'
              }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
              >
                {/* Arka yüz (kapalı) */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, #9d4edd, #ff0844)',
                  borderRadius: '16px', border: '3px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(157,78,221,0.4)'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>🎭</span>
                </div>
                {/* Ön yüz (açık) */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                  background: 'white', borderRadius: '16px', border: '3px solid #9d4edd',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '10px', boxShadow: '0 8px 25px rgba(157,78,221,0.5)'
                }}>
                  <p style={{ fontWeight: '900', fontSize: '0.75rem', color: '#9d4edd', textAlign: 'center', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {pen.title}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: '#333', textAlign: 'center', lineHeight: 1.4 }}>
                    {pen.text}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        style={{
          marginTop: '30px', padding: '14px 40px',
          background: 'linear-gradient(135deg,#9d4edd,#ff0844)',
          color: 'white', border: 'none', borderRadius: '30px',
          fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(157,78,221,0.5)'
        }}
      >← Sonuçlara Dön</motion.button>
    </motion.div>
  );
};

const GameOver = ({ players, onRestart }) => {
  const [showPenalties, setShowPenalties] = useState(false);

  const timeBonus = (p) => p.timeRemaining > 0 ? Math.floor(p.timeRemaining / 60) * 2 : 0;
  const jokerBonus = (p) => p.jokers * 5;

  const getFinalScore = (p) => p.score + timeBonus(p) + jokerBonus(p);

  const wScore = getFinalScore(players.woman);
  const mScore = getFinalScore(players.man);
  const winner = wScore > mScore ? 'woman' : wScore < mScore ? 'man' : 'tie';

  const fmt = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const wCol = '#9d4edd';
  const mCol = '#ff7900';
  const winCol = winner === 'woman' ? wCol : mCol;

  return (
    <>
      <AnimatePresence>
        {showPenalties && <PenaltyGrid onClose={() => setShowPenalties(false)} />}
      </AnimatePresence>

      <div style={{
        minHeight: '100vh', width: '100%',
        background: `radial-gradient(circle at top, rgba(157,78,221,0.3) 0%, #1e0b2e 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', position: 'relative', overflow: 'hidden'
      }}>
        {/* BG Decor */}
        <motion.div animate={{ y: [0,-20,0], opacity: [0.1,0.3,0.1] }} transition={{ duration: 5, repeat: Infinity }}
          style={{ position: 'absolute', top: '8%', left: '8%', fontSize: '4rem', pointerEvents: 'none' }}>🏆</motion.div>
        <motion.div animate={{ y: [0,20,0], opacity: [0.1,0.3,0.1] }} transition={{ duration: 6, repeat: Infinity }}
          style={{ position: 'absolute', bottom: '10%', right: '8%', fontSize: '3.5rem', pointerEvents: 'none' }}>🎊</motion.div>

        <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: '3rem', color: 'white', fontWeight: '900', marginBottom: '16px', textAlign: 'center',
            textShadow: `0 0 30px ${winCol}` }}>
          GECE BİTTİ! 🌙
        </motion.h1>

        {/* Kazanan */}
        {winner !== 'tie' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}
            style={{
              background: `linear-gradient(135deg, ${winCol}, ${winCol}cc)`,
              padding: '18px 40px', borderRadius: '24px', textAlign: 'center', marginBottom: '28px',
              boxShadow: `0 0 40px ${winCol}60`, border: '3px solid white'
            }}>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 6px' }}>Gecenin Şampiyonu 🏆</p>
            <h2 style={{ fontSize: '2.8rem', margin: 0, fontWeight: '900' }}>
              {players[winner].avatar} {players[winner].name}
            </h2>
          </motion.div>
        ) : (
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 28px', color: 'white', fontWeight: '900' }}>🤝 Berabere!</h2>
        )}

        {/* Skor Kartları */}
        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '480px', marginBottom: '28px' }}>
          {(['woman', 'man']).map(p => {
            const score = p === 'woman' ? wScore : mScore;
            const col   = p === 'woman' ? wCol : mCol;
            const pl    = players[p];
            return (
              <motion.div key={p}
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: p === 'woman' ? 0.5 : 0.7 }}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '20px',
                  padding: '20px 16px', textAlign: 'center',
                  border: `3px solid ${winner === p ? col : 'rgba(255,255,255,0.15)'}`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: winner === p ? `0 0 25px ${col}50` : 'none'
                }}
              >
                <p style={{ fontSize: '1.5rem', margin: '0 0 4px' }}>{pl.avatar}</p>
                <h3 style={{ color: col, fontWeight: '900', fontSize: '1.1rem', margin: '0 0 10px' }}>{pl.name}</h3>
                <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'white' }}>{score}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>Toplam Puan</div>
                
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
                
                <div style={{ fontSize: '0.75rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', paddingLeft: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>✅ Görev Puanı</span>
                    <strong>{pl.score - (pl.performanceScore || 0) - (pl.earlyBonus || 0)}</strong>
                  </div>
                  {(pl.performanceScore > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                      <span>⭐ Performans</span>
                      <strong>+{pl.performanceScore}</strong>
                    </div>
                  )}
                  {(pl.earlyBonus > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                      <span>⚡ Hızlı Bitirme</span>
                      <strong>+{pl.earlyBonus}</strong>
                    </div>
                  )}
                  {timeBonus(pl) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}>
                      <span>⏱️ Oyun Süresi</span>
                      <strong>+{timeBonus(pl)}</strong>
                    </div>
                  )}
                  {jokerBonus(pl) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#facc15' }}>
                      <span>🃏 Kalan Joker ({pl.jokers})</span>
                      <strong>+{jokerBonus(pl)}</strong>
                    </div>
                  )}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tamamlanan / Red</span>
                    <strong>{pl.completed} / {pl.rejected}</strong>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '320px' }}>
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPenalties(true)}
            style={{
              padding: '18px', borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #9d4edd, #ff0844)',
              border: 'none', color: 'white', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(157,78,221,0.5)'
            }}
          >
            🎭 CEZA SEÇ
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            style={{
              padding: '16px', borderRadius: '20px', fontWeight: '900', fontSize: '1.1rem',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            🔄 Tekrar Oyna
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default GameOver;
