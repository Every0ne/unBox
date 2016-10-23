/*
 * unBox [http://trentrichardson.com/examples/jQuery-unbox]
 * Originally by: Trent Richardson [http://trentrichardson.com/examples/jQuery-unbox/]
 * forked and modified by Every0ne [https://github.com/Every0ne/unBox]
 *
 * ©2015 Every0ne
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 */
(function($){
	$.unbox = function($this, options){

		//console.log( '$this' );
		//console.log( $this );

		this.settings = $.extend(true, {}, $.unbox.defaults, options);
		this.$el = $this;      // parent container holding items
		this.$box = null;      // the lightbox modal
		this.$items = null;    // recomputed each time its opened
		this.idx = 0;          // of the $items which index are we on
		this.enable();
	};

	$.unbox.defaults = {
		theme: 'unbox',       // class name parent gets (for your css)
		selector: null,       // the selector to delegate to, should be to the <a> which contains an <img>
		prev: '&larr;',       // use an image, text, whatever for the previous button
		next: '&rarr;',       // use an image, text, whatever for the next button
		loading: '%',         // use an image, text, whatever for the loading notification
		close: '&times;',     // use an image, text, whatever for the close button
		speed: 400,           // speed to fade in or out
		zIndex: 1000,         // zIndex to apply to the outer container
		cycle: true,          // whether to cycle through galleries or stop at ends
		captionAttr: 'title', // name of the attribute to grab the caption from
		template: 'image',    // the default template to be used (see templates below)
		templates: {          // define templates to create the elements you need function($item, settings)
			image: function($item, settings, callback){
				return $('<img src="'+ $item.attr('href') +'" class="'+ settings.theme +'-content" />').load(callback);
			}
		}
	};

	$.unbox.setDefaults = function(options){
		$.unbox.defaults = $.extend(true, {}, $.unbox.defaults, options);
	};

	$.unbox.lookup = { i: 0 };

	$.extend($.unbox.prototype, {
		enable: function(){
				var t = this;

				return t.$el.on('click.unbox', t.settings.selector, function(e){
					e.preventDefault();

					//console.log( 'Settings selector:');
					//console.log( t.settings.selector );
					//console.log( 'Event target:');
					//console.log( e.target );
					//console.log( 't:');
					//console.log( t );

					t.open(this);
				});
			},
		open: function(i){
				var t = this;

				console.log('i');
				console.log( i );
				console.log('t.$el');
				console.log( t.$el );

				// figure out where to start
				t.$items = t.settings.selector === null? t.$el : t.$el.find(t.settings.selector);

				if(isNaN(i))
					i = t.$items.index(i);

				// build the unbox
				t.$box = $('<div class="'+ t.settings.theme +'">'+
							'<a href="#" class="'+ t.settings.theme +'-close '+ t.settings.theme +'-button">'+ t.settings.close +'</a>' +
							'<a href="#" class="'+ t.settings.theme +'-prev '+ t.settings.theme +'-button">'+ t.settings.prev +'</a>' +
							'<a href="#" class="'+ t.settings.theme +'-next '+ t.settings.theme +'-button">'+ t.settings.next +'</a>' +
							'<div class="'+ t.settings.theme +'-contents"></div>'+
							'<div class="'+ t.settings.theme +'-caption"><p></p></div>' +
						'</div>').appendTo('body').css('zIndex',t.settings.zIndex)
						.on('click.unbox','.'+t.settings.theme +'-close', function(e){ e.preventDefault(); t.close(); })
						.on('click.unbox','.'+t.settings.theme +'-next', function(e){ e.preventDefault(); t.next(); })
						.on('click.unbox','.'+t.settings.theme +'-prev', function(e){ e.preventDefault(); t.prev(); })
						.on('click.unbox','.'+t.settings.theme +'-contents', function(e){
							e.preventDefault();
							// if the content is clicked, go to the next, otherwise close
							if($(e.target).hasClass(t.settings.theme +'-content') && t.$items.length > 1){
								t.next();
							}else{
								t.close();
							}
						});

				// add some key hooks
				$(document).on('swipeLeft.unbox', function(e){ t.next(); })
					.on('swipeRight.unbox', function(e){ t.prev(); })
					.on('keydown.unbox', function(e){
							e.preventDefault();
							var key = (window.event) ? event.keyCode : e.keyCode;
							switch(key){
								case 27: t.close(); break; // escape key closes
								case 37: t.prev(); break;  // left arrow to prev
								case 39: t.next(); break;  // right arrow to next
							}
						});
				setTimeout( function(){
					t.$box.addClass('fade-in');
				}, 50);

				t.$el.trigger('unbox:open',[t]);
				t.goto(i);
				return t.$el;
			},
		close: function(){
				var t = this;

				if(t.$box && t.$box.length){
					t.$box.removeClass('fade-in');
					setTimeout(function(e){
						t.$box.remove();
						t.$box = null;
						t.$el.trigger('unbox:close',[t]);
					}, t.settings.speed);
				}
				$(document).off('.unbox');

				return t.$el;
			},
		goto: function(i){
				var t = this,
					$item = $(t.$items[i]),
					captionVal = $item.attr(t.settings.captionAttr),
					$cap = t.$box.children('.'+ t.settings.theme +'-caption')[captionVal?'show':'hide']().children('p').text(captionVal),
					$bi = t.$box.children('.'+ t.settings.theme +'-contents'),
					$img = null;

				if($item.length){
					t.idx = i;
					$bi.html('<div class="'+ t.settings.theme +'-loading '+ t.settings.theme +'-button">'+ t.settings.loading +'</div>');

					$img = t.settings.templates[$item.data('unbox-template') || t.settings.template]($item, t.settings, function(content){
						$bi.empty().append($(this));
					});

					if(t.$items.length == 1 || !t.settings.cycle){
						t.$box.children('.'+ t.settings.theme +'-prev')[i<=0 ? 'hide' : 'show']();
						t.$box.children('.'+ t.settings.theme +'-next')[i>=t.$items.length-1 ? 'hide' : 'show']();
					}
					t.$el.trigger('unbox:goto',[t, i, $item, $img]);
				}
				return t.$el;
			},
		prev: function(){
				var t = this;
				return t.goto(t.idx===0? t.$items.length-1 : t.idx-1);
			},
		next: function(){
				var t = this;
				return t.goto(t.idx===t.$items.length-1? 0 : t.idx+1);
			},
		disable: function(){
				var t = this;
				return t.close().off('.unbox').trigger('unbox:disable',[t]);
			},
		destroy: function(){
				var t = this;
				return t.disable().removeData('unbox').trigger('unbox:destroy');
			},
		option: function(key, val){
				var t = this;
				if(val !== undefined){
					t.settings[key] = val;
					return t.disable().enable();
				}
				return t.settings[key];
			}
	});

	$.fn.unbox = function(o) {
		o = o || {};

		//console.log( 'o' );
		//console.log( o );

		var tmp_args = Array.prototype.slice.call(arguments);

		if (typeof(o) == 'string'){
			if(o == 'option' && typeof(tmp_args[1]) == 'string' && tmp_args.length === 2){
				var inst = $.unbox.lookup[$(this).data('unbox')];
				return inst[o].apply(inst, tmp_args.slice(1));
			}
			else return this.each(function() {
				var inst = $.unbox.lookup[$(this).data('unbox')];
				inst[o].apply(inst, tmp_args.slice(1));
			});
		} else return this.each(function() {
			//console.log('this');
			//console.log(this);

			var $t = $(this);
			$.unbox.lookup[++$.unbox.lookup.i] = new $.unbox($t, o);
			$t.data('unbox', $.unbox.lookup.i);
		});
	};


})(window.jQuery || window.Zepto || window.$);