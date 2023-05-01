import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import SettingJson from '../json_defs/settingjson';
import CallbackBinding from '../utils/callbackbinding';
import Constants from '../utils/constants';
import StringExtensions from '../utils/stringextensions';
import LootSelectionCache from './cacheables/lootselectioncache';

export default class Cache extends AbstractScene {
    public loot_selection_cache: LootSelectionCache;
    public settings: SettingJson;

    private debug_text: AbstractText;

    public create(): void {
        this.render_context.set_scene(this);

        this.settings = this.render_context.get_json('settings').settings;

        this.loot_selection_cache = new LootSelectionCache(this);

        if (this.settings.dev) {
            this.debug_text = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
            this.debug_text.affix_ui();
        }
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        this.render_context.update(time, dt_ms);
    }

    public ready(): void {

    }

    public render_display_list(): void {
        let count: number = 0;
        for (const scene of this.game.scene.scenes) {
            count += scene.children.getChildren().filter(child => child.willRender(this.render_context.camera)).length;
        }

        this.debug_text.text = 'Display List: ' + count.toString();
        this.debug_text.text += Constants.LINE_BREAK + 'FPS: ' + StringExtensions.numeric(this.render_context.scene.game.loop.actualFps);
    }

    public update_scene(key: string): void {
        if (this.loot_selection_cache) this.loot_selection_cache.hide();

        this.render_context.undelay();
        this.render_context.unbind_update();
        this.render_context.cache.tweens.killAll();

        if (this.settings.dev) {
            this.render_context.bind_update('debug', new CallbackBinding(() => {
                this.render_display_list();
            }, this), 1000);
        }
    }
}