import * as ex from 'excalibur';
import * as Config from './Configuration';
import { Resources } from './Resources';
import { Player } from './Player';
import { ResponsiveActor } from './ResponsiveActor';
import {TextWindow} from './TextWindow';
import { ExecutionWorld, ExecutionActor, Executor }
  from './actionSystem/Executor';

export default class GameplayScene extends ex.Scene implements ExecutionWorld {
  public static readonly Name = "GameplayScene";
  public static readonly FriendActorName = "friend";

  private namedActors: { [name: string]: ResponsiveActor } = {};
  private tileMap: ex.TileMap;

  public constructor(private config: Config.Configuration, engine?: ex.Engine) {
    super(engine)
    this.tileMap = new ex.TileMap(
      0,
      0,
      config.map.tileWidth,
      config.map.tileHeight,
      config.map.width / config.map.tileWidth,
      config.map.height / config.map.tileHeight
    );
    // Current version of Excalibur doesn't set these values in the constructor.
    this.tileMap.x = 0;
    this.tileMap.y = 0;
    this.tileMap.cellWidth = config.map.tileWidth;
    this.tileMap.cellHeight = config.map.tileHeight;
    this.tileMap.rows = config.map.width / config.map.tileWidth;
    this.tileMap.cols = config.map.height / config.map.tileHeight;
  }

  public onInitialize(engine: ex.Engine) {
    this.camera = new ex.BaseCamera();

    this.configure(this.config);
    Executor.getSingleton().changeWorld(this);

    this.addTileMap(this.tileMap);

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

  private configure(config: Config.Configuration) {
    this.addPlayer(config.player);
    for (let actorConfig of config.actors) {
      this.addActor(actorConfig);
    }

    // build sprite sheets
    this.config.map.tileSheets.forEach(sheet => {
      let item = Resources.getSingleton().getTilemap(sheet.path)
      if (item) {
        this.tileMap.registerSpriteSheet(
          sheet.id.toString(),
          new ex.SpriteSheet(
            item,
            sheet.cols,
            sheet.rows,
            this.config.map.tileWidth,
            this.config.map.tileHeight
          )
        );
      } else {
        console.error(`no tilemap ${sheet.path} found!`);
      }
    });
    // fill cells with sprites
    this.config.map.cells.forEach(cell => {
      let ts = new ex.TileSprite(cell.sheetId.toString(), cell.tileId);
      this.tileMap.getCell(cell.x, cell.y).pushSprite(ts);
    });
  }

  private addPlayer(config: Config.Player) {
    let player = new Player(this);
    this.positionActor(player, config);

    let texture = this.loadTexture(config);
    if (texture) {
      player.addDrawing(texture);
    }

    // TODO: Load sprite.

    this.add(player);
  }

  private addActor(config: Config.Actor) {
    let actor = new ResponsiveActor(config.name, config.defaultSeq, []);
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
