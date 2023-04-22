import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MainPhysics from '../../scenes/mainphysics';
import MainRenderer from '../../scenes/mainrenderer';
import Entity from '../entity';

export default abstract class Equipment {
    public level: number;
    public power: number;

    public get scene_renderer(): MainRenderer {
        return this.scene.scene_renderer;
    }

    public get scene_physics(): MainPhysics {
        return this.scene.scene_physics;
    }

    public abstract attack(player: Entity): void;

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        this.level = 0;
        this.power = 0;
    }
}