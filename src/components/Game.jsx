import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_CARDS } from '../data/cards';
import { dealGame, canPlayCard, cardScore, CARD_TYPES, COLOR_HEX, COLOR_DARK, UNO_COLORS, shuffle } from '../data/unoDeck';
import { useMultiplayer } from '../context/MultiplayerContext';

// ─── Renk seçici modal ───────────────────────────────────────────────────────
const ColorPicker = ({ onSelect }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
    style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)', zIndex: 100,
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: 'white', fontWeight: '900', fontSize: '1.3rem', marginBottom: '24px' }}>
        🌈 Renk Seç
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {UNO_COLORS.map(color => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.15, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(color)}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: COLOR_HEX[color],
              border: '4px solid white',
              boxShadow: `0 8px 25px ${COLOR_HEX[color]}88`,
              cursor: 'pointer', fontSize: '1.5rem',
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Görev Modal (görev kartı atıldığında) ───────────────────────────────────
const TaskModal = ({ card, isAttacker, opponentName, opponentAvatar, onResult, onClose }) => {
  const taskData = card?.taskData;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)', zIndex: 100, padding: '20px',
      }}
    >
      <div style={{
        background: 'white', borderRadius: '28px', padding: '28px',
        maxWidth: '380px', width: '100%', textAlign: 'center',
        border: `4px solid ${isAttacker ? '#ff7900' : '#9d4edd'}`,
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
          {isAttacker ? '🔥' : opponentAvatar}
        </div>
        <h3 style={{
          color: isAttacker ? '#ff7900' : '#9d4edd',
          fontSize: '1.1rem', fontWeight: '900', marginBottom: '6px'
        }}>
          {isAttacker
            ? `${opponentName} için Görev!`
            : 'Sana Görev Geldi! 🎯'
          }
        </h3>

        <div style={{
          background: '#f9f9f9', borderRadius: '16px', padding: '16px',
          margin: '16px 0', border: '2px solid #eee'
        }}>
          {taskData?.title && (
            <p style={{ fontWeight: '900', fontSize: '1.2rem', color: '#111', marginBottom: '8px' }}>
              {taskData.title}
            </p>
          )}
          <p style={{ color: '#444', lineHeight: 1.6, fontSize: '1rem' }}>
            {taskData?.text}
          </p>
        </div>

        <div style={{
          background: '#fff3e0', borderRadius: '12px', padding: '12px',
          marginBottom: '20px', border: '1px solid #ffcc80'
        }}>
          <p style={{ color: '#e65100', fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>
            ✅ Yaparsa: <strong>+{card?.penaltyDo} kart</strong> çeker &nbsp;|&nbsp;
            ❌ Yapamazsa: <strong>+{card?.penaltyFail} kart</strong> çeker &nbsp;|&nbsp;
            🚫 Reddederse: <strong>+{card?.penaltyRefuse} kart</strong> çeker
          </p>
        </div>

        {/* Saldırgan: görevi gönder */}
        {isAttacker && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, #ff7900, #f5af19)',
              color: 'white', border: 'none', borderRadius: '14px',
              fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
            }}
          >
            ⚡ Görevi Gönder!
          </motion.button>
        )}

        {/* Savunan: yap / yapamadım / reddet */}
        {!isAttacker && onResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onResult('done')}
              style={{ padding: '14px', background: '#2b9348', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
              ✅ Yaptım! (+{card?.penaltyDo} kart)
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onResult('fail')}
              style={{ padding: '14px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
              😅 Yapamadım (+{card?.penaltyFail} kart)
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onResult('refuse')}
              style={{ padding: '14px', background: '#d00000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
              🚫 Reddediyorum (+{card?.penaltyRefuse} kart)
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── UNO Kartı Bileşeni ───────────────────────────────────────────────────────
const UnoCard = ({ card, onClick, isPlayable, isSmall, style }) => {
  if (!card) return null;

  const isTask = card.type === CARD_TYPES.TASK;
  const isWild = card.type === CARD_TYPES.WILD;
  const isSpecial = isTask || isWild || card.type === CARD_TYPES.SKIP || card.type === CARD_TYPES.REVERSE;

  const bgColor = isTask
    ? 'linear-gradient(135deg, #1a0033, #3c0060)'
    : isWild
    ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
    : `linear-gradient(135deg, ${COLOR_HEX[card.color]}, ${COLOR_DARK[card.color]})`;

  const cardW = isSmall ? 'clamp(38px,10vw,52px)' : 'clamp(52px,14vw,70px)';
  const cardH = isSmall ? 'clamp(56px,15vw,76px)' : 'clamp(76px,20vw,104px)';

  return (
    <motion.div
      whileHover={isPlayable ? { y: -12, scale: 1.08 } : {}}
      whileTap={isPlayable ? { scale: 0.92 } : {}}
      onClick={isPlayable ? onClick : undefined}
      style={{
        width: cardW, height: cardH, borderRadius: isSmall ? '8px' : '12px',
        background: bgColor,
        border: isPlayable
          ? '3px solid rgba(255,255,255,0.9)'
          : '2px solid rgba(255,255,255,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', cursor: isPlayable ? 'pointer' : 'default',
        boxShadow: isPlayable
          ? '0 8px 24px rgba(255,255,255,0.3)'
          : '0 3px 8px rgba(0,0,0,0.4)',
        transition: 'border 0.2s, box-shadow 0.2s',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Oval dekor */}
      {!isTask && (
        <div style={{
          position: 'absolute', width: '130%', height: '70%',
          background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
          transform: 'rotate(-30deg)',
        }} />
      )}

      {isTask ? (
        <>
          <span style={{ fontSize: isSmall ? '0.9rem' : '1.2rem', zIndex: 1 }}>🔥</span>
          <span style={{
            color: 'white', fontWeight: '900', fontSize: isSmall ? '0.55rem' : '0.75rem',
            zIndex: 1, marginTop: '2px', textAlign: 'center', letterSpacing: '0.5px',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}>GÖREV</span>
          <span style={{
            color: '#ffcc00', fontWeight: '900', fontSize: isSmall ? '0.7rem' : '0.95rem',
            zIndex: 1, textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}>{card.display}</span>
        </>
      ) : isWild ? (
        <span style={{ fontSize: isSmall ? '1.1rem' : '1.5rem', zIndex: 1 }}>🌈</span>
      ) : (
        <>
          {/* Sol üst */}
          <span style={{
            position: 'absolute', top: isSmall ? '3px' : '5px', left: isSmall ? '4px' : '7px',
            color: 'white', fontWeight: '900', fontSize: isSmall ? '0.6rem' : '0.8rem',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)', lineHeight: 1, zIndex: 1,
          }}>{card.display}</span>
          {/* Merkez */}
          <span style={{
            color: 'white', fontWeight: '900', fontSize: isSmall ? '1.1rem' : '1.7rem',
            textShadow: '0 2px 6px rgba(0,0,0,0.4)', zIndex: 1,
          }}>{card.display}</span>
          {/* Sağ alt */}
          <span style={{
            position: 'absolute', bottom: isSmall ? '3px' : '5px', right: isSmall ? '4px' : '7px',
            color: 'white', fontWeight: '900', fontSize: isSmall ? '0.6rem' : '0.8rem',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)', lineHeight: 1, zIndex: 1,
            transform: 'rotate(180deg)',
          }}>{card.display}</span>
        </>
      )}

      {/* Oynanabilir parlaması */}
      {isPlayable && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: 'rgba(255,255,255,0.15)',
          }}
        />
      )}
    </motion.div>
  );
};

// ─── Kart Arkası (rakibin kartları) ──────────────────────────────────────────
const CardBack = ({ count, color = '#9d4edd' }) => (
  <div style={{ display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
    {[...Array(Math.min(count, 5))].map((_, i) => (
      <div
        key={i}
        style={{
          width: 'clamp(36px,9vw,48px)', height: 'clamp(54px,14vw,72px)',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2d1b4e, #1a0033)',
          border: '2px solid rgba(157,78,221,0.5)',
          marginLeft: i === 0 ? 0 : '-22px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: i,
          backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(255,255,255,0.03) 6px,rgba(255,255,255,0.03) 12px)',
        }}
      >
        {i === 0 && <span style={{ fontSize: '0.9rem' }}>🔥</span>}
      </div>
    ))}
    {count > 5 && (
      <span style={{
        marginLeft: '8px', color: 'rgba(255,255,255,0.7)',
        fontSize: '0.85rem', fontWeight: '900',
      }}>+{count - 5}</span>
    )}
  </div>
);

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
const Game = ({ players, setPlayers, startingPlayer, onFinish, settings }) => {
  const { localPlayer, sendData, onData, role } = useMultiplayer();

  // Host oyunu başlatır ve desteler sync edilir
  const opponentGender = localPlayer === 'woman' ? 'man' : 'woman';

  // Oyun durumu
  const [myHand,       setMyHand]       = useState([]);
  const [theirHand,    setTheirHand]    = useState([]); // Kapalı gösterim için sayı yeterli
  const [theirCount,   setTheirCount]   = useState(0);
  const [drawPile,     setDrawPile]     = useState([]);
  const [discardPile,  setDiscardPile]  = useState([]);
  const [topCard,      setTopCard]      = useState(null);
  const [currentColor, setCurrentColor] = useState('kırmızı');
  const [isMyTurn,     setIsMyTurn]     = useState(false);
  const [gameStarted,  setGameStarted]  = useState(false);

  // UI durumu
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard,     setPendingCard]     = useState(null); // Wild atarken bekleyen kart
  const [taskModal,       setTaskModal]       = useState(null); // { card, isAttacker }
  const [pendingTaskCard, setPendingTaskCard] = useState(null); // Atılmış görev kartı, sonuç bekleniyor
  const [notification,   setNotification]    = useState(null); // Üst banner
  const [gameOver,        setGameOver]        = useState(null); // { winner, scores }
  const [animCard,        setAnimCard]        = useState(null); // Atılan kart animasyonu
  const [drawAnim,        setDrawAnim]        = useState(false);

  const drawPileRef = useRef([]);

  const showNotif = (msg, color = '#9d4edd') => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  // ─── Host oyunu başlatır ────────────────────────────────────────────────────
  useEffect(() => {
    if (!localPlayer || gameStarted) return;

    if (role === 'host') {
      // Host desteyi oluşturur ve guest'e gönderir
      const deckSize = settings.deckSize || 7;
      const taskCount = settings.taskCardCount ?? 3;
      const dealt = dealGame(deckSize, taskCount, localPlayer, MOCK_CARDS);

      setMyHand(dealt.myHand);
      setTheirCount(dealt.theirHand.length);
      setDrawPile(dealt.drawPile);
      drawPileRef.current = dealt.drawPile;
      setDiscardPile([dealt.topCard]);
      setTopCard(dealt.topCard);
      setCurrentColor(dealt.topCard.color);

      // Rastgele kim başlar
      const starterIsHost = Math.random() < 0.5;
      setIsMyTurn(starterIsHost);
      setGameStarted(true);

      // Guest'e elleri ve başlangıç bilgisi gönder
      sendData({
        type: 'gameInit',
        theirHand: dealt.theirHand, // Guest'in eli (kendi kartları)
        myHandCount: dealt.myHand.length, // Host'un el sayısı
        drawPile: dealt.drawPile,
        topCard: dealt.topCard,
        currentColor: dealt.topCard.color,
        hostStarts: starterIsHost,
      });
    }
    // Guest gameInit mesajı bekliyor
  }, [localPlayer, role, gameStarted]);

  // ─── Data Sync ──────────────────────────────────────────────────────────────
  const handleData = useCallback((data) => {
    switch (data.type) {

      case 'gameInit':
        // Guest tarafı: host'tan başlangıç verisi geldi
        setMyHand(data.theirHand); // Benim elim
        setTheirCount(data.myHandCount); // Host'un el sayısı
        setDrawPile(data.drawPile);
        drawPileRef.current = data.drawPile;
        setDiscardPile([data.topCard]);
        setTopCard(data.topCard);
        setCurrentColor(data.currentColor);
        setIsMyTurn(!data.hostStarts); // Host başlıyorsa ben başlamıyorum
        setGameStarted(true);
        break;

      case 'cardPlayed':
        // Rakip kart attı
        setTopCard(data.card);
        setCurrentColor(data.newColor);
        setDiscardPile(prev => [...prev, data.card]);
        setTheirCount(data.handCount);
        setAnimCard(data.card);
        setTimeout(() => setAnimCard(null), 600);

        if (data.card.type === CARD_TYPES.SKIP || data.card.type === CARD_TYPES.REVERSE) {
          // Beni atla → sıra yine rakipte
          setIsMyTurn(false);
          showNotif(`${players[opponentGender]?.name} sıranı atladı! 🚫`, '#e63946');
          return;
        }
        if (data.card.type === CARD_TYPES.TASK) {
          // Rakip bana görev kartı attı → modal aç (savunan benim)
          setPendingTaskCard(data.card);
          setTaskModal({ card: data.card, isAttacker: false });
          return; // Sıra geçişi görev sonucuna göre olacak
        }
        setIsMyTurn(true);
        break;

      case 'taskResult':
        // Görev sonucu (rakip gönderdi): kaç kart çekeceğimi öğrendim
        {
          const penalty = data.penalty;
          const newCards = drawCards(penalty);
          setMyHand(prev => [...prev, ...newCards]);
          setTaskModal(null);
          setPendingTaskCard(null);
          showNotif(`Görev: ${data.resultLabel} → ${penalty} kart çektin!`, '#ff9800');
          // Artık sıra rakipte (bende değil - rakip attı, ben sonucu verdim)
          setIsMyTurn(false);
          // Rakibe sıra geçtiğini söyle
          sendData({ type: 'turnPass', toOpponent: false });
        }
        break;

      case 'cardDrawn':
        // Rakip kart çekti
        setTheirCount(data.handCount);
        break;

      case 'turnPass':
        setIsMyTurn(true);
        break;

      case 'drawCards':
        // Bana kart çektirme (Skip haricinde)
        {
          const newCards = drawCards(data.count);
          setMyHand(prev => [...prev, ...newCards]);
          showNotif(`${data.count} kart çektin!`, '#e63946');
        }
        break;

      case 'syncDrawPile':
        setDrawPile(data.pile);
        drawPileRef.current = data.pile;
        break;

      case 'gameOver':
        setGameOver(data);
        break;

      default:
        break;
    }
  }, [opponentGender, players]);

  useEffect(() => {
    const unsub = onData(handleData);
    return unsub;
  }, [onData, handleData]);

  // ─── Desteden kart çek ──────────────────────────────────────────────────────
  const drawCards = (count) => {
    const pile = drawPileRef.current;
    if (pile.length < count) {
      // Desteyi bitirdik, discard'dan yenile
      return [];
    }
    const drawn = pile.slice(0, count);
    const remaining = pile.slice(count);
    drawPileRef.current = remaining;
    setDrawPile(remaining);
    return drawn;
  };

  // ─── Kart oyna ──────────────────────────────────────────────────────────────
  const playCard = (card, idx) => {
    if (!isMyTurn) return;
    if (!canPlayCard(card, topCard, currentColor)) {
      showNotif('Bu kartı atamazsın! 🚫', '#e63946');
      return;
    }

    // Wild veya görev kartı: önce renk seç (görev kartı renk seçmez - her renge atılır)
    if (card.type === CARD_TYPES.WILD) {
      setPendingCard({ card, idx });
      setShowColorPicker(true);
      return;
    }

    doPlayCard(card, idx, card.color);
  };

  const doPlayCard = (card, idx, chosenColor) => {
    const newHand = myHand.filter((_, i) => i !== idx);
    setMyHand(newHand);

    const newColor = chosenColor || card.color;
    setTopCard(card);
    setCurrentColor(newColor);
    setDiscardPile(prev => [...prev, card]);
    setAnimCard(card);
    setTimeout(() => setAnimCard(null), 600);

    // Rakibe bildir
    sendData({
      type: 'cardPlayed',
      card,
      newColor,
      handCount: newHand.length,
    });

    // Kazandın mı?
    if (newHand.length === 0) {
      endGame(true);
      return;
    }

    // Görev kartı: modal aç, saldırgan benim
    if (card.type === CARD_TYPES.TASK) {
      setPendingTaskCard(card);
      setTaskModal({ card, isAttacker: true });
      setIsMyTurn(false); // Görev sonucunu bekle
      return;
    }

    // Skip veya Reverse (2 kişide aynı): sıra tekrar bende
    if (card.type === CARD_TYPES.SKIP || card.type === CARD_TYPES.REVERSE) {
      showNotif('Sırayı atladın! 🚫 Tekrar sen oynarsın.', '#4361ee');
      // isMyTurn zaten true kalacak
      return;
    }

    setIsMyTurn(false);
  };

  const handleColorSelected = (color) => {
    setShowColorPicker(false);
    if (!pendingCard) return;
    doPlayCard(pendingCard.card, pendingCard.idx, color);
    setPendingCard(null);
  };

  // ─── Kart çek (sıram varsa) ────────────────────────────────────────────────
  const handleDrawCard = () => {
    if (!isMyTurn) return;
    const [drawn] = drawCards(1);
    if (!drawn) {
      showNotif('Destede kart kalmadı!', '#888');
      return;
    }
    const newHand = [...myHand, drawn];
    setMyHand(newHand);
    setDrawAnim(true);
    setTimeout(() => setDrawAnim(false), 500);
    sendData({ type: 'cardDrawn', handCount: newHand.length });
    setIsMyTurn(false);
    sendData({ type: 'turnPass' });
  };

  // ─── Görev sonucu (savunan) ────────────────────────────────────────────────
  const handleTaskResult = (result) => {
    if (!pendingTaskCard) return;
    const card = pendingTaskCard;
    let penalty;
    let label;
    if (result === 'done')   { penalty = card.penaltyDo;     label = 'Yaptın'; }
    if (result === 'fail')   { penalty = card.penaltyFail;   label = 'Yapamadın'; }
    if (result === 'refuse') { penalty = card.penaltyRefuse; label = 'Reddettin'; }

    // Kart çek
    const newCards = drawCards(penalty);
    setMyHand(prev => [...prev, ...newCards]);
    setTaskModal(null);
    setPendingTaskCard(null);
    showNotif(`${label} → ${penalty} kart çektin!`, '#ff9800');

    // Rakibe sonucu bildir
    sendData({ type: 'taskResult', result, penalty, resultLabel: label });

    // Sıra rakibe geçti (o attı, biz sonucu verdik)
    setIsMyTurn(false);
  };

  // ─── Oyun Sonu ─────────────────────────────────────────────────────────────
  const endGame = (iWon) => {
    // Kalan kartların puanı rakibe yazılır
    const myScore = myHand.reduce((sum, c) => sum + cardScore(c), 0);
    sendData({ type: 'gameOver', iWon: false, opponentScore: myScore });
    setGameOver({ iWon, opponentScore: myScore });
  };

  // ─── Oyun Sonu Ekranı ───────────────────────────────────────────────────────
  if (gameOver) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, #1a0033 0%, #050010 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
      }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
            {gameOver.iWon ? '🏆' : '💔'}
          </div>
          <h2 style={{
            color: 'white', fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px',
            textShadow: gameOver.iWon ? '0 0 30px #f5af19' : '0 0 30px #9d4edd',
          }}>
            {gameOver.iWon ? 'KAZANDIN!' : 'KAYBETTİN!'}
          </h2>
          <p style={{ color: 'rgba(255,200,220,0.8)', fontSize: '1rem', marginBottom: '32px' }}>
            {gameOver.iWon
              ? `Rakibinin elinde ${gameOver.opponentScore || '?'} puan kaldı!`
              : 'Tüm kartlarını bitir!'}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onFinish}
            style={{
              padding: '18px 48px',
              background: 'linear-gradient(135deg, #9d4edd, #ff3c78)',
              color: 'white', border: 'none', borderRadius: '20px',
              fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(157,78,221,0.5)',
            }}
          >
            Ana Menü
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Yükleniyor ─────────────────────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, #1a0033 0%, #050010 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '4rem', marginBottom: '20px' }}
          >🃏</motion.div>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
            Desteler dağıtılıyor...
          </p>
        </div>
      </div>
    );
  }

  // ─── Renkler ─────────────────────────────────────────────────────────────────
  const colorHex   = COLOR_HEX[currentColor] || '#9d4edd';
  const activeBg   = `radial-gradient(circle at top, ${colorHex}33 0%, #1a0033 70%)`;

  // Oynanabilir kartlar
  const playableIndices = isMyTurn
    ? myHand.map((c, i) => canPlayCard(c, topCard, currentColor) ? i : -1).filter(i => i >= 0)
    : [];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: activeBg, transition: 'background 0.8s ease',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>

      {/* ── Arka plan dekor ────────────────────────────────────────────────── */}
      <motion.div animate={{ y: [0,-20,0], rotate:[0,10,-10,0] }} transition={{ duration:6, repeat:Infinity }}
        style={{ position:'absolute', top:'8%', left:'5%', fontSize:'2.5rem', opacity:0.1, pointerEvents:'none' }}>💋</motion.div>
      <motion.div animate={{ y: [0,20,0], rotate:[0,-15,15,0] }} transition={{ duration:7, repeat:Infinity }}
        style={{ position:'absolute', bottom:'25%', right:'8%', fontSize:'2.5rem', opacity:0.1, pointerEvents:'none' }}>🔥</motion.div>

      {/* ── Bildirim banner ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              background: notification.color, color: 'white',
              padding: '10px 24px', borderRadius: '30px', zIndex: 30,
              fontWeight: '900', fontSize: '0.95rem', whiteSpace: 'nowrap',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)', border: '2px solid white',
            }}
          >{notification.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* ── RAKİP ALANI (üst) ──────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px 8px', display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        {/* Rakip isim / sıra göstergesi */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: !isMyTurn ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.3)',
          borderRadius: '20px', padding: '8px 18px',
          border: !isMyTurn ? `2px solid ${colorHex}` : '2px solid transparent',
          transition: 'all 0.3s',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{players[opponentGender]?.avatar}</span>
          <span style={{ color: 'white', fontWeight: '900', fontSize: '0.95rem' }}>
            {players[opponentGender]?.name}
          </span>
          {!isMyTurn && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ color: colorHex, fontSize: '0.8rem', fontWeight: '700' }}
            >⚡ Oynuyor</motion.span>
          )}
        </div>

        {/* Rakibin kapalı kartları */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CardBack count={theirCount} />
          <span style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '700',
          }}>{theirCount} kart</span>
        </div>
      </div>

      {/* ── ORTA ALAN: Orta deste + Çekme destesi ──────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '28px', padding: '8px 16px',
      }}>

        {/* Çekme destesi */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <motion.div
            whileHover={isMyTurn ? { y: -8, scale: 1.05 } : {}}
            whileTap={isMyTurn ? { scale: 0.95 } : {}}
            onClick={handleDrawCard}
            animate={drawAnim ? { scale: [1, 1.2, 1] } : {}}
            style={{
              width: 'clamp(60px,16vw,80px)', height: 'clamp(88px,24vw,116px)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2d1b4e, #1a0033)',
              border: isMyTurn ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', cursor: isMyTurn ? 'pointer' : 'default',
              boxShadow: isMyTurn ? '0 8px 24px rgba(255,255,255,0.2)' : 'none',
              backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.03) 8px,rgba(255,255,255,0.03) 16px)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: '900', marginTop: '4px' }}>
              {drawPile.length}
            </span>
          </motion.div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>
            ÇEKME
          </span>
        </div>

        {/* Atılan kart animasyonu + üstteki kart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', width: 'clamp(68px,18vw,90px)', height: 'clamp(100px,26vw,130px)' }}>
            <AnimatePresence>
              {animCard && (
                <motion.div
                  key="anim"
                  initial={{ scale: 1.3, opacity: 1, y: -30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: 'absolute', inset: 0, zIndex: 10 }}
                >
                  <UnoCard card={animCard} style={{ width: '100%', height: '100%' }} />
                </motion.div>
              )}
            </AnimatePresence>
            <UnoCard card={topCard} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Aktif renk göstergesi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: colorHex, border: '2px solid white',
              boxShadow: `0 0 10px ${colorHex}`,
            }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize' }}>
              {currentColor}
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>
            ATILAN
          </span>
        </div>

        {/* Sıra göstergesi */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <motion.div
            animate={isMyTurn ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              width: 'clamp(56px,14vw,72px)', height: 'clamp(56px,14vw,72px)',
              borderRadius: '50%',
              background: isMyTurn
                ? 'linear-gradient(135deg, #2dc653, #1a8c3a)'
                : 'rgba(255,255,255,0.1)',
              border: isMyTurn ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: isMyTurn ? '0 0 20px rgba(45,198,83,0.6)' : 'none',
            }}
          >
            {isMyTurn ? '🎯' : '⏳'}
          </motion.div>
          <span style={{
            color: isMyTurn ? '#2dc653' : 'rgba(255,255,255,0.4)',
            fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase',
          }}>
            {isMyTurn ? 'SEN' : 'RAKİP'}
          </span>
        </div>
      </div>

      {/* ── BENİM ELİM (alt) ───────────────────────────────────────────────── */}
      <div style={{
        padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '20px 20px 0 0',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
      }}>
        {/* Kendi isim + kart sayısı */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 8px 8px', marginBottom: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>{players[localPlayer]?.avatar}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: '0.85rem' }}>
              {players[localPlayer]?.name}
            </span>
          </div>
          <div style={{
            background: isMyTurn ? 'linear-gradient(135deg, #9d4edd, #ff3c78)' : 'rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '4px 12px',
            color: 'white', fontWeight: '900', fontSize: '0.8rem',
            transition: 'all 0.3s',
          }}>
            {myHand.length} kart
            {!isMyTurn && <span style={{ opacity: 0.6 }}> · Sıra bekleniyor</span>}
          </div>
        </div>

        {/* Kartlar */}
        <div style={{
          display: 'flex', gap: '6px',
          overflowX: 'auto', padding: '4px 4px 4px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {myHand.map((card, idx) => (
            <UnoCard
              key={`${card.id}-${idx}`}
              card={card}
              isSmall={false}
              isPlayable={playableIndices.includes(idx)}
              onClick={() => playCard(card, idx)}
            />
          ))}
          {myHand.length === 0 && (
            <div style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', width: '100%' }}>
              El boş!
            </div>
          )}
        </div>
      </div>

      {/* ── Renk Seçici ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showColorPicker && <ColorPicker onSelect={handleColorSelected} />}
      </AnimatePresence>

      {/* ── Görev Modalı ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {taskModal && (
          <TaskModal
            card={taskModal.card}
            isAttacker={taskModal.isAttacker}
            opponentName={players[opponentGender]?.name}
            opponentAvatar={players[opponentGender]?.avatar}
            onResult={!taskModal.isAttacker ? handleTaskResult : undefined}
            onClose={taskModal.isAttacker ? () => setTaskModal(null) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
