import AbstractDepth from '../abstracts/abstractdepth';
import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import Attack from '../entities/equipment/attack';
import AttackType from '../entities/attacktype';
import Entity from '../entities/entity';
import EntityFactory from '../entities/entityfactory';
import EntityState from '../entities/entitystate';
import Dagger from '../entities/equipment/dagger';
import EquipmentInfo from '../entities/equipment/equipmentinfo';
import Fan from '../entities/equipment/fan';
import ExpDrop from '../entities/expdrop';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import Constants from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import StringExtensions from '../utils/stringextensions';
import Vector from '../utils/vector';
import WorldTimer from '../world/worldtimer';
import MainPhysics from './mainphysics';
import MainRenderer from './mainrenderer';
import MainState from './mainstate';

export default class Main extends AbstractScene {
    public state: MainState;
    public scene_renderer: MainRenderer;
    public scene_physics: MainPhysics;

    public timer: WorldTimer;
    public player: Entity;
    public enemies: Array<Entity>;
    public exp_drops: Array<ExpDrop>;
    public debug: AbstractText;

    public enemies_defeated: number;
    public tick_count: number;
    public attack_depth: number;

    public get ready(): boolean {
        return !this.timer.doomed && this.state === MainState.ACTIVE;
    }

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);
        this.physics_context.set_scene(this);

        this.timer = new WorldTimer(this.render_context.now, 30);
        this.scene_renderer = new MainRenderer(this, this.render_context, this.timer);
        this.scene_physics = new MainPhysics(this, this.render_context, this.physics_context);

        this.matter.world.disableGravity();
        this.enemies_defeated = 0;
        this.tick_count = 0;
        this.enemies = new Array<Entity>();
        this.exp_drops = new Array<ExpDrop>();

        this.attack_depth = 0;
    }

    public create(): void {
        this.render_context.transition_scene(TransitionType.IN);

        this.scene_renderer.draw_tiles();

        this.spawn_player();
        this.spawn_enemy(3);

        this.render_context.bind_update('world_tick', new CallbackBinding(() => {
            this.world_tick();
        }, this), 3000);

        this.debug = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
        this.debug.set_depth(AbstractDepth.UI);
        this.debug.affix_ui();

        this.set_state(MainState.ACTIVE);
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        if (!this.ready) return;

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
        this.scene_physics.ready_player(this.player);

        this.player.add_equipment(new Dagger(this, this.render_context));
    }

    public spawn_enemy(count: number = 1): void {
        for (let i: number = 0; i < count; i++) {
            const initial_position: Vector = new Vector(Math.floor(this.player.x), Math.floor(this.player.y));
            const inner_distance: number = 200;
            const outer_distance: number = 350;
            const enemy_position: Vector = MathExtensions.rand_within_donut_from_point(initial_position, inner_distance, outer_distance);

            const enemy: Entity = EntityFactory.create_enemy(EntityFactory.random_enemy_key(), 3 + this.enemies_defeated);
            this.scene_renderer.draw_enemy(enemy_position.x, enemy_position.y, enemy, this.player);
            this.scene_physics.ready_enemy(enemy);

            this.enemies.push(enemy);
        }

        this.enemies = this.enemies.filter(enemy => enemy.alive);
    }

    public spawn_exp(enemy: Entity): void {
        const exp_drop: ExpDrop = new ExpDrop();
        this.scene_renderer.draw_exp_drop(exp_drop, this.player, enemy);
        this.exp_drops.push(exp_drop);

        const initial_position: Vector = new Vector(Math.floor(enemy.x), Math.floor(enemy.y));
        const inner_distance: number = 90;
        const outer_distance: number = 150;
        const drop_location: Vector = MathExtensions.rand_within_donut_from_point(initial_position, inner_distance, outer_distance);

        this.render_context.tween({
            targets: [exp_drop.sprite.framework_object],
            duration: 200,
            x: drop_location.x,
            y: drop_location.y,
            on_complete: new CallbackBinding(() => {
                if (this.timer.doomed) return;

                this.render_context.tween({
                    targets: [exp_drop.sprite.framework_object],
                    duration: 200,
                    y: exp_drop.sprite.framework_object.y + this.render_context.literal(4),
                    yoyo: true,
                    repeat: -1
                });

                this.scene_physics.ready_exp_drop(this.player, exp_drop);
            }, this)
        });
    }

    public click(): void {
        if (!this.player.ready) return;

        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
        const cursor_direction: Vector = new Vector(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
        if (cursor_direction.x > 0) {
            this.player.sprite.flip_x(false);
        } else {
            this.player.sprite.flip_x(true);
        }

        this.attack_depth = 0;
        this.attack();

        this.player.set_state(EntityState.ATTACKING);
        this.render_context.delay(400, () => {
            this.player.set_state(EntityState.IDLE);
        }, this);
    }

    public attack(type: AttackType = AttackType.CURSOR, chained: boolean = false): void {
        let target: Vector;

        switch (type) {
            case AttackType.CURSOR:
                const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
                target = new Vector(pointer.worldX, pointer.worldY);
                break;

            case AttackType.NEAREST:
                const distance_sorted_enemies: Array<Entity> = this.enemies.filter(enemy => enemy.alive).sort((lhs, rhs) => {
                    const lhs_dist: number = Phaser.Math.Distance.Between(lhs.x, lhs.y, this.player.x, this.player.y);
                    const rhs_dist: number = Phaser.Math.Distance.Between(rhs.x, rhs.y, this.player.x, this.player.y);
                    return lhs_dist - rhs_dist;
                });
                if (!distance_sorted_enemies?.length) return;

                const nearest_enemy: Entity = distance_sorted_enemies[0];
                target = new Vector(nearest_enemy.x, nearest_enemy.y);
                break;
        }

        for (const equipment of this.player.equipment) {
            if (!chained || equipment.attack_info.chain >= this.attack_depth) equipment.attack(this.player, target);
        }

        this.attack_depth++;
    }

    public collide(attack: Attack, enemy: Entity, collision: any): boolean {
        const power: number = attack.attack_info.power + this.player.power;

        this.scene_renderer.flash_combat_text(enemy.x, enemy.y - enemy.sprite.height_half + this.render_context.literal(20), StringExtensions.numeric(power));
        this.scene_renderer.flash_combat_hit(enemy);

        if (power >= enemy.power) {
            this.scene_physics.reset_collision(collision);

            if (enemy.alive) {
                this.render_context.camera.shake(200, 0.003);

                this.enemies_defeated++;
                this.timer.extend_time(1);
                enemy.battle_info.alive = false;
                this.scene_renderer.flash_enemy_death(enemy);
                this.spawn_exp(enemy);

                if (attack.attack_info.latch) {
                    this.render_context.delay(50, () => {
                        this.player.sprite.set_position(enemy.x, enemy.y);
                        this.player.physics_body.setVelocity(0);
                    }, this);
                }

                if (attack.attack_info.chain >= this.attack_depth) {
                    this.render_context.delay(75, () => {
                        this.attack(AttackType.NEAREST, true);
                    }, this);
                }

                return true;
            }

            return false;

        } else {
            enemy.battle_info.power -= power;

            return false;
        }
    }

    public add_exp(experience: number): void {
        this.player.add_exp(experience);
        while (this.player.level_info.experience >= this.player.level_info.chart[this.player.level_info.level]) {
            this.level_up();
        }
    }

    public level_up(): void {
        this.player.level_info.level++;
        this.player.battle_info.power += 5;
        this.scene_renderer.flash_combat_text(this.player.x, this.player.y, 'LEVEL UP');

        const loot: Array<EquipmentInfo> = [{
            type: 'Dagger',
            key: 'dagger',
            name: 'Dagger',
            level: 0
        }, {
            type: 'Fan',
            key: 'fan',
            name: 'Fan',
            level: 0
        }];

        this.set_state(MainState.PAUSED);
        this.render_context.cache.loot_selection_cache.present(this.player, loot, new CallbackBinding(() => {
            this.set_state(MainState.ACTIVE);
        }, this));
    }

    public set_state(state: MainState): void {
        this.state = state;

        switch (state) {
            case MainState.ACTIVE:
                this.render_context.camera.postFX.clear();
                this.input.on(Constants.UP_EVENT, this.click, this);
                break;
            case MainState.PAUSED:
                this.input.off(Constants.UP_EVENT);
                this.render_context.camera.postFX.addBlur();
                this.render_context.camera.postFX.addGradient(0x000, 0x000, 0.6);
                break;
        }
    }

    public world_tick(): void {
        if (!this.ready) return;

        const enemies_summoned: number = 2 + (Math.floor(this.tick_count / 2));
        this.spawn_enemy(enemies_summoned);

        this.timer.difficulty_scalar += (this.tick_count / 64);

        this.tick_count++;
    }

    public end_game(): void {
        this.input.off(Constants.UP_EVENT);
        this.render_context.cache.tweens.killAll();
        this.render_context.camera.stopFollow();
        this.render_context.unbind_update('world_tick');

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
    }
}