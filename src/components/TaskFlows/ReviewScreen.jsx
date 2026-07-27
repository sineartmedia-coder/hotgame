import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ReviewScreen = ({ card, player, opponent, onApprove, onReject, activeColor }) => {
  const [extraPoints, setExtraPoints] = useState(0);

  const handleSubmit = (approved) => {
    if (approved) {
      onApprove(extraPoints);
    } else {
      onReject();
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      style={{
        background: 'rgba(255,255,255,0.97)', padding: '36px', borderRadius: '28px',
        width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: `4px solid ${activeColor}`, textAlign: 'center', color: '#333'
      }}
    >
      <h3 style={{ color: activeColor, marginBottom: '16px', fontSize: '1.4rem', fontWeight: '900' }}>
        {opponent.avatar} {opponent.name} Onayı
      </h3>
      
      <p style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>Görev başarıyla tamamlandı mı?</p>

      {/* Ekstra Puan Slider */}
      <div style={{ marginBottom: '28px', background: 'rgba(0,0,0,0.05)', padding: '16px', borderRadius: '16px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 'bold' }}>Performans Puanı Ver (İsteğe Bağlı)</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', width: '30px', textAlign: 'right' }}>0</span>
          <input 
            type="range" min="0" max="10" step="1" 
            value={extraPoints} onChange={(e) => setExtraPoints(Number(e.target.value))}
            style={{ flex: 1, accentColor: activeColor }}
          />
          <span style={{ fontWeight: 'bold', width: '30px', textAlign: 'left', color: activeColor }}>+{extraPoints}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSubmit(true)}
          style={{ padding: '16px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer' }}>
          ✅ EVET — Tamamladı!
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSubmit(false)}
          style={{ padding: '16px', background: '#d00000', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer' }}>
          ❌ HAYIR — Tamamlayamadı
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewScreen;
