import * as ex from 'excalibur';
import * as astar from 'astar-typescript/main';
import { ExecutionActor, Executor } from './actionSystem/Executor';

export class ResponsiveActor extends ex.Actor implements ExecutionActor
{
  public readonly name: string;
  private _defaultSequence: string;
  private astarInstance: astar.AStarFinder;
  private astarGrid: astar.Grid;
  private gridPos: [number, number];
  private path: number[][];

  public constructor(
    name: string,
    defSeq: string,
    pos: [number, number],
    matrix: number[][],
    config?: ex.IActorArgs)
  {
    super(config);
    this.gridPos = pos;
    this.path = new Array();
    this.name = name;
    this._defaultSequence = defSeq;
    this.astarGrid = new astar.Grid(matrix);
    let diagonalMovement = false;
    this.astarInstance = new astar.AStarFinder(this.astarGrid, diagonalMovement);
  }

  public move(target: [number, number]) {
    // TODO: Perform move through A*.
    this.path = this.astarInstance.findPath(this.gridPos, target);
  }

  public changeDefaultSequence(sequence: string) {
    this._defaultSequence = sequence;
  }

  public get defaultSequence(): string {
    return this._defaultSequence;
  }

  public executeDefaultSequence() {
    Executor.getSingleton().beginAction(this, this._defaultSequence);
  }
}
