// ─── UNO Destesi ─────────────────────────────────────────────────────────────
// Standart UNO: 4 renk × (0×1 + 1-9×2) + aksiyonlar (Skip, Reverse, +2) × 2/renk
// + Wild × 4 + Wild+4 × 4
// Bizim oyun: Skip = Pas, Reverse = Yön Değiştir, +2/+4 → Görev Kartları

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

// Kart tipleri
export const CARD_TYPES = {
  NUMBER:  'number',   // 0-9
  SKIP:    'skip',     // Pas
  REVERSE: 'reverse',  // Yön Değiştir (2 kişide = Skip)
  WILD:    'wild',     // Renk seç
  TASK:    'task',     // Görev kartı (oyunumuza özel - +2/+4 yerine)
};

// Standart UNO destesi oluştur
export function buildUnoDeck(mockQuestions = []) {
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

    // Skip × 2
    deck.push({ id: id++, type: CARD_TYPES.SKIP, color, value: 20, display: '🚫' });
    deck.push({ id: id++, type: CARD_TYPES.SKIP, color, value: 20, display: '🚫' });

    // Reverse × 2
    deck.push({ id: id++, type: CARD_TYPES.REVERSE, color, value: 20, display: '🔄' });
    deck.push({ id: id++, type: CARD_TYPES.REVERSE, color, value: 20, display: '🔄' });
  });

  // Wild × 4
  for (let i = 0; i < 4; i++) {
    let qData = null;
    if (mockQuestions.length > 0) {
      // Pick a random question
      const randomQ = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
      qData = {
        ...randomQ,
        penaltyDo: 0,
        penaltyFail: randomQ.penaltyAmount || 3,
        penaltyRefuse: randomQ.penaltyAmount ? randomQ.penaltyAmount + 2 : 5
      };
    }
    deck.push({ id: id++, type: CARD_TYPES.WILD, color: 'wild', value: 50, display: '❓', questionData: qData });
  }

  return deck;
}

// Görev kartlarını MOCK_CARDS'tan al ve UNO görev kartı formatına çevir
// target: kimin yapacağı ('woman' | 'man' | 'ortak')
// holder: kartı elinde tutan kişi (her zaman rakip!)
// penaltyDo: görevi yaparsa çekilecek kart sayısı
// penaltyRefuse: reddederse çekilecek kart sayısı
// penaltyFail: yapamamazsa çekilecek kart sayısı
export function buildTaskCards(mockCards, taskCount, holderGender) {
  // holderGender: kartı elinde tutacak kişi (rakibinin görevlerini tutar)
  // targetGender: görevi yapacak kişi (rakip)
  const targetGender = holderGender === 'woman' ? 'man' : 'woman';

  // Ortak kartları da dahil et
  const pool = mockCards.filter(c =>
    c.target === targetGender || c.target === 'ortak'
  );

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, taskCount);

  return selected.map((card, i) => ({
    id: 10000 + i,
    type: CARD_TYPES.TASK,
    color: 'wild',           // Görev kartları her renge atılabilir
    value: card.points || 10,
    display: `+${card.penaltyAmount || Math.max(2, Math.floor((card.points || 10) / 5))}`,
    taskData: card,
    // Ceza miktarları: admin panelden geliyorsa onu kullan, yoksa eski hesabı kullan
    penaltyDo:     0, // Eskiden görevi yapana da kart çektiriyorduk, artık mantıksız olabilir ama 0 yapalım
    penaltyRefuse: (card.penaltyAmount ? card.penaltyAmount + 2 : Math.max(4, Math.floor((card.points || 10) / 2.5))),
    penaltyFail:   (card.penaltyAmount || Math.max(3, Math.floor((card.points || 10) / 3.5))),
  }));
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
export function dealGame(deckSize, taskCount, localGender, mockCards, mockQuestions = []) {
  // Tüm UNO destesini oluştur
  const fullUno = shuffle(buildUnoDeck(mockQuestions));

  // Her oyuncuya deckSize kadar UNO kartı
  const myUnoCards    = fullUno.slice(0, deckSize);
  const theirUnoCards = fullUno.slice(deckSize, deckSize * 2);
  const remainingDeck = fullUno.slice(deckSize * 2);

  // Görev kartları: BENİM elimdekiler RAKİBİM içindir
  // localGender='woman' → bende man görevleri var, rakipte woman görevleri var
  const myTaskCards   = buildTaskCards(mockCards, taskCount, localGender);
  const theirTaskCards= buildTaskCards(mockCards, taskCount, localGender === 'woman' ? 'man' : 'woman');

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
  // Aynı renk
  if (card.color === currentColor) return true;
  // Aynı değer/tip
  if (card.type === CARD_TYPES.NUMBER && topCard.type === CARD_TYPES.NUMBER && card.value === topCard.value) return true;
  if (card.type === CARD_TYPES.SKIP    && topCard.type === CARD_TYPES.SKIP)    return true;
  if (card.type === CARD_TYPES.REVERSE && topCard.type === CARD_TYPES.REVERSE) return true;
  return false;
}

// Kart puanı (oyun sonu hesabı için)
export function cardScore(card) {
  if (!card) return 0;
  if (card.type === CARD_TYPES.TASK) return card.taskData?.points || 10;
  return card.value || 0;
}
