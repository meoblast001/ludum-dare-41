import * as ex from 'excalibur';

export class Sprite {
  private spriteSheet: ex.SpriteSheet;
  private statics: { [name: string]: ex.Sprite } = {};
  private defaultStatic: ex.Sprite | null = null;
  private animations: { [name: string]: ex.Animation } = {};

  public constructor(
    private engine: ex.Engine,
    private _name: string,
    private texture: ex.Texture,
    frameSize: [number, number],
    cols: number,
    rows: number
  ) {
    this.spriteSheet = new ex.SpriteSheet(this.texture, cols, rows,
      frameSize[0], frameSize[1]);
  }

  public get name() {
    return this._name;
  }

  public setupActor(actor: ex.Actor) {
    for (let name in this.statics) {
      actor.addDrawing(name, this.statics[name]);
    }
    for (let animation in this.animations) {
      actor.addDrawing(animation, this.animations[animation]);
    }
    if (this.defaultStatic) {
      actor.addDrawing(this.defaultStatic);
    }
  }

  public addStatic(name: string, frameIndex: number) {
    this.statics[name] = this.spriteSheet.getSprite(frameIndex);
  }

  public setDefaultStatic(name: string) {
    if (name in this.statics) {
      this.defaultStatic = this.statics[name];
    } else {
      console.error(`Sprite "${this.name}" does not have a static "${name}".`);
    }
  }

  public addAnimation(name: string, frameIndices: number[], speed: number) {
    this.animations[name] = this.spriteSheet.getAnimationByIndices(this.engine,
      frameIndices, speed);
  }
}
