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
    public debug: AbstractText;

    public start_time: number;
    public enemies_defeated: number;

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);

        this.matter.world.disableGravity();
        this.enemies_defeated = 0;
    }

    public create(): void {
        this.render_context.transition_scene(TransitionType.IN);

        const transition: AbstractSprite = this.render_context.add_sprite(0, 0, 'zone_courtyards_transition');
        transition.set_anchor(0.5, 0.5);

        this.spawn_player();
        this.spawn_enemy();

        this.debug = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
        this.debug.affix_ui();

        this.render_context.camera.setBackgroundColor(0x003003);

        this.start_time = this.render_context.now;
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        this.debug.text = 'Position: ' + Math.floor(this.player.absolute_x) + ', ' + Math.floor(this.player.absolute_y) + Constants.LINE_BREAK +
            'Enemies Defeated: ' + this.enemies_defeated + Constants.LINE_BREAK +
            'Time Elapsed: ' + Math.floor((this.render_context.now - this.start_time) / 1000);
    }

    public spawn_player(): void {
        this.player = this.render_context.add_sprite(0, 0, 'bandit', undefined, undefined, true);
        this.player.set_anchor(0.5, 0.5);
        this.player.play('idle_bandit');

        this.player.physics_body.setFixedRotation();
        this.player.physics_body.setFriction(0.4, 0.1);

        this.render_context.camera.startFollow(this.player.framework_object, true, 0.6, 0.6);

        this.input.on(Constants.UP_EVENT, () => {
            const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;

            const clamp: number = 30;
            const diff: Vector = new Vector(MathExtensions.clamp(pointer.worldX - this.player.absolute_x, -clamp, clamp), MathExtensions.clamp(pointer.worldY - this.player.absolute_y, -clamp, clamp));
            diff.multiply(0.02);

            if (diff.x > 0) {
                this.player.flip_x(false);
            } else {
                this.player.flip_x(true);
            }

            this.player.physics_body.applyForce(diff.pv2);
        }, this);
    }

    public spawn_enemy(): void {
        const initial_position: Vector = new Vector(Math.floor(this.player.absolute_x), Math.floor(this.player.absolute_y));
        const distance: number = 200;
        const bounds: Vector = new Vector(initial_position.x - distance, initial_position.y - distance, initial_position.x + distance, initial_position.y + distance);
        const enemy_position: Vector = MathExtensions.rand_within_bounds(bounds);

        const enemy: AbstractSprite = this.render_context.add_sprite(enemy_position.x, enemy_position.y, 'baron', undefined, undefined, true);
        enemy.set_anchor(0.5, 0.5);
        enemy.play('idle_baron');
        enemy.physics_body.setFixedRotation();
        enemy.physics_body.setStatic(true);
        enemy.physics_body.setBounce(0.8);
        enemy.physics_body.setOnCollide(() => {
            this.enemies_defeated++;
            enemy.destroy();
            this.spawn_enemy();
        });
    }
}