import * as ex from 'excalibur';
import Resources from './Resources';
import GameplayScene from './GameplayScene';
import { SequenceCatalog } from './actionSystem/SequenceData';
import { Executor } from './actionSystem/Executor';

const Game = new ex.Engine({
  canvasElementId: 'game-area',
  backgroundColor: ex.Color.Black,
});

const Loader = new ex.Loader();
for (let resource in Resources) {
  Loader.addResource(Resources[resource]);
}

// Initialise the action system with configured sequences.
Executor.initialise(require('../sequences/main.yml'));

Game.start(Loader).then(() => {
  // Load all scenes (game modes).
  Game.addScene(GameplayScene.Name, new GameplayScene());

  // Go to initial game mode.
  Game.goToScene(GameplayScene.Name);
});
