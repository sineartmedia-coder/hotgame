import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_CARDS, MOCK_PENALTIES } from '../data/cards';
import { useMultiplayer } from '../context/MultiplayerContext';

const CATEGORY_NAMES = {
  erotik: 'Erotik', igrenc: 'İğrenç', zor: 'Zor',
  sureli: 'Süreli', sayili: 'Sayılı', ortak: 'Ortak',
  mini: 'Mini Oyun', cift: 'Çift', tekli: 'Tekli', soru: 'Soru'
};

// ─── Mini deste bileşeni (footer için) ───────────────────────────────────────
const MiniDeck = ({ count, color, icon, label }) => (
  <motion.div
    whileHover={count > 0 ? { y: -8, scale: 1.05 } : {}}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
  >
    <div style={{ position: 'relative', width: '70px', height: '100px' }}>
      {count > 1 && <div style={{ position: 'absolute', top: 0, left: '-7px', width: '70px', height: '100px', background: `${color}55`, border: `2px solid ${color}88`, borderRadius: '12px', transform: 'rotate(-6deg)' }} />}
      {count > 2 && <div style={{ position: 'absolute', top: 0, left: '7px', width: '70px', height: '100px', background: `${color}44`, border: `2px solid ${color}66`, borderRadius: '12px', transform: 'rotate(5deg)' }} />}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '70px', height: '100px',
        background: `linear-gradient(135deg, ${color}33, ${color}66)`,
        border: `2.5px solid ${color}`, borderRadius: '12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 20px ${color}50`
      }}>
        <span style={{ fontSize: '1.8rem' }}>{icon}</span>
        <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: '900', marginTop: '4px', opacity: 0.9 }}>
          {count > 0 ? `${count} ADET` : 'BOŞ'}
        </span>
        {count > 0 && (
          <div style={{
            position: 'absolute', top: '-10px', right: '-10px',
            background: color, color: 'white', width: '26px', height: '26px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: '900', boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
            border: '2px solid white'
          }}>{count}</div>
        )}
      </div>
    </div>
    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>{label}</span>
  </motion.div>
);

