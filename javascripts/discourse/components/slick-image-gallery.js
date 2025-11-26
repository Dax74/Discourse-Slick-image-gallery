import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

// Nota: Assumo che slick-carousel sia installato come dipendenza npm
// e che le CSS vengano importate tramite plugin.rb o bundle. Vedi istruzioni successive.
export default class SlickImageGalleryComponent extends Component {
  @tracked currentSlide = 0;

  // default options — puoi esporle tramite args se vuoi
  get slickOptions() {
    return {
      dots: true,
      arrows: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true,
      // merge con this.args.options se fornito
      ...(this.args.options || {}),
    };
  }

  // riferimento all'elemento root del carousel
  _rootElement = null;

  @action
  setupSlick(element) {
    this._rootElement = element;

    // Import dinamico di jQuery/slick se necessario — Discourse fornisce jQuery
    // Usa jQuery per inizializzare il plugin slick all'interno dell'elemento
    if (window.jQuery && element) {
      const $el = window.jQuery(element).find(".slick-track-root");

      // Assicurati che slick sia caricato (viene da 'slick-carousel')
      if ($el && $el.slick) {
        // inizializza (safe guard per reinizializzazioni)
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
        // se slick non è disponibile, prova a importarlo dinamicamente (fallback)
        try {
          // webpack / ember-cli: import a top-level preferibile, ma questo è un fallback
          // eslint-disable-next-line no-undef
          // window.$ = window.jQuery;
        } catch (e) {
          // log per debug
          // console.warn("Slick non disponibile", e);
        }
      }
    }
  }

  @action
  destroySlick() {
    if (this._rootElement && window.jQuery) {
      const $el = window.jQuery(this._rootElement).find(".slick-track-root");
      if ($el && $el.slick && $el.hasClass("slick-initialized")) {
        $el.slick("unslick");
        $el.off(".slick");
      }
    }
  }

  // utile se si vogliono re-inizializzare quando cambia l'array images
  @action
  refreshIfImagesChanged() {
    // se fornisci un arg images che cambia, puoi chiamare this.destroySlick() e this.setupSlick(this._rootElement)
    if (this._rootElement) {
      this.destroySlick();
      this.setupSlick(this._rootElement);
    }
  }
}
