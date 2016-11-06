'use strict';

Element.prototype.getTransitionDuration = function()
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

	var transDurations = getPropDurations( this, 'transition-duration' );
	var transDelays = getPropDurations( this, 'transition-delay' );

	return Math.max.apply( null, sumArrays( transDurations, transDelays ) );
};

var div = document.querySelector('div');
console.log( div.getTransitionDuration() );

console.log('--------------------');

Element.prototype.addClass = function( str )
{
	var elt = this;

	return new Promise( function( resolve, reject ){
		elt.classList.add( str );
		setTimeout( function(){
			resolve( elt );
		}, elt.getTransitionDuration() );
	});
};


div.addClass('on').then( function(elt){ console.log( elt, elt.getTransitionDuration() ) } );


















function MyRpc() {
  this.promise = new Promise();
}
// teach it to be a promise
MyRpc.prototype.then = function( onFulfilled, onRejected ){
	return this.promise.then( onFulfilled, onRejected );
};

// teach it to be a deferred
MyRpc.prototype.resolve = function( arg ){
	this.promise.resolve( arg );
};

MyRpc.prototype.reject = function( arg ){
	this.promise.reject( arg );
};

// define your methods!

MyRpc.prototype.method1 = function(arg)
{
	var p = this.promise.then( function(value) {
	// logic of `method1` from foo.method1 here
	});

	var rpc = new MyRpc(); // our continuation;

	p.then( function(v){ rpc.resolve(v) }, function(e){ rpc.reject(e); });
	return rpc;
};