/**
 * Responsive Drag
 * A lightweight drag plugin for Zepto and jQuery, with an eye towards
 * responsive designs. Designed to be versatile and extendable,
 * providing base functionality, hopefully without getting in the way.
 *
 * @author Johan Halse, Varvet AB
 * @version 1.0
 * @param   {object} el      DOM Element to operate on
 * @param   {object} options Settings object
 * @return  {object}         Self
 */
(function(window, $) {
  var RDrag = function(el, options){
    this.$el = $(el);
    this.dragging = false;
    this.buttonReleased = false;
    this.offset = {top:0, left:0};
    this.origo = {
      top: this.$el.offset().top - this.$el.position().top,
      left: this.$el.offset().left - this.$el.position().left
    };

    this.deltaOrigo = this.origo;
    this.delta = {left:0, top:0};
    this.percent = {left:0, top:0};
    this.dragEvents = null;
    this.refreshTimer = null;
    this.options = options;
  };

  RDrag.prototype = {
    defaults: {
      threshold: 3,
      translate: true,
      dragMethod: 'auto',
      resizeInterval: 50
    },

    /**
     * Constructor
     * @return {null}
     */
    init: function() {
      this.settings = $.extend({}, this.defaults, this.options);
      this.setupSettings();
      this.setupEvents();

      return this;
    },

    /**
     * Mangle settings a little, translating local to global for
     * constraints and dragging.
     * @return {null}
     */
    setupSettings: function() {
      // Translation or absolute positioning?
      if(this.settings.translate) {
        if(this.settings.moveFunction == null) {
          this.settings.moveFunction = this.setPositionTranslate;
        }
        this.origo = this.$el.offset();
        this.deltaOrigo = this.origo;
      }
      else {
        if(this.settings.moveFunction == null) {
          this.settings.moveFunction = this.setPositionAbsolute;
        }
        if(this.settings.constraints) {
          this.settings.constraints[0] += this.$el.position().top;
          this.settings.constraints[1] += this.$el.position().top;
          this.settings.constraints[2] += this.$el.position().left;
          this.settings.constraints[3] += this.$el.position().left;
        }
      }

      // Touch or mouse?
      if(this.settings.touchDetect == null) {
        this.settings.touchDetect = this.touchDetect;
      }
      var t = {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'        
      };
      var m = {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'
      };

      if(this.settings.dragMethod == 'mouse') {this.dragEvents = m;}
      else if(this.settings.dragMethod == 'touch') {this.dragEvents = t;}
      else {this.dragEvents = (this.settings.touchDetect()) ? t : m;}

      // Set up refresh on resize
      if(this.settings.resize) {
        $(window).on('resize', $.proxy(this.onResize, this));
      }
    },

    /**
     * If user hasn't specified input method, try to detect it
     * @return {boolean} True if touch, false if mouse
     */
    touchDetect: function() {
      return 'ontouchstart' in window;
    },

    /**
     * Register initial mousedown callback
     * @return {null}
     */
    setupEvents: function() {
      this.$el.on(this.dragEvents.start, $.proxy(this.downHandler, this));
    },

    /**
     * Handle the conversion from global to local coordinates, if
     * needed. Also sets origo point to calculate dragged delta.
     * @param  {object} e Event object
     * @return {object}   Coordinates, as top and left object
     */
    calculateOffset: function(e) {
      this.deltaOrigo = { top:e.clientY, left:e.clientX };
      var o = this.$el.offset();
      return {
        top: e.clientY + this.origo.top - o.top,
        left: e.clientX + this.origo.left - o.left
      };
    },

    /**
     * Calculates how far the user has dragged the object
     * @param  {object} e Event object
     * @return {object}   Delta for top and left
     */
    calculateDelta: function(e) {
      return {
        top: e.clientY - this.deltaOrigo.top,
        left: e.clientX - this.deltaOrigo.left
      };
    },

    /**
     * Calculates how far the user has dragged the object relative to
     * its constraints
     * @param  {object} e Event object
     * @return {object}   Delta for top and left
     */
    calculatePercent: function(e) {
      if(this.settings.constraints == null) return;

      var vConstraint = this.settings.constraints[1] - this.settings.constraints[0];
      var hConstraint = this.settings.constraints[3] - this.settings.constraints[2];

      var r = {top:0, left:0};
      var pos = this.constrain(e.clientY - this.offset.top, e.clientX - this.offset.left);
      if(vConstraint > 0) r.top = pos.top/vConstraint;
      if(hConstraint > 0) r.left = pos.left/hConstraint;

      return r;
    },

    /**
     * Constrain the dragged object to coordinates supplied by settings
     * @param  {number} top  Top value, in relative pixels
     * @param  {number} left Left value, in relative pixels
     * @return {object}      Object with top and left values
     */
    constrain: function(top, left) {
      if(this.settings.constraints) {
        if(top < this.settings.constraints[0]) top = this.settings.constraints[0];
        if(top > this.settings.constraints[1]) top = this.settings.constraints[1];
        if(left < this.settings.constraints[2]) left = this.settings.constraints[2];
        if(left > this.settings.constraints[3]) left = this.settings.constraints[3];
      }

      return {
        top: top,
        left: left
      }
    },

    /**
     * When user has clicked, but before drag has started
     * @param  {object} e Event object
     * @return {null}
     */
    downHandler: function(e) {
      e.preventDefault();
      var eventObject = (e.touches) ? e.touches[0] : e;

      this.offset = this.calculateOffset(eventObject);
      this.delta = this.calculateDelta(eventObject);
      this.percent = this.calculatePercent(eventObject);
      this.buttonDown = true;

      // TODO: find a a better way to save this reference for unbinding
      $(window).on(this.dragEvents.end, $.proxy(this.upHandler, this));
      $(window).on(this.dragEvents.move, $.proxy(this.moveHandler, this));
    },

    /**
     * Default onMove handler, either waits for threshold to be reached
     * or moves the object around.
     * @param  {object} e Event object
     * @return {null}
     */
    moveHandler: function(e) {
      if(!this.buttonDown) {
        return false;
      }
      var eventObject = (e.touches) ? e.touches[0] : e;

      this.delta = this.calculateDelta(eventObject);
      this.percent = this.calculatePercent(eventObject);
      if(this.dragging == false) {
        if(Math.max( Math.abs(this.delta.left), Math.abs(this.delta.top) ) > this.settings.threshold) {
          this.dragging = true;
          this.$el.trigger('dragstart', [this.delta, this.percent]);
        }
        else {
          return;
        }
      }

      this.settings.moveFunction.apply(this, [eventObject]);
      this.$el.trigger('dragmove', [this.delta, this.percent]);
    },

    /**
     * Default dragend handler. Unbinds move and up listeners.
     * @param  {object} e Event object
     * @return {null}
     */
    upHandler: function(e) {
      $(window).off('mousemove touchmove');
      $(window).off('mouseup touchend');
      // $(window).off('mousemove', $.rDrag.moveHandler);
      // $(window).off('mouseup', $.rDrag.upHandler);
      if(this.dragging) {
        this.$el.trigger('dragend', [this.delta, this.percent]);
      }
      this.dragging = false;
      this.buttonDown = false;
    },

    /**
     * Debounced function to be run on resize
     * @return {null}
     */
    onResize: function() {
      if(this.settings.resizeInterval) {
        var that = this;
        if(this.refreshTimer == null) {
          this.refreshTimer = setTimeout(function() {
            that.settings.resize.apply(that.$el[0]);
            that.refreshTimer = null;
          }, this.settings.resizeInterval);          
        }
      }
      else {
        this.origo = {
          top: this.$el.offset().top - this.$el.position().top,
          left: this.$el.offset().left - this.$el.position().left
        };
        this.settings.resize.apply(this.$el[0]);
      }
    },

    /**
     * Use the specified moveFunction to move object to x and y
     * @param  {number} x X position
     * @param  {number} y Y position
     * @return {null}
     */
    setPosition: function(x, y) {
      this.settings.moveFunction.apply(this, [{
        clientY: this.origo.top + y,
        clientX: this.origo.left + x
      }]);
    },

    getPosition: function() {
      return {
        top: this.$el.offset().top - this.origo.top,
        left: this.$el.offset().left - this.origo.left
      }
    },

    // /**
    //  * Refresh element's constrained position
    //  * @return {null}
    //  */
    // refreshConstraints: function() {
    //   this.moveHandler({
    //     clientY: this.$el.position().top + this.offset.top,
    //     clientX: this.$el.position().left + this.offset.left
    //   });
    // },

    /**
     * Move the object to an absolute position.
     * @param  {object} e Event object
     * @return {null}
     */
    setPositionAbsolute: function(e) {
      var pos = this.constrain(e.clientY - this.offset.top, e.clientX - this.offset.left);
      this.$el.css({
        position: 'absolute',
        top: pos.top,
        left: pos.left
      });
    },

    /**
     * Move the object to a translated position.
     * @param  {object} e Event object
     * @return {null}
     */
    setPositionTranslate: function(e) {
      var pos = this.constrain(e.clientY - this.offset.top, e.clientX - this.offset.left);
      this.$el.css({
        '-moz-transform': 'translate('+pos.left+'px, '+pos.top+'px)',
        '-webkit-transform': 'translate3d('+pos.left+'px, '+pos.top+'px,0px)',
        '-o-transform': 'translate('+pos.left+'px, '+pos.top+'px)',
        '-ms-transform': 'translate('+pos.left+'px, '+pos.top+'px)',
        'transform': 'translate('+pos.left+'px, '+pos.top+'px)'
      });
    }
  };

  RDrag.defaults = RDrag.prototype.defaults;

  $.fn.rDrag = function(settings) {
    return this.each(function() {
      var d = new RDrag(this, settings).init();
      this.rDrag = d;
    });
  };

  $.rDrag = RDrag;
})(window, $);