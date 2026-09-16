import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WordGame, scoreGuess, ANSWER, TAUNTS } from '../dist/engine.js';
function guess(game, word) { for (const key of word) game.type(key); return game.submit(); }
test('exact matches take priority and repeated letters never overcount', () => {
  assert.deepEqual(scoreGuess('MAMMA'), ['absent', 'absent', 'correct', 'correct', 'absent']);
  assert.deepEqual(scoreGuess('MUMMY'), ['absent', 'correct', 'correct', 'correct', 'correct']);
  assert.deepEqual(scoreGuess('MADAM'), ['present', 'absent', 'present', 'absent', 'present']);
  assert.deepEqual(scoreGuess('DDDDD'), ['correct', 'absent', 'absent', 'absent', 'absent']);
});
test('win and matching taunt work at all six attempts, locking further input', () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const game = new WordGame();
    for (let i = 1; i < attempt; i++) guess(game, 'STONE');
    const result = guess(game, 'dummy');
    assert.equal(result.state, 'won'); assert.equal(result.message, TAUNTS[attempt - 1]);
    game.type('A'); assert.equal(game.entry, ''); assert(game.submit().error); assert.equal(game.guesses.length, attempt);
  }
});
test('six failures reveal answer and reset starts clean with the same answer', () => {
  const game = new WordGame(); for (let i = 0; i < 6; i++) guess(game, 'STONE');
  assert.equal(game.state, 'lost'); assert(game.message.includes(ANSWER));
  game.type('X'); assert.equal(game.entry, ''); assert(game.submit().error);
  game.reset(); assert.equal(game.guesses.length, 0); assert.deepEqual(game.keys, {}); assert.equal(game.state, 'playing');
  assert.equal(guess(game, 'DUMMY').state, 'won');
});
test('invalid input does not spend guesses and backspace works', () => {
  const game = new WordGame(); game.type('7'); game.type('é'); game.type('ArrowLeft'); assert.equal(game.entry, '');
  game.type('a'); assert(game.submit().error); assert.equal(game.guesses.length, 0);
  game.type('Backspace'); assert.equal(game.entry, '');
  for (const key of 'abcdefg') game.type(key); assert.equal(game.entry, 'ABCDE');
});
test('keyboard status never downgrades', () => {
  const game = new WordGame(); guess(game, 'MAMMA'); assert.equal(game.keys.M, 'correct');
  guess(game, 'MATES'); assert.equal(game.keys.M, 'correct');
});
test('nonsense is rejected without consuming a guess or changing feedback', () => {
  const game = new WordGame();
  const result = guess(game, 'QZXQZ');
  assert.match(result.error, /word list/);
  assert.equal(game.guesses.length, 0);
  assert.deepEqual(game.keys, {});
  assert.equal(game.entry, 'QZXQZ');
  for (let i = 0; i < 5; i++) game.type('Backspace');
  assert.equal(guess(game, 'DUMMY').state, 'won');
  assert.equal(game.guesses.length, 1);
});
test('invalid guesses on the last attempt leave that attempt available', () => {
  const game = new WordGame();
  for (let i = 0; i < 5; i++) guess(game, 'STONE');
  assert(guess(game, 'ZZZZZ').error);
  assert.equal(game.state, 'playing'); assert.equal(game.guesses.length, 5);
  for (let i = 0; i < 5; i++) game.type('Backspace');
  assert.equal(guess(game, 'DUMMY').state, 'won');
});
