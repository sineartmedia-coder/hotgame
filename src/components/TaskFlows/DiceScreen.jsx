import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DiceScreen = ({ onRollComplete, activeColor }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);

  const handleRoll = () => {
    setIsRolling(true);
    // 1-6 arası rastgele sayı
    const finalNumber = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      setIsRolling(false);
      setResult(finalNumber);
    }, 1500);
  };

  const handleContinue = () => {
    onRollComplete(result);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{
        width: '300px', background: 'white', borderRadius: '24px', padding: '30px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: `4px solid ${activeColor}`
      }}
    >
      <h2 style={{ color: '#111', fontWeight: '900', marginBottom: '10px' }}>Hedef Belirle</h2>
      <p style={{ color: '#555', textAlign: 'center', marginBottom: '24px', fontSize: '0.95rem' }}>
        Bu görevde sayıyı şans belirleyecek. Zarı at ve hedefini gör!
      </p>

      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '30px', perspective: '1000px' }}>
        <AnimatePresence mode="wait">
          {!isRolling && result === null && (
            <motion.div key="idle"
              whileHover={{ scale: 1.1, rotate: 10 }}
              onClick={handleRoll}
              style={{
                width: '100%', height: '100%', background: `linear-gradient(135deg, ${activeColor}, #3c1053)`,
                borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: `0 10px 30px ${activeColor}80`
              }}
            >
              <span style={{ fontSize: '3.5rem' }}>🎲</span>
            </motion.div>
          )}

          {isRolling && (
            <motion.div key="rolling"
              animate={{ rotateX: [0, 360, 720], rotateY: [0, 180, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{
                width: '100%', height: '100%', background: `linear-gradient(135deg, ${activeColor}, #3c1053)`,
                borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 10px 30px ${activeColor}80`
              }}
            >
              <span style={{ fontSize: '3.5rem' }}>🎲</span>
            </motion.div>
          )}

          {!isRolling && result !== null && (
            <motion.div key="result"
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} type="spring"
              style={{
                width: '100%', height: '100%', background: 'white',
                border: `6px solid ${activeColor}`, borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 15px 40px ${activeColor}60`
              }}
            >
              <span style={{ fontSize: '4rem', fontWeight: '900', color: activeColor }}>{result}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isRolling && result === null && (
        <p style={{ color: activeColor, fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>ZARA TIKLA</p>
      )}

      {result !== null && (
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          style={{ width: '100%', padding: '16px', background: activeColor, color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          DEVAM ET
        </motion.button>
      )}
    </motion.div>
  );
};

export default DiceScreen;
