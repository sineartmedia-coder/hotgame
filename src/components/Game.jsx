import React, { useState, useEffect } from 'react';
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
  const [cardState, setCardState] = useState('hidden'); // hidden, revealed, executing, reviewing

  const activeColor = currentPlayer === 'woman' ? '#9d4edd' : '#ff7900';
  const activeGlow = currentPlayer === 'woman' ? 'rgba(157, 78, 221, 0.4)' : 'rgba(255, 121, 0, 0.4)';
  
  const activeBg = currentPlayer === 'woman' 
    ? `radial-gradient(circle at top, ${activeGlow} 0%, #3c1053 100%)` 
    : `radial-gradient(circle at top, ${activeGlow} 0%, #4a2100 100%)`;
    
  const opponent = currentPlayer === 'woman' ? 'man' : 'woman';

  // Sadece görev kabul edilip "executing" aşamasına geçildiğinde sayacı çalıştır
  useEffect(() => {
    if (settings.duration <= 0 || cardState !== 'executing') return;
    const interval = setInterval(() => {
      setPlayers(prev => {
        const current = prev[currentPlayer];
        if (current.timeRemaining <= 0) return prev;
        return {
          ...prev,
          [currentPlayer]: { ...current, timeRemaining: current.timeRemaining - 1 }
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPlayer, settings.duration, cardState, setPlayers]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const drawCard = () => {
    const currentDeck = currentPlayer === 'woman' ? deckWoman : deckMan;
    if (currentDeck.length === 0) {
      switchTurn(true);
      return;
    }
    const card = currentDeck[0];
    setCurrentCard(card);
    
    if (currentPlayer === 'woman') {
      setDeckWoman(currentDeck.slice(1));
    } else {
      setDeckMan(currentDeck.slice(1));
    }
    setCardState('revealed');
  };

  const handleAccept = () => setCardState('executing');
  
  const handleReject = () => {
    setPlayers(prev => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], rejected: prev[currentPlayer].rejected + 1, score: prev[currentPlayer].score - 5 }
    }));
    switchTurn();
  };

  const handleComplete = () => {
    setCardState('reviewing');
  };

  const submitReview = (approved, extraPoints = 0) => {
    if (approved) {
      setPlayers(prev => ({
        ...prev,
        [currentPlayer]: { 
          ...prev[currentPlayer], 
          completed: prev[currentPlayer].completed + 1,
          score: prev[currentPlayer].score + currentCard.points + extraPoints 
        }
      }));
    }
    switchTurn();
  };

  const switchTurn = (forceSwitch = false) => {
    setCurrentCard(null);
    setCardState('hidden');
    
    const nextPlayer = opponent;
    const nextDeck = nextPlayer === 'woman' ? deckWoman : deckMan;
    const currentDeck = currentPlayer === 'woman' ? deckWoman : deckMan;
    
    if (deckWoman.length === 0 && deckMan.length === 0) {
      onFinish();
      return;
    }
    
    if (nextDeck.length === 0 && currentDeck.length > (forceSwitch ? 0 : 1)) {
       return;
    }

    setCurrentPlayer(nextPlayer);
  };

  const currentDeckLength = currentPlayer === 'woman' ? deckWoman.length : deckMan.length;

  const CardBack = ({ rotation, offsetX, isFront, children }) => (
    <motion.div 
      initial={{ rotate: 0, x: 0 }}
      animate={{ rotate: rotation, x: offsetX }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      style={{
        width: '100%', height: '100%',
        position: 'absolute',
        background: `linear-gradient(135deg, rgba(30,10,50,0.95), rgba(10,0,20,1))`,
        border: `3px solid ${activeColor}`,
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isFront ? `0 20px 40px ${activeGlow}` : '0 10px 20px rgba(0,0,0,0.5)',
        zIndex: isFront ? 3 : 1,
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
      }}
    >
      <div style={{ 
        width: '85%', height: '90%', 
        border: `2px solid rgba(255,255,255,0.1)`, 
        borderRadius: '12px', 
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
      background: activeBg,
      transition: 'background 1s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      padding: '40px 20px'
    }}>
      
      {/* Background Decor */}
      <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '4rem', opacity: 0.2 }}>💋</motion.div>
      <motion.div animate={{ y: [0, 30, 0], x: [0, -20, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 7, repeat: Infinity }} style={{ position: 'absolute', bottom: '15%', right: '10%', fontSize: '4rem', opacity: 0.2 }}>😈</motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity }} style={{ position: 'absolute', top: '40%', right: '5%', fontSize: '3rem' }}>🍑</motion.div>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', zIndex: 10 }}>
        <motion.h2 
          key={currentPlayer}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            color: 'white', fontSize: '3rem', fontWeight: '900', 
            textShadow: `0 5px 20px ${activeColor}`, textAlign: 'center',
            margin: 0
          }}
        >
          {players[currentPlayer].avatar} {players[currentPlayer].name}
        </motion.h2>
        
        {settings.duration > 0 && (
          <div style={{ 
            color: 'white', marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold', 
            background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: '20px',
            border: `1px solid ${activeColor}`, backdropFilter: 'blur(10px)',
            boxShadow: `0 5px 15px rgba(0,0,0,0.3)`
          }}>
            ⏱️ {formatTime(players[currentPlayer].timeRemaining)}
            {cardState === 'executing' ? ' (Zaman İşliyor)' : ''}
          </div>
        )}
      </div>

      {/* Main Play Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        
        <AnimatePresence mode="wait">
          {cardState === 'hidden' && (
            <motion.div
              key="deck"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0, rotateY: 90 }}
              onClick={drawCard}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '220px', height: '330px',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {currentDeckLength > 2 && <CardBack rotation={-12} offsetX={-30} isFront={false} />}
              {currentDeckLength > 1 && <CardBack rotation={-6} offsetX={-15} isFront={false} />}
              
              <CardBack rotation={0} offsetX={0} isFront={true}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '4rem', filter: `drop-shadow(0 0 10px ${activeColor})`, marginBottom: '10px' }}>🔥</span>
                  <h3 style={{ 
                    color: 'white', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', 
                    margin: 0, textShadow: `0 0 10px ${activeColor}`
                  }}>
                    GÖREV KARTI
                  </h3>
                  
                  {/* Cards Remaining Badge */}
                  <div style={{ 
                    position: 'absolute', bottom: '20px', right: '20px',
                    background: activeColor, color: 'white',
                    padding: '8px 16px', borderRadius: '20px',
                    fontWeight: '900', fontSize: '1rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {currentDeckLength} KART
                  </div>
                </div>
              </CardBack>
            </motion.div>
          )}

          {(cardState === 'revealed' || cardState === 'executing') && currentCard && (
            <motion.div
              key="card"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              style={{
                width: '300px', minHeight: '420px',
                background: 'white', color: 'black',
                borderRadius: '24px', padding: '30px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                border: `4px solid ${activeColor}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
                <span style={{ fontWeight: '900', textTransform: 'uppercase', color: activeColor, fontSize: '0.9rem' }}>
                  {CATEGORY_NAMES[currentCard.category] || currentCard.category}
                </span>
                <span style={{ fontWeight: '900', color: '#555', fontSize: '0.9rem' }}>{currentCard.points} PUAN</span>
              </div>
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', textAlign: 'center', color: '#111', marginBottom: '15px' }}>
                {currentCard.title}
              </h2>
              
              <p style={{ fontSize: '1.2rem', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', lineHeight: 1.5 }}>
                {currentCard.text}
              </p>

              {cardState === 'revealed' && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleReject} style={{ flex: 1, padding: '15px', background: '#d00000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', boxShadow: '0 10px 20px rgba(208,0,0,0.3)', cursor: 'pointer' }}>REDDET</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleAccept} style={{ flex: 1, padding: '15px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', boxShadow: '0 10px 20px rgba(43,147,72,0.3)', cursor: 'pointer' }}>KABUL ET</motion.button>
                </div>
              )}

              {cardState === 'executing' && (
                <div style={{ marginTop: '30px' }}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleComplete} style={{ width: '100%', padding: '18px', background: activeColor, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', boxShadow: `0 10px 20px ${activeColor}50`, cursor: 'pointer' }}>
                    GÖREVİ BİTİRDİM ✅
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {cardState === 'reviewing' && (
            <motion.div
              key="review"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ 
                background: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '30px', 
                width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: `4px solid ${activeColor}`, textAlign: 'center'
              }}
            >
              <h3 style={{ color: opponent === 'woman' ? '#9d4edd' : '#ff7900', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '900' }}>
                {players[opponent].name} Onayı
              </h3>
              
              <p style={{ marginBottom: '30px', fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>
                Görev başarıyla tamamlandı mı?
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => submitReview(true, 2)} style={{ padding: '18px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(43,147,72,0.3)' }}>
                  EVET (+Jest Puanı)
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => submitReview(false)} style={{ padding: '18px', background: '#d00000', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(208,0,0,0.3)' }}>
                  HAYIR (0 Puan)
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Footer Stats - Sadece Jokerleri ve Tamamlananları Göster, Puanı Gizle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 'bold' }}>Red Edilen</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffb3c6' }}>{players[currentPlayer].rejected}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 'bold', marginBottom: '5px' }}>Jokerler</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(settings.jokerCount)].map((_, i) => (
               <div key={i} style={{ width: '15px', height: '15px', background: i < players[currentPlayer].jokers ? 'white' : 'rgba(255,255,255,0.2)', borderRadius: '50%', boxShadow: i < players[currentPlayer].jokers ? '0 0 10px white' : 'none' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 'bold' }}>Tamamlanan</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#b7e4c7' }}>{players[currentPlayer].completed}</span>
        </div>
      </div>
    </div>
  );
};

export default Game;
