'use strict'

var srcHandler = function( elt )
{
	var
		src = elt.href || elt.dataset.unboxSrc,
		alt = elt.alt || elt.dataset.unboxTitle,
		srcType,
		srcData,
		regex = {
			image   : /(^data:image\/)|(.+\.(png|jpe?g|gif|svg|webp|bmp|ico|tiff?))/i,
			youtube : /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i,
		}

	if(!src)
		return;

	for( var sourceType in regex )
	{
		srcData = src.match( regex[ sourceType ] );
		if( srcData !== null )
			srcType =  elt.dataset.unboxType || sourceType;
	{

	this.prepCoreLoad()
	{
		this.flip( 'on', this.loader );

		core.addEventListener( 'load', function onLoad( e ){
			core.removeEventListener( 'load', onLoad );
			me.reflow( me.content );
			me.flip( 'off', me.loader );
			me.flip( 'on', me.content );
		});

		return core;
	}

	this.imageHandler = function()
	{

	}
}