import * as ex from 'excalibur';
import * as Config from './Configuration';
import { Resources } from './Resources';
import { ResponsiveActor } from './ResponsiveActor';
import {TextWindow} from './TextWindow';
import { Executor } from './actionSystem/Executor';

export default class GameplayScene extends ex.Scene {
  public static readonly Name = "GameplayScene";
  public static readonly FriendActorName = "friend";

  private namedActors: { [name: string]: ResponsiveActor } = {};

  public constructor(private config: Config.Configuration, engine?: ex.Engine) {
    super(engine)
  }

  public onInitialize(engine: ex.Engine) {
    this.camera = new ex.BaseCamera();
    this.configure(this.config);
  }

  public onActivate() { }

  public onDeactivate() { }

  public getActorByName(name: string): ResponsiveActor | null {
    if (name in this.namedActors) {
      return this.namedActors[name];
    }
    return null;
  }

  private configure(config: Config.Configuration) {
    this.addPlayer(config.player);
    for (let actorConfig of config.actors) {
      this.addActor(actorConfig);
    }

    let friend = this.getActorByName(GameplayScene.FriendActorName);
    if (friend) {
      Executor.getSingleton().beginAction(friend, config.startSeq);
    } else {
      console.error("There is no friend in the scene.");
    }
  }

  private addPlayer(config: Config.Player) {
    let player = new ex.Actor();
    this.positionActor(player, config);

    let texture = this.loadTexture(config);
    if (texture) {
      player.addDrawing(texture);
    }

    // TODO: Load sprite.

    this.add(player);
  }

  private addActor(config: Config.Actor) {
    let actor = new ResponsiveActor(config.name, config.defaultSeq);
    this.positionActor(actor, config);

    let texture = this.loadTexture(config);
    if (texture) {
      actor.addDrawing(texture);
    }

    // TODO: Load sprite.

    this.add(actor);
    this.namedActors[config.name] = actor;
  }

  private positionActor(actor: ex.Actor, config: Config.Positioned) {
    actor.pos.x = config.position[0];
    actor.pos.y = config.position[1];
  }

  private loadTexture(config: Config.Textureable): ex.Texture | null {
    if (config.texture) {
      return Resources.getSingleton().getTexture(config.texture);
    }
    return null;
  }
}
