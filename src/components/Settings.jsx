import React from 'react';

const Settings = ({ settings, setSettings, onNext }) => {
  const toggleCategory = (cat) => {
    setSettings(prev => ({
      ...prev,
      categories: { ...prev.categories, [cat]: !prev.categories[cat] }
    }));
  };

  return (
    <div className="screen-container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', color: 'white' }}>Oyun Ayarları</h2>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-purple)' }}>Deste Boyutu</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {[24, 30, 36, 40].map(size => (
            <button 
              key={size}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: settings.deckSize === size ? 'var(--color-purple)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setSettings(prev => ({ ...prev, deckSize: size }))}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-orange)' }}>Görev Türleri</h3>
        {Object.keys(settings.categories).map(cat => (
          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
            <span style={{ textTransform: 'capitalize' }}>{cat} Görevler</span>
            <button 
              style={{
                padding: '5px 15px',
                borderRadius: '20px',
                border: 'none',
                background: settings.categories[cat] ? 'var(--color-green)' : 'var(--color-red)',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => toggleCategory(cat)}
            >
              {settings.categories[cat] ? 'Açık' : 'Kapalı'}
            </button>
          </div>
        ))}
        {settings.categories.erotik && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Aşırı açık görevleri çıkar</span>
            <button 
              style={{
                padding: '5px 15px',
                borderRadius: '20px',
                border: 'none',
                background: settings.erotikExtreme ? 'var(--color-green)' : 'var(--color-red)',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => setSettings(prev => ({ ...prev, erotikExtreme: !prev.erotikExtreme }))}
            >
              {settings.erotikExtreme ? 'Açık' : 'Kapalı'}
            </button>
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={onNext}>
        OYUNU BAŞLAT
      </button>
    </div>
  );
};

export default Settings;
