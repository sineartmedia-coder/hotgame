import { useState, useEffect } from 'react';
import Home from './components/Home.jsx';
import Settings from './components/Settings.jsx';
import NameEntry from './components/NameEntry.jsx';
import DiceRoll from './components/DiceRoll.jsx';
import Game from './components/Game.jsx';
import GameOver from './components/GameOver.jsx';
import { MultiplayerProvider } from './context/MultiplayerContext.jsx';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hotgameSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      deckSize: 7,
      taskCardCount: 3,
      categories: {
        erotik: true,
        igrenc: true,
        zor: true,
        mini: true,
        sureli: true,
        sayili: true,
        ortak: true,
        cift: true,
        tekli: true,
        soru: true
      },
      roundCount: 1, // Tur Sayısı
      disabledTasks: [],
      disabledJokers: [],
      disabledQuestions: [],
      disabledPenalties: [],
      duration: 60,
      jokerCount: 3,
      penaltyCards: true
    };
  });
  
  useEffect(() => {
    localStorage.setItem('hotgameSettings', JSON.stringify(settings));
  }, [settings]);
  
  const [players, setPlayers] = useState({
    woman: { name: 'Oyuncu 1', score: 0, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60, avatar: '💋' },
    man: { name: 'Oyuncu 2', score: 0, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60, avatar: '🍆' }
  });
  
  const [startingPlayer, setStartingPlayer] = useState(null);
  
  // Tur yönetimi ve kullanılmış kartların takibi
  const [currentRound, setCurrentRound] = useState(1);
  const [usedTaskIds, setUsedTaskIds] = useState([]);

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      setPlayers(p => ({
        woman: { ...p.woman, timeRemaining: updated.duration * 60, jokers: updated.jokerCount },
        man: { ...p.man, timeRemaining: updated.duration * 60, jokers: updated.jokerCount }
      }));
      return updated;
    });
  };

  const handleRestart = () => {
    setPlayers({
      woman: { name: 'Oyuncu 1', score: 0, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60, avatar: '💋' },
      man: { name: 'Oyuncu 2', score: 0, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60, avatar: '🍆' }
    });
    setStartingPlayer(null);
    setCurrentRound(1);
    setUsedTaskIds([]);
    setCurrentScreen('home');
  };

  const handleNextRound = () => {
    // Sadece eller ve durum sıfırlanır, puanlar korunur
    setPlayers(prev => ({
      woman: { ...prev.woman, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60 },
      man: { ...prev.man, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60 }
    }));
    setCurrentRound(r => r + 1);
    setCurrentScreen('game');
  };

  return (
    <MultiplayerProvider>
      <div className="app-container">
        {currentScreen === 'home' && <Home onStart={() => setCurrentScreen('settings')} />}
        {currentScreen === 'settings' && <Settings settings={settings} setSettings={updateSettings} onNext={() => setCurrentScreen('nameEntry')} />}
        {currentScreen === 'nameEntry' && <NameEntry players={players} setPlayers={setPlayers} onNext={() => setCurrentScreen('game')} />}
        {currentScreen === 'game' && <Game players={players} setPlayers={setPlayers} startingPlayer={startingPlayer} onFinish={() => setCurrentScreen('gameOver')} settings={settings} usedTaskIds={usedTaskIds} setUsedTaskIds={setUsedTaskIds} />}
        {currentScreen === 'gameOver' && <GameOver players={players} setPlayers={setPlayers} onRestart={handleRestart} currentRound={currentRound} roundCount={settings.roundCount || 1} onNextRound={handleNextRound} />}
      </div>
    </MultiplayerProvider>
  );
}

export default App;
