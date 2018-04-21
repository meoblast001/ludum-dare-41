import * as ex from 'excalibur';
import GameplayScene from './GameplayScene';

export class Player extends ex.Actor {
  private gameplayScene: GameplayScene = undefined;

  public constructor() {
    super();
  }

  public onInitialize(engine: ex.Engine) {
    this.gameplayScene = this.scene as GameplayScene;
  }

  public update(engine: ex.Engine, delta: number) {
    if (engine.input.keyboard.wasReleased(ex.Input.Keys.F)) {
      let friend = this.gameplayScene
        .getActorByName(GameplayScene.FriendActorName);
      if (friend) {
        friend.executeDefaultSequence();
      } else {
        console.error("Friend does not exist in scene.");
      }
    }
  }
}
