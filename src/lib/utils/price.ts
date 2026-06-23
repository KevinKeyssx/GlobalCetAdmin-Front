export function formatCLP( price: number | null | undefined ): string {
	if ( price === null || price === undefined || price === 0 ) {
		return '';
	}

	const formatted = Math.round( price )
		.toString()
		.replace( /\B(?=(\d{3})+(?!\d))/g, '.' );

	return `$ ${ formatted }`;
}
