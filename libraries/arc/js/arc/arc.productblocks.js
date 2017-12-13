/*jslint unparam: true, browser: true, indent: 2 */

;
(function($, window, document) 
{
  'use strict';

  Arc.libs.productblocks = 
  {
    name : 'productblocks',

    version : '1.3.9',

    settings : {
    },

    init : function (scope, method, options) 
    {
      this.scope = scope || this.scope;

      if (typeof method === 'object') 
      {
        $.extend(true, this.settings, method);
      }

      if (typeof method !== 'string') {
        this.events();
        return true;
      } else {
        return this[method].call(this, options);
      }

    },

    events: function() 
    {
      var self = this;

      $(window)
        .on('resize.fndtn.productblocks', self.setProductBlockHeight );

      $(window).triggerHandler('resize.fndtn.productblocks');
    },

    setProductBlockHeight:function() 
    {
      //if statement to execute function productBlockHeight
      var numberOfBlocks = jQuery('.productbox_li > a > ul').length;

      if ( numberOfBlocks === 3 || numberOfBlocks === 4 ) 
      {
        var maxHeight = function() {

          var maximumHeight=0;

          $('.productbox_li a > ul ul.usps').each(function()
          {
            //remove last-child extra margin
            var tempHeight = -5;  
            $(this).find('li').each(function()
            {
              //-10 for each li-margin
              tempHeight += $(this).outerHeight(true)-10;
            });
            
            if (tempHeight > maximumHeight)
            {
              maximumHeight=tempHeight;
            }
          });
          
          return (maximumHeight);
        }
        jQuery( '.productbox_li a > ul ul.usps' ).css("height", maxHeight );
      }
    }

  };

    //resize selected sections
  $.fn.reflow_section = function(ensure_has_active_region) 
  {
    var productblocks = this,
        self = Arc.libs.productblocks;

    productblocks.removeAttr(self.settings.resized_data_attr);
    self.throttle(function() { self.resize(productblocks, ensure_has_active_region); }, 30)();
    return this;
  };
  
}(Arc.zj, window, document));