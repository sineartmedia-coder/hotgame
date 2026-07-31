import customData from './customCards.json';

export const MOCK_CARDS = customData.tasks || [];
export const MOCK_QUESTIONS = customData.questions || [];
export const MOCK_COMMON_TASKS = customData.games || [];

export const MOCK_JOKERS = [
  { id: 101, title: 'Pas Geç',       text: 'Görevi yapmadan reddetme cezası almadan geçersin.' },
  { id: 102, title: 'Görev Değiştir',text: 'Mevcut görevi çöpe atıp yeni bir kart çekersin.' },
  { id: 103, title: 'Süreyi Dondur', text: 'Bu görev boyunca süren işlemez.' },
  { id: 104, title: 'Puan Çal',      text: 'Partnerinin toplam puanından 5 puan çalarsın.' },
];

export const MOCK_PENALTIES = customData.penalties || [];

export const CARD_SCORES = customData.scores || {
  number: 5,
  skip: 20,
  reverse: 20,
  wild: 50,
  task: 10
};
