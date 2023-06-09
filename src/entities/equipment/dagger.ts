import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from './attack';
import Entity from '../entity';
import Equipment from './equipment';
import CallbackBinding from '../../utils/callbackbinding';
import StatType from './stattype';

export default class Dagger extends Equipment {
    public static scaling: Array<StatType> = [StatType.POWER, StatType.VELOCITY, StatType.REPEAT];

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.equipment_info = {
            type: 'Dagger',
            key: 'dagger',
            name: 'Dagger',
            level: 0
        };

        this.type = 'Dagger';
    }

    public attack(player: Entity, target: Vector): void {
        this.apply_scaling();
        this.apply_player_scaling(player);

        const cursor_direction: Vector = new Vector(target.x - player.x, target.y - player.y);
        const angle: number = MathExtensions.vector_to_degrees(cursor_direction);

        const dagger: Attack = new Attack(this.attack_info);
        dagger.sprite = this.scene_renderer.draw_dagger(player, angle);
        this.scene_physics.ready_dagger(player, dagger);
        this.scene_physics.apply_force(player.sprite, cursor_direction, this.attack_info.velocity);

        this.render_context.tween({
            targets: [dagger.sprite.framework_object],
            alpha: 0,
            on_complete: new CallbackBinding(() => {
                this.scene_physics.world.remove(dagger.constraint);
                this.scene.push_cache(dagger.sprite);
                dagger.sprite = null;
            }, this)
        });
    }

    public apply_scaling(): void {
        this.attack_info = {
            equipment_key: this.key,
            power: 7,
            latch: true,
            repeat: 0,
            amount: 0,
            velocity: 1.2
        };

        for (const upgrade of this.upgrades) {
            switch (upgrade) {
                case StatType.POWER:
                    this.attack_info.power += 7;
                    break;
                case StatType.VELOCITY:
                    this.attack_info.amount += 0.3;
                    break;
                case StatType.REPEAT:
                    this.attack_info.repeat += 1;
                    break;
            }
        }

        this.attack_info.power += 3 * this.level;
    }

    public static description(level: number): string {
        switch (level) {
            case 0:
                return 'Stabs forward, flying towards the cursor location.';
            default:
                return '';
        }
    }
}