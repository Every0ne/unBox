'use strict';

var unbox = function(selector, options)
{
	if( !( this instanceof unbox ) )
		return new unbox(selector, options);

	this.options = {
		group: false,
	};

	Object.assign(this.options, options);

	this.elts = document.querySelectorAll( selector );
	this.currentIdx = null;
	this.box = this.parseHTML('<div class="unbox"><div class="unbox-next"></div><div class="unbox-prev"></div><div class="unbox-loader-ctr"><div class="unbox-loader"></div></div></div>');
	this.loader = this.box.querySelector('.unbox-loader-ctr');
	this.nextBtn = this.box.querySelector('.unbox-next');
	this.prevBtn = this.box.querySelector('.unbox-prev');
	this.content = null;
	
	this.tpl = {
		content: '<div class="unbox-content-ctr"></div>',
		image: function(src, alt){ return '<img src="'+src+'" alt="'+alt+'" class="unbox-content">'; },
	};

	this.regex = {
		image      : /(^data:image\/)|(\.(png|jpe?g|gif|svg|webp|bmp|ico|tiff?)(\?\S*)?$)/i,
		//youtube    : /(youtube(-nocookie)?\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?([\w-]{11})(.*)?/i, //TODO

/*youtube links
		https://youtu.be/lBafpMW8pEI?t=5m7s
		https://www.youtube.com/watch?v=lBafpMW8pEI&t=15
*/

		//vimeo      : /(vimeo(pro)?.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/,  //TODO
		//googlemaps : /((maps|www)\.)?google\.([^\/\?]+)\/?((maps\/?)?\?)(.*)/i, //TODO
		//fbvideo    : /(facebook\.com)\/([a-z0-9_-]*)\/videos\/([0-9]*)(.*)?$/i  //TODO
	};

	

	if(!NodeList.prototype.forEach)
		NodeList.prototype.forEach = Array.prototype.forEach;

	var	me = this;

	this.elts.forEach( function( elt, i ){
		elt.dataset.unboxIndex = i;
		elt.addEventListener( 'click', function( e ){
			e.preventDefault();
			me.create().open( elt );
		});
	});

	this.box.addEventListener('click', function unboxClick( evt ){
		evt.preventDefault();

		switch( true ){
			case evt.target.matches( '.unbox-content-ctr' ):
			case evt.target.matches( '.unbox-loader-ctr' ):
			case evt.target.matches( '.unbox-close' ):
			case evt.target === evt.currentTarget:
				me.close().destroy();
				break;

			case evt.target.matches( '.unbox-next' ):
				me.goTo( +1 );
				break;

			case evt.target.matches( '.unbox-prev' ):
				me.goTo( -1 );
				break;
		}
	});

	this.evt = {
		swipeLeft  : function(e){ me.goTo( +1 ) },
		swipeRight : function(e){ me.goTo( -1 ) },
		keyDown    : function(e){
			e.preventDefault();
			var key = (window.event) ? event.keyCode : e.keyCode;
			switch(key){
				case 37: me.goTo( -1 );    break; // left arrow to prev
				case 39: me.goTo( +1 );    break; // right arrow to next
				case 27: me.close().destroy(); break; // escape key closes
			}
		}
	};

	return this;
};


unbox.prototype.create = function()
{
	var d = document;
	d.body.appendChild( this.box );
	d.addEventListener('swipeleft',  this.evt.swipeLeft );
	d.addEventListener('swiperight', this.evt.swipeRight );
	d.addEventListener('keydown',    this.evt.keyDown );

	this.reflow( this.box );
	this.box.classList.add('on');
	return this;
};



unbox.prototype.open = function( elt )
{
	if( this.content !== null )
		this.close();

	this.currentIdx = Number( elt.dataset.unboxIndex );
	this.handleNavigation();

	var src = elt.href || elt.dataset.unboxSrc;
	var alt = elt.alt || elt.dataset.unboxTitle;
	var me = this;

	if(src)
	{
		var srcType = this.getSrcType( src );
		var inner = this.parseHTML( this.tpl[ srcType ]( src, alt ) );

		this.loader.classList.add( 'on' );

		inner.addEventListener( 'load', function onLoad( e ){
			inner.removeEventListener( 'load', onLoad );
			me.reflow( me.content );
			me.loader.classList.remove( 'on' );
			me.content.classList.add('on');
		});

		this.content = this.parseHTML( this.tpl.content );
		this.content.appendChild( inner );
		this.box.appendChild( this.content );
	}

	return;
};



unbox.prototype.getSrcType = function( src )
{
	for( var srcType in this.regex ){
		if( this.regex[srcType].test( src ) )
			return srcType;
	};

	return 'image';
};



unbox.prototype.close = function()
{
	var c = this.content;
	this.content = null;

	c.classList.remove('on');

	setTimeout( function(){
		c.remove();
	}, this.getTransitionDuration( c ) );

	return this;
};



unbox.prototype.destroy = function()
{
	var me = this;

	document.removeEventListener('swipeleft',  this.evt.swipeLeft );
	document.removeEventListener('swiperight', this.evt.swipeRight );
	document.removeEventListener('keydown',    this.evt.keyDown );
	this.box.classList.remove('on');

	setTimeout( function(){
		me.box.remove();
	}, this.getTransitionDuration( this.box ) );
}



unbox.prototype.handleNavigation = function()
{
	if( !this.options.group || this.elts.length < 2)
		return;

	var l = this.elts.length - 1;
	var n = this.currentIdx;

	if( n == 0 )
		this.prevBtn.classList.remove('on');
	if( n == l )
		this.nextBtn.classList.remove('on');
	if( n > 0 )
		this.prevBtn.classList.add('on');
	if( n < l )
		this.nextBtn.classList.add('on');
	if( n < 0 || n > l)
		return;
}



unbox.prototype.goTo = function( n )
{
	var l = this.elts.length - 1;
	var m = this.currentIdx + Number( n );

	if( m < 0 || m > l)
		return;

	this.open( this.elts[ m ] );
}



/* Tool methods */

unbox.prototype.parseHTML = function( str )
{
	var div = document.createElement('div');

	div.insertAdjacentHTML('afterbegin', str);

	return div.childElementCount == 1 ? div.children.item(0) : div.children;
};



unbox.prototype.getTransitionDuration = function( elt )
{
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


unbox.prototype.reflow = function( elt ){
	return elt.offsetHeight || document.body.offsetHeight;
};


unbox.prototype.killChildren = function( elt ){
	while( elt.lastChild )
		elt.lastChild.remove();
};


unbox.prototype.parseURLArgs = function( url ){
	var obj = {}, p;
/*
	// Makes a key=value strings array and uses it to make a key : value object.
	decodeURI( url.split('#')[0] ).split('&').forEach( pair, i ){
		if( pair ){
			p = pairs.split('=');
			obj[ p[0] ] = p[1];
		}
	}

	return obj;*/
};