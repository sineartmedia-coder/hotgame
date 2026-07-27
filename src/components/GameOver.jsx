import React from 'react';
import { motion } from 'framer-motion';

const GameOver = ({ players, onRestart }) => {
  const winner = players.woman.score > players.man.score ? 'woman' : players.woman.score < players.man.score ? 'man' : 'tie';

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

      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: '600px', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center', borderTop: '4px solid var(--color-purple)' }}>
          <h3 style={{ color: 'var(--color-purple)', marginBottom: '10px' }}>{players.woman.name}</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{players.woman.score}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ccc' }}>
            <p>Tamamlanan: {players.woman.completed}</p>
            <p>Reddedilen: {players.woman.rejected}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '20px', textAlign: 'center', borderTop: '4px solid var(--color-orange)' }}>
          <h3 style={{ color: 'var(--color-orange)', marginBottom: '10px' }}>{players.man.name}</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{players.man.score}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#ccc' }}>
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
