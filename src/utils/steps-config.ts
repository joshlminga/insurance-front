
import { CustomerVerificationDetails } from "@/app/motor/steppers/capture-details";
import { InvoicePayment } from "@/app/motor/steppers/invoice-payment";
import { KycInfo } from "@/app/motor/steppers/kyc-info";
import OTPVerificationPage from "@/app/motor/steppers/otp-verification";
import { PaymentOptions } from "@/app/motor/steppers/payment-options";
import { QuotationsPage } from "@/app/motor/steppers/quotations";
import { MotorCommercialPage } from "@/app/motor/steppers/tabs/motor-commercial";
import { MotorPrivatePage } from "@/app/motor/steppers/tabs/motor-private";
import { MotorPsvPage } from "@/app/motor/steppers/tabs/motor-psv";
import { VehicleDetailsPage } from "@/app/motor/steppers/vehicle-details";
import { Car, Truck, Van } from "lucide-react";

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

export const EPAYMENTTABS = [
    {
        value: "mpesa",
        label: "Mpesa",
        icon: Car,
        iconSize: 18,
        component: MotorPrivatePage,
    },
    {
        value: "card",
        label: "Card",
        icon: Truck,
        iconSize: 20,
        component: MotorCommercialPage,
    },
    {
        value: "pesapal",
        label: "PesaPal",
        icon: Van,
        iconSize: 16,
        component: MotorPsvPage,
    },
]