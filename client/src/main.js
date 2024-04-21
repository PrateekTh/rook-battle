import { Game } from './scenes/Game';

//  Documentation: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024, // Canvas width
    height: 1024,// Canvas height
    parent: 'game-container',
    backgroundColor: '#010101',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Game,
    ]
};

export default new Phaser.Game(config);