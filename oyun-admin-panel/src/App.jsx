import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [data, setData] = useState({ tasks: [], games: [], questions: [] });
  const [loading, setLoading] = useState(true);

  // Form states for Tasks
  const [taskText, setTaskText] = useState('');
  const [penalty, setPenalty] = useState('2');
  const [target, setTarget] = useState('ortak');
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [duration, setDuration] = useState(60);
  const [isDiceBased, setIsDiceBased] = useState(false);
  const [isGame, setIsGame] = useState(false);

  // Form states for Games (Ortak Görevler)
  const [winnerDrawCount, setWinnerDrawCount] = useState('');
  const [loserDrawCount, setLoserDrawCount] = useState('');
  const [winnerMinusPoints, setWinnerMinusPoints] = useState('');
  const [winType, setWinType] = useState('single');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/cards');
      const json = await res.json();
      if (json) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData) => {
    try {
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      setData(newData);
    } catch (err) {
      console.error('Failed to save data', err);
    }
  };

  const handleAddItem = (e, type) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      text: taskText,
      points: penalty === 'random' ? 0 : parseInt(penalty, 10) * 5,
      penaltyAmount: penalty === 'random' ? 'random' : parseInt(penalty, 10),
      target: type === 'games' ? 'ortak' : target,
      isTimeBased: type === 'questions' ? false : isTimeBased,
      duration: (type === 'questions' || !isTimeBased) ? 0 : parseInt(duration, 10),
      isDiceBased: type === 'questions' ? false : isDiceBased,
      isGame: type === 'games' ? true : (type === 'questions' ? false : isGame),
      category: type === 'games' ? 'ortak' : (target === 'ortak' ? 'ortak' : 'normal'),
      ...(type === 'games' ? {
        winnerDrawCount: parseInt(winnerDrawCount || '0', 10),
        loserDrawCount: parseInt(loserDrawCount || '0', 10),
        winnerMinusPoints: parseInt(winnerMinusPoints || '0', 10),
        winType: winType
      } : {})
    };

    const newData = { ...data, [type]: [...(data[type] || []), newItem] };
    saveData(newData);
    setTaskText('');
  };

  const handleDeleteItem = (id, type) => {
    const newData = { ...data, [type]: (data[type] || []).filter(t => t.id !== id) };
    saveData(newData);
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="container">
      <header>
        <h1>Oyun Yönetim Paneli</h1>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>Görevler</button>
        <button className={activeTab === 'games' ? 'active' : ''} onClick={() => setActiveTab('games')}>Ortak Görevler</button>
        <button className={activeTab === 'questions' ? 'active' : ''} onClick={() => setActiveTab('questions')}>Sorular</button>
      </nav>

      <main>
        <div className="tab-pane">
          <div className="form-section">
            <h2>
              {activeTab === 'tasks' ? 'Yeni Görev Ekle' : 
               activeTab === 'games' ? 'Yeni Ortak Görev Ekle' : 'Yeni Soru Ekle'}
            </h2>
            <form onSubmit={(e) => handleAddItem(e, activeTab)}>
              <div className="form-group">
                <label>
                  {activeTab === 'tasks' ? 'Görev Metni' : 
                   activeTab === 'games' ? 'Ortak Görev Metni' : 'Soru Metni'}
                </label>
                <textarea 
                  required 
                  value={taskText} 
                  onChange={e => setTaskText(e.target.value)}
                  placeholder="İçeriği buraya yazın..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                {activeTab === 'tasks' && (
                  <div className="form-group">
                    <label>Ceza Miktarı (Kart)</label>
                    <select value={penalty} onChange={e => setPenalty(e.target.value)}>
                      {[1,2,3,4,5,6,7,8].map(n => (
                        <option key={n} value={n}>+{n} Kart</option>
                      ))}
                      <option value="random">Rastgele (1-8)</option>
                    </select>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="form-group">
                    <label>Cinsiyet / Hedef</label>
                    <select value={target} onChange={e => setTarget(e.target.value)}>
                      <option value="man">Erkek (Kadına Gösterilir)</option>
                      <option value="woman">Kadın (Erkeğe Gösterilir)</option>
                      <option value="ortak">Unisex (İkisine de Çıkabilir)</option>
                    </select>
                  </div>
                )}

                {activeTab === 'games' && (
                  <>
                    <div className="form-group">
                      <label>Kazanma Durumu</label>
                      <select value={winType} onChange={e => setWinType(e.target.value)}>
                        <option value="single">Tek Kişi Kazanır</option>
                        <option value="both">İki Kişi (Ortak) Başarı</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Kazanan Kaç Kart Çeker?</label>
                      <input type="number" value={winnerDrawCount} onChange={e => setWinnerDrawCount(e.target.value)} placeholder="0" />
                    </div>
                    <div className="form-group">
                      <label>Kaybeden Kaç Kart Çeker?</label>
                      <input type="number" value={loserDrawCount} onChange={e => setLoserDrawCount(e.target.value)} placeholder="0" />
                    </div>
                    <div className="form-group">
                      <label>Kazanan Eksi Puanı</label>
                      <input type="number" value={winnerMinusPoints} onChange={e => setWinnerMinusPoints(e.target.value)} placeholder="0 (Örn: -3 için 3 girin)" />
                    </div>
                  </>
                )}
              </div>

              {activeTab !== 'questions' && (
                <div className="form-row options-row">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={isDiceBased} onChange={e => setIsDiceBased(e.target.checked)} />
                    Zar Atılacak
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" checked={isTimeBased} onChange={e => setIsTimeBased(e.target.checked)} />
                    Süreli
                  </label>

                  {isTimeBased && (
                    <div className="form-group inline">
                      <label>Süre (sn):</label>
                      <input type="number" value={duration} onChange={e => setDuration(e.target.value)} style={{width: '80px'}}/>
                    </div>
                  )}

                  {activeTab === 'tasks' && (
                    <label className="checkbox-label">
                      <input type="checkbox" checked={isGame} onChange={e => setIsGame(e.target.checked)} />
                      Bu bir Mini Oyun Kartı
                    </label>
                  )}
                </div>
              )}

              <button type="submit" className="btn-primary">Karta Ekle</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Eklenenler ({data[activeTab]?.length || 0})</h2>
            <div className="card-list">
              {(data[activeTab] || []).map(item => (
                <div key={item.id} className="card">
                  <p className="card-text">{item.text}</p>
                  <div className="card-meta">
                    {activeTab !== 'questions' && <span className="badge">Hedef: {item.target}</span>}
                    {activeTab === 'tasks' && <span className="badge penalty">Ceza: {item.penaltyAmount === 'random' ? 'Rastgele' : `+${item.penaltyAmount}`}</span>}
                    {activeTab === 'games' && (
                      <>
                        <span className="badge">Kazanan Çeker: {item.winnerDrawCount}</span>
                        <span className="badge penalty">Kaybeden Çeker: {item.loserDrawCount}</span>
                        {item.winnerMinusPoints > 0 && <span className="badge">Puan Avantajı: -{item.winnerMinusPoints}</span>}
                      </>
                    )}
                    {item.isDiceBased && <span className="badge addon">🎲 Zar</span>}
                    {item.isTimeBased && <span className="badge addon">⏱ {item.duration}sn</span>}
                    {item.isGame && <span className="badge game">🎮 Oyun</span>}
                  </div>
                  <button onClick={() => handleDeleteItem(item.id, activeTab)} className="btn-delete">Sil</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
