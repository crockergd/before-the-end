import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import LootSelectionCache from './cacheables/lootselectioncache';

export default class Cache extends AbstractScene {
    public loot_selection_cache: LootSelectionCache;

    private debug_text: AbstractText;

    public create(): void {
        this.render_context.set_scene(this);

        this.loot_selection_cache = new LootSelectionCache(this);

        // if (Global.settings.dev) {
        //     this.debug_text = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
        //     this.debug_text.set_font_size(12);
        //     // this.debug_text.set_stroke(this.render_context.literal(1));

        //     this.render_context.bind_update('debug', new CallbackBinding(() => {
        //         this.render_display_list();
        //     }, this), 1000);
        // }
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        this.render_context.update(time, dt_ms);
    }

    public ready(): void {

    }

    public render_display_list(): void {
        return;

        // let count: number = 0;
        // for (const scene of this.game.scene.scenes) {
        //     count += scene.children.getChildren().filter(child => child.willRender(this.render_context.camera)).length;
        // }

        // this.debug_text.text = 'Display List: ' + count.toString();
        // this.debug_text.text += Constants.LINE_BREAK + 'FPS: ' + StringExtensions.numeric(this.render_context.scene.game.loop.actualFps);
    }

    public update_scene(key: string): void {
        if (this.loot_selection_cache) this.loot_selection_cache.hide();

        this.render_context.undelay();
    }
}