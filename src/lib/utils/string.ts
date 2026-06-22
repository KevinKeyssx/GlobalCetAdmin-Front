export function stripHtml( html? : string ) : string {
	if ( !html ) {
		return '';
	}

	return html
		.replace( /<[^>]*>/g, '' )
		.replace( /&nbsp;/g, ' ' )
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' )
		.replace( /&amp;/g, '&' )
		.replace( /&quot;/g, '"' )
		.replace( /&#39;/g, "'" );
}

export function formatRut( value : string ) : string {
	const clean = value.replace( /[^0-9kK]/g, '' ).toUpperCase();
	if ( !clean ) {
		return '';
	}

	const body = clean.slice( 0, -1 );
	const dv   = clean.slice( -1 );

	if ( !body ) {
		return dv;
	}

	let formattedBody = '';
	let count         = 0;

	for ( let i = body.length - 1; i >= 0; i-- ) {
		formattedBody = body[ i ] + formattedBody;
		count++;
		if ( count === 3 && i > 0 ) {
			formattedBody = '.' + formattedBody;
			count         = 0;
		}
	}

	return `${ formattedBody }-${ dv }`;
}

export function validateRut( rut : string ) : boolean {
	const clean = rut.replace( /[^0-9kK]/g, '' ).toUpperCase();
	if ( clean.length < 8 ) {
		return false;
	}

	const body = clean.slice( 0, -1 );
	const dv   = clean.slice( -1 );

	let sum        = 0;
	let multiplier = 2;

	for ( let i = body.length - 1; i >= 0; i-- ) {
		sum        += parseInt( body[ i ] ) * multiplier;
		multiplier = multiplier === 7 ? 2 : multiplier + 1;
	}

	const expectedDv = 11 - ( sum % 11 );
	let expectedDvChar = '';

	if ( expectedDv === 11 ) {
		expectedDvChar = '0';
	} else if ( expectedDv === 10 ) {
		expectedDvChar = 'K';
	} else {
		expectedDvChar = expectedDv.toString();
	}

	return dv === expectedDvChar;
}

export function validateEmail( email : string ) : boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test( email );
}
