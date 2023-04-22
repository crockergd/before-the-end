export abstract class Constants {
    public static readonly TAP_EVENT: string = 'tap';
    public static readonly DOWN_EVENT: string = 'pointerdown';
    public static readonly UP_EVENT: string = 'pointerup';
    public static readonly OVER_EVENT: string = 'pointerover';
    public static readonly OUT_EVENT: string = 'pointerout';
    public static readonly INFO_EVENT: string = 'infoevent';
    public static readonly NAV_EVENT: string = 'navigate';
    public static readonly POSTNAV_EVENT: string = 'postnavigate';
    public static readonly UNNAV_EVENT: string = 'unnavigate';
    public static readonly OUTNAV_EVENT: string = 'outnavigate';
    public static readonly EVENT_RECAST: string = '-recast';

    public static readonly CLASS_KEYS: Array<string> = ['bandit'];
    public static readonly ENEMY_KEYS: Array<string> = ['servant', 'baron'];

    public static readonly IDLE_ANIMATION_RATE: number = 4;

    public static readonly LINE_BREAK: string = '\n';
    public static readonly TAB: string = '     ';
}