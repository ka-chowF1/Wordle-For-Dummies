import { WordGame } from './engine.js';
const game = new WordGame();
const board = document.querySelector('#board');
const keyboard = document.querySelector('#keyboard');
const message = document.querySelector('#message');
const again = document.querySelector('#again');
const attempt = document.querySelector('#attempt');
let revealing = false;
const rows = [];
const keys = new Map();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
for (let r = 0; r < 6; r++) {
  const row = document.createElement('div');
  row.className = 'row'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', `Guess ${r + 1}`);
  for (let c = 0; c < 5; c++) {
    const tile = document.createElement('span'); tile.className = 'tile'; tile.setAttribute('aria-label', 'Empty'); row.append(tile);
  }
  board.append(row); rows.push(row);
}
for (const letters of ['QWERTYUIOP', 'ASDFGHJKL', ['Enter', ...'ZXCVBNM', 'Backspace']]) {
  const row = document.createElement('div'); row.className = 'key-row';
  for (const letter of letters) {
    const key = document.createElement('button'); key.type = 'button';
    key.className = letter.length > 1 ? 'key wide' : 'key'; key.textContent = letter === 'Backspace' ? '⌫' : letter.toUpperCase();
    key.setAttribute('aria-label', letter === 'Backspace' ? 'Delete last letter' : letter);
    key.addEventListener('click', () => input(letter)); row.append(key); keys.set(letter, key);
  }
  keyboard.append(row);
}
function setLocked(locked) {
  keys.forEach(key => { key.disabled = locked; });
  keyboard.classList.toggle('locked', locked);
}
function paintEntry() {
  if (game.state !== 'playing') return;
  [...rows[game.guesses.length].children].forEach((tile, i) => {
    tile.textContent = game.entry[i] || ''; tile.className = game.entry[i] ? 'tile filled' : 'tile';
    tile.setAttribute('aria-label', game.entry[i] || 'Empty');
  });
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function input(key) {
  if (revealing || game.state !== 'playing') return;
  if (key !== 'Enter') { game.type(key); paintEntry(); return; }
  const rowIndex = game.guesses.length;
  const outcome = game.submit();
  if (outcome.error) {
    message.textContent = outcome.error;
    const row = rows[rowIndex]; row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); return;
  }
  revealing = true; setLocked(true); message.textContent = 'Let’s see about that…';
  const spoken = { correct: 'correct position', present: 'wrong position', absent: 'not in the word' };
  for (let i = 0; i < 5; i++) {
    if (!reducedMotion.matches) await wait(300);
    const tile = rows[rowIndex].children[i];
    tile.className = `tile ${outcome.marks[i]} reveal`;
    tile.setAttribute('aria-label', `${outcome.word[i]}: ${spoken[outcome.marks[i]]}`);
  }
  if (!reducedMotion.matches) await wait(450);
  Object.entries(game.keys).forEach(([letter, status]) => {
    keys.get(letter).className = `key ${status}`;
    keys.get(letter).setAttribute('aria-label', `${letter}: ${spoken[status]}`);
  });
  revealing = false;
  if (game.state === 'playing') {
    attempt.textContent = `${String(game.guesses.length + 1).padStart(2, '0')} / 06`;
    message.textContent = '';
    setLocked(false);
  } else {
    attempt.textContent = `${String(game.guesses.length).padStart(2, '0')} / 06`;
    message.textContent = game.message;
    message.parentElement.classList.add('finished'); again.hidden = false; again.focus();
  }
}
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  if (event.key === 'Enter' && event.target === again) return;
  if (/^[a-z]$/i.test(event.key) || ['Enter', 'Backspace'].includes(event.key)) {
    event.preventDefault(); input(event.key === 'Enter' || event.key === 'Backspace' ? event.key : event.key.toUpperCase());
  }
});
again.addEventListener('click', () => {
  game.reset(); revealing = false;
  rows.forEach(row => { row.classList.remove('shake'); [...row.children].forEach(tile => { tile.textContent = ''; tile.className = 'tile'; tile.setAttribute('aria-label', 'Empty'); }); });
  keys.forEach((key, letter) => { key.className = letter.length > 1 ? 'key wide' : 'key'; key.setAttribute('aria-label', letter === 'Backspace' ? 'Delete last letter' : letter); });
  message.parentElement.classList.remove('finished'); message.textContent = 'Type five letters, then press Enter.';
  again.hidden = true; attempt.textContent = '01 / 06'; setLocked(false); keys.get('Q').focus();
});
