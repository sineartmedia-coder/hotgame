import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DiceFace = ({ number, color, bg }) => {
  return (
    <div style={{
      width: '120px', height: '120px',
      backgroundColor: bg || 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '4px solid white',
      borderRadius: '24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 15px 35px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.4)`,
    }}>
      <span style={{ fontSize: '5rem', fontWeight: '900', color: 'white', textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
        {number}
      </span>
    </div>
  );
};

const DiceRoll = ({ players, onFinish }) => {
  const [turn, setTurn] = useState('woman');
  const [womanRoll, setWomanRoll] = useState(null);
  const [manRoll, setManRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(6);
  const [winner, setWinner] = useState(null);

  // Canlı ve dinamik renkler (siyah yok!)
  const activeBg = turn === 'woman' 
    ? 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' // Ateşli Pembe/Kırmızı
    : 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)'; // Ateşli Turuncu/Sarı
    
  const buttonColor = turn === 'woman' ? '#9d4edd' : '#d00000';

  useEffect(() => {
    let interval;
    if (isRolling) {
      interval = setInterval(() => {
        setCurrentFace(Math.floor(Math.random() * 6) + 1);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      setCurrentFace(roll);
      
      if (turn === 'woman') {
        setWomanRoll(roll);
        setTimeout(() => setTurn('man'), 1200);
      } else {
        setManRoll(roll);
        determineWinner(womanRoll, roll);
      }
    }, 1500);
  };

  const determineWinner = (wRoll, mRoll) => {
    const win = wRoll > mRoll ? 'woman' : mRoll > wRoll ? 'man' : (Math.random() > 0.5 ? 'woman' : 'man');
    setTimeout(() => setWinner(win), 1000);
    setTimeout(() => onFinish(win), 4000);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: activeBg,
      transition: 'background 1s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      padding: '40px 20px'
    }}>
      
      {/* Yüzen Emojiler ve Işıklar (Canlılık katar) */}
      <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '4rem', opacity: 0.8 }}>🎲</motion.div>
      <motion.div animate={{ y: [0, 30, 0], x: [0, -20, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 5, repeat: Infinity }} style={{ position: 'absolute', bottom: '15%', right: '10%', fontSize: '4rem', opacity: 0.8 }}>✨</motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: 'absolute', top: '40%', right: '5%', fontSize: '3rem' }}>🔥</motion.div>
      <motion.div animate={{ y: [0, -20, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', bottom: '10%', left: '10%', fontSize: '3.5rem' }}>💋</motion.div>

      <motion.h1 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ color: 'white', textAlign: 'center', marginBottom: '40px', zIndex: 10, fontSize: '2.5rem', fontWeight: '900', textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}
      >
        KİM BAŞLAYACAK?
      </motion.h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10, marginBottom: 'auto' }}>
        
        {/* Kadın Skoru */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          opacity: turn === 'woman' || winner === 'woman' ? 1 : 0.6,
          transition: 'all 0.3s',
          transform: turn === 'woman' && !winner ? 'scale(1.1)' : 'scale(1)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)', marginBottom: '10px' }}>
            <h2 style={{ color: 'white', fontSize: '1.2rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>👩 {players.woman.name}</h2>
          </div>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '20px', 
            background: 'rgba(255,255,255,0.3)', border: '3px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', color: 'white', fontWeight: '900',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}>
            {womanRoll !== null ? womanRoll : '?'}
          </div>
        </div>

        {/* Erkek Skoru */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: turn === 'man' || winner === 'man' ? 1 : 0.6,
          transition: 'all 0.3s',
          transform: turn === 'man' && !winner ? 'scale(1.1)' : 'scale(1)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)', marginBottom: '10px' }}>
            <h2 style={{ color: 'white', fontSize: '1.2rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>👱‍♂️ {players.man.name}</h2>
          </div>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '20px', 
            background: 'rgba(255,255,255,0.3)', border: '3px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', color: 'white', fontWeight: '900',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 25px', borderRadius: '30px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
                Sıra: <span>{players[turn].name}</span>
              </h3>
            </div>

            <motion.div
              animate={{ 
                y: isRolling ? [0, -80, 0] : 0, 
                rotate: isRolling ? [0, 360, 720] : 0,
                scale: isRolling ? [1, 1.3, 1] : 1
              }}
              transition={{ duration: 0.6, repeat: isRolling ? Infinity : 0, ease: "easeInOut" }}
            >
              <DiceFace number={currentFace} bg={turn === 'woman' ? 'rgba(157, 78, 221, 0.4)' : 'rgba(255, 121, 0, 0.4)'} />
            </motion.div>

            <motion.button 
              onClick={rollDice}
              disabled={isRolling}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: '18px 50px',
                borderRadius: '40px',
                background: 'white',
                border: 'none',
                color: buttonColor,
                fontSize: '1.4rem',
                fontWeight: '900',
                cursor: isRolling ? 'default' : 'pointer',
                boxShadow: `0 15px 30px rgba(0,0,0,0.3)`,
                opacity: isRolling ? 0 : 1,
                pointerEvents: isRolling ? 'none' : 'auto',
                transition: 'color 0.5s'
              }}
            >
              ZARI AT 🎲
            </motion.button>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
            style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '40px 60px',
              borderRadius: '40px',
              textAlign: 'center',
              boxShadow: `0 20px 50px rgba(0,0,0,0.5)`,
              border: `5px solid ${winner === 'woman' ? '#ff0844' : '#f5af19'}`,
            }}
          >
            <h3 style={{ color: '#666', marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>GECEYİ BAŞLATAN</h3>
            <h2 style={{ 
              fontSize: '4rem', margin: 0, 
              color: winner === 'woman' ? '#ff0844' : '#f5af19',
              fontWeight: '900',
              textTransform: 'uppercase'
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
