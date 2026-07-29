import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, animate as mvAnimate } from 'framer-motion';
import { MOCK_CARDS } from '../data/cards';
import { dealGame, canPlayCard, CARD_TYPES, UNO_COLORS, buildUnoDeck, shuffle } from '../data/unoDeck';
import { useMultiplayer } from '../context/MultiplayerContext';

// ─── Temalar: Kadın vs Erkek ──────────────────────────────────────────────────
const THEMES = {
  woman: {
    bg: 'radial-gradient(ellipse 140% 80% at 50% -10%, #6b0055 0%, #3d0035 25%, #1e001e 55%, #0d000f 100%)',
    accent: '#f72585',
    accentGlow: 'rgba(247,37,133,0.45)',
    secondary: '#b5179e',
    cardBack: 'linear-gradient(145deg, #5c0050 0%, #2d0030 100%)',
    cardBackBorder: 'rgba(247,37,133,0.5)',
    handBg: 'rgba(80,0,60,0.5)',
    handBorder: 'rgba(247,37,133,0.3)',
    turnRing: '#f72585',
    float: [
      { e: '💋', x: '8%',  t: '8%',  d: 5.5 },
      { e: '🌹', x: '85%', t: '15%', d: 7.0 },
      { e: '✨', x: '12%', t: '55%', d: 4.5 },
      { e: '💜', x: '80%', t: '60%', d: 6.0 },
    ],
  },
  man: {
    bg: 'radial-gradient(ellipse 140% 80% at 50% -10%, #00254d 0%, #001229 25%, #000a1a 55%, #000508 100%)',
    accent: '#ff7900',
    accentGlow: 'rgba(255,121,0,0.45)',
    secondary: '#f5af19',
    cardBack: 'linear-gradient(145deg, #001e3c 0%, #000d18 100%)',
    cardBackBorder: 'rgba(255,121,0,0.5)',
    handBg: 'rgba(0,25,50,0.5)',
    handBorder: 'rgba(255,121,0,0.3)',
    turnRing: '#ff7900',
    float: [
      { e: '🔥', x: '8%',  t: '8%',  d: 5.0 },
      { e: '⚡', x: '85%', t: '18%', d: 6.5 },
      { e: '💥', x: '10%', t: '55%', d: 4.0 },
      { e: '🖤', x: '82%', t: '58%', d: 7.0 },
    ],
  },
};

// ─── UNO Renk Teması ─────────────────────────────────────────────────────────
const CARD_COLORS = {
  kırmızı: { bg: 'linear-gradient(150deg,#c62828 0%,#8b0000 100%)', glow: '#ff5252', sym: '♥', label: 'KIRMIZI' },
  mavi:    { bg: 'linear-gradient(150deg,#1565c0 0%,#0a2a6e 100%)', glow: '#5b9cf6', sym: '♦', label: 'MAVİ'    },
  yeşil:   { bg: 'linear-gradient(150deg,#2e7d32 0%,#0d3b10 100%)', glow: '#69f069', sym: '♣', label: 'YEŞİL'   },
  sarı:    { bg: 'linear-gradient(150deg,#f9a825 0%,#8f5200 100%)', glow: '#ffe57f', sym: '★', label: 'SARI'    },
};

// ─── Random card pool ─────────────────────────────────────────────────────────
const _pool = [];
const getRandomCard = () => {
  if (_pool.length < 6) shuffle(buildUnoDeck()).forEach(c => _pool.push(c));
  return { ..._pool.shift(), id: Date.now() + Math.random() * 100000 };
};

