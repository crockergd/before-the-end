import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from './attack';
import Entity from '../entity';
import Equipment from './equipment';
import CallbackBinding from '../../utils/callbackbinding';
import StatType from './stattype';

export default class Dart extends Equipment {
    public static scaling: Array<StatType> = [StatType.POWER, StatType.VELOCITY, StatType.REPEAT, StatType.AMOUNT];

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.equipment_info = {
            type: 'Dart',
            key: 'dart',
            name: 'Dart',
            level: 0
        };

        this.type = 'Dart';
    }

    public attack(player: Entity, target: Vector): void {
        this.apply_scaling();
        this.apply_player_scaling(player);

        for (let i: number = 0; i < this.attack_info.amount; i++) {
            this.render_context.delay(100 * i, () => {
                const closest: Entity = this.scene.nearest_entity_to(this.scene.enemies, target);
                if (closest) target = new Vector(closest.x, closest.y);

                const cursor_direction: Vector = new Vector(target.x - player.x, target.y - player.y);

                const angle: number = MathExtensions.vector_to_degrees(cursor_direction); // - MathExtensions.rand_int_inclusive(-attack_angle, attack_angle);
                const direction: Phaser.Math.Vector2 = cursor_direction.pv2.setAngle(Phaser.Math.DegToRad(angle));

                const dart: Attack = new Attack(this.attack_info);
                dart.sprite = this.scene_renderer.draw_dart(player, angle);
                this.scene_physics.ready_dart(player, dart);
                this.scene_physics.apply_force(dart.sprite, new Vector(direction.x, direction.y), this.attack_info.velocity);

                this.render_context.tween({
                    targets: [dart.sprite.framework_object],
                    duration: 300,
                    alpha: 0,
                    on_complete: new CallbackBinding(() => {
                        this.scene.push_cache(dart.sprite);
                        dart.sprite = null;
                    }, this)
                });
            }, this);
        }
    }

    public apply_scaling(): void {
        this.attack_info = {
            equipment_key: this.key,
            power: 3,
            latch: false,
            repeat: 0,
            amount: 1,
            velocity: 0.06
        };

        for (const upgrade of this.upgrades) {
            switch (upgrade) {
                case StatType.POWER:
                    this.attack_info.power += 4;
                    break;
                case StatType.VELOCITY:
                    this.attack_info.amount += 0.03;
                    break;
                case StatType.AMOUNT:
                    this.attack_info.amount += 1;
                    break;
                case StatType.REPEAT:
                    this.attack_info.repeat += 1;
                    break;
            }
        }

        this.attack_info.power += 1 * this.level;
    }

    public static description(level: number): string {
        switch (level) {
            case 0:
                return 'Fires a dart at the nearest enemy to the cursor.';
            default:
                return '';
        }
    }
}