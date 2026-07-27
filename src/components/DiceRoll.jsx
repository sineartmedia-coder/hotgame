import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DiceFace = ({ number, color }) => {
  return (
    <div style={{
      width: '120px', height: '120px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${color}`,
      borderRadius: '24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 10px 30px ${color}40, inset 0 0 20px rgba(255,255,255,0.1)`,
    }}>
      <span style={{ fontSize: '5rem', fontWeight: 'bold', color: 'white', textShadow: `0 0 20px ${color}` }}>
        {number}
      </span>
    </div>
  );
};

const DiceRoll = ({ players, onFinish }) => {
  const [turn, setTurn] = useState('woman'); // Who is rolling now
  const [womanRoll, setWomanRoll] = useState(null);
  const [manRoll, setManRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(6); // Temporary face while rolling
  const [winner, setWinner] = useState(null); // 'woman' or 'man'

  const activeColor = turn === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)';
  const activeGlow = turn === 'woman' ? 'rgba(157, 78, 221, 0.4)' : 'rgba(255, 121, 0, 0.4)';

  useEffect(() => {
    let interval;
    if (isRolling) {
      interval = setInterval(() => {
        setCurrentFace(Math.floor(Math.random() * 6) + 1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Simulate roll time
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      setCurrentFace(roll);
      
      if (turn === 'woman') {
        setWomanRoll(roll);
        setTimeout(() => setTurn('man'), 1000);
      } else {
        setManRoll(roll);
        determineWinner(womanRoll, roll);
      }
    }, 2000);
  };

  const determineWinner = (wRoll, mRoll) => {
    const win = wRoll > mRoll ? 'woman' : mRoll > wRoll ? 'man' : (Math.random() > 0.5 ? 'woman' : 'man');
    setTimeout(() => setWinner(win), 1000);
    setTimeout(() => onFinish(win), 4000);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: `radial-gradient(circle at center, ${activeGlow} 0%, #050010 100%)`,
      transition: 'background 1s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      padding: '40px 20px'
    }}>
      
      {/* Background Decor */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: `conic-gradient(from 0deg, transparent, ${activeGlow} 10%, transparent 20%, transparent)`, opacity: 0.2 }} />

      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '40px', zIndex: 10, fontSize: '2rem', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
        KİM BAŞLAYACAK?
      </h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10, marginBottom: 'auto' }}>
        
        {/* Kadın Skoru */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          opacity: turn === 'woman' || winner === 'woman' ? 1 : 0.5,
          transition: 'opacity 0.3s'
        }}>
          <h2 style={{ color: 'var(--color-purple)', fontSize: '1.2rem', marginBottom: '10px' }}>👩 {players.woman.name}</h2>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '15px', 
            background: 'rgba(0,0,0,0.5)', border: '2px solid var(--color-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', color: 'white', fontWeight: 'bold'
          }}>
            {womanRoll !== null ? womanRoll : '?'}
          </div>
        </div>

        {/* Erkek Skoru */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: turn === 'man' || winner === 'man' ? 1 : 0.5,
          transition: 'opacity 0.3s'
        }}>
          <h2 style={{ color: 'var(--color-orange)', fontSize: '1.2rem', marginBottom: '10px' }}>👱‍♂️ {players.man.name}</h2>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '15px', 
            background: 'rgba(0,0,0,0.5)', border: '2px solid var(--color-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', color: 'white', fontWeight: 'bold'
          }}>
            {manRoll !== null ? manRoll : '?'}
          </div>
        </div>

      </div>

      {/* Center Dice Area */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flex: 1, zIndex: 10
      }}>
        {!winner ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            
            <h3 style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}>
              Sıra: <span style={{ color: activeColor }}>{players[turn].name}</span>
            </h3>

            <motion.div
              animate={{ 
                y: isRolling ? [0, -60, 0] : 0, 
                rotate: isRolling ? [0, 180, 360] : 0,
                scale: isRolling ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.6, repeat: isRolling ? Infinity : 0, ease: "easeInOut" }}
            >
              <DiceFace number={currentFace} color={activeColor} />
            </motion.div>

            <motion.button 
              onClick={rollDice}
              disabled={isRolling}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: '15px 40px',
                borderRadius: '30px',
                background: `linear-gradient(135deg, ${activeColor}, ${turn === 'woman' ? '#ff3c78' : '#ffb703'})`,
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: isRolling ? 'default' : 'pointer',
                boxShadow: `0 0 20px ${activeColor}80`,
                opacity: isRolling ? 0 : 1,
                pointerEvents: isRolling ? 'none' : 'auto'
              }}
            >
              ZARI AT 🎲
            </motion.button>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            style={{
              background: 'rgba(0,0,0,0.8)',
              padding: '40px 60px',
              borderRadius: '30px',
              textAlign: 'center',
              boxShadow: `0 0 50px ${winner === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)'}`,
              border: `2px solid ${winner === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)'}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            <h3 style={{ color: '#aaa', marginBottom: '10px' }}>Gecenin Başlayanı</h3>
            <h2 style={{ 
              fontSize: '3.5rem', margin: 0, 
              color: winner === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)',
              textShadow: '0 0 20px currentColor'
            }}>
              {players[winner].name}
            </h2>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiceRoll;
