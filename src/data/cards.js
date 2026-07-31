import customData from './customCards.json';

export const MOCK_CARDS = customData.tasks || [];
export const MOCK_QUESTIONS = customData.questions || [];

export const MOCK_JOKERS = [
  { id: 101, title: 'Pas Geç',       text: 'Görevi yapmadan reddetme cezası almadan geçersin.' },
  { id: 102, title: 'Görev Değiştir',text: 'Mevcut görevi çöpe atıp yeni bir kart çekersin.' },
  { id: 103, title: 'Süreyi Dondur', text: 'Bu görev boyunca süren işlemez.' },
  { id: 104, title: 'Puan Çal',      text: 'Partnerinin toplam puanından 5 puan çalarsın.' },
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
