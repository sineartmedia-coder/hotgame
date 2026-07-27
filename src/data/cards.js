export const MOCK_CARDS = [
  // ===== ERKEK KARTLARI =====
  { id: 1,  target: 'man', category: 'erotik', title: 'Boyun Öpücüğü',     text: 'Partnerinin boynundan öperek aşağı in.',                              points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 2,  target: 'man', category: 'igrenc', title: 'Ayak Fantezisi',    text: 'Partnerinin ayak parmağını yala.',                                    points: 15, taskType: 'solo', duration: 0,  countable: false },
  { id: 3,  target: 'man', category: 'sureli', title: 'Göz Teması',        text: 'Partnerinle göz temasını bozmadan bekle.',                            points: 10, taskType: 'timed', duration: 60, countable: false },
  { id: 4,  target: 'man', category: 'ortak',  title: 'Müzik Ziyafeti',    text: 'Beraber en sevdiğiniz şarkıyı söyleyin.',                             points: 10, taskType: 'coop', duration: 0,  countable: false },
  { id: 5,  target: 'man', category: 'erotik', title: 'Kulak Fısıltısı',   text: 'Partnerine kulağına erotik bir şey fısılda.',                         points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 6,  target: 'man', category: 'zor',    title: 'Tek El Şınav',      text: 'Tek elle şınav çek.',                                                 points: 20, taskType: 'counted', duration: 0,  countable: true  },
  { id: 7,  target: 'man', category: 'sayili', title: 'Öpücük Yağmuru',    text: 'Partnerini farklı yerlerinden öp.',                                   points: 15, taskType: 'counted', duration: 0,  countable: true  },
  { id: 8,  target: 'man', category: 'mini',   title: 'Tahmin Et',         text: 'Partnerinin gözleri kapalıyken 3 cismi dokunarak tahmin etsin.',       points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 9,  target: 'man', category: 'erotik', title: 'Bel Masajı',        text: 'Partnerine bel masajı yap.',                                          points: 15, taskType: 'timed', duration: 120,countable: false },
  { id: 10, target: 'man', category: 'soru',   title: 'Gizli Hayal',       text: 'Hayalindeki en erotik gecenin detaylarını anlat.',                    points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 11, target: 'man', category: 'soru',   title: 'İtiraf Vakti',      text: 'Partnerine daha önce hiç söylemediğin bir sırrını anlat.',             points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 12, target: 'man', category: 'erotik', title: 'Dudak Isırma',      text: 'Partnerinin dudağını hafifçe ısır.',                                  points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 13, target: 'man', category: 'zor',    title: 'Çiğ Et',            text: 'Küçük bir parça çiğ tavuk/et ye.',                                    points: 25, taskType: 'solo', duration: 0,  countable: false },
  { id: 14, target: 'man', category: 'ortak',  title: 'Top Havada',        text: 'Balonu veya topu yere düşürmeden havada tutun.',                      points: 15, taskType: 'coop', duration: 60, countable: false },
  { id: 15, target: 'man', category: 'sureli', title: 'Zıplama Çılgınlığı',text: 'Zıpla!',                                                              points: 15, taskType: 'timed+counted', duration: 120, countable: true },
  
  // ===== KADIN KARTLARI =====
  { id: 21, target: 'woman', category: 'erotik', title: 'Kucak Dansı',     text: 'Partnerine kucak dansı yap.',                                        points: 20, taskType: 'timed', duration: 60, countable: false },
  { id: 22, target: 'woman', category: 'zor',    title: 'Akrobat',         text: 'Amuda kalkmayı dene.',                                               points: 15, taskType: 'solo', duration: 0,  countable: false },
  { id: 23, target: 'woman', category: 'sayili', title: 'Şınav Şov',       text: 'Şınav çek.',                                                         points: 15, taskType: 'counted', duration: 0,  countable: true  },
  { id: 24, target: 'woman', category: 'ortak',  title: 'Göz Göze',        text: 'Birbirinizin gözlerine bakarak hiç gülmeden durun.',                 points: 10, taskType: 'coop', duration: 60, countable: false },
  { id: 25, target: 'woman', category: 'erotik', title: 'Saç Okşama',      text: 'Partnerinin saçlarını okşa.',                                        points: 10, taskType: 'timed', duration: 60, countable: false },
  { id: 26, target: 'woman', category: 'mini',   title: 'Yavaş Dans',      text: 'Partnerinle yavaş dans et.',                                         points: 10, taskType: 'timed', duration: 60, countable: false },
  { id: 27, target: 'woman', category: 'igrenc', title: 'Karanlık Öpücük', text: 'Gözlerin kapalıyken partnerinin yüzünü bul ve öp.',                  points: 15, taskType: 'solo', duration: 0,  countable: false },
  { id: 28, target: 'woman', category: 'erotik', title: 'Boyun Masajı',    text: 'Partnerine boyun masajı yap.',                                       points: 15, taskType: 'timed', duration: 120,countable: false },
  { id: 29, target: 'woman', category: 'soru',   title: 'Vücut Favorisi',  text: 'Vücudumda en beğendiğin yeri ve neden beğendiğini anlat.',           points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 30, target: 'woman', category: 'soru',   title: 'İlk Bakış',       text: 'İlk gördüğünde bende seni en çok ne etkiledi?',                      points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 31, target: 'woman', category: 'erotik', title: 'Kulak Isırma',    text: 'Partnerinin kulağını nazikçe ısır ve fısılda.',                      points: 10, taskType: 'solo', duration: 0,  countable: false },
  { id: 32, target: 'woman', category: 'zor',    title: 'Köprü Pozu',      text: 'Köprü pozunda kal.',                                                 points: 15, taskType: 'timed', duration: 30, countable: false },
  { id: 33, target: 'woman', category: 'zor',    title: 'Buzlu Öpücük',    text: 'Ağzına bir buz alıp partnerini öp.',                                 points: 15, taskType: 'solo', duration: 0,  countable: false },
  { id: 34, target: 'woman', category: 'ortak',  title: 'Meyve Ziyafeti',  text: 'Gözleri kapalı şekilde partnerine meyve yedir.',                     points: 10, taskType: 'coop', duration: 0,  countable: false },
  { id: 35, target: 'woman', category: 'sureli', title: 'İp Atlama',       text: 'İp atla!',                                                           points: 15, taskType: 'timed+counted', duration: 120, countable: true },
];

export const MOCK_JOKERS = [
  { id: 101, title: 'Pas Geç',       type: 'skip',   text: 'Görevi yapmadan reddetme cezası almadan geçersin.' },
  { id: 102, title: 'Görev Değiştir',type: 'swap',   text: 'Mevcut görevi çöpe atıp yeni bir kart çekersin.' },
  { id: 103, title: 'Süreyi Dondur', type: 'freeze', text: 'Bu görev boyunca süren işlemez.' },
  { id: 104, title: 'Puan Çal',      type: 'steal',  text: 'Rakibinden 5 puan çalarsın.' },
  { id: 105, title: 'Bonus Puan',    type: 'bonus',  text: 'Kendine anında 10 puan eklersin.' },
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
