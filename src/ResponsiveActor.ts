import * as ex from 'excalibur';
import * as path from 'pathfinding';
import { Executor, ExecutionActor } from './actionSystem/Executor';

export class ResponsiveActor extends ex.Actor implements ExecutionActor
{
  public readonly name: string;
  private _defaultSequence: string;
  private astarInstance: path.AStarFinder;
  private astarGrid: path.Grid;
  private gridPos: [number, number];
  private path: number[][];

  public constructor(
    name: string,
    defSeq: string,
    matrix: number[][], //optional for now
    config?: ex.IActorArgs)
  {
    super(config);
    this.gridPos = [this.pos.x, this.pos.y];
    this.path = [];
    this.name = name;
    this._defaultSequence = defSeq;
    this.astarGrid = new path.Grid(matrix);
    this.astarInstance = new path.AStarFinder({
      diagonalMovement: path.DiagonalMovement.Never
    });
  }

  public move(target: [number, number]) {
    // TODO: Perform move through A*.
    this.path = this.astarInstance.findPath(
      this.gridPos[0], this.gridPos[1],
      target[0], target[1], this.astarGrid);
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
}