// ─── UnoCard – saf render bileşeni ───────────────────────────────────────────
const UnoCard = ({ card, size = 'md', shadow = false }) => {
  if (!card) return null;

  const isTask    = card.type === CARD_TYPES.TASK;
  const isWild    = card.type === CARD_TYPES.WILD;
  const isSkip    = card.type === CARD_TYPES.SKIP;
  const isReverse = card.type === CARD_TYPES.REVERSE;

  const ct = CARD_COLORS[card.color] || CARD_COLORS.kırmızı;

  const dims = {
    sm:   { w: '52px',  h: '78px',  nf: '1.3rem', sf: '0.48rem' },
    md:   { w: 'clamp(78px,21vw,98px)', h: 'clamp(117px,31vw,147px)', nf: 'clamp(1.8rem,5.5vw,2.4rem)', sf: 'clamp(0.5rem,1.4vw,0.68rem)' },
    lg:   { w: '140px', h: '210px', nf: '3.8rem', sf: '0.95rem' },
  };
  const d = dims[size] || dims.md;

  const cardBg = isTask
    ? 'linear-gradient(150deg,#1a0000 0%,#380010 50%,#150008 100%)'
    : isWild
    ? 'linear-gradient(150deg,#12122a 0%,#0a0a1e 100%)'
    : ct.bg;

  const borderCol = isTask
    ? 'rgba(255,60,0,0.55)'
    : isWild
    ? 'rgba(255,255,255,0.4)'
    : `${ct.glow}66`;

  return (
    <div style={{
      width: d.w, height: d.h, borderRadius: '12px',
      background: cardBg,
      border: `2px solid ${borderCol}`,
      position: 'relative', overflow: 'hidden',
      boxShadow: shadow ? `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${isTask ? 'rgba(255,60,0,0.3)' : isWild ? 'rgba(157,78,221,0.3)' : `${ct.glow}40`}` : 'none',
      userSelect: 'none', WebkitUserSelect: 'none',
      flexShrink: 0,
    }}>
      {/* Shine */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'38%',
        background:'linear-gradient(180deg,rgba(255,255,255,0.13) 0%,transparent 100%)',
        pointerEvents:'none',
      }}/>

      {/* SAYI KARTI */}
      {!isTask && !isWild && !isSkip && !isReverse && (
        <>
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:`radial-gradient(ellipse at 30% 70%,rgba(255,255,255,0.09) 0%,transparent 55%)`,
          }}/>
          {/* Sol üst */}
          <div style={{ position:'absolute', top:'5px', left:'7px', color:'rgba(255,255,255,0.92)', fontWeight:'900', fontSize:d.sf, lineHeight:1.1, zIndex:1 }}>
            <div style={{ fontStyle:'italic' }}>{card.value}</div>
            <div style={{ opacity:0.65, fontSize:'0.8em' }}>{ct.sym}</div>
          </div>
          {/* Merkez büyük sayı */}
          <div style={{ position:'absolute',inset:0, display:'flex',alignItems:'center',justifyContent:'center', zIndex:1 }}>
            <span style={{
              fontSize:d.nf, fontWeight:'900', color:'white', fontStyle:'italic',
              textShadow:`0 0 20px ${ct.glow}, 0 2px 6px rgba(0,0,0,0.6)`,
            }}>{card.value}</span>
          </div>
          {/* Sağ alt (ters) */}
          <div style={{ position:'absolute', bottom:'5px', right:'7px', color:'rgba(255,255,255,0.92)', fontWeight:'900', fontSize:d.sf, lineHeight:1.1, transform:'rotate(180deg)', zIndex:1 }}>
            <div style={{ fontStyle:'italic' }}>{card.value}</div>
            <div style={{ opacity:0.65, fontSize:'0.8em' }}>{ct.sym}</div>
          </div>
        </>
      )}

      {/* SKIP / REVERSE */}
      {(isSkip || isReverse) && (
        <>
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:`radial-gradient(circle at 50% 50%,rgba(255,255,255,0.1) 0%,transparent 60%)`,
          }}/>
          <div style={{ position:'absolute', top:'5px', left:'7px', color:'rgba(255,255,255,0.85)', fontWeight:'900', fontSize:d.sf, zIndex:1 }}>
            {isSkip ? '⊘' : '↩'}
          </div>
          <div style={{ position:'absolute',inset:0, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center', gap:'4px', zIndex:1 }}>
            <span style={{ fontSize: size==='sm' ? '1.6rem' : size==='lg' ? '3.5rem' : 'clamp(2rem,6vw,2.8rem)' }}>
              {isSkip ? '⊘' : '↩'}
            </span>
            <span style={{ color:'rgba(255,255,255,0.85)', fontWeight:'900', fontSize:d.sf, letterSpacing:'1px', textTransform:'uppercase', textShadow:'0 1px 4px rgba(0,0,0,0.6)' }}>
              {isSkip ? 'ATLA' : 'ÇEVİR'}
            </span>
          </div>
          <div style={{ position:'absolute', bottom:'5px', right:'7px', color:'rgba(255,255,255,0.85)', fontWeight:'900', fontSize:d.sf, transform:'rotate(180deg)', zIndex:1 }}>
            {isSkip ? '⊘' : '↩'}
          </div>
        </>
      )}

      {/* WILD */}
      {isWild && (
        <div style={{ position:'absolute',inset:0, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center', gap:'8px' }}>
          <div style={{
            width: size==='sm'?'30px':size==='lg'?'72px':'clamp(46px,12vw,58px)',
            height: size==='sm'?'30px':size==='lg'?'72px':'clamp(46px,12vw,58px)',
            borderRadius:'50%',
            background:'conic-gradient(#c62828 0 90deg,#1565c0 90deg 180deg,#2e7d32 180deg 270deg,#f9a825 270deg 360deg)',
            border:'2.5px solid rgba(255,255,255,0.5)',
            boxShadow:'0 0 20px rgba(255,255,255,0.25)',
          }}/>
          <span style={{ color:'rgba(255,255,255,0.8)', fontWeight:'900', fontSize:d.sf, letterSpacing:'0.5px', textTransform:'uppercase' }}>
            RENK SEÇ
          </span>
        </div>
      )}

      {/* GÖREV KARTI */}
      {isTask && (
        <>
          {/* ateş arka plan */}
          <div style={{ position:'absolute',inset:0, background:'radial-gradient(circle at 50% 90%,rgba(255,80,0,0.35) 0%,transparent 60%)' }}/>
          <div style={{ position:'absolute',inset:0, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between', padding: size==='sm'?'5px':'10px 7px', zIndex:1 }}>
            {/* Üst: GÖREV badge */}
            <div style={{ background:'rgba(220,30,0,0.85)', borderRadius:'6px', padding:'2px 7px', display:'flex',alignItems:'center',gap:'3px' }}>
              <span style={{ fontSize: size==='sm'?'0.55rem':'0.72rem' }}>🔥</span>
              {size !== 'sm' && <span style={{ color:'white',fontWeight:'900',fontSize:'0.6rem',letterSpacing:'0.5px',textTransform:'uppercase' }}>GÖREV</span>}
            </div>

            {/* Orta: görev başlığı - YALNIZCA md/lg boyutunda */}
            {size !== 'sm' && card.taskData?.title && (
              <div style={{
                color:'rgba(255,200,175,0.95)', fontWeight:'900',
                fontSize: size==='lg' ? '0.95rem' : 'clamp(0.6rem,1.8vw,0.78rem)',
                textAlign:'center', lineHeight:1.3, padding:'0 2px',
                textShadow:'0 1px 4px rgba(0,0,0,0.9)',
                maxHeight: size==='lg' ? '90px' : '52px', overflow:'hidden',
              }}>
                {card.taskData.title}
              </div>
            )}
            {size === 'sm' && <span style={{ fontSize:'1rem' }}>🔥</span>}

            {/* Alt: ceza göstergesi */}
            <div style={{ background:'rgba(255,200,0,0.18)', border:'1px solid rgba(255,200,0,0.5)', borderRadius:'6px', padding:'2px 7px' }}>
              <span style={{ color:'#ffcc00', fontWeight:'900', fontSize: size==='sm'?'0.6rem':'0.78rem' }}>
                {card.display}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Rakip kartların arkası ───────────────────────────────────────────────────
const OpponentHand = ({ count, theme }) => {
  const n = Math.min(count, 7);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', position:'relative', height:'72px' }}>
      {[...Array(n)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ x:(i - (n-1)/2)*16, rotate:(i - (n-1)/2)*4 }}
          style={{
            position:'absolute',
            width:'48px', height:'70px', borderRadius:'9px',
            background: theme.cardBack,
            border:`2px solid ${theme.cardBackBorder}`,
            boxShadow:'0 4px 12px rgba(0,0,0,0.7)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'1rem',
            backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.025) 8px,rgba(255,255,255,0.025) 16px)',
          }}
        >🔥</motion.div>
      ))}
      {count > 0 && (
        <div style={{
          position:'absolute', bottom:'-20px',
          background:'rgba(0,0,0,0.6)', color:'rgba(255,255,255,0.65)',
          borderRadius:'10px', padding:'2px 10px',
          fontSize:'0.72rem', fontWeight:'900',
        }}>{count} kart</div>
      )}
    </div>
  );
};

