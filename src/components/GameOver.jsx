import React from 'react';
import { motion } from 'framer-motion';

const GameOver = ({ players, onRestart }) => {
  const calculateBonus = (player) => {
    return player.timeRemaining > 0 ? Math.floor(player.timeRemaining / 60) * 2 : 0;
  };

  const finalWomanScore = players.woman.score + calculateBonus(players.woman);
  const finalManScore = players.man.score + calculateBonus(players.man);

  const winner = finalWomanScore > finalManScore ? 'woman' : finalWomanScore < finalManScore ? 'man' : 'tie';

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="screen-container" style={{ padding: '2rem' }}>
      <motion.h1 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ fontSize: '4rem', color: 'white', marginBottom: '2rem', textAlign: 'center' }}
      >
        OYUN BİTTİ
      </motion.h1>

      {winner !== 'tie' ? (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.5 }}
          style={{
            background: winner === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)',
            padding: '20px 40px',
            borderRadius: '20px',
            textAlign: 'center',
            marginBottom: '3rem',
            boxShadow: `0 0 40px ${winner === 'woman' ? 'var(--color-purple-glow)' : 'var(--color-orange-glow)'}`
          }}
        >
          <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Gecenin Şampiyonu</p>
          <h2 style={{ fontSize: '3rem', margin: 0 }}>{players[winner].name}</h2>
        </motion.div>
      ) : (
        <h2 style={{ fontSize: '3rem', margin: '0 0 3rem 0', color: 'white' }}>Berabere!</h2>
      )}

      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '800px', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center', borderTop: '4px solid var(--color-purple)' }}>
          <h3 style={{ color: 'var(--color-purple)', marginBottom: '10px' }}>{players.woman.name}</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{finalWomanScore} <span style={{ fontSize: '1rem', color: '#aaa' }}>puan</span></div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ccc' }}>
            <p>Görev Puanı: {players.woman.score}</p>
            <p>Zaman Bonusu: +{calculateBonus(players.woman)}</p>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <p>Artan Süre: {formatTime(players.woman.timeRemaining)}</p>
            <p>Tamamlanan: {players.woman.completed}</p>
            <p>Reddedilen: {players.woman.rejected}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center', borderTop: '4px solid var(--color-orange)' }}>
          <h3 style={{ color: 'var(--color-orange)', marginBottom: '10px' }}>{players.man.name}</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{finalManScore} <span style={{ fontSize: '1rem', color: '#aaa' }}>puan</span></div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ccc' }}>
            <p>Görev Puanı: {players.man.score}</p>
            <p>Zaman Bonusu: +{calculateBonus(players.man)}</p>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <p>Artan Süre: {formatTime(players.man.timeRemaining)}</p>
            <p>Tamamlanan: {players.man.completed}</p>
            <p>Reddedilen: {players.man.rejected}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
        <button className="btn-primary" onClick={onRestart}>Tekrar Oyna</button>
      </div>
    </div>
  );
};

export default GameOver;
