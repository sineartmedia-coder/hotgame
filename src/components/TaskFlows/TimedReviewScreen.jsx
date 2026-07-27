import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TimedReviewScreen = ({ card, player, opponent, onApprove, onPartial, onReject, activeColor, targetCount }) => {
  const [completedCount, setCompletedCount] = useState(targetCount || 0);
  
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      style={{
        background: 'rgba(255,255,255,0.97)', padding: '32px', borderRadius: '28px',
        width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: `4px solid ${activeColor}`, textAlign: 'center', color: '#333'
      }}
    >
      <h3 style={{ color: activeColor, marginBottom: '12px', fontSize: '1.4rem', fontWeight: '900' }}>
        Süre Bitti!
      </h3>
      <p style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>
        {opponent.avatar} {opponent.name} Kararı Bekleniyor
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* TAMAMEN BAŞARDI */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onApprove(0)}
          style={{ padding: '14px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer' }}>
          ✅ GÖREVİ TAMAMLADI (Tam Puan)
        </motion.button>

        {/* KISMEN TAMAMLADI */}
        {card.countable && (
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '12px', marginTop: '10px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 'bold' }}>Kısmen Tamamladı</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="number" min="1" max={targetCount} value={completedCount} 
                onChange={(e) => setCompletedCount(Number(e.target.value))}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}
              />
              <span style={{ fontWeight: 'bold' }}>/ {targetCount} Yaptı</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onPartial(completedCount)}
              style={{ width: '100%', padding: '12px', background: '#f5af19', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer' }}>
              ⚠️ KISMI PUAN VER
            </motion.button>
          </div>
        )}

        {/* HİÇ YAPAMADI */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={onReject}
          style={{ padding: '14px', background: '#d00000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
          ❌ TAMAMLAYAMADI (Eksi Puan)
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TimedReviewScreen;
