import type { Product } from '$lib/types/product';

// ─── Hardcoded Product Catalog ─────────────────────────────────────────────────

export const products: Product[] = [
	{
		id       : '1',
		name     : 'Vaso de Precipitado 250ml',
		category : 'Material de Vidrio',
		type     : 'Producto',
		specs    : { material: 'Borosilicato', grado: 'A' },
		image    : 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
		badge    : 'Más Vendido',
	},
	{
		id       : '2',
		name     : 'Kit de Titulación Básica',
		category : 'Kits de Laboratorio',
		type     : 'Kit',
		specs    : { piezas: 12, estuche: 'Incluido' },
		image    : 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=80',
	},
	{
		id       : '3',
		name     : 'Laboratorio Móvil CLM-2026',
		category : 'Sistemas Completos',
		type     : 'Laboratorio Móvil',
		specs    : { dimensiones: '90×80×50 cm', transporte: 'Ruedas industriales' },
		image    : 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
		badge    : 'Nuevo',
	},
	{
		id       : '4',
		name     : 'Erlenmeyer 500ml Graduado',
		category : 'Material de Vidrio',
		type     : 'Producto',
		specs    : { material: 'Borosilicato', grado: 'B', capacidad: '500 ml' },
		image    : 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80',
	},
	{
		id       : '5',
		name     : 'Ácido Clorhídrico 37% PA',
		category : 'Reactivos',
		type     : 'Producto',
		specs    : { pureza: '37%', material: 'HCl', grado: 'PA' },
		image    : 'https://images.unsplash.com/photo-1615486511262-c7ddb52a6b3c?w=400&q=80',
		badge    : 'Stock Limitado',
	},
	{
		id       : '6',
		name     : 'pH-Metro Digital Pro-500',
		category : 'Equipos de Medición',
		type     : 'Producto',
		specs    : { precision: '±0.01 pH', material: 'ABS/Acero Inox.' },
		image    : 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400&q=80',
	},
];

// ─── Derived Catalog Metadata ──────────────────────────────────────────────────

export const allCategories = [ ...new Set( products.map( ( p ) => p.category ) ) ];
export const allTypes      = [ ...new Set( products.map( ( p ) => p.type ) ) ];
