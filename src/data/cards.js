export const MOCK_CARDS = [
  // ===== ERKEK KARTLARI =====
  { id: 1,  target: 'man', category: 'erotik', title: 'Boyun Öpücüğü',     text: 'Partnerinin boynundan öperek aşağı in.',                              points: 10, duration: 0,  isCountable: false },
  { id: 2,  target: 'man', category: 'igrenc', title: 'Ayak Fantezisi',    text: 'Partnerinin ayak parmağını yala.',                                    points: 15, duration: 0,  isCountable: false },
  { id: 3,  target: 'man', category: 'sureli', title: 'Göz Teması',        text: 'Partnerinle göz temasını bozmadan 1 dakika bekle.',                   points: 5,  duration: 60, isCountable: false },
  { id: 4,  target: 'man', category: 'ortak',  title: 'Müzik Ziyafeti',    text: 'Beraber en sevdiğiniz şarkıyı söyleyin.',                             points: 5,  duration: 0,  isCountable: false },
  { id: 5,  target: 'man', category: 'erotik', title: 'Kulak Fısıltısı',   text: 'Partnerine kulağına erotik bir şey fısılda.',                         points: 10, duration: 0,  isCountable: false },
  { id: 6,  target: 'man', category: 'zor',    title: 'Tek El Şınav',      text: 'Tek elle 3 şınav çek.',                                               points: 20, duration: 0,  isCountable: true  },
  { id: 7,  target: 'man', category: 'sayili', title: '10 Öpücük',         text: 'Partnerini farklı 10 yerinden öp.',                                   points: 15, duration: 0,  isCountable: true  },
  { id: 8,  target: 'man', category: 'mini',   title: 'Tahmin Et',         text: 'Partnerinin gözleri kapalıyken 3 cismi dokunarak tahmin etsin.',       points: 10, duration: 0,  isCountable: false },
  { id: 9,  target: 'man', category: 'erotik', title: 'Bel Masajı',        text: 'Partnerine 2 dakika bel masajı yap.',                                 points: 10, duration: 120,isCountable: false },
  { id: 10, target: 'man', category: 'soru',   title: 'Gizli Hayal',       text: 'Hayalindeki en erotik gecenin detaylarını anlat.',                    points: 10, duration: 0,  isCountable: false },
  { id: 11, target: 'man', category: 'soru',   title: 'İtiraf Vakti',      text: 'Partnerine daha önce hiç söylemediğin bir sırrını anlat.',             points: 10, duration: 0,  isCountable: false },
  { id: 12, target: 'man', category: 'erotik', title: 'Dudak Isırma',      text: 'Partnerinin dudağını hafifçe ısır.',                                  points: 10, duration: 0,  isCountable: false },

  // ===== KADIN KARTLARI =====
  { id: 21, target: 'woman', category: 'erotik', title: 'Kucak Dansı',     text: 'Partnerine kucak dansı yap.',                                        points: 20, duration: 60, isCountable: false },
  { id: 22, target: 'woman', category: 'zor',    title: 'Akrobat',         text: 'Amuda kalkmayı dene.',                                               points: 10, duration: 0,  isCountable: false },
  { id: 23, target: 'woman', category: 'sayili', title: 'Şınav Şov',       text: '5 şınav çek.',                                                       points: 15, duration: 0,  isCountable: true  },
  { id: 24, target: 'woman', category: 'ortak',  title: 'Müzik Ziyafeti',  text: 'Beraber en sevdiğiniz şarkıyı söyleyin.',                            points: 5,  duration: 0,  isCountable: false },
  { id: 25, target: 'woman', category: 'erotik', title: 'Saç Okşama',      text: 'Partnerinin saçlarını 1 dakika boyunca okşa.',                        points: 10, duration: 60, isCountable: false },
  { id: 26, target: 'woman', category: 'mini',   title: 'Yavaş Dans',      text: 'Partnerinle 1 dakika yavaş dans et.',                                points: 10, duration: 60, isCountable: false },
  { id: 27, target: 'woman', category: 'igrenc', title: 'Karanlık Öpücük', text: 'Gözlerin kapalıyken partnerinin yüzünü bul ve öp.',                  points: 15, duration: 0,  isCountable: false },
  { id: 28, target: 'woman', category: 'erotik', title: 'Boyun Masajı',    text: 'Partnerine 2 dakika boyun masajı yap.',                              points: 10, duration: 120,isCountable: false },
  { id: 29, target: 'woman', category: 'soru',   title: 'Vücut Favorisi',  text: 'Vücudumda en beğendiğin yeri ve neden beğendiğini anlat.',           points: 10, duration: 0,  isCountable: false },
  { id: 30, target: 'woman', category: 'soru',   title: 'İlk Bakış',       text: 'İlk gördüğünde bende seni en çok ne etkiledi?',                      points: 10, duration: 0,  isCountable: false },
  { id: 31, target: 'woman', category: 'erotik', title: 'Kulak Isırma',    text: 'Partnerinin kulağını nazikçe ısır ve fısılda.',                      points: 10, duration: 0,  isCountable: false },
  { id: 32, target: 'woman', category: 'zor',    title: 'Köprü Pozu',      text: 'Köprü pozunda 30 saniye kal.',                                       points: 15, duration: 30, isCountable: false },
];

export const MOCK_JOKERS = [
  { id: 101, title: 'Pas Geç',       text: 'Görevi yapmadan reddetme cezası almadan geçersin.' },
  { id: 102, title: 'Görev Değiştir',text: 'Mevcut görevi çöpe atıp yeni bir kart çekersin.' },
  { id: 103, title: 'Süreyi Dondur', text: 'Bu görev boyunca süren işlemez.' },
  { id: 104, title: 'Puan Çal',      text: 'Partnerinin toplam puanından 5 puan çalarsın.' },
];

export const MOCK_QUESTIONS = [
  { id: 201, title: 'İlk Buluşma',   text: 'İlk buluşmamızda benim hakkımda ne düşünmüştün?' },
  { id: 202, title: 'Gizli Fantezi', text: 'Bana hiç söylemediğin bir fantezini anlat.' },
  { id: 203, title: 'Utanç Verici An',text: 'Benim yanımda yaşadığın en utanç verici an neydi?' },
  { id: 204, title: 'Vücut Favorisi', text: 'Vücudumda en beğendiğin yer neresi?' },
];

export const MOCK_PENALTIES = [
  { id: 301, title: 'Buzlu Su',      text: 'Partnerin ensenden içeri bir bardak soğuk su dökebilir.' },
  { id: 302, title: 'Köle',          text: 'Önümüzdeki 5 dakika boyunca partnerinin her dediğini yapmak zorundasın.' },
  { id: 303, title: 'Gıdıklama',     text: 'Partnerin seni pes edene kadar gıdıklayacak.' },
  { id: 304, title: 'Masaj',         text: 'Partnerine 5 dakika boyunca omuz masajı yap.' },
  { id: 305, title: 'Striptiz',      text: 'Partnerine küçük bir striptiz şov yap.' },
  { id: 306, title: 'Makyaj',        text: 'Partnerin sana istediği makyajı yapabilir.' },
  { id: 307, title: 'Serenata',      text: 'Partnerine bir şarkı söyle.' },
  { id: 308, title: 'Süpriz Öpücük', text: 'Partnerin seçtiği 3 yeri öpeceksin.' },
  { id: 309, title: 'Fısıltı',       text: '5 dakika boyunca sadece fısıldayarak konuşacaksın.' },
];
