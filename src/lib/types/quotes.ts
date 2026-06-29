export type QuoteStatus = 'PENDING' | 'IN_REVIEW' | 'SENT_TO_CLIENT' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export const QUOTE_STATUS_MAP : Record< QuoteStatus, string > = {
	PENDING        : 'Pendiente',
	IN_REVIEW      : 'En Revisión',
	SENT_TO_CLIENT : 'Enviada al Cliente',
	ACCEPTED       : 'Aceptada',
	REJECTED       : 'Rechazada',
	COMPLETED      : 'Completada',
	CANCELLED      : 'Cancelada',
};

export interface QuoteClientData {
	rut         : string;
	email       : string;
	address     : string;
	companyName : string;
	contactName : string;
	phoneNumber : string;
}

export interface QuoteResponseItem {
	id            : string;
	name          : string;
	type          : 'product' | 'kit' | 'mobileLab';
	quantity      : number;
	priceAtMoment : number;
}

export interface QuotePayloadItem {
	id       : string;
	quantity : number;
}

export interface QuotePayloadItems {
	products   : QuotePayloadItem[];
	kits       : QuotePayloadItem[];
	mobileLabs : QuotePayloadItem[];
}

export interface Quote {
	id          : string;
	quoteNumber : string;
	clientData  : QuoteClientData;
	items       : QuoteResponseItem[];
	status      : QuoteStatus;
	adminNotes  : string | null;
	createdAt   : string;
	updatedAt   : string;
}

export interface QuoteSavePayload {
	clientData : QuoteClientData;
	items      : QuotePayloadItems;
	adminNotes : string | null;
}

export interface QuoteStockInfo {
	id             : string;
	sku            : string;
	name           : string;
	currentStock   : number;
	minStock       : number;
	maxStock       : number;
	projectedStock : number;
	type           : 'product' | 'kit' | 'mobileLab';
}

