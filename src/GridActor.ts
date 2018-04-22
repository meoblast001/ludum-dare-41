import * as ex from 'excalibur';
import { Promise } from 'es6-promise';
import * as path from 'pathfinding';
import { Sprite } from './Sprite';

export interface GridProvider {
  getGridSize(): [number, number];
  getGrid(): boolean[][];
}

export enum Direction {
  Left,
  Up,
  Right,
  Down
}

export class GridActor extends ex.Actor {
  public gridPosition: ex.Vector;
  private currentMovement: MovementTask | null = null;
  private sprite: Sprite | null = null;

  constructor(
    private unitSize: number,
    private gridProvider: GridProvider,
    config?: ex.IActorArgs
  ) {
    super(config);
    this.gridPosition = new ex.Vector(0, 0);
  }

  public addSprite(sprite: Sprite) {
    this.sprite = sprite;
    sprite.setupActor(this);
  }

  public moveOnce(direction: Direction): Promise<void> {
    switch (direction) {
      case Direction.Left:
        this.setDrawing('move_left');
        return this.move([this.gridPosition.x - 1, this.gridPosition.y])
          .then(() => { this.setDrawing('idle_left'); });
      case Direction.Up:
        this.setDrawing('move_up');
        return this.move([this.gridPosition.x, this.gridPosition.y - 1])
          .then(() => { this.setDrawing('idle_up'); });
      case Direction.Right:
        this.setDrawing('move_right');
        return this.move([this.gridPosition.x + 1, this.gridPosition.y])
          .then(() => { this.setDrawing('idle_right'); });
      case Direction.Down:
        this.setDrawing('move_down');
        return this.move([this.gridPosition.x, this.gridPosition.y + 1])
          .then(() => { this.setDrawing('idle_down'); });
    }
  }

  public move(target: [number, number]): Promise<void> {
    if (!this.currentMovement && this.movementInBounds(target)) {
      return new Promise((res, rej) => {
        this.currentMovement = new MovementTask(
          [this.gridPosition.x, this.gridPosition.y],
          target,
          this.transformGrid(this.gridProvider.getGrid()),
          res,
          rej
        );
      });
    } else {
      return Promise.reject("Already moving.");
    }
  }

  public update(engine: ex.Engine, delta: number) {
    if (this.currentMovement) {
      let path = this.currentMovement.path;

      if (path.length == 0) {
        this.currentMovement.res();
        this.currentMovement = null;
        return;
      }

      let destination = new ex.Vector(path[0][0], path[0][1]);

      let dirX = destination.x > this.gridPosition.x
        ? 1 : (destination.x < this.gridPosition.x ? -1 : 0);
      let dirY = destination.y > this.gridPosition.y
        ? 1 : (destination.y < this.gridPosition.y ? -1 : 0);

      // Progress 1 pixel every 50 milliseconds.
      this.currentMovement.progressToNext += (delta / 5);
      // Move grid position if progress has reached the next unit.
      if (this.currentMovement.progressToNext >= this.unitSize) {
        this.currentMovement.progressToNext = 0;
        this.gridPosition.x += dirX;
        this.gridPosition.y += dirY;
        // Move to next item.
        this.currentMovement.path = this.currentMovement.path.slice(1);
      }

      // Set pixel position as a function of grid position and progress.
      this.pos.x = this.gridPosition.x * this.unitSize
        + this.currentMovement.progressToNext * dirX;
      this.pos.y = this.gridPosition.y * this.unitSize
        + this.currentMovement.progressToNext * dirY;

      // Resolve if path is empty.
      if (this.currentMovement.path.length == 0) {
        this.currentMovement.res();
        this.currentMovement = null;
      }
    } else {
      this.pos.x = this.gridPosition.x * this.unitSize;
      this.pos.y = this.gridPosition.y * this.unitSize;
    }
  }

  // Transforms grid for pathfinding library.
  private transformGrid(input: boolean[][]): number[][] {
    return input.map((row) => row.map(occupied => occupied ? 1 : 0));
  }

  private movementInBounds(target: [number, number]): boolean {
    let size = this.gridProvider.getGridSize();
    return target[0] >= 0 && target[0] < size[0]
      && target[1] >= 0 && target[1] < size[1];
  }
}

class MovementTask {
  constructor(
    startPosition: [number, number],
    public destination: [number, number],
    matrix: number[][],
    public res: () => void,
    public rej: (val: string) => void,
  ) {
    this.astarGrid = new path.Grid(matrix);
    this.astarInstance = new path.AStarFinder({
      diagonalMovement: path.DiagonalMovement.Never
    });
    this.path = this.astarInstance.findPath(
      startPosition[0], startPosition[1],
      destination[0], destination[1], this.astarGrid);
    this.path = this.path.slice(1); // Current position is first node.
  }

  public path: number[][];
  public progressToNext: number = 0; // Amount of pixels travelled to next unit.
  private astarInstance: path.AStarFinder;
  private astarGrid: path.Grid;
}
