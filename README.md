# Tetris Game

This repository contains a classic Tetris game built with HTML, CSS, and JavaScript. The game features traditional gameplay mechanics with added enhancements such as dynamic level progression and increased difficulty.

## Features

- **Basic Gameplay:**
  - Control tetrominoes using arrow keys to move left, right, or down and rotate pieces.
  - Merging tetrominoes into the board when they reach the bottom or collide with other pieces.

- **Level Progression:**
  - Advance through multiple levels as you score points.
  - The required points to advance to the next level double with each new level (e.g., 1000 points for Level 1, 2000 for Level 2).

- **Speed and Difficulty:**
  - Falling speed of tetrominoes increases with each level, making the game progressively more challenging.
  - Speed is adjusted by reducing the drop interval as the level increases.

- **Dynamic Information Display:**
  - Real-time display of current score, level, and points required for the next level.
  - Score is reset at the start of each level but overall progress is maintained.

- **Board Management:**
  - Board is cleared when transitioning to a new level, providing a fresh start with each level.

- **Game Over:**
  - The game restarts if a new tetromino cannot be placed on the board, resetting progress to initial conditions.

## Technologies Used

- **HTML:** Structuring the game layout and displaying information.
- **CSS:** Styling the game elements and interface.
- **JavaScript:** Handling game logic, tetromino movement, level management, and updating the display.

## Installation

To run the game locally, clone this repository and open the `index.html` file in a web browser:

```bash
git clone https://github.com/Wertoquri/TetrisJS.git
cd TetrisJs
open index.html
