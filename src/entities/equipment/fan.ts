import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from './attack';
import Entity from '../entity';
import Equipment from './equipment';
import CallbackBinding from '../../utils/callbackbinding';
import StatType from './stattype';

export default class Fan extends Equipment {
    public static scaling: Array<StatType> = [StatType.POWER, StatType.VELOCITY, StatType.REPEAT, StatType.AMOUNT];

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.equipment_info = {
            type: 'Fan',
            key: 'fan',
            name: 'Fan',
            level: 0
        };

        this.type = 'Fan';
    }

    public attack(player: Entity, target: Vector): void {
        this.render_context.delay(100, () => {
            this.apply_scaling();
            this.apply_player_scaling(player);

            const attack_angle: number = 35;
            const cursor_direction: Vector = new Vector(target.x - player.x, target.y - player.y);

            for (let i: number = 0; i < this.attack_info.amount; i++) {
                const angle: number = MathExtensions.vector_to_degrees(cursor_direction) - MathExtensions.rand_int_inclusive(-attack_angle, attack_angle);
                const direction: Phaser.Math.Vector2 = cursor_direction.pv2.setAngle(Phaser.Math.DegToRad(angle));
                const fan: Attack = new Attack(this.attack_info);
                fan.sprite = this.scene_renderer.draw_fan(player, angle);
                this.scene_physics.ready_fan(player, fan);
                this.scene_physics.apply_force(fan.sprite, new Vector(direction.x, direction.y), this.attack_info.velocity);

                this.render_context.tween({
                    targets: [fan.sprite.framework_object],
                    alpha: 0,
                    on_complete: new CallbackBinding(() => {
                        this.scene.push_cache(fan.sprite);
                        fan.sprite = null;
                    }, this)
                });
            }
        }, this);
    }

    public apply_scaling(): void {
        this.attack_info = {
            equipment_key: this.key,
            power: 6,
            latch: false,
            repeat: 0,
            amount: 3,
            velocity: 0.3
        };

        for (const upgrade of this.upgrades) {
            switch (upgrade) {
                case StatType.POWER:
                    this.attack_info.power += 5;
                    break;
                case StatType.VELOCITY:
                    this.attack_info.amount += 0.2;
                    break;
                case StatType.AMOUNT:
                    this.attack_info.amount += 1;
                    break;
                case StatType.REPEAT:
                    this.attack_info.repeat += 1;
                    break;
            }
        }

        this.attack_info.power += 2 * this.level;
    }

    public static description(level: number): string {
        switch (level) {
            case 0:
                return 'Flings several spinning blades towards the cursor location.';
            default:
                return '';
        }
    }
}