import * as ex from 'excalibur';
let wrap: ((input: string, options?: { width: number }) => string) = require('word-wrap'); 

export class TextWindow extends ex.UIActor {
  public constructor (engine: ex.Engine, onClose: () => void, displayText?: string, col?: ex.Color) {
    super()
    this.labels = new Array(4);
    this.text = new Array();
    this.closeHandler = onClose;
    this.pos.x = 0;
    this.pos.y = engine.drawHeight - engine.drawHeight / 4;
    this.setWidth(engine.drawWidth);
    this.setHeight(engine.drawHeight / 4);
    this.color = ex.Color.White;
    if (displayText) {
      this.renew(displayText, engine, col);
    }
    this.on ('postupdate', this.adjOnSpace(engine, col));
    console.log(this.text.length);
  }

  public adjOnSpace (engine: ex.Engine, col?: ex.Color): (() => void) {
    return () => {
      if (engine.input.keyboard.wasReleased(ex.Input.Keys.Space)) {
        if (this.text[this.index + this.labels.length]) {
          this.index = this.index + this.labels.length;
          console.log("fold", this.index);
	  for (var label of this.labels) {
	    label.opacity = 0;
	  }
          this.fillLabels(this.index, col);
	  for (var label of this.labels) {
	    label.opacity = 1;
	  }
        } else {
	  console.log("bye");
          this.closeHandler();
	  //this.opacity = 0;
	  //for (var label of this.labels) {
	  //  label.opacity = 0;
	  //}
        }
      }
    }
  }
    
  public renew (intext: string, engine: ex.Engine, col?: ex.Color): void {
    this.opacity = 1;
    this.index = 0;
    this.text = this.unLines(intext, engine.drawWidth / 4);
    this.fillLabels(this.index, col)
    for (var label of this.labels) {
      label.opacity = 1;
    }
  }

  private text: string[];

  private index: number = 0;

  private labels: ex.Label[];

  private closeHandler: () => void;

  private unLines(input: string, w: number): string[] {
  var inter = wrap(input, {width: 80});
    console.log(inter);
    return inter.split('\n');
  }

  private lineAtIndex(ind: number): string {
    return this.text[ind];
  }

  private fillLabels(start: number, col?: ex.Color): void {
    for (var i: number = 0; i < this.labels.length; i++) {
      this.labels[i] = new ex.Label(this.lineAtIndex(this.index + i),
        this.getWidth() / 2, 40 * (i + 1), 'Arial');
      this.labels[i].fontSize = 40;
      this.labels[i].textAlign = ex.TextAlign.Center;
      if (col) {
        this.labels[i].color = col;
      }
      this.add(this.labels[i]);
    }
  }
}
