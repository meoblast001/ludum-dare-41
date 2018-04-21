import * as ex from 'excalibur';
//import * as astar from 'astar-typescript/main';
import { IAAStarField, IAAStarFieldNode, AAStar, AAStarSimpleField, SimpleNode }
  from "aastar";
import { ExecutionActor } from './actionSystem/Executor';

export class ResponsiveActor extends ex.Actor implements ExecutionActor
{
  public readonly name: string;
  private _defaultSequence: string;
  private astarInstance: AAStar;
  private astarGrid: AAStarSimpleField;
  private gridPos: [number, number];
  private path: IAAStarFieldNode[];

  public constructor(
    name: string,
    defSeq: string,
    matrix: number[][], //optional for now
    config?: ex.IActorArgs)
  {
    super(config);
    this.gridPos = [this.pos.x, this.pos.y];
    this.path = new Array();
    this.name = name;
    this._defaultSequence = defSeq;
    this.astarGrid = new AAStarSimpleField(matrix);
    this.astarInstance = new AAStar(this.astarGrid);
  }

  public move(target: [number, number]) {
    // TODO: Perform move through A*.
    this.path = this.astarInstance.calculatePath(
      this.astarGrid.getNodeAt(this.gridPos[0], this.gridPos[1]),
      this.astarGrid.getNodeAt(target[0], target[1]));
  }

  public changeDefaultSequence(sequence: string) {
    this._defaultSequence = sequence;
  }

  public get defaultSequence(): string {
    return this._defaultSequence;
  }
}
