/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared';
import {
    CustomDialogComponent,
    ReusableTabComponent
} from '@/dev/core';
import { InvoiceTabs } from '@/dev/tabs';
import {
    useCustomDialogContextFactory,
} from '@/hooks';
import { EINVOICES } from '@/types/enums';

const InvoicesPage = () => {
    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();
    return (
        <div>
            <PageHeader
                title="Invoices"
                description="Manage Invoices (Motor, Marine etc.)"
            />
            <div className='w-full'>
                <ReusableTabComponent
                    tabs={InvoiceTabs}
                    defaultTab={EINVOICES.MOTOR}
                    tabProps={{
                        product: EINVOICES.MOTOR,
                    }}
                />
            </div>
            <CustomDialogComponent
                {...{ handleDialogContextSwitch, dialogOpen }}
                className='sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6'>
                {dialogContent?.Component && (
                    <dialogContent.Component
                        {...{
                            componentProps: dialogContent.componentProps,
                            handleDialogContextSwitch,
                        }}
                    />
                )}
            </CustomDialogComponent>
        </div>
    )
}

export default InvoicesPage;