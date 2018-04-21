import * as ex from 'excalibur';
import {Promise} from 'es6-promise';
import * as path from 'pathfinding';
import { Executor, ExecutionActor } from './actionSystem/Executor';

export class ResponsiveActor extends ex.Actor implements ExecutionActor
{
  public readonly name: string;
  private _defaultSequence: string;
  private gridPos: [number, number];
  private task: (MovementTask | null);

  public constructor(
    name: string,
    defSeq: string,
    private matrix: number[][],
    private tolerance: number = 0.1,
    config?: ex.IActorArgs)
  {
    super(config);
    this.gridPos = [this.pos.x, this.pos.y];
    this.name = name;
    this._defaultSequence = defSeq;
    this.task = null;
  }

  public move(target: [number, number]): Promise<void>
  {
    return new Promise((res, rej) => {
      // TODO: Perform move through A*.
      this.task = new MovementTask(
        this.gridPos,
        target,
        0.1, //tolerance for now
        this.matrix,
        res,
        rej
      );
    });
  }

  public changeDefaultSequence(sequence: string) {
    this._defaultSequence = sequence;
  }

  public get defaultSequence(): string {
    return this._defaultSequence;
  }

  public executeDefaultSequence() {
    let action
      = Executor.getSingleton().beginAction(this, this._defaultSequence);
    if (action) {
      action.run();
    } else {
      console.error(`Default action "${this._defaultSequence}" of `
        + `"${this.name}" does not exist.`);
    }
  }

  public update(egnine: ex.Engine, delta: number): void {
    if (this.task) {
      let dx:number = this.task.path[0][0] - this.gridPos[0];
      let dy:number = this.task.path[0][1] - this.gridPos[1];
      this.gridPos[0] = dx * delta / 1000;
      this.gridPos[1] = dy * delta / 1000;
      if (((this.task.path[0][0] - this.gridPos[0]) ** 2 +
      (this.task.path[0][1] - this.gridPos[1]) ** 2) < this.tolerance) {
        this.task.path = this.task.path.slice(1);
        if (this.task.path.length == 0) {
          this.task.res();
          this.task = null;
        }
      }
    }
  }
}

class MovementTask {
  constructor(
    gridPos: [number, number],
    public destination: [number, number],
    public tolerance: number,
    matrix: number[][],
    public res: () => void,
    public rej: (val: string) => void,
  ) {
    this.astarGrid = new path.Grid(matrix);
    this.astarInstance = new path.AStarFinder({
      diagonalMovement: path.DiagonalMovement.Never
    });
    this.path = this.astarInstance.findPath(
      gridPos[0], gridPos[1],
      destination[0], destination[1], this.astarGrid);
  }

  public path: number[][];
  private astarInstance: path.AStarFinder;
  private astarGrid: path.Grid;
}
