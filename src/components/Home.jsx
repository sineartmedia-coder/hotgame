import React from 'react';
import { motion } from 'framer-motion';

const Home = ({ onStart }) => {
  return (
    <div className="screen-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Floating Elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <motion.div 
          className="glass-panel"
          style={{ position: 'absolute', top: '20%', left: '10%', width: '120px', height: '180px', opacity: 0.3 }}
          animate={{ y: [0, -30, 0], rotate: [10, -5, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="glass-panel"
          style={{ position: 'absolute', bottom: '20%', right: '10%', width: '160px', height: '220px', opacity: 0.2 }}
          animate={{ y: [0, 40, 0], rotate: [-15, 5, -15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.h1 
          className="text-gradient"
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            fontSize: '4rem', 
            fontWeight: 800, 
            cursor: 'pointer', 
            textAlign: 'center', 
            lineHeight: 1.1,
            textShadow: '0 0 20px rgba(157, 78, 221, 0.4)',
            marginBottom: '1rem'
          }}
        >
          YANMAYLIM<br/>MI?
        </motion.h1>
        
        <motion.p 
          style={{ fontSize: '1.2rem', color: '#adb5bd', fontWeight: 300, marginTop: '1rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Çiftlere Özel Yetişkin Oyunu
        </motion.p>
      </div>
    </div>
  );
};

export default Home;
