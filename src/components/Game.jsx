import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_CARDS } from '../data/cards';

const Game = ({ players, setPlayers, startingPlayer, onFinish, settings }) => {
  const [currentPlayer, setCurrentPlayer] = useState(startingPlayer);
  // Kadın ve Erkek için ayrı desteler oluştur
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

  const activeColor = currentPlayer === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)';
  const activeGlow = currentPlayer === 'woman' ? 'var(--color-purple-glow)' : 'var(--color-orange-glow)';
  const opponent = currentPlayer === 'woman' ? 'man' : 'woman';

  // Sayaç Mantığı
  useEffect(() => {
    if (settings.duration <= 0) return;
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
  }, [currentPlayer, settings.duration, setPlayers]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const drawCard = () => {
    const currentDeck = currentPlayer === 'woman' ? deckWoman : deckMan;
    if (currentDeck.length === 0) {
      switchTurn(true); // O anki oyuncunun destesi bittiyse diğerine geç, ikisi de bittiyse bitir
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
    
    // Eğer sıradaki oyuncunun destesi bittiyse, ama diğerinin bitmediyse diğerine geçmeye devam et
    if (nextDeck.length === 0 && currentDeck.length > (forceSwitch ? 0 : 1)) {
       // Sırayı değiştirme, aynı oyuncu devam etsin
       return;
    }

    setCurrentPlayer(nextPlayer);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(circle at top, ${activeGlow} 0%, var(--color-bg) 60%)`,
      transition: 'background 0.5s ease',
      display: 'flex', flexDirection: 'column', padding: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: activeColor, fontSize: '1.5rem', fontWeight: 'bold' }}>{players[currentPlayer].name} Sırası</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="glass" style={{ padding: '8px 16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Puan: {players[currentPlayer].score}
          </div>
          {settings.duration > 0 && (
            <div style={{ 
              color: players[currentPlayer].timeRemaining < 60 ? '#ff3333' : '#ffb3d1', 
              marginTop: '5px', fontSize: '1.2rem', fontWeight: 'bold', 
              background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '12px',
              border: `1px solid ${players[currentPlayer].timeRemaining < 60 ? '#ff3333' : activeColor}`
            }}>
              ⏱️ {formatTime(players[currentPlayer].timeRemaining)}
            </div>
          )}
        </div>
      </div>

      {/* Main Play Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <AnimatePresence mode="wait">
          {cardState === 'hidden' && (
            <motion.div
              key="deck"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0, rotateY: 90 }}
              onClick={drawCard}
              style={{
                width: '240px', height: '360px',
                background: 'linear-gradient(135deg, #2a2a35, #1a1a25)',
                border: `2px solid ${activeColor}`,
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: `0 0 30px ${activeGlow}`
              }}
            >
              <div style={{ opacity: 0.5, border: '2px dashed rgba(255,255,255,0.2)', width: '90%', height: '94%', borderRadius: '12px' }} />
            </motion.div>
          )}

          {(cardState === 'revealed' || cardState === 'executing') && currentCard && (
            <motion.div
              key="card"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              style={{
                width: '280px', minHeight: '400px',
                background: 'white', color: 'black',
                borderRadius: '16px', padding: '24px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: activeColor }}>{currentCard.type}</span>
                <span style={{ fontWeight: 'bold' }}>{currentCard.points} Puan</span>
              </div>
              
              <h3 style={{ fontSize: '1.5rem', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentCard.text}
              </h3>

              {cardState === 'revealed' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={handleReject} style={{ flex: 1, padding: '15px', background: 'var(--color-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>REDDET</button>
                  <button onClick={handleAccept} style={{ flex: 1, padding: '15px', background: 'var(--color-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>KABUL ET</button>
                </div>
              )}

              {cardState === 'executing' && (
                <div style={{ marginTop: '20px' }}>
                  <button onClick={handleComplete} style={{ width: '100%', padding: '15px', background: activeColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                    GÖREVİ BİTİRDİM
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {cardState === 'reviewing' && (
            <motion.div
              key="review"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel"
              style={{ padding: '24px', width: '90%', maxWidth: '400px' }}
            >
              <h3 style={{ color: opponent === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)', textAlign: 'center', marginBottom: '20px' }}>
                {players[opponent].name} Onayı
              </h3>
              
              <p style={{ textAlign: 'center', marginBottom: '20px' }}>Görev başarıyla tamamlandı mı?</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => submitReview(false)} style={{ flex: 1, padding: '12px', background: 'var(--color-red)', color: 'white', border: 'none', borderRadius: '8px' }}>Hayır</button>
                <button onClick={() => submitReview(true, 2)} style={{ flex: 1, padding: '12px', background: 'var(--color-green)', color: 'white', border: 'none', borderRadius: '8px' }}>Evet (+ Jest Puanı)</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Footer Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Red Edilen</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-red)' }}>{players[currentPlayer].rejected}</span>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[...Array(settings.jokerCount)].map((_, i) => (
             <div key={i} style={{ width: '30px', height: '40px', background: i < players[currentPlayer].jokers ? activeColor : '#333', borderRadius: '4px' }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Tamamlanan</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-green)' }}>{players[currentPlayer].completed}</span>
        </div>
      </div>
    </div>
  );
};

export default Game;
