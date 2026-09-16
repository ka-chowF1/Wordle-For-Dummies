import { VALID_WORDS } from './words.js';
export const ANSWER = 'DUMMY';
export const TAUNTS = [
  "That's impossible. Who told you?",
  'Lucky guess. Suspiciously lucky.',
  'Three tries. Your alibi checks out. Barely.',
  'Nice! Only took you a small eternity.',
  'An impressive commitment to the wrong answers.',
  'Phew. Cutting it close, dummy.'
];

export function scoreGuess(guess, answer = ANSWER) {
  const marks = Array(5).fill('absent');
  const remaining = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) marks[i] = 'correct';
    else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] !== 'correct' && remaining[guess[i]] > 0) {
      marks[i] = 'present';
      remaining[guess[i]]--;
    }
  }
  return marks;
}

export class WordGame {
  constructor() { this.reset(); }
  reset() { this.guesses = []; this.entry = ''; this.keys = {}; this.state = 'playing'; this.message = ''; }
  type(key) {
    if (this.state !== 'playing') return;
    if (key === 'Backspace') this.entry = this.entry.slice(0, -1);
    else if (/^[a-z]$/i.test(key) && this.entry.length < 5) this.entry += key.toUpperCase();
  }
  submit() {
    if (this.state !== 'playing') return { error: 'This round is over.' };
    if (this.entry.length !== 5) return { error: 'Five letters, please. You can do this.' };
    if (!VALID_WORDS.has(this.entry)) return { error: 'Not in the word list. Try a real word—this attempt is still yours.' };
    const word = this.entry;
    const marks = scoreGuess(word);
    this.guesses.push({ word, marks });
    const ranks = { absent: 1, present: 2, correct: 3 };
    [...word].forEach((letter, i) => {
      if ((ranks[this.keys[letter]] || 0) < ranks[marks[i]]) this.keys[letter] = marks[i];
    });
    this.entry = '';
    if (word === ANSWER) { this.state = 'won'; this.message = TAUNTS[this.guesses.length - 1]; }
    else if (this.guesses.length === 6) { this.state = 'lost'; this.message = 'The word was DUMMY. Fitting.'; }
    return { word, marks, state: this.state, message: this.message };
  }
}
