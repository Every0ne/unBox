// /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
// /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
// /(youtube(-nocookie)?\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?([\w-]{11})(.*)?/i
// /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/

// For testing.
var urls = [
	'http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo',
	'http://www.youtube.com/watch?v=cKZDdG9FTKY&feature=channel',
	'http://www.youtube.com/watch?v=yZ-K7nCVnBI&playnext_from=TL&videos=osPknwzXEas&feature=sub',
	'http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I',
	'http://www.youtube.com/user/SilkRoadTheatre#p/a/u/2/6dwqZw0j_jY',
	'http://youtu.be/6dwqZw0j_jY',
	'http://www.youtube.com/watch?v=6dwqZw0j_jY&feature=youtu.be',
	'http://youtu.be/xYhJQs9IZcg',
	'http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo?rel=0',
	'http://www.youtube.com/watch?v=cKZDdG9FTKY&feature=channel',
	'http://www.youtube.com/watch?v=yZ-K7nCVnBI&playnext_from=TL&videos=osPknwzXEas&feature=sub',
	'http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I',
	'http://www.youtube.com/embed/nas1rJpm7wY?rel=0',
	'http://www.youtube.com/watch?v=peFZbP64dsU',
	'http://youtube.com/v/dQw4w9WgXcQ?feature=youtube_gdata_player',
	'http://youtube.com/?v=dQw4w9WgXcQ&feature=youtube_gdata_player',
	'http://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player',
	'http://youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player',
	'http://youtu.be/QBR70hD5PEM?feature=youtube_gdata_player',
	'//www.youtube-nocookie.com/embed/up_lNV-yoK4?rel=0',
	'http://youtube.com/watch?v=v6j-4CR0mZs',
];


var realURLs = [
	'https://www.youtube.com/watch?v=o8yiYCHMAlM',
	'https://www.youtube.com/embed/o8yiYCHMAlM',
	'https://www.youtube-nocookie.com/embed/o8yiYCHMAlM',
	'https://youtu.be/o8yiYCHMAlM',
];


var i, r;
var rx = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;


function test(){
	for( i = 0; i < urls.length; i++ ){
		r = urls[i].match( rx );
		console.log( r );
	}
}

test();