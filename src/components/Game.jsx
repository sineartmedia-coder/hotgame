import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, animate as mvAnimate } from 'framer-motion';
import { MOCK_CARDS, MOCK_QUESTIONS } from '../data/cards';
import { dealGame, canPlayCard, CARD_TYPES, UNO_COLORS, buildUnoDeck, shuffle } from '../data/unoDeck';
import { useMultiplayer } from '../context/MultiplayerContext';
import { Mic, MicOff } from 'lucide-react';

// ─── Temalar: Kadın vs Erkek ──────────────────────────────────────────────────
const THEMES = {
  woman: {
    bg: 'radial-gradient(ellipse 140% 80% at 50% -10%, #4a0033 0%, #26001b 25%, #11000c 55%, #050005 100%)',
    accent: '#f72585',
    accentGlow: 'rgba(247,37,133,0.45)',
    secondary: '#b5179e',
    cardBack: 'rgba(20, 5, 15, 0.8)',
    cardBackBorder: 'rgba(247,37,133,0.4)',
    handBg: 'rgba(30, 0, 20, 0.45)',
    handBorder: 'rgba(247,37,133,0.25)',
    float: [
      { e: '💋', x: '8%',  t: '8%',  d: 5.5 },
      { e: '🌹', x: '85%', t: '15%', d: 7.0 },
      { e: '✨', x: '12%', t: '55%', d: 4.5 },
      { e: '💜', x: '80%', t: '60%', d: 6.0 },
    ],
  },
  man: {
    bg: 'radial-gradient(ellipse 140% 80% at 50% -10%, #001a33 0%, #000c1a 25%, #00050d 55%, #000205 100%)',
    accent: '#ff7900',
    accentGlow: 'rgba(255,121,0,0.45)',
    secondary: '#f5af19',
    cardBack: 'rgba(5, 15, 25, 0.8)',
    cardBackBorder: 'rgba(255,121,0,0.4)',
    handBg: 'rgba(0, 15, 30, 0.45)',
    handBorder: 'rgba(255,121,0,0.25)',
    float: [
      { e: '🔥', x: '8%',  t: '8%',  d: 5.0 },
      { e: '⚡', x: '85%', t: '18%', d: 6.5 },
      { e: '💥', x: '10%', t: '55%', d: 4.0 },
      { e: '🖤', x: '82%', t: '58%', d: 7.0 },
    ],
  },
};

// ─── YENİ PREMIUM KART RENKLERİ (Neon / Glassmorphic) ──────────────────────
const CARD_COLORS = {
  kırmızı: { glow: '#ff3366', text: '#fff', bgOrb: 'linear-gradient(135deg, #d32f2f, #e53935)' },
  mavi:    { glow: '#33eeff', text: '#fff', bgOrb: 'linear-gradient(135deg, #1976d2, #1e88e5)' },
  yeşil:   { glow: '#6bff4a', text: '#fff', bgOrb: 'linear-gradient(135deg, #388e3c, #43a047)' },
  sarı:    { glow: '#ffdb33', text: '#fff', bgOrb: 'linear-gradient(135deg, #fbc02d, #fdd835)' },
};

// ─── Random card pool ─────────────────────────────────────────────────────────
const _pool = [];
const getRandomCard = (usedTaskIds = []) => {
  if (_pool.length < 6) shuffle(buildUnoDeck([], usedTaskIds)).forEach(c => _pool.push(c));
  return { ..._pool.shift(), id: Date.now() + Math.random() * 100000 };
};

