import type { Participant, Conversation, Message } from '../constants/types';
import { U } from './users';

export const PARTICIPANTS: Record<string, Participant> = {
  boostqueen: { id: 'boostqueen', name: U.boost.user, initials: U.boost.av, online: true, img: U.boost.img },
  skylineking: { id: 'skylineking', name: U.skyline.user, initials: U.skyline.av, online: false, lastSeen: '2h ago', img: U.skyline.img },
  turbomike: { id: 'turbomike', name: U.turbo.user, initials: U.turbo.av, online: true, img: U.turbo.img },
  driftking: { id: 'driftking', name: U.drift.user, initials: U.drift.av, online: false, lastSeen: '5h ago', img: U.drift.img },
  evofanatic: { id: 'evofanatic', name: U.evo.user, initials: U.evo.av, online: true, img: U.evo.img },
};
export const ME_P: Participant = { id: 'me', name: U.jake.user, initials: U.jake.av, online: true, img: U.jake.img };
export const SEED_CONVERSATIONS: Conversation[] = [
  { id: '1', participant: PARTICIPANTS.boostqueen, participants: [ME_P, PARTICIPANTS.boostqueen], pinned: true, muted: false, typing: false, messages: [
    { id: 'm1', senderId: 'them', text: 'Hey! Saw your COBB post. What numbers are you pulling?', time: '10:14', status: 'read', reactions: [] },
    { id: 'm2', senderId: 'me', text: 'Around 310whp on 98 octane. Car feels insane.', time: '10:16', status: 'read', reactions: [{ emoji: '\uD83D\uDD25', count: 1, mine: false }] },
    { id: 'm3', senderId: 'them', text: 'APR stage 1 map is insane value for money too. 320hp on my GTI.', time: '10:18', status: 'read', reactions: [] },
    { id: 'm4', senderId: 'me', text: 'Nice! You coming to the track day at Phillip Island?', time: '10:20', status: 'read', reactions: [] },
    { id: 'm5', senderId: 'them', text: 'Absolutely. Already booked my session \uD83C\uDFC1', time: '10:21', status: 'read', reactions: [{ emoji: '\uD83D\uDE4C', count: 1, mine: true }] },
  ] },
  { id: '2', participant: PARTICIPANTS.skylineking, participants: [ME_P, PARTICIPANTS.skylineking], pinned: true, muted: false, typing: false, messages: [
    { id: 'm1', senderId: 'them', text: 'RB26 is finally back together. Six months of work.', time: 'Yesterday', status: 'read', reactions: [] },
    { id: 'm2', senderId: 'me', text: 'That rebuild looked insane on your story. What spec?', time: 'Yesterday', status: 'read', reactions: [] },
    { id: 'm3', senderId: 'them', text: 'Tomei 2.8 stroker, HKS GT-SS turbos, haltech. It\'s a monster.', time: 'Yesterday', status: 'read', reactions: [{ emoji: '\uD83D\uDE2E', count: 2, mine: true }] },
    { id: 'm4', senderId: 'them', text: 'You coming to the meet on Sunday?', time: '9:05', status: 'read', reactions: [] },
  ] },
  { id: '3', participant: PARTICIPANTS.turbomike, participants: [ME_P, PARTICIPANTS.turbomike], pinned: false, muted: false, typing: true, messages: [
    { id: 'm1', senderId: 'me', text: 'That Tomei exhaust on your Supra sounds absolutely mental.', time: '8:30', status: 'read', reactions: [] },
    { id: 'm2', senderId: 'them', text: '2JZ on full song with that exhaust is something else haha', time: '8:32', status: 'read', reactions: [] },
    { id: 'm3', senderId: 'them', text: 'You should hear it at full tilt on the highway \uD83D\uDE02', time: '8:33', status: 'read', reactions: [] },
  ] },
  { id: '4', participant: PARTICIPANTS.driftking, participants: [ME_P, PARTICIPANTS.driftking], pinned: false, muted: true, typing: false, messages: [
    { id: 'm1', senderId: 'them', text: 'Drift comp at Winton next month. You keen?', time: 'Mon', status: 'read', reactions: [] },
    { id: 'm2', senderId: 'me', text: 'STI is more of a grip car but I\'ll come spectate!', time: 'Mon', status: 'read', reactions: [] },
    { id: 'm3', senderId: 'them', text: 'Come have a ride along. You\'ll be converted \uD83D\uDE02', time: 'Mon', status: 'read', reactions: [{ emoji: '\uD83D\uDE02', count: 1, mine: true }] },
  ] },
  { id: '5', participant: PARTICIPANTS.evofanatic, participants: [ME_P, PARTICIPANTS.evofanatic], pinned: false, muted: false, typing: false, messages: [
    { id: 'm1', senderId: 'them', text: 'AMS intercooler made such a difference to my Evo.', time: 'Sun', status: 'read', reactions: [] },
    { id: 'm2', senderId: 'me', text: 'The heat soak fix or just overall power?', time: 'Sun', status: 'read', reactions: [] },
    { id: 'm3', senderId: 'them', text: 'Both honestly. Consistent power all session now.', time: 'Sun', status: 'read', reactions: [] },
  ] },
];
export const AUTO_REPLIES: Record<string, string[]> = {
  boostqueen: ['Haha yeah the car is an animal now', 'We should do a back to back dyno comparison', 'What clutch are you running?', 'Let me know when you\'re free for a drive'],
  skylineking: ['Absolutely. Sunday is on!', 'Bring the WRX out, should be a good one', 'R34 is running perfectly now finally', 'We\'ll do some pulls on the highway at dawn'],
  turbomike: ['Yeah the Supra is on another level', 'You should get a proper exhaust on the STI too', 'Tomei Ti is the best bang for buck', 'What tune are you on currently?'],
  driftking: ['Ride along offer stands!', 'Trust me you\'ll want to drift after', 'RX-7 is getting a full engine rebuild soon', 'Gonna be a sick event at Winton'],
  evofanatic: ['The Evo is a track weapon now', 'What boost pressure are you running?', 'Need to get some proper data logging done', 'AMS makes great products for the Evo platform'],
};

/* ── HELPERS ── */
export function getLastMessage(conv: Conversation): Message | null {
  const last = conv.messages[conv.messages.length - 1];
  if (!last) return null;
  return last;
}
export function getUnreadCount(conv: Conversation): number {
  return conv.messages.filter(m => m.senderId !== 'me' && m.status !== 'read').length;
}
