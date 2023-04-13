import RenderContext from './rendercontext';

export default class SceneContext {
    private readonly _render_context: RenderContext;

    public get render_context(): RenderContext {
        return this._render_context;
    }

    constructor(public readonly game: Phaser.Game) {
        this._render_context = new RenderContext();
    }
}