/**
 * Faces and Things (Digital Edition) Card Deck Database
 * Intellectual Property: Matthew Onaneye
 * 
 * 70 Total Cards:
 * - 35 Human Characters
 * - 17 Animals
 * - 18 Objects
 */

export type CardCategory = 'character' | 'animal' | 'object';

export interface FacesCardItem {
  id: string;
  name: string;
  category: CardCategory;
  emoji: string;
  themeColor: string;
  badgeBg: string;
  description: string;
  musicalRiff: number[]; // Frequencies in Hz for "Who Sang What?"
}

export const FACES_CHARACTERS: FacesCardItem[] = [
  { id: 'c_bola', name: 'Bola', category: 'character', emoji: '👧🏾', themeColor: '#f59e0b', badgeBg: 'bg-amber-100 text-amber-900', description: 'Energetic dancer with bright braided buns.', musicalRiff: [440, 554, 659] },
  { id: 'c_amaka', name: 'Amaka', category: 'character', emoji: '👩🏾', themeColor: '#ec4899', badgeBg: 'bg-pink-100 text-pink-900', description: 'Curious explorer with a warm radiant smile.', musicalRiff: [523, 659, 784] },
  { id: 'c_janet', name: 'Janet', category: 'character', emoji: '👱‍♀️', themeColor: '#3b82f6', badgeBg: 'bg-blue-100 text-blue-900', description: 'Book lover with sunny blonde curls.', musicalRiff: [587, 740, 880] },
  { id: 'c_hannah', name: 'Hannah', category: 'character', emoji: '👧🏼', themeColor: '#10b981', badgeBg: 'bg-emerald-100 text-emerald-900', description: 'Kind-hearted artist who loves painting flowers.', musicalRiff: [493, 622, 740] },
  { id: 'c_felicia', name: 'Felicia', category: 'character', emoji: '👩🏽', themeColor: '#8b5cf6', badgeBg: 'bg-purple-100 text-purple-900', description: 'Clever scientist always asking big questions.', musicalRiff: [659, 784, 987] },
  { id: 'c_pa_james', name: 'Pa James', category: 'character', emoji: '👴🏾', themeColor: '#b45309', badgeBg: 'bg-amber-200 text-amber-950', description: 'Wise elder who tells wonderful folk tales by the fire.', musicalRiff: [261, 329, 392] },
  { id: 'c_tina', name: 'Tina', category: 'character', emoji: '👧🏽', themeColor: '#06b6d4', badgeBg: 'bg-cyan-100 text-cyan-900', description: 'Playful runner who never stops giggling.', musicalRiff: [523, 622, 698] },
  { id: 'c_tobi', name: 'Tobi', category: 'character', emoji: '👦🏾', themeColor: '#f97316', badgeBg: 'bg-orange-100 text-orange-900', description: 'Speedy soccer player with a boundless spark.', musicalRiff: [392, 493, 587] },
  { id: 'c_amina', name: 'Amina', category: 'character', emoji: '🧕🏾', themeColor: '#14b8a6', badgeBg: 'bg-teal-100 text-teal-900', description: 'Thoughtful astronomer who maps the stars at night.', musicalRiff: [440, 523, 659] },
  { id: 'c_tony', name: 'Tony', category: 'character', emoji: '👦🏻', themeColor: '#6366f1', badgeBg: 'bg-indigo-100 text-indigo-900', description: 'Inventor who builds mini gadgets out of cardboard.', musicalRiff: [349, 440, 523] },
  { id: 'c_grandma_nina', name: 'Grandma Nina', category: 'character', emoji: '👵🏼', themeColor: '#f43f5e', badgeBg: 'bg-rose-100 text-rose-900', description: 'Loving baker whose fresh pies smell like cinnamon.', musicalRiff: [329, 392, 493] },
  { id: 'c_nicholas', name: 'Nicholas', category: 'character', emoji: '👦🏼', themeColor: '#0284c7', badgeBg: 'bg-sky-100 text-sky-900', description: 'Cheerful sailor dreaming of distant oceans.', musicalRiff: [392, 440, 523] },
  { id: 'c_ade', name: 'Ade', category: 'character', emoji: '👦🏾', themeColor: '#ea580c', badgeBg: 'bg-amber-100 text-amber-900', description: 'Energetic champion runner always racing ahead.', musicalRiff: [440, 493, 587] },
  { id: 'c_blessing', name: 'Blessing', category: 'character', emoji: '👧🏾', themeColor: '#a855f7', badgeBg: 'bg-purple-100 text-purple-900', description: 'Joyful singer whose voice brightens the room.', musicalRiff: [587, 659, 784] },
  { id: 'c_zainab', name: 'Zainab', category: 'character', emoji: '👩🏽', themeColor: '#059669', badgeBg: 'bg-emerald-100 text-emerald-900', description: 'Botanist caring for fragrant tropical plants.', musicalRiff: [493, 587, 698] },
  { id: 'c_kemi', name: 'Kemi', category: 'character', emoji: '👧🏾', themeColor: '#e11d48', badgeBg: 'bg-rose-100 text-rose-900', description: 'Bubbly gymnast full of cartwheels and laughter.', musicalRiff: [659, 740, 880] },
  { id: 'c_chioma', name: 'Chioma', category: 'character', emoji: '👩🏾', themeColor: '#7c3aed', badgeBg: 'bg-violet-100 text-violet-900', description: 'Architect designing cozy treehouses.', musicalRiff: [440, 554, 659] },
  { id: 'c_ruth', name: 'Ruth', category: 'character', emoji: '👩🏼', themeColor: '#d97706', badgeBg: 'bg-amber-100 text-amber-900', description: 'Violinist playing sweet morning melodies.', musicalRiff: [523, 659, 784] },
  { id: 'c_matthew', name: 'Matthew', category: 'character', emoji: '👨🏾', themeColor: '#2563eb', badgeBg: 'bg-blue-100 text-blue-900', description: 'Creative story crafter & co-creator of Faces & Things.', musicalRiff: [330, 415, 493] },
  { id: 'c_arinze', name: 'Arinze', category: 'character', emoji: '👦🏾', themeColor: '#0d9488', badgeBg: 'bg-teal-100 text-teal-900', description: 'Master puzzle solver who loves riddles.', musicalRiff: [392, 493, 622] },
  { id: 'c_naomi', name: 'Naomi', category: 'character', emoji: '👩🏾', themeColor: '#db2777', badgeBg: 'bg-pink-100 text-pink-900', description: 'Gentle poet who writes under willow trees.', musicalRiff: [523, 587, 659] },
  { id: 'c_nonso', name: 'Nonso', category: 'character', emoji: '👦🏾', themeColor: '#4f46e5', badgeBg: 'bg-indigo-100 text-indigo-900', description: 'Curious explorer charting new paths in the woods.', musicalRiff: [349, 440, 554] },
  { id: 'c_grandma_cecilia', name: 'Grandma Cecilia', category: 'character', emoji: '👵🏾', themeColor: '#ca8a04', badgeBg: 'bg-yellow-100 text-yellow-900', description: 'Gentle grandmother with a trunk full of warm blankets.', musicalRiff: [261, 330, 392] },
  { id: 'c_joseph', name: 'Joseph', category: 'character', emoji: '👨🏽', themeColor: '#16a34a', badgeBg: 'bg-green-100 text-green-900', description: 'Skilled carpenter who carves toy wooden trains.', musicalRiff: [293, 370, 440] },
  { id: 'c_simon', name: 'Simon', category: 'character', emoji: '👨🏻', themeColor: '#0891b2', badgeBg: 'bg-cyan-100 text-cyan-900', description: 'Deep sea diver observing colorful reef fish.', musicalRiff: [330, 392, 493] },
  { id: 'c_sunita', name: 'Sunita', category: 'character', emoji: '👩🏽', themeColor: '#9333ea', badgeBg: 'bg-purple-100 text-purple-900', description: 'Radiant dancer with gold bangles that chime.', musicalRiff: [554, 659, 830] },
  { id: 'c_segun', name: 'Segun', category: 'character', emoji: '👨🏾', themeColor: '#dc2626', badgeBg: 'bg-red-100 text-red-900', description: 'Brave pilot soaring across the sunset clouds.', musicalRiff: [392, 523, 659] },
  { id: 'c_funmi', name: 'Funmi', category: 'character', emoji: '👩🏾', themeColor: '#e11d48', badgeBg: 'bg-rose-100 text-rose-900', description: 'Warm teacher greeting every child with a smile.', musicalRiff: [440, 523, 622] },
  { id: 'c_paul', name: 'Paul', category: 'character', emoji: '👨🏼', themeColor: '#475569', badgeBg: 'bg-slate-200 text-slate-900', description: 'Bird watcher who knows every bird call by heart.', musicalRiff: [330, 440, 523] },
  { id: 'c_grandpa_john', name: 'Grandpa John', category: 'character', emoji: '👴🏼', themeColor: '#78350f', badgeBg: 'bg-amber-200 text-amber-950', description: 'Fisherman who navigates by the evening star.', musicalRiff: [220, 277, 330] },
  { id: 'c_jubril', name: 'Jubril', category: 'character', emoji: '👦🏾', themeColor: '#0284c7', badgeBg: 'bg-sky-100 text-sky-900', description: 'Young horse rider who can gallop like the wind.', musicalRiff: [370, 440, 554] },
  { id: 'c_aisha', name: 'Aisha', category: 'character', emoji: '👧🏽', themeColor: '#ec4899', badgeBg: 'bg-pink-100 text-pink-900', description: 'Cheery kite maker testing wings on breezy hills.', musicalRiff: [523, 659, 784] },
  { id: 'c_kabir', name: 'Kabir', category: 'character', emoji: '👦🏽', themeColor: '#10b981', badgeBg: 'bg-emerald-100 text-emerald-900', description: 'Drummer setting lively rhythms for village festivals.', musicalRiff: [392, 493, 587] },
  { id: 'c_abel', name: 'Abel', category: 'character', emoji: '👨🏿', themeColor: '#d97706', badgeBg: 'bg-amber-100 text-amber-900', description: 'Gardener growing the sweetest juicy oranges.', musicalRiff: [293, 370, 440] },
  { id: 'c_pat', name: 'Pat', category: 'character', emoji: '👩🏻', themeColor: '#6366f1', badgeBg: 'bg-indigo-100 text-indigo-900', description: 'Friendly veterinarian who heals forest critters.', musicalRiff: [493, 587, 740] },
];

