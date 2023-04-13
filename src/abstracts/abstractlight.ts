import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import AbstractScene from './abstractscene';

export default class AbstractLight {
    public framework_object: GameObjects.Light;

    constructor(private readonly renderer: RenderContext, scene: AbstractScene,
        x: number, y: number, radius: number, rgb: number, intensity: number) {
        this.framework_object = scene.lights.addLight(this.renderer.spatial(x), this.renderer.spatial(y), radius, rgb, intensity);
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        if (relative) {
            this.framework_object.setPosition(this.renderer.spatial(this.framework_object.x + x), this.renderer.spatial(this.framework_object.y + y));
        } else {
            this.framework_object.setPosition(this.renderer.spatial(x), this.renderer.spatial(y));
        }
    }

    public set_visible(visible: boolean): void {
        if (this.framework_object.visible === visible) return;

        this.framework_object.visible = visible;
    }

    public set_intensity(value: number): void {
        this.framework_object.setIntensity(value);
    }
}