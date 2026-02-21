/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { Plus } from 'lucide-react'
import { CreateProductModal } from './modals/create'
import { useCustomDialogContextFactory, useDebounce } from '@/hooks'
import { CustomDialogComponent } from '@/dev/core'
import { CustomBaseTable, SearchTools } from '@/dev/table'
import { SingleActionsHandler, TFilterOptions, TPaginationFilters } from '@/types/types'
import { FILTEROPTIONS, ReusableReducer } from '@/utils/constatnts'
import { useReducer } from 'react'
import { ActionColumn } from '@/dev/columns'

export const MotorProductPage = () => {

    const [filter, optionsDispatcher] = useReducer(
        ReusableReducer<TPaginationFilters & TFilterOptions>,
        { ...FILTEROPTIONS, page: 1, pageSize: 25 }
    );
    const optionsDispatcherDebounce = useDebounce({
        debounceCallback: optionsDispatcher,
    });

    const { handleDialogContextSwitch, dialogContent, dialogOpen } =
        useCustomDialogContextFactory<{
            refetch?: () => Promise<any>;
            data?: any;
        }>();

    const ActionsHandlerMapping: SingleActionsHandler<any>[] = [];
    
    return (
        <div>
            <PageHeader
                title="Motor Product"
                description="Manage motor products, their details, and associated products"
                actions={[
                    {
                        icon: Plus,
                        label: 'Add Motor Product',
                        variant: 'default',
                        onClick: () => {
                            handleDialogContextSwitch({
                                // componentProps: { refetch },
                                Component: CreateProductModal,
                            })
                        },
                    },
                ]}
            />

            <div className='w-full'>
                <CustomBaseTable
                    {...{
                        onPageChange: (page) =>
                            optionsDispatcher({
                                payload: { page },
                                type: 'page',
                            }),
                        OtherToolsProps: {
                            onChange: (data: any) =>
                                optionsDispatcherDebounce({
                                    payload: { term: data },
                                    type: 'term',
                                }),
                            placeholder: 'Search',
                            includeFilter: true,
                        },
                        columns: [
                            //   ...OrganizationsColumns,
                            ActionColumn({ ActionsHandlerMapping }),
                        ],
                        OtherTools: SearchTools,
                        data: [],
                        pageCount: 1,
                        title: 'Motor Products',
                        showPagination: true,
                        setPageSize: (pageSize) =>
                            optionsDispatcher({
                                payload: { pageSize },
                                type: 'pageSize',
                            }),
                        pageSize: filter.pageSize ?? 10,
                        page: filter?.page ?? 1,
                        // isLoading: isLoading,
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
