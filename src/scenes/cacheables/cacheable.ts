import RenderContext from '../../contexts/rendercontext';
import AbstractScene from '../../abstracts/abstractscene';
import SceneContext from '../../contexts/scenecontext';

export default abstract class Cacheable {
    protected get render_context(): RenderContext {
        return this.scene.render_context;
    }

    protected get scene_context(): SceneContext {
        return this.scene.scene_context;
    }

    constructor(protected readonly scene: AbstractScene) {

    }
}