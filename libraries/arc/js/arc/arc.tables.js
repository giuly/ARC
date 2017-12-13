/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
  'use strict';

  Arc.libs.tables = {
    name : 'tables',
    
    version : '1.3.4',
    fversion : '4.3.0',

    settings : {
      switched : false
    },

    init : function (scope, method, options) {
      this.scope = scope || this.scope;

      if (typeof method === 'object') {
        $.extend(true, this.settings, this.defaults, method);
      } else {
        $.extend(true, this.settings, this.defaults, options);
      }

      if (typeof method !== 'string') {
        if (!this.settings.init) this.events();

        return this.settings.init;
      } else {
        return this[method].call(this, options);
      }
    },

    events : function () {
      var self = this;
      var switched = self.settings.switched;

      $(window).load(self.updateTables);
      $(window).on("redraw",function(){ self.settings.switched=false;self.updateTables();}); // An event to listen for
      $(window).on("resize", self.updateTables);

    },

    updateTables : function() {
      var self = Arc.libs.tables;      

      if (($(window).width() < 767) && !self.settings.switched ){
        self.settings.switched = true;
        $("table.responsive").each(function(i, element) {
          self.splitTable($(element));
        });
        return true;
      }
      else if (self.settings.switched && ($(window).width() > 767)) {
        self.settings.switched = false;
        $("table.responsive").each(function(i, element) {
          self.unsplitTable($(element));
        });
      }
    },

    splitTable :  function(original) {
      var self = this;

      original.wrap("<div class='table-wrapper' />");
      
      var copy = original.clone();
      copy.find("td:not(:first-child), th:not(:first-child)").css("display", "none");
      copy.removeClass("responsive");
      
      original.closest(".table-wrapper").append(copy);
      copy.wrap("<div class='pinned' />");
      original.wrap("<div class='scrollable' />");

      self.setCellHeights(original, copy);
    },

    unsplitTable: function(original) {
      original.closest(".table-wrapper").find(".pinned").remove();
      original.unwrap();
      original.unwrap();
    },

    setCellHeights: function(original, copy) {
      var tr = original.find('tr'),
          tr_copy = copy.find('tr'),
          heights = [];   

      tr.each(function (index) {
        var self = $(this),
            tx = self.find('th, td');

        tx.each(function () {
          var height = $(this).outerHeight(true);
          
          console.log($(this), height);

          heights[index] = heights[index] || 0;
          if (height > heights[index]) heights[index] = height;
        });

      });

      tr_copy.each(function (index) {
        $(this).height(heights[index]);
      });
    }
  };
}(Arc.zj, this, this.document));