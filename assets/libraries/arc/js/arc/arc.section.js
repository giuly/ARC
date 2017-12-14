/*jslint unparam: true, browser: true, indent: 2 */

;
(function($, window, document) {

    'use strict';

    Arc.libs.section = {

        name : 'section',
		version : '1.4.0',
		fversion : '4.3.2',

        settings: {
            deep_linking: false,
            one_up: true,
            multi_expand: false,
            always_open: false,
            section_selector: '[data-section]',
            region_selector: 'section, .section, [data-section-region]',
            title_selector: '.title, [data-section-title]',
            resized_data_attr: 'data-section-resized',
            small_style_data_attr: 'data-section-small-style',
            content_selector: '.content, [data-section-content]',
            nav_selector: '[data-section="vertical-nav"], [data-section="horizontal-nav"]',
            active_class: 'active',
            // ARC
            /* ADDED EXTRA SETTING TO ALLOW USER TO DEFINE THE GAP BETWEEN THE MENU SELECTORS */
            selector_margin:1,
            // END ARC
            callback: function() {}
        }, //END: settings

        init: function(scope, method, options)
        {
            var self = this;

            Arc.inherit(this, 'throttle data_options position_right offset_right');

            // loop trough all the existing sections
            // and save the information about the width
            $('div.section-container').each(function(i, obj)
            {
                var extraWidth = 0;

                if ( $(this).hasClass('centered'))
                {
                    extraWidth = $(this).find('p.title').length * 70;
                }

                $(this).attr( 'rel', (self.sectionSum($(this))+extraWidth) );
            });

            if (typeof method === 'object')
            {
                $.extend(true, self.settings, method);
            }

            if (typeof method !== 'string')
            {
                this.events();
                return true;
            }
            else
            {
                return this[method].call(this, options);
            }
        },
        //END: init

        events: function()
        {
            var self = this;

            //combine titles selector from settings for click event binding
            var click_title_selectors = [],
                section_selector = self.settings.section_selector,
                region_selectors = self.settings.region_selector.split(","),
                title_selectors = self.settings.title_selector.split(",");

            for (var i = 0, len = region_selectors.length; i < len; i++)
            {
                var region_selector = region_selectors[i];

                for (var j = 0, len1 = title_selectors.length; j < len1; j++)
                {
                    var title_selector = section_selector + ">" + region_selector + ">" + title_selectors[j];

                    //or we can not do preventDefault for click event of <a>
                    click_title_selectors.push(title_selector + " a");
                    click_title_selectors.push(title_selector);
                }
            }

            self.off();

            $(self.scope).on('click.fndtn.section', click_title_selectors.join(","), function(e)
            {
                var title = $(this).closest(self.settings.title_selector);

                self.close_navs(title);

                if (title.siblings(self.settings.content_selector).length > 0)
                {
                    self.toggle_active.call(title[0], e);
                }
                else
                {
                    e.preventDefault();
                }
            });

            $(window)
                .on('resize.fndtn.section', self.throttle(function() { self.resize(); }, 30))
                .on('hashchange.fndtn.section', self.set_active_from_hash);

            $(document).on('click.fndtn.section', function (e)
            {
                if (e.isPropagationStopped && e.isPropagationStopped())
                {
                    return;
                }

                if (e.target === document)
                {
                    return;
                }

                self.close_navs($(e.target).closest(self.settings.title_selector));
            });

            $(window).triggerHandler('resize.fndtn.section');
            $(window).triggerHandler('hashchange.fndtn.section');
        },
        //END: events

        //close nav !one_up on click elsewhere
        close_navs: function(except_nav_with_title)
        {
            var self = Arc.libs.section,
                navsToClose = $(self.settings.nav_selector)
                .filter(function()
                {
                    return (!$.extend({},self.settings, self.data_options($(this))).one_up);
                });

            if (except_nav_with_title.length > 0)
            {
                var section = except_nav_with_title.parent().parent();

                if (self.is_horizontal_nav(section) || self.is_vertical_nav(section))
                {
                    //exclude current nav from list
                    navsToClose = navsToClose.filter(function() { return this !== section[0]; });
                }
            }

            //close navs on click on title
            navsToClose.children(self.settings.region_selector).removeClass(self.settings.active_class);
        },
        // END: close_navs

        supports_multi_expand: function(section)
        {
            var self = Arc.libs.section,
                settings = $.extend({}, self.settings, self.data_options(section));

            return self.is_accordion(section) && settings.multi_expand;
        },
        //END: supports_multi_expand

        can_close: function(region)
        {
            var self = Arc.libs.section,
                section = region.parent(),
                settings = $.extend({}, self.settings, self.data_options(section));

            return !settings.one_up;
        },
        //END: can_close

        should_show_one: function(section)
        {
            var self = Arc.libs.section,
                settings = $.extend({}, self.settings, self.data_options(section));

            return ( settings.one_up && !self.is_horizontal_nav(section) && !self.is_vertical_nav(section) );
        },
        //END: should_show_one

        ensure_region_shown: function(section)
        {
            var self = Arc.libs.section,
                settings = $.extend({}, self.settings, self.data_options(section)),
                regions = section.children(self.settings.region_selector);

            if ( regions.filter("." + settings.active_class).length == 0 )
            {
                regions.filter(":visible").first().addClass(settings.active_class);
            }
        },
        //END: ensure_region_shown

        toggle_active: function(e)
        {
            var $this = $(this),
                self = Arc.libs.section,
                region = $this.parent(),
                content = $this.siblings(self.settings.content_selector),
                section = region.parent(),
                settings = $.extend({}, self.settings, self.data_options(section)),
                prev_active_region = section.children(self.settings.region_selector).filter("." + self.settings.active_class);

            //for anchors inside [data-section-title]
            if (!settings.deep_linking && content.length > 0)
            {
                e.preventDefault();
            }

            //do not catch same click again on parent
            e.stopPropagation();

            if (!region.hasClass(self.settings.active_class) || !self.settings.always_open)
            {
                if (!self.supports_multi_expand(section))
                {
                    prev_active_region.removeClass(self.settings.active_class);
                    prev_active_region.trigger('closed.fndtn.section');
                }

                region.addClass(self.settings.active_class);

                //force resize for better performance (do not wait timer)
                self.resize(region.find(self.settings.section_selector).not("[" + self.settings.resized_data_attr + "]"), true);
                region.trigger('opened.fndtn.section');

                // ARC: CHECK IF THE OPENED ELEMENT IS VISIBLE ON THE VIEWPORT
                if (! ($(this).offset().top>window.pageYOffset && ($(this).offset().top<(window.pageYOffset + window.innerHeight))) )
                {
                    // IF NOT, MOVE THE PAGE IN A WAY THAT THE ELEMENT SHOWS UP
                    $('html, body').animate({scrollTop: ($(this).offset().top-45) }, 0);
                }
                // END ARC
            }
            else if (self.can_close(region))
            {
                e.preventDefault();

                if ( settings.deep_linking )
                {
                    window.location.hash = '';
                }

                region.removeClass(self.settings.active_class);
                region.trigger('closed.fndtn.section');
            }

            settings.callback(section);
        },
        //END: toggle_active

        check_resize_timer: null,

        //main function that sets title and content positions; runs for :not(.resized) and :visible once when window width is medium up
        //sections:
        //  selected sections to resize, are defined on resize forced by visibility changes
        //ensure_has_active_region:
        //  is true when we force resize for no resized sections that were hidden and became visible,
        //  these sections can have no selected region, because all regions were hidden along with section on executing set_active_from_hash
        resize: function(sections, ensure_has_active_region)
        {
            var self = Arc.libs.section,
                section_container = $(self.settings.section_selector),
                is_small_window = !matchMedia(Arc.media_queries['small']).matches,
                //filter for section resize
                should_be_resized = function (section, now_is_hidden)
                {
                    var check = !self.is_accordion(section) &&
                                !section.is("[" + self.settings.resized_data_attr + "]") &&
                                (!is_small_window || self.is_horizontal_tabs(section) || self.is_auto(section)) &&
                                now_is_hidden === (section.css('display') === 'none' ||
                                !section.parent().is(':visible'));

                    return check;
                };

            $("div.section-container").each(function()
            {
                var sectionContainer = $(this);

                // get Section titles width
                var sectionTitlesWidth = self.sectionSum(sectionContainer);

                //get content tab width
                var sectionContentWidth = $(this).find('.active div.content').outerWidth( true );

                //if the combined sum of tabs is wider than the content tab we need to switch to accordion
                if ( sectionTitlesWidth > sectionContentWidth && sectionContentWidth<sectionContainer.attr('rel') )
                {
                    if ( sectionContainer.hasClass("auto") )
                    {
                        sectionContainer.removeClass("auto");
                        sectionContainer.addClass("accordion");
                        sectionContainer.addClass("auto-accordion"); //add class to be able to remove it if this action has already been done

                        //add data attribute
                        sectionContainer.attr( 'data-section', 'accordion' );
                        //sectionContainer.attr( 'rel', sectionTitlesWidth );
                    }
                }
                else
                {
                    if ( sectionContainer.hasClass("auto-accordion") && sectionContainer.attr('rel') < sectionContentWidth )
                    {
                        sectionContainer.removeClass("accordion");
                        sectionContainer.removeClass("auto-accordion");
                        sectionContainer.addClass("auto");

                        //remove data attribute
                        sectionContainer.data( 'section', '' );
                    }
                }
            });

            sections = sections || $(self.settings.section_selector);

            clearTimeout(self.check_resize_timer);

            if (!is_small_window)
            {
                sections.removeAttr(self.settings.small_style_data_attr);
            }

            //resize
            sections.each(function()
            {
                var section = $(this),
                    regions = section.children(self.settings.region_selector),
                    titles = regions.children(self.settings.title_selector),
                    content = regions.children(self.settings.content_selector),
                    titles_max_height = 44;

                if (ensure_has_active_region)
                {
                    var settings = $.extend({}, self.settings, self.data_options(section));

                    if (self.should_show_one(section))
                    {
                        self.ensure_region_shown(section);
                    }
                }

                if (self.is_horizontal_tabs(section) || self.is_auto(section))
                {
                    //    region: position relative
                    //    title: position absolute
                    //    content: position static
                    var titles_sum_width = 0;

                    //Check if we want to show the tabs centered
                    if ( section.hasClass('centered') )
                    {
                        titles_sum_width = (section.width()/2)-(section.attr('rel')/2)+self.settings.selector_margin;
                    }

                    titles.each(function()
                    {
                        var title = $(this);

                        if ( section.hasClass('centered') )
                        {
                            title.addClass('centered');
                        }

                        if (title.is(":visible"))
                        {
                            title.css(!self.rtl ? 'left' : 'right', titles_sum_width);
                            var title_h_border_width = parseInt(title.css("border-" + (self.rtl ? 'left' : 'right') + "-width"), 10);

                            if (title_h_border_width.toString() === 'Nan')
                            {
                                title_h_border_width = 0;
                            }

                            // ARC
                            /* ADDED EXTRA SETTING TO ALLOW USER TO DEFINE THE GAP BETWEEN THE MENU SELECTORS */
                            titles_sum_width += $(this).outerWidth(true) + self.settings.selector_margin;
                            // END ARC

                            if ( typeof self.outerHeight(title) === 'number')
                            {
                                titles_max_height = Math.max(titles_max_height, self.outerHeight(title));
                            }
                            else
                            {
                                //SAFARI BUG on TDTAP: self.outerHeight(title) is NaN
                                titles_max_height = Math.max(titles_max_height, 44 );
                            }
                        }
                    });

                    regions.each(function()
                    {
                        var region = $(this),
                            region_content = region.children(self.settings.content_selector),
                            content_top_border_width = parseInt(region_content.css("border-top-width"), 10);

                        if (content_top_border_width.toString() === 'Nan')
                        {
                            content_top_border_width = 0;
                        }

                        if (section.hasClass('tabs') || section.hasClass('auto'))
                        {
                            region.css('padding-top', titles_max_height - content_top_border_width);
                        }
                        else
                        {
                            region.css('padding-top', 0);
                        }

                        if ( section.hasClass('centered') )
                        {
                            region.addClass('centered');
                            region_content.addClass('centered');
                        }
                    });

                    //    region: positon relative, float left
                    //    title: position static
                    //    content: position absolute
                    var first = true;

                    regions.each(function()
                    {
                        var region = $(this);

                        region.css("margin-left", "-" + (first ? section : region.children(self.settings.title_selector)).css("border-left-width"));
                        first = false;
                    });

                    regions.css("margin-top", "-" + section.css("border-top-width"));
                    titles.css('height', titles_max_height);
                    section.css("min-height", titles_max_height);
                }
                else if (self.is_vertical_tabs(section))
                {
                    var titles_sum_height = 0;

                    //    region: position relative, for .active: fixed padding==title.width
                    //    title: fixed width, position absolute
                    //    content: position static
                    titles.each(function()
                    {
                        var title = $(this);

                        if (title.is(":visible"))
                        {
                            title.css('top', titles_sum_height);
                            var title_top_border_width = parseInt(title.css("border-top-width"), 10);

                            if (title_top_border_width.toString() === 'Nan')
                            {
                                title_top_border_width = 0;
                            }

                            titles_sum_height += self.outerHeight(title) - title_top_border_width;
                        }
                    });

                    content.css('min-height', titles_sum_height + 1);
                }
                else if (self.is_vertical_nav(section))
                {
                    var titles_max_width = 0,
                        first1 = true;

                    //    region: positon relative
                    //    title: position static
                    //    content: position absolute
                    titles.each(function()
                    {
                        titles_max_width = Math.max(titles_max_width, self.outerWidth($(this)));
                    });

                    regions.each(function ()
                    {
                        var region = $(this);

                        region.css("margin-top", "-" + (first1 ? section : region.children(self.settings.title_selector)).css("border-top-width"));
                        first1 = false;
                    });

                    titles.css('width', titles_max_width);
                    content.css(!self.rtl ? 'left' : 'right', titles_max_width);
                    section.css('width', titles_max_width);
                }

                section.attr(self.settings.resized_data_attr, true);
            });

            //wait elements to become visible then resize
            if ( $(self.settings.section_selector).filter(function() { return should_be_resized($(this), true); }).length > 0 )
            {
                self.check_resize_timer = setTimeout(function()
                {
                    self.resize(sections.filter(function() { return should_be_resized($(this), false); }), true);
                }, 100);
            }

            if (is_small_window)
            {
                sections.attr(self.settings.small_style_data_attr, true);
            }
        },
        //END: resize

        is_vertical_nav: function(el)
        {
            return /vertical-nav/i.test(el.data('section'));
        },
        //END: is_vertical_nav

        is_horizontal_nav: function(el)
        {
            return /horizontal-nav/i.test(el.data('section'));
        },
        //END: is_horizontal_nav

        is_accordion: function(el)
        {
            return /accordion/i.test(el.data('section'));
        },
        //END: is_accordion

        is_horizontal_tabs: function(el)
        {
            return /^tabs$/i.test(el.data('section'));
        },
        //END: is_horizontal_tabs

        is_vertical_tabs: function(el)
        {
            return /vertical-tabs/i.test(el.data('section'));
        },
        //END: is_vertical_tabs

        is_auto: function (el)
        {
            var data_section = el.data('section');

            return data_section === '' || /^auto$/i.test(data_section);
        },
        //END: is_auto

        set_active_from_hash: function()
        {
            var self = Arc.libs.section,
                hash = window.location.hash.substring(1),
                sections = $(self.settings.section_selector);

            sections.each(function()
            {
                var section = $(this),
                    settings = $.extend({}, self.settings, self.data_options(section)),
                    set_active_from_hash = settings.deep_linking && hash.length > 0,
                    selected = false,
                    nonmatched = [],
                    region,
                    regions = section.children(self.settings.region_selector);

                regions.each(function()
                {
                    var region = $(this),
                        data_slug = "^" + region.children(self.settings.content_selector).data('slug') + "$";

                    if (!selected && new RegExp(data_slug, 'i').test(hash))
                    {
                        selected = true;
                        region.addClass(self.settings.active_class);
                    }
                    else if (!settings.multi_expand)
                    {
                        nonmatched.push(region);
                    }
                });

                if (selected)
                {
                    while(region = nonmatched.pop())
                    {
                        region.removeClass(self.settings.active_class);
                    }
                    return false;
                }
                else
                {
                    if (self.should_show_one(section))
                    {
                        self.ensure_region_shown(section);
                    }
                }
            });
        },
        //END: set_active_from_hash

        reflow: function()
        {
            var self = Arc.libs.section;

            $(self.settings.section_selector).removeAttr(self.settings.resized_data_attr);
            self.throttle(function() { self.resize(); }, 30)();
        },
        //END: reflow

        small: function(el)
        {
            if (this.is_horizontal_tabs(el))
            {
                return false;
            }

            if (el && this.is_accordion(el))
            {
                return true;
            }

            if ($('html').hasClass('lt-ie9'))
            {
                return true;
            }

            if ($('html').hasClass('ie8compat'))
            {
                return true;
            }

            return !matchMedia(Arc.media_queries['small']).matches;
        },
        //END: small

        off: function()
        {
            $(this.scope).off('.fndtn.section');
            $(window).off('.fndtn.section');
            $(document).off('.fndtn.section');
        },
        //END: off

        sectionSum: function(divToSum)
        {
            var width = 0;

            divToSum.find('p[data-section-title]').each(function( e )
            {
                width+=$( this ).outerWidth( true ); //add up all the widths of the tabs including margins
            });

            return width;
        }
        //END: sectionSum

    };
    //END: Arc.libs.section

    //resize selected sections
    $.fn.reflow_section = function(ensure_has_active_region)
    {
        var section = this,
            self = Arc.libs.section;

        section.removeAttr(self.settings.resized_data_attr);
        self.throttle(function() { self.resize(section, ensure_has_active_region); }, 30)();

        return this;
    };
    //END: reflow_section

}(Arc.zj, window, document));