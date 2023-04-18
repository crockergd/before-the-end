import { Scene } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import SceneContext from '../contexts/scenecontext';
import SceneData from '../contexts/scenedata';
import PhysicsContext from '../contexts/physicscontext';

export default class AbstractScene extends Scene {
    public scene_context: SceneContext;

    public get render_context(): RenderContext {
        return this.scene_context.render_context;
    }

    public get physics_context(): PhysicsContext {
        return this.scene_context.physics_context;
    }

    public init(data: SceneData) {
        if (data) {
            this.scene_context = data.scene_context;
        }

        this.events.once('shutdown', () => {
            this.render_context.unbind_update();
            this.render_context.cache.tweens.killAll();
        }, this);
    }

    public start(key: string, data: SceneData): void {
        if (this.scene.key === key) return;

        this.scene.stop(this.scene.key);
        this.scene.launch(key, data);

        this.render_context.cache.update_scene(key);
    }

    public update(time: number, dt_ms: number): void {

    }
}