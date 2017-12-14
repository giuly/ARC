/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, undefined) {
  'use strict';

  Arc.libs.buttons = {
    name : 'buttons',

    version : '1.0',
    fversion : '4.2.2',

    settings : {
    },

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
      var self = this;
      
      $(this.scope).on('click.fndtn.buttons', '.button', function (e) {
      	if (($(this).hasClass('disabled')))
      	{ e.preventDefault(); }
      });
      
      $(this.scope).on('mouseenter.fndtn.buttons', '.button', function (e) {
      	if (!($(this).hasClass('disabled')) && !($(this).parent().parent().hasClass('button-group')) && !($(this).parent().parent().hasClass('input-button-group')) )
      	{ $(this).addClass('active') }
      });
      
      $(this.scope).on('mouseleave.fndtn.buttons', '.button', function (e) {
      	if (!($(this).hasClass('disabled')) && !($(this).parent().parent().hasClass('button-group')) && !($(this).parent().parent().hasClass('input-button-group')) )
      	{ $(this).removeClass('active') }
      });

      this.settings.init = true;
    },

    off : function () {
      $(this.scope).off('.fndtn.buttons');
    },

    reflow : function () {}
  };
}(Arc.zj, this, this.document));