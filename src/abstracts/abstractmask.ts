import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import Vector from '../utils/vector';
import AbstractScene from './abstractscene';

export default class AbstractMask {
    public framework_object: GameObjects.Image;
    public mask: Phaser.Display.Masks.BitmapMask;
    public offset: Vector;
    public attached: boolean;

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, key: string, origin: number) {
        this.framework_object = scene.make.image({
            x: x,
            y: y,
            scale: renderer.base_scale_factor,
            origin: origin,
            key: key,
            add: false
        });

        this.mask = new Phaser.Display.Masks.BitmapMask(scene, this.framework_object);
        this.attached = true;
    }
}