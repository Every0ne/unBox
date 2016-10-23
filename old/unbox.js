/*
 * unBox [http://trentrichardson.com/examples/jQuery-unbox]
 * Originally by: Trent Richardson [http://trentrichardson.com/examples/jQuery-unbox/]
 * forked and modified by Every0ne [https://github.com/Every0ne/unBox]
 *
 * ©2015 Every0ne
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 */

var unbox = function(that, options){

	this.defaults = {
		theme: 'unbox',       // class name parent gets (for your css)
		selector: null,       // the selector to delegate to, should be to the <a> which contains an <img>
		prev: '&larr;',       // use an image, text, whatever for the previous button
		next: '&rarr;',       // use an image, text, whatever for the next button
		loading: '%',         // use an image, text, whatever for the loading notification
		close: '&times;',     // use an image, text, whatever for the close button
		zIndex: null,         // zIndex to apply to the outer container
		cycle: true,          // whether to cycle through galleries or stop at ends
		captionAttr: 'title', // name of the attribute to grab the caption from
		template: 'image',    // the default template to be used (see templates below)
		templates: {          // define templates to create the elements you need function($item, settings)
			image: function( item, settings, callback ){
				return this.parseHTML('<img src="'+ item.getAttribute('href') +'" class="'+ settings.theme +'-content" />').addEventListener('load', callback);
			}
		}
	};

	//console.log( 'that' );
	//console.log( that );

	this.settings = this.extend( this.defaults, options );
	this.container = that;    // parent container holding items
	this.box = null;          // the lightbox modal
	this.items = null;        // recomputed each time it's opened
	this.idx = 0;             // of the items which index are we on
	this.enable();

};



unbox.prototype.extend = function( a, b ){
	var c = {};

	for( var p in a )
		c[p] = b[p] == null ? a[p] : b[p];

	return c;
}



unbox.prototype.parseHTML = function( str ){
	var div = document.createElement('div')

	div.insertAdjacentHTML('afterbegin', str);

	return div.childElementCount == 1 ? div.children.item(0) : div.children;
};



unbox.prototype.getTransitionDuration = function( elt ){
	function getPropDurations( elt, prop ){
		return getComputedStyle( elt )[ prop ].toLowerCase().split(',').map( function( duration ){
			return ( duration.indexOf("ms") > -1 ) ? parseFloat( duration ) : parseFloat( duration ) * 1000;
		});
	}

	function sumArrays( arr1, arr2 ){
		return arr1.map( function( num, i ){
			var result = num + arr2[i];
			return isNaN( result ) ? 0 : result;
		});
    }

	var transDurations = getPropDurations( elt, 'transition-duration' );
	var transDelays = getPropDurations( elt, 'transition-delay' );

	return Math.max.apply( null, sumArrays( transDurations, transDelays ) );
};



unbox.prototype.trigger = function( elt, eventName, data ){
	var event = new CustomEvent( eventName, data );
	elt.dispatchEvent( event );
}



unbox.lookup = { i: 0 };



unbox.prototype.enable = function(){
	var self = this;

	self.container.addEventListener('click', function unboxCtrClick( event ){
		event.preventDefault();

		//console.log( 'Settings selector:')
		//console.log( self.settings.selector );
		//console.log( 'Event target:');
		//console.log( event.target );
		//console.log( 'self.container:' );
		//console.log( self.container );
		//console.log( 'self:');
		//console.log( self );

		if( self.settings.selector !== null )
		{
			//if( event.target.matches( self.settings.selector ) )
			//{
				event.preventDefault();
				self.open(this);
			//}
			//else
				//return;
		}
		else
			self.open(this);
	});

	return self.container;
};



