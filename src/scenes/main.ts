import AbstractDepth from '../abstracts/abstractdepth';
import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import Entity from '../entities/entity';
import EntityFactory from '../entities/entityfactory';
import ExpDrop from '../entities/expdrop';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import { Constants } from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import StringExtensions from '../utils/stringextensions';
import Vector from '../utils/vector';
import WorldTimer from '../world/worldtimer';
import MainRenderer from './mainrenderer';

export default class Main extends AbstractScene {
    public scene_renderer: MainRenderer;

    public timer: WorldTimer;
    public player: Entity;
    public enemies: Array<Entity>;
    public exp_drops: Array<ExpDrop>;
    public debug: AbstractText;

    public enemies_defeated: number;
    public tick_count: number;

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);
        this.physics_context.set_scene(this);

        this.timer = new WorldTimer(this.render_context.now, 600);
        this.scene_renderer = new MainRenderer(this.render_context, this.physics_context, this.timer);

        this.matter.world.disableGravity();
        this.enemies_defeated = 0;
        this.tick_count = 0;
        this.enemies = new Array<Entity>();
        this.exp_drops = new Array<ExpDrop>();
    }

    public create(): void {
        this.render_context.transition_scene(TransitionType.IN);

        const transition: AbstractSprite = this.render_context.add_sprite(0, 0, 'zone_courtyards_transition');
        transition.set_anchor(0.5, 0.5);

        this.spawn_player();
        this.spawn_enemy(3);

        this.render_context.bind_update('world_tick', new CallbackBinding(() => {
            this.world_tick();
        }, this), 3000);

        this.debug = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
        this.debug.set_depth(AbstractDepth.UI);
        this.debug.affix_ui();

        this.render_context.camera.setBackgroundColor(0x003003);
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        if (this.timer.doomed) return;

        this.debug.text = 'Position: ' + Math.floor(this.player.x) + ', ' + Math.floor(this.player.y) + Constants.LINE_BREAK +
            'Enemies Defeated: ' + this.enemies_defeated + Constants.LINE_BREAK +
            'Time Remaining: ' + Math.floor(this.timer.expiry_time) + Constants.LINE_BREAK +
            'Time Elapsed: ' + Math.ceil(this.timer.elapsed_time); // + Constants.LINE_BREAK +
        // 'Enemies: ' + this.enemies.length;

        // let count: number = 0;
        // for (const scene of this.game.scene.scenes) {
        //     count += scene.children.getChildren().filter(child => child.willRender(this.render_context.camera)).length;
        // }

        // this.debug.text = 'Display List: ' + count.toString();
        // this.debug.text += Constants.LINE_BREAK + 'FPS: ' + StringExtensions.numeric(this.render_context.scene.game.loop.actualFps);

        for (const exp_drop of this.exp_drops.filter(exp_drop => exp_drop.collected)) {
            const player_direction: Vector = new Vector(exp_drop.sprite.absolute_x - this.player.x, exp_drop.sprite.absolute_y - this.player.y);
            const distance: number = Math.abs(player_direction.x + player_direction.y);

            if (distance < 3) {
                exp_drop.absorbed = true;
                exp_drop.sprite.destroy();
                this.exp_drops = this.exp_drops.filter(exp_drop => !exp_drop.absorbed);
                this.add_exp(10);

            } else {
                player_direction.normalize();
                player_direction.multiply(400 * dt);
                exp_drop.sprite.set_position(exp_drop.sprite.absolute_x - player_direction.x, exp_drop.sprite.absolute_y - player_direction.y);
            }
        }

        if (!this.timer.update(dt)) {
            this.end_game();
        }
        this.scene_renderer.update(dt);
    }

    public spawn_player(): void {
        this.player = EntityFactory.create_player('bandit');
        this.scene_renderer.draw_player(this.player);

        this.input.on(Constants.UP_EVENT, this.click, this);
    }

    public spawn_enemy(count: number = 1): void {
        for (let i: number = 0; i < count; i++) {
            const initial_position: Vector = new Vector(Math.floor(this.player.x), Math.floor(this.player.y));
            const inner_distance: number = 200;
            const outer_distance: number = 350;
            const enemy_position: Vector = MathExtensions.rand_within_donut_from_point(initial_position, inner_distance, outer_distance);

            const enemy: Entity = EntityFactory.create_enemy(EntityFactory.random_enemy_key(), 3 + this.enemies_defeated);
            this.scene_renderer.draw_enemy(enemy_position.x, enemy_position.y, enemy);

            enemy.physics.setOnCollide((collision: any) => {
                this.collide(this.player, enemy, collision);
            });

            this.enemies.push(enemy);
        }

        this.enemies = this.enemies.filter(enemy => enemy.alive);
    }

    public spawn_exp(enemy: Entity): void {
        const exp_drop: ExpDrop = new ExpDrop();
        this.scene_renderer.draw_exp_drop(exp_drop, this.player, enemy);
        this.exp_drops.push(exp_drop);
    }

    public click(): void {
        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;

        const cursor_direction: Vector = new Vector(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
        if (cursor_direction.x > 0) {
            this.player.sprite.flip_x(false);
        } else {
            this.player.sprite.flip_x(true);
        }

        const angle: number = MathExtensions.vector_to_degrees(cursor_direction);
        this.scene_renderer.draw_attack(this.player, angle);

        const normalized_direction: Vector = cursor_direction.normalize();
        this.player.physics.applyForce(normalized_direction.pv2);
    }

    public collide(player: Entity, enemy: Entity, collision: any): void {
        this.scene_renderer.flash_combat_text(enemy.x, enemy.y - enemy.sprite.height_half + this.render_context.literal(20), StringExtensions.numeric(player.power));
        this.scene_renderer.flash_combat_hit(enemy);

        if (player.power >= enemy.power) {
            collision.isActive = false;
            collision.bodyA.gameObject.setVelocity(0);
            collision.bodyB.gameObject.setVelocity(0);
            this.matter.world.remove(collision.bodyA.gameObject);
            this.matter.world.remove(collision.bodyB.gameObject);

            if (enemy.alive) {
                this.render_context.camera.shake(200, 0.003);

                this.enemies_defeated++;
                this.timer.extend_time(0.5);
                enemy.battle_info.alive = false;
                this.scene_renderer.flash_enemy_death(enemy);
                this.spawn_exp(enemy);

                this.render_context.delay(50, () => {
                    this.player.sprite.set_position(enemy.x, enemy.y);
                    this.player.physics.setVelocity(0);
                }, this);
            }

        } else {
            enemy.battle_info.power -= this.player.power;
        }
    }

    public add_exp(experience: number): void {
        this.player.add_exp(experience);
        while (this.player.level_info.experience >= this.player.level_info.chart[this.player.level_info.level]) {
            this.player.level_info.level++;
            this.player.battle_info.power += 5;
            this.scene_renderer.flash_combat_text(this.player.x, this.player.y, 'LEVEL UP');
        }
    }

    public world_tick(): void {
        const enemies_summoned: number = 2 + (Math.floor(this.tick_count / 2));
        this.spawn_enemy(enemies_summoned);

        this.timer.difficulty_scalar += (this.tick_count / 8);

        this.tick_count++;
    }

    public end_game(): void {
        this.timer.doomed = true;
        this.scene_renderer.draw_game_over(this.player, new CallbackBinding(() => {
            this.input.once(Constants.UP_EVENT, () => {
                this.render_context.transition_scene(TransitionType.OUT, new CallbackBinding(() => {
                    this.start('menu', {
                        scene_context: this.scene_context
                    });
                }, this));
            }, this);
        }, this));
        this.input.off(Constants.UP_EVENT);

        this.render_context.camera.stopFollow();
        this.render_context.unbind_update('world_tick');
    }
}