import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';

const DiceRoll = ({ players, onFinish }) => {
  const [turn, setTurn] = useState('woman'); // Who is rolling now
  const [womanRoll, setWomanRoll] = useState(null);
  const [manRoll, setManRoll] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null); // 'woman' or 'man'

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Simulate roll time
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      
      if (turn === 'woman') {
        setWomanRoll(roll);
        setTurn('man');
      } else {
        setManRoll(roll);
        determineWinner(womanRoll, roll);
      }
    }, 1500);
  };

  const determineWinner = (wRoll, mRoll) => {
    // Determine winner (lower wins as requested by user)
    // If tie, just pick random or reroll, let's keep it simple and give to woman on tie for now
    const win = wRoll < mRoll ? 'woman' : mRoll < wRoll ? 'man' : (Math.random() > 0.5 ? 'woman' : 'man');
    setWinner(win);
    
    setTimeout(() => {
      onFinish(win);
    }, 2000);
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Half - Woman (Purple) */}
      <div style={{ 
        flex: 1, 
        backgroundColor: turn === 'woman' ? 'rgba(157, 78, 221, 0.2)' : 'transparent',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        transition: 'background-color 0.5s'
      }}>
        <h2 style={{ color: 'var(--color-purple)', fontSize: '2rem' }}>{players.woman.name}</h2>
        {womanRoll && <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>{womanRoll}</div>}
      </div>

      {/* Bottom Half - Man (Orange) */}
      <div style={{ 
        flex: 1, 
        backgroundColor: turn === 'man' ? 'rgba(255, 121, 0, 0.2)' : 'transparent',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'background-color 0.5s'
      }}>
        {manRoll && <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>{manRoll}</div>}
        <h2 style={{ color: 'var(--color-orange)', fontSize: '2rem' }}>{players.man.name}</h2>
      </div>

      {/* Center Dice Area */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 10
      }}>
        {!winner ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.8)', 
              padding: '10px 20px', 
              borderRadius: '20px', 
              marginBottom: '20px',
              border: `1px solid ${turn === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)'}`
            }}>
              {turn === 'woman' ? `${players.woman.name} Zar Atsın` : `${players.man.name} Zar Atsın`}
            </div>
            
            <motion.button 
              onClick={rollDice}
              disabled={isRolling}
              animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
              style={{
                width: '100px', height: '100px',
                borderRadius: '50%',
                background: turn === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)',
                border: 'none',
                color: 'white',
                cursor: isRolling ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
              }}
            >
              <Dices size={48} />
            </motion.button>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              background: winner === 'woman' ? 'var(--color-purple)' : 'var(--color-orange)',
              padding: '20px 40px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(0,0,0,0.8)',
              border: '2px solid white'
            }}
          >
            <h3>İlk Başlayan</h3>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{players[winner].name}</h2>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiceRoll;
