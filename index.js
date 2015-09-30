"use strict";

var
	path    = require( "path" ),
	fs      = require( "fs" ),
	through = require( "through2" ),
	glob    = require( "glob" );

module.exports = function () {
	return through.obj(function ( file, env, cb ) {
		var contents = file.contents.toString( "utf-8" ),
			replaced = contents,
			dirname  = path.dirname( file.path ),
			imports  = /@import\s+([\s\S]+?);/g,
			items    = /["']([^\*"']+\*[^"']*)["']/g,

			importsResult,
			itemsResult,
			replace,
			files;

		while ( ( importsResult = imports.exec( contents ) ) !== null ) {
			while ( ( itemsResult = items.exec( importsResult[1] ) ) !== null ) {
				replace = [];

				files = glob.sync( path.join( dirname, itemsResult[1] ) );
				files.forEach(function ( filename ) {
					replace.push( path.relative( dirname, filename ) );
				});

				replaced = replaced.replace( itemsResult[0], '"' + replace.join( '","' ) + '"' );
			}
		}

		if ( replaced !== contents )
			file.contents = new Buffer( replaced );

		cb( null, file );
	});
};
