import { useState } from 'react';
import Home from './components/Home.jsx';
import Settings from './components/Settings.jsx';
import NameEntry from './components/NameEntry.jsx';
import DiceRoll from './components/DiceRoll.jsx';
import Game from './components/Game.jsx';
import GameOver from './components/GameOver.jsx';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [settings, setSettings] = useState({
    deckSize: 24,
    categories: {
      erotik: true,
      igrenc: true,
      zor: true,
      mini: true,
      sureli: true,
      sayili: true,
      ortak: true,
      cift: true,
      tekli: true
    },
    disabledTasks: [],
    duration: 60,
    jokerCount: 3,
    penaltyCards: true
  });
  
  const [players, setPlayers] = useState({
    woman: { name: 'Oyuncu 1', score: 0, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60 },
    man: { name: 'Oyuncu 2', score: 0, completed: 0, rejected: 0, jokers: settings.jokerCount, timeRemaining: settings.duration * 60 }
  });
  
  const [startingPlayer, setStartingPlayer] = useState(null);

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

  const handleStartGame = () => {
    setCurrentScreen('nameEntry');
  };

  return (
    <div className="app-container">
      {currentScreen === 'home' && <Home onStart={() => setCurrentScreen('settings')} />}
      {currentScreen === 'settings' && <Settings settings={settings} setSettings={updateSettings} onNext={() => setCurrentScreen('nameEntry')} />}
      {currentScreen === 'nameEntry' && <NameEntry players={players} setPlayers={setPlayers} onNext={() => setCurrentScreen('dice')} />}
      {currentScreen === 'dice' && <DiceRoll players={players} onFinish={(starter) => { setStartingPlayer(starter); setCurrentScreen('game'); }} />}
      {currentScreen === 'game' && <Game players={players} setPlayers={setPlayers} startingPlayer={startingPlayer} onFinish={() => setCurrentScreen('gameOver')} settings={settings} />}
      {currentScreen === 'gameOver' && <GameOver players={players} onRestart={() => setCurrentScreen('home')} />}
    </div>
  );
}

export default App;
