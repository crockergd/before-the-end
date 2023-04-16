import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import { Constants } from '../utils/constants';

export default class Menu extends AbstractScene {

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);
    }

    public create(): void {
        this.render_context.transition_scene(TransitionType.IN);

        const title: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y, 'Before the End');
        title.set_anchor(0.5, 0.5);
        title.set_scale(5, 5);

        const text: AbstractText = this.render_context.add_text(title.x, title.y + this.render_context.literal(50), 'Click to begin');
        text.set_anchor(0.5, 0.5);

        this.input.once(Constants.UP_EVENT, () => {
            this.render_context.transition_scene(TransitionType.OUT, new CallbackBinding(() => {
                this.start('main', {
                    scene_context: this.scene_context
                });
            }, this));
        }, this);
    }
}