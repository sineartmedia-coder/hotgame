export const buildBalancedDeck = (allCards, targetGender, deckSize, enabledCategories, disabledTaskIds) => {
  // 1. Filtrele (cinsiyet, aktif kategoriler, kapalı kartlar)
  const availableCards = allCards.filter(card => {
    if (card.target !== targetGender && card.target !== 'both') return false;
    if (!enabledCategories[card.category]) return false;
    if (disabledTaskIds.includes(card.id)) return false;
    return true;
  });

  if (deckSize <= 0) {
    return availableCards.sort(() => Math.random() - 0.5);
  }

  // 2. Açık olan kategori listesini bul
  const activeCats = Object.keys(enabledCategories).filter(cat => enabledCategories[cat]);
  if (activeCats.length === 0) return [];

  // 3. Her kategoriye düşmesi gereken ortalama kart sayısını hesapla
  // Örneğin 10 kart, 3 kategori varsa: 3, 3, 4 dağılımı gibi.
  const cardsPerCategory = Math.floor(deckSize / activeCats.length);
  let remainder = deckSize % activeCats.length;

  const categoryCounts = {};
  activeCats.forEach(cat => {
    categoryCounts[cat] = cardsPerCategory;
  });

  // Kalanı rastgele kategorilere dağıt (her kategoriye max 1 tane)
  const shuffledCats = [...activeCats].sort(() => Math.random() - 0.5);
  for (let i = 0; i < remainder; i++) {
    categoryCounts[shuffledCats[i]] += 1;
  }

  // 4. Kartları kategorilerine göre grupla
  const grouped = {};
  activeCats.forEach(cat => grouped[cat] = []);
  availableCards.forEach(card => {
    if (grouped[card.category]) {
      grouped[card.category].push(card);
    }
  });

  // 5. Her kategoriden istenen sayıda rastgele kart seç
  let finalDeck = [];
  activeCats.forEach(cat => {
    let needed = categoryCounts[cat];
    let catCards = grouped[cat].sort(() => Math.random() - 0.5);
    
    // Eğer kategoride yeterli kart yoksa, alabildiğin kadarını al
    // (Gelecekte eksik kalan sayıyı diğer kategorilerden tamamlamak eklenebilir)
    const selected = catCards.slice(0, needed);
    finalDeck.push(...selected);
  });

  // Karıştır ve döndür
  return finalDeck.sort(() => Math.random() - 0.5);
};
