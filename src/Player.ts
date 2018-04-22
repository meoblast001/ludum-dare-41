import * as ex from 'excalibur';
import { GridProvider, Direction, GridActor } from './GridActor';
import GameplayScene from './GameplayScene';
import { Executor } from './actionSystem/Executor';

export class Player extends GridActor {
  public constructor(
    private gameplayScene: GameplayScene,
    unitSize: number,
    gridProvider: GridProvider,
    config?: ex.IActorArgs
  ) {
    super(unitSize, gridProvider, config);
  }

  public update(engine: ex.Engine, delta: number) {
    super.update(engine, delta);

    if (engine.input.keyboard.wasReleased(ex.Input.Keys.F)) {
      let friend
        = this.gameplayScene.getActorByName(GameplayScene.FriendActorName);
      if (friend) {
        friend.executeDefaultSequence();
      } else {
        console.error("Friend does not exist in scene.");
      }
    }

    if (!Executor.getSingleton().isBlocked) {
      if (engine.input.keyboard.isHeld(ex.Input.Keys.Left)) {
        this.moveOnce(Direction.Left);
      }
      else if (engine.input.keyboard.isHeld(ex.Input.Keys.Up)) {
        this.moveOnce(Direction.Up);
      }
      else if (engine.input.keyboard.isHeld(ex.Input.Keys.Right)) {
        this.moveOnce(Direction.Right);
      }
      else if (engine.input.keyboard.isHeld(ex.Input.Keys.Down)) {
        this.moveOnce(Direction.Down);
      }
    }
  }
}
