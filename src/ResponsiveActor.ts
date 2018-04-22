import * as ex from 'excalibur';
import {Promise} from 'es6-promise';
import * as path from 'pathfinding';
import { GridActor, GridProvider } from './GridActor';
import { ExecutionActor, Executor } from './actionSystem/Executor';

export class ResponsiveActor extends GridActor implements ExecutionActor
{
  public readonly name: string;
  private _defaultSequence: string;

  public constructor(
    name: string,
    defSeq: string,
    unitSize: number,
    gridProvider: GridProvider,
    config?: ex.IActorArgs)
  {
    super(unitSize, gridProvider, config);
    this.name = name;
    this._defaultSequence = defSeq;
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
