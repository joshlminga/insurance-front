export enum EINVOICES {
    MOTOR='Motor',
    MARINE='Marine',
    TRAVEL='Travel',
    MEDICAL='Medical'
}

export enum ECREDITTRANSACTIONS {
    MY_TRANSACTION='mine',
    ALL_TRANSACTION='all',
}

export enum EMOTORCERTIFICATES {
    ALL='all',
    ISSUED='issued',
    FAILED='failed',
}

export enum EFINANCE_INVOICE_TABS {
    MOTOR='motor',
    TRAVEL='travel',
    MARINE='marine',
}

export enum EFINANCE_RECEIPT_TABS {
    MOTOR='motor',
    TRAVEL='travel',
}

/** Finance ledger list tabs — maps to API `view=invoice|purchase` */
export enum EFINANCE_TRANSACTION_TABS {
    PER_INVOICE = 'invoice',
    PER_PURCHASE = 'purchase',
}

/** DMVIC Policies tabs — maps to API `stock_status=in_stock|out_of_stock` */
export enum EDMVIC_POLICIES_TABS {
    IN_STOCK = 'in_stock',
    OUT_OF_STOCK = 'out_of_stock',
}
