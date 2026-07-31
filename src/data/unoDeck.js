// ─── UNO Destesi ─────────────────────────────────────────────────────────────
// Standart UNO: 4 renk × (0×1 + 1-9×2) + aksiyonlar (Skip, Reverse, +2) × 2/renk
// + Wild × 4 + Wild+4 × 4
// Bizim oyun: Skip = Bloke/Soru, Reverse = YOK, +2/+4 → Görev Kartları

export const UNO_COLORS = ['kırmızı', 'mavi', 'yeşil', 'sarı'];

export const COLOR_HEX = {
  kırmızı: '#e63946',
  mavi:    '#4361ee',
  yeşil:   '#2dc653',
  sarı:    '#f9c74f',
};

export const COLOR_DARK = {
  kırmızı: '#8b1a22',
  mavi:    '#1a237e',
  yeşil:   '#1a5c2a',
  sarı:    '#c8960c',
};

export const CARD_TYPES = {
  NUMBER:  'number',   // 0-9
  SKIP:    'skip',     // Bloke / Soru
  REVERSE: 'reverse',  // Yön Değiştir / Soru
  WILD:    'wild',     // Renk seç
  TASK:    'task',     // Görev kartı (oyunumuza özel - +2/+4 yerine)
};

// Standart UNO destesi oluştur
export function buildUnoDeck(mockQuestions = [], usedTaskIds = []) {
  const deck = [];
  let id = 1;

  UNO_COLORS.forEach(color => {
    // 0 → 1 adet
    deck.push({ id: id++, type: CARD_TYPES.NUMBER, color, value: 0, display: '0' });

    // 1-9 → 2'şer adet
    for (let n = 1; n <= 9; n++) {
      deck.push({ id: id++, type: CARD_TYPES.NUMBER, color, value: n, display: String(n) });
      deck.push({ id: id++, type: CARD_TYPES.NUMBER, color, value: n, display: String(n) });
    }

    // Skip (Bloke/Soru) × 2
    for (let i = 0; i < 2; i++) {
      let qData = null;
      if (mockQuestions.length > 0) {
        const availableQs = mockQuestions.filter(q => !usedTaskIds.includes(q.id));
        if (availableQs.length > 0) {
          const randomQ = availableQs[Math.floor(Math.random() * availableQs.length)];
          qData = { ...randomQ, penaltyDo: 0, penaltyFail: 0, penaltyRefuse: 0 };
        }
      }
      deck.push({ id: id++, type: CARD_TYPES.SKIP, color, value: 20, display: '⊘', questionData: qData });
    }

    // Reverse (Yön Değiştir/Soru) × 2
    for (let i = 0; i < 2; i++) {
      let qData = null;
      if (mockQuestions.length > 0) {
        const availableQs = mockQuestions.filter(q => !usedTaskIds.includes(q.id));
        if (availableQs.length > 0) {
          const randomQ = availableQs[Math.floor(Math.random() * availableQs.length)];
          qData = { ...randomQ, penaltyDo: 0, penaltyFail: 0, penaltyRefuse: 0 };
        }
      }
      deck.push({ id: id++, type: CARD_TYPES.REVERSE, color, value: 20, display: '⇄', questionData: qData });
    }
  });

  // Wild × 4 (Sadece renk değiştir)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, type: CARD_TYPES.WILD, color: 'wild', value: 50, display: 'W' });
  }

  return deck;
}

// Görev kartlarını MOCK_CARDS'tan al ve UNO görev kartı formatına çevir
// target: kimin yapacağı ('woman' | 'man' | 'ortak')
// holder: kartı elinde tutan kişi (her zaman rakip!)
// penaltyDo: görevi yaparsa çekilecek kart sayısı
// penaltyRefuse: reddederse çekilecek kart sayısı
// penaltyFail: yapamamazsa çekilecek kart sayısı
export function buildTaskCards(mockCards, taskCount, holderGender, usedTaskIds = []) {
  // holderGender: kartı elinde tutacak kişi (rakibinin görevlerini tutar)
  // targetGender: görevi yapacak kişi (rakip)
  const targetGender = holderGender === 'woman' ? 'man' : 'woman';

  // Ortak kartları da dahil et ve kullanılmışları filtrele
  const pool = mockCards.filter(c =>
    (c.target === targetGender || c.target === 'ortak') && !usedTaskIds.includes(c.id)
  );

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, taskCount);

  return selected.map((card, i) => {
    let finalPenalty = card.penaltyAmount;
    if (finalPenalty === 'random') {
      finalPenalty = Math.floor(Math.random() * 8) + 1; // 1-8 arası
    } else {
      finalPenalty = parseInt(finalPenalty, 10);
      if (isNaN(finalPenalty)) finalPenalty = Math.max(2, Math.floor((card.points || 10) / 5));
    }

    return {
      id: 10000 + i,
      type: CARD_TYPES.TASK,
      color: 'wild',           // Görev kartları her renge atılabilir
      value: card.points || 10,
      display: card.penaltyAmount === 'random' ? 'Rastgele' : `+${finalPenalty}`,
      taskData: card,
      // Ceza miktarları: Başarı = Ceza, Başarısızlık = Ceza * 2
      penaltyDo:     finalPenalty,
      penaltyFail:   finalPenalty * 2,
      penaltyRefuse: 0, // Reddetmek yok
    };
  });
}

