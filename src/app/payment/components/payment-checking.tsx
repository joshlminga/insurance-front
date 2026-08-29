type PaymentCheckingProps = {
    message: string
}

/** Short waiting screen while a return page checks the gateway response. */
export const PaymentChecking = ({ message }: PaymentCheckingProps) => {
    return (
        <div className="flex min-h-[60vh] w-full items-center justify-center p-6 mt-8 sm:mt-12">
            <div className="mx-auto flex max-w-xl w-full flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C20C0C] border-t-transparent" />
                <p className="text-sm font-medium text-gray-700">{message}</p>
            </div>
        </div>
    )
}