export const FACES_ANIMALS: FacesCardItem[] = [
  { id: 'a_bull', name: 'Bull', category: 'animal', emoji: '🐂', themeColor: '#b45309', badgeBg: 'bg-amber-100 text-amber-950', description: 'Strong horned grazer standing proud in the pasture.', musicalRiff: [220, 261, 330] },
  { id: 'a_reindeer', name: 'Reindeer', category: 'animal', emoji: '🦌', themeColor: '#92400e', badgeBg: 'bg-amber-100 text-amber-900', description: 'Majestic antlered traveler of frosty tundras.', musicalRiff: [330, 415, 493] },
  { id: 'a_goat', name: 'Goat', category: 'animal', emoji: '🐐', themeColor: '#78716c', badgeBg: 'bg-stone-100 text-stone-900', description: 'Nimble mountain climber hopping across rocks.', musicalRiff: [440, 493, 554] },
  { id: 'a_zebra', name: 'Zebra', category: 'animal', emoji: '🦓', themeColor: '#18181b', badgeBg: 'bg-slate-200 text-slate-900', description: 'Striped beauty galloping across the sunlit savannah.', musicalRiff: [392, 523, 659] },
  { id: 'a_dog', name: 'Dog', category: 'animal', emoji: '🐕', themeColor: '#ea580c', badgeBg: 'bg-orange-100 text-orange-900', description: 'Loyal companion wagging its tail with pure delight.', musicalRiff: [440, 554, 659] },
  { id: 'a_horse', name: 'Horse', category: 'animal', emoji: '🐎', themeColor: '#854d0e', badgeBg: 'bg-yellow-100 text-yellow-950', description: 'Graceful stallion trotting across open grassy plains.', musicalRiff: [349, 440, 523] },
  { id: 'a_monkey', name: 'Monkey', category: 'animal', emoji: '🐒', themeColor: '#a16207', badgeBg: 'bg-yellow-100 text-yellow-900', description: 'Acrobatic climber swinging playfully through branches.', musicalRiff: [587, 698, 784] },
  { id: 'a_elephant', name: 'Elephant', category: 'animal', emoji: '🐘', themeColor: '#475569', badgeBg: 'bg-slate-200 text-slate-900', description: 'Gentle giant with a trumpeting trunk and big ears.', musicalRiff: [196, 246, 293] },
  { id: 'a_sheep', name: 'Sheep', category: 'animal', emoji: '🐑', themeColor: '#059669', badgeBg: 'bg-emerald-100 text-emerald-900', description: 'Fluffy woolly grazer resting quietly in the meadow.', musicalRiff: [392, 440, 493] },
  { id: 'a_tiger', name: 'Tiger', category: 'animal', emoji: '🐅', themeColor: '#ea580c', badgeBg: 'bg-orange-100 text-orange-950', description: 'Magnificent striped hunter prowling through bamboo.', musicalRiff: [293, 370, 440] },
  { id: 'a_chicken', name: 'Chicken', category: 'animal', emoji: '🐔', themeColor: '#dc2626', badgeBg: 'bg-red-100 text-red-900', description: 'Clucking morning alarm pecking seeds in the yard.', musicalRiff: [523, 587, 659] },
  { id: 'a_donkey', name: 'Donkey', category: 'animal', emoji: '🫏', themeColor: '#57534e', badgeBg: 'bg-stone-200 text-stone-900', description: 'Patient helper carrying heavy sacks up mountain trails.', musicalRiff: [261, 330, 392] },
  { id: 'a_tortoise', name: 'Tortoise', category: 'animal', emoji: '🐢', themeColor: '#15803d', badgeBg: 'bg-green-100 text-green-900', description: 'Wise slow-and-steady traveler protected by a shell.', musicalRiff: [220, 277, 330] },
  { id: 'a_snake', name: 'Snake', category: 'animal', emoji: '🐍', themeColor: '#047857', badgeBg: 'bg-emerald-100 text-emerald-900', description: 'Sleek serpentine whisperer gliding silently on sand.', musicalRiff: [440, 466, 493] },
  { id: 'a_cheetah', name: 'Cheetah', category: 'animal', emoji: '🐆', themeColor: '#d97706', badgeBg: 'bg-amber-100 text-amber-950', description: 'Lightning-fast sprinter chasing the desert breeze.', musicalRiff: [493, 622, 740] },
  { id: 'a_cow', name: 'Cow', category: 'animal', emoji: '🐄', themeColor: '#0284c7', badgeBg: 'bg-sky-100 text-sky-900', description: 'Gentle spotted friend providing delicious fresh milk.', musicalRiff: [261, 330, 392] },
  { id: 'a_rabbit', name: 'Rabbit', category: 'animal', emoji: '🐇', themeColor: '#ec4899', badgeBg: 'bg-pink-100 text-pink-900', description: 'Twitching-nosed hopper nibbling crunchy carrots.', musicalRiff: [587, 698, 880] },
];

