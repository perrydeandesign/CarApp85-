type TimelineItem = {
  id: string;
  category?: string;
  title?: string;
  description?: string;
  image?: string;
  createdAt?: string;
  likes?: number;
  comments?: number;
};

type Car = {
  make: string;
  model: string;
  year: number;
  image?: string;
  mods?: string[];
};

export type User = {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  car: Car;
  photos: string[];
  videos: string[];
  timeline: TimelineItem[];
  followers: number;
  following: number;
};

export const DEMO_USERS: User[] = [
  {
    id: "8f3c1b4e-2d9a-4f8e-9c3a-1f2b7d9e4c11",
    username: "jake_sti",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "WRX owner. Track day addict. Melbourne based.",
    location: "Melbourne, AU",
    car: {
      make: "Subaru",
      model: "WRX STI",
      year: 2019,
      image: "https://loremflickr.com/800/600/Subaru%2CWRX,STI?lock=1",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Subaru%2CWRX,STI?lock=1",
      "https://loremflickr.com/800/600/Subaru%2CWRX,STI?lock=1"
    ],
    videos: [],
    timeline: [
      {
        id: "tl-1",
        category: "Modification",
        title: "Cobb Stage 2 Installed",
        description: "Huge power gains from 3500rpm. Night and day difference.",
        image: "",
        createdAt: "2026-06-10T10:00:00Z",
        likes: 34,
        comments: 1
      },
      {
        id: "tl-2",
        category: "Track Day",
        title: "Phillip Island Track Day",
        description: "Best lap 2:14. Car felt planted all session.",
        image: "",
        createdAt: "2026-06-03T10:00:00Z",
        likes: 87,
        comments: 3
      }
    ],
    followers: 97,
    following: 428
  },

  {
    id: "b1e4d8c2-9f3a-4b7e-8c1d-2f4a9e7b3c22",
    username: "mia_gti",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    bio: "Golf GTI Mk7.5 — clean builds only.",
    location: "Sydney, AU",
    car: {
      make: "Volkswagen",
      model: "Golf GTI",
      year: 2018,
      image: "https://loremflickr.com/800/600/Volkswagen%2CGolf,GTI?lock=2",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Volkswagen%2CGolf,GTI?lock=2",
      "https://loremflickr.com/800/600/Volkswagen%2CGolf,GTI?lock=2"
    ],
    videos: [],
    timeline: [
      {
        id: "tl-3",
        category: "Event",
        title: "Cars & Coffee",
        description: "Met some awesome VW owners today.",
        createdAt: "2026-05-20T10:00:00Z",
        likes: 22,
        comments: 4
      }
    ],
    followers: 210,
    following: 180
  },

  {
    id: "c9f1a3d4-7b8e-4c2a-9f1d-3e4b8c7a9d33",
    username: "tom_evo",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    bio: "Evo X MR — boost solves everything.",
    location: "Brisbane, AU",
    car: {
      make: "Mitsubishi",
      model: "Lancer Evolution X",
      year: 2015,
      image: "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,X?lock=3",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,X?lock=3",
      "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,X?lock=3"
    ],
    videos: [],
    timeline: [],
    followers: 540,
    following: 320
  },

  {
    id: "d4e7f9a1-3c2b-4f8e-9d1a-5b7c3e2f4a44",
    username: "lucas_m3",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    bio: "BMW M3 Competition — Euro power.",
    location: "London, UK",
    car: {
      make: "BMW",
      model: "M3 Competition",
      year: 2021,
      image: "https://loremflickr.com/800/600/BMW%2CM3,Competition?lock=4",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/BMW%2CM3,Competition?lock=4",
      "https://loremflickr.com/800/600/BMW%2CM3,Competition?lock=4"
    ],
    videos: [],
    timeline: [],
    followers: 1200,
    following: 800
  },

  {
    id: "e8b3c1d4-9f2a-4e7b-8c3d-1a4f7e9b5c55",
    username: "sarah_s15",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    bio: "Nissan Silvia S15 — drift life.",
    location: "Tokyo, JP",
    car: {
      make: "Nissan",
      model: "Silvia S15",
      year: 2001,
      image: "https://loremflickr.com/800/600/Nissan%2CSilvia,S15?lock=5",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Nissan%2CSilvia,S15?lock=5",
      "https://loremflickr.com/800/600/Nissan%2CSilvia,S15?lock=5"
    ],
    videos: [],
    timeline: [],
    followers: 980,
    following: 650
  },

  {
    id: "f1a9c3d4-7e8b-4c2a-9f1d-3e4b8c7a9d66",
    username: "harry_f150",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    bio: "Ford F-150 Raptor — Aussie off‑road adventures.",
    location: "Perth, AU",
    car: {
      make: "Ford",
      model: "F-150 Raptor",
      year: 2020,
      image: "https://loremflickr.com/800/600/Ford%2CF-150,Raptor?lock=6",
      mods: [
        "Banks Power Tune",
        "S&B Cold Air Intake",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112 Lift",
        "Eibach 2.5in Lift",
        "Husky X-Act Liners",
        "WeatherTech Floor Mats",
        "Katzkin Leather Seats",
        "Pioneer Head Unit",
        "Trail Armor Skid Plates",
        "Rigid Industries LED Bar",
        "ProClip Phone Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CF-150,Raptor?lock=6",
      "https://loremflickr.com/800/600/Ford%2CF-150,Raptor?lock=6"
    ],
    videos: [],
    timeline: [],
    followers: 430,
    following: 210
  },

  {
    id: "a7c3d1e4-9f2b-4e7a-8c3d-1a4f7e9b5c77",
    username: "marco_911",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    bio: "Porsche 911 Carrera S — precision engineering.",
    location: "Berlin, DE",
    car: {
      make: "Porsche",
      model: "911 Carrera S",
      year: 2022,
      image: "https://loremflickr.com/800/600/Porsche%2C911,Carrera,S?lock=7",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Porsche%2C911,Carrera,S?lock=7",
      "https://loremflickr.com/800/600/Porsche%2C911,Carrera,S?lock=7"
    ],
    videos: [],
    timeline: [],
    followers: 2100,
    following: 900
  },

  {
    id: "b4e7f9a1-3c2b-4f8e-9d1a-5b7c3e2f4a88",
    username: "zoe_miata",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    bio: "Miata is always the answer.",
    location: "California, USA",
    car: {
      make: "Mazda",
      model: "MX-5 Miata",
      year: 2016,
      image: "https://loremflickr.com/800/600/Mazda%2CMX-5,Miata?lock=8",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mazda%2CMX-5,Miata?lock=8",
      "https://loremflickr.com/800/600/Mazda%2CMX-5,Miata?lock=8"
    ],
    videos: [],
    timeline: [],
    followers: 760,
    following: 540
  },

  {
    id: "c1d4e7f9-3b2c-4f8e-9d1a-5b7c3e2f4a99",
    username: "alex_rs3",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    bio: "Audi RS3 — five‑cylinder symphony.",
    location: "Toronto, CA",
    car: {
      make: "Audi",
      model: "RS3",
      year: 2021,
      image: "https://loremflickr.com/800/600/Audi%2CRS3?lock=9",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Audi%2CRS3?lock=9",
      "https://loremflickr.com/800/600/Audi%2CRS3?lock=9"
    ],
    videos: [],
    timeline: [],
    followers: 1500,
    following: 700
  },

  {
    id: "d9e1f3a4-7b8c-4c2a-9f1d-3e4b8c7a9d11",
    username: "ben_camaro",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    bio: "Chevy Camaro SS — American muscle.",
    location: "Texas, USA",
    car: {
      make: "Chevrolet",
      model: "Camaro SS",
      year: 2019,
      image: "https://loremflickr.com/800/600/Chevrolet%2CCamaro,SS?lock=10",
      mods: [
        "Whipple Supercharger",
        "Ford Performance Cold Air Intake",
        "Borla ATAK Cat-Back",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R Drag Radials",
        "Steeda Camber Plates",
        "Brembo Big Brake Kit",
        "Recaro Sportster Seats",
        "Drake Quick-Release Harness",
        "BOSS 302 Steering Wheel",
        "B&M Hammer Shifter",
        "ROUSH Front Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Side Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,SS?lock=10",
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,SS?lock=10"
    ],
    videos: [],
    timeline: [],
    followers: 890,
    following: 420
  },

  {
    id: "f92c1d3e-4b7a-4c8e-9f1d-2a3b7c9e1a11",
    username: "kevin_r34",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    bio: "R34 GT‑R V‑Spec II. Midnight runs only.",
    location: "Osaka, JP",
    car: {
      make: "Nissan",
      model: "Skyline GT‑R R34",
      year: 2002,
      image: "https://loremflickr.com/800/600/Nissan%2CSkyline,GT%E2%80%91R,R34?lock=11",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Nissan%2CSkyline,GT%E2%80%91R,R34?lock=11",
      "https://loremflickr.com/800/600/Nissan%2CSkyline,GT%E2%80%91R,R34?lock=11"
    ],
    videos: [],
    timeline: [],
    followers: 2100,
    following: 980
  },

  {
    id: "a13d4e7f-8b2c-4f9e-9d1a-5c7e3b2f4a22",
    username: "emma_a45",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    bio: "AMG A45S — pocket rocket queen.",
    location: "Auckland, NZ",
    car: {
      make: "Mercedes‑AMG",
      model: "A45S",
      year: 2022,
      image: "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CA45S?lock=12",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CA45S?lock=12",
      "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CA45S?lock=12"
    ],
    videos: [],
    timeline: [],
    followers: 640,
    following: 310
  },

  {
    id: "b24e7f9a-3c2b-4f8e-9d1a-5b7c3e2f4a33",
    username: "ryan_mustang",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    bio: "Mustang GT 5.0 — V8 forever.",
    location: "Arizona, USA",
    car: {
      make: "Ford",
      model: "Mustang GT",
      year: 2020,
      image: "https://loremflickr.com/800/600/Ford%2CMustang,GT?lock=13",
      mods: [
        "Whipple Supercharger",
        "Ford Performance Cold Air Intake",
        "Borla ATAK Cat-Back",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R Drag Radials",
        "Steeda Camber Plates",
        "Brembo Big Brake Kit",
        "Recaro Sportster Seats",
        "Drake Quick-Release Harness",
        "BOSS 302 Steering Wheel",
        "B&M Hammer Shifter",
        "ROUSH Front Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Side Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CMustang,GT?lock=13",
      "https://loremflickr.com/800/600/Ford%2CMustang,GT?lock=13"
    ],
    videos: [],
    timeline: [],
    followers: 1200,
    following: 500
  },

  {
    id: "c35f8a1b-4d2c-4e9f-8d1a-6b7c3e2f4a44",
    username: "lily_yarisgr",
    avatar: "https://randomuser.me/api/portraits/women/14.jpg",
    bio: "GR Yaris — rally DNA.",
    location: "Canberra, AU",
    car: {
      make: "Toyota",
      model: "GR Yaris",
      year: 2021,
      image: "https://loremflickr.com/800/600/Toyota%2CGR,Yaris?lock=14",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CGR,Yaris?lock=14",
      "https://loremflickr.com/800/600/Toyota%2CGR,Yaris?lock=14"
    ],
    videos: [],
    timeline: [],
    followers: 430,
    following: 210
  },

  {
    id: "d46a9b2c-5e3d-4f8e-9d1a-7b8c3e2f4a55",
    username: "josh_charger",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    bio: "Dodge Charger Hellcat — loud and proud.",
    location: "Florida, USA",
    car: {
      make: "Dodge",
      model: "Charger Hellcat",
      year: 2019,
      image: "https://loremflickr.com/800/600/Dodge%2CCharger,Hellcat?lock=15",
      mods: [
        "Whipple Supercharger",
        "Ford Performance Cold Air Intake",
        "Borla ATAK Cat-Back",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R Drag Radials",
        "Steeda Camber Plates",
        "Brembo Big Brake Kit",
        "Recaro Sportster Seats",
        "Drake Quick-Release Harness",
        "BOSS 302 Steering Wheel",
        "B&M Hammer Shifter",
        "ROUSH Front Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Side Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Dodge%2CCharger,Hellcat?lock=15",
      "https://loremflickr.com/800/600/Dodge%2CCharger,Hellcat?lock=15"
    ],
    videos: [],
    timeline: [],
    followers: 980,
    following: 420
  },

  {
    id: "e57b1c3d-6f4e-4f8e-9d1a-8b9c3e2f4a66",
    username: "noah_supra",
    avatar: "https://randomuser.me/api/portraits/men/16.jpg",
    bio: "A90 Supra — modern JDM icon.",
    location: "Gold Coast, AU",
    car: {
      make: "Toyota",
      model: "GR Supra",
      year: 2020,
      image: "https://loremflickr.com/800/600/Toyota%2CGR,Supra?lock=16",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CGR,Supra?lock=16",
      "https://loremflickr.com/800/600/Toyota%2CGR,Supra?lock=16"
    ],
    videos: [],
    timeline: [],
    followers: 1500,
    following: 700
  },

  {
    id: "f68c2d4e-7a5f-4f8e-9d1a-9b0c3e2f4a77",
    username: "chloe_mini",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    bio: "Mini Cooper JCW — small but spicy.",
    location: "Manchester, UK",
    car: {
      make: "Mini",
      model: "Cooper JCW",
      year: 2018,
      image: "https://loremflickr.com/800/600/Mini%2CCooper,JCW?lock=17",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back Exhaust",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Lowering Springs",
        "Brembo Pads",
        "Sparco R333 Seats",
        "Schroth 4-Point Harness",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Side Skirts",
        "Maxton Rear Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mini%2CCooper,JCW?lock=17",
      "https://loremflickr.com/800/600/Mini%2CCooper,JCW?lock=17"
    ],
    videos: [],
    timeline: [],
    followers: 720,
    following: 330
  },

  {
    id: "a79d3e5f-8b6a-4f8e-9d1a-0b1c3e2f4a88",
    username: "ethan_ranger",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    bio: "Ford Ranger Wildtrak — Aussie touring.",
    location: "Darwin, AU",
    car: {
      make: "Ford",
      model: "Ranger Wildtrak",
      year: 2021,
      image: "https://loremflickr.com/800/600/Ford%2CRanger,Wildtrak?lock=18",
      mods: [
        "Banks Power Tune",
        "S&B Cold Air Intake",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112 Lift",
        "Eibach 2.5in Lift",
        "Husky X-Act Liners",
        "WeatherTech Floor Mats",
        "Katzkin Leather Seats",
        "Pioneer Head Unit",
        "Trail Armor Skid Plates",
        "Rigid Industries LED Bar",
        "ProClip Phone Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CRanger,Wildtrak?lock=18",
      "https://loremflickr.com/800/600/Ford%2CRanger,Wildtrak?lock=18"
    ],
    videos: [],
    timeline: [],
    followers: 540,
    following: 260
  },

  {
    id: "b8ae4f6a-9c7b-4f8e-9d1a-1b2c3e2f4a99",
    username: "sophia_rs6",
    avatar: "https://randomuser.me/api/portraits/women/19.jpg",
    bio: "Audi RS6 Avant — family wagon with supercar power.",
    location: "Zurich, CH",
    car: {
      make: "Audi",
      model: "RS6 Avant",
      year: 2022,
      image: "https://loremflickr.com/800/600/Audi%2CRS6,Avant?lock=19",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Audi%2CRS6,Avant?lock=19",
      "https://loremflickr.com/800/600/Audi%2CRS6,Avant?lock=19"
    ],
    videos: [],
    timeline: [],
    followers: 2100,
    following: 900
  },

  {
    id: "c9bf5a7c-0d8e-4f8e-9d1a-2b3c3e2f4a10",
    username: "jack_hilux",
    avatar: "https://randomuser.me/api/portraits/men/20.jpg",
    bio: "Toyota Hilux — built for the bush.",
    location: "Adelaide, AU",
    car: {
      make: "Toyota",
      model: "Hilux SR5",
      year: 2019,
      image: "https://loremflickr.com/800/600/Toyota%2CHilux,SR5?lock=20",
      mods: [
        "Banks Power Tune",
        "S&B Cold Air Intake",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112 Lift",
        "Eibach 2.5in Lift",
        "Husky X-Act Liners",
        "WeatherTech Floor Mats",
        "Katzkin Leather Seats",
        "Pioneer Head Unit",
        "Trail Armor Skid Plates",
        "Rigid Industries LED Bar",
        "ProClip Phone Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CHilux,SR5?lock=20",
      "https://loremflickr.com/800/600/Toyota%2CHilux,SR5?lock=20"
    ],
    videos: [],
    timeline: [],
    followers: 430,
    following: 210
  },

    {
    id: "d1f3a7c9-2b4e-4f8e-9d1a-3c5b7e2f4a21",
    username: "oliver_m2",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    bio: "BMW M2 Competition — the perfect driver's car.",
    location: "Munich, DE",
    car: {
      make: "BMW",
      model: "M2 Competition",
      year: 2020,
      image: "https://loremflickr.com/800/600/BMW%2CM2,Competition?lock=21",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/BMW%2CM2,Competition?lock=21",
      "https://loremflickr.com/800/600/BMW%2CM2,Competition?lock=21"
    ],
    videos: [],
    timeline: [],
    followers: 1800,
    following: 900
  },

  {
    id: "e2a4b8c1-3d5f-4f8e-9d1a-4b6c7e2f4a22",
    username: "ruby_s2000",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    bio: "Honda S2000 AP2 — VTEC happiness.",
    location: "Melbourne, AU",
    car: {
      make: "Honda",
      model: "S2000",
      year: 2006,
      image: "https://loremflickr.com/800/600/Honda%2CS2000?lock=22",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Honda%2CS2000?lock=22",
      "https://loremflickr.com/800/600/Honda%2CS2000?lock=22"
    ],
    videos: [],
    timeline: [],
    followers: 760,
    following: 420
  },

  {
    id: "f3b5c9d2-4e6a-4f8e-9d1a-5c7d8e2f4a23",
    username: "daniel_c63",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    bio: "AMG C63 — V8 thunder.",
    location: "London, UK",
    car: {
      make: "Mercedes‑AMG",
      model: "C63",
      year: 2019,
      image: "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CC63?lock=23",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CC63?lock=23",
      "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CC63?lock=23"
    ],
    videos: [],
    timeline: [],
    followers: 2100,
    following: 1100
  },

  {
    id: "a4c6d1e3-5f7b-4f8e-9d1a-6d8e9f2f4a24",
    username: "toby_86",
    avatar: "https://randomuser.me/api/portraits/men/24.jpg",
    bio: "Toyota 86 — slow car fast.",
    location: "Sydney, AU",
    car: {
      make: "Toyota",
      model: "86 GTS",
      year: 2017,
      image: "https://loremflickr.com/800/600/Toyota%2C86,GTS?lock=24",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2C86,GTS?lock=24",
      "https://loremflickr.com/800/600/Toyota%2C86,GTS?lock=24"
    ],
    videos: [],
    timeline: [],
    followers: 540,
    following: 310
  },

  {
    id: "b5d7e2f4-6a8c-4f8e-9d1a-7e9f1a2f4a25",
    username: "max_rsx",
    avatar: "https://randomuser.me/api/portraits/men/25.jpg",
    bio: "Acura RSX Type‑S — clean JDM build.",
    location: "Seattle, USA",
    car: {
      make: "Acura",
      model: "RSX Type‑S",
      year: 2005,
      image: "https://loremflickr.com/800/600/Acura%2CRSX,Type%E2%80%91S?lock=25",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Acura%2CRSX,Type%E2%80%91S?lock=25",
      "https://loremflickr.com/800/600/Acura%2CRSX,Type%E2%80%91S?lock=25"
    ],
    videos: [],
    timeline: [],
    followers: 680,
    following: 290
  },

  {
    id: "c6e8f3a5-7b9d-4f8e-9d1a-8f0a2b3f4a26",
    username: "ella_gtr",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    bio: "R35 GT‑R — Godzilla unleashed.",
    location: "Tokyo, JP",
    car: {
      make: "Nissan",
      model: "GT‑R R35",
      year: 2018,
      image: "https://loremflickr.com/800/600/Nissan%2CGT%E2%80%91R,R35?lock=26",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Nissan%2CGT%E2%80%91R,R35?lock=26",
      "https://loremflickr.com/800/600/Nissan%2CGT%E2%80%91R,R35?lock=26"
    ],
    videos: [],
    timeline: [],
    followers: 3200,
    following: 1500
  },

  {
    id: "d7f9a4b6-8c0e-4f8e-9d1a-9a1b3c4f4a27",
    username: "sam_fiesta",
    avatar: "https://randomuser.me/api/portraits/men/27.jpg",
    bio: "Fiesta ST — hot hatch hero.",
    location: "Bristol, UK",
    car: {
      make: "Ford",
      model: "Fiesta ST",
      year: 2016,
      image: "https://loremflickr.com/800/600/Ford%2CFiesta,ST?lock=27",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back Exhaust",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Lowering Springs",
        "Brembo Pads",
        "Sparco R333 Seats",
        "Schroth 4-Point Harness",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Side Skirts",
        "Maxton Rear Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CFiesta,ST?lock=27",
      "https://loremflickr.com/800/600/Ford%2CFiesta,ST?lock=27"
    ],
    videos: [],
    timeline: [],
    followers: 410,
    following: 220
  },

  {
    id: "e8a0b5c7-9d1f-4f8e-9d1a-0b2c4d5f4a28",
    username: "ivy_civic",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    bio: "Civic Type R FK8 — track weapon.",
    location: "Perth, AU",
    car: {
      make: "Honda",
      model: "Civic Type R",
      year: 2020,
      image: "https://loremflickr.com/800/600/Honda%2CCivic,Type,R?lock=28",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Honda%2CCivic,Type,R?lock=28",
      "https://loremflickr.com/800/600/Honda%2CCivic,Type,R?lock=28"
    ],
    videos: [],
    timeline: [],
    followers: 980,
    following: 510
  },

  {
    id: "f9b1c6d8-0e2a-4f8e-9d1a-1c3d5e6f4a29",
    username: "leo_challenger",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
    bio: "Dodge Challenger Scat Pack — American muscle.",
    location: "Nevada, USA",
    car: {
      make: "Dodge",
      model: "Challenger Scat Pack",
      year: 2019,
      image: "https://loremflickr.com/800/600/Dodge%2CChallenger,Scat,Pack?lock=29",
      mods: [
        "Whipple Supercharger",
        "Ford Performance Cold Air Intake",
        "Borla ATAK Cat-Back",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R Drag Radials",
        "Steeda Camber Plates",
        "Brembo Big Brake Kit",
        "Recaro Sportster Seats",
        "Drake Quick-Release Harness",
        "BOSS 302 Steering Wheel",
        "B&M Hammer Shifter",
        "ROUSH Front Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Side Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Dodge%2CChallenger,Scat,Pack?lock=29",
      "https://loremflickr.com/800/600/Dodge%2CChallenger,Scat,Pack?lock=29"
    ],
    videos: [],
    timeline: [],
    followers: 720,
    following: 330
  },

  {
    id: "a0c2d7e9-1f3b-4f8e-9d1a-2d4e6f7a4a30",
    username: "mia_golfr",
    avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    bio: "Golf R Mk7 — AWD sleeper.",
    location: "Toronto, CA",
    car: {
      make: "Volkswagen",
      model: "Golf R",
      year: 2017,
      image: "https://loremflickr.com/800/600/Volkswagen%2CGolf,R?lock=30",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Volkswagen%2CGolf,R?lock=30",
      "https://loremflickr.com/800/600/Volkswagen%2CGolf,R?lock=30"
    ],
    videos: [],
    timeline: [],
    followers: 1500,
    following: 800
  },
  {
    id: "b1c3d5e7-2f4a-4f8e-9d1a-3e5f7a9c4b31",
    username: "hannah_mx5",
    avatar: "https://randomuser.me/api/portraits/women/31.jpg",
    bio: "ND MX‑5 — lightweight fun.",
    location: "Brisbane, AU",
    car: {
      make: "Mazda",
      model: "MX‑5 ND",
      year: 2019,
      image: "https://loremflickr.com/800/600/Mazda%2CMX%E2%80%915,ND?lock=31",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mazda%2CMX%E2%80%915,ND?lock=31",
      "https://loremflickr.com/800/600/Mazda%2CMX%E2%80%915,ND?lock=31"
    ],
    videos: [],
    timeline: [],
    followers: 540,
    following: 310
  },

  {
    id: "c2d4e6f8-3a5b-4f8e-9d1a-4f6a8b9c4b32",
    username: "marcus_f80",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "BMW M3 F80 — twin‑turbo power.",
    location: "New York, USA",
    car: {
      make: "BMW",
      model: "M3 F80",
      year: 2018,
      image: "https://loremflickr.com/800/600/BMW%2CM3,F80?lock=32",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/BMW%2CM3,F80?lock=32",
      "https://loremflickr.com/800/600/BMW%2CM3,F80?lock=32"
    ],
    videos: [],
    timeline: [],
    followers: 2100,
    following: 1200
  },

  {
    id: "d3e5f7a9-4b6c-4f8e-9d1a-5a7b9c0d4b33",
    username: "zoe_stinger",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    bio: "Kia Stinger GT — underrated beast.",
    location: "Perth, AU",
    car: {
      make: "Kia",
      model: "Stinger GT",
      year: 2020,
      image: "https://loremflickr.com/800/600/Kia%2CStinger,GT?lock=33",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Kia%2CStinger,GT?lock=33",
      "https://loremflickr.com/800/600/Kia%2CStinger,GT?lock=33"
    ],
    videos: [],
    timeline: [],
    followers: 680,
    following: 340
  },

  {
    id: "e4f6a8b0-5c7d-4f8e-9d1a-6b8c0d1e4b34",
    username: "liam_ranger",
    avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    bio: "Ranger Raptor — Aussie off‑road king.",
    location: "Darwin, AU",
    car: {
      make: "Ford",
      model: "Ranger Raptor",
      year: 2021,
      image: "https://loremflickr.com/800/600/Ford%2CRanger,Raptor?lock=34",
      mods: [
        "Banks Power Tune",
        "S&B Cold Air Intake",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112 Lift",
        "Eibach 2.5in Lift",
        "Husky X-Act Liners",
        "WeatherTech Floor Mats",
        "Katzkin Leather Seats",
        "Pioneer Head Unit",
        "Trail Armor Skid Plates",
        "Rigid Industries LED Bar",
        "ProClip Phone Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CRanger,Raptor?lock=34",
      "https://loremflickr.com/800/600/Ford%2CRanger,Raptor?lock=34"
    ],
    videos: [],
    timeline: [],
    followers: 430,
    following: 210
  },

  {
    id: "f5a7c9d1-6d8e-4f8e-9d1a-7c9d1e2f4b35",
    username: "nina_370z",
    avatar: "https://randomuser.me/api/portraits/women/35.jpg",
    bio: "Nissan 370Z — NA V6 goodness.",
    location: "Los Angeles, USA",
    car: {
      make: "Nissan",
      model: "370Z",
      year: 2016,
      image: "https://loremflickr.com/800/600/Nissan%2C370Z?lock=35",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Nissan%2C370Z?lock=35",
      "https://loremflickr.com/800/600/Nissan%2C370Z?lock=35"
    ],
    videos: [],
    timeline: [],
    followers: 980,
    following: 510
  },

  {
    id: "a6b8d0e2-7e9f-4f8e-9d1a-8d0e2f3a4b36",
    username: "owen_rs5",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    bio: "Audi RS5 — luxury meets performance.",
    location: "London, UK",
    car: {
      make: "Audi",
      model: "RS5",
      year: 2020,
      image: "https://loremflickr.com/800/600/Audi%2CRS5?lock=36",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Audi%2CRS5?lock=36",
      "https://loremflickr.com/800/600/Audi%2CRS5?lock=36"
    ],
    videos: [],
    timeline: [],
    followers: 1500,
    following: 800
  },

  {
    id: "b7c9e1f3-8f0a-4f8e-9d1a-9e1f3a4b4b37",
    username: "ava_wrx",
    avatar: "https://randomuser.me/api/portraits/women/37.jpg",
    bio: "Subaru WRX — boost and burble.",
    location: "Hobart, AU",
    car: {
      make: "Subaru",
      model: "WRX",
      year: 2017,
      image: "https://loremflickr.com/800/600/Subaru%2CWRX?lock=37",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Subaru%2CWRX?lock=37",
      "https://loremflickr.com/800/600/Subaru%2CWRX?lock=37"
    ],
    videos: [],
    timeline: [],
    followers: 540,
    following: 310
  },

  {
    id: "c8d0f2a4-9a1b-4f8e-9d1a-0f2a4b5c4b38",
    username: "ethan_mach1",
    avatar: "https://randomuser.me/api/portraits/men/38.jpg",
    bio: "Mustang Mach 1 — modern muscle.",
    location: "Texas, USA",
    car: {
      make: "Ford",
      model: "Mustang Mach 1",
      year: 2021,
      image: "https://loremflickr.com/800/600/Ford%2CMustang,Mach,1?lock=38",
      mods: [
        "Whipple Supercharger",
        "Ford Performance Cold Air Intake",
        "Borla ATAK Cat-Back",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R Drag Radials",
        "Steeda Camber Plates",
        "Brembo Big Brake Kit",
        "Recaro Sportster Seats",
        "Drake Quick-Release Harness",
        "BOSS 302 Steering Wheel",
        "B&M Hammer Shifter",
        "ROUSH Front Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Side Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CMustang,Mach,1?lock=38",
      "https://loremflickr.com/800/600/Ford%2CMustang,Mach,1?lock=38"
    ],
    videos: [],
    timeline: [],
    followers: 890,
    following: 420
  },

  {
    id: "d9e1f3b5-0b2c-4f8e-9d1a-1b3c5d6e4b39",
    username: "sara_giulia",
    avatar: "https://randomuser.me/api/portraits/women/39.jpg",
    bio: "Alfa Romeo Giulia QV — Italian passion.",
    location: "Rome, IT",
    car: {
      make: "Alfa Romeo",
      model: "Giulia Quadrifoglio",
      year: 2019,
      image: "https://loremflickr.com/800/600/Alfa,Romeo%2CGiulia,Quadrifoglio?lock=39",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Alfa,Romeo%2CGiulia,Quadrifoglio?lock=39",
      "https://loremflickr.com/800/600/Alfa,Romeo%2CGiulia,Quadrifoglio?lock=39"
    ],
    videos: [],
    timeline: [],
    followers: 640,
    following: 310
  },

  {
    id: "f1a3c5e7-2b4d-4f8e-9d1a-3e5f7a9c4b41",
    username: "chase_rsx",
    avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    bio: "RSX Type‑S — clean street build.",
    location: "San Diego, USA",
    car: {
      make: "Acura",
      model: "RSX Type‑S",
      year: 2004,
      image: "https://loremflickr.com/800/600/Acura%2CRSX,Type%E2%80%91S?lock=40",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Acura%2CRSX,Type%E2%80%91S?lock=40",
      "https://loremflickr.com/800/600/Acura%2CRSX,Type%E2%80%91S?lock=40"
    ],
    videos: [],
    timeline: [],
    followers: 640,
    following: 310
  },

  {
    id: "a2b4d6f8-3c5e-4f8e-9d1a-4f6a8b9c4b42",
    username: "bella_500",
    avatar: "https://randomuser.me/api/portraits/women/41.jpg",
    bio: "Fiat 500 Abarth — tiny but angry.",
    location: "Rome, IT",
    car: {
      make: "Fiat",
      model: "500 Abarth",
      year: 2017,
      image: "https://loremflickr.com/800/600/Fiat%2C500,Abarth?lock=41",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back Exhaust",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Lowering Springs",
        "Brembo Pads",
        "Sparco R333 Seats",
        "Schroth 4-Point Harness",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Side Skirts",
        "Maxton Rear Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Fiat%2C500,Abarth?lock=41",
      "https://loremflickr.com/800/600/Fiat%2C500,Abarth?lock=41"
    ],
    videos: [],
    timeline: [],
    followers: 420,
    following: 210
  },

  {
    id: "b3c5e7f9-4d6f-4f8e-9d1a-5a7b9c0d4b43",
    username: "tyler_frs",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    bio: "Scion FR‑S — drift missile in progress.",
    location: "Portland, USA",
    car: {
      make: "Scion",
      model: "FR‑S",
      year: 2015,
      image: "https://loremflickr.com/800/600/Scion%2CFR%E2%80%91S?lock=42",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back Exhaust",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Lowering Springs",
        "Brembo Pads",
        "Sparco R333 Seats",
        "Schroth 4-Point Harness",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Side Skirts",
        "Maxton Rear Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Scion%2CFR%E2%80%91S?lock=42",
      "https://loremflickr.com/800/600/Scion%2CFR%E2%80%91S?lock=42"
    ],
    videos: [],
    timeline: [],
    followers: 780,
    following: 390
  },

  {
    id: "c4d6f8a0-5e7a-4f8e-9d1a-6b8c0d1e4b44",
    username: "mia_c63s",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    bio: "AMG C63S — V8 monster.",
    location: "Sydney, AU",
    car: {
      make: "Mercedes‑AMG",
      model: "C63S",
      year: 2020,
      image: "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CC63S?lock=43",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CC63S?lock=43",
      "https://loremflickr.com/800/600/Mercedes%E2%80%91AMG%2CC63S?lock=43"
    ],
    videos: [],
    timeline: [],
    followers: 2100,
    following: 1100
  },

  {
    id: "d5e7f9a1-6f8b-4f8e-9d1a-7c9d1e2f4b45",
    username: "jason_rangerxlt",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    bio: "Ford Ranger XLT — touring setup.",
    location: "Cairns, AU",
    car: {
      make: "Ford",
      model: "Ranger XLT",
      year: 2018,
      image: "https://loremflickr.com/800/600/Ford%2CRanger,XLT?lock=44",
      mods: [
        "Banks Power Tune",
        "S&B Cold Air Intake",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112 Lift",
        "Eibach 2.5in Lift",
        "Husky X-Act Liners",
        "WeatherTech Floor Mats",
        "Katzkin Leather Seats",
        "Pioneer Head Unit",
        "Trail Armor Skid Plates",
        "Rigid Industries LED Bar",
        "ProClip Phone Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CRanger,XLT?lock=44",
      "https://loremflickr.com/800/600/Ford%2CRanger,XLT?lock=44"
    ],
    videos: [],
    timeline: [],
    followers: 430,
    following: 210
  },

  {
    id: "e6f8a0b2-7a9c-4f8e-9d1a-8d0e2f3a4b46",
    username: "sienna_mini",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    bio: "Mini Cooper S — stylish and quick.",
    location: "London, UK",
    car: {
      make: "Mini",
      model: "Cooper S",
      year: 2019,
      image: "https://loremflickr.com/800/600/Mini%2CCooper,S?lock=45",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back Exhaust",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Lowering Springs",
        "Brembo Pads",
        "Sparco R333 Seats",
        "Schroth 4-Point Harness",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Side Skirts",
        "Maxton Rear Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mini%2CCooper,S?lock=45",
      "https://loremflickr.com/800/600/Mini%2CCooper,S?lock=45"
    ],
    videos: [],
    timeline: [],
    followers: 720,
    following: 330
  },

  {
    id: "f7a9c1d3-8b0d-4f8e-9d1a-9e1f3a4b4b47",
    username: "logan_supra",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    bio: "A80 Supra — 2JZ forever.",
    location: "Tokyo, JP",
    car: {
      make: "Toyota",
      model: "Supra MK4",
      year: 1998,
      image: "https://loremflickr.com/800/600/Toyota%2CSupra,MK4?lock=46",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CSupra,MK4?lock=46",
      "https://loremflickr.com/800/600/Toyota%2CSupra,MK4?lock=46"
    ],
    videos: [],
    timeline: [],
    followers: 3200,
    following: 1500
  },

  {
    id: "a8c0d2e4-9c1e-4f8e-9d1a-0f2a4b5c4b48",
    username: "ruby_gti",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    bio: "Golf GTI Mk8 — modern hot hatch.",
    location: "Melbourne, AU",
    car: {
      make: "Volkswagen",
      model: "Golf GTI",
      year: 2022,
      image: "https://loremflickr.com/800/600/Volkswagen%2CGolf,GTI?lock=47",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Carbon Spoiler",
        "M Performance Front Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Volkswagen%2CGolf,GTI?lock=47",
      "https://loremflickr.com/800/600/Volkswagen%2CGolf,GTI?lock=47"
    ],
    videos: [],
    timeline: [],
    followers: 540,
    following: 310
  },

  {
    id: "b9d1e3f5-0d2f-4f8e-9d1a-1b3c5d6e4b49",
    username: "ethan_camaro",
    avatar: "https://randomuser.me/api/portraits/men/48.jpg",
    bio: "Camaro ZL1 — supercharged insanity.",
    location: "Texas, USA",
    car: {
      make: "Chevrolet",
      model: "Camaro ZL1",
      year: 2020,
      image: "https://loremflickr.com/800/600/Chevrolet%2CCamaro,ZL1?lock=48",
      mods: [
        "Whipple Supercharger",
        "Ford Performance Cold Air Intake",
        "Borla ATAK Cat-Back",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R Drag Radials",
        "Steeda Camber Plates",
        "Brembo Big Brake Kit",
        "Recaro Sportster Seats",
        "Drake Quick-Release Harness",
        "BOSS 302 Steering Wheel",
        "B&M Hammer Shifter",
        "ROUSH Front Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Side Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,ZL1?lock=48",
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,ZL1?lock=48"
    ],
    videos: [],
    timeline: [],
    followers: 890,
    following: 420
  },

  {
    id: "c0e2f4a6-1e3f-4f8e-9d1a-2c4d6e7f4b50",
    username: "zoe_levorg",
    avatar: "https://randomuser.me/api/portraits/women/49.jpg",
    bio: "Subaru Levorg — wagon life.",
    location: "Wellington, NZ",
    car: {
      make: "Subaru",
      model: "Levorg",
      year: 2018,
      image: "https://loremflickr.com/800/600/Subaru%2CLevorg?lock=49",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Subaru%2CLevorg?lock=49",
      "https://loremflickr.com/800/600/Subaru%2CLevorg?lock=49"
    ],
    videos: [],
    timeline: [],
    followers: 430,
    following: 210
  },
  {
    id: "8565bffd-dd36-4cf9-a96b-cf5f71d3795f",
    username: "mason_brz",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
    bio: "Toyota GR86 owner. Build life.",
    location: "Track Day Brisbane",
    car: {
      make: "Toyota",
      model: "GR86",
      year: 2023,
      image: "https://loremflickr.com/800/600/Toyota%2CGR86?lock=50",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CGR86?lock=50",
      "https://loremflickr.com/800/600/Toyota%2CGR86?lock=50"
    ],
    videos: [],
    timeline: [],
    followers: 843,
    following: 331
  },
  {
    id: "0a773f10-194f-4dd5-ab18-04491e9c78f9",
    username: "riley_genesis",
    avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    bio: "Genesis G70 owner. Build life.",
    location: "Sydney, AU",
    car: {
      make: "Genesis",
      model: "G70",
      year: 2021,
      image: "https://loremflickr.com/800/600/Genesis%2CG70?lock=51",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Genesis%2CG70?lock=51",
      "https://loremflickr.com/800/600/Genesis%2CG70?lock=51"
    ],
    videos: [],
    timeline: [],
    followers: 961,
    following: 585
  },
  {
    id: "5aa7559d-f175-4ce2-8c84-6391bcb7a880",
    username: "jordan_civic",
    avatar: "https://randomuser.me/api/portraits/women/53.jpg",
    bio: "Honda Civic Type R FK8 owner. Build life.",
    location: "Melbourne, AU",
    car: {
      make: "Honda",
      model: "Civic Type R FK8",
      year: 2019,
      image: "https://loremflickr.com/800/600/Honda%2CCivic,Type,R,FK8?lock=52",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Honda%2CCivic,Type,R,FK8?lock=52",
      "https://loremflickr.com/800/600/Honda%2CCivic,Type,R,FK8?lock=52"
    ],
    videos: [],
    timeline: [],
    followers: 281,
    following: 265
  },
  {
    id: "66a00e07-8b1c-4696-8e2c-5e6456137e51",
    username: "taylor_integra",
    avatar: "https://randomuser.me/api/portraits/women/54.jpg",
    bio: "Honda Integra Type R DC2 owner. Build life.",
    location: "Auckland, NZ",
    car: {
      make: "Honda",
      model: "Integra Type R DC2",
      year: 1998,
      image: "https://loremflickr.com/800/600/Honda%2CIntegra,Type,R,DC2?lock=53",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Honda%2CIntegra,Type,R,DC2?lock=53",
      "https://loremflickr.com/800/600/Honda%2CIntegra,Type,R,DC2?lock=53"
    ],
    videos: [],
    timeline: [],
    followers: 781,
    following: 142
  },
  {
    id: "10f5328e-efb7-4391-a1c1-faa2ca6db3d0",
    username: "casey_nsx",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    bio: "Honda NSX owner. Build life.",
    location: "Tokyo, JP",
    car: {
      make: "Honda",
      model: "NSX",
      year: 1991,
      image: "https://loremflickr.com/800/600/Honda%2CNSX?lock=54",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Honda%2CNSX?lock=54",
      "https://loremflickr.com/800/600/Honda%2CNSX?lock=54"
    ],
    videos: [],
    timeline: [],
    followers: 1598,
    following: 219
  },
  {
    id: "b0bc3c36-95ab-4508-aaf5-bd2052cca70b",
    username: "dylan_lancer",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    bio: "Mitsubishi Lancer Evolution IX owner. Build life.",
    location: "Brisbane, AU",
    car: {
      make: "Mitsubishi",
      model: "Lancer Evolution IX",
      year: 2007,
      image: "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,IX?lock=55",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,IX?lock=55",
      "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,IX?lock=55"
    ],
    videos: [],
    timeline: [],
    followers: 1018,
    following: 187
  },
  {
    id: "8290425e-f264-4aa3-ab83-083440d5ad32",
    username: "leah_celica",
    avatar: "https://randomuser.me/api/portraits/women/57.jpg",
    bio: "Toyota Celica GT-Four owner. Build life.",
    location: "Adelaide, AU",
    car: {
      make: "Toyota",
      model: "Celica GT-Four",
      year: 1996,
      image: "https://loremflickr.com/800/600/Toyota%2CCelica,GT-Four?lock=56",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CCelica,GT-Four?lock=56",
      "https://loremflickr.com/800/600/Toyota%2CCelica,GT-Four?lock=56"
    ],
    videos: [],
    timeline: [],
    followers: 1037,
    following: 688
  },
  {
    id: "7af4e856-a4a7-40a7-b44c-db8ae39d087d",
    username: "finn_rx8",
    avatar: "https://randomuser.me/api/portraits/men/58.jpg",
    bio: "Mazda RX-8 owner. Build life.",
    location: "Perth, AU",
    car: {
      make: "Mazda",
      model: "RX-8",
      year: 2008,
      image: "https://loremflickr.com/800/600/Mazda%2CRX-8?lock=57",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mazda%2CRX-8?lock=57",
      "https://loremflickr.com/800/600/Mazda%2CRX-8?lock=57"
    ],
    videos: [],
    timeline: [],
    followers: 745,
    following: 430
  },
  {
    id: "99799a18-b186-4fac-8f92-ec20b55e6a37",
    username: "zara_300zx",
    avatar: "https://randomuser.me/api/portraits/women/59.jpg",
    bio: "Nissan 300ZX Twin Turbo owner. Build life.",
    location: "Melbourne, AU",
    car: {
      make: "Nissan",
      model: "300ZX Twin Turbo",
      year: 1995,
      image: "https://loremflickr.com/800/600/Nissan%2C300ZX,Twin,Turbo?lock=58",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Nissan%2C300ZX,Twin,Turbo?lock=58",
      "https://loremflickr.com/800/600/Nissan%2C300ZX,Twin,Turbo?lock=58"
    ],
    videos: [],
    timeline: [],
    followers: 517,
    following: 334
  },
  {
    id: "3bea3a59-ab78-48dc-b308-75d00755c7d5",
    username: "nate_mr2",
    avatar: "https://randomuser.me/api/portraits/men/60.jpg",
    bio: "Toyota MR2 SW20 owner. Build life.",
    location: "Sydney, AU",
    car: {
      make: "Toyota",
      model: "MR2 SW20",
      year: 1994,
      image: "https://loremflickr.com/800/600/Toyota%2CMR2,SW20?lock=59",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CMR2,SW20?lock=59",
      "https://loremflickr.com/800/600/Toyota%2CMR2,SW20?lock=59"
    ],
    videos: [],
    timeline: [],
    followers: 733,
    following: 608
  },
  {
    id: "0061e5ef-4431-4e1d-b92e-f10ee2bc1a23",
    username: "aria_eg6",
    avatar: "https://randomuser.me/api/portraits/women/61.jpg",
    bio: "Honda Civic EG6 owner. Build life.",
    location: "Osaka, JP",
    car: {
      make: "Honda",
      model: "Civic EG6",
      year: 1993,
      image: "https://loremflickr.com/800/600/Honda%2CCivic,EG6?lock=60",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Honda%2CCivic,EG6?lock=60",
      "https://loremflickr.com/800/600/Honda%2CCivic,EG6?lock=60"
    ],
    videos: [],
    timeline: [],
    followers: 920,
    following: 502
  },
  {
    id: "d4a96a4d-27ec-42f7-810d-e84ccdff3412",
    username: "wes_lancer",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    bio: "Mitsubishi Lancer Evolution VI owner. Build life.",
    location: "Tokyo, JP",
    car: {
      make: "Mitsubishi",
      model: "Lancer Evolution VI",
      year: 2000,
      image: "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,VI?lock=61",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,VI?lock=61",
      "https://loremflickr.com/800/600/Mitsubishi%2CLancer,Evolution,VI?lock=61"
    ],
    videos: [],
    timeline: [],
    followers: 1500,
    following: 638
  },
  {
    id: "ad1a1d08-13f9-4625-9132-05fae58036b9",
    username: "paige_g35",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    bio: "Infiniti G35 Coupe owner. Build life.",
    location: "LA, US",
    car: {
      make: "Infiniti",
      model: "G35 Coupe",
      year: 2005,
      image: "https://loremflickr.com/800/600/Infiniti%2CG35,Coupe?lock=62",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Infiniti%2CG35,Coupe?lock=62",
      "https://loremflickr.com/800/600/Infiniti%2CG35,Coupe?lock=62"
    ],
    videos: [],
    timeline: [],
    followers: 470,
    following: 376
  },
  {
    id: "72b86e69-828e-49a4-ba77-b91ae4a6a858",
    username: "luca_350z",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
    bio: "Nissan 350Z Nismo owner. Build life.",
    location: "Milan, IT",
    car: {
      make: "Nissan",
      model: "350Z Nismo",
      year: 2008,
      image: "https://loremflickr.com/800/600/Nissan%2C350Z,Nismo?lock=63",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Nissan%2C350Z,Nismo?lock=63",
      "https://loremflickr.com/800/600/Nissan%2C350Z,Nismo?lock=63"
    ],
    videos: [],
    timeline: [],
    followers: 1021,
    following: 479
  },
  {
    id: "b7969bee-d646-4d2c-aaa2-ea77b7062363",
    username: "isla_macan",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    bio: "Porsche Macan GTS owner. Build life.",
    location: "Melbourne, AU",
    car: {
      make: "Porsche",
      model: "Macan GTS",
      year: 2022,
      image: "https://loremflickr.com/800/600/Porsche%2CMacan,GTS?lock=64",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Porsche%2CMacan,GTS?lock=64",
      "https://loremflickr.com/800/600/Porsche%2CMacan,GTS?lock=64"
    ],
    videos: [],
    timeline: [],
    followers: 1467,
    following: 299
  },
  {
    id: "c74e3f60-64bb-4bca-a7e0-1b7e341be74c",
    username: "aiden_rs7",
    avatar: "https://randomuser.me/api/portraits/men/66.jpg",
    bio: "Audi RS7 owner. Build life.",
    location: "London, UK",
    car: {
      make: "Audi",
      model: "RS7",
      year: 2021,
      image: "https://loremflickr.com/800/600/Audi%2CRS7?lock=65",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Audi%2CRS7?lock=65",
      "https://loremflickr.com/800/600/Audi%2CRS7?lock=65"
    ],
    videos: [],
    timeline: [],
    followers: 1452,
    following: 460
  },
  {
    id: "2df839b2-2337-4d04-a377-9a82a72bde2c",
    username: "mila_clio",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    bio: "Renault Clio RS Trophy owner. Build life.",
    location: "Paris, FR",
    car: {
      make: "Renault",
      model: "Clio RS Trophy",
      year: 2017,
      image: "https://loremflickr.com/800/600/Renault%2CClio,RS,Trophy?lock=66",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Renault%2CClio,RS,Trophy?lock=66",
      "https://loremflickr.com/800/600/Renault%2CClio,RS,Trophy?lock=66"
    ],
    videos: [],
    timeline: [],
    followers: 1024,
    following: 597
  },
  {
    id: "6cc310e2-0a1e-491a-8337-c18813295abf",
    username: "seb_megane",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    bio: "Renault Megane RS Trophy-R owner. Build life.",
    location: "Marseille, FR",
    car: {
      make: "Renault",
      model: "Megane RS Trophy-R",
      year: 2020,
      image: "https://loremflickr.com/800/600/Renault%2CMegane,RS,Trophy-R?lock=67",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Renault%2CMegane,RS,Trophy-R?lock=67",
      "https://loremflickr.com/800/600/Renault%2CMegane,RS,Trophy-R?lock=67"
    ],
    videos: [],
    timeline: [],
    followers: 531,
    following: 309
  },
  {
    id: "70ddc9c0-4439-4789-95c3-1072e5320e1a",
    username: "nora_c43",
    avatar: "https://randomuser.me/api/portraits/women/69.jpg",
    bio: "Mercedes-AMG C43 owner. Build life.",
    location: "Berlin, DE",
    car: {
      make: "Mercedes-AMG",
      model: "C43",
      year: 2020,
      image: "https://loremflickr.com/800/600/Mercedes-AMG%2CC43?lock=68",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mercedes-AMG%2CC43?lock=68",
      "https://loremflickr.com/800/600/Mercedes-AMG%2CC43?lock=68"
    ],
    videos: [],
    timeline: [],
    followers: 1661,
    following: 101
  },
  {
    id: "d4301500-b678-478b-8473-8000c018077d",
    username: "theo_a110",
    avatar: "https://randomuser.me/api/portraits/men/70.jpg",
    bio: "Alpine A110 S owner. Build life.",
    location: "Lyon, FR",
    car: {
      make: "Alpine",
      model: "A110 S",
      year: 2022,
      image: "https://loremflickr.com/800/600/Alpine%2CA110,S?lock=69",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Alpine%2CA110,S?lock=69",
      "https://loremflickr.com/800/600/Alpine%2CA110,S?lock=69"
    ],
    videos: [],
    timeline: [],
    followers: 1429,
    following: 542
  },
  {
    id: "916a7d57-bf57-40d0-8e5f-0e68de0f8457",
    username: "maya_polo",
    avatar: "https://randomuser.me/api/portraits/women/71.jpg",
    bio: "Volkswagen Polo GTI owner. Build life.",
    location: "Hamburg, DE",
    car: {
      make: "Volkswagen",
      model: "Polo GTI",
      year: 2018,
      image: "https://loremflickr.com/800/600/Volkswagen%2CPolo,GTI?lock=70",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Volkswagen%2CPolo,GTI?lock=70",
      "https://loremflickr.com/800/600/Volkswagen%2CPolo,GTI?lock=70"
    ],
    videos: [],
    timeline: [],
    followers: 904,
    following: 145
  },
  {
    id: "38097054-941b-41cf-ac07-239e37061a0a",
    username: "leon_passat",
    avatar: "https://randomuser.me/api/portraits/men/72.jpg",
    bio: "Volkswagen Passat R36 owner. Build life.",
    location: "Vienna, AT",
    car: {
      make: "Volkswagen",
      model: "Passat R36",
      year: 2010,
      image: "https://loremflickr.com/800/600/Volkswagen%2CPassat,R36?lock=71",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Volkswagen%2CPassat,R36?lock=71",
      "https://loremflickr.com/800/600/Volkswagen%2CPassat,R36?lock=71"
    ],
    videos: [],
    timeline: [],
    followers: 418,
    following: 573
  },
  {
    id: "ab3c20ff-d121-4fb5-8c7b-7355c2b8427f",
    username: "ines_giulia",
    avatar: "https://randomuser.me/api/portraits/women/73.jpg",
    bio: "Alfa Romeo Giulia Sprint owner. Build life.",
    location: "Rome, IT",
    car: {
      make: "Alfa Romeo",
      model: "Giulia Sprint",
      year: 2020,
      image: "https://loremflickr.com/800/600/Alfa,Romeo%2CGiulia,Sprint?lock=72",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Alfa,Romeo%2CGiulia,Sprint?lock=72",
      "https://loremflickr.com/800/600/Alfa,Romeo%2CGiulia,Sprint?lock=72"
    ],
    videos: [],
    timeline: [],
    followers: 875,
    following: 392
  },
  {
    id: "6a03ec45-e9c1-4bd8-bc95-7fe926242b65",
    username: "axel_quattroporte",
    avatar: "https://randomuser.me/api/portraits/men/74.jpg",
    bio: "Maserati Quattroporte GTS owner. Build life.",
    location: "Modena, IT",
    car: {
      make: "Maserati",
      model: "Quattroporte GTS",
      year: 2019,
      image: "https://loremflickr.com/800/600/Maserati%2CQuattroporte,GTS?lock=73",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Maserati%2CQuattroporte,GTS?lock=73",
      "https://loremflickr.com/800/600/Maserati%2CQuattroporte,GTS?lock=73"
    ],
    videos: [],
    timeline: [],
    followers: 930,
    following: 575
  },
  {
    id: "9e9f0074-b90a-4c1f-b740-3fa3871a3943",
    username: "fran_xkr",
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    bio: "Jaguar XKR-S owner. Build life.",
    location: "London, UK",
    car: {
      make: "Jaguar",
      model: "XKR-S",
      year: 2014,
      image: "https://loremflickr.com/800/600/Jaguar%2CXKR-S?lock=74",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Jaguar%2CXKR-S?lock=74",
      "https://loremflickr.com/800/600/Jaguar%2CXKR-S?lock=74"
    ],
    videos: [],
    timeline: [],
    followers: 560,
    following: 649
  },
  {
    id: "88700d89-1b08-4b01-a639-a3e615d24c92",
    username: "pippa_fpace",
    avatar: "https://randomuser.me/api/portraits/women/76.jpg",
    bio: "Jaguar F-Pace SVR owner. Build life.",
    location: "Birmingham, UK",
    car: {
      make: "Jaguar",
      model: "F-Pace SVR",
      year: 2020,
      image: "https://loremflickr.com/800/600/Jaguar%2CF-Pace,SVR?lock=75",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Jaguar%2CF-Pace,SVR?lock=75",
      "https://loremflickr.com/800/600/Jaguar%2CF-Pace,SVR?lock=75"
    ],
    videos: [],
    timeline: [],
    followers: 1405,
    following: 115
  },
  {
    id: "061bb735-17ba-4d05-884d-088bb5de266d",
    username: "enzo_488",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    bio: "Ferrari 488 GTB owner. Build life.",
    location: "Maranello, IT",
    car: {
      make: "Ferrari",
      model: "488 GTB",
      year: 2018,
      image: "https://loremflickr.com/800/600/Ferrari%2C488,GTB?lock=76",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ferrari%2C488,GTB?lock=76",
      "https://loremflickr.com/800/600/Ferrari%2C488,GTB?lock=76"
    ],
    videos: [],
    timeline: [],
    followers: 261,
    following: 605
  },
  {
    id: "854b118c-0b44-4102-8d3a-759d0148ab37",
    username: "beatrix_huracan",
    avatar: "https://randomuser.me/api/portraits/women/78.jpg",
    bio: "Lamborghini Huracan Evo owner. Build life.",
    location: "Sant'Agata, IT",
    car: {
      make: "Lamborghini",
      model: "Huracan Evo",
      year: 2021,
      image: "https://loremflickr.com/800/600/Lamborghini%2CHuracan,Evo?lock=77",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Lamborghini%2CHuracan,Evo?lock=77",
      "https://loremflickr.com/800/600/Lamborghini%2CHuracan,Evo?lock=77"
    ],
    videos: [],
    timeline: [],
    followers: 463,
    following: 698
  },
  {
    id: "85bbfea5-aeae-418e-bb53-3fa8cc9551a8",
    username: "axel_corvette",
    avatar: "https://randomuser.me/api/portraits/men/79.jpg",
    bio: "Chevrolet Corvette C7 Z06 owner. Build life.",
    location: "Detroit, US",
    car: {
      make: "Chevrolet",
      model: "Corvette C7 Z06",
      year: 2017,
      image: "https://loremflickr.com/800/600/Chevrolet%2CCorvette,C7,Z06?lock=78",
      mods: [
        "Whipple Supercharger",
        "Ford Performance CAI",
        "Borla ATAK",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R",
        "Steeda Camber Plates",
        "Brembo BBK",
        "Recaro Sportster",
        "Drake Quick-Release",
        "BOSS 302 Wheel",
        "B&M Hammer",
        "ROUSH Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Chevrolet%2CCorvette,C7,Z06?lock=78",
      "https://loremflickr.com/800/600/Chevrolet%2CCorvette,C7,Z06?lock=78"
    ],
    videos: [],
    timeline: [],
    followers: 1267,
    following: 455
  },
  {
    id: "438d92d9-b26d-4010-8e01-d7abb009db84",
    username: "june_camaro",
    avatar: "https://randomuser.me/api/portraits/women/80.jpg",
    bio: "Chevrolet Camaro 1LE owner. Build life.",
    location: "Houston, US",
    car: {
      make: "Chevrolet",
      model: "Camaro 1LE",
      year: 2019,
      image: "https://loremflickr.com/800/600/Chevrolet%2CCamaro,1LE?lock=79",
      mods: [
        "Whipple Supercharger",
        "Ford Performance CAI",
        "Borla ATAK",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R",
        "Steeda Camber Plates",
        "Brembo BBK",
        "Recaro Sportster",
        "Drake Quick-Release",
        "BOSS 302 Wheel",
        "B&M Hammer",
        "ROUSH Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,1LE?lock=79",
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,1LE?lock=79"
    ],
    videos: [],
    timeline: [],
    followers: 1528,
    following: 315
  },
  {
    id: "d0abc10a-3030-4e7e-98d3-6035853f048b",
    username: "wyatt_caddy",
    avatar: "https://randomuser.me/api/portraits/men/81.jpg",
    bio: "Cadillac CTS-V owner. Build life.",
    location: "Miami, US",
    car: {
      make: "Cadillac",
      model: "CTS-V",
      year: 2018,
      image: "https://loremflickr.com/800/600/Cadillac%2CCTS-V?lock=80",
      mods: [
        "Whipple Supercharger",
        "Ford Performance CAI",
        "Borla ATAK",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R",
        "Steeda Camber Plates",
        "Brembo BBK",
        "Recaro Sportster",
        "Drake Quick-Release",
        "BOSS 302 Wheel",
        "B&M Hammer",
        "ROUSH Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Cadillac%2CCTS-V?lock=80",
      "https://loremflickr.com/800/600/Cadillac%2CCTS-V?lock=80"
    ],
    videos: [],
    timeline: [],
    followers: 1269,
    following: 217
  },
  {
    id: "3b1fae5b-d647-4588-bb43-3b6fa76a2896",
    username: "delia_demon",
    avatar: "https://randomuser.me/api/portraits/women/82.jpg",
    bio: "Dodge Challenger SRT Demon owner. Build life.",
    location: "Phoenix, US",
    car: {
      make: "Dodge",
      model: "Challenger SRT Demon",
      year: 2018,
      image: "https://loremflickr.com/800/600/Dodge%2CChallenger,SRT,Demon?lock=81",
      mods: [
        "Whipple Supercharger",
        "Ford Performance CAI",
        "Borla ATAK",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R",
        "Steeda Camber Plates",
        "Brembo BBK",
        "Recaro Sportster",
        "Drake Quick-Release",
        "BOSS 302 Wheel",
        "B&M Hammer",
        "ROUSH Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Dodge%2CChallenger,SRT,Demon?lock=81",
      "https://loremflickr.com/800/600/Dodge%2CChallenger,SRT,Demon?lock=81"
    ],
    videos: [],
    timeline: [],
    followers: 354,
    following: 241
  },
  {
    id: "f02b3b7a-9790-47e5-8ffa-496f1cf38e2e",
    username: "asa_viper",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    bio: "Dodge Viper ACR owner. Build life.",
    location: "Vegas, US",
    car: {
      make: "Dodge",
      model: "Viper ACR",
      year: 2017,
      image: "https://loremflickr.com/800/600/Dodge%2CViper,ACR?lock=82",
      mods: [
        "Whipple Supercharger",
        "Ford Performance CAI",
        "Borla ATAK",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R",
        "Steeda Camber Plates",
        "Brembo BBK",
        "Recaro Sportster",
        "Drake Quick-Release",
        "BOSS 302 Wheel",
        "B&M Hammer",
        "ROUSH Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Dodge%2CViper,ACR?lock=82",
      "https://loremflickr.com/800/600/Dodge%2CViper,ACR?lock=82"
    ],
    videos: [],
    timeline: [],
    followers: 1004,
    following: 326
  },
  {
    id: "84c297d1-ab20-4958-8c32-4f287fdef78c",
    username: "june_silverado",
    avatar: "https://randomuser.me/api/portraits/women/84.jpg",
    bio: "Chevrolet Silverado ZR2 owner. Build life.",
    location: "Denver, US",
    car: {
      make: "Chevrolet",
      model: "Silverado ZR2",
      year: 2022,
      image: "https://loremflickr.com/800/600/Chevrolet%2CSilverado,ZR2?lock=83",
      mods: [
        "Banks Tune",
        "S&B CAI",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112",
        "Eibach Lift",
        "Husky Liners",
        "WeatherTech Mats",
        "Katzkin Leather",
        "Pioneer Head Unit",
        "Trail Armor Skid",
        "Rigid LED Bar",
        "ProClip Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Chevrolet%2CSilverado,ZR2?lock=83",
      "https://loremflickr.com/800/600/Chevrolet%2CSilverado,ZR2?lock=83"
    ],
    videos: [],
    timeline: [],
    followers: 1487,
    following: 166
  },
  {
    id: "80808993-64de-42f3-9721-ed9cde7f20e2",
    username: "theo_gladiator",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    bio: "Jeep Gladiator Mojave owner. Build life.",
    location: "Salt Lake, US",
    car: {
      make: "Jeep",
      model: "Gladiator Mojave",
      year: 2021,
      image: "https://loremflickr.com/800/600/Jeep%2CGladiator,Mojave?lock=84",
      mods: [
        "Banks Tune",
        "S&B CAI",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112",
        "Eibach Lift",
        "Husky Liners",
        "WeatherTech Mats",
        "Katzkin Leather",
        "Pioneer Head Unit",
        "Trail Armor Skid",
        "Rigid LED Bar",
        "ProClip Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Jeep%2CGladiator,Mojave?lock=84",
      "https://loremflickr.com/800/600/Jeep%2CGladiator,Mojave?lock=84"
    ],
    videos: [],
    timeline: [],
    followers: 1506,
    following: 462
  },
  {
    id: "34a7f7b1-9528-49e2-bbf0-6025fae5ed02",
    username: "edie_taco",
    avatar: "https://randomuser.me/api/portraits/women/86.jpg",
    bio: "Toyota Tacoma TRD Pro owner. Build life.",
    location: "Portland, US",
    car: {
      make: "Toyota",
      model: "Tacoma TRD Pro",
      year: 2022,
      image: "https://loremflickr.com/800/600/Toyota%2CTacoma,TRD,Pro?lock=85",
      mods: [
        "Banks Tune",
        "S&B CAI",
        "Magnaflow Exhaust",
        "HushPower Muffler",
        "Method Race 17x9",
        "BFGoodrich KO2 35s",
        "Bilstein 6112",
        "Eibach Lift",
        "Husky Liners",
        "WeatherTech Mats",
        "Katzkin Leather",
        "Pioneer Head Unit",
        "Trail Armor Skid",
        "Rigid LED Bar",
        "ProClip Mount",
        "Tonneau Cover"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CTacoma,TRD,Pro?lock=85",
      "https://loremflickr.com/800/600/Toyota%2CTacoma,TRD,Pro?lock=85"
    ],
    videos: [],
    timeline: [],
    followers: 1082,
    following: 369
  },
  {
    id: "c375ad47-61b2-4d6c-9b44-b13bbda00260",
    username: "arlo_mini",
    avatar: "https://randomuser.me/api/portraits/men/87.jpg",
    bio: "Mini Cooper JCW GP owner. Build life.",
    location: "Oxford, UK",
    car: {
      make: "Mini",
      model: "Cooper JCW GP",
      year: 2021,
      image: "https://loremflickr.com/800/600/Mini%2CCooper,JCW,GP?lock=86",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Springs",
        "Brembo Pads",
        "Sparco R333",
        "Schroth 4-Point",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Skirts",
        "Maxton Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Mini%2CCooper,JCW,GP?lock=86",
      "https://loremflickr.com/800/600/Mini%2CCooper,JCW,GP?lock=86"
    ],
    videos: [],
    timeline: [],
    followers: 548,
    following: 419
  },
  {
    id: "815b8412-84f3-452d-be93-a1e4d010b3c0",
    username: "sage_panda",
    avatar: "https://randomuser.me/api/portraits/women/88.jpg",
    bio: "Fiat Panda 100HP owner. Build life.",
    location: "Turin, IT",
    car: {
      make: "Fiat",
      model: "Panda 100HP",
      year: 2008,
      image: "https://loremflickr.com/800/600/Fiat%2CPanda,100HP?lock=87",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Fiat%2CPanda,100HP?lock=87",
      "https://loremflickr.com/800/600/Fiat%2CPanda,100HP?lock=87"
    ],
    videos: [],
    timeline: [],
    followers: 260,
    following: 248
  },
  {
    id: "0bdf28d1-0638-49eb-9da7-513d0851c0b3",
    username: "jules_clio",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    bio: "Renault Clio Williams owner. Build life.",
    location: "Paris, FR",
    car: {
      make: "Renault",
      model: "Clio Williams",
      year: 1995,
      image: "https://loremflickr.com/800/600/Renault%2CClio,Williams?lock=88",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Renault%2CClio,Williams?lock=88",
      "https://loremflickr.com/800/600/Renault%2CClio,Williams?lock=88"
    ],
    videos: [],
    timeline: [],
    followers: 1373,
    following: 650
  },
  {
    id: "afa73543-1cf7-456e-879f-06a42ce74e80",
    username: "odin_ds3",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    bio: "Citroen DS3 Racing owner. Build life.",
    location: "Paris, FR",
    car: {
      make: "Citroen",
      model: "DS3 Racing",
      year: 2013,
      image: "https://loremflickr.com/800/600/Citroen%2CDS3,Racing?lock=89",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Citroen%2CDS3,Racing?lock=89",
      "https://loremflickr.com/800/600/Citroen%2CDS3,Racing?lock=89"
    ],
    videos: [],
    timeline: [],
    followers: 388,
    following: 260
  },
  {
    id: "f364cb0f-7dee-4963-9a7f-aa71e931b464",
    username: "luna_modelS",
    avatar: "https://randomuser.me/api/portraits/women/91.jpg",
    bio: "Tesla Model S Plaid owner. Build life.",
    location: "Palo Alto, US",
    car: {
      make: "Tesla",
      model: "Model S Plaid",
      year: 2023,
      image: "https://loremflickr.com/800/600/Tesla%2CModel,S,Plaid?lock=90",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Tesla%2CModel,S,Plaid?lock=90",
      "https://loremflickr.com/800/600/Tesla%2CModel,S,Plaid?lock=90"
    ],
    videos: [],
    timeline: [],
    followers: 679,
    following: 513
  },
  {
    id: "bfcabb35-c8b6-435c-b3db-b982b2153284",
    username: "river_taycan",
    avatar: "https://randomuser.me/api/portraits/men/92.jpg",
    bio: "Porsche Taycan Turbo S owner. Build life.",
    location: "Stuttgart, DE",
    car: {
      make: "Porsche",
      model: "Taycan Turbo S",
      year: 2022,
      image: "https://loremflickr.com/800/600/Porsche%2CTaycan,Turbo,S?lock=91",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Porsche%2CTaycan,Turbo,S?lock=91",
      "https://loremflickr.com/800/600/Porsche%2CTaycan,Turbo,S?lock=91"
    ],
    videos: [],
    timeline: [],
    followers: 1044,
    following: 172
  },
  {
    id: "946ab30f-b212-4526-81ea-b5177cd4c547",
    username: "evan_i30N",
    avatar: "https://randomuser.me/api/portraits/men/93.jpg",
    bio: "Hyundai i30 N owner. Build life.",
    location: "Sydney, AU",
    car: {
      make: "Hyundai",
      model: "i30 N",
      year: 2021,
      image: "https://loremflickr.com/800/600/Hyundai%2Ci30,N?lock=92",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Hyundai%2Ci30,N?lock=92",
      "https://loremflickr.com/800/600/Hyundai%2Ci30,N?lock=92"
    ],
    videos: [],
    timeline: [],
    followers: 1127,
    following: 465
  },
  {
    id: "43879349-7517-489e-ab3e-96a4c5597037",
    username: "nika_konaN",
    avatar: "https://randomuser.me/api/portraits/women/94.jpg",
    bio: "Hyundai Kona N owner. Build life.",
    location: "Seoul, KR",
    car: {
      make: "Hyundai",
      model: "Kona N",
      year: 2022,
      image: "https://loremflickr.com/800/600/Hyundai%2CKona,N?lock=93",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Hyundai%2CKona,N?lock=93",
      "https://loremflickr.com/800/600/Hyundai%2CKona,N?lock=93"
    ],
    videos: [],
    timeline: [],
    followers: 1125,
    following: 414
  },
  {
    id: "b23f6c8f-21fb-45cb-af97-7fe760666cf2",
    username: "alma_ioniq5",
    avatar: "https://randomuser.me/api/portraits/women/95.jpg",
    bio: "Hyundai Ioniq 5 N owner. Build life.",
    location: "Seoul, KR",
    car: {
      make: "Hyundai",
      model: "Ioniq 5 N",
      year: 2024,
      image: "https://loremflickr.com/800/600/Hyundai%2CIoniq,5,N?lock=94",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Hyundai%2CIoniq,5,N?lock=94",
      "https://loremflickr.com/800/600/Hyundai%2CIoniq,5,N?lock=94"
    ],
    videos: [],
    timeline: [],
    followers: 1419,
    following: 350
  },
  {
    id: "3792976f-0d8e-49a1-8942-960e29fe3aa6",
    username: "roy_gt86",
    avatar: "https://randomuser.me/api/portraits/men/96.jpg",
    bio: "Toyota GT86 TRD owner. Build life.",
    location: "Brisbane, AU",
    car: {
      make: "Toyota",
      model: "GT86 TRD",
      year: 2016,
      image: "https://loremflickr.com/800/600/Toyota%2CGT86,TRD?lock=95",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Toyota%2CGT86,TRD?lock=95",
      "https://loremflickr.com/800/600/Toyota%2CGT86,TRD?lock=95"
    ],
    videos: [],
    timeline: [],
    followers: 1658,
    following: 245
  },
  {
    id: "8e611c3e-5e5c-418a-92c1-4c761369a122",
    username: "greta_brz",
    avatar: "https://randomuser.me/api/portraits/women/97.jpg",
    bio: "Subaru BRZ tS owner. Build life.",
    location: "Sydney, AU",
    car: {
      make: "Subaru",
      model: "BRZ tS",
      year: 2021,
      image: "https://loremflickr.com/800/600/Subaru%2CBRZ,tS?lock=96",
      mods: [
        "HKS GT2 Turbo",
        "Walbro 460 Fuel Pump",
        "ID1050x Injectors",
        "Tomei 88mm Cams",
        "Volk TE37 18x9.5",
        "BBS LM 18x9",
        "Endless MX72 Pads",
        "Brembo 4-pot BBK",
        "Bride Zeta IV Seat",
        "Sparco 6-Point Harness",
        "Defi Advance ZD Gauges",
        "Works Bell Short Hub",
        "Voltex Type-7 Wing",
        "Varis Front Lip",
        "APR Carbon Splitter",
        "Seibon Carbon Hood"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Subaru%2CBRZ,tS?lock=96",
      "https://loremflickr.com/800/600/Subaru%2CBRZ,tS?lock=96"
    ],
    videos: [],
    timeline: [],
    followers: 1065,
    following: 106
  },
  {
    id: "053488a6-c3e1-4340-9aa1-b29f8173d526",
    username: "ozzy_focus",
    avatar: "https://randomuser.me/api/portraits/men/98.jpg",
    bio: "Ford Focus RS Mk3 owner. Build life.",
    location: "Manchester, UK",
    car: {
      make: "Ford",
      model: "Focus RS Mk3",
      year: 2018,
      image: "https://loremflickr.com/800/600/Ford%2CFocus,RS,Mk3?lock=97",
      mods: [
        "Cobb AccessPort",
        "Mishimoto Intake",
        "Cobb Cat-Back",
        "Forge Intercooler",
        "BBS RE 17x7.5",
        "Falken Azenis RT660",
        "H&R Springs",
        "Brembo Pads",
        "Sparco R333",
        "Schroth 4-Point",
        "NRG Quick Release",
        "Eikosha Air Spencer",
        "Mishimoto Splitter",
        "Maxton Skirts",
        "Maxton Diffuser",
        "JCW Wing"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Ford%2CFocus,RS,Mk3?lock=97",
      "https://loremflickr.com/800/600/Ford%2CFocus,RS,Mk3?lock=97"
    ],
    videos: [],
    timeline: [],
    followers: 1397,
    following: 138
  },
  {
    id: "6367286a-57ac-435c-9f2e-41a451884482",
    username: "pia_ibiza",
    avatar: "https://randomuser.me/api/portraits/women/99.jpg",
    bio: "SEAT Ibiza Cupra owner. Build life.",
    location: "Barcelona, ES",
    car: {
      make: "SEAT",
      model: "Ibiza Cupra",
      year: 2017,
      image: "https://loremflickr.com/800/600/SEAT%2CIbiza,Cupra?lock=98",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/SEAT%2CIbiza,Cupra?lock=98",
      "https://loremflickr.com/800/600/SEAT%2CIbiza,Cupra?lock=98"
    ],
    videos: [],
    timeline: [],
    followers: 246,
    following: 201
  },
  {
    id: "b2df9f1c-973a-45e3-a563-5b1bf2f035b0",
    username: "max_leon",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Cupra Leon VZ owner. Build life.",
    location: "Madrid, ES",
    car: {
      make: "Cupra",
      model: "Leon VZ",
      year: 2022,
      image: "https://loremflickr.com/800/600/Cupra%2CLeon,VZ?lock=99",
      mods: [
        "APR Stage 2 Tune",
        "Forge Diverter Valve",
        "Wagner Tuning Intercooler",
        "Milltek Cat-Back",
        "OZ Ultraleggera 19x8.5",
        "Michelin Pilot Sport 4S",
        "H&R Sway Bars",
        "Brembo GT 6-pot",
        "Recaro Sportster CS",
        "Schroth Quick Fit Harness",
        "Carbon Fibre Trim",
        "Awron Multi-Display",
        "M Performance Spoiler",
        "M Performance Splitter",
        "Carbon Mirror Caps",
        "Vorsteiner Diffuser"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Cupra%2CLeon,VZ?lock=99",
      "https://loremflickr.com/800/600/Cupra%2CLeon,VZ?lock=99"
    ],
    videos: [],
    timeline: [],
    followers: 490,
    following: 583
  },
  {
    id: "17dd9a19-d25b-4ee5-9145-df278d77570c",
    username: "yan_camaro",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    bio: "Chevrolet Camaro ZL1 1LE owner. Build life.",
    location: "Atlanta, US",
    car: {
      make: "Chevrolet",
      model: "Camaro ZL1 1LE",
      year: 2022,
      image: "https://loremflickr.com/800/600/Chevrolet%2CCamaro,ZL1,1LE?lock=100",
      mods: [
        "Whipple Supercharger",
        "Ford Performance CAI",
        "Borla ATAK",
        "BBK Long Tube Headers",
        "Forgeline 20x10",
        "Nitto NT05R",
        "Steeda Camber Plates",
        "Brembo BBK",
        "Recaro Sportster",
        "Drake Quick-Release",
        "BOSS 302 Wheel",
        "B&M Hammer",
        "ROUSH Splitter",
        "CDC Side Spoiler",
        "Cervinis Hood",
        "Roush Scoops"
      ]
    },
    photos: [
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,ZL1,1LE?lock=100",
      "https://loremflickr.com/800/600/Chevrolet%2CCamaro,ZL1,1LE?lock=100"
    ],
    videos: [],
    timeline: [],
    followers: 848,
    following: 318
  }
];
