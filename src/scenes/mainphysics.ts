import AbstractSprite from '../abstracts/abstractsprite';
import PhysicsContext from '../contexts/physicscontext';
import RenderContext from '../contexts/rendercontext';
import Attack from '../entities/attacks/attack';
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
        player.physics_body.setBody({
            type: 'rectangle',
            width: 80,
            height: 100
        });
        player.physics_body.setFixedRotation();
        player.physics_body.setFriction(0.4, 0.1);
        player.physics_body.setCollisionCategory(this.physics_context.collision_player);
        player.physics_body.setCollidesWith(this.physics_context.collision_drop);
    }

    public ready_enemy(enemy: Entity): void {
        enemy.physics_body.setName(enemy.key);
        enemy.physics_body.setBody({
            type: 'rectangle',
            width: 60,
            height: 80
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

            let enemy: Entity = this.scene.enemies.find(enemy => enemy.key === collision.bodyA.gameObject.name);
            if (!enemy) enemy = this.scene.enemies.find(enemy => enemy.key === collision.bodyB.gameObject.name);
            if (this.scene.collide(dagger, enemy, collision)) {
                this.render_context.delay(50, () => {
                    player.sprite.set_position(enemy.x, enemy.y);
                    player.physics_body.setVelocity(0);
                }, this);
            }
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

    public ready_fan(fan: Attack): void {
        fan.physics_body.setFriction(0.4, 0.1);
        fan.physics_body.setName(fan.sprite.uid);
        fan.physics_body.setCollisionCategory(this.physics_context.collision_attack);
        fan.physics_body.setCollidesWith(this.physics_context.collision_enemy);

        fan.physics_body.setOnCollide((collision: any) => {
            this.collide_enemy(fan, collision);
        });
    }

    public ready_exp_drop(player: Entity, exp_drop: ExpDrop): void {
        exp_drop.sprite.physics_body.setCollisionCategory(this.physics_context.collision_drop);
        exp_drop.sprite.physics_body.setCollidesWith(this.physics_context.collision_player);
        exp_drop.sprite.physics_body.setSensor(true);

        exp_drop.sprite.physics_body.setOnCollideWith(player.physics_body, () => {
            exp_drop.collected = true;
            this.render_context.untween(exp_drop.sprite.framework_object);
            this.world.remove(exp_drop.sprite.physics_body);
        });
    }

    public collide_enemy(attack: Attack, collision: any): boolean {
        let enemy: Entity = this.scene.enemies.find(enemy => enemy.key === collision.bodyA.gameObject.name);
        if (!enemy) enemy = this.scene.enemies.find(enemy => enemy.key === collision.bodyB.gameObject.name);
        return this.scene.collide(attack, enemy, collision);
    }

    public reset_collision(collision: any): void {
        collision.isActive = false;
        collision.bodyA.gameObject.setVelocity(0);
        collision.bodyB.gameObject.setVelocity(0);
        this.world.remove(collision.bodyA.gameObject);
        this.world.remove(collision.bodyB.gameObject);
    }

    public apply_force(sprite: AbstractSprite, direction: Vector, intensity: number = 1): void {
        const scaled_direction: Vector = direction.normalize().multiply(intensity);
        sprite.physics_body.applyForce(scaled_direction.pv2);
    }
}