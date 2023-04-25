import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import CallbackBinding from '../../utils/callbackbinding';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Entity from '../entity';
import Attack from './attack';
import Equipment from './equipment';

export default class Cleave extends Equipment {
    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.equipment_info = {
            type: 'Cleave',
            key: 'cleave',
            name: 'Cleave',
            level: 0
        };

        this.type = 'Cleave';
    }

    public attack(player: Entity, target: Vector): void {
        this.apply_scaling();
        this.apply_player_scaling(player);

        const cursor_direction: Vector = new Vector(target.x - player.x, target.y - player.y);

        for (let i: number = 0; i < this.attack_info.amount; i++) {
            const flip: boolean = i % 2 === 0;

            let angle: number = MathExtensions.vector_to_degrees(cursor_direction) - 50;
            let adjust_sideways: Phaser.Math.Vector2 = cursor_direction.pv2.normalize();
            let adjust_backwards: Phaser.Math.Vector2 = adjust_sideways.clone();

            adjust_sideways = flip ? adjust_sideways.normalizeLeftHand() : adjust_sideways.normalizeRightHand();

            let space: number = Math.floor(i / 2) * 0.5;
            space = 1 + space;
            space = space * this.render_context.base_scale_factor;

            adjust_sideways.x *= 100 * space;
            adjust_sideways.y *= 100 * space;

            adjust_backwards.x *= 100 * (space - 1);
            adjust_backwards.y *= 100 * (space - 1);

            if (flip) angle += 90;

            const cleave: Attack = new Attack(this.attack_info);
            cleave.sprite = this.scene_renderer.draw_cleave(player.x - adjust_sideways.x - adjust_backwards.x, player.y - adjust_sideways.y - adjust_backwards.y, angle);
            if (flip) cleave.sprite.flip_y((true));

            this.scene_physics.ready_cleave(player, cleave);
            this.scene_physics.apply_force(cleave.sprite, cursor_direction, this.attack_info.velocity);

            this.render_context.tween({
                targets: [cleave.sprite.framework_object],
                alpha: 0,
                on_complete: new CallbackBinding(() => {
                    this.scene.push_cache(cleave.sprite);
                    cleave.sprite = null;
                }, this)
            });
        }
    }

    public apply_scaling(): void {
        this.attack_info = {
            equipment_key: this.key,
            power: 0,
            latch: false,
            repeat: 0,
            amount: 1,
            velocity: 0.45
        };

        if (this.level >= 1) {
            this.attack_info.velocity += 0.3;
        }
        if (this.level >= 2) {
            this.attack_info.repeat += 1;
        }
        if (this.level >= 3) {
            this.attack_info.velocity += 0.3;
        }
        if (this.level >= 4) {
            this.attack_info.repeat += 1;
        }

        this.attack_info.power += 3 * this.level;
    }

    public static description(level: number): string {
        switch (level) {
            case 0:
                return 'Stabs forward, flying towards the cursor location.'
            case 1:
                return 'Extends the distance travelled.';
            case 2:
                return 'Repeats the attack on connection with an enemy.';
            case 3:
                return 'Extends the distance travelled even further.';
            case 4:
                return 'Repeats the attack a second time on connection with an enemy.';
            default:
                return '';
        }
    }
}