export const FACES_OBJECTS: FacesCardItem[] = [
  { id: 'o_ball', name: 'Ball', category: 'object', emoji: '⚽', themeColor: '#18181b', badgeBg: 'bg-slate-100 text-slate-900', description: 'Bouncy leather sphere ready for the winning goal.', musicalRiff: [440, 523, 659] },
  { id: 'o_aeroplane', name: 'Aeroplane', category: 'object', emoji: '✈️', themeColor: '#0284c7', badgeBg: 'bg-sky-100 text-sky-900', description: 'Twin-winged sky cruiser soaring above white clouds.', musicalRiff: [349, 440, 523] },
  { id: 'o_scissors', name: 'Scissors', category: 'object', emoji: '✂️', themeColor: '#e11d48', badgeBg: 'bg-rose-100 text-rose-900', description: 'Sharp craft tool snip-snapping paper snowflakes.', musicalRiff: [587, 740, 880] },
  { id: 'o_cap', name: 'Cap', category: 'object', emoji: '🧢', themeColor: '#3b82f6', badgeBg: 'bg-blue-100 text-blue-900', description: 'Sporty sun hat shading eyes on hot sunny days.', musicalRiff: [440, 493, 587] },
  { id: 'o_book', name: 'Book', category: 'object', emoji: '📚', themeColor: '#8b5cf6', badgeBg: 'bg-purple-100 text-purple-900', description: 'Bound pages containing magical kingdoms and lore.', musicalRiff: [392, 493, 587] },
  { id: 'o_ship', name: 'Ship', category: 'object', emoji: '🚢', themeColor: '#0369a1', badgeBg: 'bg-sky-100 text-sky-900', description: 'Sturdy vessel gliding across stormy deep ocean waves.', musicalRiff: [261, 330, 392] },
  { id: 'o_bag', name: 'Bag', category: 'object', emoji: '🎒', themeColor: '#d97706', badgeBg: 'bg-amber-100 text-amber-900', description: 'Sturdy backpack holding snacks, books, and compasses.', musicalRiff: [330, 415, 493] },
  { id: 'o_car', name: 'Car', category: 'object', emoji: '🚗', themeColor: '#dc2626', badgeBg: 'bg-red-100 text-red-900', description: 'Red road cruiser zooming along highways.', musicalRiff: [392, 523, 659] },
  { id: 'o_oven', name: 'Oven', category: 'object', emoji: '🍳', themeColor: '#ea580c', badgeBg: 'bg-orange-100 text-orange-900', description: 'Warm kitchen stove baking fresh golden bread.', musicalRiff: [293, 370, 440] },
  { id: 'o_light_bulb', name: 'Light Bulb', category: 'object', emoji: '💡', themeColor: '#f59e0b', badgeBg: 'bg-amber-100 text-amber-950', description: 'Glowing glass orb lighting up a brilliant new idea.', musicalRiff: [659, 784, 987] },
  { id: 'o_shirt', name: 'Shirt', category: 'object', emoji: '👕', themeColor: '#10b981', badgeBg: 'bg-emerald-100 text-emerald-900', description: 'Freshly washed cotton tee ready for a sunny outing.', musicalRiff: [392, 440, 523] },
  { id: 'o_iron', name: 'Iron', category: 'object', emoji: '🥌', themeColor: '#64748b', badgeBg: 'bg-slate-200 text-slate-900', description: 'Smooth metal press keeping Sunday clothes crisp.', musicalRiff: [330, 392, 440] },
  { id: 'o_tv_remote', name: 'TV Remote', category: 'object', emoji: '📺', themeColor: '#334155', badgeBg: 'bg-slate-200 text-slate-900', description: 'Clicky handheld wand that switches channels in a flash.', musicalRiff: [440, 523, 587] },
  { id: 'o_phone', name: 'Phone', category: 'object', emoji: '📱', themeColor: '#6366f1', badgeBg: 'bg-indigo-100 text-indigo-900', description: 'Pocket communicator ringing to hear a friend\'s voice.', musicalRiff: [587, 698, 880] },
  { id: 'o_television', name: 'Television', category: 'object', emoji: '🖥️', themeColor: '#0f172a', badgeBg: 'bg-slate-200 text-slate-900', description: 'Glowing screen showing favorite cartoons and wildlife.', musicalRiff: [349, 440, 523] },
  { id: 'o_bottle', name: 'Bottle', category: 'object', emoji: '🍾', themeColor: '#06b6d4', badgeBg: 'bg-cyan-100 text-cyan-900', description: 'Cool water canteen refreshing hikers on long walks.', musicalRiff: [493, 587, 659] },
  { id: 'o_chair', name: 'Chair', category: 'object', emoji: '🪑', themeColor: '#78350f', badgeBg: 'bg-amber-100 text-amber-900', description: 'Cozy wooden seat for reading books beside the fire.', musicalRiff: [293, 349, 440] },
  { id: 'o_pot', name: 'Pot', category: 'object', emoji: '🍲', themeColor: '#b91c1c', badgeBg: 'bg-red-100 text-red-900', description: 'Steaming clay vessel simmering savory vegetable stew.', musicalRiff: [261, 330, 392] },
];

export const ALL_FACES_DECK: FacesCardItem[] = [
  ...FACES_CHARACTERS,
  ...FACES_ANIMALS,
  ...FACES_OBJECTS,
];

import { speakChildQuestion } from '../utils/voiceService';

/**
 * Text-to-Speech synthesizer for card names & questions using age-matched child voice.
 * Essential for pre-readers (ages 3-4) and auditory recall games.
 */
export function speakCardName(text: string, onEnd?: () => void, age: number = 6): void {
  speakChildQuestion(text, age, undefined, { force: true, onEnd });
}

/**
 * Play a synthesized musical riff for a card using Web Audio API (for Game 11: Who Sang What?)
 */
export function playCardRiff(frequencies: number[]): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.3, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.28);
    });
  } catch {
    // Ignore audio context autoplay limitations
  }
}
