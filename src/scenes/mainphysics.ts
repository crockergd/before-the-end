import AbstractSprite from '../abstracts/abstractsprite';
import PhysicsContext from '../contexts/physicscontext';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import ExpDrop from '../entities/expdrop';
import CallbackBinding from '../utils/callbackbinding';
import Vector from '../utils/vector';
import Main from './main';

export default class MainPhysics {
    constructor(readonly scene: Main, readonly render_context: RenderContext, readonly physics_context: PhysicsContext) {

    }

    public ready_player(player: Entity): void {
        player.physics.setBody({
            type: 'rectangle',
            width: 80,
            height: 100
        });
        player.physics.setFixedRotation();
        player.physics.setFriction(0.4, 0.1);
        player.physics.setCollisionCategory(this.physics_context.collision_player);
        player.physics.setCollidesWith(this.physics_context.collision_drop);
    }

    public ready_enemy(enemy: Entity): void {
        enemy.physics.setName(enemy.key);
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

    public ready_dagger(player: Entity, dagger: AbstractSprite): void {
        dagger.physics_body.setName(dagger.uid);
        dagger.physics_body.setCollisionCategory(this.physics_context.collision_attack);
        dagger.physics_body.setCollidesWith(this.physics_context.collision_enemy);

        const constraint: MatterJS.ConstraintType = this.render_context.scene.matter.add.constraint((player.physics as any), (dagger.physics_body as any));

        dagger.physics_body.setOnCollide((collision: any) => {
            this.physics_context.matter.world.remove(constraint);
            dagger.physics_body.setBounce(0.6);
            dagger.physics_body.setFriction(0.4, 0.2);

            let enemy: Entity = this.scene.enemies.find(enemy => enemy.key === collision.bodyA.gameObject.name);
            if (!enemy) enemy = this.scene.enemies.find(enemy => enemy.key === collision.bodyB.gameObject.name);
            if (this.scene.collide(enemy, collision)) {
                this.render_context.delay(50, () => {
                    player.sprite.set_position(enemy.x, enemy.y);
                    player.physics.setVelocity(0);
                }, this);
            }
        });

        this.render_context.tween({
            targets: [dagger.framework_object],
            alpha: 0,
            on_complete: new CallbackBinding(() => {
                this.physics_context.matter.world.remove(constraint);
                dagger.destroy();
            }, this)
        });
    }

    public ready_fan(fan: AbstractSprite): void {
        fan.physics_body.setFriction(0.4, 0.1);
        fan.physics_body.setName(fan.uid);
        fan.physics_body.setCollisionCategory(this.physics_context.collision_attack);
        fan.physics_body.setCollidesWith(this.physics_context.collision_enemy);

        fan.physics_body.setOnCollide((collision: any) => {
            let enemy: Entity = this.scene.enemies.find(enemy => enemy.key === collision.bodyA.gameObject.name);
            if (!enemy) enemy = this.scene.enemies.find(enemy => enemy.key === collision.bodyB.gameObject.name);
            this.scene.collide(enemy, collision);
        });
    }

    public ready_exp_drop(player: Entity, exp_drop: ExpDrop): void {
        exp_drop.sprite.physics_body.setCollisionCategory(this.physics_context.collision_drop);
        exp_drop.sprite.physics_body.setCollidesWith(this.physics_context.collision_player);
        exp_drop.sprite.physics_body.setSensor(true);

        exp_drop.sprite.physics_body.setOnCollideWith(player.physics, () => {
            exp_drop.collected = true;
            this.render_context.untween(exp_drop.sprite.framework_object);
            this.physics_context.matter.world.remove(exp_drop.sprite.physics_body);
        });
    }

    public apply_force(sprite: AbstractSprite, direction: Vector, intensity: number = 1): void {
        const scaled_direction: Vector = direction.normalize().multiply(intensity);
        sprite.physics_body.applyForce(scaled_direction.pv2);
    }
}