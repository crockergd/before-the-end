import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from '../attacks/attack';
import Entity from '../entity';
import Equipment from './equipment';

export default class Dagger extends Equipment {
    public velocity_scalar: number;

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.info = {
            type: 'Dagger',
            key: 'dagger',
            name: 'Dagger',
            level: 0
        };

        this.type = 'Dagger';
    }

    public attack(player: Entity, target: Vector): void {
        this.apply_scaling();

        const cursor_direction: Vector = new Vector(target.x - player.x, target.y - player.y);
        const angle: number = MathExtensions.vector_to_degrees(cursor_direction);

        const dagger: Attack = new Attack(this.power);
        dagger.latch = true;
        dagger.chain = this.chain;
        dagger.sprite = this.scene_renderer.draw_dagger(player, angle);
        this.scene_physics.ready_dagger(player, dagger);
        this.scene_physics.apply_force(player.sprite, cursor_direction, this.velocity_scalar);
    }

    public apply_scaling(): void {
        this.velocity_scalar = 1.2;
        this.chain = 0;

        if (this.level >= 1) {
            this.velocity_scalar += 0.3;
        }
        if (this.level >= 2) {
            this.chain += 1;
        }
        if (this.level >= 3) {
            this.velocity_scalar += 0.3;
        }
        if (this.level >= 4) {
            this.chain += 1;
        }
        if (this.level >= 5) {

        }

        this.power = 0 + (3 * this.level);
    }
}