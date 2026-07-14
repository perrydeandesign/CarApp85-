import type { CarRow, ModRow } from '../hooks/useProfileData';

// Demo garage for the signed-out "me" profile so the Garage tab + Build Card
// have real content to show in the demo (there are no live Supabase cars yet).
// Mirrors jake_sti's WRX STI build from the demo data set.

export const DEMO_ME_CARS: CarRow[] = [
  {
    id: 'demo-car-wrx-sti',
    make: 'Subaru',
    model: 'WRX STI',
    year: 2019,
    build_type: 'Track',
    primary_image_url:
      'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=800&h=600&fit=crop',
    build_video_url: null,
  },
];

export const DEMO_ME_MODS: ModRow[] = [
  { id: 'dm-e1', category: 'engine', name: 'HKS GT2 Turbo', notes: null },
  { id: 'dm-e2', category: 'engine', name: 'Walbro 460 Fuel Pump', notes: null },
  { id: 'dm-e3', category: 'engine', name: 'ID1050x Injectors', notes: null },
  { id: 'dm-e4', category: 'engine', name: 'Tomei 88mm Cams', notes: null },
  { id: 'dm-w1', category: 'wheels', name: 'Volk TE37 18x9.5', notes: null },
  { id: 'dm-w2', category: 'wheels', name: 'Endless MX72 Pads', notes: null },
  { id: 'dm-w3', category: 'wheels', name: 'Brembo 4-pot BBK', notes: null },
  { id: 'dm-i1', category: 'interior', name: 'Bride Zeta IV Seat', notes: null },
  { id: 'dm-i2', category: 'interior', name: 'Sparco 6-Point Harness', notes: null },
  { id: 'dm-i3', category: 'interior', name: 'Defi Advance ZD Gauges', notes: null },
  { id: 'dm-x1', category: 'exterior', name: 'Voltex Type-7 Wing', notes: null },
  { id: 'dm-x2', category: 'exterior', name: 'Varis Front Lip', notes: null },
  { id: 'dm-x3', category: 'exterior', name: 'Seibon Carbon Hood', notes: null },
];
