import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_CARDS } from '../data/cards';

const CATEGORY_NAMES = {
  erotik: 'Erotik',
  igrenc: 'İğrenç',
  zor: 'Zor',
  sureli: 'Süreli',
  sayili: 'Sayılı',
  ortak: 'Ortak',
  mini: 'Mini Oyun',
  cift: 'Çift',
  tekli: 'Tekli'
};

// Küçük dekoratif deste bileşeni (footer için)
const MiniDeck = ({ count, color, icon, label, onClick }) => (
  <motion.div
    whileHover={count > 0 ? { y: -8, scale: 1.05 } : {}}
    onClick={count > 0 && onClick ? onClick : undefined}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      cursor: count > 0 && onClick ? 'pointer' : 'default'
    }}
  >
    <div style={{ position: 'relative', width: '70px', height: '100px' }}>
      {/* Stack illüzyonu */}
      {count > 1 && (
        <div style={{
          position: 'absolute', top: 0, left: '-7px', width: '70px', height: '100px',
          background: `${color}55`, border: `2px solid ${color}88`,
          borderRadius: '12px', transform: 'rotate(-6deg)'
        }} />
      )}
      {count > 2 && (
        <div style={{
          position: 'absolute', top: 0, left: '7px', width: '70px', height: '100px',
          background: `${color}44`, border: `2px solid ${color}66`,
          borderRadius: '12px', transform: 'rotate(5deg)'
        }} />
      )}
      {/* Ana kart */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '70px', height: '100px',
        background: `linear-gradient(135deg, ${color}33, ${color}66)`,
        border: `2.5px solid ${color}`,
        borderRadius: '12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 20px ${color}50`
      }}>
        <span style={{ fontSize: '1.8rem' }}>{icon}</span>
        <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '900', marginTop: '4px', opacity: 0.8 }}>{count > 0 ? `${count} ADET` : 'BOŞ'}</span>
        {count > 0 && (
          <div style={{
            position: 'absolute', top: '-10px', right: '-10px',
            background: color, color: 'white',
            width: '26px', height: '26px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: '900', boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
            border: '2px solid white'
          }}>{count}</div>
        )}
      </div>
    </div>
    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
  </motion.div>
);