// Desteyi karıştır
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Oyunu başlatmak için deste + el dağıtımı
// deckSize: UNO kartı sayısı
// taskCount: görev kartı sayısı
// localGender: yerel oyuncunun cinsiyeti
export function dealGame(deckSize, taskCount, localGender, mockCards, mockQuestions = [], usedTaskIds = []) {
  // Tüm UNO destesini oluştur
  const fullUno = shuffle(buildUnoDeck(mockQuestions, usedTaskIds));

  // Her oyuncuya deckSize kadar UNO kartı
  const myUnoCards    = fullUno.slice(0, deckSize);
  const theirUnoCards = fullUno.slice(deckSize, deckSize * 2);
  // Orta desteye karıştırılacak görev kartları (çekilebilir görevler)
  // 10 adet görev kartı desteye serpiştirilir. Bunlar oynandığında her zaman rakibe etki eder.
  const poolTasks = mockCards.filter(c => c.target !== 'ortak' && !usedTaskIds.includes(c.id));
  const shuffledTasks = shuffle([...poolTasks]);
  const deckTasks = shuffledTasks.slice(0, 10).map((card, i) => {
    let finalPenalty = card.penaltyAmount === 'random' ? (Math.floor(Math.random() * 8) + 1) : parseInt(card.penaltyAmount, 10);
    if (isNaN(finalPenalty)) finalPenalty = 2;
    return {
      id: 30000 + i,
      type: CARD_TYPES.TASK,
      color: 'wild',
      value: card.points || 10,
      display: card.penaltyAmount === 'random' ? 'Rastgele' : `+${finalPenalty}`,
      taskData: { ...card, title: 'Sürpriz Görev: ' + (card.title || '') },
      penaltyDo: finalPenalty,
      penaltyFail: finalPenalty * 2,
      penaltyRefuse: 0
    };
  });

  const remainingDeck = shuffle([...fullUno.slice(deckSize * 2), ...deckTasks]);

  // Görev kartları: BENİM elimdekiler RAKİBİM içindir
  // localGender='woman' → bende man görevleri var, rakipte woman görevleri var
  const myTaskCards   = buildTaskCards(mockCards, taskCount, localGender, usedTaskIds);
  const theirTaskCards= buildTaskCards(mockCards, taskCount, localGender === 'woman' ? 'man' : 'woman', usedTaskIds);

  // Orta deste: ilk açılan kart (sayı kartı olmalı)
  let topCard = null;
  let drawPile = [...remainingDeck];
  for (let i = 0; i < drawPile.length; i++) {
    if (drawPile[i].type === CARD_TYPES.NUMBER) {
      topCard = drawPile.splice(i, 1)[0];
      break;
    }
  }
  if (!topCard) {
    topCard = { id: 99999, type: CARD_TYPES.NUMBER, color: 'kırmızı', value: 7, display: '7' };
  }

  return {
    myHand:       shuffle([...myUnoCards,    ...myTaskCards]),
    theirHand:    shuffle([...theirUnoCards, ...theirTaskCards]),
    drawPile,
    discardPile:  [topCard],
    topCard,
    currentColor: topCard.color,
  };
}

// Kart atılabilir mi?
// currentColor: mevcut aktif renk
// topCard: üstteki kart
// card: atılmak istenen kart
export function canPlayCard(card, topCard, currentColor) {
  if (!card || !topCard) return false;
  // Görev kartı her zaman atılabilir (wild gibi)
  if (card.type === CARD_TYPES.TASK) return true;
  // Wild her zaman atılabilir
  if (card.type === CARD_TYPES.WILD) return true;
  // Ortadaki kart bir Görev Kartıysa, üzerine İSTENİLEN kart atılabilir!
  if (topCard.type === CARD_TYPES.TASK) return true;
  // Aynı renk
  if (card.color === currentColor) return true;
  // Aynı değer/tip
  if (card.type === CARD_TYPES.NUMBER && topCard.type === CARD_TYPES.NUMBER && card.value === topCard.value) return true;
  if (card.type === CARD_TYPES.SKIP    && topCard.type === CARD_TYPES.SKIP)    return true;
  if (card.type === CARD_TYPES.REVERSE && topCard.type === CARD_TYPES.REVERSE) return true;
  return false;
}

import { CARD_SCORES } from './cards';

// Kart puanı (oyun sonu hesabı için)
export function cardScore(card) {
  if (!card) return 0;
  if (card.type === CARD_TYPES.TASK) return CARD_SCORES.task;
  if (card.type === CARD_TYPES.SKIP) return CARD_SCORES.skip;
  if (card.type === CARD_TYPES.REVERSE) return CARD_SCORES.reverse;
  if (card.type === CARD_TYPES.WILD) return CARD_SCORES.wild;
  return card.value || CARD_SCORES.number;
}
