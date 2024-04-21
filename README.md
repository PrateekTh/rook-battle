# Rook's Move

This project aims to create a simple multiplayer Chess game, as specified in the Game Assignment provided by Cuemath, at [this link](https://cuemath.notion.site/Game-Assignment-Rook-s-Move-ef5d792e3e114317ad6b8805d4fa4328?pvs=4).

The teck stack used is:

- Phaser 3 (JS Web Game Engine)
- Socket.IO (Multiplyer Support)
- Express.JS (Backend)

![rooks_move](https://github.com/PrateekTh/rook-battle/assets/57175545/d002a471-85ad-4902-b45a-9b9b3e2138e8)

Here, I will go through all the various aspects of the project:

## Reproducing and Dependency setup

In order to test out the code, and run the game on your machine, follow the following steps:

1. Clone this GitHub Repository.
2. Install `node.js` (Required)
3. Traverse to the repo location via a terminal, and run the following in order:

   - `npm i `
   - `cd .\client\`
   - `npm i`

   This will ensure that all the dependencies are resolved, on both the client and the server end.

4. Now, two terminals will be required, one for the serve-side, and the other as a development server for the client-side.
   - **Server**: Traverse to the repository directory, and run `npm run start`
   - **Client**: Traverse to the repository directory, and run `cd.\client\`, and then start the development server using `npm run dev`

The server has been configured to listen at `Port: 3000`. Open up two(or more) tabs on the client's address (as launched by `npm run dev`) to join the game.

## Mechanics

### The rules of the game are pretty straightforward:

- The game is played on an `8x8` chessboard.
- There are two players (or more; expanded further), who take turns to move the rook. Rooks starts from the top right square.
- **On each turn, a player can move the rook any number of steps to the left or down, but not up, right or diagonally.**
- The player who reaches the bottom-left corner of the board first wins the game.

## Components:

### Server:

The server handles and manages all incoming sockets and their requests. The key events include (emitted by clients):

- `ValidMove`
- `connect`
- `disconnect`

### Client:

Each client has multiple of Socket Handling features as well as the Phaser Implementations. The key Socket based events include
(emitted by the server):

- `setRookPosition`
- `connect`
- `gameover`
- `turn`
- `timeout`
- `win`
- `roomFull`

There are also several client functions, which enable the main game execution. These contain Phaser's structural components, and many custom functions. The key functions include:

- Scene -> `constructor` [Phaser]
- `preload` [Phaser]
- `create` [Phaser]
- `calculateCoordinates`
- `handleTileClick`
- `updateAllTiles`
- `createBoard`
- `tweenSpriteTo`
- A list of UIHandler functions for text, handled separately in `UIHandler.js`

## Features

1. **Multiplayer Functionality**

   - Two or more players can play the game.
   - Additional players, greater than the room size become spectators.
   - This implementation uses a client-server architecture, built via `Socket.io`.

   ```
   Implementation:

   The server contains a connectedSockets array, which maintains a list of connected sockets.

   Whenever it recieves a valid move from a socket, it checks for the turn, and emits it to all users.

   On the client end, various socket handling methods have been setup, and they handle sending valid moves, as well as recieveing server messages.

   ```

2. **Timer**

   - Each player has 30 seconds to make their move.
   - The UI for the timer is a horizontal bar, which is on both the player's screen for the first turn, and then only on the player with the current turn, after that.
   - If a player does not make a move within the allocated time, the game is over, and a few moments after that the client is reloaded.

   ```
   Implementation:

   The server maintains the timer mainly, via a timerID object, which is initialised on the first move made, by a player.

   Whenever the server recieves a valid move from a socket, it resets the time out. In case the time reaches zero, it emits a suitable message to all clients, and restarts the game (could be set to disconnect as well)

   On the client end, the timer UI is handled and is shown as a horizontal bar.

   ```

3. **Spectators and Multiple Players**

   - There is also an added support to handle additional sockets, apart from the players.
   - While I could have just limited the room, and stopped further connections, I decided to try to make the experience more seamless, and add spectator support.
   - The `roomsize` variable can be adjusted on the server, to allow gameplay between the desired number of players.
   - Whenever a player enters after the room is full, they are sent a message that they are a spectator, and they cannot make moves, but see the game that is being played by the two main players.

   ```
   Implementation:

   The server contains the room size variable, which adjusts the turn reset loop accordingly, to allow for turns of all players, irrespective of number. Also, the handling of the connectedSockets array, and modifications on the entry/exit of each socket has been written specifically to allow for this feature.

   On the client end, the UI is the same, and they need to wait for their turn (It may be modified to inform whose turn it is).

   ```

4. **Animations and Visuals**

   - There are a few animations added in this project, though there is always room for more animation:

     - Valid Tile Animation (custom)
     - Rook Movement Animation (custom Tween function)
     - Message Text Animation (Tween)
     - Player Avatar Rotation (update function)
     - Timer Bar Progress (update function)

   - Also, a few extra UI features have been added:
     - Game Heading text
     - Turn based text notifications
     - Custom open-source fonts (via Google Fonts)

## Results

⇓ Here is a clip of two players, playing the Rook's Move


https://github.com/PrateekTh/rook-battle/assets/57175545/2e0d6e09-c2e9-4a9c-a7b5-42afb9ca2063


⇓ Here is a clip of three players


https://github.com/PrateekTh/rook-battle/assets/57175545/aabe2164-a8f2-4b15-b5af-b09c93b6346e


⇓ Spectator in a 2 player room
![spectate](https://github.com/PrateekTh/rook-battle/assets/57175545/67d022a5-431a-4cec-aa29-1f590724d41f)


This project was quite fun to make!
I must admit, I hadn't used Phaser or Sockets before this, but by now all this game making has given me a quite a bit more control on these technologies, and I think I can apply more and more Game Design concepts, with increasing time. I already have a lot of features in mind, but given the time frame, I think this would suffice.

Still, my self-motivated tendencies won't let me rest, so I would like to enunmmerate improvements, that can be added in the current build of Rook's Move:

- Better Animations
- Modular Code, with especially socketHandling seperated to a particular Handler (Similar to UI)
- More game mechanics:
  - Collaborative mode, where the tile generation is random or customised (or follows a particular function), and the objective is to get to that point, without communication. Everyone wins!
  - Changing the Valid moves for the chess piece, or even a Custom Mode, where we give players the support to write custom rules, and then share them with their friends as a challenge. This open a lot of avenues on how interesting the rules could be, but I believe nothing can be wilder than already existing chess Knights.
  - Truly endless possibilities, and for further discussion the target audience and use cases become necessary.
- Utilisation of more features of the Phaser library / game engine.
