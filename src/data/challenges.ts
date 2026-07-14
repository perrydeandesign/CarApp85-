import type { Challenge } from '../constants/types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch1', title: 'Best Night Shot', desc: 'Show off your ride under the lights. City streets, parking garages, neon — anything goes.', icon: 'moon-outline', active: true, endDate: '3 days left',
    entries: [
      { id: 'e1', user: 'SkylineKing', av: 'SK', img: 'https://images.unsplash.com/photo-1735025679706-0a26b3c3cce5?w=600&h=400&fit=crop', car: 'R34 GT-R', votes: 142 },
      { id: 'e2', user: 'DriftKing_AU', av: 'DK', img: 'https://images.unsplash.com/photo-1713816823204-593ce203ea43?w=600&h=400&fit=crop', car: 'RX-7 FD', votes: 98 },
      { id: 'e3', user: 'BoostQueen', av: 'BQ', img: 'https://images.unsplash.com/photo-1716702131412-eeb1bc8a14c4?w=600&h=400&fit=crop', car: 'Golf GTI Mk8', votes: 76 },
      { id: 'e4', user: 'TurboMike', av: 'TM', img: 'https://images.unsplash.com/photo-1712148029794-51d08e250376?w=600&h=400&fit=crop', car: 'Supra MK4', votes: 61 },
    ],
  },
  {
    id: 'ch2', title: 'Engine Bay Flex', desc: 'Pop the hood and show what you\'re working with. Cleanest bay wins.', icon: 'build-outline', active: true, endDate: '5 days left',
    entries: [
      { id: 'e5', user: 'Jake_STI', av: 'JS', img: 'https://images.unsplash.com/photo-1527383418406-f85a3b146499?w=600&h=400&fit=crop', car: 'WRX STI', votes: 203 },
      { id: 'e6', user: 'EvoFanatic', av: 'EF', img: 'https://images.unsplash.com/photo-1593142927924-087946ba0a16?w=600&h=400&fit=crop', car: 'Evo IX', votes: 187 },
      { id: 'e7', user: 'TurboMike', av: 'TM', img: 'https://images.unsplash.com/photo-1622062934364-496d0b8b6959?w=600&h=400&fit=crop', car: 'Supra MK4', votes: 155 },
    ],
  },
  {
    id: 'ch3', title: 'Rolling Shot', desc: 'Capture your car in motion. Speed, blur, drama.', icon: 'car-sport-outline', active: false, endDate: 'Ended',
    entries: [
      { id: 'e8', user: 'DriftKing_AU', av: 'DK', img: 'https://images.unsplash.com/photo-1758728073289-8f5f76f82fe3?w=600&h=400&fit=crop', car: 'RX-7 FD', votes: 312 },
      { id: 'e9', user: 'SkylineKing', av: 'SK', img: 'https://images.unsplash.com/photo-1746981000074-f51024bc20df?w=600&h=400&fit=crop', car: 'R34 GT-R', votes: 289 },
      { id: 'e10', user: 'BoostQueen', av: 'BQ', img: 'https://images.unsplash.com/photo-1758621513727-8edbd2f02003?w=600&h=400&fit=crop', car: 'Golf GTI Mk8', votes: 201 },
    ],
  },
];
