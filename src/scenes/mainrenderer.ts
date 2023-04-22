import AbstractDepth from '../abstracts/abstractdepth';
import AbstractGroup from '../abstracts/abstractgroup';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import PhysicsContext from '../contexts/physicscontext';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import CallbackBinding from '../utils/callbackbinding';
import Vector from '../utils/vector';
import WorldTimer from '../world/worldtimer';
import MathExtensions from '../utils/mathextensions';
import ExpDrop from '../entities/expdrop';

export default class MainRenderer {
    public world_timer_group: AbstractGroup;
    public world_timer_bar: AbstractSprite;
    public world_timer_frame: AbstractSprite;

    constructor(readonly render_context: RenderContext, readonly physics_context: PhysicsContext, readonly timer: WorldTimer) {
        this.draw_world_timer();
    }

    public update(dt: number): void {
        const width: number = 356;
        const height: number = 6;
        this.world_timer_bar.crop(0, 0, width * this.timer.remaining_percentage, height);
    }

    public draw_player(player: Entity): void {
        player.sprite = this.render_context.add_sprite(0, 0, player.sprite_key, undefined, undefined, true);
        player.sprite.set_anchor(0.5, 0.5);
        player.sprite.set_depth(AbstractDepth.FIELD);
        player.sprite.play('idle_' + player.sprite_key);

        player.physics.setBody({
            type: 'rectangle',
            width: 80,
            height: 100
        });
        player.physics.setFixedRotation();
        player.physics.setFriction(0.4, 0.1);
        player.physics.setCollisionCategory(this.physics_context.collision_player);
        player.physics.setCollidesWith(this.physics_context.collision_drop);

        this.render_context.camera.startFollow(player.sprite.framework_object, true, 0.6, 0.6);
    }

    public draw_enemy(x: number, y: number, enemy: Entity): void {
        enemy.sprite = this.render_context.add_sprite(x, y, enemy.sprite_key, undefined, undefined, true);
        enemy.sprite.set_anchor(0.5, 0.5);
        enemy.sprite.play('idle_' + enemy.sprite_key);

        enemy.physics.setBody({
            type: 'rectangle',
            width: 60,
            height: 80
        });
        enemy.physics.setFixedRotation();
        enemy.physics.setStatic(true);
        enemy.physics.setBounce(0.8);
        enemy.physics.setCollisionCategory(this.physics_context.collision_enemy);
        enemy.physics.setCollidesWith(this.physics_context.collision_attack);
    }

    public draw_attack(player: Entity, angle: number): void {
        const effect: AbstractSprite = this.render_context.add_sprite(player.x, player.y, 'stab', undefined, undefined, true);
        effect.set_depth(AbstractDepth.FIELD);
        effect.set_rotation(angle);

        effect.physics_body.setName(effect.uid);
        // effect.physics_body.setFixedRotation();
        effect.physics_body.setCollisionCategory(this.physics_context.collision_attack);
        effect.physics_body.setCollidesWith(this.physics_context.collision_enemy);

        const constraint: MatterJS.ConstraintType = this.render_context.scene.matter.add.constraint((player.physics as any), (effect.physics_body as any));

        effect.physics_body.setOnCollide((collision: any) => {
            // collision.isActive = false;
            // effect.physics_body.setCollidesWith(this.physics_context.collision_none);
            this.physics_context.matter.world.remove(constraint);
            effect.physics_body.setBounce(0.6);
            effect.physics_body.setFriction(0.4, 0.2);

            // this.physics_context.matter.world.remove(effect.physics_body);
            // effect.physics_body.setVelocity(0);
            // this.render_context.untween(effect.framework_object);
            // effect.destroy();
        });

        this.render_context.tween({
            targets: [effect.framework_object],
            alpha: 0,
            on_complete: new CallbackBinding(() => {
                this.physics_context.matter.world.remove(constraint);
                effect.destroy();
            }, this)
        });
    }

