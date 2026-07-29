import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayer } from '../context/MultiplayerContext';

const womanAvatars = ['💋', '😈', '🍑', '🍒', '🍓', '💅'];
const manAvatars   = ['🍆', '😈', '🥵', '💦', '🍌', '🦍'];

// Pulsing dots
const WaitingDots = () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}>
    {[0,1,2].map(i => (
      <motion.div key={i}
        animate={{ y:[0,-10,0], opacity:[0.4,1,0.4] }}
        transition={{ duration:0.8, repeat: Infinity, delay: i*0.18 }}
        style={{ width:'10px', height:'10px', borderRadius:'50%',
          background:'linear-gradient(135deg,#ff3c78,#9d4edd)' }}
      />
    ))}
  </div>
);

const NameEntry = ({ players, setPlayers, onNext }) => {
  const { localPlayer, remotePlayerGender, sendData, onData, chooseCharacter } = useMultiplayer();
  const [localReady, setLocalReady] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [remotePlayerInfo, setRemotePlayerInfo] = useState(null);
  const [step, setStep] = useState('character'); // 'character' | 'name'

  // Karşı oyuncunun seçtiği karakter (characterChosen mesajından geliyor)
  const takenByRemote = remotePlayerGender; // 'woman' | 'man' | null

  const playerKey   = localPlayer || null;
  const isWoman     = playerKey === 'woman';
  const accentColor = isWoman ? '#9d4edd' : '#ff7900';
  const accentGlow  = isWoman ? 'rgba(157,78,221,0.4)' : 'rgba(255,121,0,0.4)';
  const avatarList  = isWoman ? womanAvatars : manAvatars;
  const label       = isWoman ? 'Kadın Oyuncu (Sen)' : 'Erkek Oyuncu (Sen)';

  // Listen for remote player info
  const handleData = useCallback((data) => {
    if (data.type === 'playerReady') {
      setRemoteReady(true);
      setRemotePlayerInfo(data.player);
      const remoteKey = playerKey === 'woman' ? 'man' : 'woman';
      setPlayers(prev => ({
        ...prev,
        [remoteKey]: { ...prev[remoteKey], name: data.player.name, avatar: data.player.avatar }
      }));
    }
  }, [playerKey, setPlayers]);

  useEffect(() => {
    const unsub = onData(handleData);
    return unsub;
  }, [onData, handleData]);

  // When both ready → proceed
  useEffect(() => {
    if (localReady && remoteReady) {
      setTimeout(() => onNext(), 600);
    }
  }, [localReady, remoteReady, onNext]);

  const handleChange = (e) => {
    if (!playerKey) return;
    setPlayers(prev => ({
      ...prev,
      [playerKey]: { ...prev[playerKey], name: e.target.value }
    }));
  };

  const setAvatar = (avatar) => {
    if (!playerKey) return;
    setPlayers(prev => ({
      ...prev,
      [playerKey]: { ...prev[playerKey], avatar }
    }));
  };

  const handleReady = () => {
    if (!playerKey) return;
    setLocalReady(true);
    sendData({
      type: 'playerReady',
      player: { name: players[playerKey].name, avatar: players[playerKey].avatar }
    });
  };

  // Karakter seçimi - seçilen karşıya iletilir
  const handleChooseCharacter = (gender) => {
    chooseCharacter(gender);
    setStep('name');
  };

  // ─── EKRAN 1: Karakter Seçimi ───────────────────────────────────────────────
  if (step === 'character') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, #3c1053 0%, #1e0b2e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Arka plan dekorasyonu */}
        <motion.div
          animate={{ y:[0,-20,0], opacity:[0.1,0.3,0.1], rotate:[0,15,0] }}
          transition={{ duration:6, repeat:Infinity }}
          style={{ position:'absolute', top:'10%', left:'8%', fontSize:'5rem', filter:'blur(3px)' }}
        >💋</motion.div>
        <motion.div
          animate={{ y:[0,20,0], opacity:[0.1,0.3,0.1], rotate:[0,-15,0] }}
          transition={{ duration:5, repeat:Infinity, delay:1 }}
          style={{ position:'absolute', bottom:'10%', right:'8%', fontSize:'5rem', filter:'blur(3px)' }}
        >🍆</motion.div>

        <motion.h2
          initial={{ y:-40, opacity:0 }} animate={{ y:0, opacity:1 }}
          style={{ fontSize:'2.2rem', color:'white', fontWeight:'900', textAlign:'center',
            marginBottom:'10px', zIndex:10, letterSpacing:'1px' }}
        >
          KİM OLACAKSIN?
        </motion.h2>
        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          style={{ color:'rgba(255,200,220,0.7)', fontSize:'0.95rem', marginBottom:'40px', zIndex:10, textAlign:'center' }}
        >
          Karakterini seç
        </motion.p>

        <div style={{ display:'flex', gap:'20px', zIndex:10, flexWrap:'wrap', justifyContent:'center', padding:'0 16px' }}>
          {/* KADIN */}
          <motion.button
            initial={{ x:-60, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.3 }}
            whileHover={{ scale: takenByRemote === 'woman' ? 1 : 1.05 }}
            whileTap={{ scale: takenByRemote === 'woman' ? 1 : 0.95 }}
            onClick={() => takenByRemote !== 'woman' && handleChooseCharacter('woman')}
            disabled={takenByRemote === 'woman'}
            style={{
              width:'160px', height:'200px',
              background: takenByRemote === 'woman'
                ? 'rgba(100,100,100,0.2)'
                : 'linear-gradient(135deg, rgba(157,78,221,0.3), rgba(255,60,120,0.3))',
              border: takenByRemote === 'woman'
                ? '2px solid rgba(100,100,100,0.3)'
                : '2px solid rgba(157,78,221,0.7)',
              borderRadius:'24px', cursor: takenByRemote === 'woman' ? 'not-allowed' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'12px', backdropFilter:'blur(10px)',
              boxShadow: takenByRemote === 'woman' ? 'none' : '0 10px 40px rgba(157,78,221,0.4)',
              opacity: takenByRemote === 'woman' ? 0.4 : 1,
              transition:'all 0.3s',
              position:'relative', overflow:'hidden',
            }}
          >
            {takenByRemote !== 'woman' && (
              <motion.div
                animate={{ opacity:[0.05,0.15,0.05] }}
                transition={{ duration:2, repeat:Infinity }}
                style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(135deg, rgba(157,78,221,0.2), transparent)',
                }}
              />
            )}
            <span style={{ fontSize:'4rem' }}>👩</span>
            <span style={{ color:'white', fontWeight:'900', fontSize:'1.1rem', letterSpacing:'1px' }}>KADIN</span>
            <span style={{ fontSize:'1.4rem' }}>💋</span>
            {takenByRemote === 'woman' && (
              <span style={{ color:'rgba(200,200,200,0.8)', fontSize:'0.75rem', fontWeight:'600' }}>
                (Rakip seçti)
              </span>
            )}
          </motion.button>

          {/* ERKEK */}
          <motion.button
            initial={{ x:60, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:0.4 }}
            whileHover={{ scale: takenByRemote === 'man' ? 1 : 1.05 }}
            whileTap={{ scale: takenByRemote === 'man' ? 1 : 0.95 }}
            onClick={() => takenByRemote !== 'man' && handleChooseCharacter('man')}
            disabled={takenByRemote === 'man'}
            style={{
              width:'160px', height:'200px',
              background: takenByRemote === 'man'
                ? 'rgba(100,100,100,0.2)'
                : 'linear-gradient(135deg, rgba(255,121,0,0.3), rgba(245,175,25,0.3))',
              border: takenByRemote === 'man'
                ? '2px solid rgba(100,100,100,0.3)'
                : '2px solid rgba(255,121,0,0.7)',
              borderRadius:'24px', cursor: takenByRemote === 'man' ? 'not-allowed' : 'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'12px', backdropFilter:'blur(10px)',
              boxShadow: takenByRemote === 'man' ? 'none' : '0 10px 40px rgba(255,121,0,0.4)',
              opacity: takenByRemote === 'man' ? 0.4 : 1,
              transition:'all 0.3s',
              position:'relative', overflow:'hidden',
            }}
          >
            {takenByRemote !== 'man' && (
              <motion.div
                animate={{ opacity:[0.05,0.15,0.05] }}
                transition={{ duration:2, repeat:Infinity, delay:0.5 }}
                style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(135deg, rgba(255,121,0,0.2), transparent)',
                }}
              />
            )}
            <span style={{ fontSize:'4rem' }}>👨</span>
            <span style={{ color:'white', fontWeight:'900', fontSize:'1.1rem', letterSpacing:'1px' }}>ERKEK</span>
            <span style={{ fontSize:'1.4rem' }}>🍆</span>
            {takenByRemote === 'man' && (
              <span style={{ color:'rgba(200,200,200,0.8)', fontSize:'0.75rem', fontWeight:'600' }}>
                (Rakip seçti)
              </span>
            )}
          </motion.button>
        </div>

        {/* Rakibin seçim durumu */}
        <AnimatePresence>
          {takenByRemote && (
            <motion.p
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ color:'rgba(255,200,220,0.7)', marginTop:'28px', fontSize:'0.9rem',
                zIndex:10, textAlign:'center' }}
            >
              {takenByRemote === 'woman' ? '💋 Rakibin kadın karakterini seçti' : '🍆 Rakibin erkek karakterini seçti'}
              <br/>
              <span style={{ fontSize:'0.8rem', opacity:0.6 }}>Diğer karakteri seçmelisin</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Rakip henüz seçmediyse bekleme notu */}
        {!takenByRemote && (
          <motion.p
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            style={{ color:'rgba(255,255,255,0.35)', marginTop:'28px', fontSize:'0.8rem',
              zIndex:10, textAlign:'center' }}
          >
            Rakip henüz seçmedi — sen önce seçebilirsin
          </motion.p>
        )}
      </div>
    );
  }

  // ─── EKRAN 2: İsim & Avatar Girişi ─────────────────────────────────────────
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(circle at center, #3c1053 0%, #1e0b2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="screen-scroll" style={{
        width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '24px 16px 24px',
        justifyContent: 'center', minHeight: '100%',
      }}>

      {/* Arka plan dekorasyonlar */}
      <motion.div
        animate={{ y:[0,-20,0], opacity:[0.1,0.4,0.1], rotate:[0,15,0] }}
        transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'absolute', top:'15%', left:'10%', fontSize:'4rem', filter:'blur(2px)' }}
      >💋</motion.div>
      <motion.div
        animate={{ y:[0,20,0], opacity:[0.1,0.4,0.1], rotate:[0,-15,0] }}
        transition={{ duration:5, repeat:Infinity, ease:'easeInOut', delay:1 }}
        style={{ position:'absolute', bottom:'15%', right:'10%', fontSize:'4rem', filter:'blur(2px)' }}
      >🍆</motion.div>

      <motion.h2
        initial={{ y:-50, opacity:0 }} animate={{ y:0, opacity:1 }}
        style={{ fontSize:'2.5rem', marginBottom:'40px', color:'white', textAlign:'center', zIndex:10, fontWeight:'900' }}
      >
        <span style={{ color: accentColor }}>KİM </span>
        <span style={{ color:'white' }}>SENSİN?</span>
      </motion.h2>

      {/* Role Badge */}
      <motion.div
        initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
        style={{
          background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}66)`,
          border: `2px solid ${accentColor}`,
          borderRadius:'20px', padding:'8px 20px', marginBottom:'20px', zIndex:10,
          color:'white', fontWeight:'700', fontSize:'0.9rem', letterSpacing:'1px',
        }}
      >
        {isWoman ? '💋' : '🍆'} {label}
      </motion.div>

      <div style={{ width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'30px', zIndex:10 }}>

        {/* Oyuncunun isim & avatar formu */}
        <motion.div
          initial={{ x: isWoman ? -50 : 50, opacity:0 }}
          animate={{ x:0, opacity:1 }} transition={{ delay:0.1 }}
          style={{
            background:'rgba(0,0,0,0.3)', padding:'25px', borderRadius:'24px',
            border: `2px solid ${accentColor}66`,
            boxShadow: `0 10px 30px ${accentGlow}`,
            backdropFilter:'blur(10px)'
          }}
        >
          <h3 style={{
            color: accentColor, marginBottom:'15px', textAlign:'center',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'
          }}>
            <span style={{ fontSize:'1.5rem' }}>{playerKey ? players[playerKey].avatar : '?'}</span>
            {isWoman ? 'Kadın Oyuncu' : 'Erkek Oyuncu'}
          </h3>
          <input
            type="text"
            value={playerKey ? players[playerKey].name : ''}
            onChange={handleChange}
            style={{
              width:'100%', padding:'16px', borderRadius:'12px',
              border: `2px solid ${accentColor}80`,
              background:'rgba(255,255,255,0.05)',
              color:'white', fontSize:'1.2rem', textAlign:'center', outline:'none', transition:'all 0.3s'
            }}
            onFocus={e => e.target.style.background = `${accentColor}22`}
            onBlur={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
            placeholder="İsim girin..."
            disabled={localReady}
          />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'15px', padding:'0 10px' }}>
            {avatarList.map(av => (
              <div
                key={av}
                onClick={() => !localReady && setAvatar(av)}
                style={{
                  fontSize:'1.5rem', cursor: localReady ? 'default' : 'pointer', padding:'5px',
                  border: playerKey && players[playerKey].avatar === av ? `2px solid ${accentColor}` : '2px solid transparent',
                  borderRadius:'12px',
                  background: playerKey && players[playerKey].avatar === av ? `${accentColor}33` : 'transparent',
                  transition:'all 0.2s', opacity: localReady ? 0.5 : 1,
                }}
              >{av}</div>
            ))}
          </div>
        </motion.div>

        {/* Karşı oyuncunun hazır durumu */}
        <AnimatePresence>
          {remotePlayerInfo && (
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{
                background:'rgba(43,147,72,0.15)', borderRadius:'16px', padding:'16px',
                border:'2px solid rgba(43,147,72,0.4)', textAlign:'center'
              }}
            >
              <p style={{ color:'#2b9348', fontWeight:'700', fontSize:'0.9rem', marginBottom:'6px' }}>
                ✅ Rakip Hazır!
              </p>
              <p style={{ color:'white', fontWeight:'600' }}>
                {remotePlayerInfo.avatar} {remotePlayerInfo.name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hazır / Bekleme */}
        <AnimatePresence mode="wait">
          {!localReady ? (
            <motion.button
              key="ready-btn"
              initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.4 }}
              exit={{ opacity:0, scale:0.9 }}
              whileTap={{ scale:0.95 }}
              className="btn-primary"
              style={{
                marginTop:'10px', width:'100%', padding:'18px', fontSize:'1.2rem',
                background: `linear-gradient(135deg, ${accentColor}, ${isWoman ? '#ff3c78' : '#f5af19'})`,
                boxShadow: `0 0 25px ${accentGlow}`
              }}
              onClick={handleReady}
            >
              HAZIR! 🚀
            </motion.button>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ textAlign:'center', padding:'16px' }}
            >
              <p style={{ color:'rgba(255,200,220,0.8)', fontWeight:'600', fontSize:'1rem' }}>
                {remoteReady ? '✅ Her iki oyuncu hazır! Başlıyor...' : 'Rakibin hazırlanması bekleniyor...'}
              </p>
              {!remoteReady && <WaitingDots />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default NameEntry;
