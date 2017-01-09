'use strict';

var unbox = function(selector, options)
{
	if( !( this instanceof unbox ) )
		return new unbox(selector, options);

	this.options = Object.assign({
		group: false,
	}, options);

	this.elts = document.querySelectorAll( selector );
	this.currentIdx = null;
	this.box = this.parseHTML('<div class="unbox"><div class="unbox-next"></div><div class="unbox-prev"></div><div class="unbox-loader-ctr"><div class="unbox-loader"></div></div></div>');
	this.loader = this.box.querySelector('.unbox-loader-ctr');
	this.nextBtn = this.box.querySelector('.unbox-next');
	this.prevBtn = this.box.querySelector('.unbox-prev');
	this.content = null;

	this.wrpTpl = {
		content : '<div class="unbox-content-ctr"></div>',
		youtube : [
			'<div class="unbox-content unbox-video-outer"></div>',
			'<div class="unbox-video-inner"></div>',
		],
	}

	this.coreTpl = {
		image   : function( srcData, alt ){ return '<img src="'+srcData[1]+'" alt="'+alt+'" class="unbox-content">' },
		youtube : function( srcData ){ return '<iframe src="https://www.youtube'+srcData[2]+'.com/embed/'+srcData[3]+srcData[4]+'" frameborder="0" allowfullscreen></iframe>' },
		video   : function( srcData ){ return '<video controls autoplay class="unbox-content"><source src="'+srcData[1]+'" type="video/'+srcData[3]+'">Your browser does not support the video tag.</video>' },
		flash   : function( srcData ){ return '<embed src="'+srcData[1]+'" width="'+srcData[2]+'" height="'+srcData[3]+'" scale="noborder" wmode="direct" class="unbox-content">'},
		url     : function( srcData ){ return '<iframe src="'+srcData[1]+'" frameborder="0" class="unbox-content"></iframe>' },
	};

	this.regex = {
		image      : /(^data:image\/)|(.+\.(png|jpe?g|gif|svg|webp|bmp|ico|tiff?))/i,
		youtube    : /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtu\.be\/|youtube(-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(.*)?/i,
		video      : /(.+\.(mp4|webm|ogg))/i,
		flash      : /.+\.(?:swf).*width=(\d+).*height=(\d+).*/i,
		//vimeo      : /(vimeo(pro)?.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/,  //TODO
		//googlemaps : /((maps|www)\.)?google\.([^\/\?]+)\/?((maps\/?)?\?)(.*)/i, //TODO
		//fbvideo    : /(facebook\.com)\/([a-z0-9_-]*)\/videos\/([0-9]*)(.*)?$/i  //TODO
	};
	
	this.loadEvt = {
		image   : 'load',
		youtube : 'load',
		video   : 'canplay',
		flash   : false,
		url     : 'load',
	}


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
}


unbox.prototype.create = function()
{
	var d = document;

	d.on = d.addEventListener;
	d.body.appendChild( this.box );
	d.on('swipeleft',  this.evt.swipeLeft );
	d.on('swiperight', this.evt.swipeRight );
	d.on('keydown',    this.evt.keyDown );

	this.reflow( this.box );
	this.flip( 'on', this.box );
	return this;
}



unbox.prototype.open = function( elt )
{
	if( this.content !== null )
		this.close();

	this.currentIdx = Number( elt.dataset.unboxIndex );
	this.handleNavigation();

	var
		src = elt.href || elt.dataset.unboxSrc,
		alt = elt.alt || elt.dataset.unboxTitle,
		me = this;

	if(!src)
		return;

	var
		srcData = this.getSrcData( src ),
		srcType = srcData[0],
		loadEvt = this.loadEvt[srcType];

	var core = this.parseHTML( this.coreTpl[ srcType ]( srcData, alt ) );

	if( loadEvt )
	{
		this.flip( 'on', me.loader );

		core.addEventListener( loadEvt, function onLoad( e ){
			core.removeEventListener( loadEvt, onLoad );
			me.reflow( me.content );
			me.flip( 'off', me.loader );
			me.flip( 'on', me.content );
		});
	}

	if( this.wrpTpl[ srcType ] )
		for( var i = this.wrpTpl[ srcType ].length; i--; )
			core = this.wrapHTML( core, this.wrpTpl[ srcType ][ i ] )

	console.log( core );
	console.log( srcData );

	this.content = this.parseHTML( this.wrpTpl.content );
	this.content.appendChild( core );
	this.box.appendChild( this.content );

	if( !loadEvt )
		this.flip( 'on', me.content );

	return;
}



unbox.prototype.getSrcData = function( src )
{
	var srcData;

	for( var srcType in this.regex )
	{
		srcData = src.match( this.regex[ srcType ] );

		if( srcData !== null )
		{
			srcData = srcData.map( function( match ){
				return match || '';
			});

			srcData.unshift( srcType );
			return srcData;
		}
	}

	return ['url', src ];
}



unbox.prototype.close = function()
{
	var c = this.content;
	this.content = null;

	setTimeout( function(){
		c.remove();
	}, this.flip( 'off', c ) );

	return this;
}



unbox.prototype.destroy = function()
{
	var me = this, d = document;
	d.off = d.removeEventListener;

	d.off('swipeleft',  this.evt.swipeLeft );
	d.off('swiperight', this.evt.swipeRight );
	d.off('keydown',    this.evt.keyDown );

	setTimeout( function(){
		me.box.remove();
	}, this.flip( 'off', this.box ) );
}



unbox.prototype.handleNavigation = function()
{
	if( !this.options.group || this.elts.length < 2)
		return;

	var l = this.elts.length - 1,
		n = this.currentIdx,
		nxt = this.nextBtn.classList,
		prv = this.prevBtn.classList;

	if( n == 0 )
		prv.remove('on');
	if( n == l )
		nxt.remove('on');
	if( n > 0 )
		prv.add('on');
	if( n < l )
		nxt.add('on');
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
}


unbox.prototype.wrapHTML = function( elt, str )
{
	var wrp = this.parseHTML( str );

	wrp.appendChild( elt );

	return wrp;
}


unbox.prototype.flip = function( state, elt )
{
	var c = elt.classList;

	if( state == 'on')
		c.add('on');
	else
		c.remove('on');

	return this.getTransitionDuration( elt );
}



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
}


unbox.prototype.reflow = function( elt ){
	return elt.offsetHeight || document.body.offsetHeight;
}



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
}


