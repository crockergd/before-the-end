import PhysicsContext from './physicscontext';
import RenderContext from './rendercontext';

export default class SceneContext {
    private readonly _render_context: RenderContext;
    private readonly _physics_context: PhysicsContext;

    public get render_context(): RenderContext {
        return this._render_context;
    }

    public get physics_context(): PhysicsContext {
        return this._physics_context;
    }

    constructor(public readonly game: Phaser.Game) {
        this._render_context = new RenderContext();
        this._physics_context = new PhysicsContext();
    }
}