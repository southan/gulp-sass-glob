var path    = require( "path" );
var through = require( "through2" );
var glob    = require( "glob" );

module.exports = function () {
	return through.obj( function ( theFile, env, cb ) {
		var content = theFile.contents.toString( "utf-8" );
		var dirname = path.dirname( theFile.path );
		var replace;

		var regex = /@import\s+([^;\*]+\*[^;]+);/g;
		var found;
		var items;
		var paths;
		var files;
		var item;
		var file;
		var i;
		var j;
		var k;
		var l;

		while ( ( found = regex.exec( content ) ) !== null ) {
			items = found[1].split( "," );
			paths = [];

			for ( i = 0, j = items.length; i < j; ++i ) {
				item = items[ i ].trim().slice( 1, -1 ); // Path will be quoted

				if ( item.indexOf( "*" ) !== -1 ) {
					files = glob.sync( path.join( dirname, item ) );

					for ( k = 0, l = files.length; k < l; ++k ) {
						file = files[ k ];
						if ( file !== theFile.path && path.extname( file ) === ".scss" )
							paths.push( "'" + path.relative( dirname, file ).replace( "\\", "/" ) + "'" );
					}
				} else {
					paths.push( "'" + item + "'" );
				}
			}

			if ( ! replace )
				replace = content;

			replace = replace.replace( found[0], paths.length ? "@import " + paths.join( "," ) + ";" : "" );
		}

		if ( replace )
			theFile.contents = new Buffer( replace );

		cb( null, theFile );
	});
};