const Game = ({ players, setPlayers, startingPlayer, onFinish, settings }) => {
  const [currentPlayer, setCurrentPlayer] = useState(startingPlayer);
  
  const createDeck = (targetGender) => {
    const enabledCards = MOCK_CARDS.filter(card => {
      if (card.target !== targetGender) return false;
      if (!settings.categories[card.category]) return false;
      if (settings.disabledTasks.includes(card.id)) return false;
      return true;
    });
    return enabledCards.sort(() => Math.random() - 0.5);
  };

  const [deckWoman, setDeckWoman] = useState(() => createDeck('woman'));
  const [deckMan, setDeckMan] = useState(() => createDeck('man'));
  const [currentCard, setCurrentCard] = useState(null);
  // cardState: 'hidden' | 'revealed' | 'executing' | 'reviewing' | 'rejectWho' | 'resolving'
  const [cardState, setCardState] = useState('hidden');
  const [resolveDir, setResolveDir] = useState(null); // 'reject' | 'complete'
  const [showJokerModal, setShowJokerModal] = useState(false);

  const opponent = currentPlayer === 'woman' ? 'man' : 'woman';
  const activeColor = currentPlayer === 'woman' ? '#9d4edd' : '#ff7900';
  const activeGlow = currentPlayer === 'woman' ? 'rgba(157,78,221,0.4)' : 'rgba(255,121,0,0.4)';
  const activeBg = currentPlayer === 'woman'
    ? `radial-gradient(circle at top, ${activeGlow} 0%, #3c1053 100%)`
    : `radial-gradient(circle at top, ${activeGlow} 0%, #4a2100 100%)`;

  // Sayaç: sadece 'executing' aşamasında çalışır
  useEffect(() => {
    if (settings.duration <= 0 || cardState !== 'executing') return;
    const interval = setInterval(() => {
      setPlayers(prev => {
        const cur = prev[currentPlayer];
        if (cur.timeRemaining <= 0) return prev;
        return { ...prev, [currentPlayer]: { ...cur, timeRemaining: cur.timeRemaining - 1 } };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPlayer, settings.duration, cardState, setPlayers]);

  const formatTime = (s) => {
    if (s <= 0) return '0:00';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const drawCard = () => {
    const deck = currentPlayer === 'woman' ? deckWoman : deckMan;
    if (deck.length === 0) { doSwitchTurn(true); return; }
    const card = deck[0];
    setCurrentCard(card);
    if (currentPlayer === 'woman') setDeckWoman(deck.slice(1));
    else setDeckMan(deck.slice(1));
    setCardState('revealed');
  };

  const handleAccept = () => setCardState('executing');

  // "REDDET" tıklandığında kim reddetti sorusunu göster
  const handleRejectClick = () => setCardState('rejectWho');

  // Kim reddetti cevabı geldi
  const handleRejectWho = (who) => {
    // who: 'self' | 'opponent'
    const penaltyTarget = who === 'self' ? currentPlayer : opponent;
    setPlayers(prev => ({
      ...prev,
      [penaltyTarget]: {
        ...prev[penaltyTarget],
        rejected: prev[penaltyTarget].rejected + 1,
        score: prev[penaltyTarget].score - 5
      }
    }));
    // Kartı reddetme destesine uçur
    setResolveDir('reject');
    setCardState('resolving');
    setTimeout(() => { setCardState('hidden'); setCurrentCard(null); setResolveDir(null); doSwitchTurn(); }, 700);
  };

  const handleComplete = () => setCardState('reviewing');

  const submitReview = (approved) => {
    if (approved) {
      setPlayers(prev => ({
        ...prev,
        [currentPlayer]: {
          ...prev[currentPlayer],
          completed: prev[currentPlayer].completed + 1,
          score: prev[currentPlayer].score + currentCard.points + 2
        }
      }));
      setResolveDir('complete');
    } else {
      setResolveDir('reject');
    }
    setCardState('resolving');
    setTimeout(() => { setCardState('hidden'); setCurrentCard(null); setResolveDir(null); doSwitchTurn(); }, 700);
  };

  const handleUseJoker = () => {
    if (players[currentPlayer].jokers <= 0) return;
    setPlayers(prev => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], jokers: prev[currentPlayer].jokers - 1 }
    }));
    setShowJokerModal(false);
    setResolveDir('joker');
    setCardState('resolving');
    setTimeout(() => { setCardState('hidden'); setCurrentCard(null); setResolveDir(null); doSwitchTurn(); }, 700);
  };

  const doSwitchTurn = (forceSwitch = false) => {
    const nextDeck = opponent === 'woman' ? deckWoman : deckMan;
    const curDeck = currentPlayer === 'woman' ? deckWoman : deckMan;
    if (deckWoman.length === 0 && deckMan.length === 0) { onFinish(); return; }
    if (nextDeck.length === 0 && curDeck.length > (forceSwitch ? 0 : 1)) return;
    setCurrentPlayer(opponent);
  };

  const currentDeckLength = currentPlayer === 'woman' ? deckWoman.length : deckMan.length;

  // Kart uçuş hedefi: reject=sol alt, complete=sağ alt, joker=yukarı
  const cardExitVariants = {
    reject:   { x: -300, y: 400, scale: 0.1, opacity: 0, rotate: -30 },
    complete: { x: 300, y: 400, scale: 0.1, opacity: 0, rotate: 30 },
    joker:    { y: -500, scale: 0, opacity: 0, rotate: 20 },
    hidden:   { opacity: 0, scale: 0.8 }
  };

  const CardBack = ({ rotation, offsetX, isFront, children }) => (
    <motion.div
      initial={{ rotate: 0, x: 0 }}
      animate={{ rotate: rotation, x: offsetX }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      style={{
        width: '100%', height: '100%', position: 'absolute',
        background: `linear-gradient(135deg, rgba(30,10,50,0.95), rgba(10,0,20,1))`,
        border: `3px solid ${activeColor}`, borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isFront ? `0 20px 40px ${activeGlow}` : '0 10px 20px rgba(0,0,0,0.5)',
        zIndex: isFront ? 3 : 1,
        backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.03) 10px,rgba(255,255,255,0.03) 20px)`
      }}
    >
      <div style={{
        width: '85%', height: '90%', border: `2px solid rgba(255,255,255,0.1)`, borderRadius: '12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle, ${activeGlow} 0%, transparent 70%)`
      }}>
        {children}
      </div>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: activeBg, transition: 'background 1s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      padding: '30px 20px 20px'
    }}>
      {/* Background Decor */}
      <motion.div animate={{ y: [0,-30,0], rotate: [0,10,-10,0] }} transition={{ duration: 6, repeat: Infinity }}
        style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '3.5rem', opacity: 0.15, pointerEvents: 'none' }}>💋</motion.div>
      <motion.div animate={{ y: [0,30,0], rotate: [0,-15,15,0] }} transition={{ duration: 7, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: '3.5rem', opacity: 0.15, pointerEvents: 'none' }}>😈</motion.div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', zIndex: 10 }}>
        <motion.h2
          key={currentPlayer}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ color: 'white', fontSize: '2.5rem', fontWeight: '900', textShadow: `0 5px 20px ${activeColor}`, textAlign: 'center', margin: 0 }}
        >
          {players[currentPlayer].avatar} {players[currentPlayer].name}
        </motion.h2>

        {settings.duration > 0 && (
          <div style={{
            color: cardState === 'executing' && players[currentPlayer].timeRemaining < 30 ? '#ff4444' : 'white',
            marginTop: '8px', fontSize: '1.1rem', fontWeight: 'bold',
            background: 'rgba(0,0,0,0.4)', padding: '6px 18px', borderRadius: '20px',
            border: `1px solid ${activeColor}`, backdropFilter: 'blur(10px)',
            transition: 'color 0.3s'
          }}>
            ⏱️ {formatTime(players[currentPlayer].timeRemaining)}
            {cardState === 'executing' ? ' — Sayıyor!' : ' — Bekliyor'}
          </div>
        )}
      </div>

      {/* Main Play Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative' }}>
        <AnimatePresence mode="wait">

          {/* Kart Destesi (gizli hali) */}
          {cardState === 'hidden' && (
            <motion.div
              key="deck"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              onClick={drawCard}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.95 }}
              style={{ width: '200px', height: '300px', position: 'relative', cursor: 'pointer' }}
            >
              {currentDeckLength > 2 && <CardBack rotation={-12} offsetX={-28} isFront={false} />}
              {currentDeckLength > 1 && <CardBack rotation={-6} offsetX={-14} isFront={false} />}
              <CardBack rotation={0} offsetX={0} isFront={true}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '3.5rem', filter: `drop-shadow(0 0 10px ${activeColor})`, marginBottom: '8px' }}>🔥</span>
                  <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px', margin: 0, textShadow: `0 0 10px ${activeColor}`, textAlign: 'center' }}>
                    GÖREV KARTI
                  </h3>
                  <div style={{
                    position: 'absolute', bottom: '16px', right: '16px',
                    background: activeColor, color: 'white', padding: '6px 12px', borderRadius: '16px',
                    fontWeight: '900', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {currentDeckLength} KART
                  </div>
                </div>
              </CardBack>
            </motion.div>
          )}

          {/* Kart açık (revealed, executing, rejectWho) */}
          {(cardState === 'revealed' || cardState === 'executing' || cardState === 'rejectWho') && currentCard && (
            <motion.div
              key="card-open"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              style={{
                width: '300px', minHeight: '400px',
                background: 'white', color: 'black',
                borderRadius: '24px', padding: '28px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                border: `4px solid ${activeColor}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>
                <span style={{ fontWeight: '900', textTransform: 'uppercase', color: activeColor, fontSize: '0.85rem' }}>
                  {CATEGORY_NAMES[currentCard.category] || currentCard.category}
                </span>
                <span style={{ fontWeight: '900', color: '#555', fontSize: '0.85rem' }}>{currentCard.points} PUAN</span>
              </div>

              {currentCard.title && (
                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', textAlign: 'center', color: '#111', marginBottom: '12px' }}>
                  {currentCard.title}
                </h2>
              )}

              <p style={{ fontSize: '1.15rem', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', lineHeight: 1.6 }}>
                {currentCard.text}
              </p>

              {/* Kabul/Reddet butonları */}
              {cardState === 'revealed' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleRejectClick}
                    style={{ flex: 1, padding: '14px', background: '#d00000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(208,0,0,0.3)' }}>
                    ❌ REDDET
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleAccept}
                    style={{ flex: 1, padding: '14px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(43,147,72,0.3)' }}>
                    ✅ KABUL
                  </motion.button>
                </div>
              )}

              {/* Kim Reddetti? */}
              {cardState === 'rejectWho' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '20px', padding: '16px', background: '#fff3f3', borderRadius: '16px', border: '2px solid #d00000' }}>
                  <p style={{ fontWeight: '900', textAlign: 'center', color: '#d00000', marginBottom: '14px', fontSize: '1rem' }}>
                    Kim Reddetti?
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleRejectWho('self')}
                      style={{ padding: '12px', background: '#d00000', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}>
                      {players[currentPlayer].avatar} Ben Reddettim
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleRejectWho('opponent')}
                      style={{ padding: '12px', background: '#555', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}>
                      {players[opponent].avatar} {players[opponent].name} Reddetti
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Görevi bitirdim */}
              {cardState === 'executing' && (
                <div style={{ marginTop: '24px' }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleComplete}
                    style={{ width: '100%', padding: '16px', background: activeColor, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: `0 8px 20px ${activeColor}50` }}>
                    ✅ GÖREVİ BİTİRDİM
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Kartın köşeye uçuşu (resolving) */}
          {cardState === 'resolving' && currentCard && (
            <motion.div
              key="card-resolving"
              initial={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={resolveDir ? cardExitVariants[resolveDir] : cardExitVariants.hidden}
              transition={{ duration: 0.6, ease: 'easeIn' }}
              style={{
                width: '260px', minHeight: '360px',
                background: 'white', borderRadius: '20px', padding: '24px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                border: `4px solid ${resolveDir === 'complete' ? '#2b9348' : '#d00000'}`
              }}
            >
              <h2 style={{ textAlign: 'center', color: resolveDir === 'complete' ? '#2b9348' : '#d00000', fontSize: '1.5rem', fontWeight: '900' }}>
                {resolveDir === 'complete' ? '✅ Tamamlandı!' : resolveDir === 'joker' ? '🃏 Joker!' : '❌ Reddedildi!'}
              </h2>
              <p style={{ textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '1.1rem' }}>
                {currentCard.text}
              </p>
            </motion.div>
          )}

          {/* İnceleme ekranı */}
          {cardState === 'reviewing' && (
            <motion.div
              key="review"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              style={{
                background: 'rgba(255,255,255,0.97)', padding: '36px', borderRadius: '28px',
                width: '90%', maxWidth: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: `4px solid ${activeColor}`, textAlign: 'center'
              }}
            >
              <h3 style={{ color: opponent === 'woman' ? '#9d4edd' : '#ff7900', marginBottom: '16px', fontSize: '1.4rem', fontWeight: '900' }}>
                {players[opponent].avatar} {players[opponent].name} Onayı
              </h3>
              <p style={{ marginBottom: '28px', fontSize: '1.1rem', color: '#333', fontWeight: 'bold' }}>
                Görev başarıyla tamamlandı mı?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => submitReview(true)}
                  style={{ padding: '16px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(43,147,72,0.3)' }}>
                  ✅ EVET — Tamamladı!
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => submitReview(false)}
                  style={{ padding: '16px', background: '#d00000', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(208,0,0,0.3)' }}>
                  ❌ HAYIR — Tamamlayamadı
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === FOOTER === */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        padding: '20px 24px 24px', background: 'rgba(0,0,0,0.4)', borderRadius: '28px',
        backdropFilter: 'blur(16px)', zIndex: 10, marginTop: '14px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Reddedilenler (sol) */}
        <MiniDeck
          count={players[currentPlayer].rejected}
          color="#d00000"
          icon="❌"
          label="Reddedilen"
        />

        {/* Jokerler (orta) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            {[...Array(settings.jokerCount)].map((_, i) => {
              const isActive = i < players[currentPlayer].jokers;
              return (
                <motion.div
                  key={i}
                  whileHover={isActive ? { y: -12, scale: 1.15 } : {}}
                  whileTap={isActive ? { scale: 0.9 } : {}}
                  onClick={isActive ? () => setShowJokerModal(true) : undefined}
                  style={{
                    width: '52px', height: '76px',
                    background: isActive
                      ? `linear-gradient(135deg, #f5af19, #f12711)`
                      : 'rgba(255,255,255,0.08)',
                    border: isActive ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '4px',
                    fontSize: '1.7rem',
                    cursor: isActive ? 'pointer' : 'default',
                    boxShadow: isActive ? '0 8px 20px rgba(245,175,25,0.6), 0 0 0 1px rgba(255,255,255,0.2)' : 'none',
                    transition: 'all 0.3s',
                    filter: isActive ? 'none' : 'grayscale(1) opacity(0.25)'
                  }}
                >
                  🃏
                  {isActive && <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: '900', opacity: 0.9 }}>KULLAN</span>}
                </motion.div>
              );
            })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            JOKER ({players[currentPlayer].jokers}/{settings.jokerCount})
          </span>
        </div>

        {/* Tamamlananlar (sağ) */}
        <MiniDeck
          count={players[currentPlayer].completed}
          color="#2b9348"
          icon="✅"
          label="Tamamlanan"
        />
      </div>

      {/* === JOKER MODAL === */}
      <AnimatePresence>
        {showJokerModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowJokerModal(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                zIndex: 50, backdropFilter: 'blur(4px)'
              }}
            />
            {/* Modal kart */}
            <motion.div
              initial={{ scale: 0, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 10, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '280px',
                background: 'linear-gradient(135deg, #f5af19, #f12711)',
                borderRadius: '28px', padding: '36px 28px',
                zIndex: 51, textAlign: 'center',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                border: '4px solid white'
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🃏</div>
              <h2 style={{ color: 'white', fontWeight: '900', fontSize: '1.8rem', margin: 0 }}>JOKER!</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '10px', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5 }}>
                Bu joker'ı kullanarak aktif kartı <strong>ceza almadan</strong> atla. Sıra rakibine geçer.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setShowJokerModal(false)}
                  style={{ flex: 1, padding: '14px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '2px solid white', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }}>
                  GERİ
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={handleUseJoker}
                  style={{ flex: 1, padding: '14px', background: 'white', color: '#f12711', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
                  KULLAN ✨
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