// ─── Bekleme Animasyonu ───────────────────────────────────────────────────────
const WaitingOverlay = ({ opponentName, opponentAvatar }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '20px', padding: '40px 20px',
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: '4rem' }}
    >
      {opponentAvatar}
    </motion.div>

    <div style={{
      background: 'rgba(0,0,0,0.5)', borderRadius: '20px',
      padding: '20px 32px', border: '1.5px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)', textAlign: 'center',
    }}>
      <p style={{ color: 'rgba(255,200,220,0.9)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '12px' }}>
        ⏳ {opponentName} hamle yapıyor...
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ y: [0,-12,0], opacity: [0.3,1,0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff3c78, #9d4edd)',
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
const Game = ({ players, setPlayers, startingPlayer, onFinish, settings }) => {
  const { localPlayer, sendData, onData, role } = useMultiplayer();
  const [currentPlayer, setCurrentPlayer] = useState(startingPlayer);

  const createDeck = (targetGender) => {
    const enabled = MOCK_CARDS.filter(card => {
      if (card.target !== targetGender) return false;
      if (!settings.categories[card.category]) return false;
      if (settings.disabledTasks.includes(card.id)) return false;
      return true;
    }).sort(() => Math.random() - 0.5);
    const limit = settings.deckSize > 0 ? settings.deckSize : enabled.length;
    return enabled.slice(0, limit);
  };

  const [deckWoman, setDeckWoman] = useState(() => createDeck('woman'));
  const [deckMan,   setDeckMan]   = useState(() => createDeck('man'));
  const [currentCard, setCurrentCard] = useState(null);
  // hidden | revealed | executing | reviewing | rejectWho | resolving | waitingReview
  const [cardState, setCardState] = useState('hidden');
  const [resolveDir, setResolveDir] = useState(null);
  const [showJokerModal, setShowJokerModal] = useState(false);
  const [jokerNotice, setJokerNotice] = useState(null);

  // For opponent's active card display (timed/turn-based cards)
  const [opponentActiveCard, setOpponentActiveCard] = useState(null);

  const isMyTurn = currentPlayer === localPlayer;
  const opponent = currentPlayer === 'woman' ? 'man' : 'woman';

  const activeColor = currentPlayer === 'woman' ? '#9d4edd' : '#ff7900';
  const activeGlow  = currentPlayer === 'woman' ? 'rgba(157,78,221,0.4)' : 'rgba(255,121,0,0.4)';
  const activeBg    = currentPlayer === 'woman'
    ? `radial-gradient(circle at top, ${activeGlow} 0%, #3c1053 100%)`
    : `radial-gradient(circle at top, ${activeGlow} 0%, #4a2100 100%)`;

  const isQuestion = currentCard?.category === 'soru';

  // Timer: only runs when I'm playing and card is in 'executing'
  useEffect(() => {
    if (settings.duration <= 0 || cardState !== 'executing' || !isMyTurn) return;
    const iv = setInterval(() => {
      setPlayers(prev => {
        const cur = prev[currentPlayer];
        if (cur.timeRemaining <= 0) return prev;
        return { ...prev, [currentPlayer]: { ...cur, timeRemaining: cur.timeRemaining - 1 } };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [currentPlayer, settings.duration, cardState, setPlayers, isMyTurn]);

  const fmt = s => s <= 0 ? '0:00' : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  // ── Data Sync ──────────────────────────────────────────────────────────────
  const handleData = useCallback((data) => {
    switch (data.type) {
      case 'cardDrawn':
        // Remote player drew a card — update our view of remote deck
        break;

      case 'taskAction':
        // Remote player accepted/rejected card — update state on this device
        if (data.action === 'accept') {
          setCardState('executing');
          setCurrentCard(data.card);
        } else if (data.action === 'reject') {
          setCardState('rejectWho');
          setCurrentCard(data.card);
        }
        break;

      case 'rejectWhoResult':
        // Remote player said who rejected
        {
          const target = data.who === 'self' ? currentPlayer : opponent;
          setPlayers(prev => ({
            ...prev,
            [target]: { ...prev[target], rejected: prev[target].rejected + 1, score: prev[target].score - 5 }
          }));
          fly('reject', data.card);
        }
        break;

      case 'taskComplete':
        // Remote player finished task — show review request on MY screen
        setCurrentCard(data.card);
        setCardState('reviewing');
        break;

      case 'reviewResult':
        // I sent review result, remote got it — or remote sent to me
        if (data.approved) {
          setPlayers(prev => ({
            ...prev,
            [currentPlayer]: {
              ...prev[currentPlayer],
              completed: prev[currentPlayer].completed + 1,
              score: prev[currentPlayer].score + (data.card?.points || 0) + 2
            }
          }));
          fly('complete', data.card);
        } else {
          fly('reject', data.card);
        }
        break;

      case 'answerResult':
        // For question cards — remote answered
        if (data.answered) {
          setPlayers(prev => ({
            ...prev,
            [currentPlayer]: {
              ...prev[currentPlayer],
              completed: prev[currentPlayer].completed + 1,
              score: prev[currentPlayer].score + (data.card?.points || 0)
            }
          }));
          fly('complete', data.card);
        } else {
          fly('reject', data.card);
        }
        break;

      case 'jokerUsed':
        setJokerNotice({ player: data.player, name: data.name, avatar: data.avatar });
        setPlayers(prev => ({
          ...prev,
          [data.player]: { ...prev[data.player], jokers: prev[data.player].jokers - 1 }
        }));
        fly('joker', data.card);
        setTimeout(() => setJokerNotice(null), 4000);
        break;

      case 'turnSwitch':
        setCurrentPlayer(data.nextPlayer);
        setCardState('hidden');
        setCurrentCard(null);
        break;

      case 'activeCard':
        setOpponentActiveCard(data.card);
        break;

      case 'playerUpdate':
        // Sync score update from remote
        setPlayers(prev => ({
          ...prev,
          [data.playerKey]: { ...prev[data.playerKey], ...data.stats }
        }));
        break;

      case 'gameOver':
        onFinish();
        break;

      case 'deckSync':
        // Opponent's deck sizes (informational)
        break;

      default:
        break;
    }
  }, [currentPlayer, opponent, setPlayers, onFinish]);

  useEffect(() => {
    const unsub = onData(handleData);
    return unsub;
  }, [onData, handleData]);

  // ── Card Actions ───────────────────────────────────────────────────────────
  const drawCard = () => {
    const deck = currentPlayer === 'woman' ? deckWoman : deckMan;
    if (!deck.length) { doSwitch(true); return; }
    const card = deck[0];
    setCurrentCard(card);
    if (currentPlayer === 'woman') setDeckWoman(deck.slice(1));
    else setDeckMan(deck.slice(1));
    setCardState('revealed');
    sendData({ type: 'cardDrawn', card, player: localPlayer });
  };

  const handleAccept = () => {
    setCardState('executing');
    sendData({ type: 'taskAction', action: 'accept', card: currentCard });
  };

  const handleRejectClick = () => {
    setCardState('rejectWho');
    sendData({ type: 'taskAction', action: 'reject', card: currentCard });
  };

  const handleRejectWho = (who) => {
    const target = who === 'self' ? currentPlayer : opponent;
    setPlayers(prev => ({
      ...prev,
      [target]: { ...prev[target], rejected: prev[target].rejected + 1, score: prev[target].score - 5 }
    }));
    sendData({ type: 'rejectWhoResult', who, card: currentCard });
    fly('reject', currentCard);
  };

  const handleAnswer = (answered) => {
    if (answered) {
      setPlayers(prev => ({
        ...prev,
        [currentPlayer]: {
          ...prev[currentPlayer],
          completed: prev[currentPlayer].completed + 1,
          score: prev[currentPlayer].score + currentCard.points
        }
      }));
      sendData({ type: 'answerResult', answered: true, card: currentCard });
      fly('complete', currentCard);
    } else {
      sendData({ type: 'answerResult', answered: false, card: currentCard });
      fly('reject', currentCard);
    }
  };

  const handleComplete = () => {
    // Ask opponent for review
    setCardState('waitingReview');
    sendData({ type: 'taskComplete', card: currentCard });
  };

  // Called on MY device when I'm reviewing the opponent's task
  const submitReview = (approved) => {
    sendData({ type: 'reviewResult', approved, card: currentCard });
    setCardState('hidden');
    setCurrentCard(null);
    if (approved) {
      // Update local opponent score display
      setPlayers(prev => ({
        ...prev,
        [currentPlayer]: {
          ...prev[currentPlayer],
          completed: prev[currentPlayer].completed + 1,
          score: prev[currentPlayer].score + (currentCard?.points || 0) + 2
        }
      }));
    }
    // Turn switch sent by the active player after receiving review
  };

  const fly = (dir, card) => {
    setResolveDir(dir);
    setCardState('resolving');
    setTimeout(() => {
      setCardState('hidden');
      setCurrentCard(null);
      setResolveDir(null);
      doSwitch();
    }, 700);
  };

  const handleUseJoker = () => {
    if (players[currentPlayer].jokers <= 0) return;
    setPlayers(prev => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], jokers: prev[currentPlayer].jokers - 1 }
    }));
    setJokerNotice({ player: currentPlayer, name: players[currentPlayer].name, avatar: players[currentPlayer].avatar });
    sendData({
      type: 'jokerUsed',
      player: currentPlayer,
      name: players[currentPlayer].name,
      avatar: players[currentPlayer].avatar,
      card: currentCard,
    });
    setShowJokerModal(false);
    fly('joker', currentCard);
    setTimeout(() => setJokerNotice(null), 4000);
  };

  const doSwitch = (force = false) => {
    const nextDeck = opponent === 'woman' ? deckWoman : deckMan;
    const curDeck  = currentPlayer === 'woman' ? deckWoman : deckMan;
    if (deckWoman.length === 0 && deckMan.length === 0) {
      sendData({ type: 'gameOver' });
      onFinish();
      return;
    }
    if (nextDeck.length === 0 && curDeck.length > (force ? 0 : 1)) return;
    const next = opponent;
    setCurrentPlayer(next);
    sendData({ type: 'turnSwitch', nextPlayer: next });
  };

  const deckLen = currentPlayer === 'woman' ? deckWoman.length : deckMan.length;

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
        width: '85%', height: '90%', border: `2px solid rgba(255,255,255,0.1)`,
        borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle, ${activeGlow} 0%, transparent 70%)`
      }}>
        {children}
      </div>
    </motion.div>
  );

  const cardExitVariants = {
    reject:   { x: -300, y: 400, scale: 0.1, opacity: 0, rotate: -30 },
    complete: { x:  300, y: 400, scale: 0.1, opacity: 0, rotate:  30 },
    joker:    { y: -500, scale: 0, opacity: 0, rotate: 20 },
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%', background: activeBg, transition: 'background 1s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      padding: '24px 20px 16px'
    }}>
      {/* BG Decor */}
      <motion.div animate={{ y:[0,-30,0], rotate:[0,10,-10,0] }} transition={{ duration:6, repeat:Infinity }}
        style={{ position:'absolute', top:'10%', left:'5%', fontSize:'3.5rem', opacity:0.12, pointerEvents:'none' }}>💋</motion.div>
      <motion.div animate={{ y:[0,30,0], rotate:[0,-15,15,0] }} transition={{ duration:7, repeat:Infinity }}
        style={{ position:'absolute', bottom:'22%', right:'8%', fontSize:'3.5rem', opacity:0.12, pointerEvents:'none' }}>😈</motion.div>

      {/* ── Joker Bildirim Banneri ────────────────────────────────────────── */}
      <AnimatePresence>
        {jokerNotice && (
          <motion.div
            initial={{ y:-60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-60, opacity:0 }}
            style={{
              position:'absolute', top:10, left:'50%', transform:'translateX(-50%)',
              background:'linear-gradient(135deg,#f5af19,#f12711)',
              color:'white', padding:'12px 28px', borderRadius:'30px', zIndex:30,
              fontWeight:'900', fontSize:'1rem', textAlign:'center',
              boxShadow:'0 8px 25px rgba(245,175,25,0.6)', border:'2px solid white',
              whiteSpace:'nowrap'
            }}
          >
            🃏 {jokerNotice.avatar} {jokerNotice.name} JOKER KULLANDI!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Opponent Active Card Badge ─────────────────────────────────── */}
      <AnimatePresence>
        {opponentActiveCard && (
          <motion.div
            initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 25,
              background: 'linear-gradient(135deg, rgba(157,78,221,0.9), rgba(255,60,120,0.9))',
              borderRadius: '14px', padding: '10px 14px',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              maxWidth: '160px',
            }}
          >
            <p style={{ color: 'white', fontSize: '0.7rem', fontWeight: '900', margin: '0 0 4px', opacity: 0.8, textTransform: 'uppercase' }}>
              Rakibin Aktif Kartı
            </p>
            <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: '700', margin: 0 }}>
              {opponentActiveCard.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        marginBottom:'1.2rem', zIndex:10,
        marginTop: jokerNotice ? '50px' : '0', transition:'margin 0.3s'
      }}>
        <motion.h2
          key={currentPlayer} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
          style={{ color:'white', fontSize:'2.4rem', fontWeight:'900', textShadow:`0 5px 20px ${activeColor}`, textAlign:'center', margin:0 }}
        >
          {players[currentPlayer].avatar} {players[currentPlayer].name}
          {isMyTurn && <span style={{ fontSize:'1rem', marginLeft:'10px', opacity:0.7 }}>(Sen)</span>}
        </motion.h2>
        {settings.duration > 0 && (
          <div style={{
            color: cardState === 'executing' && players[currentPlayer].timeRemaining < 30 ? '#ff4444' : 'white',
            marginTop:'6px', fontSize:'1rem', fontWeight:'bold',
            background:'rgba(0,0,0,0.4)', padding:'5px 16px', borderRadius:'20px',
            border:`1px solid ${activeColor}`, backdropFilter:'blur(10px)', transition:'color 0.3s'
          }}>
            ⏱️ {fmt(players[currentPlayer].timeRemaining)}
            {cardState === 'executing' ? ' — Sayıyor!' : ' — Bekliyor'}
          </div>
        )}
      </div>

      {/* ── Oyun Alanı ──────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10 }}>
        <AnimatePresence mode="wait">

          {/* ── BENİM SIRAM DEĞİL — Bekleme ── */}
          {!isMyTurn && cardState === 'hidden' && (
            <motion.div key="waiting-turn"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            >
              <WaitingOverlay
                opponentName={players[currentPlayer].name}
                opponentAvatar={players[currentPlayer].avatar}
              />
            </motion.div>
          )}

          {/* ── Review request arrives on MY screen (opponent finished task) ── */}
          {cardState === 'reviewing' && !isMyTurn && currentCard && (
            <motion.div key="review-incoming"
              initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }}
              style={{
                background:'rgba(255,255,255,0.97)', padding:'36px', borderRadius:'28px',
                width:'90%', maxWidth:'380px', boxShadow:'0 20px 50px rgba(0,0,0,0.5)',
                border:`4px solid ${activeColor}`, textAlign:'center'
              }}
            >
              <h3 style={{ color: activeColor, marginBottom:'16px', fontSize:'1.4rem', fontWeight:'900' }}>
                {players[currentPlayer].avatar} {players[currentPlayer].name} Onayı Bekliyor
              </h3>
              <p style={{ marginBottom:'10px', fontSize:'1rem', color:'#555' }}>{currentCard.text}</p>
              <p style={{ marginBottom:'28px', fontSize:'1.1rem', color:'#333', fontWeight:'bold' }}>Görev başarıyla tamamlandı mı?</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => submitReview(true)}
                  style={{ padding:'16px', background:'#2b9348', color:'white', border:'none', borderRadius:'14px', fontWeight:'900', fontSize:'1.05rem', cursor:'pointer' }}>
                  ✅ EVET — Tamamladı!
                </motion.button>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => submitReview(false)}
                  style={{ padding:'16px', background:'#d00000', color:'white', border:'none', borderRadius:'14px', fontWeight:'900', fontSize:'1.05rem', cursor:'pointer' }}>
                  ❌ HAYIR — Tamamlayamadı
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── BENİM SIRAM — Deste ── */}
          {cardState === 'hidden' && isMyTurn && (
            <motion.div key="deck"
              initial={{ scale:0.8, opacity:0, y:30 }} animate={{ scale:1, opacity:1, y:0 }}
              exit={{ opacity:0, scale:1.1 }}
              onClick={drawCard} whileHover={{ y:-10 }} whileTap={{ scale:0.95 }}
              style={{ width:'200px', height:'300px', position:'relative', cursor:'pointer' }}
            >
              {deckLen > 2 && <CardBack rotation={-12} offsetX={-28} isFront={false} />}
              {deckLen > 1 && <CardBack rotation={-6}  offsetX={-14} isFront={false} />}
              <CardBack rotation={0} offsetX={0} isFront={true}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <span style={{ fontSize:'3.5rem', filter:`drop-shadow(0 0 10px ${activeColor})`, marginBottom:'8px' }}>🔥</span>
                  <h3 style={{ color:'white', fontSize:'1.2rem', fontWeight:'900', letterSpacing:'2px', margin:0, textShadow:`0 0 10px ${activeColor}`, textAlign:'center' }}>GÖREV KARTI</h3>
                  <div style={{
                    position:'absolute', bottom:'16px', right:'16px',
                    background:activeColor, color:'white', padding:'6px 12px', borderRadius:'16px',
                    fontWeight:'900', fontSize:'0.85rem', border:'2px solid rgba(255,255,255,0.2)'
                  }}>{deckLen} KART</div>
                </div>
              </CardBack>
            </motion.div>
          )}

          {/* ── Kart Açık (revealed / executing / rejectWho) — MY TURN ── */}
          {isMyTurn && (cardState === 'revealed' || cardState === 'executing' || cardState === 'rejectWho') && currentCard && (
            <motion.div key="card-open"
              initial={{ scale:0.8, opacity:0, rotateY:-90 }} animate={{ scale:1, opacity:1, rotateY:0 }}
              style={{
                width:'300px', minHeight:'400px', background:'white', color:'black',
                borderRadius:'24px', padding:'28px', display:'flex', flexDirection:'column',
                boxShadow:'0 30px 60px rgba(0,0,0,0.5)', border:`4px solid ${activeColor}`
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px', borderBottom:'2px solid #f0f0f0', paddingBottom:'12px' }}>
                <span style={{ fontWeight:'900', textTransform:'uppercase', color:activeColor, fontSize:'0.85rem' }}>
                  {CATEGORY_NAMES[currentCard.category] || currentCard.category}
                </span>
                <span style={{ fontWeight:'900', color:'#555', fontSize:'0.85rem' }}>{currentCard.points} PUAN</span>
              </div>
              {currentCard.title && <h2 style={{ fontSize:'1.5rem', fontWeight:'900', textAlign:'center', color:'#111', marginBottom:'12px' }}>{currentCard.title}</h2>}
              <p style={{ fontSize:'1.1rem', textAlign:'center', flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#333', lineHeight:1.6 }}>
                {currentCard.text}
              </p>

              {/* Revealed buttons */}
              {cardState === 'revealed' && !isQuestion && (
                <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
                  <motion.button whileTap={{ scale:0.95 }} onClick={handleRejectClick}
                    style={{ flex:1, padding:'14px', background:'#d00000', color:'white', border:'none', borderRadius:'12px', fontWeight:'900', cursor:'pointer' }}>❌ REDDET</motion.button>
                  <motion.button whileTap={{ scale:0.95 }} onClick={handleAccept}
                    style={{ flex:1, padding:'14px', background:'#2b9348', color:'white', border:'none', borderRadius:'12px', fontWeight:'900', cursor:'pointer' }}>✅ KABUL</motion.button>
                </div>
              )}

              {/* Soru kartı */}
              {cardState === 'revealed' && isQuestion && (
                <div style={{ display:'flex', gap:'12px', marginTop:'24px', flexDirection:'column' }}>
                  <p style={{ textAlign:'center', color:'#888', fontSize:'0.9rem', margin:0 }}>Soruyu cevapladın mı?</p>
                  <div style={{ display:'flex', gap:'12px' }}>
                    <motion.button whileTap={{ scale:0.95 }} onClick={() => handleAnswer(false)}
                      style={{ flex:1, padding:'14px', background:'#d00000', color:'white', border:'none', borderRadius:'12px', fontWeight:'900', cursor:'pointer' }}>❌ HAYIR</motion.button>
                    <motion.button whileTap={{ scale:0.95 }} onClick={() => handleAnswer(true)}
                      style={{ flex:1, padding:'14px', background:'#2b9348', color:'white', border:'none', borderRadius:'12px', fontWeight:'900', cursor:'pointer' }}>✅ EVET</motion.button>
                  </div>
                </div>
              )}

              {/* Kim Reddetti */}
              {cardState === 'rejectWho' && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  style={{ marginTop:'20px', padding:'16px', background:'#fff3f3', borderRadius:'16px', border:'2px solid #d00000' }}>
                  <p style={{ fontWeight:'900', textAlign:'center', color:'#d00000', marginBottom:'14px', fontSize:'1rem' }}>Kim Reddetti?</p>
                  <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
                    <motion.button whileTap={{ scale:0.95 }} onClick={() => handleRejectWho('self')}
                      style={{ padding:'12px', background:'#d00000', color:'white', border:'none', borderRadius:'10px', fontWeight:'900', cursor:'pointer' }}>
                      {players[currentPlayer].avatar} Ben Reddettim
                    </motion.button>
                    <motion.button whileTap={{ scale:0.95 }} onClick={() => handleRejectWho('opponent')}
                      style={{ padding:'12px', background:'#555', color:'white', border:'none', borderRadius:'10px', fontWeight:'900', cursor:'pointer' }}>
                      {players[opponent].avatar} {players[opponent].name} Reddetti
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Görevi bitirdim */}
              {cardState === 'executing' && !isQuestion && (
                <motion.button whileTap={{ scale:0.95 }} onClick={handleComplete}
                  style={{ marginTop:'24px', width:'100%', padding:'16px', background:activeColor, color:'white', border:'none', borderRadius:'12px', fontWeight:'900', fontSize:'1.05rem', cursor:'pointer' }}>
                  ✅ GÖREVİ BİTİRDİM
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── Waiting for review result (I finished task, waiting for opponent) ── */}
          {cardState === 'waitingReview' && isMyTurn && (
            <motion.div key="waiting-review"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ textAlign:'center', padding:'40px 20px' }}
            >
              <motion.div
                animate={{ scale:[1,1.15,1] }}
                transition={{ duration:1.5, repeat:Infinity }}
                style={{ fontSize:'4rem', marginBottom:'20px' }}
              >
                {players[opponent]?.avatar}
              </motion.div>
              <div style={{
                background:'rgba(0,0,0,0.5)', borderRadius:'20px', padding:'20px 32px',
                border:'1.5px solid rgba(255,255,255,0.15)', backdropFilter:'blur(12px)'
              }}>
                <p style={{ color:'rgba(255,200,220,0.9)', fontWeight:'700', fontSize:'1.1rem', marginBottom:'12px' }}>
                  ⏳ {players[opponent]?.name} onayını bekliyor...
                </p>
                <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ y:[0,-12,0], opacity:[0.3,1,0.3] }}
                      transition={{ duration:0.8, repeat:Infinity, delay:i*0.2 }}
                      style={{ width:'12px', height:'12px', borderRadius:'50%',
                        background:'linear-gradient(135deg,#ff3c78,#9d4edd)' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Kart Uçuşu */}
          {cardState === 'resolving' && currentCard && (
            <motion.div key="resolving"
              initial={{ scale:1, opacity:1, x:0, y:0, rotate:0 }}
              animate={resolveDir ? cardExitVariants[resolveDir] : { opacity:0 }}
              transition={{ duration:0.6, ease:'easeIn' }}
              style={{
                width:'260px', minHeight:'340px', background:'white', borderRadius:'20px', padding:'24px',
                display:'flex', flexDirection:'column', boxShadow:'0 20px 40px rgba(0,0,0,0.4)',
                border:`4px solid ${resolveDir === 'complete' ? '#2b9348' : resolveDir === 'joker' ? '#f5af19' : '#d00000'}`
              }}
            >
              <h2 style={{ textAlign:'center', fontWeight:'900', fontSize:'1.4rem',
                color: resolveDir === 'complete' ? '#2b9348' : resolveDir === 'joker' ? '#f5af19' : '#d00000' }}>
                {resolveDir === 'complete' ? '✅ Tamamlandı!' : resolveDir === 'joker' ? '🃏 Joker!' : '❌ Reddedildi!'}
              </h2>
              <p style={{ textAlign:'center', flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#444' }}>{currentCard.text}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'flex-end',
        padding:'20px 24px 24px', background:'rgba(0,0,0,0.4)', borderRadius:'28px',
        backdropFilter:'blur(16px)', zIndex:10, marginTop:'12px',
        border:'1px solid rgba(255,255,255,0.1)'
      }}>
        <MiniDeck count={players[localPlayer]?.rejected || 0} color="#d00000" icon="❌" label="Reddedilen" />

        {/* Jokerler */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
          <div style={{ display:'flex', gap:'10px', alignItems:'flex-end' }}>
            {[...Array(settings.jokerCount)].map((_, i) => {
              const isActive = i < (players[localPlayer]?.jokers || 0);
              return (
                <motion.div key={i}
                  whileHover={isActive && isMyTurn ? { y:-12, scale:1.15 } : {}}
                  whileTap={isActive && isMyTurn ? { scale:0.9 } : {}}
                  onClick={isActive && isMyTurn ? () => setShowJokerModal(true) : undefined}
                  style={{
                    width:'52px', height:'76px',
                    background: isActive ? 'linear-gradient(135deg,#f5af19,#f12711)' : 'rgba(255,255,255,0.08)',
                    border: isActive ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                    borderRadius:'12px', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center', gap:'4px',
                    fontSize:'1.7rem', cursor: isActive && isMyTurn ? 'pointer' : 'default',
                    boxShadow: isActive ? '0 8px 20px rgba(245,175,25,0.6)' : 'none',
                    transition:'all 0.3s',
                    filter: isActive ? 'none' : 'grayscale(1) opacity(0.25)'
                  }}
                >
                  🃏
                  {isActive && isMyTurn && <span style={{ fontSize:'0.55rem', color:'white', fontWeight:'900' }}>KULLAN</span>}
                </motion.div>
              );
            })}
          </div>
          <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.85)', fontWeight:'900', textTransform:'uppercase', letterSpacing:'1px' }}>
            JOKER ({players[localPlayer]?.jokers || 0}/{settings.jokerCount})
          </span>
        </div>

        <MiniDeck count={players[localPlayer]?.completed || 0} color="#2b9348" icon="✅" label="Tamamlanan" />
      </div>

      {/* ── JOKER MODAL ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showJokerModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowJokerModal(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:50, backdropFilter:'blur(4px)' }} />
            <motion.div
              initial={{ scale:0, rotate:-10, opacity:0 }}
              animate={{ scale:1, rotate:0, opacity:1 }}
              exit={{ scale:0, rotate:10, opacity:0 }}
              transition={{ type:'spring', bounce:0.5 }}
              style={{
                position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                width:'280px', background:'linear-gradient(135deg,#f5af19,#f12711)',
                borderRadius:'28px', padding:'36px 28px', zIndex:51,
                textAlign:'center', boxShadow:'0 30px 80px rgba(0,0,0,0.6)', border:'4px solid white'
              }}
            >
              <div style={{ fontSize:'4rem', marginBottom:'12px' }}>🃏</div>
              <h2 style={{ color:'white', fontWeight:'900', fontSize:'1.8rem', margin:0 }}>JOKER!</h2>
              <p style={{ color:'rgba(255,255,255,0.9)', margin:'10px 0 24px', lineHeight:1.5 }}>
                Aktif kartı <strong>ceza almadan</strong> atla. Sıra rakibine geçer ve ikisi de bu bildirimi görür.
              </p>
              <div style={{ display:'flex', gap:'12px' }}>
                <motion.button whileTap={{ scale:0.9 }} onClick={() => setShowJokerModal(false)}
                  style={{ flex:1, padding:'14px', background:'rgba(0,0,0,0.3)', color:'white', border:'2px solid white', borderRadius:'14px', fontWeight:'900', cursor:'pointer' }}>GERİ</motion.button>
                <motion.button whileTap={{ scale:0.9 }} onClick={handleUseJoker}
                  style={{ flex:1, padding:'14px', background:'white', color:'#f12711', border:'none', borderRadius:'14px', fontWeight:'900', cursor:'pointer' }}>KULLAN ✨</motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
