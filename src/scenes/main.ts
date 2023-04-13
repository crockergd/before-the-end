import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import TransitionType from '../ui/transitiontype';

export default class Main extends AbstractScene {
    public init(data: SceneData): void {
        super.init(data);

        this.render_context.set_scene(this);
    }

    public create(): void {
        this.render_context.transition_scene(TransitionType.IN);

        const text: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y, 'Test');
        text.set_anchor(0.5, 0.5);

        this.render_context.camera.setBackgroundColor(0x003003);
    }
}