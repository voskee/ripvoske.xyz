export type Track = {
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
};

export const PLAYLIST: Track[] = [
  {
    title: 'Last Call',
    artist: 'Kanye West',
    album: 'The College Dropout',
    src: 'https://archive.org/download/last-call_20261031/Last%20Call.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Kanyewest_collegedropout.jpg',
  },
  {
    title: '2SEATER',
    artist: 'Tyler, The Creator',
    album: 'Cherry Bomb',
    src: 'https://archive.org/download/last-call_20261031/2SEATER%20%28feat.%20Aaron%20Shaw%2C%20Samantha%20Nelson%20%26%20Austin%20Feinstein%29.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/2/26/Cherry_Bomb_Tyler_the_Creator.png',
  },
  {
    title: 'Nights',
    artist: 'Frank Ocean',
    album: 'Blonde',
    src: 'https://archive.org/download/last-call_20261031/Nights.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg',
  },
  {
    title: 'Answer',
    artist: 'Tyler, The Creator',
    album: 'Wolf',
    src: 'https://archive.org/download/tyler-the-creator-answer/Tyler%20The%20Creator%20-%20Answer.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Wolf_Cover2.jpg',
  },
  {
    title: '911 / Mr. Lonely',
    artist: 'Tyler, The Creator',
    album: 'Flower Boy',
    src: 'https://archive.org/download/last-call_20261031/911%20Mr.%20Lonely%20%28feat.%20Frank%20Ocean%20%26%20Steve%20Lacy%29.mp3',
    cover: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Tyler%2C_the_Creator_-_Flower_Boy.png',
  },
];
