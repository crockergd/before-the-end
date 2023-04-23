import Entity from './entity';
import IdentifierInfo from './identifierinfo';
import UID from '../utils/uid';
import Team from './team';
import BattleInfo from './battleinfo';
import ObjectExtensions from '../utils/objectextensions';
import Constants from '../utils/constants';
import LevelInfo from './levelinfo';
import EntityState from './entitystate';

export default abstract class EntityFactory {
    public static create_player(sprite_key: string): Entity {
        const identifier_info: IdentifierInfo = {
            key: UID.next('player'),
            sprite_key: sprite_key,
            team: Team.PLAYERS
        };

        const battle_info: BattleInfo = {
            alive: true,
            state: EntityState.IDLE,
            power: 5
        };

        const level_info: LevelInfo = {
            level: 0,
            experience: 0,
            chart: EntityFactory.generate_exp_chart(99, 30, 60, 0.2)
        };

        return new Entity(identifier_info, battle_info, level_info);
    }

    public static create_enemy(sprite_key: string, power: number): Entity {
        const identifier_info: IdentifierInfo = {
            key: UID.next('enemy'),
            sprite_key: sprite_key,
            team: Team.ENEMIES
        };

        const battle_info: BattleInfo = {
            alive: true,
            state: EntityState.IDLE,
            power: power
        };

        return new Entity(identifier_info, battle_info);
    }

    public static random_enemy_key(): string {
        return ObjectExtensions.array_rand(Constants.ENEMY_KEYS);
    }

    public static generate_exp_chart(maximum_level: number, initial_exp_cost: number, initial_step: number, scalar: number): Array<number> {
        const chart: Array<number> = new Array<number>();

        for (let i: number = 0; i < maximum_level; i++) {
            let value: number = initial_exp_cost + (initial_step * i);
            value *= 1 + (scalar * i);
            value = Math.floor(value);
            chart.push(value);
        }

        return chart;
    }
}