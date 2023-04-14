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

        const text: AbstractText = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, 'Menu' + Constants.LINE_BREAK + 'Click to begin');

        this.input.once(Constants.UP_EVENT, () => {
            this.render_context.transition_scene(TransitionType.OUT, new CallbackBinding(() => {
                this.start('main', {
                    scene_context: this.scene_context
                });
            }, this));
        }, this);
    }
}