import * as ex from 'excalibur';
import { Configuration } from './Configuration';
import { Resources } from './Resources';
import GameplayScene from './GameplayScene';
import { SequenceCatalog } from './actionSystem/SequenceData';
import { Executor } from './actionSystem/Executor';

const Config: Configuration = require('../configuration/main.yml');

const Game = new ex.Engine({
  canvasElementId: 'game-area',
  backgroundColor: ex.Color.Black,
});

Resources.initialise(Config.resources);
const Loader = new ex.Loader();
for (let resource of Resources.getSingleton().textures) {
  Loader.addResource(resource);
}

for (let resource of Resources.getSingleton().tilemaps) {
  Loader.addResource(resource);
}

// Initialise the action system with configured sequences.
Executor.initialise(Game, require('../sequences/main.yml'));

Game.start(Loader).then(() => {
  // Load all scenes (game modes).
  let gameplayScene = new GameplayScene(Config);
  Game.addScene(GameplayScene.Name, gameplayScene);

  // Go to initial game mode.
  Game.goToScene(GameplayScene.Name);
});
