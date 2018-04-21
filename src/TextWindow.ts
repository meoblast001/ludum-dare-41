import * as ex from 'excalibur';
let wrap: ((input: string, options?: { width: number }) => string) = require('word-wrap'); 

export class TextWindow extends ex.UIActor {
  private text: string[] = [];

  private options?: string[];

  private index: number = 0;

  private optIndex: number | null = null;

  private labels: ex.Label[] = [];

  public constructor (
    engine: ex.Engine,
    private closeHandler: () => void,
    displayText: string,
    private opts?: string[],
    private col?: ex.Color)
  {
    super()
    this.labels = new Array(4);
    this.text = new Array();
    this.pos.x = 0;
    this.pos.y = engine.drawHeight - engine.drawHeight / 4;
    this.setWidth(engine.drawWidth);
    this.setHeight(engine.drawHeight / 4);
    this.color = ex.Color.White;

    if (opts) {
      // With options, only display one line of text.
      this.text = [displayText];
      for (let option of opts) {
        this.text.push(option);
      }
      this.optIndex = 0;
    } else {
      // Otherwise break texts apart.
      this.text = this.unLines(displayText, engine.drawWidth / 4);
    }
  }

  public onInitialize(engine: ex.Engine) {
    this.initaliseLabels(4);
    this.fillLabels(this.index);
  }

  public onPostUpdate(engine: ex.Engine) {
    if (engine.input.keyboard.wasReleased(ex.Input.Keys.Space)) {
      if (this.text[this.index + this.labels.length]) {
        this.index += this.labels.length;
        for (var label of this.labels) {
          label.opacity = 0;
        }
        this.fillLabels(this.index);
        for (var label of this.labels) {
          label.opacity = 1;
        }
      } else {
        this.closeHandler();
      }
    }

    if (engine.input.keyboard.wasReleased(ex.Input.Keys.Up)) {
      this.changeOpt(-1);
    }

    if (engine.input.keyboard.wasReleased(ex.Input.Keys.Down)) {
      this.changeOpt(1);
    }
  }

  private initaliseLabels(amount: number) {
    this.labels = [];
    for (var i: number = 0; i < amount; i++) {
      let label = new ex.Label('', this.getWidth() / 2, 40 * (i + 2),
        'Courier New');
      label.fontSize = 40;
      label.textAlign = ex.TextAlign.Center;
      this.add(label);
      this.labels.push(label);
    }
  }

  private unLines(input: string, w: number): string[] {
    var inter = wrap(input, {width: 80});
      return inter.split('\n');
    }

  private lineAtIndex(ind: number): string {
    return ind in this.text ? this.text[ind] : '';
  }

  private fillLabels(start: number): void {
    for (var i: number = 0; i < this.labels.length; i++) {
      if (i < this.text.length) {
        if (this.optIndex !== null && this.optIndex + 1 == i) {
          this.labels[i].text = '> ' + this.text[i];
          this.labels[i].color = ex.Color.Green;
        } else {
          this.labels[i].text = this.text[i];
          this.labels[i].color = this.col ? this.col : ex.Color.Black;
        }
      }
    }
  }

  private changeOpt(delta: number): void {
    if (this.optIndex !== null
      && this.opts
      && this.optIndex + delta >= 0
      && this.optIndex + delta < this.opts.length
    ) {
      this.optIndex += delta;
      this.fillLabels(this.index);
    }
  }
}
