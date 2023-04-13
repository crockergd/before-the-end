import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import Entity from '../entities/entity';
import EntityFactory from '../entities/entityfactory';
import TransitionType from '../ui/transitiontype';
import { Constants } from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import Vector from '../utils/vector';
import MainRenderer from './mainrenderer';

export default class Main extends AbstractScene {
    public scene_renderer: MainRenderer;

    public player: Entity;
    public enemies: Array<Entity>;
    public debug: AbstractText;

    public start_time: number;
    public enemies_defeated: number;

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);

        this.scene_renderer = new MainRenderer(this.render_context);

        this.matter.world.disableGravity();
        this.enemies_defeated = 0;
        this.enemies = new Array<Entity>();
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

        this.debug.text = 'Position: ' + Math.floor(this.player.x) + ', ' + Math.floor(this.player.y) + Constants.LINE_BREAK +
            'Enemies Defeated: ' + this.enemies_defeated + Constants.LINE_BREAK +
            'Time Elapsed: ' + Math.floor((this.render_context.now - this.start_time) / 1000);
    }

    public spawn_player(): void {
        this.player = EntityFactory.create_player('bandit');
        this.scene_renderer.draw_player(this.player);

        this.input.on(Constants.UP_EVENT, () => {
            const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;

            const normalized_cursor_direction: Vector = new Vector(pointer.worldX - this.player.x, pointer.worldY - this.player.y).normalize();

            if (normalized_cursor_direction.x > 0) {
                this.player.sprite.flip_x(false);
            } else {
                this.player.sprite.flip_x(true);
            }

            this.player.physics.applyForce(normalized_cursor_direction.pv2);
        }, this);
    }

    public spawn_enemy(): void {
        const initial_position: Vector = new Vector(Math.floor(this.player.x), Math.floor(this.player.y));
        const distance: number = 300;
        const bounds: Vector = new Vector(initial_position.x - distance, initial_position.y - distance, initial_position.x + distance, initial_position.y + distance);
        const enemy_position: Vector = MathExtensions.rand_within_bounds(bounds);

        const enemy: Entity = EntityFactory.create_enemy(EntityFactory.random_enemy_key(), 3 + this.enemies_defeated);
        this.scene_renderer.draw_enemy(enemy, enemy_position);

        enemy.physics.setOnCollide(() => {
            this.enemies_defeated++;
            enemy.destroy();

            this.spawn_enemy();
            this.spawn_enemy();
        });
    }
}