import CallbackBinding from './callbackbinding';

export default interface TweenConfig {
    targets?: Array<any>;
    duration?: number;
    x?: number;
    y?: number;
    alpha?: number;
    scale?: number;
    intensity?: number;
    yoyo?: boolean;
    on_complete?: CallbackBinding;
    on_update?: CallbackBinding;
    delay?: number;
    repeat?: number;
    repeatDelay?: number;
    unique?: boolean;
    ease?: any;
    blocking?: boolean;
}