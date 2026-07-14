import type { ModsMap, TimelineEntry, GalleryPhoto } from '../constants/types';

export const USER_PROFILES: Record<string, { bio: string; posts: number; connected: number; connections: number; mods: ModsMap; timeline: TimelineEntry[]; gallery: GalleryPhoto[] }> = {
  SkylineKing: {
    bio: 'R34 GT-R owner. JDM purist. Night runs and track days. Melbourne scene.',
    posts: 23, connected: 142, connections: 1240,
    mods: {
      engine: ['HKS GT-SS Turbo Kit', 'Nismo 740cc Injectors', 'Tomei Poncam Type-B', 'GReddy Intake Plenum', 'HKS F-Con V Pro'],
      wheels: ['RAYS Volk TE37 18x10.5', 'Bridgestone RE-71RS', 'Nismo Brake Kit', 'Tein Flex-Z Coilovers'],
      interior: ['Nismo Cluster', 'Bride GIAS II Seats', 'MOMO Steering Wheel', 'Defi Link Meter'],
      exterior: ['Nismo Z-Tune Front Bumper', 'Carbon Trunk Lid', 'Ganador Mirrors', 'Nismo Side Skirts'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'HKS GT-SS Turbo Installed', text: '620whp on E85. Smooth power delivery all the way to redline.', likes: 145, initComments: [{ user: 'TurboMike', text: 'Goals right there.' }] },
      { id: 2, type: 'track', time: '3 weeks ago', title: 'Calder Park Night Session', text: 'Best 1/4 mile: 10.8 @ 132mph. Need more grip.', likes: 203, initComments: [{ user: 'DriftKing_AU', text: 'Weapon!' }] },
      { id: 3, type: 'event', time: '2 months ago', title: 'JDM Meet Melbourne', text: 'Great turnout. 200+ cars. R34s stole the show.', likes: 89, initComments: [] },
    ],
    gallery: [
      { id: 'sk1', url: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk2', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk3', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk4', url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk5', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'sk6', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop', car: 'Porsche 911' },
    ],
  },
  BoostQueen: {
    bio: 'VW GTI enthusiast. Stage builds and euro meets. Coffee and boost.',
    posts: 18, connected: 89, connections: 876,
    mods: {
      engine: ['APR Stage 2 ECU Tune', 'APR Downpipe', 'Forge Motorsport Intake', 'Turbosmart BOV'],
      wheels: ['BBS CI-R 19x8.5', 'Michelin PS4S 235/35', 'EBC Yellowstuff Pads', 'KW V3 Coilovers'],
      interior: ['APR Carbon Paddle Shifters', 'Raceseng Shift Knob', 'Volkswagen Digital Cockpit', 'P3 Gauges Vent Mount'],
      exterior: ['Maxton Front Splitter', 'Carbon Mirror Caps', 'Gloss Black Grille', 'Tinted Tail Lights'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '3 days ago', title: 'APR Stage 2 Complete', text: '320hp on 98 octane. Best value mod ever.', likes: 98, initComments: [{ user: 'EvoFanatic', text: 'APR never disappoints.' }] },
      { id: 2, type: 'event', time: '2 weeks ago', title: 'Euro Car Day', text: 'Won Best GTI in Show. Buzzing!', likes: 67, initComments: [] },
    ],
    gallery: [
      { id: 'bq1', url: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=600&h=600&fit=crop', car: 'Volkswagen Golf GTI' },
      { id: 'bq2', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=600&fit=crop', car: 'Volkswagen Golf GTI' },
      { id: 'bq3', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=600&fit=crop', car: 'Chevrolet Corvette' },
      { id: 'bq4', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=600&fit=crop', car: 'Volkswagen Golf GTI' },
    ],
  },
  TurboMike: {
    bio: 'Supra MK4 build. 2JZ-GTE single turbo. Track monster in progress.',
    posts: 31, connected: 156, connections: 2100,
    mods: {
      engine: ['Precision 6766 Turbo', 'Brian Crower Cams', '1000cc Injectors', 'Haltech Elite 2500', 'GSC Beehive Springs'],
      wheels: ['Weds Sport TC105X 18x10', 'Toyo R888R 275/35', 'Wilwood Big Brake Kit', 'TEIN Super Racing Coilovers'],
      interior: ['Sparco EVO QRT Seats', 'NRG Quick Release Hub', 'AEM Wideband UEGO', 'Stack Pro Dash'],
      exterior: ['TRD Front Lip', 'APR GTC-300 Wing', 'Origin Lab Side Skirts', 'DMAX Carbon Hood'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '5 days ago', title: 'Precision 6766 Fitted', text: '780whp on pump fuel. Absolute unit.', likes: 234, initComments: [{ user: 'SkylineKing', text: '2JZ never dies!' }] },
      { id: 2, type: 'track', time: '1 month ago', title: 'Winton Raceway PB', text: '1:38.2 — car is a different beast with the new setup.', likes: 112, initComments: [{ user: 'EvoFanatic', text: 'Flying!' }] },
      { id: 3, type: 'modification', time: '2 months ago', title: 'Haltech Elite 2500', text: 'Full standalone ECU. Flex fuel tuned and ready.', likes: 78, initComments: [] },
    ],
    gallery: [
      { id: 'tm1', url: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'tm2', url: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'tm3', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'tm4', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'tm5', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
    ],
  },
  DriftKing_AU: {
    bio: 'RX-7 FD rotary life. Sideways is the only direction. 13B-REW turbo.',
    posts: 12, connected: 78, connections: 543,
    mods: {
      engine: ['Borg Warner S300 Turbo', 'Atkins Rotary Street Port', 'Sard 850cc Injectors', 'Microtech LT-16c ECU'],
      wheels: ['Work Meister S1 18x9.5', 'Federal 595 RS-RR', 'AP Racing 4-Pot Brakes', 'BC Racing BR Coilovers'],
      interior: ['Bride Stradia II Seats', 'Nardi Classic Wheel', 'A-Pillar Gauge Pod', 'HKS Turbo Timer'],
      exterior: ['RE Amemiya Front Bumper', 'Feed Rear Wing', 'Mazdaspeed Side Skirts', 'Carbon Fibre Bonnet'],
    },
    timeline: [
      { id: 1, type: 'track', time: '4 days ago', title: 'Drift Practice @ Broadford', text: 'New S300 turbo spools so fast. Perfect for drift.', likes: 67, initComments: [{ user: 'TurboMike', text: 'Brap brap!' }] },
      { id: 2, type: 'modification', time: '3 weeks ago', title: 'Borg Warner S300 Build', text: 'Finally done. 380whp at 14psi.', likes: 91, initComments: [] },
    ],
    gallery: [
      { id: 'dk1', url: 'https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
      { id: 'dk2', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
      { id: 'dk3', url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
    ],
  },
  EvoFanatic: {
    bio: 'Evo IX daily. Rally heritage. AYC and ACD tuned. Full bolt-on build.',
    posts: 9, connected: 64, connections: 312,
    mods: {
      engine: ['FP Green Turbo', 'AMS Intercooler', 'Buschur Intake', 'EcuFlash Open Source Tune', 'Tomei Ti Exhaust'],
      wheels: ['Enkei NT03+M 18x9.5', 'Dunlop Z3 Star Spec', 'DBA T3 Rotors', 'Whiteline Sway Bars'],
      interior: ['Recaro Sportster CS', 'Tomei Shift Knob', 'Defi BF Boost Gauge', 'Carbon Fibre Centre Console'],
      exterior: ['Varis Widebody Kit', 'APR GT-250 Wing', 'Seibon Carbon Hood', 'Ralliart Mud Flaps'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'FP Green Turbo', text: 'Spools earlier than stock. 340whp and climbing.', likes: 56, initComments: [{ user: 'BoostQueen', text: 'Evo power!' }] },
      { id: 2, type: 'event', time: '1 month ago', title: 'Lancer Register Meet', text: '50 Evos in one spot. What a sight.', likes: 44, initComments: [] },
    ],
    gallery: [
      { id: 'ef1', url: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef2', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef3', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef4', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop', car: 'BMW M3' },
      { id: 'ef5', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef6', url: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef7', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=600&fit=crop', car: 'Mercedes AMG' },
      { id: 'ef8', url: 'https://images.unsplash.com/photo-1525609004556-c46c80848734?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef9', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
    ],
  },
  boosted_ben: {
    bio: 'Chasing boost and mountain runs.',
    posts: 18, connected: 85, connections: 980,
    mods: {
      engine: ['Garrett GTX3076R', 'HKS Intercooler', 'Tomei Fuel Pump', 'Link G4X ECU'],
      wheels: ['RAYS TE37 18x9.5', 'Federal RS-RR 265', 'Brembo 6-Pot BBK'],
      interior: ['Bride Zeta III', 'HKS Turbo Timer', 'Nardi Steering Wheel'],
      exterior: ['Nismo Z-Tune Bumper', 'Carbon Boot Lid', 'GT Wing'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '3 days ago', title: 'GTX3076R Installed', text: 'Full boost by 4500rpm. Pulls hard to redline.', likes: 78, initComments: [{ user: 'SkylineKing', text: 'Welcome to the GTX club!' }] },
    ],
    gallery: [
      { id: 'bb1', url: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=600&fit=crop', car: 'Nissan R34 GT-R' },
      { id: 'bb2', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', car: 'Nissan R34 GT-R' },
      { id: 'bb3', url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=600&fit=crop', car: 'Nissan R34 GT-R' },
    ],
  },
  amy_detailz: {
    bio: 'Detailing addict. Gloss is life.',
    posts: 31, connected: 120, connections: 1450,
    mods: {
      engine: ['APR Stage 2 ECU', 'Eventuri Intake', 'Milltek Turbo-Back Exhaust'],
      wheels: ['BBS CI-R 19x8.5', 'Michelin PS4S', 'EBC Yellowstuff Pads'],
      interior: ['Alcantara Steering Wheel', 'Carbon Fibre Trim', 'LED Footwell Kit'],
      exterior: ['Carbon Mirror Caps', 'Maxton Lip Kit', 'PPF Full Wrap'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'Full PPF Wrap', text: 'XPEL Ultimate Plus on every panel. No more rock chips.', likes: 134, initComments: [{ user: 'BoostQueen', text: 'This is the way.' }] },
    ],
    gallery: [
      { id: 'ad1', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=600&fit=crop', car: 'Audi RS3' },
      { id: 'ad2', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&h=600&fit=crop', car: 'Audi RS3' },
      { id: 'ad3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Audi RS3' },
    ],
  },
  low_luke: {
    bio: 'Static > air. Fight me.',
    posts: 14, connected: 56, connections: 620,
    mods: {
      engine: ['BM3 Stage 2 Tune', 'VRSF Downpipe', 'CTS Turbo Intake'],
      wheels: ['Apex EC-7 18x9', 'Continental ExtremeContact Sport', 'KW V3 Coilovers'],
      interior: ['M Performance Alcantara Wheel', 'Carbon Shift Paddles'],
      exterior: ['PSM Carbon Lip', 'Carbon Diffuser', 'Glossy Black Kidney Grills'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '2 weeks ago', title: 'KW V3 Installed', text: 'Perfect drop. Wheel gap deleted.', likes: 92, initComments: [{ user: 'stance_sam', text: 'Static gang!' }] },
    ],
    gallery: [
      { id: 'll1', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&h=600&fit=crop', car: 'BMW M2' },
      { id: 'll2', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop', car: 'BMW M2' },
      { id: 'll3', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop', car: 'BMW M2' },
    ],
  },
  sarah_speed: {
    bio: 'Track days > everything.',
    posts: 26, connected: 190, connections: 2340,
    mods: {
      engine: ['IPD Plenum', 'SharkWerks Exhaust', 'BMC Air Filter', 'Softronic Tune'],
      wheels: ['BBS RE-V7 19x8.5', 'Michelin Cup 2', 'Pagid RSC1 Pads', 'Ohlins Road & Track'],
      interior: ['Recaro Podium', 'Roll Bar', 'Schroth Harness', 'AIM Solo 2 DL'],
      exterior: ['Manthey Racing Aero Kit', 'Carbon Canards', 'Lexan Rear Window'],
    },
    timeline: [
      { id: 1, type: 'track', time: '4 days ago', title: 'Phillip Island PB', text: '1:48.2 — finally broke the 1:49 barrier. Ohlins made the difference.', likes: 267, initComments: [{ user: 'track_tom', text: 'Monster lap!' }] },
    ],
    gallery: [
      { id: 'ss1', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=600&h=600&fit=crop', car: 'Porsche Cayman GT4' },
      { id: 'ss2', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop', car: 'Porsche Cayman GT4' },
      { id: 'ss3', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Porsche Cayman GT4' },
    ],
  },
  jdm_joel: {
    bio: 'VTEC is my religion.',
    posts: 20, connected: 98, connections: 1120,
    mods: {
      engine: ['Toda F20C Header', 'Kraftwerks Supercharger', 'AEM EMS', 'Hondata FlashPro'],
      wheels: ['Enkei RPF1 17x8', 'Yokohama AD09', 'Spoon Mono-Block Calipers'],
      interior: ['Mugen Shift Knob', 'S2K-R Cluster', 'Hardtop Conversion'],
      exterior: ['J\'s Racing Front Bumper', 'Voltex Wing', 'Mugen Hardtop'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'Kraftwerks SC Kit', text: '280whp NA feel with forced induction. Linear and clean.', likes: 145, initComments: [{ user: 'civic_carter', text: 'Honda power!' }] },
    ],
    gallery: [
      { id: 'jj1', url: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600&h=600&fit=crop', car: 'Honda S2000' },
      { id: 'jj2', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop', car: 'Honda S2000' },
      { id: 'jj3', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Honda S2000' },
    ],
  },
  euro_ella: {
    bio: 'Daily driver but make it spicy.',
    posts: 11, connected: 67, connections: 780,
    mods: {
      engine: ['IS38 Turbo Swap', 'IE Intake', 'CTS Downpipe', 'Unitronic Stage 2+'],
      wheels: ['Neuspeed RSe10 19x8.5', 'Continental EC Sport', 'EBC Redstuff Pads'],
      interior: ['Raceseng Shift Knob', 'VW R Pedals', 'Kicker Sub Upgrade'],
      exterior: ['Oettinger Spoiler', 'Maxton Rear Diffuser', 'Tinted Tails'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '5 days ago', title: 'IS38 Turbo Swap', text: 'Stage 2+ on the Golf R now. 400hp club.', likes: 88, initComments: [{ user: 'BoostQueen', text: 'Welcome to the big turbo life!' }] },
    ],
    gallery: [
      { id: 'ee1', url: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=600&h=600&fit=crop', car: 'Volkswagen Golf R' },
      { id: 'ee2', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop', car: 'Volkswagen Golf R' },
      { id: 'ee3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Volkswagen Golf R' },
    ],
  },
  track_tom: {
    bio: 'Small car, big attitude.',
    posts: 8, connected: 42, connections: 560,
    mods: {
      engine: ['Litchfield Stage 2 ECU', 'HKS Hi-Power Exhaust', 'GR Intake'],
      wheels: ['Enkei RPF1 18x8', 'Dunlop Z3', 'Wilwood 4-Pot BBK', 'Bilstein B16'],
      interior: ['OMP WRC Wheel', 'Bride Stradia II', 'Harness Bar'],
      exterior: ['Varis Carbon Bonnet', 'Rally Mud Flaps', 'LED Pod Lights'],
    },
    timeline: [
      { id: 1, type: 'track', time: '2 weeks ago', title: 'Wakefield Park Sprint', text: 'P2 in class. This little thing surprises everyone.', likes: 67, initComments: [{ user: 'sarah_speed', text: 'GR Yaris is a weapon!' }] },
    ],
    gallery: [
      { id: 'tt1', url: 'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530?w=600&h=600&fit=crop', car: 'Toyota GR Yaris' },
      { id: 'tt2', url: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=600&fit=crop', car: 'Toyota GR Yaris' },
      { id: 'tt3', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Toyota GR Yaris' },
    ],
  },
  mia_mods: {
    bio: 'Blue paint, gold wheels forever.',
    posts: 22, connected: 78, connections: 890,
    mods: {
      engine: ['COBB Stage 2', 'Grimmspeed TMIC', 'Invidia Catback', 'IAG AOS'],
      wheels: ['Enkei NT03+M 18x9.5 Gold', 'DZ3 Star Spec', 'StopTech BBK', 'RCE Yellows'],
      interior: ['Cusco Roll Cage', 'Bride GIAS II', 'PROVA Shift Knob'],
      exterior: ['Seibon Carbon Hood', 'Rally Armor Flaps', 'STI Lip Kit'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '6 days ago', title: 'Gold NT03+M Wheels', text: 'Finally got the classic combo. Blue WRX + gold wheels = perfection.', likes: 112, initComments: [{ user: 'Jake_STI', text: 'The only combo that matters.' }] },
    ],
    gallery: [
      { id: 'mm1', url: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
      { id: 'mm2', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
      { id: 'mm3', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
    ],
  },
  v8_vince: {
    bio: 'If it doesn\'t rumble, I don\'t want it.',
    posts: 16, connected: 140, connections: 1670,
    mods: {
      engine: ['Roush Supercharger', 'Corsa Xtreme Exhaust', 'JLT Cold Air Intake', 'Lund Racing Tune'],
      wheels: ['Forgestar CF5 20x10', 'Nitto NT555 G2', 'Brembo GT BBK'],
      interior: ['Recaro Sportster', 'MGW Short Throw', 'Custom Gauge Pack'],
      exterior: ['RTR Chin Spoiler', 'Anderson Composites Hood', 'Cervini Side Scoops'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'Roush Phase 2 SC', text: '750hp at the crank. She screams now.', likes: 198, initComments: [{ user: 'diesel_dan', text: 'V8 supremacy!' }] },
    ],
    gallery: [
      { id: 'vv1', url: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d661f?w=600&h=600&fit=crop', car: 'Ford Mustang GT' },
      { id: 'vv2', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Ford Mustang GT' },
      { id: 'vv3', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=600&fit=crop', car: 'Ford Mustang GT' },
    ],
  },
  kat_kustoms: {
    bio: 'Rotary life chose me.',
    posts: 12, connected: 38, connections: 430,
    mods: {
      engine: ['BorgWarner S257', 'V-Mount Intercooler', 'Haltech Elite 2500', 'Mazda Comp 6-Port'],
      wheels: ['Work Meister S1 17x9', 'Federal 595RS-RR', 'AP Racing 4-Pot', 'Tein Flex A'],
      interior: ['Nardi Deep Corn', 'Bride Vios III', 'Greddy Profec Boost Controller'],
      exterior: ['RE Amemiya Front Bumper', 'Rocket Bunny Kit', 'Carbon Mirrors'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '2 weeks ago', title: 'Haltech Elite Wiring', text: 'Full standalone. Rotary tuning is an art form.', likes: 56, initComments: [{ user: 'DriftKing_AU', text: 'Rotary respect!' }] },
    ],
    gallery: [
      { id: 'kk1', url: 'https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
      { id: 'kk2', url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
      { id: 'kk3', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
    ],
  },
  diesel_dan: {
    bio: 'Torque solves everything.',
    posts: 7, connected: 29, connections: 340,
    mods: {
      engine: ['5" Turbo-Back Delete', 'S&B Cold Air Intake', 'HP Tuners Custom Tune'],
      wheels: ['Fuel Rebel 20x10', 'Toyo Open Country MT 35"', 'Bilstein 5100 Lift Kit'],
      interior: ['Leather Seat Covers', 'Edge CTS3 Monitor', 'WeatherTech Liners'],
      exterior: ['Bushwacker Fender Flares', 'Ranch Hand Bumper', 'LED Light Bar'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '3 weeks ago', title: '35" Toyo MT Installed', text: 'Finally got the right stance. Looks mean now.', likes: 34, initComments: [{ user: 'offroad_ollie', text: 'Truck goals!' }] },
    ],
    gallery: [
      { id: 'dd1', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', car: 'RAM 1500' },
      { id: 'dd2', url: 'https://images.unsplash.com/photo-1519211975560-4ca611f5a72a?w=600&h=600&fit=crop', car: 'RAM 1500' },
      { id: 'dd3', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'RAM 1500' },
    ],
  },
  hybrid_holly: {
    bio: 'Eco but make it fast.',
    posts: 5, connected: 18, connections: 210,
    mods: {
      engine: ['TRD Cold Air Intake', 'Custom Hybrid ECU Tune', 'HKS Silent Hi-Power Exhaust'],
      wheels: ['Enkei PF01 17x7', 'Bridgestone Ecopia', 'TRD Lowering Springs'],
      interior: ['TRD Shift Knob', 'Pioneer CarPlay Unit', 'LED Ambient Lighting'],
      exterior: ['TRD Lip Kit', 'Tinted Windows', 'Carbon Fibre Antenna'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 month ago', title: 'Custom Hybrid Tune', text: 'Squeezed 15% more battery regen. Every little bit counts.', likes: 22, initComments: [{ user: 'ev_eric', text: 'Efficiency is speed!' }] },
    ],
    gallery: [
      { id: 'hh1', url: 'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530?w=600&h=600&fit=crop', car: 'Toyota Prius GR Concept' },
      { id: 'hh2', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Toyota Prius GR Concept' },
      { id: 'hh3', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=600&fit=crop', car: 'Toyota Prius GR Concept' },
    ],
  },
  stance_sam: {
    bio: 'Low, slow, and show.',
    posts: 19, connected: 65, connections: 760,
    mods: {
      engine: ['RR Racing ECU Tune', 'Joe-Z Exhaust', 'K&N Intake'],
      wheels: ['Work VS-XX 19x9.5', 'Nankang NS-2R', 'Aimgain Adjustable Arms', 'BC Racing BR Coilovers'],
      interior: ['Custom Alcantara Dash', 'VIP Tables', 'Junction Produce Curtains'],
      exterior: ['Aimgain Lip Kit', 'Wald Body Kit', 'Air Suspension System'],
    },
    timeline: [
      { id: 1, type: 'event', time: '1 week ago', title: 'StanceNation Melbourne', text: 'Took Best VIP. The Lexus scene is alive.', likes: 134, initComments: [{ user: 'low_luke', text: 'Well deserved!' }] },
    ],
    gallery: [
      { id: 'sm1', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=600&fit=crop', car: 'Lexus IS350' },
      { id: 'sm2', url: 'https://images.unsplash.com/photo-1525609004556-c46c80848734?w=600&h=600&fit=crop', car: 'Lexus IS350' },
      { id: 'sm3', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=600&fit=crop', car: 'Lexus IS350' },
    ],
  },
  ev_eric: {
    bio: 'Instant torque addict.',
    posts: 10, connected: 155, connections: 1890,
    mods: {
      engine: ['Unplugged Performance Coils', 'MPP Front Motor', 'Custom Battery Optimization'],
      wheels: ['T Sportline TSS 20x9', 'Michelin Pilot Sport 4', 'MPP Lowering Links'],
      interior: ['Alcantara Wrap Kit', 'Hansshow Yoke', 'Premium Audio Upgrade'],
      exterior: ['XPEL Stealth PPF', 'Chrome Delete', 'Carbon Fiber Spoiler'],
    },
    timeline: [
      { id: 1, type: 'track', time: '3 days ago', title: 'Drag Strip PB', text: '10.8 quarter mile. No engine mods needed, just tire prep.', likes: 210, initComments: [{ user: 'hybrid_holly', text: 'EV power!' }] },
    ],
    gallery: [
      { id: 'er1', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=600&fit=crop', car: 'Tesla Model 3 Performance' },
      { id: 'er2', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop', car: 'Tesla Model 3 Performance' },
      { id: 'er3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Tesla Model 3 Performance' },
    ],
  },
  retro_ruby: {
    bio: 'Old school soul.',
    posts: 15, connected: 45, connections: 520,
    mods: {
      engine: ['Triple Weber 45 DCOE', 'L28 Stroker 3.1L', 'Pertronix Ignition', 'Custom Headers'],
      wheels: ['Watanabe RS 15x7', 'Toyo Proxes R1R', 'Tokico Illumina Shocks', 'Techno Toy Coilovers'],
      interior: ['Datsun Competition Wheel', 'Classic Bucket Seats', 'VDO Gauges', 'Tombstone Seats'],
      exterior: ['G-Nose Conversion', 'Fender Mirrors', 'Chin Spoiler', 'BRE Side Stripe'],
    },
    timeline: [
      { id: 1, type: 'event', time: '2 weeks ago', title: 'Japanese Classic Car Show', text: 'Triple Webers singing their song. People loved the sound.', likes: 89, initComments: [{ user: 'jdm_joel', text: 'Pure JDM heritage!' }] },
    ],
    gallery: [
      { id: 'rr1', url: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&h=600&fit=crop', car: 'Datsun 240Z' },
      { id: 'rr2', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Datsun 240Z' },
      { id: 'rr3', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Datsun 240Z' },
    ],
  },
  offroad_ollie: {
    bio: 'If there\'s no trail, I\'ll make one.',
    posts: 13, connected: 58, connections: 680,
    mods: {
      engine: ['Superchips Flashcal', 'AFE Momentum Intake', 'Banks Monster Exhaust'],
      wheels: ['Method 305 NV 17x8.5', 'BF Goodrich KO2 35"', 'TeraFlex 3.5" Lift', 'Fox 2.0 Shocks'],
      interior: ['Rugged Ridge Neoprene Covers', 'Garmin Overlander GPS', 'ARB Fridge Slide'],
      exterior: ['Warn Zeon 10-S Winch', 'Smittybilt Roof Rack', 'KC HiLites Flex Array'],
    },
    timeline: [
      { id: 1, type: 'track', time: '1 week ago', title: 'Blue Mountains Trail Run', text: 'Tested the new lift on some gnarly rock crawls. No panel damage!', likes: 76, initComments: [{ user: 'diesel_dan', text: 'Send it!' }] },
    ],
    gallery: [
      { id: 'oo1', url: 'https://images.unsplash.com/photo-1519211975560-4ca611f5a72a?w=600&h=600&fit=crop', car: 'Jeep Wrangler Rubicon' },
      { id: 'oo2', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', car: 'Jeep Wrangler Rubicon' },
      { id: 'oo3', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Jeep Wrangler Rubicon' },
    ],
  },
  swift_sienna: {
    bio: 'Small car energy.',
    posts: 6, connected: 24, connections: 290,
    mods: {
      engine: ['HKS Hi-Power Exhaust', 'Suzuki Sport Air Filter', 'Custom ECU Remap'],
      wheels: ['Enkei PF01 16x7', 'Dunlop Z3 Star Spec', 'Whiteline Front Sway Bar', 'Tein Street Advance Z'],
      interior: ['MOMO Steering Wheel', 'Recaro SR-7', 'Pivot 3-in-1 Gauge'],
      exterior: ['Suzuki Sport Lip Kit', 'Carbon Bonnet', 'Tinted Indicators'],
    },
    timeline: [
      { id: 1, type: 'event', time: '3 weeks ago', title: 'Hot Hatch Meet Sydney', text: 'Only Swift Sport there. Stood out for being different.', likes: 31, initComments: [{ user: 'mini_maya', text: 'Small car gang!' }] },
    ],
    gallery: [
      { id: 'sn1', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop', car: 'Suzuki Swift Sport' },
      { id: 'sn2', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Suzuki Swift Sport' },
      { id: 'sn3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Suzuki Swift Sport' },
    ],
  },
  gt_gary: {
    bio: 'Godzilla enthusiast.',
    posts: 24, connected: 130, connections: 1560,
    mods: {
      engine: ['HKS GT800 Turbo Kit', 'ID1700 Injectors', 'MoTeC M150 ECU', 'Tomei Expreme Ti Exhaust'],
      wheels: ['RAYS TE37 Ultra 20x10.5', 'Yokohama A052', 'Alcon 6-Pot BBK', 'HKS Hipermax IV GT'],
      interior: ['Nismo Carbon Buckets', 'AIM MXP Strada', 'Nismo Titanium Knob'],
      exterior: ['Top Secret Aero Kit', 'Seibon Carbon Trunk', 'NISMO 400R Bumper'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '5 days ago', title: 'MoTeC M150 Install', text: '850whp on pump E85. This thing is terrifying.', likes: 234, initComments: [{ user: 'boosted_ben', text: 'R35 power is unreal.' }] },
    ],
    gallery: [
      { id: 'gg1', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', car: 'Nissan GT-R R35' },
      { id: 'gg2', url: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=600&fit=crop', car: 'Nissan GT-R R35' },
      { id: 'gg3', url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=600&fit=crop', car: 'Nissan GT-R R35' },
    ],
  },
  mini_maya: {
    bio: 'Corners are my playground.',
    posts: 9, connected: 36, connections: 410,
    mods: {
      engine: ['Manic Stage 2 Tune', 'Forge Intercooler', 'Milltek De-Cat Downpipe'],
      wheels: ['OZ Superturismo LM 18x7.5', 'Pirelli P-Zero', 'Tarox 6-Pot BBK', 'KW V2 Coilovers'],
      interior: ['JCW Alcantara Wheel', 'Harman Kardon Upgrade', 'Carbon Dash Trim'],
      exterior: ['Duell AG Lip Kit', 'Carbon Bonnet Scoop', 'GP3 Rear Spoiler'],
    },
    timeline: [
      { id: 1, type: 'track', time: '10 days ago', title: 'Winton Raceway Sprint', text: 'Beat two GT86s and a Fiesta ST. Mini power.', likes: 54, initComments: [{ user: 'swift_sienna', text: 'Small car supremacy!' }] },
    ],
    gallery: [
      { id: 'my1', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=600&fit=crop', car: 'Mini Cooper JCW' },
      { id: 'my2', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Mini Cooper JCW' },
      { id: 'my3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Mini Cooper JCW' },
    ],
  },
  civic_carter: {
    bio: 'Red badge pride.',
    posts: 17, connected: 82, connections: 950,
    mods: {
      engine: ['Hondata FlashPro', 'PRL Cobra Intake', 'Invidia Q300 Exhaust', 'Acuity Fuel Rail'],
      wheels: ['Enkei NT03+M 18x9.5', 'Michelin PS4S 265', 'StopTech Sport BBK', 'Eibach Sportline Springs'],
      interior: ['Acuity Shift Knob', 'Type R Red Seats (OEM)', 'Pioneer CarPlay Head Unit'],
      exterior: ['Seibon Carbon Lip', 'Mugen Rear Wing', 'APR Front Splitter'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '4 days ago', title: 'PRL Cobra Intake', text: 'Induction noise is addictive. +15whp on the dyno.', likes: 98, initComments: [{ user: 'jdm_joel', text: 'FK8 sounds so good with an intake!' }] },
    ],
    gallery: [
      { id: 'cc1', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop', car: 'Honda Civic Type R FK8' },
      { id: 'cc2', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Honda Civic Type R FK8' },
      { id: 'cc3', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=600&fit=crop', car: 'Honda Civic Type R FK8' },
    ],
  },
};
