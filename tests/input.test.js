import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { WordGame } from '../dist/engine.js';

function setup() {
  class Element {
    constructor() {
      this.children = []; this.handlers = {}; this.attributes = {}; this.hidden = true;
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    append(child) { child.parentElement = this; this.children.push(child); }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(event, callback) { this.handlers[event] = callback; }
    focus() {}
    click() { if (!this.disabled) return this.handlers.click(); }
  }
  const elements = Object.fromEntries(['board', 'keyboard', 'message', 'again', 'attempt'].map(id => [id, new Element()]));
  elements.message.parentElement = new Element();
  const handlers = {};
  const context = vm.createContext({ WordGame, window: { matchMedia: () => ({ matches: true }) }, setTimeout,
    document: { querySelector: selector => elements[selector.slice(1)], createElement: () => new Element(), addEventListener: (name, fn) => { handlers[name] = fn; } }
  });
  vm.runInContext(readFileSync(new URL('../dist/script.js', import.meta.url), 'utf8').replace("import { WordGame } from './engine.js';", '') + '\nthis.testGame=game; this.testKeys=keys;', context);
  return { elements, context, handlers };
}
test('physical and on-screen keyboards produce the same win and reset', async () => {
  for (const mode of ['physical', 'screen']) {
    const { elements, context, handlers } = setup();
    for (const key of ['D', 'U', 'M', 'M', 'Y', 'Enter']) {
      if (mode === 'screen') await context.testKeys.get(key).click();
      else handlers.keydown({ key, preventDefault() {} });
    }
    assert.equal(context.testGame.state, 'won');
    assert.equal(elements.message.textContent, "That's impossible. Who told you?");
    assert([...context.testKeys.values()].every(key => key.disabled));
    assert.equal(elements.again.hidden, false);
    elements.again.click();
    assert.equal(context.testGame.state, 'playing');
    assert.equal(elements.board.children.length, 6);
    assert(elements.board.children.every(row => row.children.every(tile => tile.textContent === '')));
    assert([...context.testKeys.values()].every(key => !key.disabled));
  }
});
