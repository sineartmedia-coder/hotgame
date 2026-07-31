import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, ListTodo, Zap, Gamepad2, HelpCircle, ChevronRight, ChevronDown, Check, X, Skull, Flame } from 'lucide-react';
import { MOCK_CARDS, MOCK_JOKERS, MOCK_QUESTIONS, MOCK_PENALTIES } from '../data/cards';
import RoomSetup from './RoomSetup';

const TABS = [
  { id: 'genel', label: 'Genel', icon: SettingsIcon },
  { id: 'gorevler', label: 'Görev Kartları', icon: ListTodo },
  { id: 'jokerler', label: 'Jokerler', icon: Zap },
  { id: 'sorular', label: 'Sorular', icon: HelpCircle },
  { id: 'cezalar', label: 'Cezalar', icon: Skull },
  { id: 'oyunlar', label: 'Oyunlar', icon: Gamepad2 },
];

// Removed CATEGORIES constant

const Settings = ({ settings, setSettings, onNext }) => {
  const [activeTab, setActiveTab] = useState('genel');
  const [taskGenderTab, setTaskGenderTab] = useState('woman'); // 'woman', 'man', 'ortak'

  // Sadece seçili cinseyete göre filtrele (Kategori Yok)
  const filteredTasks = useMemo(() => {
    return MOCK_CARDS.filter(card => card.target === taskGenderTab);
  }, [taskGenderTab]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
  };

  // toggleCategory removed

  const toggleTask = (taskId, e) => {
    e.stopPropagation();
    setSettings(prev => {
      const disabled = prev.disabledTasks.includes(taskId)
        ? prev.disabledTasks.filter(id => id !== taskId)
        : [...prev.disabledTasks, taskId];
      return { ...prev, disabledTasks: disabled };
    });
  };

  const toggleListItem = (listName, id) => {
    setSettings(prev => {
      const currentList = prev[listName] || [];
      const disabled = currentList.includes(id)
        ? currentList.filter(itemId => itemId !== id)
        : [...currentList, id];
      return { ...prev, [listName]: disabled };
    });
  };

  const renderToggleList = (items, disabledListName) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map(item => {
        const isEnabled = !(settings[disabledListName] || []).includes(item.id);
        return (
          <div key={item.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px',
            border: `1px solid ${isEnabled ? 'rgba(43,147,72,0.3)' : 'rgba(208,0,0,0.3)'}`
          }}>
            <div style={{ flex: 1, paddingRight: '10px', opacity: isEnabled ? 1 : 0.5 }}>
              <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.title}</p>
              <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{item.text}</p>
            </div>
            <button 
              onClick={() => toggleListItem(disabledListName, item.id)}
              style={{
                width: '50px', height: '28px', borderRadius: '14px', border: 'none',
                background: isEnabled ? 'var(--color-purple)' : '#444',
                position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
              }}
            >
              <motion.div 
                layout
                style={{
                  width: '22px', height: '22px', background: 'white', borderRadius: '50%',
                  position: 'absolute', top: '3px', left: isEnabled ? '25px' : '3px'
                }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'radial-gradient(ellipse at bottom, #1a0033 0%, #050010 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Süslemeler */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', top: '5%', left: '5%', fontSize: '3rem', filter: 'blur(2px)' }}
      >
        🔥
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{ position: 'absolute', top: '20%', right: '5%', fontSize: '4rem', filter: 'blur(3px)' }}
      >
        💋
      </motion.div>

      <h2 style={{ fontSize: 'clamp(1.4rem,6vw,2.5rem)', margin: '32px 20px 16px', textAlign: 'center', fontWeight: 'bold', zIndex: 10, flexShrink: 0 }}>
        <span className="text-gradient">Oyun Ayarları</span>
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', margin: '0 12px 12px', zIndex: 10, flexShrink: 0, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
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
                transition: 'all 0.3s', cursor: 'pointer', flexShrink: 0
              }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass-panel screen-scroll" style={{ flex: 1, padding: '16px', margin: '0 12px', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          
          {/* GENEL AYARLAR */}
          {activeTab === 'genel' && (
            <motion.div key="genel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* Kaç Tur Oynanacak */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: 'var(--color-green)', fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem' }}>
                  🏆 Tur Sayısı
                </label>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px' }}>
                  Oyun toplam kaç tur oynansın? Her turun sonunda kaybeden ceza çeker ve puanlar birikir.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[1, 3, 5, 7, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => handleInputChange('roundCount', num)}
                      style={{
                        flex: 1, minWidth: '55px', padding: '14px 8px', borderRadius: '12px', border: 'none',
                        background: (settings.roundCount || 1) === num
                          ? 'linear-gradient(135deg, #2dc653, #1a5c2a)'
                          : 'rgba(255,255,255,0.07)',
                        color: 'white', fontWeight: '900', fontSize: '1.1rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: (settings.roundCount || 1) === num ? '0 4px 15px rgba(45,198,83,0.5)' : 'none',
                        border: (settings.roundCount || 1) === num ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* UNO Kart Sayısı */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: 'var(--color-purple)', fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem' }}>
                  🃏 Kişi Başına UNO Kart Sayısı
                </label>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px' }}>
                  Oyun başlarken her oyuncuya kaç standart UNO kartı dağıtılsın?
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[5, 7, 10, 12, 15, 20].map(num => (
                    <button
                      key={num}
                      onClick={() => handleInputChange('deckSize', num)}
                      style={{
                        flex: 1, minWidth: '55px', padding: '14px 8px', borderRadius: '12px', border: 'none',
                        background: settings.deckSize === num
                          ? 'linear-gradient(135deg, #9d4edd, #ff3c78)'
                          : 'rgba(255,255,255,0.07)',
                        color: 'white', fontWeight: '900', fontSize: '1.1rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: settings.deckSize === num ? '0 4px 15px rgba(157,78,221,0.5)' : 'none',
                        border: settings.deckSize === num ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={settings.deckSize === 0 ? '' : settings.deckSize}
                  onChange={(e) => handleInputChange('deckSize', e.target.value)}
                  placeholder="Özel sayı..."
                  min="3" max="25"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', marginTop: '10px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(157,78,221,0.4)',
                    color: 'white', fontSize: '1rem', outline: 'none', textAlign: 'center'
                  }}
                />
              </div>

              {/* Görev Kartı Sayısı */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: 'var(--color-orange)', fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem' }}>
                  🔥 Kişi Başına Görev Kartı Sayısı
                </label>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px' }}>
                  UNO'daki +2/+4 kartları yerine görev kartları. Elindeki görev kartları <strong style={{color:'#ff9'}}>rakibine</strong> aittir!
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[0, 2, 3, 5, 7, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => handleInputChange('taskCardCount', num)}
                      style={{
                        flex: 1, minWidth: '55px', padding: '14px 8px', borderRadius: '12px', border: 'none',
                        background: settings.taskCardCount === num
                          ? 'linear-gradient(135deg, #ff7900, #f5af19)'
                          : 'rgba(255,255,255,0.07)',
                        color: 'white', fontWeight: '900', fontSize: '1.1rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: settings.taskCardCount === num ? '0 4px 15px rgba(255,121,0,0.5)' : 'none',
                        border: settings.taskCardCount === num ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oyun Süresi */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: 'var(--color-green)', fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem' }}>
                  ⏱ Oyun Süresi (Dakika)
                </label>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px' }}>
                  Oyunun toplam süresi. Süre içinde oyun bitmezse, sona erecektir.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[10, 20, 30, 45, 60].map(num => (
                    <button
                      key={num}
                      onClick={() => handleInputChange('duration', num)}
                      style={{
                        flex: 1, minWidth: '55px', padding: '14px 8px', borderRadius: '12px', border: 'none',
                        background: settings.duration === num
                          ? 'linear-gradient(135deg, #2dc653, #1a5c2a)'
                          : 'rgba(255,255,255,0.07)',
                        color: 'white', fontWeight: '900', fontSize: '1.1rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: settings.duration === num ? '0 4px 15px rgba(45,198,83,0.5)' : 'none',
                        border: settings.duration === num ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={settings.duration === 0 ? '' : settings.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Özel süre (dk)..."
                  min="5" max="300"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', marginTop: '10px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(45,198,83,0.4)',
                    color: 'white', fontSize: '1rem', outline: 'none', textAlign: 'center'
                  }}
                />
              </div>

              {/* Özet */}
              <div style={{
                background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '16px',
                border: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px'
              }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                  Her oyuncu toplam{' '}
                  <strong style={{ color: '#9d4edd', fontSize: '1.1rem' }}>{settings.deckSize || 7}</strong>
                  {' '}UNO +{' '}
                  <strong style={{ color: '#ff7900', fontSize: '1.1rem' }}>{settings.taskCardCount ?? 3}</strong>
                  {' '}görev ={' '}
                  <strong style={{ color: 'white', fontSize: '1.1rem' }}>{(settings.deckSize || 7) + (settings.taskCardCount ?? 3)}</strong>
                  {' '}kart ile başlar.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textAlign: 'center', margin: '5px 0 0 0' }}>
                  Oyun Süresi: <strong style={{ color: '#2dc653', fontSize: '1.1rem' }}>{settings.duration} Dakika</strong>
                </p>
              </div>

            </motion.div>
          )}

          {/* GÖREV KARTLARI */}
          {activeTab === 'gorevler' && (
            <motion.div key="gorevler" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              
              {/* Gender Toggle */}
              <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                <button
                  onClick={() => setTaskGenderTab('woman')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                    background: taskGenderTab === 'woman' ? 'var(--color-purple)' : 'rgba(0,0,0,0.3)',
                    color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
                  }}
                >
                  👩 Kadın Görevleri
                </button>
                <button
                  onClick={() => setTaskGenderTab('man')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                    background: taskGenderTab === 'man' ? 'var(--color-orange)' : 'rgba(0,0,0,0.3)',
                    color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
                  }}
                >
                  👱‍♂️ Erkek Görevleri
                </button>
                <button
                  onClick={() => setTaskGenderTab('ortak')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                    background: taskGenderTab === 'ortak' ? 'var(--color-green)' : 'rgba(0,0,0,0.3)',
                    color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
                  }}
                >
                  🤝 Ortak (Unisex)
                </button>
              </div>

              <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>
                {taskGenderTab === 'woman' ? "Kadın oyuncuya" : taskGenderTab === 'man' ? "Erkek oyuncuya" : "İki oyuncuya da rastgele"} çıkabilecek görevleri düzenliyorsunuz.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredTasks.length === 0 ? (
                  <div style={{ padding: '20px', color: '#888', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                    Henüz bu grupta görev eklenmemiş. Yönetim panelinden veri eklediğinizde burada görünecektir.
                  </div>
                ) : (
                  filteredTasks.map(task => {
                    const isTaskEnabled = !settings.disabledTasks.includes(task.id);
                    return (
                      <div key={task.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                        border: `1px solid ${isTaskEnabled ? 'rgba(43,147,72,0.3)' : 'rgba(208,0,0,0.3)'}`,
                        opacity: isTaskEnabled ? 1 : 0.5
                      }}>
                        <div style={{ flex: 1, paddingRight: '10px' }}>
                          <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white' }}>{task.title}</p>
                          <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>{task.text}</p>
                        </div>
                        <button 
                          onClick={(e) => toggleTask(task.id, e)}
                          style={{
                            width: '44px', height: '26px', borderRadius: '13px', border: 'none',
                            background: isTaskEnabled ? 'var(--color-purple)' : '#444',
                            position: 'relative', cursor: 'pointer', flexShrink: 0
                          }}
                        >
                          <motion.div layout style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isTaskEnabled ? '21px' : '3px' }} />
                        </button>
                      </div>
                    );
                  })
                )}
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
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <h4 style={{ color: 'var(--color-orange)', marginBottom: '15px' }}>Kullanılabilir Jokerler</h4>
              {renderToggleList(MOCK_JOKERS, 'disabledJokers')}
            </motion.div>
          )}

          {/* SORULAR */}
          {activeTab === 'sorular' && (
            <motion.div key="sorular" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>İstemediğiniz soruları kapatabilirsiniz.</p>
              {renderToggleList(MOCK_QUESTIONS, 'disabledQuestions')}
            </motion.div>
          )}

          {/* CEZALAR */}
          {activeTab === 'cezalar' && (
            <motion.div key="cezalar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>Reddedilen görevlerde uygulanacak cezaları seçin.</p>
              {renderToggleList(MOCK_PENALTIES, 'disabledPenalties')}
            </motion.div>
          )}

          {/* OYUNLAR (Ortak Görevler) */}
          {activeTab === 'oyunlar' && (
            <motion.div key="oyunlar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>Oyun esnasında rastgele çıkacak ortak görevleri seçin.</p>
              {renderToggleList(require('../data/cards').MOCK_COMMON_TASKS, 'disabledGames')}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Room Setup + Start */}
      <div style={{ zIndex: 10, margin: '12px 12px 0', paddingBottom: '8px', flexShrink: 0 }}>
        <RoomSetup onConnected={onNext} />
      </div>
    </div>
  );
};

export default Settings;
