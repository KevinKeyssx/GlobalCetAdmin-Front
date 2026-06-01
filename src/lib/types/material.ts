export interface ChemicalResistance {
	acid     : string;
	alkaline : string;
}

export interface Material {
	id                 : string;
	name               : string;
	slug               : string;
	autoclavable       : boolean;
	maxTemperature     : number;
	chemicalResistance : ChemicalResistance;
}