unbox.prototype.open = function(i){
	var self = this;

	console.log('i');
	console.log( i );
	console.log('self.container');
	console.log( self.container );

	// figure out where to start
	self.items = self.settings.selector === null ? [self.container] : self.container.querySelectorAll( self.settings.selector );

	if( isNaN(i) )
		i = self.items[i];

	// build the unbox
	self.box = this.parseHTML('<div class="'+ self.settings.theme +'">'+
		'<a href="#" class="'+ self.settings.theme +'-close '+ self.settings.theme +'-button">'+ self.settings.close +'</a>' +
		'<a href="#" class="'+ self.settings.theme +'-prev '+ self.settings.theme +'-button">'+ self.settings.prev +'</a>' +
		'<a href="#" class="'+ self.settings.theme +'-next '+ self.settings.theme +'-button">'+ self.settings.next +'</a>' +
		'<div class="'+ self.settings.theme +'-contents"></div>' +
		'<div class="'+ self.settings.theme +'-caption"><p></p></div>' +
		'</div>');

	if( self.settings.zIndex )
		self.box.style.zIndex = self.settings.zIndex;

	self.box.addEventListener('click', function unboxClick( event ){
		e.preventDefault();

		switch( true ){
			case event.target.matches( '.'+self.settings.theme +'-close' ):
				self.close();
				break;

			case event.target.matches( '.'+self.settings.theme +'-next' ):
				self.next();
				break;

			case event.target.matches( '.'+self.settings.theme +'-prev' ):
				self.prev();
				break;

			case event.target.matches( '.'+self.settings.theme +'-contents' ):
				if( event.target.classList.contains( self.settings.theme +'-content' ) && self.items.length > 1 )
					self.next();
				else
					self.close();
				break;
		}
	});

	// add some key hooks
	document.addEventListener('swipeleft', function unboxSwipeLeft(e){ self.next(); });
	document.addEventListener('swiperight', function unboxSwipeRight(e){ self.prev(); });
	document.addEventListener('keydown', function unboxKeyDown(e){
		e.preventDefault();
		var key = (window.event) ? event.keyCode : e.keyCode;
		switch(key){
			case 27: self.close(); break; // escape key closes
			case 37: self.prev(); break;  // left arrow to prev
			case 39: self.next(); break;  // right arrow to next
		}
	});
	setTimeout( function(){
		self.box.classList.add('fade-in');
	}, 50);

	self.trigger( self.container, 'unbox:open', [self] );
	self.goto(i);
	return self.container;
};



unbox.prototype.close = function(){
	var self = this;

	if(self.box && self.box.length)
	{
		self.box.removeEventListener('click', unboxClick);
		self.box.classlist.remove('fade-in');
		setTimeout( function(e){
			self.box.remove();
			self.box = null;
			self.trigger( self.container, 'unbox:close', [self] );
		}, self.getTransitionDuration( self.box ) );
	}
	document.removeEventListener(unboxSwipeLeft);
	document.removeEventListener(unboxSwipeRight);
	document.removeEventListener(unboxKeyDown);

	return self.container;
};



unbox.prototype.goto = function(i){
	var self = this,
		item = self.items[i],
		captionVal = item.getAttribute( self.settings.captionAttr ),
		cap = self.box.querySelector( '.'+ self.settings.theme +'-caption' ),
		bi = self.box.querySelector( '.'+ self.settings.theme +'-contents' ),
		img = null;

	if( captionVal ){
		cap.querySelector('p').innerHTML = captionVal,
		cap.style.display = 'block';
	} else {
		cap.style.display = 'none';
	}

	if( item.length ){
		self.idx = i;
		bi.innerHTML('<div class="'+ self.settings.theme +'-loading '+ self.settings.theme +'-button">'+ self.settings.loading +'</div>');

		img = self.settings.templates[ item.dataset.unboxTemplate || self.settings.template ](item, self.settings, function( content ){
			bi.innerHTML = this;
		});

		if( self.items.length == 1 || !self.settings.cycle ){
			if( i <= 0)
				self.box.querySelector('.'+ self.settings.theme +'-prev').style.display = 'none';
			if( i >= self.items.length - 1 )
				self.box.querySelector('.'+ self.settings.theme +'-next').style.display = 'block';
		}
		self.trigger( self.container, 'unbox:goto', [self, i, item, img] );
	}
	return self.container;
};



unbox.prototype.prev = function(){
	var self = this;
	return self.goto( self.idx === 0 ? self.items.length - 1 : self.idx - 1 );
};



unbox.prototype.next = function(){
	var self = this;
	return self.goto( self.idx === self.items.length - 1 ? 0 : self.idx + 1 );
};



unbox.prototype.disable = function(){
	var self = this;
	self.trigger( self.container, 'unbox:disable', [self] );
	return self.close()
};



unbox.prototype.destroy = function(){
	var self = this;
	self.container.dataset = null;
	self.trigger( self.container, 'unbox:destroy', null );
	return self.container;
};



unbox.prototype.option = function(key, val){
	var self = this;
	if(val !== undefined){
		self.settings[key] = val;
		return self.disable().enable();
	}
	return self.settings[key];
};


(function($){
	$.fn.unbox = function(o) {

		o = o || {};

		//console.log( 'o' );
		//console.log( o );

		var tmp_args = Array.prototype.slice.call(arguments);

		if (typeof(o) == 'string'){
			if(o == 'option' && typeof(tmp_args[1]) == 'string' && tmp_args.length === 2){
				var inst = unbox.lookup[ this.dataset.unbox ];
				return inst[o].apply( inst, tmp_args.slice(1) );
			}
			else return this.each(function() {
				var inst = unbox.lookup[ this.dataset.unbox ];
				inst[o].apply( inst, tmp_args.slice(1) );
			});
		} else return this.each(function() {
			//console.log('this');
			//console.log(this);

			var that = this;
			unbox.lookup[ ++unbox.lookup.i ] = new unbox(that, o);
			that.dataset.unbox = unbox.lookup.i;
		});
	};


})(window.jQuery || window.Zepto || window.$);