import React from 'react';
import { motion } from 'framer-motion';

const womanAvatars = ['💋', '😈', '🍑', '🍒', '🍓', '💅'];
const manAvatars = ['🍆', '😈', '🥵', '💦', '🍌', '🦍'];

const NameEntry = ({ players, setPlayers, onNext }) => {
  const handleChange = (e, player) => {
    setPlayers(prev => ({
      ...prev,
      [player]: { ...prev[player], name: e.target.value }
    }));
  };

  const setAvatar = (player, avatar) => {
    setPlayers(prev => ({
      ...prev,
      [player]: { ...prev[player], avatar }
    }));
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(circle at center, #3c1053 0%, #1e0b2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Arka Plan Dekorasyonları */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '4rem', filter: 'blur(2px)' }}
      >💋</motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.1, 0.4, 0.1], rotate: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: 'absolute', bottom: '15%', right: '10%', fontSize: '4rem', filter: 'blur(2px)' }}
      >🍆</motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: 'absolute', top: '40%', right: '20%', fontSize: '3rem', filter: 'blur(2px)' }}
      >😈</motion.div>
      <div style={{
        position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(157,78,221,0.2) 0%, transparent 70%)', borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(255,121,0,0.2) 0%, transparent 70%)', borderRadius: '50%'
      }} />

      <motion.h2 
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ fontSize: '2.5rem', marginBottom: '40px', color: 'white', textAlign: 'center', zIndex: 10, fontWeight: '900' }}
      >
        <span style={{ color: 'var(--color-purple)' }}>KİM </span> 
        <span style={{ color: 'white' }}>KİMDİR?</span>
      </motion.h2>

      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '30px', zIndex: 10 }}>
        
        {/* Kadın Oyuncu Alanı */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '24px',
            border: '2px solid rgba(157,78,221,0.4)', boxShadow: '0 10px 30px rgba(157,78,221,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 style={{ color: 'var(--color-purple)', marginBottom: '15px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{players.woman.avatar}</span> Kadın Oyuncu
          </h3>
          <input 
            type="text" 
            value={players.woman.name}
            onChange={(e) => handleChange(e, 'woman')}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              border: '2px solid rgba(157,78,221,0.5)', background: 'rgba(255,255,255,0.05)',
              color: 'white', fontSize: '1.2rem', textAlign: 'center', outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.background = 'rgba(157,78,221,0.1)'}
            onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            placeholder="İsim girin..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '0 10px' }}>
            {womanAvatars.map(av => (
              <div 
                key={av} 
                onClick={() => setAvatar('woman', av)}
                style={{ 
                  fontSize: '1.5rem', cursor: 'pointer', padding: '5px',
                  border: players.woman.avatar === av ? '2px solid var(--color-purple)' : '2px solid transparent',
                  borderRadius: '12px', background: players.woman.avatar === av ? 'rgba(157,78,221,0.2)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >{av}</div>
            ))}
          </div>
        </motion.div>

        {/* Erkek Oyuncu Alanı */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '24px',
            border: '2px solid rgba(255,121,0,0.4)', boxShadow: '0 10px 30px rgba(255,121,0,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 style={{ color: 'var(--color-orange)', marginBottom: '15px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{players.man.avatar}</span> Erkek Oyuncu
          </h3>
          <input 
            type="text" 
            value={players.man.name}
            onChange={(e) => handleChange(e, 'man')}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              border: '2px solid rgba(255,121,0,0.5)', background: 'rgba(255,255,255,0.05)',
              color: 'white', fontSize: '1.2rem', textAlign: 'center', outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.background = 'rgba(255,121,0,0.1)'}
            onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            placeholder="İsim girin..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '0 10px' }}>
            {manAvatars.map(av => (
              <div 
                key={av} 
                onClick={() => setAvatar('man', av)}
                style={{ 
                  fontSize: '1.5rem', cursor: 'pointer', padding: '5px',
                  border: players.man.avatar === av ? '2px solid var(--color-orange)' : '2px solid transparent',
                  borderRadius: '12px', background: players.man.avatar === av ? 'rgba(255,121,0,0.2)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >{av}</div>
            ))}
          </div>
        </motion.div>

        <motion.button 
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary" 
          style={{ 
            marginTop: '10px', width: '100%', padding: '18px', fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #ff3c78, #ff7900)',
            boxShadow: '0 0 25px rgba(255,60,120,0.4)'
          }} 
          onClick={onNext}
        >
          DEVAM ET 🚀
        </motion.button>
      </div>
    </div>
  );
};

export default NameEntry;
