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
