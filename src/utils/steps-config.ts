
import { MarineCustomerVerificationDetails } from "@/app/marine/steppers/capture-details";
import { MarineDetailsPage } from "@/app/marine/steppers/marine-details";
import OTPVerificationMarinePage from "@/app/marine/steppers/otp-verification";
import { MarineQuotationsPage } from "@/app/marine/steppers/quotations";
import { MarineExportPage } from "@/app/marine/steppers/tabs/export-tab";
import { MarineImportPage } from "@/app/marine/steppers/tabs/import-tab";
import { CustomerVerificationDetails } from "@/app/motor/steppers/capture-details";
import { InvoicePayment } from "@/app/motor/steppers/invoice-payment";
import { KycInfo } from "@/app/motor/steppers/kyc-info";
import OTPVerificationPage from "@/app/motor/steppers/otp-verification";
import { PaymentOptions } from "@/app/motor/steppers/payment-options";
import { CardsTabPage } from "@/app/motor/steppers/payment-tabs/card";
import { MpesaPageTab } from "@/app/motor/steppers/payment-tabs/mpesa";
import { PesapalTabPage } from "@/app/motor/steppers/payment-tabs/pesapal";
import { QuotationsPage } from "@/app/motor/steppers/quotations";
import { SuccessPurchase } from "@/app/motor/steppers/success-purchase";
import { MotorCommercialPage } from "@/app/motor/steppers/tabs/motor-commercial";
import { MotorPrivatePage } from "@/app/motor/steppers/tabs/motor-private";
import { MotorPsvPage } from "@/app/motor/steppers/tabs/motor-psv";
import { VehicleDetailsPage } from "@/app/motor/steppers/vehicle-details";
import { ArrowUpToLine, Car, Download, Truck, Van } from "lucide-react";

export const ESTEPS = [
    {
        title: "",
        content: CustomerVerificationDetails,
    },
    {
        title: "",
        content: OTPVerificationPage,
    },
    {
        title: "",
        content: VehicleDetailsPage,
    },
    {
        title: "",
        content: QuotationsPage,
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
        iconSize: 18,
        component: MotorPrivatePage,
    },
    {
        value: "commercial",
        label: "Commercial",
        icon: Truck,
        iconSize: 20,
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
        image:'/card.png',
        // icon: CreditCard,
        // iconSize: 20,
        component: CardsTabPage,
    },
    {
        value: "pesapal",
        // label: "PesaPal",
        // icon: Van,
        // iconSize: 16,
        image:'/pesapal.png',
        component: PesapalTabPage,
    },
]