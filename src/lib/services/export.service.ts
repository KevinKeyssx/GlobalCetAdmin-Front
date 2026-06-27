import * as XLSX from 'xlsx';
import { jsPDF }  from 'jspdf';
import autoTable  from 'jspdf-autotable';


export interface ExcelExportOptions< T > {
	filenamePrefix : string;
	headers        : string[];
	keys           : string[];
	data           : T[];
}

export interface PdfExportOptions< T > {
	filenamePrefix : string;
	title          : string;
	headers        : string[];
	keys           : string[];
	data           : T[];
}


function getNestedValue( obj : any, path : string ) : any {
	return path.split( '.' ).reduce( ( acc, part ) => acc && acc[ part ], obj );
}


function getFormattedTimestamp() : string {
	const now = new Date();
	const day = String( now.getDate() ).padStart( 2, '0' );
	const month = String( now.getMonth() + 1 ).padStart( 2, '0' );
	const year = now.getFullYear();
	const hours = String( now.getHours() ).padStart( 2, '0' );
	const minutes = String( now.getMinutes() ).padStart( 2, '0' );

	return `${ day }-${ month }-${ year }_${ hours }-${ minutes }`;
}


export function exportToExcel< T >( {
	filenamePrefix,
	headers,
	keys,
	data,
} : ExcelExportOptions< T > ) : void {
	const mappedData = data.map( ( item : any ) => {
		const row : any = {};

		headers.forEach( ( header, index ) => {
			const key = keys[ index ];
			let value = getNestedValue( item, key );

			if ( typeof value === 'boolean' ) {
				value = value ? 'Activo' : 'Inactivo';
			}

			if ( value instanceof Date ) {
				value = value.toLocaleDateString();
			} else if ( typeof value === 'string' && ( key.includes( 'createdAt' ) || key.includes( 'updatedAt' ) ) ) {
				value = new Date( value ).toLocaleDateString();
			}

			row[ header ] = value !== undefined && value !== null ? value : '';
		} );

		return row;
	} );

	const worksheet = XLSX.utils.json_to_sheet( mappedData );
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet( workbook, worksheet, 'Datos' );

	const timestamp = getFormattedTimestamp();
	const filename = `${ filenamePrefix }_${ timestamp }.xlsx`;

	XLSX.writeFile( workbook, filename );
}


export function exportToPdf< T >( {
	filenamePrefix,
	title,
	headers,
	keys,
	data,
} : PdfExportOptions< T > ) : void {
	const doc = new jsPDF( 'p', 'pt', 'a4' );

	doc.setFont( 'helvetica', 'bold' );
	doc.setFontSize( 18 );
	doc.setTextColor( 16, 185, 129 );
	doc.text( title, 40, 40 );

	doc.setFont( 'helvetica', 'normal' );
	doc.setFontSize( 10 );
	doc.setTextColor( 100, 116, 139 );
	doc.text( `Generado el: ${ new Date().toLocaleString() }`, 40, 55 );

	doc.setDrawColor( 16, 185, 129 );
	doc.setLineWidth( 1 );
	doc.line( 40, 65, 555, 65 );

	const rows = data.map( ( item : any ) => {
		return keys.map( ( key ) => {
			let value = getNestedValue( item, key );

			if ( typeof value === 'boolean' ) {
				return value ? 'Activo' : 'Inactivo';
			}

			if ( value instanceof Date ) {
				return value.toLocaleDateString();
			} else if ( typeof value === 'string' && ( key.includes( 'createdAt' ) || key.includes( 'updatedAt' ) ) ) {
				return new Date( value ).toLocaleDateString();
			}

			return value !== undefined && value !== null ? String( value ) : '';
		} );
	} );

	autoTable( doc, {
		startY    : 85,
		head      : [ headers ],
		body      : rows,
		theme     : 'striped',
		styles    : {
			font     : 'helvetica',
			fontSize : 8,
			cellPadding : 6,
		},
		headStyles : {
			fillColor : [ 16, 185, 129 ],
			textColor : [ 255, 255, 255 ],
			fontStyle : 'bold',
		},
		alternateRowStyles : {
			fillColor : [ 248, 250, 252 ],
		},
		margin    : { left : 40, right : 40 },
	} );

	const timestamp = getFormattedTimestamp();
	const filename = `${ filenamePrefix }_${ timestamp }.pdf`;

	doc.save( filename );
}


export function downloadBlob( blob : Blob, contentDisposition : string | null, defaultFilename : string ) : void {
	let filename = defaultFilename;

	if ( contentDisposition ) {
		const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
		const matches = filenameRegex.exec( contentDisposition );

		if ( matches !== null && matches[ 1 ] ) {
			filename = matches[ 1 ].replace( /['"]/g, '' );
		}
	}

	const downloadUrl = window.URL.createObjectURL( blob );
	const a = document.createElement( 'a' );

	a.href = downloadUrl;
	a.download = filename;
	document.body.appendChild( a );
	a.click();
	document.body.removeChild( a );
	window.URL.revokeObjectURL( downloadUrl );
}

