import AbstractScene from './abstractscene';

export default interface AbstractSpriteConfig {
    physics?: boolean;
    cacheable?: boolean;
    affixed?: boolean;
    scene_override?: AbstractScene;
}