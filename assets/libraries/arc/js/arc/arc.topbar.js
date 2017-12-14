/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined)
{
	'use strict';

	Arc.libs.topbar = {
		name : 'topbar',

		version: '1.3',
		fversion: '4.3.1',

		settings :
		{
			index : 0,
			stickyClass : 'sticky',
			custom_back_text: true,
			back_text: 'Back',
			is_hover: false,
			mobile_show_parent_link: false,
			scrolltop : true, // jump to top when sticky nav menu toggle is clicked
			init : false
		},

		init : function (section, method, options)
		{
			Arc.inherit(this, 'data_options');
			var self = this;

			if (typeof method === 'object')
			{
    			$.extend(true, this.settings, method);
            }
			else if (typeof options !== 'undefined')
			{
    			$.extend(true, this.settings, options);
            }

			if (typeof method !== 'string')
			{
				$('.top-bar, [data-topbar]').each(function ()
				{
					$.extend(true, self.settings, self.data_options($(this)));
					self.settings.$w = $(window);
					self.settings.$topbar = $(this);
					self.settings.$section = self.settings.$topbar.find('section');
					self.settings.$titlebar = self.settings.$topbar.children('ul').first();
					self.settings.$topbar.data('index', 0);

					var breakpoint = $("<div class='top-bar-js-breakpoint'/>").insertAfter(self.settings.$topbar);
					self.settings.breakPoint = breakpoint.width();
					breakpoint.remove();

					self.assemble();

					if (self.settings.is_hover)
					{
    					self.settings.$topbar.find('.has-dropdown').addClass('not-click');
    				}

					if (self.settings.$topbar.parent().hasClass('fixed'))
					{
    					$('body').css('padding-top', self.outerHeight(self.settings.$topbar));
    				}
				});

				if (!self.settings.init)
				{
    				this.events();
                }

				return this.settings.init;
			}
			else
			{
				// fire method
				return this[method].call(this, options);
			}
		},

		timer : null,

		events : function ()
		{
			var self = this;
			var offst = this.outerHeight($('.top-bar, [data-topbar]'));

			$('.has-dropdown').on('mouseover', function()
			{
				$(this).addClass('hover');
				$(this).children('a').addClass('hover');
			});

			$('.has-dropdown').on('mouseout', function()
			{
				$(this).removeClass('hover');
				$(this).children('a').removeClass('hover');
			});

			//HOVER STATE ON LINK COLORS
			$('.top-bar-section ul li a').on('mouseover', function()
			{
    			$(this).addClass('hover');
            });

			$('.top-bar-section ul li a').on('mouseout', function()
			{
    			$(this).removeClass('hover');
            });

			// MOBILE EVENTS
			$('.has-dropdown').children('a').on('touchend', function(e)
			{
				$(this).toggleClass('hover');
				$(this).parent().toggleClass('hover');
				// Remove dropdowns from all other menu items
				$(this).parent().siblings('.has-dropdown').removeClass('hover');
				e.preventDefault();
			});

			$('.top-bar .dropdown a').on('touchend', function()
			{
				$(this).toggleClass('hover');
				$(this).parent().toggleClass('hover');
				window.location.href=$(this).attr('data-url');
				$(this).toggleClass('hover');
				$(this).parent().toggleClass('hover');
			});

			$('.top-bar-section ul li a').on('touchend', function()
			{
				$('.top-bar-section ul li a').removeClass('hover');
				// Remove dropdowns from all other menu items
				$(this).parent().siblings('.has-dropdown').removeClass('hover');
				$(this).addClass('hover');
			});


			$(this.scope)

				.off('.fndtn.topbar')

				.on('click.fndtn.topbar', '.top-bar .toggle-topbar, [data-topbar] .toggle-topbar', function (e)
				{
					var topbar = $(this).closest('.top-bar, [data-topbar]'),
						section = topbar.find('section, .section'),
						titlebar = topbar.children('ul').first();

					e.preventDefault();

					if (self.breakpoint())
					{
						if (!self.rtl)
						{
							section.css({left: '0%'});
							section.find('>.name').css({left: '100%'});
						}
						else
						{
							section.css({right: '0%'});
							section.find('>.name').css({right: '100%'});
						}

						section.find('li.moved').removeClass('moved');
						topbar.data('index', 0);

						topbar.toggleClass('expanded').css('height', '');
					}

					if (!topbar.hasClass('expanded'))
					{
						if (topbar.hasClass('fixed'))
						{
							topbar.parent().addClass('fixed');
							topbar.removeClass('fixed');
							$('body').css('padding-top',offst);
						}
					}
					else if (topbar.parent().hasClass('fixed'))
					{
						topbar.parent().removeClass('fixed');
						topbar.addClass('fixed');
						$('body').css('padding-top','0');

						if (self.settings.scrolltop) { window.scrollTo(0,0); }
					}
				});

			$(window).on('resize.fndtn.topbar', function ()
			{
				if (!self.breakpoint())
				{
					$('.top-bar, [data-topbar]')
						.css('height', '')
						.removeClass('expanded')
						.find('li')
						.removeClass('hover');
				}
			}.bind(this));

			$('body').on('click.fndtn.topbar', function (e)
			{
				var parent = $(e.target).closest('[data-topbar], .top-bar');

				if (parent.length > 0)
				{
    				return;
                }

				$('.top-bar li, [data-topbar] li').removeClass('hover');
			});

		},

		breakpoint : function ()
		{
		    return $(document).width() <= this.settings.breakPoint || $('html').hasClass('lt-ie9');
		},

		assemble : function ()
		{
			var self = this;
			// Pull element out of the DOM for manipulation

			this.settings.$section.detach();

			this.settings.$section.find('a').each(function ()
			{
				var $link = $(this),
					url = $link.attr('href');

				$link.attr('data-url',url);

			});

			// Put element back in the DOM
			this.settings.$section.appendTo(this.settings.$topbar);

			// check for sticky
			this.sticky();
		},

		height : function (ul)
		{
			var total = 0,
			self = this;

			ul.find('> li').each(function () { total += self.outerHeight($(this), true); });

			return total;
		},

		sticky : function ()
		{
			var klass = '.' + this.settings.stickyClass;

			if ($(klass).length > 0)
			{
				var distance = $(klass).length ? $(klass).offset().top: 0,
				$window = $(window),
				offst = this.outerHeight($('.top-bar')),
				t_top;

				//Whe resize elements of the page on windows resize. Must recalculate distance
				$(window).resize(function()
				{
					clearTimeout(t_top);
					t_top = setTimeout (function() {distance = $(klass).offset().top; },105);
				});

				$window.scroll(function()
				{
					if ($window.scrollTop() > (distance))
					{
						$(klass).addClass("fixed");
						$('body').css('padding-top',offst);
					}
					else if ($window.scrollTop() <= distance)
					{
						$(klass).removeClass("fixed");
						$('body').css('padding-top','0');
					}
				});
			}
		},

		off : function ()
		{
			$(this.scope).off('.fndtn.topbar');
			$(window).off('.fndtn.topbar');
		},

		reflow : function () {}
	};
}(Arc.zj, this, this.document));
