import * as ex from 'excalibur';
import * as Config from './Configuration';
import { Resources } from './Resources';
import { ResponsiveActor } from './ResponsiveActor';
import {TextWindow} from './TextWindow';

export default class GameplayScene extends ex.Scene {
  public static readonly Name = "GameplayScene";

  public constructor(private config: Config.Configuration, engine?: ex.Engine) {
    super(engine)
  }

  public onInitialize(engine: ex.Engine) {
    this.camera = new ex.BaseCamera();

    var str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    let win = new TextWindow(engine, () => {}, str, undefined, ex.Color.Blue);
    this.add(win);

    this.configure(this.config);
  }

  public onActivate() { }

  public onDeactivate() { }

  private configure(config: Config.Configuration) {
    this.addPlayer(config.player);
    for (let actorConfig of config.actors) {
      this.addActor(actorConfig);
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
    let actor = new ResponsiveActor(config.name, config.defaultSeq, [[]]);
    this.positionActor(actor, config);

    let texture = this.loadTexture(config);
    if (texture) {
      actor.addDrawing(texture);
    }

    // TODO: Load sprite.

    this.add(actor);
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
