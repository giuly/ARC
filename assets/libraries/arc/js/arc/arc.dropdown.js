/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
	'use strict';

	Arc.libs.dropdown = {
		name : 'dropdown',

		version : '1.1',
		fversion : '4.3.0',

		settings : {
			activeClass: 'open',
			is_hover: false,
			opened: function(){},
			closed: function(){}
		},

		init : function (scope, method, options) {
			this.scope = scope || this.scope;
			Arc.inherit(this, 'throttle scrollLeft data_options');
			
			if (typeof method === 'object')
			{ $.extend(true, this.settings, method); }
			
			if (typeof method !== 'string')
			{
				if (!this.settings.init)
				{ this.events(); }
			
				return this.settings.init;
			}
			else
			{ return this[method].call(this, options); }
		},

		events : function () {
			var self = this;
			
			$(this.scope)
			.on('click.fndtn.dropdown', '[data-dropdown]', function (e)
			{
				/* BEGIN PATCH 1 */
				// only executes the 'opening' of the dropdown if the element/button doesn't have the 'disabled' class
				if (!($(this).hasClass('disabled')))
				{
					var settings = $.extend({}, self.settings, self.data_options($(this)));
					e.preventDefault();
				
					if (!settings.is_hover) self.toggle($(this));
				}
				else
				{ e.preventDefault(); }
				/* END PATCH 1 */ 
			})
			.on('mouseenter', '[data-dropdown]', function (e)
			{
				var settings = $.extend({}, self.settings, self.data_options($(this)));
				if (settings.is_hover) self.toggle($(this));
			})
			.on('mouseleave', '[data-dropdown-content]', function (e)
			{
				var target = $('[data-dropdown="' + $(this).attr('id') + '"]'),
				settings = $.extend({}, self.settings, self.data_options(target));
				if (settings.is_hover) self.close.call(self, $(this));
			})
			.on('opened.fndtn.dropdown', '[data-dropdown-content]', this.settings.opened)
			.on('closed.fndtn.dropdown', '[data-dropdown-content]', this.settings.closed);
			
			$(document).on('click.fndtn.dropdown', function (e)
			{
				var parent = $(e.target).closest('[data-dropdown-content]');
							
				if( !$(e.target).data('dropdown') && !$(e.target).parent().hasClass('dropdown') && $('[data-dropdown-content]').hasClass('open') && $('[data-dropdown-content]').hasClass('basket'))
				{
					self.close.call(self, $('[data-dropdown-content]'));
					$('[data-dropdown="dropbasket"]').removeClass('opendropdown');
				}

				if ($(e.target).data('dropdown'))
				{ return; }
				
				if (parent.length > 0 && ($(e.target).is('[data-dropdown-content]') || $.contains(parent.first()[0], e.target)))
				{
					e.stopPropagation();
					return;
				}
				
				if (!$('[data-dropdown-content]').hasClass('basket'))
				{ self.close.call(self, $('[data-dropdown-content]')); }
			});
			
			$(window).on('resize.fndtn.dropdown', self.throttle(function () { self.resize.call(self); }, 50)).trigger('resize');
			
			this.settings.init = true;
		},

		close: function (dropdown) {
		
			var self = this;
			dropdown.each(function ()
			{
				if ($(this).hasClass(self.settings.activeClass))
				{
					$(this)
					.css(Arc.rtl ? 'right':'left', '-99999px')
					.removeClass(self.settings.activeClass);
					$(this).trigger('closed');
				}
			});
			
			/* BEGIN PATCH 6 */
			if(dropdown.hasClass('basket')) { $(dropdown).children('.tip').removeAttr('style') }
			/* END PATCH 6 */      
		},

		open: function (dropdown, target) {
			this.css(dropdown
			.addClass(this.settings.activeClass), target);
			dropdown.trigger('opened');
		},
			
		toggle : function (target) {

			// Get the target's sibling that has the class you define in data-dropdown
			var dropdown = $(target).siblings('.f-dropdown');

			this.close.call(this, $('[data-dropdown-content]').not(dropdown));
			
			if (dropdown.hasClass(this.settings.activeClass))
			{
				target.removeClass('opendropdown').blur();
				this.close.call(this, dropdown);
			}
			else
			{
				target.addClass('opendropdown');

				this.close.call(this, $('[data-dropdown-content]'))
				this.open.call(this, dropdown, target);
				/* BEGIN PATCH 4 */
				// makes the dropdown options to disapear when one of the options is selected
				var dropdowntoclose=this;
				
				dropdown.find('a').click(function(){
					dropdowntoclose.close.call(dropdowntoclose, dropdown);
					target.removeClass('opendropdown');
				});
				/* END PATCH 4 */
			}
			
			/* BEGIN PATCH 2 */
			// check if the browser is IE10
			var isIE10 = false;
			/*@cc_on
			if (/^10/.test(@_jscript_version)) { isIE10 = true; }
			@*/
			
			// if dropdown is a basket manage dropdown alignment
			if (dropdown.hasClass('basket'))
			{
				if (dropdown.hasClass('open') )
				{
					// get the final position of the most righ corner of the dropdown
					var dropwidth=dropdown.outerWidth();
					var targetwidth=target.outerWidth();
					
					dropdown.css({left: targetwidth + target.position().left - dropwidth });

					// check if it has more than 3 products
					if (dropdown.find('.item-rows').children().length>3)
					{
						// adds scroll class to items area
						dropdown.find('.item-rows').addClass('scroll');
						
						// change the height to a small value, to add the vertical scrollbar to the area
						// and preview any kind of layout change in the items area
						dropdown.find('.item-rows').css({height: '50px'});
						
						// set the new max height to 0
						var maxheight=0;
						
						// sum the height of the 3 first products itens from the list
						for (var icounter=0;icounter<3;icounter++)
						{ maxheight+=dropdown.find('.item-rows').children().eq(icounter).outerHeight(); }
						
						// change the items area to the correct height, equivalent to the height of the 3 first products
						dropdown.find('.item-rows').css({height: ''+maxheight+'px'});
					}
					else
					{
						dropdown.find('.item-rows').removeClass('scroll');
						dropdown.find('.item-rows').css({height: 'auto' });
					}
					
				}
			}
			else
			{
				dropdown.width(target.outerWidth());
			}
			/* END PATCH 2 */ 
			
			if (target.hasClass('openup'))
			{
				var dropheight = (dropdown.outerHeight())+40;
				var droptop = parseInt(dropdown.css('top'))-dropheight;
				
				dropdown.css('top',droptop+'px');
			}
		},

		resize : function ()
		{
			var dropdown = $('[data-dropdown-content].open'),
			target = $("[data-dropdown='" + dropdown.attr('id') + "']");
		
			if (dropdown.length && target.length)
			{ this.css(dropdown, target); }
		
			/* BEGIN PATCH 3 */
			// check if the browser is IE10
			var isIE10 = false;
			/*@cc_on
			if (/^10/.test(@_jscript_version)) { isIE10 = true; }
			@*/
		
			// if dropdown is a basket manage dropdown alignment
			if (dropdown.hasClass('basket') && dropdown.hasClass('open'))
			{
				// get the final position of the most righ corner of the dropdown
				var dropwidth=dropdown.outerWidth();
				var targetwidth=target.outerWidth();

				dropdown.css({left: targetwidth + target.position().left - dropwidth });
			
				/*
				// get screen width
				var screenwidth=$('body').innerWidth();
					
				// get the final position of the most righ corner of the dropdown
				if ($('html').hasClass('ie') || isIE10)
				{
					var dropwidth=dropdown.outerWidth();
					var targetwidth=target.outerWidth();
				}
				else
				{
					var dropwidth=dropdown.width();
					var targetwidth=target.width();
				}

				var mostright=targetwidth + target.position().left + dropwidth;

				// if the dropdown would appear off screen, change the position so that he will appear align to the right screen margin
				if (mostright>screenwidth)
				{ dropdown.css({left: screenwidth - dropwidth }); }
				else
				{ dropdown.css({left: targetwidth + target.position().left - dropwidth }); }
				*/
			}
			else
			{
				// makes the dropdown list appear with the same width as the dropdown itself
				dropdown.width(target.outerWidth());
			}
			/* END PATCH 3 */
			
			
			if (target.hasClass('openup'))
			{
				var dropheight = (dropdown.outerHeight())+40;
				var droptop = parseInt(dropdown.css('top'))-dropheight;
				
				dropdown.css('top',droptop+'px');
			}
		},

		css : function (dropdown, target)
		{
			var offset_parent = dropdown.offsetParent();
			// if (offset_parent.length > 0 && /body/i.test(dropdown.offsetParent()[0].nodeName)) {
			var position = target.offset();
			position.top -= offset_parent.offset().top;
			position.left -= offset_parent.offset().left;
			// } else {
			//   var position = target.position();
			// }
			
			/* BEGIN PATCH 5 */
			if (this.small())
			{
				var width = '95%';
				var left = position.left;
				// if dropdown is a basket manage dropdown alignment and width
				if (dropdown.hasClass('basket') && dropdown.hasClass('open'))
				{
					width = dropdown.width();
					left = target.offset().left;
				}
			
				dropdown.css({
					position : 'absolute',
					width: width,
					left: left,
					'max-width': 'none',
					top: position.top + this.outerHeight(target)
				});
			/* END PATCH 5 */
			
			}
			else
			{
				if (!Arc.rtl && $(window).width() > this.outerWidth(dropdown) + target.offset().left)
				{
					var left = position.left;
					if (dropdown.hasClass('right'))
					{ dropdown.removeClass('right'); }
				}
				else
				{
					if (!dropdown.hasClass('right')) { dropdown.addClass('right'); }
					var left = position.left - (this.outerWidth(dropdown) - this.outerWidth(target));
				}
				
				dropdown.attr('style', '').css({
					position : 'absolute',
					top: position.top + this.outerHeight(target),
					left: left
				});
			}
			
			return dropdown;
		},

		small : function ()
		{ return $(window).width() < 640 || $('html').hasClass('lt-ie9'); },

		off: function ()
		{
			$(this.scope).off('.fndtn.dropdown');
			$('html, body').off('.fndtn.dropdown');
			$(window).off('.fndtn.dropdown');
			$('[data-dropdown-content]').off('.fndtn.dropdown');
			this.settings.init = false;
		},
		
		reflow : function () {}
	};
}(Arc.zj, this, this.document));