export const enum AbstractDepth {
    BASELINE = 0,
    BG = BASELINE - 1,
    FIELD = BASELINE + 1,
    UI = FIELD + 1,
    ALPHA_FILL = UI + 1,
    INACTIVE_WINDOW = ALPHA_FILL + 1,
    ACTIVE_WINDOW = INACTIVE_WINDOW + 1,
    NOTIFICATION = ACTIVE_WINDOW + 1
}

export default AbstractDepth;