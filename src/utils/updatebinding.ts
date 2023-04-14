import CallbackBinding from './callbackbinding';

export default interface UpdateBinding {
    key: string;
    callback: CallbackBinding;
    last_time: number;
    interval: number;
}