// ─── Renk Seçici ─────────────────────────────────────────────────────────────
const ColorPicker = ({ onSelect }) => (
  <motion.div
    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    style={{ position:'fixed',inset:0,zIndex:300, display:'flex',alignItems:'center',justifyContent:'center', background:'rgba(0,0,0,0.88)', backdropFilter:'blur(10px)' }}
  >
    <motion.div initial={{ scale:0.6,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.6,opacity:0 }} transition={{ type:'spring',bounce:0.4 }}
      style={{ textAlign:'center' }}>
      <div style={{ fontSize:'2.5rem',marginBottom:'12px' }}>🌈</div>
      <p style={{ color:'white',fontWeight:'900',fontSize:'1.3rem',marginBottom:'24px' }}>Renk Seç</p>
      <div style={{ display:'flex',gap:'18px',justifyContent:'center' }}>
        {UNO_COLORS.map(color => (
          <motion.button key={color} whileHover={{ scale:1.2,y:-8 }} whileTap={{ scale:0.9 }} onClick={() => onSelect(color)}
            style={{
              width:'70px',height:'70px',borderRadius:'50%',
              background: CARD_COLORS[color]?.bg || '#333',
              border:'3px solid white', cursor:'pointer',
              boxShadow:`0 8px 25px ${CARD_COLORS[color]?.glow || '#fff'}88`,
            }}
          />
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Zoom Overlay ─────────────────────────────────────────────────────────────
const ZoomOverlay = ({ card, onClose }) => {
  if (!card) return null;
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed',inset:0,zIndex:290, background:'rgba(0,0,0,0.88)',backdropFilter:'blur(10px)', display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'20px',padding:'20px' }}
    >
      <motion.div
        initial={{ scale:0.5,y:80,opacity:0 }} animate={{ scale:1,y:0,opacity:1 }} exit={{ scale:0.5,opacity:0 }}
        transition={{ type:'spring',bounce:0.35 }}
        onClick={e => e.stopPropagation()}
      >
        <UnoCard card={card} size="lg" shadow />
      </motion.div>

      {card.type === CARD_TYPES.TASK && card.taskData && (
        <motion.div
          initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          onClick={e => e.stopPropagation()}
          style={{ background:'rgba(255,255,255,0.97)', borderRadius:'20px', padding:'20px 22px', maxWidth:'320px', width:'100%', textAlign:'center', border:'3px solid rgba(220,30,0,0.5)' }}
        >
          <div style={{ fontSize:'1.5rem',marginBottom:'8px' }}>🔥</div>
          <h3 style={{ color:'#c62828',fontWeight:'900',fontSize:'1.1rem',marginBottom:'8px' }}>{card.taskData.title}</h3>
          <p style={{ color:'#444',lineHeight:1.6,fontSize:'0.93rem',marginBottom:'14px' }}>{card.taskData.text}</p>
          <div style={{ display:'flex',justifyContent:'center',gap:'6px',flexWrap:'wrap',fontSize:'0.78rem' }}>
            <span style={{ background:'#e8f5e9',color:'#2e7d32',padding:'3px 8px',borderRadius:'8px',fontWeight:'700' }}>✅ Yapar: +{card.penaltyDo} kart</span>
            <span style={{ background:'#fff3e0',color:'#e65100',padding:'3px 8px',borderRadius:'8px',fontWeight:'700' }}>😅 Yapamaz: +{card.penaltyFail} kart</span>
            <span style={{ background:'#fce4ec',color:'#c62828',padding:'3px 8px',borderRadius:'8px',fontWeight:'700' }}>🚫 Reddeder: +{card.penaltyRefuse} kart</span>
          </div>
        </motion.div>
      )}
      <p style={{ color:'rgba(255,255,255,0.4)',fontSize:'0.82rem' }}>Kapatmak için dokun</p>
    </motion.div>
  );
};

// ─── Görev Modal (bottom sheet) ───────────────────────────────────────────────
const TaskModal = ({ card, isAttacker, opponentName, opponentAvatar, onResult, onClose }) => {
  if (!card?.taskData) return null;
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed',inset:0,zIndex:280, display:'flex',alignItems:'flex-end',justifyContent:'center', background:'rgba(0,0,0,0.82)',backdropFilter:'blur(8px)',padding:'0 0 env(safe-area-inset-bottom,0px)' }}
    >
      <motion.div
        initial={{ y:320,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:320,opacity:0 }}
        transition={{ type:'spring',bounce:0.3 }}
        style={{ background:'white',borderRadius:'28px 28px 0 0',padding:'28px 22px 32px',maxWidth:'440px',width:'100%', border: isAttacker?'3px solid #ff7900':'3px solid #9d4edd', borderBottom:'none' }}
      >
        <div style={{ textAlign:'center',marginBottom:'18px' }}>
          <div style={{ fontSize:'2.5rem',marginBottom:'8px' }}>{isAttacker ? '⚔️' : opponentAvatar}</div>
          <h3 style={{ color:isAttacker?'#ff7900':'#9d4edd',fontSize:'1.2rem',fontWeight:'900' }}>
            {isAttacker ? `${opponentName}'a Görev!` : '🎯 Sana Görev Geldi!'}
          </h3>
        </div>
        <div style={{ background:'#fff8f0',borderRadius:'16px',padding:'14px 18px',border:'2px solid rgba(255,121,0,0.2)',marginBottom:'14px' }}>
          <p style={{ fontWeight:'900',fontSize:'1.05rem',color:'#c62828',marginBottom:'7px' }}>{card.taskData.title}</p>
          <p style={{ color:'#555',lineHeight:1.6,fontSize:'0.92rem' }}>{card.taskData.text}</p>
        </div>
        <div style={{ background:'#f5f5f5',borderRadius:'10px',padding:'10px',marginBottom:'18px',fontSize:'0.78rem',color:'#666',textAlign:'center' }}>
          ✅ Yapar: <strong style={{ color:'#2e7d32' }}>+{card.penaltyDo} kart</strong>
          &nbsp;|&nbsp;
          😅 Yapamaz: <strong style={{ color:'#e65100' }}>+{card.penaltyFail} kart</strong>
          &nbsp;|&nbsp;
          🚫 Reddeder: <strong style={{ color:'#c62828' }}>+{card.penaltyRefuse} kart</strong>
        </div>

        {isAttacker && (
          <motion.button whileTap={{ scale:0.95 }} onClick={onClose}
            style={{ width:'100%',padding:'15px',background:'linear-gradient(135deg,#ff7900,#f5af19)',color:'white',border:'none',borderRadius:'15px',fontWeight:'900',fontSize:'1rem',cursor:'pointer' }}>
            ⚡ Görevi Gönder!
          </motion.button>
        )}
        {!isAttacker && onResult && (
          <div style={{ display:'flex',flexDirection:'column',gap:'9px' }}>
            <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('done')}
              style={{ padding:'13px',background:'#2e7d32',color:'white',border:'none',borderRadius:'13px',fontWeight:'900',cursor:'pointer',fontSize:'0.93rem' }}>
              ✅ Yaptım! (+{card.penaltyDo} kart)
            </motion.button>
            <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('fail')}
              style={{ padding:'13px',background:'#e65100',color:'white',border:'none',borderRadius:'13px',fontWeight:'900',cursor:'pointer',fontSize:'0.93rem' }}>
              😅 Yapamadım (+{card.penaltyFail} kart)
            </motion.button>
            <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('refuse')}
              style={{ padding:'13px',background:'#c62828',color:'white',border:'none',borderRadius:'13px',fontWeight:'900',cursor:'pointer',fontSize:'0.93rem' }}>
              🚫 Reddediyorum (+{card.penaltyRefuse} kart)
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Çekilen kart önizleme ────────────────────────────────────────────────────
const DrawnCardPreview = ({ card, onDismiss }) => (
  <motion.div
    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    onClick={onDismiss}
    style={{ position:'fixed',inset:0,zIndex:270, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'20px', background:'rgba(0,0,0,0.78)',backdropFilter:'blur(8px)' }}
  >
    <motion.div
      initial={{ scale:0,y:180,rotate:-8 }} animate={{ scale:1,y:0,rotate:0 }} exit={{ scale:0.4,y:-120,opacity:0 }}
      transition={{ type:'spring',bounce:0.4 }}
      style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'16px' }}
    >
      <p style={{ color:'rgba(255,255,255,0.85)',fontWeight:'900',fontSize:'1.1rem',textAlign:'center' }}>🃏 Kart Çektin!</p>
      <UnoCard card={card} size="lg" shadow />
      <p style={{ color:'rgba(255,255,255,0.38)',fontSize:'0.8rem' }}>Devam etmek için dokun</p>
    </motion.div>
  </motion.div>
);

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
const Game = ({ players, setPlayers, startingPlayer, onFinish, settings }) => {
  const { localPlayer, sendData, onData, role } = useMultiplayer();
  const theme = THEMES[localPlayer] || THEMES.woman;
  const opponentGender = localPlayer === 'woman' ? 'man' : 'woman';

  // ── Oyun durumu ────────────────────────────────────────────────────────────
  const [myHand,        setMyHand]        = useState([]);
  const [theirCount,    setTheirCount]    = useState(0);
  const [topCard,       setTopCard]       = useState(null);
  const [currentColor,  setCurrentColor]  = useState('kırmızı');
  const [isMyTurn,      setIsMyTurn]      = useState(false);
  const [gameStarted,   setGameStarted]   = useState(false);

  // ── UI durumu ─────────────────────────────────────────────────────────────
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard,     setPendingCard]     = useState(null);
  const [taskModal,       setTaskModal]       = useState(null);
  const [pendingTaskCard, setPendingTaskCard] = useState(null);
  const [notification,   setNotification]    = useState(null);
  const [zoomedCard,      setZoomedCard]      = useState(null);
  const [drawnCard,       setDrawnCard]       = useState(null);
  const [animCard,        setAnimCard]        = useState(null);
  const [gameOver,        setGameOver]        = useState(null);

  // ── Portal sürükleme durumu ────────────────────────────────────────────────
  const [cardPortal,     setCardPortal]     = useState(null); // { card, idx, startX, startY, w, h }
  const [portalCanPlay,  setPortalCanPlay]  = useState(false);
  const portalY       = useMotionValue(0);
  const portalX       = useMotionValue(0);
  const longPressRef  = useRef(null);
  const dragStartY    = useRef(0);
  const dragMoved     = useRef(false);

  const notifTimer = useRef(null);
  const showNotif = useCallback((msg, color = '#9d4edd') => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotification({ msg, color });
    notifTimer.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  // ── Oyun başlangıcı ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localPlayer || gameStarted) return;
    if (role === 'host') {
      const deckSize  = settings.deckSize || 7;
      const taskCount = settings.taskCardCount ?? 3;
      const dealt = dealGame(deckSize, taskCount, localPlayer, MOCK_CARDS);

      setMyHand(dealt.myHand);
      setTheirCount(dealt.theirHand.length);
      setTopCard(dealt.topCard);
      setCurrentColor(dealt.topCard.color);

      const hostStarts = Math.random() < 0.5;
      setIsMyTurn(hostStarts);
      setGameStarted(true);

      sendData({
        type: 'gameInit',
        theirHand: dealt.theirHand,
        myHandCount: dealt.myHand.length,
        topCard: dealt.topCard,
        currentColor: dealt.topCard.color,
        hostStarts,
      });
    }
  }, [localPlayer, role, gameStarted, settings, sendData]);

  // ── Data handler ───────────────────────────────────────────────────────────
  const handleData = useCallback((data) => {
    switch (data.type) {
      case 'gameInit':
        setMyHand(data.theirHand);
        setTheirCount(data.myHandCount);
        setTopCard(data.topCard);
        setCurrentColor(data.currentColor);
        setIsMyTurn(!data.hostStarts);
        setGameStarted(true);
        break;

      case 'cardPlayed':
        setTopCard(data.card);
        setCurrentColor(data.newColor);
        setTheirCount(data.handCount);
        setAnimCard(data.card);
        setTimeout(() => setAnimCard(null), 700);

        if (data.handCount === 0) { setGameOver({ iWon: false }); return; }
        if (data.card.type === CARD_TYPES.SKIP || data.card.type === CARD_TYPES.REVERSE) {
          setIsMyTurn(false);
          showNotif(`${players[opponentGender]?.name} sıranı atladı! ⊘`, '#c62828');
          return;
        }
        if (data.card.type === CARD_TYPES.TASK) {
          setPendingTaskCard(data.card);
          setTaskModal({ card: data.card, isAttacker: false });
          return;
        }
        setIsMyTurn(true);
        break;

      case 'taskResult':
        {
          const newCards = Array.from({ length: data.penalty }, () => getRandomCard());
          setMyHand(prev => [...prev, ...newCards]);
          setTaskModal(null);
          setPendingTaskCard(null);
          showNotif(`${data.resultLabel} → ${data.penalty} kart çektin!`, '#ff9800');
          setIsMyTurn(false);
        }
        break;

      case 'cardDrawn':
        setTheirCount(data.handCount);
        setIsMyTurn(true);
        break;

      case 'turnPass':
        setIsMyTurn(true);
        break;

      case 'gameOver':
        setGameOver({ iWon: false });
        break;

      default: break;
    }
  }, [opponentGender, players, showNotif]);

  useEffect(() => {
    const unsub = onData(handleData);
    return unsub;
  }, [onData, handleData]);

  // ── Kart oyna ─────────────────────────────────────────────────────────────
  const playCard = useCallback((card, idx) => {
    if (!isMyTurn) { showNotif('Sıra sende değil! ⏳', '#666'); return; }
    if (!canPlayCard(card, topCard, currentColor)) {
      showNotif('Bu kartı atamazsın! 🚫', '#c62828'); return;
    }
    if (card.type === CARD_TYPES.WILD) {
      setPendingCard({ card, idx });
      setShowColorPicker(true);
      return;
    }
    doPlay(card, idx, card.color);
  }, [isMyTurn, topCard, currentColor]);

  const doPlay = useCallback((card, idx, chosenColor) => {
    const newHand = myHand.filter((_, i) => i !== idx);
    setMyHand(newHand);
    const newColor = chosenColor || card.color;
    setTopCard(card);
    setCurrentColor(newColor);
    setAnimCard(card);
    setTimeout(() => setAnimCard(null), 700);

    sendData({ type: 'cardPlayed', card, newColor, handCount: newHand.length });

    if (newHand.length === 0) {
      sendData({ type: 'gameOver' });
      setGameOver({ iWon: true });
      return;
    }
    if (card.type === CARD_TYPES.TASK) {
      setPendingTaskCard(card);
      setTaskModal({ card, isAttacker: true });
      setIsMyTurn(false);
      return;
    }
    if (card.type === CARD_TYPES.SKIP || card.type === CARD_TYPES.REVERSE) {
      showNotif('Sırayı atladın! ⊘ Tekrar oynarsın.', '#1565c0');
      return;
    }
    setIsMyTurn(false);
  }, [myHand, sendData, showNotif]);

  const handleColorSelect = (color) => {
    setShowColorPicker(false);
    if (!pendingCard) return;
    doPlay(pendingCard.card, pendingCard.idx, color);
    setPendingCard(null);
  };

  // ── Kart çek ─────────────────────────────────────────────────────────────
  const handleDraw = useCallback(() => {
    if (!isMyTurn) { showNotif('Sıra sende değil! ⏳', '#666'); return; }
    const card = getRandomCard();
    setDrawnCard(card);
  }, [isMyTurn, showNotif]);

  const confirmDrawn = useCallback(() => {
    if (!drawnCard) return;
    const card = drawnCard;
    setDrawnCard(null);
    setMyHand(prev => {
      const newHand = [...prev, card];
      sendData({ type: 'cardDrawn', handCount: newHand.length });
      return newHand;
    });
    setIsMyTurn(false);
    sendData({ type: 'turnPass' });
  }, [drawnCard, sendData]);

  // ── Görev sonucu ──────────────────────────────────────────────────────────
  const handleTaskResult = useCallback((result) => {
    if (!pendingTaskCard) return;
    const card = pendingTaskCard;
    const penalty = result === 'done' ? card.penaltyDo : result === 'fail' ? card.penaltyFail : card.penaltyRefuse;
    const label   = result === 'done' ? 'Yaptın' : result === 'fail' ? 'Yapamadın' : 'Reddettin';

    const newCards = Array.from({ length: penalty }, () => getRandomCard());
    setMyHand(prev => [...prev, ...newCards]);
    setTaskModal(null);
    setPendingTaskCard(null);
    showNotif(`${label} → ${penalty} kart çektin!`, '#ff9800');
    sendData({ type: 'taskResult', result, penalty, resultLabel: label });
    setIsMyTurn(false);
  }, [pendingTaskCard, sendData, showNotif]);

  // ── Portal sürükleme (kaydırarak oyna) ────────────────────────────────────
  const startCardGesture = useCallback((card, idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragStartY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragMoved.current = false;
    portalY.set(0);
    portalX.set(0);
    setPortalCanPlay(false);

    longPressRef.current = setTimeout(() => {
      if (!dragMoved.current) {
        // Uzun basma → zoom
        setZoomedCard(card);
      }
    }, 480);

    e.currentTarget.setPointerCapture?.(e.pointerId);
    setCardPortal({ card, idx, startX: rect.left, startY: rect.top, w: rect.width, h: rect.height });
  }, [portalY, portalX]);

  const moveCardGesture = useCallback((e) => {
    if (!cardPortal) return;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const offsetY = clientY - (cardPortal.startY + cardPortal.h / 2);
    const offsetX = clientX - (cardPortal.startX + cardPortal.w / 2);

    if (Math.abs(offsetY) > 8 || Math.abs(offsetX) > 8) {
      dragMoved.current = true;
      clearTimeout(longPressRef.current);
    }

    const clampedY = Math.min(30, offsetY); // Allow slight downward but primarily up
    portalY.set(clampedY);
    portalX.set(offsetX * 0.4);
    setPortalCanPlay(offsetY < -80);
  }, [cardPortal, portalY, portalX]);

  const endCardGesture = useCallback(() => {
    clearTimeout(longPressRef.current);
    if (!cardPortal) return;

    if (portalCanPlay) {
      // Uçuş animasyonu
      mvAnimate(portalY, -500, { duration: 0.3, ease: 'easeIn' });
      mvAnimate(portalX, 0, { duration: 0.2 });
      setTimeout(() => {
        playCard(cardPortal.card, cardPortal.idx);
        setCardPortal(null);
        portalY.set(0);
        portalX.set(0);
        setPortalCanPlay(false);
      }, 260);
    } else {
      // Geri dön
      mvAnimate(portalY, 0, { type: 'spring', stiffness: 400, damping: 28 });
      mvAnimate(portalX, 0, { type: 'spring', stiffness: 400, damping: 28 });
      setTimeout(() => {
        setCardPortal(null);
        setPortalCanPlay(false);
      }, 320);
    }
  }, [cardPortal, portalCanPlay, playCard, portalY, portalX]);

  // ── Oyun bitti ────────────────────────────────────────────────────────────
  if (gameOver) {
    return (
      <div style={{ width:'100%',height:'100%', background:theme.bg, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px' }}>
        <motion.div initial={{ scale:0,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ type:'spring',bounce:0.5 }} style={{ textAlign:'center' }}>
          <div style={{ fontSize:'5rem',marginBottom:'16px' }}>{gameOver.iWon ? '🏆' : '💔'}</div>
          <h2 style={{ color:'white',fontSize:'2.5rem',fontWeight:'900',marginBottom:'12px',textShadow:`0 0 30px ${theme.accent}` }}>
            {gameOver.iWon ? 'KAZANDIN! 🎉' : 'KAYBETTİN...'}
          </h2>
          <p style={{ color:'rgba(255,255,255,0.55)',fontSize:'1rem',marginBottom:'32px' }}>
            {gameOver.iWon ? 'Tüm kartlarını bitirdin!' : 'Rakibin tüm kartlarını bitirdi.'}
          </p>
          <motion.button whileTap={{ scale:0.95 }} onClick={onFinish}
            style={{ padding:'18px 48px', background:`linear-gradient(135deg,${theme.accent},${theme.secondary})`, color:'white',border:'none',borderRadius:'20px',fontWeight:'900',fontSize:'1.2rem',cursor:'pointer',boxShadow:`0 8px 25px ${theme.accentGlow}` }}>
            Ana Menü
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Yükleniyor ────────────────────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <div style={{ width:'100%',height:'100%', background:theme.bg, display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1.2,repeat:Infinity,ease:'linear' }} style={{ fontSize:'4rem',marginBottom:'20px' }}>🃏</motion.div>
          <p style={{ color:'white',fontWeight:'700',fontSize:'1.1rem' }}>Desteler hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  // ── Renk glow ─────────────────────────────────────────────────────────────
  const colorGlow = CARD_COLORS[currentColor]?.glow || '#fff';

  return (
    <div style={{ width:'100%',height:'100%', background:theme.bg, display:'flex',flexDirection:'column',position:'relative' }}>

      {/* Renk arka ışık */}
      <div style={{
        position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)',
        width:'400px', height:'400px', borderRadius:'50%',
        background:`radial-gradient(circle,${colorGlow}20 0%,transparent 70%)`,
        pointerEvents:'none', transition:'background 1s ease',
      }}/>

      {/* Yüzen arka plan emojileri */}
      {theme.float.map((f, i) => (
        <motion.div key={i}
          animate={{ y:[0,-25+i*8,0], opacity:[0.07,0.2,0.07], rotate:[0,8*(i%2?1:-1),0] }}
          transition={{ duration:f.d, repeat:Infinity, delay:i*1.2 }}
          style={{ position:'absolute', top:f.t, left:f.x, fontSize:'2.8rem', pointerEvents:'none' }}
        >{f.e}</motion.div>
      ))}

      {/* ── Bildirim ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y:-60,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:-60,opacity:0 }}
            style={{
              position:'fixed', top:12, left:'50%', transform:'translateX(-50%)', zIndex:200,
              background:notification.color, color:'white',
              padding:'10px 24px', borderRadius:'30px',
              fontWeight:'900', fontSize:'0.93rem', whiteSpace:'nowrap',
              boxShadow:'0 6px 20px rgba(0,0,0,0.5)', border:'2px solid rgba(255,255,255,0.35)',
            }}
          >{notification.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* ── RAKİP ALANI ─────────────────────────────────────────────────── */}
      <div style={{ padding:'14px 16px 10px', display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',flexShrink:0 }}>
        <motion.div
          animate={!isMyTurn ? { boxShadow:[`0 0 0 ${theme.accent}00`,`0 0 18px ${theme.accent}`,`0 0 0 ${theme.accent}00`] } : {}}
          transition={{ duration:1.4,repeat:Infinity }}
          style={{
            display:'flex',alignItems:'center',gap:'10px',
            background:!isMyTurn ? theme.handBg : 'rgba(0,0,0,0.3)',
            borderRadius:'20px', padding:'8px 18px',
            border:!isMyTurn ? `2px solid ${theme.accent}` : '2px solid rgba(255,255,255,0.1)',
            transition:'all 0.35s',
          }}
        >
          <span style={{ fontSize:'1.2rem' }}>{players[opponentGender]?.avatar}</span>
          <span style={{ color:'white',fontWeight:'900',fontSize:'0.92rem' }}>{players[opponentGender]?.name}</span>
          {!isMyTurn && (
            <motion.span animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:0.8,repeat:Infinity }}
              style={{ color:theme.accent,fontSize:'0.72rem',fontWeight:'700' }}>⚡ Oynuyor</motion.span>
          )}
        </motion.div>
        <OpponentHand count={theirCount} theme={theme} />
      </div>

      {/* ── OYUN MASASI ─────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex',alignItems:'center',justifyContent:'center',gap:'clamp(14px,5vw,30px)',padding:'0 16px',position:'relative' }}>

        {/* "Kaydır yukarı" bölgesi göstergesi */}
        <AnimatePresence>
          {cardPortal && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{
                position:'absolute', inset:'10px',
                border:`2.5px dashed ${portalCanPlay ? theme.accent : 'rgba(255,255,255,0.2)'}`,
                borderRadius:'20px', pointerEvents:'none',
                background:portalCanPlay ? `${theme.accentGlow}` : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s',
              }}
            >
              <span style={{ color:portalCanPlay?theme.accent:'rgba(255,255,255,0.25)', fontWeight:'900', fontSize:'1rem' }}>
                {portalCanPlay ? '🎯 Bırak!' : '↑ Yukarı kaydır → Oyna'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Çekme destesi */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'7px' }}>
          <motion.div
            whileHover={isMyTurn ? { y:-8,scale:1.06 } : {}}
            whileTap={isMyTurn ? { scale:0.94 } : {}}
            onClick={handleDraw}
            style={{
              width:'clamp(60px,16vw,78px)', height:'clamp(90px,24vw,117px)',
              borderRadius:'12px', background:theme.cardBack,
              border:isMyTurn?`3px solid ${theme.accent}`:`2px solid ${theme.cardBackBorder}`,
              cursor:isMyTurn?'pointer':'default',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',
              boxShadow:isMyTurn?`0 8px 25px ${theme.accentGlow}`:'none',
              backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.025) 8px,rgba(255,255,255,0.025) 16px)',
              transition:'all 0.3s',
            }}
          >🔥</motion.div>
          <span style={{ color:'rgba(255,255,255,0.4)',fontSize:'0.62rem',fontWeight:'900',textTransform:'uppercase',letterSpacing:'1px' }}>ÇEK</span>
        </div>

        {/* Atılan kart / üst kart */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'8px' }}>
          <div style={{ position:'relative' }}>
            <AnimatePresence>
              {animCard && (
                <motion.div key="anim-card"
                  initial={{ scale:1.5,y:-50,opacity:0.7 }} animate={{ scale:1,y:0,opacity:1 }}
                  exit={{ opacity:0 }} transition={{ duration:0.4,type:'spring',bounce:0.3 }}
                  style={{ position:'absolute',inset:0,zIndex:10 }}
                >
                  <UnoCard card={animCard} shadow />
                </motion.div>
              )}
            </AnimatePresence>
            <UnoCard card={topCard} shadow />
          </div>

          {/* Aktif renk noktası */}
          <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
            <motion.div
              animate={{ boxShadow:[`0 0 5px ${colorGlow}`,`0 0 15px ${colorGlow}`,`0 0 5px ${colorGlow}`] }}
              transition={{ duration:1.5,repeat:Infinity }}
              style={{ width:'16px',height:'16px',borderRadius:'50%', background:CARD_COLORS[currentColor]?.bg||'#ccc', border:'2px solid white' }}
            />
            <span style={{ color:'rgba(255,255,255,0.65)',fontSize:'0.7rem',fontWeight:'700',textTransform:'capitalize' }}>{currentColor}</span>
          </div>
          <span style={{ color:'rgba(255,255,255,0.38)',fontSize:'0.6rem',fontWeight:'900',textTransform:'uppercase',letterSpacing:'1px' }}>ATILAN</span>
        </div>

        {/* Sıra göstergesi */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'7px' }}>
          <motion.div
            animate={isMyTurn ? { scale:[1,1.1,1] } : {}}
            transition={{ duration:0.9,repeat:Infinity }}
            style={{
              width:'clamp(52px,13vw,65px)', height:'clamp(52px,13vw,65px)',
              borderRadius:'50%',
              background:isMyTurn?`linear-gradient(135deg,${theme.accent},${theme.secondary})`:'rgba(255,255,255,0.07)',
              border:isMyTurn?'3px solid white':'2px solid rgba(255,255,255,0.12)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.7rem',
              boxShadow:isMyTurn?`0 0 22px ${theme.accentGlow}`:'none',
              transition:'all 0.4s',
            }}
          >{isMyTurn ? '🎯' : '⏳'}</motion.div>
          <span style={{ color:isMyTurn?theme.accent:'rgba(255,255,255,0.3)', fontSize:'0.6rem',fontWeight:'900',textTransform:'uppercase',textAlign:'center' }}>
            {isMyTurn ? 'SEN OYNA' : 'RAKİP'}
          </span>
        </div>
      </div>

      {/* ── BENİM ELİM ──────────────────────────────────────────────────── */}
      <div style={{
        padding:'10px 10px calc(10px + env(safe-area-inset-bottom,0px))',
        background:theme.handBg,
        borderRadius:'24px 24px 0 0',
        backdropFilter:'blur(22px)',
        border:`1px solid ${theme.handBorder}`, borderBottom:'none',
        flexShrink:0,
      }}>
        {/* Başlık */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 4px 6px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
            <span style={{ fontSize:'1rem' }}>{players[localPlayer]?.avatar}</span>
            <span style={{ color:'rgba(255,255,255,0.8)',fontWeight:'700',fontSize:'0.85rem' }}>{players[localPlayer]?.name}</span>
          </div>
          <span style={{
            background:isMyTurn?`linear-gradient(135deg,${theme.accent},${theme.secondary})`:'rgba(255,255,255,0.1)',
            borderRadius:'10px',padding:'3px 10px',color:'white',fontWeight:'900',fontSize:'0.78rem',transition:'all 0.3s',
          }}>{myHand.length} kart</span>
        </div>

        {/* İpucu */}
        {isMyTurn && (
          <p style={{ color:'rgba(255,255,255,0.25)',fontSize:'0.62rem',textAlign:'center',marginBottom:'5px',fontWeight:'600' }}>
            ↑ Kaydır = oyna &nbsp;|&nbsp; Basılı tut = detay gör
          </p>
        )}

        {/* Kartlar */}
        <div style={{
          display:'flex', gap:'8px',
          overflowX:'auto', overflowY:'visible',
          padding:'6px 4px 8px',
          scrollbarWidth:'none', WebkitOverflowScrolling:'touch',
          minHeight:'clamp(130px,34vw,160px)',
        }}>
          <AnimatePresence>
            {myHand.map((card, idx) => (
              <motion.div
                key={`${card.id}-${idx}`}
                initial={{ scale:0,y:50,opacity:0 }}
                animate={{ scale:1,y:0,opacity:1 }}
                exit={{ scale:0,y:-80,opacity:0 }}
                transition={{ type:'spring',bounce:0.3,delay:idx*0.025 }}
                style={{
                  flexShrink:0,
                  opacity: cardPortal?.idx === idx ? 0 : 1,
                  transition:'opacity 0.05s',
                  cursor:'grab',
                }}
                onPointerDown={e => startCardGesture(card, idx, e)}
                onPointerMove={moveCardGesture}
                onPointerUp={endCardGesture}
                onPointerCancel={endCardGesture}
              >
                <UnoCard card={card} size="md" shadow={false} />
              </motion.div>
            ))}
          </AnimatePresence>
          {myHand.length === 0 && (
            <div style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)',fontSize:'0.9rem',padding:'20px' }}>
              El boş!
            </div>
          )}
        </div>
      </div>

      {/* ── PORTAL: sürüklenen kart ─────────────────────────────────────── */}
      {cardPortal && createPortal(
        <motion.div
          style={{
            position:'fixed',
            left: cardPortal.startX,
            top: cardPortal.startY,
            width: cardPortal.w,
            height: cardPortal.h,
            zIndex:999,
            x: portalX,
            y: portalY,
            pointerEvents:'none',
          }}
        >
          <div style={{ filter:portalCanPlay?`drop-shadow(0 0 16px ${theme.accent})`:'none', transition:'filter 0.2s', transform:portalCanPlay?'scale(1.08)':'scale(1)', transition:'transform 0.2s' }}>
            <UnoCard card={cardPortal.card} size="md" shadow />
          </div>
        </motion.div>,
        document.body
      )}

      {/* ── MODALLER ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showColorPicker && <ColorPicker onSelect={handleColorSelect} />}
      </AnimatePresence>
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
      <AnimatePresence>
        {drawnCard && <DrawnCardPreview card={drawnCard} onDismiss={confirmDrawn} />}
      </AnimatePresence>
      <AnimatePresence>
        {zoomedCard && <ZoomOverlay card={zoomedCard} onClose={() => setZoomedCard(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Game;
