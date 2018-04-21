import * as ex from 'excalibur';
import { ExecutionActor } from './actionSystem/Executor';

export class ResponsiveActor extends ex.Actor implements ExecutionActor
{
  public readonly name: string;
  private _defaultSequence: string;

  public constructor(name: string, defSeq: string, config?: ex.IActorArgs) {
    super(config);
    this.name = name;
    this._defaultSequence = defSeq;
  }

  public move(x: number, y: number) {
    // TODO: Perform move through A*.
  }

  public changeDefaultSequence(sequence: string) {
    this._defaultSequence = sequence;
  }

  public get defaultSequence(): string {
    return this._defaultSequence;
  }
}
