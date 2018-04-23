import * as ex from 'excalibur';
import * as Config from './Configuration';
import { Resources } from './Resources';
import { Player } from './Player';
import { ResponsiveActor } from './ResponsiveActor';
import {TextWindow} from './TextWindow';
import { ExecutionWorld, ExecutionActor, Executor }
  from './actionSystem/Executor';
import { GridProvider, GridActor } from './GridActor';
import { Sprite } from './Sprite';

export default class GameplayScene extends ex.Scene
  implements ExecutionWorld, GridProvider
{
  public static readonly Name = "GameplayScene";
  public static readonly FriendActorName = "friend";

  private namedActors: { [name: string]: ResponsiveActor } = {};
  private gridUnitSize: number = 0;
  private worldSize: ex.Vector = new ex.Vector(0, 0);
  private tileMap: ex.TileMap;
  private sprites: { [name: string]: Sprite } = {};

  public constructor(private config: Config.Configuration, engine?: ex.Engine) {
    super(engine)
    this.tileMap = new ex.TileMap(
      0,
      0,
      config.map.tileWidth,
      config.map.tileHeight,
      config.map.height,
      config.map.width
    );
    // Current version of Excalibur doesn't set these values in the constructor.
    this.tileMap.x = 0;
    this.tileMap.y = 0;
    this.tileMap.cellWidth = config.map.tileWidth;
    this.tileMap.cellHeight = config.map.tileHeight;
    this.tileMap.rows = config.map.height;
    this.tileMap.cols = config.map.width;
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
    this.loadAllSprites(config.spriteDefinitions);

    this.gridUnitSize = config.gridUnitSize;
    this.worldSize = new ex.Vector(config.worldSize[0], config.worldSize[1]);
    this.addPlayer(config.player);
    for (let actorConfig of config.actors) {
      this.addActor(actorConfig);
    }

    // build sprite sheets
    this.config.map.tileSheets.forEach(sheet => {
      let item = Resources.getSingleton().getTexture(sheet.path)
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
    let mapInstance = this.config.map.instance;
    let curPos: [number, number] = [0, 0];
    for (let col of mapInstance.cols) {
      for (let cell of col.cells) {
        let repeat = cell.repeat !== undefined ? cell.repeat : 1;

        let ts = new ex.TileSprite(mapInstance.sheetId.toString(), cell.tileId);
        for (let i = 0; i < repeat; ++i) {
          let tmCell = this.tileMap.getCell(curPos[0], curPos[1]);
          if (tmCell) {
            tmCell.pushSprite(ts);
          } else {
            console.warn(`Can not draw tile at (${curPos[0]}, ${curPos[1]}).`);
          }
          ++curPos[1];
        }
      }
      curPos = [curPos[0] + 1, 0];
    }
  }

  private loadAllSprites(config: Config.SpriteDefinition[]) {
    for (let spriteDef of config) {
      let texture = Resources.getSingleton().getTexture(spriteDef.texture);
      if (texture) {
        let sprite = new Sprite(this.engine, spriteDef.name, texture,
          spriteDef.frameSize, spriteDef.cols, spriteDef.rows);

        for (let staticDef of spriteDef.statics) {
          sprite.addStatic(staticDef.name, staticDef.frameIndex);
        }

        sprite.setDefaultStatic(spriteDef.defaultStatic);

        for (let animationDef of spriteDef.animations) {
          sprite.addAnimation(animationDef.name, animationDef.frameIndices,
            animationDef.speed);
        }

        this.sprites[spriteDef.name] = sprite;
      } else {
        console.error(`Sprite texture "${spriteDef.texture} not found.`);
      }
    }
  }

  private addPlayer(config: Config.Player) {
    let player = new Player(this, this.gridUnitSize, this);
    this.positionActor(player, config);

    let texture = this.loadTexture(config);
    if (texture) {
      player.addDrawing(texture);
    }

    if (config.sprite) {
      this.loadSpriteToGridActor(player, config.sprite);
    }

    this.add(player);

    this.camera.addStrategy(new ex.ElasticToActorStrategy(player, 0.5, 0.75));
  }

  private addActor(config: Config.Actor) {
    let actor = new ResponsiveActor(config.name, config.defaultSeq,
      this.gridUnitSize, this);
    this.positionActor(actor, config);

    let texture = this.loadTexture(config);
    if (texture) {
      actor.addDrawing(texture);
    }

    if (config.sprite) {
      this.loadSpriteToGridActor(actor, config.sprite);
    }

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

  private loadSpriteToGridActor(actor: GridActor, spriteName: string) {
    if (spriteName in this.sprites) {
      let sprite = this.sprites[spriteName];
      actor.addSprite(sprite);
    } else {
      console.error(`Sprite "${spriteName}" could not be found.`);
    }
  }
}
