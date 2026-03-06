
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
import { MpesaPageTab } from "@/app/customer/motor/steppers/payment-tabs/mpesa";
import { PesapalTabPage } from "@/app/customer/motor/steppers/payment-tabs/pesapal";
import { QuotationsPage } from "@/app/customer/motor/steppers/quotations";
import { SuccessPurchase } from "@/app/customer/motor/steppers/success-purchase";
import { MotorCommercialPage } from "@/app/customer/motor/steppers/tabs/motor-commercial";
import { MotorPrivatePage } from "@/app/customer/motor/steppers/tabs/motor-private";
import { MotorPsvPage } from "@/app/customer/motor/steppers/tabs/motor-psv";
import { VehicleDetailsPage } from "@/app/customer/motor/steppers/vehicle-details";
import { ArrowUpToLine, Car, Download, Truck, Van } from "lucide-react";

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
    // Skip CustomerVerification + OTP steps for authenticated users
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

export const EMOTORTABS = [
    {
        value: "private",
        label: "Private",
        icon: Car,
        iconSize: 10,
        component: MotorPrivatePage,
    },
    {
        value: "commercial",
        label: "Commercial",
        icon: Truck,
        iconSize: 10,
        component: MotorCommercialPage,
    },
    {
        value: "psv",
        label: "PSV",
        icon: Van,
        iconSize: 16,
        component: MotorPsvPage,
    },
]

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
        // label: "Mpesa",
        image: '/mpesa.png',
        // iconSize: 18,
        component: MpesaPageTab,
    },
    {
        value: "card",
        // label: "Card",
        image: '/card.png',
        // icon: CreditCard,
        // iconSize: 20,
        component: CardsTabPage,
    },
    {
        value: "pesapal",
        // label: "PesaPal",
        // icon: Van,
        // iconSize: 16,
        image: '/pesapal.png',
        component: PesapalTabPage,
    },
]