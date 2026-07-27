import React from 'react';

const NameEntry = ({ players, setPlayers, onNext }) => {
  const handleChange = (e, player) => {
    setPlayers(prev => ({
      ...prev,
      [player]: { ...prev[player], name: e.target.value }
    }));
  };

  return (
    <div className="screen-container">
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Kadın Oyuncu Alanı */}
        <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--color-purple)' }}>
          <h3 style={{ color: 'var(--color-purple)', marginBottom: '1rem', textAlign: 'center' }}>Kadın Oyuncu İsmi</h3>
          <input 
            type="text" 
            value={players.woman.name}
            onChange={(e) => handleChange(e, 'woman')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--color-purple)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center',
              outline: 'none'
            }}
            placeholder="İsim girin..."
          />
        </div>

        {/* Erkek Oyuncu Alanı */}
        <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--color-orange)' }}>
          <h3 style={{ color: 'var(--color-orange)', marginBottom: '1rem', textAlign: 'center' }}>Erkek Oyuncu İsmi</h3>
          <input 
            type="text" 
            value={players.man.name}
            onChange={(e) => handleChange(e, 'man')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--color-orange)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center',
              outline: 'none'
            }}
            placeholder="İsim girin..."
          />
        </div>

        <button className="btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={onNext}>
          DEVAM
        </button>
      </div>
    </div>
  );
};

export default NameEntry;
