import AbstractSprite from '../abstracts/abstractsprite';
import PhysicsContext from '../contexts/physicscontext';
import RenderContext from '../contexts/rendercontext';
import Attack from '../entities/equipment/attack';
import Entity from '../entities/entity';
import ExpDrop from '../entities/expdrop';
import CallbackBinding from '../utils/callbackbinding';
import Vector from '../utils/vector';
import Main from './main';

export default class MainPhysics {
    public get world(): Phaser.Physics.Matter.World {
        return this.physics_context.matter.world;
    }

    constructor(readonly scene: Main, readonly render_context: RenderContext, readonly physics_context: PhysicsContext) {

    }

    public ready_player(player: Entity): void {
        const body_dimensions: Vector = new Vector(80, 100);
        body_dimensions.multiply(this.render_context.base_scale_factor);

        player.physics_body.setBody({
            type: 'rectangle',
            width: body_dimensions.x,
            height: body_dimensions.y
        });
        player.physics_body.setFixedRotation();
        player.physics_body.setFriction(0.4, 0.1);
        player.physics_body.setCollisionCategory(this.physics_context.collision_player);
        player.physics_body.setCollidesWith(this.physics_context.collision_drop);
    }

    public ready_enemy(enemy: Entity): void {
        const body_dimensions: Vector = new Vector(60, 80);
        body_dimensions.multiply(this.render_context.base_scale_factor);

        enemy.physics_body.setName(enemy.key);
        enemy.physics_body.setBody({
            type: 'rectangle',
            width: body_dimensions.x,
            height: body_dimensions.y
        });
        enemy.physics_body.setFixedRotation();
        enemy.physics_body.setStatic(true);
        enemy.physics_body.setBounce(0.8);
        enemy.physics_body.setCollisionCategory(this.physics_context.collision_enemy);
        enemy.physics_body.setCollidesWith(this.physics_context.collision_attack);
    }

    public ready_dagger(player: Entity, dagger: Attack): void {
        dagger.physics_body.setName(dagger.sprite.uid);
        dagger.physics_body.setCollisionCategory(this.physics_context.collision_attack);
        dagger.physics_body.setCollidesWith(this.physics_context.collision_enemy);

        const constraint: MatterJS.ConstraintType = this.render_context.scene.matter.add.constraint((player.physics_body as any), (dagger.physics_body as any));

        dagger.physics_body.setOnCollide((collision: any) => {
            this.world.remove(constraint);
            this.collide_enemy(player, dagger, collision);
            dagger.attack_info.latch = false;
        });

        this.render_context.tween({
            targets: [dagger.sprite.framework_object],
            alpha: 0,
            on_complete: new CallbackBinding(() => {
                this.world.remove(constraint);
                dagger.destroy();
            }, this)
        });
    }

    public ready_fan(player: Entity, fan: Attack): void {
        fan.physics_body.setSensor(false);
        fan.physics_body.setVelocity(0);
        fan.physics_body.setAngularVelocity(1);
        fan.physics_body.setFriction(0.4, 0.1);
        fan.physics_body.setName(fan.sprite.uid);
        fan.physics_body.setCollisionCategory(this.physics_context.collision_attack);
        fan.physics_body.setCollidesWith(this.physics_context.collision_enemy);

        fan.physics_body.setOnCollide((collision: any) => {
            fan.physics_body.setFriction(0.2, 0.05);
            this.collide_enemy(player, fan, collision);
        });
    }

    public ready_exp_drop(player: Entity, exp_drop: ExpDrop): void {
        exp_drop.sprite.physics_body.setCollisionCategory(this.physics_context.collision_drop);
        exp_drop.sprite.physics_body.setCollidesWith(this.physics_context.collision_player);
        exp_drop.sprite.physics_body.setSensor(true);

        exp_drop.sprite.physics_body.setOnCollideWith(player.physics_body, () => {
            if (exp_drop.collected) return;

            exp_drop.collected = true;
            this.render_context.untween(exp_drop.sprite.framework_object);
        });
    }

    public collide_enemy(player: Entity, attack: Attack, collision: any): boolean {
        let enemy: Entity = this.scene.enemies.find(enemy => enemy.key === collision.bodyA.gameObject.name);
        if (!enemy) enemy = this.scene.enemies.find(enemy => enemy.key === collision.bodyB.gameObject.name);
        if (!enemy) return false;

        return this.scene.collide(attack, enemy, collision);
    }

    public apply_force(sprite: AbstractSprite, direction: Vector, intensity: number = 1): void {
        const scaled_direction: Vector = direction.normalize().multiply(intensity);
        scaled_direction.multiply(this.render_context.screen_scale_factor);
        sprite.physics_body.applyForce(scaled_direction.pv2);
    }

    public reset_collision(collision: any): void {
        collision.isActive = false;
        collision.bodyA.gameObject.setVelocity(0);
        collision.bodyB.gameObject.setVelocity(0);
        collision.bodyA.gameObject.setCollidesWith(this.physics_context.collision_none);
        collision.bodyB.gameObject.setCollidesWith(this.physics_context.collision_none);
    }

    public reset_body(sprite: AbstractSprite): void {
        sprite.physics_body.setCollidesWith(this.physics_context.collision_none);
    }
}