// ─── YENİ UnoCard Tasarımı ───────────────────────────────────────────────────
const UnoCard = ({ card, size = 'md', shadow = false }) => {
  if (!card) return null;

  const isTask    = card.type === CARD_TYPES.TASK;
  const isWild    = card.type === CARD_TYPES.WILD;
  const isSkip    = card.type === CARD_TYPES.SKIP;
  const isReverse = card.type === CARD_TYPES.REVERSE;

  const ct = CARD_COLORS[card.color] || CARD_COLORS.kırmızı;

  const dims = {
    sm:   { w: '52px',  h: '78px',  nf: '1.8rem', sf: '0.55rem' },
    md:   { w: 'clamp(78px,21vw,98px)', h: 'clamp(117px,31vw,147px)', nf: 'clamp(2.5rem,7vw,3.2rem)', sf: 'clamp(0.6rem,1.5vw,0.75rem)' },
    lg:   { w: '160px', h: '240px', nf: '5.5rem', sf: '1rem' },
  };
  const d = dims[size] || dims.md;

  const cardBorder = isTask 
    ? 'rgba(255,60,0,0.5)' 
    : isWild 
    ? 'rgba(255,255,255,0.3)' 
    : `${ct.glow}66`;

  const cardShadow = shadow 
    ? `0 15px 35px rgba(0,0,0,0.8), inset 0 0 15px ${isTask ? 'rgba(255,60,0,0.2)' : isWild ? 'rgba(255,255,255,0.1)' : `${ct.glow}20`}`
    : `inset 0 0 8px ${isTask ? 'rgba(255,60,0,0.15)' : isWild ? 'rgba(255,255,255,0.05)' : `${ct.glow}15`}`;

  return (
    <div style={{
      width: d.w, height: d.h, borderRadius: '14px',
      background: (!isTask && !isWild) ? ct.bgOrb : 'rgba(15, 15, 22, 0.85)', // Use solid gradients for number/skip/reverse cards
      backdropFilter: 'blur(10px)',
      border: `1px solid ${cardBorder}`,
      position: 'relative', overflow: 'hidden',
      boxShadow: cardShadow,
      userSelect: 'none', WebkitUserSelect: 'none',
      flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Cam yansıması (shine) */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'45%',
        background:'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        pointerEvents:'none', zIndex: 5
      }}/>

      {/* Arka plan renkli aura (Orb) */}
      {!isTask && !isWild && (
        <div style={{ position: 'absolute', inset: '-30%', background: ct.bgOrb, pointerEvents: 'none' }} />
      )}
      {isTask && (
        <div style={{ position: 'absolute', inset: '-30%', background: 'radial-gradient(circle at center, rgba(255,60,0,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
      )}
      {isWild && (
        <div style={{ position: 'absolute', inset: '-30%', background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
      )}

      {/* SAYI KARTLARI */}
      {!isTask && !isWild && !isSkip && !isReverse && (
        <>
          {/* Sol üst */}
          <div style={{ position:'absolute', top:'6px', left:'8px', color: ct.text, fontWeight:'700', fontSize: d.sf, zIndex: 2 }}>
            {card.value}
          </div>
          {/* Merkez büyük sayı */}
          <div style={{
            fontSize: d.nf, fontWeight:'300', color:'#ffffff', fontStyle:'italic', zIndex: 2,
            textShadow: `0 0 25px ${ct.glow}, 0 2px 10px rgba(0,0,0,0.9)`
          }}>
            {card.value}
          </div>
          {/* Sağ alt (ters) */}
          <div style={{ position:'absolute', bottom:'6px', right:'8px', color: ct.text, fontWeight:'700', fontSize: d.sf, transform:'rotate(180deg)', zIndex: 2 }}>
            {card.value}
          </div>
        </>
      )}

      {/* SKIP / REVERSE */}
      {(isSkip || isReverse) && (
        <>
          <div style={{ position:'absolute', top:'6px', left:'8px', color: ct.text, fontWeight:'700', fontSize: d.sf, zIndex: 2 }}>
            {isSkip ? '⊘' : '↩'}
          </div>
          <div style={{ fontSize: size==='sm' ? '2rem' : size==='lg' ? '4.5rem' : 'clamp(2.5rem,7vw,3.5rem)', color:'#fff', zIndex: 2, textShadow: `0 0 25px ${ct.glow}` }}>
            {isSkip ? '⊘' : '↩'}
          </div>
          <div style={{ position:'absolute', bottom:'6px', right:'8px', color: ct.text, fontWeight:'700', fontSize: d.sf, transform:'rotate(180deg)', zIndex: 2 }}>
            {isSkip ? '⊘' : '↩'}
          </div>
        </>
      )}

      {/* WILD */}
      {isWild && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'10px', zIndex: 2 }}>
          <div style={{
            width: size==='sm'?'24px':size==='lg'?'60px':'clamp(36px,10vw,48px)',
            height: size==='sm'?'24px':size==='lg'?'60px':'clamp(36px,10vw,48px)',
            borderRadius:'50%',
            background:'conic-gradient(#ff003c 0 90deg, #00e5ff 90deg 180deg, #39ff14 180deg 270deg, #ffcc00 270deg 360deg)',
            border:'2px solid rgba(255,255,255,0.8)',
            boxShadow:'0 0 25px rgba(255,255,255,0.3)',
          }}/>
        </div>
      )}

      {/* GÖREV KARTI */}
      {isTask && (
        <>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between', padding: size==='sm'?'5px':'12px', zIndex: 2, width: '100%', height: '100%' }}>
            <span style={{ fontSize: size==='sm'?'1rem':size==='lg'?'2rem':'1.5rem', textShadow:'0 0 15px rgba(255,60,0,0.8)' }}>🔥</span>
            
            {size !== 'sm' && (card.taskData?.title || card.taskData?.text) && (
              <div style={{
                color:'rgba(255,255,255,0.95)', fontWeight:'600',
                fontSize: size==='lg' ? '1.1rem' : 'clamp(0.65rem,1.8vw,0.85rem)',
                textAlign:'center', lineHeight:1.3,
                textShadow:'0 2px 4px rgba(0,0,0,0.8)',
                flex: 1, display: 'flex', alignItems: 'center'
              }}>
                {card.taskData.title || (card.taskData.text.substring(0, 15) + '...')}
              </div>
            )}
            
            <div style={{
              background:'rgba(255,100,0,0.15)', border:'1px solid rgba(255,100,0,0.4)', 
              borderRadius:'8px', padding:'3px 10px', backdropFilter:'blur(4px)'
            }}>
              <span style={{ color:'#ff8c00', fontWeight:'800', fontSize: size==='sm'?'0.65rem':size==='lg'?'1.2rem':'0.85rem' }}>
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
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', position:'relative', height:'80px' }}>
      {[...Array(n)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ x:(i - (n-1)/2)*18, rotate:(i - (n-1)/2)*5 }}
          style={{
            position:'absolute',
            width:'50px', height:'74px', borderRadius:'10px',
            background: theme.cardBack,
            border:`1px solid ${theme.cardBackBorder}`,
            boxShadow:'0 6px 15px rgba(0,0,0,0.7)',
            display:'flex',alignItems:'center',justifyContent:'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${theme.accent}`, opacity: 0.3 }} />
        </motion.div>
      ))}
      {count > 0 && (
        <div style={{
          position:'absolute', bottom:'-22px',
          background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.8)',
          borderRadius:'12px', padding:'4px 12px', border: `1px solid rgba(255,255,255,0.1)`,
          fontSize:'0.75rem', fontWeight:'700',
        }}>{count} kart</div>
      )}
    </div>
  );
};

// ─── Renk Seçici ─────────────────────────────────────────────────────────────
const ColorPicker = ({ onSelect }) => (
  <motion.div
    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    style={{ position:'fixed',inset:0,zIndex:300, display:'flex',alignItems:'center',justifyContent:'center', background:'rgba(0,0,0,0.9)', backdropFilter:'blur(15px)' }}
  >
    <motion.div initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.8,opacity:0 }} transition={{ type:'spring',bounce:0.4 }}
      style={{ textAlign:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.9)',fontWeight:'300',fontSize:'1.8rem',marginBottom:'30px', letterSpacing:'2px' }}>RENK SEÇ</p>
      <div style={{ display:'flex',gap:'20px',justifyContent:'center', flexWrap: 'wrap', padding: '0 20px' }}>
        {UNO_COLORS.map(color => (
          <motion.button key={color} whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }} onClick={() => onSelect(color)}
            style={{
              width:'80px',height:'80px',borderRadius:'50%',
              background: 'rgba(20,20,25,0.8)',
              border:`2px solid ${CARD_COLORS[color]?.glow}`, cursor:'pointer',
              boxShadow:`0 0 25px ${CARD_COLORS[color]?.glow}55, inset 0 0 15px ${CARD_COLORS[color]?.glow}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: CARD_COLORS[color]?.glow, boxShadow: `0 0 20px ${CARD_COLORS[color]?.glow}` }} />
          </motion.button>
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
      style={{ position:'fixed',inset:0,zIndex:290, background:'rgba(0,0,0,0.9)',backdropFilter:'blur(12px)', display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'25px',padding:'20px' }}
    >
      <motion.div
        initial={{ scale:0.8,y:40,opacity:0 }} animate={{ scale:1,y:0,opacity:1 }} exit={{ scale:0.8,opacity:0 }}
        transition={{ type:'spring',bounce:0.35 }}
        onClick={e => e.stopPropagation()}
      >
        <UnoCard card={card} size="lg" shadow />
      </motion.div>

      {((card.type === CARD_TYPES.TASK && card.taskData) || (card.type === CARD_TYPES.SKIP && card.questionData)) && (
        <motion.div
          initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          onClick={e => e.stopPropagation()}
          style={{ background:'rgba(15,15,22,0.9)', borderRadius:'24px', padding:'24px', maxWidth:'340px', width:'100%', textAlign:'center', border:'1px solid rgba(255,60,0,0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
        >
          {(() => {
            const data = card.type === CARD_TYPES.SKIP ? card.questionData : card.taskData;
            return (
              <>
                <h3 style={{ color:'#fff',fontWeight:'600',fontSize:'1.2rem',marginBottom:'12px' }}>{data.title || (card.type === CARD_TYPES.SKIP ? 'Soru Kartı' : 'Görev')}</h3>
                <p style={{ color:'rgba(255,255,255,0.7)',lineHeight:1.6,fontSize:'0.95rem',marginBottom:'10px' }}>{data.text}</p>
                <div style={{ display:'flex',justifyContent:'center',gap:'8px',marginBottom:'20px' }}>
                  {data.isDiceBased && <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', color:'#fff' }}>🎲 Zar At</span>}
                  {data.isTimeBased && <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', color:'#fff' }}>⏱ {data.duration}sn</span>}
                  {data.isGame && <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', color:'#fff' }}>🎮 Oyun</span>}
                </div>
                {card.type === CARD_TYPES.TASK && (
                  <div style={{ display:'flex',justifyContent:'center',gap:'8px',flexWrap:'wrap',fontSize:'0.8rem' }}>
                    {data.target === 'ortak' ? (
                      <>
                        <span style={{ background:'rgba(46,125,50,0.2)',color:'#6bff4a',padding:'4px 12px',borderRadius:'12px',fontWeight:'700',border:'1px solid rgba(46,125,50,0.5)' }}>Kazanan Çeker: {data.winnerDrawCount || 0}</span>
                        <span style={{ background:'rgba(198,40,40,0.2)',color:'#ff3366',padding:'4px 12px',borderRadius:'12px',fontWeight:'700',border:'1px solid rgba(198,40,40,0.5)' }}>Kaybeden Çeker: {data.loserDrawCount || 0}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ background:'rgba(46,125,50,0.2)',color:'#6bff4a',padding:'4px 12px',borderRadius:'12px',fontWeight:'700',border:'1px solid rgba(46,125,50,0.5)' }}>✅ Yapar: +{card.penaltyDo}</span>
                        <span style={{ background:'rgba(230,81,0,0.2)',color:'#ffb703',padding:'4px 12px',borderRadius:'12px',fontWeight:'700',border:'1px solid rgba(230,81,0,0.5)' }}>😅 Yapamaz: +{card.penaltyFail}</span>
                        <span style={{ background:'rgba(198,40,40,0.2)',color:'#ff3366',padding:'4px 12px',borderRadius:'12px',fontWeight:'700',border:'1px solid rgba(198,40,40,0.5)' }}>🚫 Reddeder: +{card.penaltyRefuse}</span>
                      </>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>
      )}
      <p style={{ color:'rgba(255,255,255,0.4)',fontSize:'0.85rem', letterSpacing: '1px' }}>KAPATMAK İÇİN DOKUN</p>
    </motion.div>
  );
};

// ─── Görev Modal (bottom sheet) ───────────────────────────────────────────────
const TaskModal = ({ card, isAttacker, isOrtak, opponentName, opponentAvatar, onResult, onClose }) => {
  const isQuestion = card?.type === CARD_TYPES.SKIP && card?.questionData;
  const data = isQuestion ? card?.questionData : card?.taskData;
  if (!data) return null;
  
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed',inset:0,zIndex:280, display:'flex',alignItems:'flex-end',justifyContent:'center', background:'rgba(0,0,0,0.85)',backdropFilter:'blur(10px)',padding:'0 0 env(safe-area-inset-bottom,0px)' }}
    >
      <motion.div
        initial={{ y:320,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:320,opacity:0 }}
        transition={{ type:'spring',bounce:0.3 }}
        style={{ background:'rgba(15,15,22,0.95)',borderRadius:'32px 32px 0 0',padding:'32px 24px 36px',maxWidth:'440px',width:'100%', borderTop: `1px solid ${isAttacker?'rgba(255,121,0,0.4)':'rgba(247,37,133,0.4)'}`, boxShadow: '0 -10px 40px rgba(0,0,0,0.8)' }}
      >
        <div style={{ textAlign:'center',marginBottom:'24px' }}>
          <div style={{ fontSize:'3rem',marginBottom:'12px', textShadow: `0 0 20px ${isAttacker?'rgba(255,121,0,0.5)':'rgba(247,37,133,0.5)'}` }}>
            {isAttacker ? '⚔️' : opponentAvatar}
          </div>
          <h3 style={{ color: '#fff', fontSize:'1.4rem',fontWeight:'300', letterSpacing: '1px' }}>
            {isAttacker ? (isQuestion ? `${opponentName}'a Soru!` : (isOrtak ? 'Ortak Görev!' : `${opponentName}'a Görev!`)) : (isQuestion ? '🎯 Sana Soru Geldi!' : (isOrtak ? 'Ortak Görev!' : '🎯 Sana Görev Geldi!'))}
          </h3>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)',borderRadius:'20px',padding:'20px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'20px' }}>
          <p style={{ fontWeight:'600',fontSize:'1.1rem',color:'#fff',marginBottom:'10px' }}>{data.title || (isQuestion ? 'Soru Kartı' : 'Yeni Görev')}</p>
          <p style={{ color:'rgba(255,255,255,0.7)',lineHeight:1.6,fontSize:'0.95rem',marginBottom:'10px' }}>{data.text}</p>
          <div style={{ display:'flex',justifyContent:'center',gap:'8px',marginBottom:'10px' }}>
            {data.isDiceBased && <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', color:'#fff' }}>🎲 Zar Atılacak</span>}
            {data.isTimeBased && <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', color:'#fff' }}>⏱ Süre: {data.duration}sn</span>}
            {data.isGame && <span style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'12px', fontSize:'0.8rem', color:'#fff' }}>🎮 Mini Oyun</span>}
          </div>
        </div>
        
        {!isQuestion && !isOrtak && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#6bff4a', background: 'rgba(107,255,74,0.1)', padding: '6px 12px', borderRadius: '12px' }}>✅ Yapar: +{card.penaltyDo}</span>
            <span style={{ fontSize: '0.8rem', color: '#ffb703', background: 'rgba(255,183,3,0.1)', padding: '6px 12px', borderRadius: '12px' }}>😅 Yapamaz: +{card.penaltyFail}</span>
            <span style={{ fontSize: '0.8rem', color: '#ff3366', background: 'rgba(255,51,102,0.1)', padding: '6px 12px', borderRadius: '12px' }}>🚫 Reddeder: +{card.penaltyRefuse}</span>
          </div>
        )}

        {isQuestion && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
             <span style={{ fontSize: '0.8rem', color: '#6bff4a', background: 'rgba(107,255,74,0.1)', padding: '6px 12px', borderRadius: '12px' }}>Cevap ver ve sırayı atla!</span>
          </div>
        )}

        {isOrtak && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
             <span style={{ fontSize: '0.8rem', color: '#6bff4a', background: 'rgba(107,255,74,0.1)', padding: '6px 12px', borderRadius: '12px' }}>Kazanan: {data.winnerDrawCount} Kart</span>
             <span style={{ fontSize: '0.8rem', color: '#ff3366', background: 'rgba(255,51,102,0.1)', padding: '6px 12px', borderRadius: '12px' }}>Kaybeden: {data.loserDrawCount} Kart</span>
             {data.winnerMinusPoints > 0 && <span style={{ fontSize: '0.8rem', color: '#00e5ff', background: 'rgba(0,229,255,0.1)', padding: '6px 12px', borderRadius: '12px' }}>Avantaj: -{data.winnerMinusPoints} Puan</span>}
          </div>
        )}

        {isAttacker && !isOrtak && (
          <motion.button whileTap={{ scale:0.95 }} onClick={onClose}
            style={{ width:'100%',padding:'18px',background:'linear-gradient(135deg,#ff7900,#f5af19)',color:'white',border:'none',borderRadius:'16px',fontWeight:'800',fontSize:'1.1rem',cursor:'pointer', boxShadow: '0 8px 20px rgba(255,121,0,0.4)' }}>
            {isQuestion ? 'SORUYU GÖNDER' : 'GÖREVİ GÖNDER'}
          </motion.button>
        )}

        {isAttacker && isOrtak && onResult && (
          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
            {data.winType === 'single' ? (
              <>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('ortak_resolved', { winner: 'me' })}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #1b5e20, #2e7d32)',color:'white',border:'1px solid rgba(107,255,74,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  Ben Kazandım
                </motion.button>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('ortak_resolved', { winner: 'them' })}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #b71c1c, #c62828)',color:'white',border:'1px solid rgba(255,51,102,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  Rakip Kazandı
                </motion.button>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('ortak_resolved', { winner: 'none' })}
                  style={{ padding:'16px',background:'transparent',color:'white',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  Berabere (İptal)
                </motion.button>
              </>
            ) : (
              <>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('ortak_resolved', { winner: 'both' })}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #1b5e20, #2e7d32)',color:'white',border:'1px solid rgba(107,255,74,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  Evet, Yaptık!
                </motion.button>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('ortak_resolved', { winner: 'none' })}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #b71c1c, #c62828)',color:'white',border:'1px solid rgba(255,51,102,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  Hayır, Yapamadık!
                </motion.button>
              </>
            )}
          </div>
        )}

        {!isAttacker && isOrtak && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontStyle: 'italic' }}>
            Sonuç bekleniyor...
          </div>
        )}

        {!isAttacker && !isOrtak && onResult && (
          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
            {isQuestion ? (
              <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('done')}
                style={{ padding:'16px',background:'linear-gradient(135deg, #1b5e20, #2e7d32)',color:'white',border:'1px solid rgba(107,255,74,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                ✅ Devam Et
              </motion.button>
            ) : (
              <>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('done')}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #1b5e20, #2e7d32)',color:'white',border:'1px solid rgba(107,255,74,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  ✅ Yaptım! (+{card.penaltyDo} kart)
                </motion.button>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('fail')}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #e65100, #f57c00)',color:'white',border:'1px solid rgba(255,183,3,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  😅 Yapamadım (+{card.penaltyFail} kart)
                </motion.button>
                <motion.button whileTap={{ scale:0.95 }} onClick={() => onResult('refuse')}
                  style={{ padding:'16px',background:'linear-gradient(135deg, #b71c1c, #c62828)',color:'white',border:'1px solid rgba(255,51,102,0.4)',borderRadius:'16px',fontWeight:'700',cursor:'pointer',fontSize:'1rem' }}>
                  🚫 Reddediyorum (+{card.penaltyRefuse} kart)
                </motion.button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Çekilen kart önizleme (Artık manuel çekimde kullanılıyor) ────────────────
const DrawnCardPreview = ({ card, onDismiss, pendingCount }) => (
  <motion.div
    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    onClick={onDismiss}
    style={{ position:'fixed',inset:0,zIndex:310, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'25px', background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)' }}
  >
    <motion.div
      initial={{ scale:0.5,y:200,rotate:-15 }} animate={{ scale:1,y:0,rotate:0 }} exit={{ scale:0.5,y:-150,opacity:0 }}
      transition={{ type:'spring',bounce:0.4 }}
      style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'20px' }}
    >
      <p style={{ color:'#fff',fontWeight:'300',fontSize:'1.5rem',textAlign:'center', letterSpacing:'2px' }}>
        KART ÇEKTİN
      </p>
      <UnoCard card={card} size="lg" shadow />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <p style={{ color:'rgba(255,255,255,0.5)',fontSize:'0.85rem', letterSpacing:'1px' }}>ALMAK İÇİN DOKUN</p>
        {pendingCount > 1 && (
          <p style={{ color:'#ff3366', fontWeight:'700', fontSize:'0.9rem' }}>{pendingCount - 1} KART DAHA ÇEKMELİSİN!</p>
        )}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
const Game = ({ players, setPlayers, startingPlayer, onFinish, settings, usedTaskIds, setUsedTaskIds }) => {
  const { localPlayer, sendData, onData, role, remoteStream, isMuted, toggleMute } = useMultiplayer();
  const theme = THEMES[localPlayer] || THEMES.woman;
  const opponentGender = localPlayer === 'woman' ? 'man' : 'woman';

  // ── Oyun durumu ────────────────────────────────────────────────────────────
  const [myHand,          setMyHand]          = useState([]);
  const [theirCount,      setTheirCount]      = useState(0);
  const [topCard,         setTopCard]         = useState(null);
  const [currentColor,    setCurrentColor]    = useState('kırmızı');
  const [isMyTurn,        setIsMyTurn]        = useState(false);
  const [gameStarted,     setGameStarted]     = useState(false);
  const [pendingDrawCount,setPendingDrawCount]= useState(0); // Manuel ceza kartı çekme sayısı
  const [pistiCard,       setPistiCard]       = useState(null);
  const [commonTaskTimer, setCommonTaskTimer] = useState(0);
  const gameDurationMs = (settings.duration || 60) * 60 * 1000;

  // ── UI durumu ─────────────────────────────────────────────────────────────
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard,     setPendingCard]     = useState(null);
  const [taskModal,       setTaskModal]       = useState(null);
  const [pendingTaskCard, setPendingTaskCard] = useState(null);
  const [notification,    setNotification]    = useState(null);
  const [zoomedCard,      setZoomedCard]      = useState(null);
  const [drawnCard,       setDrawnCard]       = useState(null);
  const [animCard,        setAnimCard]        = useState(null);
  const [gameOver,        setGameOver]        = useState(null);

  // ── Portal sürükleme durumu ────────────────────────────────────────────────
  const [cardPortal,     setCardPortal]     = useState(null);
  const [portalCanPlay,  setPortalCanPlay]  = useState(false);
  const portalY       = useMotionValue(0);
  const portalX       = useMotionValue(0);
  const longPressRef  = useRef(null);
  const dragMoved     = useRef(false);

  const notifTimer = useRef(null);
  const showNotif = useCallback((msg, color = '#f72585', duration = 3000) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotification({ msg, color });
    if (duration > 0) {
      notifTimer.current = setTimeout(() => setNotification(null), duration);
    }
  }, []);

  const remoteAudioRef = useRef(null);
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ── Oyun başlangıcı ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localPlayer || gameStarted) return;
    if (role === 'host') {
      const deckSize  = settings.deckSize || 7;
      const taskCount = settings.taskCardCount ?? 3;
      const dealt = dealGame(deckSize, taskCount, localPlayer, MOCK_CARDS, MOCK_QUESTIONS, usedTaskIds);

      setMyHand(dealt.myHand);
      setTheirCount(dealt.theirHand.length);
      setTopCard(dealt.topCard);
      setCurrentColor(dealt.topCard.color);

      // Pick Pişti Card
      const randomColor = UNO_COLORS[Math.floor(Math.random() * UNO_COLORS.length)];
      const randomValue = Math.floor(Math.random() * 10);
      const newPisti = { color: randomColor, value: randomValue, type: CARD_TYPES.NUMBER };
      setPistiCard(newPisti);

      const hostStarts = Math.random() < 0.5;
      setIsMyTurn(hostStarts);
      setGameStarted(true);
      setCommonTaskTimer(Date.now());

      sendData({
        type: 'gameInit',
        theirHand: dealt.theirHand,
        myHandCount: dealt.myHand.length,
        topCard: dealt.topCard,
        currentColor: dealt.topCard.color,
        hostStarts,
        pistiCard: newPisti
      });
    }
  }, [localPlayer, role, gameStarted, settings, sendData, usedTaskIds]);

  // ── Data handler ───────────────────────────────────────────────────────────
  const handleData = useCallback((data) => {
    switch (data.type) {
      case 'gameInit':
        setMyHand(data.theirHand);
        setTheirCount(data.myHandCount);
        setTopCard(data.topCard);
        setCurrentColor(data.currentColor);
        setPistiCard(data.pistiCard);
        setIsMyTurn(!data.hostStarts);
        setGameStarted(true);
        setCommonTaskTimer(Date.now());
        break;

      case 'cardPlayed':
        setTopCard(data.card);
        setCurrentColor(data.newColor);
        setTheirCount(data.handCount);
        setAnimCard(data.card);
        setTimeout(() => setAnimCard(null), 700);

        if (data.handCount === 0) { setGameOver({ iWon: false }); return; }
        
        if (data.card.type === CARD_TYPES.TASK) {
          // Rakip görev kartı attı. Biz savunanız.
          setPendingTaskCard(data.card);
          setTaskModal({ card: data.card, isAttacker: false, isOrtak: false });
          return;
        }
        if (data.card.type === CARD_TYPES.SKIP || data.card.type === CARD_TYPES.REVERSE) {
          if (data.card.questionData) {
            if (data.card.questionData.id) setUsedTaskIds(prev => [...prev, data.card.questionData.id]);
            setPendingTaskCard(data.card);
            setTaskModal({ card: data.card, isAttacker: false, isOrtak: false });
            return;
          }
          // if no question data, just skip normally
          setIsMyTurn(false);
          showNotif(`${players[opponentGender]?.name} sıranı ${data.card.type === CARD_TYPES.SKIP ? 'atladı' : 'döndürdü'}! ⊘`, '#ff3366');
          return;
        }
        setIsMyTurn(true);
        break;

      case 'taskResult':
        if (data.result === 'ortak_resolved') {
          const { meDraw, themDraw, meMinus, themMinus, message } = data;
          showNotif(message, '#ffcc00', 4000);
          if (themDraw > 0) setPendingDrawCount(themDraw);
          if (themMinus > 0) {
            setPlayers(p => ({ ...p, [localPlayer]: { ...p[localPlayer], score: (p[localPlayer].score || 0) - themMinus } }));
          }
          if (meMinus > 0) {
             setPlayers(p => ({ ...p, [opponentGender]: { ...p[opponentGender], score: (p[opponentGender].score || 0) - meMinus } }));
          }
          setTaskModal(null);
        } else {
          // Bu bir normal görev sonucudur. Attacker "yaptı" veya "yapamadı" seçti, defender olarak sonucu ve cezayı alıyoruz.
          const { penalty, resultLabel } = data;
          showNotif(`Görev Sonucu: ${resultLabel}! ${penalty > 0 ? penalty + ' ceza kartı alıyorsun.' : 'Ceza yok.'}`, '#ffcc00', 4000);
          if (penalty > 0) setPendingDrawCount(penalty);
          setTaskModal(null);
        }
        break;

      case 'commonTaskTrigger':
        // Ortak görev tetiklendi! İki oyuncuya da aynı anda çıkar.
        const commonCard = data.card;
        if (commonCard.taskData?.id) setUsedTaskIds(prev => [...prev, commonCard.taskData.id]);
        setPendingTaskCard(commonCard);
        setTaskModal({ card: commonCard, isAttacker: role === 'host', isOrtak: true }); // Sadece Host kararı verir!
        break;

      case 'cardDrawn':
        setTheirCount(data.handCount);
        break;

      case 'turnPass':
        setIsMyTurn(true);
        setNotification(null);
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

  // ── Ortak Görev Zamanlayıcısı ──────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || role !== 'host') return;
    const interval = setInterval(() => {
      // Rastgele bir zamanda veya 5 dakikada bir (Şimdilik test için 5 dakika = 300,000 ms, ama biz her 1 dakikada %10 şans verelim)
      // Kullanıcı "5 dakika içerisinde oyun bitmemişse aniden ortaya çıkacak" dedi.
      const elapsed = Date.now() - commonTaskTimer;
      if (elapsed > 300000) { // 5 dakika (300 saniye)
        setCommonTaskTimer(Date.now()); // Süreyi sıfırla
        const poolOrtak = (require('../data/cards').MOCK_COMMON_TASKS || []).filter(c => !usedTaskIds.includes(c.id));
        if (poolOrtak.length > 0) {
          const cardData = poolOrtak[Math.floor(Math.random() * poolOrtak.length)];
          const card = {
            id: 99000 + Math.random(),
            type: CARD_TYPES.TASK,
            taskData: cardData,
            display: 'Ortak Görev'
          };
          if (cardData.id) setUsedTaskIds(prev => [...prev, cardData.id]);
          sendData({ type: 'commonTaskTrigger', card });
          setPendingTaskCard(card);
          setTaskModal({ card, isAttacker: true, isOrtak: true }); // Host yönetir
        }
      }
    }, 10000); // Her 10 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, [gameStarted, role, commonTaskTimer, sendData, usedTaskIds]);

  // ── Kart oyna ─────────────────────────────────────────────────────────────
  const playCard = useCallback((card, idx) => {
    if (!isMyTurn) { showNotif('Sıra sende değil!', '#666'); return; }
    if (pendingDrawCount > 0) { showNotif(`Önce ${pendingDrawCount} ceza kartını çekmelisin!`, '#ff3366'); return; }
    
    if (!canPlayCard(card, topCard, currentColor)) {
      showNotif('Bu kartı atamazsın!', '#ff3366'); return;
    }
    if (card.type === CARD_TYPES.WILD) {
      setPendingCard({ card, idx });
      setShowColorPicker(true);
      return;
    }
    doPlay(card, idx, card.color);
  }, [isMyTurn, pendingDrawCount, topCard, currentColor, showNotif]);

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
      // Biz görev kartı attık. Biz attacker'ız.
      if (card.taskData?.id) setUsedTaskIds(prev => [...prev, card.taskData.id]);
      setPendingTaskCard(card);
      setTaskModal({ card, isAttacker: true, isOrtak: false });
      // Sıramız BİTMİYOR! Görev atıldıktan sonra normal kart atmaya devam edebilmeliyiz.
      return;
    }
    
    if (card.type === CARD_TYPES.SKIP || card.type === CARD_TYPES.REVERSE) {
      if (card.questionData) {
        if (card.questionData.id) setUsedTaskIds(prev => [...prev, card.questionData.id]);
        // Rakip cevaplayacak ve pas geçecek
        setIsMyTurn(false);
        showNotif('Soru rakibe iletildi, devam etmesi bekleniyor... ⏳', '#ff7900', 0);
        return;
      }
      showNotif(`Sırayı ${card.type === CARD_TYPES.SKIP ? 'atladın' : 'döndürdün'}! ⊘ Tekrar sen oynuyorsun.`, '#33eeff');
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

  // ── Kart çek (Manuel) ─────────────────────────────────────────────────────
  const handleDraw = useCallback(() => {
    if (!isMyTurn && pendingDrawCount === 0) { showNotif('Sıra sende değil!', '#666'); return; }
    // Ceza çekimi veya normal çekim
    const card = getRandomCard(usedTaskIds);
    setDrawnCard(card);
  }, [isMyTurn, pendingDrawCount, showNotif, usedTaskIds]);

  // Çekilen kartı ele alma ve devame etme
  const confirmDrawn = useCallback(() => {
    if (!drawnCard) return;
    const card = drawnCard;
    setDrawnCard(null);
    
    setMyHand(prev => {
      const newHand = [...prev, card];
      sendData({ type: 'cardDrawn', handCount: newHand.length });
      return newHand;
    });

    if (pendingDrawCount > 0) {
      const newCount = pendingDrawCount - 1;
      setPendingDrawCount(newCount);
      if (newCount === 0) {
        // Cezayı bitirdik, sıra rakibe geçer.
        setIsMyTurn(false);
        sendData({ type: 'turnPass' });
        showNotif('Cezanı çektin. Sıra rakipte.', '#666');
      }
    } else {
      // Normal çekim (sıra bizdeyken kartımız yoktu çektik)
      // Çektiği için sıra geçmiyor (Kullanıcı revizesi: Kart çektikten sonra sıra kimdeyse o oynamaya devam etmeli)
      showNotif('Kart çektin. Oynamaya devam edebilirsin veya pas geçebilirsin.', '#6bff4a');
    }
  }, [drawnCard, pendingDrawCount, sendData, showNotif]);

  // ── Pas Geç (Sırayı Sal) ──────────────────────────────────────────────────
  const passTurn = useCallback(() => {
    if (!isMyTurn) return;
    if (pendingDrawCount > 0) { showNotif(`Önce ${pendingDrawCount} ceza kartını çekmelisin!`, '#ff3366'); return; }
    
    setIsMyTurn(false);
    sendData({ type: 'turnPass' });
    showNotif('Sırayı pas geçtin.', '#aaa');
  }, [isMyTurn, pendingDrawCount, sendData, showNotif]);

  // ── Görev sonucu ──────────────────────────────────────────────────────────
  const handleTaskResult = useCallback((result, extraData = null) => {
    if (!pendingTaskCard) return;
    const card = pendingTaskCard;
    const data = card.taskData || {};

    if (result === 'ortak_resolved') {
      const winner = extraData.winner; // 'me', 'them', 'both', 'none'
      let meDraw = 0, themDraw = 0;
      let meMinus = 0, themMinus = 0;
      let message = 'Görev İptal / Berabere!';

      if (winner === 'me') {
        meDraw = data.winnerDrawCount || 0;
        meMinus = data.winnerMinusPoints || 0;
        themDraw = data.loserDrawCount || 0;
        message = 'Sen Kazandın! 🎉';
      } else if (winner === 'them') {
        themDraw = data.winnerDrawCount || 0;
        themMinus = data.winnerMinusPoints || 0;
        meDraw = data.loserDrawCount || 0;
        message = 'Rakip Kazandı! 💥';
      } else if (winner === 'both') {
        meDraw = data.winnerDrawCount || 0;
        meMinus = data.winnerMinusPoints || 0;
        themDraw = data.winnerDrawCount || 0;
        themMinus = data.winnerMinusPoints || 0;
        message = 'İkiniz de Başardınız! 🎊';
      }

      setTaskModal(null);
      setPendingTaskCard(null);

      if (meMinus > 0) {
        setPlayers(p => ({ ...p, [localPlayer]: { ...p[localPlayer], score: (p[localPlayer].score || 0) - meMinus } }));
      }
      if (themMinus > 0) {
        setPlayers(p => ({ ...p, [opponentGender]: { ...p[opponentGender], score: (p[opponentGender].score || 0) - themMinus } }));
      }
      
      if (meDraw > 0) setPendingDrawCount(meDraw);

      sendData({ 
        type: 'taskResult', 
        result: 'ortak_resolved',
        meDraw, themDraw, meMinus, themMinus,
        message: message
      });

      // Ortak görevden sonra host/oyuncu olarak puanlar hesaplandı.
      showNotif(message, '#00e5ff', 4000);
      return;
    }

    // Normal Görev Sonucu (Saldıran Kişi karar veriyor)
    let penalty = 0;
    let label = '';
    
    if (result === 'done') {
      penalty = card.penaltyDo || 0;
      label = 'Yaptı';
    } else if (result === 'fail') {
      penalty = card.penaltyFail || 0;
      label = 'Yapamadı';
    }

    setTaskModal(null);
    setPendingTaskCard(null);

    // Rakibe (savunan) cezayı gönderiyoruz. Çünkü savunan kişi ceza kartı çekecek.
    sendData({ 
      type: 'taskResult', 
      resultLabel: label, 
      penalty 
    });

    showNotif(`Görev tamamlandı. Rakip ${penalty > 0 ? penalty + ' ceza kartı alacak.' : 'ceza almadı.'} Sıra hala sende, normal kart atmaya devam et!`, '#6bff4a');
    // setIsMyTurn(false) ÇAĞRILMIYOR, sıra bizde kalıyor!
  }, [pendingTaskCard, localPlayer, opponentGender, sendData, showNotif, setPlayers]);

  // ── Portal sürükleme (kaydırarak oyna) ────────────────────────────────────
  const startCardGesture = useCallback((card, idx, e) => {
    if (pendingDrawCount > 0) {
      showNotif(`Önce desteden ${pendingDrawCount} ceza kartı çek!`, '#ff3366');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    dragMoved.current = false;
    portalY.set(0);
    portalX.set(0);
    setPortalCanPlay(false);

    longPressRef.current = setTimeout(() => {
      if (!dragMoved.current) {
        setZoomedCard(card);
      }
    }, 480);

    setCardPortal({ card, idx, startX: rect.left, startY: rect.top, w: rect.width, h: rect.height });
  }, [pendingDrawCount, portalY, portalX, showNotif]);

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

    const clampedY = Math.min(40, offsetY);
    portalY.set(clampedY);
    portalX.set(offsetX * 0.4);
    setPortalCanPlay(offsetY < -80);
  }, [cardPortal, portalY, portalX]);

  const endCardGesture = useCallback(() => {
    clearTimeout(longPressRef.current);
    if (!cardPortal) return;

    if (portalCanPlay) {
      mvAnimate(portalY, -500, { duration: 0.25, ease: 'easeIn' });
      mvAnimate(portalX, 0, { duration: 0.2 });
      setTimeout(() => {
        playCard(cardPortal.card, cardPortal.idx);
        setCardPortal(null);
        portalY.set(0);
        portalX.set(0);
        setPortalCanPlay(false);
      }, 250);
    } else {
      mvAnimate(portalY, 0, { type: 'spring', stiffness: 400, damping: 25 });
      mvAnimate(portalX, 0, { type: 'spring', stiffness: 400, damping: 25 });
      setTimeout(() => {
        setCardPortal(null);
        setPortalCanPlay(false);
      }, 300);
    }
  }, [cardPortal, portalCanPlay, playCard, portalY, portalX]);

  // ── Oyun bitti ────────────────────────────────────────────────────────────
  if (gameOver) {
    return (
      <div style={{ width:'100%',height:'100%', background:theme.bg, display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px' }}>
        <motion.div initial={{ scale:0,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ type:'spring',bounce:0.5 }} style={{ textAlign:'center' }}>
          <div style={{ fontSize:'5rem',marginBottom:'16px' }}>{gameOver.iWon ? '🏆' : '💔'}</div>
          <h2 style={{ color:'white',fontSize:'2.5rem',fontWeight:'300',marginBottom:'12px',textShadow:`0 0 40px ${theme.accent}`, letterSpacing:'2px' }}>
            {gameOver.iWon ? 'KAZANDIN' : 'KAYBETTİN'}
          </h2>
          <motion.button whileTap={{ scale:0.95 }} onClick={onFinish}
            style={{ marginTop:'40px', padding:'16px 40px', background:'transparent', color:'white',border:`1px solid ${theme.accent}`,borderRadius:'30px',fontWeight:'400',fontSize:'1.1rem',cursor:'pointer',boxShadow:`inset 0 0 20px ${theme.accentGlow}, 0 0 20px ${theme.accentGlow}` }}>
            ANA MENÜ
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
          <motion.div animate={{ rotate:360 }} transition={{ duration:1.5,repeat:Infinity,ease:'linear' }} style={{ fontSize:'4rem',marginBottom:'30px', opacity:0.8 }}>🃏</motion.div>
          <p style={{ color:'rgba(255,255,255,0.7)',fontWeight:'300',fontSize:'1.2rem', letterSpacing:'2px' }}>HAZIRLANIYOR...</p>
        </div>
      </div>
    );
  }

  // ── Renk glow ─────────────────────────────────────────────────────────────
  const colorGlow = CARD_COLORS[currentColor]?.glow || '#fff';

  return (
    <div 
      onPointerMove={moveCardGesture}
      onPointerUp={endCardGesture}
      onPointerCancel={endCardGesture}
      style={{ width:'100%',height:'100%', background:theme.bg, display:'flex',flexDirection:'column',position:'relative', overflow:'hidden' }}
    >
      <audio ref={remoteAudioRef} autoPlay />
      
      {/* Mikrofon Butonu */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: isMuted ? 'rgba(255, 51, 102, 0.2)' : 'rgba(107, 255, 74, 0.2)',
          border: `1px solid ${isMuted ? '#ff3366' : '#6bff4a'}`,
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isMuted ? '#ff3366' : '#6bff4a',
          boxShadow: `0 0 15px ${isMuted ? 'rgba(255, 51, 102, 0.4)' : 'rgba(107, 255, 74, 0.4)'}`,
          backdropFilter: 'blur(5px)',
          cursor: 'pointer'
        }}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </motion.button>

      {/* Ortam ışığı */}
      <div style={{
        position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)',
        width:'60vw', height:'60vw', borderRadius:'50%',
        background:`radial-gradient(circle, ${colorGlow}25 0%, transparent 70%)`,
        pointerEvents:'none', transition:'background 1s ease',
      }}/>

      {/* Yüzen arka plan emojileri */}
      {theme.float.map((f, i) => (
        <motion.div key={i}
          animate={{ y:[0,-30+i*10,0], opacity:[0.05,0.15,0.05], rotate:[0,10*(i%2?1:-1),0] }}
          transition={{ duration:f.d, repeat:Infinity, delay:i*1.2 }}
          style={{ position:'absolute', top:f.t, left:f.x, fontSize:'3rem', pointerEvents:'none', filter:'blur(2px)' }}
        >{f.e}</motion.div>
      ))}

      {/* ── Bildirim ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y:-80,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:-80,opacity:0 }}
            style={{
              position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', zIndex:200,
              background:'rgba(15,15,22,0.9)', color: notification.color,
              padding:'12px 28px', borderRadius:'16px',
              fontWeight:'600', fontSize:'0.9rem', whiteSpace:'nowrap',
              boxShadow:`0 10px 30px rgba(0,0,0,0.8), inset 0 0 10px ${notification.color}40`,
              border:`1px solid ${notification.color}60`, backdropFilter:'blur(10px)', letterSpacing:'0.5px'
            }}
          >{notification.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* ── PİŞTİ KARTI ─────────────────────────────────────────────────── */}
      {pistiCard && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px', textShadow: '0 0 10px #ff3366', letterSpacing: '2px' }}>PİŞTİ KARTI</span>
          <UnoCard card={pistiCard} size="sm" shadow />
        </div>
      )}

      {/* ── RAKİP ALANI ─────────────────────────────────────────────────── */}
      <div style={{ padding:'20px 20px 10px', display:'flex',flexDirection:'column',alignItems:'center',gap:'15px',flexShrink:0, zIndex: 10 }}>
        <motion.div
          animate={!isMyTurn && pendingDrawCount === 0 ? { boxShadow:[`0 0 0 ${theme.accent}00`,`0 0 25px ${theme.accentGlow}`,`0 0 0 ${theme.accent}00`] } : {}}
          transition={{ duration:1.8,repeat:Infinity }}
          style={{
            display:'flex',alignItems:'center',gap:'12px',
            background:'rgba(10,10,15,0.6)', borderRadius:'24px', padding:'8px 24px',
            border:`1px solid ${!isMyTurn && pendingDrawCount === 0 ? theme.accent : 'rgba(255,255,255,0.05)'}`,
            backdropFilter:'blur(8px)', transition:'all 0.4s',
          }}
        >
          <span style={{ fontSize:'1.4rem' }}>{players[opponentGender]?.avatar}</span>
          <span style={{ color:'white',fontWeight:'400',fontSize:'1rem', letterSpacing:'1px' }}>{players[opponentGender]?.name}</span>
          {!isMyTurn && pendingDrawCount === 0 && (
            <motion.div animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.2,repeat:Infinity }}
              style={{ width:'8px',height:'8px',borderRadius:'50%',background:theme.accent,boxShadow:`0 0 10px ${theme.accent}`,marginLeft:'4px' }} />
          )}
        </motion.div>
        <OpponentHand count={theirCount} theme={theme} />
      </div>

      {/* ── OYUN MASASI ─────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex',alignItems:'center',justifyContent:'center',gap:'clamp(15px,6vw,40px)',padding:'0 20px',position:'relative', zIndex: 10 }}>

        {/* Portal hedefleri (kaydır yukarı) */}
        <AnimatePresence>
          {cardPortal && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{
                position:'absolute', inset:'20px',
                border:`1px dashed ${portalCanPlay ? theme.accent : 'rgba(255,255,255,0.15)'}`,
                borderRadius:'30px', pointerEvents:'none',
                background:portalCanPlay ? `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)` : 'transparent',
                display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop: '20%',
                transition:'all 0.3s',
              }}
            >
              <span style={{ color:portalCanPlay?theme.accent:'rgba(255,255,255,0.3)', fontWeight:'300', fontSize:'1.2rem', letterSpacing:'2px', textShadow: portalCanPlay?`0 0 10px ${theme.accent}`:'none' }}>
                {portalCanPlay ? 'BIRAK' : 'YUKARI KAYDIR'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Çekme destesi (Manuel Çekim Butonu İşlevi Görür) */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
          <motion.div
            whileHover={(isMyTurn || pendingDrawCount > 0) ? { y:-5,scale:1.03 } : {}}
            whileTap={(isMyTurn || pendingDrawCount > 0) ? { scale:0.96 } : {}}
            onClick={handleDraw}
            animate={pendingDrawCount > 0 ? { y: [0, -10, 0], boxShadow: [`0 0 10px ${theme.accentGlow}`, `0 0 30px ${theme.accent}`, `0 0 10px ${theme.accentGlow}`] } : {}}
            transition={{ duration: 1, repeat: pendingDrawCount > 0 ? Infinity : 0 }}
            style={{
              width:'clamp(65px,18vw,85px)', height:'clamp(97px,27vw,127px)',
              borderRadius:'14px', background:'rgba(15,15,22,0.85)',
              border:`1px solid ${(isMyTurn || pendingDrawCount > 0)?theme.accent:'rgba(255,255,255,0.1)'}`,
              cursor:(isMyTurn || pendingDrawCount > 0)?'pointer':'default',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              boxShadow:(isMyTurn && pendingDrawCount === 0)?`inset 0 0 15px ${theme.accentGlow}`:'0 10px 20px rgba(0,0,0,0.5)',
              backdropFilter:'blur(10px)', transition:'all 0.3s', position: 'relative'
            }}
          >
            <div style={{ fontSize:'2.2rem', filter:'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>🃏</div>
            {pendingDrawCount > 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,0,50,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem', color: '#fff', fontWeight: '900', textShadow: '0 0 20px #ff0055' }}>{pendingDrawCount}</span>
              </div>
            )}
          </motion.div>
          <span style={{ color:pendingDrawCount > 0 ? '#ff3366' : 'rgba(255,255,255,0.3)',fontSize:'0.65rem',fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px' }}>
            {pendingDrawCount > 0 ? 'CEZA ÇEK' : 'ÇEK'}
          </span>
        </div>

        {/* Atılan kart */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
          <div style={{ position:'relative' }}>
            <AnimatePresence>
              {animCard && (
                <motion.div key="anim-card"
                  initial={{ scale:1.4,y:-60,opacity:0.6, rotate: -5 }} animate={{ scale:1,y:0,opacity:1, rotate: 0 }}
                  exit={{ opacity:0 }} transition={{ duration:0.4,type:'spring',bounce:0.4 }}
                  style={{ position:'absolute',inset:0,zIndex:15 }}
                >
                  <UnoCard card={animCard} shadow />
                </motion.div>
              )}
            </AnimatePresence>
            <UnoCard card={topCard} shadow />
          </div>

          <div style={{ display:'flex',alignItems:'center',gap:'8px', background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.div
              animate={{ boxShadow:[`0 0 5px ${colorGlow}66`,`0 0 15px ${colorGlow}`,`0 0 5px ${colorGlow}66`] }}
              transition={{ duration:2,repeat:Infinity }}
              style={{ width:'12px',height:'12px',borderRadius:'50%', background:CARD_COLORS[currentColor]?.glow||'#fff' }}
            />
            <span style={{ color:'rgba(255,255,255,0.7)',fontSize:'0.65rem',fontWeight:'400',textTransform:'uppercase', letterSpacing:'1px' }}>{currentColor}</span>
          </div>
        </div>

        {/* Sıra göstergesi ve Pas Geç */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'10px' }}>
          <motion.div
            animate={isMyTurn && pendingDrawCount === 0 ? { scale:[1,1.1,1], rotate: [0, 5, 0, -5, 0], boxShadow: [`0 0 15px ${theme.accentGlow}`, `0 0 35px ${theme.accentGlow}`, `0 0 15px ${theme.accentGlow}`] } : {}}
            transition={{ duration:1.5,repeat:Infinity }}
            style={{
              width:'clamp(50px,14vw,70px)', height:'clamp(50px,14vw,70px)',
              borderRadius:'50%',
              background:isMyTurn && pendingDrawCount === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
              border:`2px solid ${isMyTurn && pendingDrawCount === 0 ? theme.accent : 'rgba(255,255,255,0.1)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',
              backdropFilter: 'blur(5px)', transition:'all 0.4s',
            }}
          >{isMyTurn && pendingDrawCount === 0 ? '🎯' : '⏳'}</motion.div>
          
          <span style={{ 
            color:isMyTurn && pendingDrawCount === 0 ? theme.accent : 'rgba(255,255,255,0.2)', 
            fontSize: isMyTurn ? '0.75rem' : '0.55rem',
            fontWeight:'800', textTransform:'uppercase', textAlign:'center', letterSpacing:'1px',
            textShadow: isMyTurn ? `0 0 10px ${theme.accent}` : 'none'
          }}>
            {isMyTurn && pendingDrawCount === 0 ? 'SIRA SENDE' : 'SIRA RAKİPTE'}
          </span>

          {isMyTurn && pendingDrawCount === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={passTurn}
              style={{
                marginTop: '10px', padding: '8px 16px', background: 'rgba(255,51,102,0.2)',
                color: '#ff3366', border: '1px solid #ff3366', borderRadius: '12px',
                fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(255,51,102,0.3)', letterSpacing: '1px'
              }}
            >
              PAS GEÇ
            </motion.button>
          )}
        </div>
      </div>

      {/* ── BENİM ELİM ──────────────────────────────────────────────────── */}
      <div style={{
        padding:'12px 10px calc(12px + env(safe-area-inset-bottom,0px))',
        background:theme.handBg,
        borderRadius:'32px 32px 0 0',
        backdropFilter:'blur(25px)',
        borderTop:`1px solid ${theme.handBorder}`,
        flexShrink:0, zIndex: 20
      }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px 10px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            <span style={{ fontSize:'1.2rem' }}>{players[localPlayer]?.avatar}</span>
            <span style={{ color:'rgba(255,255,255,0.9)',fontWeight:'300',fontSize:'0.9rem', letterSpacing:'1px' }}>{players[localPlayer]?.name}</span>
          </div>
          <span style={{
            background:isMyTurn && pendingDrawCount === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: `1px solid ${isMyTurn && pendingDrawCount === 0 ? theme.accent : 'rgba(255,255,255,0.1)'}`,
            borderRadius:'16px',padding:'4px 14px',color:isMyTurn && pendingDrawCount === 0 ? theme.accent : 'rgba(255,255,255,0.5)',
            fontWeight:'600',fontSize:'0.75rem',transition:'all 0.3s', letterSpacing:'1px'
          }}>{myHand.length} KART</span>
        </div>

        {isMyTurn && pendingDrawCount === 0 && (
          <p style={{ color:'rgba(255,255,255,0.3)',fontSize:'0.65rem',textAlign:'center',marginBottom:'8px',fontWeight:'400', letterSpacing:'1px' }}>
            YUKARI KAYDIR = OYNA &nbsp;&middot;&nbsp; BASILI TUT = İNCELE
          </p>
        )}

        <div style={{
          display:'flex', gap:'6px',
          overflowX:'auto', overflowY:'visible',
          padding:'10px 10px',
          scrollbarWidth:'none', WebkitOverflowScrolling:'touch',
          minHeight:'clamp(140px,36vw,170px)',
        }}>
          <AnimatePresence>
            {myHand.map((card, idx) => (
              <motion.div
                key={`${card.id}-${idx}`}
                initial={{ scale:0,y:80,opacity:0 }} animate={{ scale:1,y:0,opacity:1 }} exit={{ scale:0.5,y:-100,opacity:0 }}
                transition={{ type:'spring',bounce:0.4,delay:idx*0.03 }}
                style={{
                  flexShrink:0,
                  opacity: cardPortal?.idx === idx ? 0 : 1,
                  transition:'opacity 0.1s',
                  cursor:'grab',
                  touchAction: 'pan-x',
                }}
                onPointerDown={e => startCardGesture(card, idx, e)}
              >
                <UnoCard card={card} size="md" shadow={false} />
              </motion.div>
            ))}
          </AnimatePresence>
          {myHand.length === 0 && (
            <div style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.2)',fontSize:'0.8rem', letterSpacing:'2px' }}>
              EL BOŞ
            </div>
          )}
        </div>
      </div>

      {/* ── PORTAL: sürüklenen kart ─────────────────────────────────────── */}
      {cardPortal && createPortal(
        <motion.div
          style={{
            position:'fixed', left: cardPortal.startX, top: cardPortal.startY,
            width: cardPortal.w, height: cardPortal.h, zIndex:999,
            x: portalX, y: portalY, pointerEvents:'none',
          }}
        >
          <div style={{ filter:portalCanPlay?`drop-shadow(0 0 25px ${theme.accentGlow})`:'drop-shadow(0 15px 30px rgba(0,0,0,0.8))', transform:portalCanPlay?'scale(1.15)':'scale(1.05)', transition:'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <UnoCard card={cardPortal.card} size="md" />
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
        {drawnCard && <DrawnCardPreview card={drawnCard} onDismiss={confirmDrawn} pendingCount={pendingDrawCount} />}
      </AnimatePresence>
      <AnimatePresence>
        {zoomedCard && <ZoomOverlay card={zoomedCard} onClose={() => setZoomedCard(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Game;
