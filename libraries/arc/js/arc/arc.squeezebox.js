;(function ($, window, document, undefined) {
  'use strict';

  Arc.libs.squeezebox = {
    name : 'squeezebox', //based on accordion component in Foundation 5.0.1

    version	: '1.3.9',
    fversion : '5.0.1',

    settings : {
      active_class: 'active',
      toggleable: true
    },

    // ARC: init changed to match Foudation 4 implementation
    init : function (scope, method, options) {
      this.scope = scope || this.scope;

      if (typeof method === 'object') {
        $.extend(true, this.settings, method);
      }

      if (typeof method !== 'string') {
        if (!this.settings.init) { this.events(); }

        return this.settings.init;
      } else {
        return this[method].call(this, options);
      }
    },

    events : function () {
      // ARC: changed to match Foudation 4 implementation
      var self = this;

      $(this.scope).off('.squeezebox').on('click.fndtn.squeezebox', '[data-squeezebox] > dd > a', function (e) {

        var squeezebox = $(this).parent(),
            target = $('#' + this.href.split('#')[1]),
            siblings = $('> dd > .content', target.closest('[data-squeezebox]')),

            clicked_siblings = $('> dd > a', target.closest('[data-squeezebox]')),
            // ARC: changed to match Foudation 4 implementation
            // settings = squeezebox.parent().data('squeezebox-init'),
            settings = self.settings,
            active = $('> dd > .content.' + settings.active_class, squeezebox.parent());

        e.preventDefault();

        if (active[0] == target[0] && settings.toggleable) {
          // ARC: toggle class of $(this)
          $(this).toggleClass(settings.active_class);

          return target.toggleClass(settings.active_class);
        }

        siblings.removeClass(settings.active_class);
        target.addClass(settings.active_class);
        // ARC: alter class of $(this) and its siblings
        clicked_siblings.removeClass(settings.active_class);
        $(this).addClass(settings.active_class);

        // ARC: CHECK IF THE OPENED ELEMENT IS VISIBLE ON THE VIEWPORT
        if (! ($(this).offset().top>window.pageYOffset && ($(this).offset().top<(window.pageYOffset + window.innerHeight))) )
        {
            // IF NOT, MOVE THE PAGE IN A WAY THAT THE ELEMENT SHOWS UP
            $('html, body').animate({scrollTop: ($(this).offset().top) }, 0);
        }
        // END ARC


      });
    },

    off : function () {},

    reflow : function () {}
  };
// Changed to match Foudation 4 implementation
// }(jQuery, this, this.document));
}(Arc.zj, this, this.document));
