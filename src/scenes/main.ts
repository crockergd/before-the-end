import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import TransitionType from '../ui/transitiontype';
import { Constants } from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import Vector from '../utils/vector';

export default class Main extends AbstractScene {
    public player: AbstractSprite;
    public position: AbstractText;

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);

        this.matter.world.disableGravity();
    }

    public create(): void {
        this.render_context.transition_scene(TransitionType.IN);

        const transition: AbstractSprite = this.render_context.add_sprite(0, 0, 'zone_courtyards_transition');
        transition.set_anchor(0.5, 0.5);

        this.player = this.render_context.add_sprite(0, 0, 'bandit', undefined, undefined, true);
        this.player.set_anchor(0.5, 1);
        this.player.play('idle_bandit');

        this.player.physics_body.setFixedRotation();
        this.player.physics_body.setFriction(0.6, 0.2);

        this.render_context.camera.startFollow(this.player.framework_object, true);

        const enemy1: AbstractSprite = this.render_context.add_sprite(this.render_context.literal(120), 0, 'baron', undefined, undefined, true);
        enemy1.set_anchor(0.5, 1);
        enemy1.play('idle_baron');
        enemy1.physics_body.setFixedRotation();
        enemy1.physics_body.setStatic(true);

        this.input.on(Constants.UP_EVENT, () => {
            const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;

            const clamp: number = 30;
            const diff: Vector = new Vector(MathExtensions.clamp(pointer.worldX - this.player.absolute_x, -clamp, clamp), MathExtensions.clamp(pointer.worldY - this.player.absolute_y, -clamp, clamp));
            diff.multiply(0.02);

            this.player.physics_body.applyForce(diff.pv2);
        }, this);

        this.position = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
        this.position.affix_ui();

        this.render_context.camera.setBackgroundColor(0x003003);
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        this.position.text = Math.floor(this.player.absolute_x) + ', ' + Math.floor(this.player.absolute_y);
    }
}