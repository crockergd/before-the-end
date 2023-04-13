import Entity from './entity';
import IdentifierInfo from './identifierinfo';
import UID from '../utils/uid';
import Team from './team';
import BattleInfo from './battleinfo';
import ObjectExtensions from '../utils/objectextensions';
import { Constants } from '../utils/constants';

export default abstract class EntityFactory {
    public static create_player(sprite_key: string): Entity {
        const identifier_info: IdentifierInfo = {
            key: UID.next('player'),
            sprite_key: sprite_key,
            team: Team.PLAYERS
        };

        const battle_info: BattleInfo = {
            alive: true,
            power: 5
        };

        return new Entity(identifier_info, battle_info);
    }

    public static create_enemy(sprite_key: string, power: number): Entity {
        const identifier_info: IdentifierInfo = {
            key: UID.next('enemy'),
            sprite_key: sprite_key,
            team: Team.ENEMIES
        };

        const battle_info: BattleInfo = {
            alive: true,
            power: power
        };

        return new Entity(identifier_info, battle_info);
    }

    public static random_enemy_key(): string {
        return ObjectExtensions.array_rand(Constants.ENEMY_KEYS);
    }
}