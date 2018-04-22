import * as ex from 'excalibur';
import * as Config from './Configuration';
import { Resources } from './Resources';
import { Player } from './Player';
import { ResponsiveActor } from './ResponsiveActor';
import {TextWindow} from './TextWindow';
import { ExecutionWorld, ExecutionActor, Executor }
  from './actionSystem/Executor';
import { GridProvider, GridActor } from './GridActor';

export default class GameplayScene extends ex.Scene
  implements ExecutionWorld, GridProvider
{
  public static readonly Name = "GameplayScene";
  public static readonly FriendActorName = "friend";

  private namedActors: { [name: string]: ResponsiveActor } = {};
  private gridUnitSize: number = 0;
  private worldSize: ex.Vector = new ex.Vector(0, 0);

  public constructor(private config: Config.Configuration, engine?: ex.Engine) {
    super(engine)
  }

  public onInitialize(engine: ex.Engine) {
    this.camera = new ex.BaseCamera();
    this.configure(this.config);
    Executor.getSingleton().changeWorld(this);

    let friend = this.getActorByName(GameplayScene.FriendActorName);
    if (friend) {
      let action = Executor.getSingleton()
        .beginAction(friend, this.config.startSeq);
      if (action) {
        action.run();
      } else {
        console.error(`Start action "${this.config.startSeq}" does not exist.`)
      }
    } else {
      console.error("There is no friend in the scene.");
    }
  }

  public onActivate() { }

  public onDeactivate() { }

  public getActorByName(name: string): ResponsiveActor | null {
    if (name in this.namedActors) {
      return this.namedActors[name];
    }
    return null;
  }

  public getExecutionActors(): ExecutionActor[] {
    return Object.keys(this.namedActors).map(key => this.namedActors[key]);
  }

  public getGridSize(): [number, number] {
    return [this.worldSize.x, this.worldSize.y];
  }

  public getGrid(): boolean[][] {
    // Create an array of size Y filled with arrays of size X filled with false.
    let grid = (new Array(this.worldSize.y)).fill(null)
      .map(x => (new Array(this.worldSize.x)).fill(false));

    for (let actor of this.actors) {
      if (actor instanceof GridActor) {
        let position = actor.gridPosition;
        grid[position.y][position.x] = true;
      }
    }

    return grid;
  }

  private configure(config: Config.Configuration) {
    this.gridUnitSize = config.gridUnitSize;
    this.worldSize = new ex.Vector(config.worldSize[0], config.worldSize[1]);
    this.addPlayer(config.player);
    for (let actorConfig of config.actors) {
      this.addActor(actorConfig);
    }
  }

  private addPlayer(config: Config.Player) {
    let player = new Player(this, this.gridUnitSize, this);
    this.positionActor(player, config);

    let texture = this.loadTexture(config);
    if (texture) {
      player.addDrawing(texture);
    }

    // TODO: Load sprite.

    this.add(player);
  }

  private addActor(config: Config.Actor) {
    let actor = new ResponsiveActor(config.name, config.defaultSeq,
      this.gridUnitSize, this);
    this.positionActor(actor, config);

    let texture = this.loadTexture(config);
    if (texture) {
      actor.addDrawing(texture);
    }

    // TODO: Load sprite.

    this.add(actor);
    this.namedActors[config.name] = actor;
  }

  private positionActor(actor: GridActor, config: Config.Positioned) {
    actor.gridPosition = new ex.Vector(config.position[0], config.position[1]);
  }

  private loadTexture(config: Config.Textureable): ex.Texture | null {
    if (config.texture) {
      return Resources.getSingleton().getTexture(config.texture);
    }
    return null;
  }
}
