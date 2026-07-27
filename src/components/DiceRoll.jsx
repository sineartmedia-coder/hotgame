import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DiceFace = ({ number, color }) => {
  const dots = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const activeDots = dots[number] || [];

  const getPosition = (pos) => {
    switch(pos) {
      case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'top-left': return { top: '20%', left: '20%', transform: 'translate(-50%, -50%)' };
      case 'top-right': return { top: '20%', left: '80%', transform: 'translate(-50%, -50%)' };
      case 'middle-left': return { top: '50%', left: '20%', transform: 'translate(-50%, -50%)' };
      case 'middle-right': return { top: '50%', left: '80%', transform: 'translate(-50%, -50%)' };
      case 'bottom-left': return { top: '80%', left: '20%', transform: 'translate(-50%, -50%)' };
      case 'bottom-right': return { top: '80%', left: '80%', transform: 'translate(-50%, -50%)' };
      default: return {};
    }
  };

  return (
    <div style={{
      width: '120px', height: '120px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${color}`,
      borderRadius: '24px',
      position: 'relative',
      boxShadow: `0 10px 30px ${color}40, inset 0 0 20px rgba(255,255,255,0.1)`,
    }}>
      {activeDots.map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: '20px', height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          boxShadow: `0 0 10px ${color}`,
          ...getPosition(pos)
        }} />
      ))}
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
  const activeGlow = turn === 'woman' ? 'rgba(157, 78, 221, 0.5)' : 'rgba(255, 121, 0, 0.5)';

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
      background: `radial-gradient(circle at center, ${activeGlow} 0%, #050010 80%)`,
      transition: 'background 1s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Background Decor */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: `conic-gradient(from 0deg, transparent, ${activeGlow} 10%, transparent 20%, transparent)`, opacity: 0.3 }} />

      {/* Top Half - Woman (Purple) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: turn === 'woman' || winner === 'woman' ? 1 : 0.4,
        transition: 'opacity 0.5s'
      }}>
        <motion.div animate={turn === 'woman' && !winner ? { y: [0, -10, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
          <h2 style={{ color: 'white', fontSize: '2.5rem', textShadow: '0 0 20px var(--color-purple)' }}>👩 {players.woman.name}</h2>
        </motion.div>
        <AnimatePresence>
          {womanRoll && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ marginTop: '20px' }}>
              <DiceFace number={womanRoll} color="var(--color-purple)" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', zIndex: 1 }} />

      {/* Bottom Half - Man (Orange) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: turn === 'man' || winner === 'man' ? 1 : 0.4,
        transition: 'opacity 0.5s'
      }}>
        <AnimatePresence>
          {manRoll && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ marginBottom: '20px' }}>
              <DiceFace number={manRoll} color="var(--color-orange)" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div animate={turn === 'man' && !winner ? { y: [0, 10, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
          <h2 style={{ color: 'white', fontSize: '2.5rem', textShadow: '0 0 20px var(--color-orange)' }}>👱‍♂️ {players.man.name}</h2>
        </motion.div>
      </div>

      {/* Center Dice Area */}
      <div style={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10
      }}>
        {!winner ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
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