    public draw_exp_drop(exp_drop: ExpDrop, player: Entity, enemy: Entity): void {
        const initial_position: Vector = new Vector(Math.floor(enemy.x), Math.floor(enemy.y));
        const inner_distance: number = 90;
        const outer_distance: number = 150;
        const drop_location: Vector = MathExtensions.rand_within_donut_from_point(initial_position, inner_distance, outer_distance);

        exp_drop.sprite = this.render_context.add_sprite(enemy.x, enemy.y, 'exp_drop', undefined, undefined, true);
        exp_drop.sprite.set_anchor(0.5, 0.5);

        this.render_context.tween({
            targets: [exp_drop.sprite.framework_object],
            duration: 200,
            x: drop_location.x,
            y: drop_location.y,
            on_complete: new CallbackBinding(() => {
                this.render_context.tween({
                    targets: [exp_drop.sprite.framework_object],
                    duration: 200,
                    y: exp_drop.sprite.framework_object.y + this.render_context.literal(4),
                    yoyo: true,
                    repeat: -1
                });

                exp_drop.sprite.physics_body.setCollisionCategory(this.physics_context.collision_drop);
                exp_drop.sprite.physics_body.setCollidesWith(this.physics_context.collision_player);
                exp_drop.sprite.physics_body.setSensor(true);

                exp_drop.sprite.physics_body.setOnCollideWith(player.physics, () => {
                    exp_drop.collected = true;
                    this.render_context.untween(exp_drop.sprite.framework_object);
                    this.physics_context.matter.world.remove(exp_drop.sprite.physics_body);
                });
            }, this)
        });
    }

    public draw_world_timer(): void {
        this.world_timer_group = this.render_context.add_group();
        this.world_timer_group.set_position(this.render_context.center_x, this.render_context.height - this.render_context.space_buffer);
        this.world_timer_group.affix_ui();
        this.world_timer_group.set_depth(AbstractDepth.UI);

        this.world_timer_frame = this.render_context.add_sprite(0, 0, 'world_timer_frame', this.world_timer_group);
        this.world_timer_frame.set_anchor(0.5, 1);

        this.world_timer_bar = this.render_context.add_sprite(0, - this.render_context.literal(2), 'world_timer_bar', this.world_timer_group);
        this.world_timer_bar.set_anchor(0.5, 1);
    }

    public draw_game_over(player: Entity, on_complete: CallbackBinding): void {
        const game_over_text: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y, 'Game Over');
        game_over_text.set_anchor(0.5, 0.5);
        game_over_text.affix_ui();
        game_over_text.set_scale(5, 5);
        game_over_text.set_depth(AbstractDepth.UI);
        game_over_text.set_alpha(0);

        const duration: number = 200;

        this.render_context.tween({
            targets: [game_over_text.framework_object],
            alpha: 1,
            duration: duration
        });

        this.render_context.tween({
            targets: [player.sprite.framework_object],
            alpha: 0,
            duration: duration,
            on_complete: new CallbackBinding(() => {
                player.battle_info.alive = false;
                player.destroy();
            }, this)
        });

        const vignette: Phaser.FX.Vignette = this.render_context.camera.postFX.addVignette(undefined, undefined, 1, 0);

        this.render_context.scene.tweens.add({
            targets: [vignette],
            radius: 0.5,
            strength: 0.5,
            duration: duration
        });

        this.render_context.delay(1000, () => {
            on_complete.call();
        }, this);
    }

    public flash_combat_text(x: number, y: number, value: string): void {
        const dmg_text: AbstractText = this.render_context.add_text(x, y, value);
        dmg_text.set_depth(AbstractDepth.UI);
        dmg_text.set_anchor(0.5, 1);
        dmg_text.set_scale(3, 3);

        this.render_context.tween({
            targets: [dmg_text.framework_object],
            duration: 400,
            alpha: 0,
            y: dmg_text.y - 20,
            on_complete: new CallbackBinding(() => {
                dmg_text.destroy();
            }, this)
        });
    }

    public flash_combat_hit(enemy: Entity): void {
        // const hit: AbstractSprite = this.render_context.add_sprite(enemy.x, enemy.y, 'hit_slash');
        // hit.set_anchor(0.5, 0.5);

        // hit.play('hit_slash', undefined, undefined, new CallbackBinding(() => {
        //     hit.destroy();
        // }, this));

        const glow: Phaser.FX.Glow = enemy.sprite.framework_object.postFX.addGlow(0x7f062e, 0, 0);

        this.render_context.tween({
            targets: [glow],
            duration: 160,
            innerStrength: 4,
            yoyo: true,
            on_complete: new CallbackBinding(() => {
                glow.destroy();
            }, this)
        });
    }

    public flash_enemy_death(enemy: Entity): void {
        this.render_context.tween({
            targets: [enemy.sprite.framework_object],
            alpha: 0,
            duration: 100,
            on_complete: new CallbackBinding(() => {
                enemy.destroy();
            }, this)
        });
    }
}