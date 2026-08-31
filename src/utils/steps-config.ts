/* eslint-disable @typescript-eslint/no-unused-vars */

import { MarineCustomerVerificationDetails } from "@/app/customer/marine/steppers/capture-details";
import { MarineDetailsPage } from "@/app/customer/marine/steppers/marine-details";
import OTPVerificationMarinePage from "@/app/customer/marine/steppers/otp-verification";
import { MarineQuotationsPage } from "@/app/customer/marine/steppers/quotations";
import { MarineExportPage } from "@/app/customer/marine/steppers/tabs/export-tab";
import { MarineImportPage } from "@/app/customer/marine/steppers/tabs/import-tab";
import { CustomerVerificationDetails } from "@/app/customer/motor/steppers/capture-details";
import { InvoicePayment } from "@/app/customer/motor/steppers/invoice-payment";
import { KycInfo } from "@/app/customer/motor/steppers/kyc-info";
import OTPVerificationPage from "@/app/customer/motor/steppers/otp-verification";
import { PaymentOptions } from "@/app/customer/motor/steppers/payment-options";
import { CardsTabPage } from "@/app/customer/motor/steppers/payment-tabs/card";
import { CashTabPage } from "@/app/customer/motor/steppers/payment-tabs/cash";
import { CreditTabPage } from "@/app/customer/motor/steppers/payment-tabs/credit";
import { MpesaPageTab } from "@/app/customer/motor/steppers/payment-tabs/mpesa";
import { QuotationsPage } from "@/app/customer/motor/steppers/quotations";
import { SuccessPurchase } from "@/app/customer/motor/steppers/success-purchase";
import { VehicleDetailsPage } from "@/app/customer/motor/steppers/vehicle-details";
import {  CustomerVerificationPage } from "@/app/customer/travel/steppers/customer-details";
import { TravellerDestinationDetailsPage } from "@/app/customer/travel/steppers/destination-details";
import { TravelKycDetailsPage } from "@/app/customer/travel/steppers/kyc-details";
import OTPTravelVerificationPage from "@/app/customer/travel/steppers/otp-verification";
import { TravelQuotationsPage } from "@/app/customer/travel/steppers/quotations";
import { TravelInvoicesPage } from "@/app/customer/travel/steppers/travel-invoices";
import { TravelPaymentOptionsPage } from "@/app/customer/travel/steppers/travel-payment-options";
import { TravellerDetailsPage } from "@/app/customer/travel/steppers/traveller-details";
import { ArrowUpToLine, Download } from "lucide-react";

export const getMotorSteps = (isAuthenticated: boolean) => {
    const allSteps = [
        {
            disabled: true,
            title: "",
            content: CustomerVerificationDetails,
        },
        {
            disabled: true,
            title: "",
            content: OTPVerificationPage,
        },
        {
            disabled: true,
            title: "",
            content: VehicleDetailsPage,
        },
        {
            disabled: false,
            title: "",
            content: QuotationsPage,
        },
        {
            disabled: false,
            title: "",
            content: KycInfo,
        },
        {
            disabled: false,
            title: "",
            content: InvoicePayment,
        },
        {
            disabled: false,
            title: "",
            content: PaymentOptions,
        },
        {
            disabled: false,
            title: "",
            content: SuccessPurchase,
        },
    ]
    return isAuthenticated ? allSteps.slice(2) : allSteps
}


export const EMARINESTEPS = [
    {
        title: "",
        content: MarineCustomerVerificationDetails,
    },
    {
        title: "",
        content: OTPVerificationMarinePage,
    },
    {
        title: "",
        content: MarineDetailsPage,
    },
    {
        title: "",
        content: MarineQuotationsPage,
    },
    {
        title: "",
        content: KycInfo,
    },
    {
        title: "",
        content: InvoicePayment,
    },
    {
        title: "",
        content: PaymentOptions,
    },
    {
        title: "",
        content: SuccessPurchase,
    },
]


export const getTravelSteps = (isAuthenticated: boolean) => {
    const allSteps = [
        {
            disabled: true,
            title: "",
            content: CustomerVerificationPage,
        },
        {
            disabled: true,
            title: "",
            content: OTPTravelVerificationPage,
        },
        {
            disabled: true,
            title: "",
            content: TravellerDetailsPage,
        },
        {
            disabled: false,
            title: "",
            content: TravellerDestinationDetailsPage,
        },
        {
            disabled: false,
            title: "",
            content: TravelQuotationsPage,
        },
        {
            disabled: false,
            title: "",
            content: TravelKycDetailsPage,
        },
        {
            disabled: false,
            title: "",
            content: TravelInvoicesPage,
        },
        {
            disabled: false,
            title: "",
            content: TravelPaymentOptionsPage,
        },
        {
            disabled: false,
            title: "",
            content: SuccessPurchase,
        },
    ]
    return allSteps
    // return isAuthenticated ? allSteps.slice(2) : allSteps
}

export const EMARINETABS = [
    {
        value: "import",
        label: "Imports",
        icon: Download,
        iconSize: 20,
        component: MarineImportPage,
    },
    {
        value: "export",
        label: "Exports",
        icon: ArrowUpToLine,
        iconSize: 20,
        component: MarineExportPage,
    },
]

export const EPAYMENTTABS = [
    {
        value: "mpesa",
        image: '/mpesa.png',
        component: MpesaPageTab,
    },
    {
        value: "card",
        image: '/visamastercard.png',
        component: CardsTabPage,
    },
    // PayPal hidden for now — restore entry + PaypalTabPage import to re-enable
    {
        value: "credit",
        image: '/paycredit.png',
        component: CreditTabPage,
    },
    {
        value: "cash",
        image: '/paycash.png',
        component: CashTabPage,
    },
]