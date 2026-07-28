import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayer } from '../context/MultiplayerContext';

// Generate a random 6-char alphanumeric room code
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Pulsing dots waiting animation
const WaitingDots = () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff3c78, #9d4edd)',
        }}
      />
    ))}
  </div>
);

const RoomSetup = ({ onConnected }) => {
  const { createRoom, joinRoom, isConnected, isWaiting, connectionError, roomCode, role } = useMultiplayer();
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Watch for connection
  useEffect(() => {
    if (isConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  const handleCreate = () => {
    const code = generateCode();
    setGeneratedCode(code);
    createRoom(code);
    setMode('create');
  };

  const handleJoin = () => {
    if (!inputCode.trim()) return;
    joinRoom(inputCode.trim().toUpperCase());
  };

  return (
    <div style={{
      marginTop: '24px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '24px',
      border: '1.5px solid rgba(157,78,221,0.4)',
      padding: '24px',
      backdropFilter: 'blur(12px)',
    }}>
      <h3 style={{
        color: 'white', fontSize: '1.3rem', fontWeight: '900',
        textAlign: 'center', marginBottom: '20px',
        textShadow: '0 0 15px rgba(157,78,221,0.6)',
      }}>
        📡 Canlı Oda Seçimi
      </h3>

      <AnimatePresence mode="wait">
        {/* Mode Selection */}
        {!mode && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleCreate}
              style={{
                width: '100%', padding: '18px',
                background: 'linear-gradient(135deg, #9d4edd, #ff3c78)',
                border: 'none', borderRadius: '16px',
                color: 'white', fontWeight: '900', fontSize: '1.1rem',
                cursor: 'pointer', boxShadow: '0 8px 25px rgba(157,78,221,0.5)',
                letterSpacing: '1px',
              }}
            >
              🏠 Oda Oluştur
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setMode('join')}
              style={{
                width: '100%', padding: '18px',
                background: 'linear-gradient(135deg, #ff7900, #f5af19)',
                border: 'none', borderRadius: '16px',
                color: 'white', fontWeight: '900', fontSize: '1.1rem',
                cursor: 'pointer', boxShadow: '0 8px 25px rgba(255,121,0,0.5)',
                letterSpacing: '1px',
              }}
            >
              🚪 Odaya Katıl
            </motion.button>
          </motion.div>
        )}

        {/* Host: Waiting for Guest */}
        {mode === 'create' && isWaiting && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              background: 'rgba(0,0,0,0.5)', borderRadius: '20px',
              padding: '20px', marginBottom: '20px',
              border: '2px solid rgba(157,78,221,0.6)',
            }}>
              <p style={{ color: 'rgba(255,200,220,0.7)', fontSize: '0.9rem', marginBottom: '12px', letterSpacing: '1px' }}>
                ODA KODU
              </p>
              <motion.div
                animate={{ textShadow: [
                  '0 0 10px rgba(157,78,221,0.8)',
                  '0 0 30px rgba(255,60,120,0.9)',
                  '0 0 10px rgba(157,78,221,0.8)',
                ]}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontSize: '2.8rem', fontWeight: '900', color: 'white',
                  letterSpacing: '8px', fontFamily: 'monospace',
                }}
              >
                {generatedCode}
              </motion.div>
            </div>

            <WaitingDots />
            <p style={{
              color: 'rgba(255,200,220,0.8)', marginTop: '16px',
              fontSize: '1rem', fontWeight: '600',
            }}>
              İkinci oyuncu bekleniyor...
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '8px' }}>
              Bu kodu partnerinle paylaş
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setMode(null); setGeneratedCode(''); }}
              style={{
                marginTop: '20px', padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
              }}
            >
              ← Geri
            </motion.button>
          </motion.div>
        )}

        {/* Guest: Join with code */}
        {mode === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <p style={{ color: 'rgba(255,200,220,0.7)', fontSize: '0.9rem', textAlign: 'center' }}>
              Partnerinden aldığın oda kodunu gir
            </p>
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ODA KODU"
              maxLength={6}
              style={{
                width: '100%', padding: '18px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,121,0,0.5)',
                color: 'white', fontSize: '1.8rem', textAlign: 'center',
                outline: 'none', fontWeight: '900', letterSpacing: '8px',
                fontFamily: 'monospace',
              }}
            />

            {connectionError && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: '#ff4444', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}
              >
                ⚠️ {connectionError}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleJoin}
              disabled={inputCode.length < 4}
              style={{
                width: '100%', padding: '18px',
                background: inputCode.length >= 4
                  ? 'linear-gradient(135deg, #ff7900, #f5af19)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: '16px',
                color: 'white', fontWeight: '900', fontSize: '1.1rem',
                cursor: inputCode.length >= 4 ? 'pointer' : 'not-allowed',
                opacity: inputCode.length >= 4 ? 1 : 0.5,
                letterSpacing: '1px',
              }}
            >
              🚀 Odaya Katıl
            </motion.button>

            {/* Connecting indicator */}
            {!connectionError && inputCode.length >= 4 && !isConnected && role === 'guest' && (
              <div style={{ textAlign: 'center' }}>
                <WaitingDots />
                <p style={{ color: 'rgba(255,200,220,0.7)', marginTop: '10px', fontSize: '0.9rem' }}>
                  Bağlanılıyor...
                </p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setMode(null); setInputCode(''); }}
              style={{
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.08)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
              }}
            >
              ← Geri
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomSetup;
