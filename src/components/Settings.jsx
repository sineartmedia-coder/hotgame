import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, ListTodo, Zap, Gamepad2, HelpCircle, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { MOCK_CARDS } from '../data/cards';

const TABS = [
  { id: 'genel', label: 'Genel', icon: SettingsIcon },
  { id: 'gorevler', label: 'Görev Kartları', icon: ListTodo },
  { id: 'jokerler', label: 'Jokerler', icon: Zap },
  { id: 'oyunlar', label: 'Oyunlar', icon: Gamepad2 },
  { id: 'sorular', label: 'Sorular', icon: HelpCircle },
];

const CATEGORIES = {
  erotik: 'Erotik Görevler',
  igrenc: 'İğrenç Görevler',
  zor: 'Zor Görevler',
  sureli: 'Süreli Görevler',
  sayili: 'Sayılı Görevler',
  ortak: 'Ortak Görevler',
  mini: 'Mini Oyunlar',
  cift: 'Çift Görevleri',
  tekli: 'Tekli Görevler'
};

const Settings = ({ settings, setSettings, onNext }) => {
  const [activeTab, setActiveTab] = useState('genel');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Kategorilere göre kartları grupla
  const cardsByCategory = useMemo(() => {
    const grouped = {};
    Object.keys(CATEGORIES).forEach(c => grouped[c] = []);
    MOCK_CARDS.forEach(card => {
      if (grouped[card.category]) {
        grouped[card.category].push(card);
      }
    });
    return grouped;
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const toggleCategory = (cat) => {
    setSettings(prev => ({
      ...prev,
      categories: { ...prev.categories, [cat]: !prev.categories[cat] }
    }));
  };

  const toggleTask = (taskId, e) => {
    e.stopPropagation();
    setSettings(prev => {
      const disabled = prev.disabledTasks.includes(taskId)
        ? prev.disabledTasks.filter(id => id !== taskId)
        : [...prev.disabledTasks, taskId];
      return { ...prev, disabledTasks: disabled };
    });
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(ellipse at bottom, #1a0033 0%, #050010 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '24px', paddingTop: '40px',
      color: 'white'
    }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
        <span className="text-gradient">Oyun Ayarları</span>
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', borderRadius: '30px',
                background: isActive ? 'linear-gradient(135deg, #9d4edd, #ff3c78)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? 'rgba(255,60,120,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: isActive ? 'white' : '#aaa',
                fontWeight: 'bold', whiteSpace: 'nowrap',
                transition: 'all 0.3s', cursor: 'pointer'
              }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass-panel" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          
          {/* GENEL AYARLAR */}
          {activeTab === 'genel' && (
            <motion.div key="genel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--color-purple)', fontWeight: 'bold', marginBottom: '10px' }}>Deste Boyutu (Kaç Kart Olsun?)</label>
                <input 
                  type="number" 
                  value={settings.deckSize}
                  onChange={(e) => handleInputChange('deckSize', e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(157,78,221,0.5)',
                    color: 'white', fontSize: '1.2rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--color-orange)', fontWeight: 'bold', marginBottom: '10px' }}>Oyun Süresi (Dakika)</label>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>
                  Oyunu bitirmez. Girilen süreyi kim en az kullanırsa o kişi "Zaman Bonusu" ekstra puan alır.
                </p>
                <input 
                  type="number" 
                  value={settings.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,121,0,0.5)',
                    color: 'white', fontSize: '1.2rem', outline: 'none'
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* GÖREV KARTLARI */}
          {activeTab === 'gorevler' && (
            <motion.div key="gorevler" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>
                Kategoriyi tamamen kapatabilir veya içindeki özel görevleri tek tek devre dışı bırakabilirsiniz.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(CATEGORIES).map(([catId, catName]) => {
                  const tasks = cardsByCategory[catId] || [];
                  const isExpanded = expandedCategory === catId;
                  const isEnabled = settings.categories[catId];

                  return (
                    <div key={catId} style={{ 
                      background: 'rgba(0,0,0,0.3)', borderRadius: '12px', 
                      border: `1px solid ${isEnabled ? 'rgba(43,147,72,0.3)' : 'rgba(208,0,0,0.3)'}`
                    }}>
                      {/* Accordion Header */}
                      <div 
                        onClick={() => setExpandedCategory(isExpanded ? null : catId)}
                        style={{ 
                          padding: '15px', display: 'flex', justifyContent: 'space-between', 
                          alignItems: 'center', cursor: 'pointer' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isExpanded ? <ChevronDown size={20} color="#aaa" /> : <ChevronRight size={20} color="#aaa" />}
                          <span style={{ fontWeight: 'bold', color: isEnabled ? 'white' : '#666' }}>{catName} ({tasks.length})</span>
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleCategory(catId); }}
                          style={{
                            padding: '6px 12px', borderRadius: '20px', border: 'none',
                            background: isEnabled ? 'var(--color-green)' : 'var(--color-red)',
                            color: 'white', fontWeight: 'bold', fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          {isEnabled ? <Check size={14}/> : <X size={14}/>} {isEnabled ? 'AÇIK' : 'KAPALI'}
                        </button>
                      </div>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {isExpanded && tasks.length > 0 && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 15px 15px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '8px' }} />
                              {tasks.map(task => {
                                const isTaskEnabled = !settings.disabledTasks.includes(task.id);
                                return (
                                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isTaskEnabled && isEnabled ? 1 : 0.4 }}>
                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{task.title}</p>
                                      <p style={{ fontSize: '0.75rem', color: '#999' }}>{task.text.substring(0, 40)}...</p>
                                    </div>
                                    <button 
                                      onClick={(e) => toggleTask(task.id, e)}
                                      disabled={!isEnabled}
                                      style={{
                                        width: '40px', height: '24px', borderRadius: '12px', border: 'none',
                                        background: isTaskEnabled ? 'var(--color-purple)' : '#444',
                                        position: 'relative', cursor: isEnabled ? 'pointer' : 'not-allowed'
                                      }}
                                    >
                                      <motion.div 
                                        layout
                                        style={{
                                          width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                          position: 'absolute', top: '3px', left: isTaskEnabled ? '19px' : '3px'
                                        }}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                        
                        {isExpanded && tasks.length === 0 && (
                          <div style={{ padding: '15px', color: '#888', fontSize: '0.8rem', textAlign: 'center' }}>
                            Henüz bu kategoride görev yok.
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* JOKERLER */}
          {activeTab === 'jokerler' && (
            <motion.div key="jokerler" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--color-purple)', fontWeight: 'bold', marginBottom: '10px' }}>Joker Sayısı</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[0, 1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => handleInputChange('jokerCount', num)}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                        background: settings.jokerCount === num ? 'var(--color-purple)' : 'rgba(0,0,0,0.3)',
                        color: 'white', fontWeight: 'bold'
                      }}
                    >
                      {num} Joker
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* OYUNLAR & SORULAR (Yer Tutucu) */}
          {(activeTab === 'oyunlar' || activeTab === 'sorular') && (
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
                <Zap size={48} style={{ opacity: 0.2, margin: '0 auto 20px auto' }} />
                <h3>Çok Yakında!</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Bu modül yakında aktifleşecek.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Start Button */}
      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="btn-primary" 
        style={{ 
          width: '100%', marginTop: '20px', 
          background: 'linear-gradient(135deg, #ff3c78, #ff7900)',
          boxShadow: '0 0 25px rgba(255,60,120,0.4)'
        }} 
        onClick={onNext}
      >
        OYUNU BAŞLAT
      </motion.button>
    </div>
  );
};

export default Settings;
