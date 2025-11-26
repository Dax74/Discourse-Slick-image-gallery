import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

// Versione per Theme Component: assume slick è caricato globalmente (CDN o upload)
// e jQuery è disponibile su window.jQuery (Discourse espone jQuery globalmente).
export default class SlickImageGalleryComponent extends Component {
  @tracked currentSlide = 0;

  get slickOptions() {
    return {
      dots: true,
      arrows: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true,
      ...(this.args.options || {}),
    };
  }

  _rootElement = null;

  @action
  setupSlick(element) {
    this._rootElement = element;

    if (window.jQuery && element) {
      const $el = window.jQuery(element).find(".slick-track-root-inner");

      if ($el && typeof $el.slick === "function") {
        if ($el.hasClass("slick-initialized")) {
          $el.slick("unslick");
        }
        $el.slick(this.slickOptions);

        $el.on("afterChange.slick", (_event, _slick, current) => {
          this.currentSlide = current;
          if (typeof this.args.onAfterChange === "function") {
            this.args.onAfterChange(current);
          }
        });
      } else {
        // retry se lo script CDN non è ancora eseguito
        setTimeout(() => {
          const $retry = window.jQuery(element).find(".slick-track-root-inner");
          if ($retry && typeof $retry.slick === "function") {
            if ($retry.hasClass("slick-initialized")) {
              $retry.slick("unslick");
            }
            $retry.slick(this.slickOptions);
            $retry.on("afterChange.slick", (_e, _s, cur) => (this.currentSlide = cur));
          } else {
            // console.warn("Slick non trovato; includi slick.min.js nel tema");
          }
        }, 250);
      }
    }
  }

  @action
  destroySlick() {
    if (this._rootElement && window.jQuery) {
      const $el = window.jQuery(this._rootElement).find(".slick-track-root-inner");
      if ($el && typeof $el.slick === "function" && $el.hasClass("slick-initialized")) {
        $el.slick("unslick");
        $el.off(".slick");
      }
    }
    this._rootElement = null;
  }

  @action
  refreshIfImagesChanged() {
    if (this._rootElement) {
      this.destroySlick();
      this.setupSlick(this._rootElement);
    }
  }
}
