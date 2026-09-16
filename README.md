# Wordle for Dummies

A static five-letter word game with six attempts and one permanent answer: DUMMY.

Run `npm start` to preview at http://localhost:8071. Run `npm test` to test scoring and game outcomes. No package installation is needed. The ES module scripts require an HTTP server rather than opening index.html directly.

Guesses must be in the bundled 14,855-word list. Invalid words stay editable and do not consume an attempt. The list comes from https://github.com/tabatkins/wordle-list; its MIT license is included in dist/WORD-LIST-LICENSE.txt. No network request is needed to validate a guess. Repeated-letter feedback uses exact matches first, then the remaining letter counts. Both keyboards share the same input handler. Input locks during reveals and after a win/loss. Play Again resets the game without changing the answer.

The GitHub Pages workflow tests and publishes `dist/` when main changes. Enable GitHub Actions in repository Settings → Pages for first deployment. Dashboard integration follows verification of the live URL.
