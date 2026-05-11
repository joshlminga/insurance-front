/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Table as TableType,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    ArrowRightIcon,
    ListFilter,
    SearchIcon,
    XIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useRef } from 'react';
import {
    CustomLoader,
    TableComponentHeadings,
    TReusablePagination
} from './core';
import {
    StatusPillProps,
    TQueryFieldProps,
    TSearchToolProps,
    TTableReusableComponent
} from '@/types/types';


export const DataTable = ({
    showPagination,
    onPageChange,
    pageCount,
    isLoading,
    // pageSize,
    onClick,
    isError,
    table,
    page,
}: { table: TableType<any> } & Pick<
    TTableReusableComponent,
    | 'showPagination'
    | 'onPageChange'
    | 'pageCount'
    | 'pageSize'
    | 'isLoading'
    | 'onClick'
    | 'isError'
> &
    Required<Pick<TTableReusableComponent, 'page'>>) => {
    return (
        <div className='w-full shadow rounded-xl border overflow-clip'>
            <Table className='px-6 py-2'>
                <TableHeader className='select-none rounded-xl border'>
                    {table.getHeaderGroups().map((headerGroup, index) => (
                        <TableRow
                            key={`table-R-${index}`}
                            className='h-11 overflow-auto font-medium text-[12px] leading-5'>
                            {headerGroup.headers.map((header, index) => (
                                <TableHead
                                    key={`tableH-${index}`}
                                    className={cn('text-left')}
                                    align={'left'}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody className='px-6 py-5 select-none'>
                    {isLoading || isError ? (
                        <TableRow>
                            <TableCell
                                colSpan={table.getAllColumns().length}
                                className='h-24 text-center'>
                                <CustomLoader
                                    isError={!!isError}
                                    title={
                                        isError ? 'Error fetching data.' : 'Fetching data...'
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, index) => (
                                    <TableRow
                                        key={`tableBody-${index}`}
                                        {...{
                                            ...(onClick
                                                ? {
                                                    onClick: () => onClick(row),
                                                }
                                                : {}),
                                        }}
                                        className='h-14 overflow-auto pb-px border-b border-table-border-color px-6 py-4'
                                        data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell, index) => (
                                            <TableCell key={`cell-index-${index}`} align={'left'}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        className='h-24 text-center'>
                                        No data to display.
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    )}
                </TableBody>
            </Table>
            {
                showPagination && table.getRowModel().rows?.length > 0 ? (
                    <div className='flex gap-5 justify-between p-5'>
                        <Button
                            className='flex gap-2 items-center border'
                            {...{
                                onClick: () => onPageChange(page > 1 ? page - 1 : page),
                                ...(page <= 1 ? { disabled: true } : {}),
                                variant: 'outline',
                            }}>
                            <ArrowRightIcon
                                {...{
                                    svgElementClassName: 'stroke-black hover:stroke-black/2',
                                    className: 'w-5 h-5 rotate-180',
                                }}
                            />
                            <p className='text-sm font-semibold leading-5 text-filter-stroke-color'>
                                Previous
                            </p>
                        </Button>

                        <TReusablePagination {...{ onPageChange, page, pageCount }} />

                        <Button
                            className='flex gap-2 items-center'
                            {...{
                                onClick: () => onPageChange(page < pageCount ? page + 1 : page),
                                variant: 'outline',
                                ...(page >= pageCount ? { disabled: true } : {}),
                            }}>
                            <p className='text-sm font-semibold leading-5 text-filter-stroke-color'>
                                Next
                            </p>
                            <ArrowRightIcon
                                {...{
                                    svgElementClassName: 'stroke-black hover:stroke-black/2',
                                    className: 'w-5 h-5',
                                }}
                            />
                        </Button>
                    </div>
                ) : null
            }
        </div >
    );
};

export const CustomBaseTable = <T,>({
    onRowSelectionChange,
    showPagination = false,
    OtherToolsProps,
    onPageChange,
    rowSelection,
    // setPageSize,
    OtherTools,
    pageCount,
    isLoading,
    pageSize,
    columns,
    isError,
    onClick,
    page = 1,
    data,
    title,
}: TTableReusableComponent<T>) => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        getFilteredRowModel: getFilteredRowModel(),

        getCoreRowModel: getCoreRowModel(),
        ...(onRowSelectionChange
            ? {
                onRowSelectionChange,
            }
            : {}),
        columns,
        data,
        state: {
            ...(rowSelection ? { rowSelection } : {}),
        },
    });
    return (
        <div className='md:col-span-6'>
            {(title || OtherTools) && (
                <TableComponentHeadings>
                    <div className='flex justify-between items-center w-full gap-6 flex-wrap'>
                        {title && (
                            <div className='leading-7 text-label-text text-md md:text-md tracking-[-.5%] capitalize  py-3 font-semibold'>
                                {title}
                            </div>
                        )}
                        <div className='flex justify-end gap-2 items-center'>
                            {OtherTools && (
                                <div className='w-fit'>
                                    <OtherTools
                                        {...{
                                            ...(OtherToolsProps ?? {}),
                                            onChange:
                                                OtherToolsProps?.onChange ?? ((data: any) => console.log(data)),
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </TableComponentHeadings>
            )}
            <DataTable
                {...{
                    pagination: showPagination,
                    showPagination,
                    onPageChange,
                    pageCount,
                    isLoading,
                    pageSize,
                    isError,
                    onClick,
                    table,
                    page,
                }}
            />
        </div>
    );
};

export const StatusPill = ({ status, label }: StatusPillProps) => {
    const config: Record<string, string> = {
        active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        blacklisted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        P: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        R: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        U: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };

    return <span className={`px-2 py-1 rounded-full text-sm font-medium ${config[status] || ""}`}>{label}</span>;
};

export const SearchTools = ({
    className = 'border-primary',
    placeholder = 'Search',
    includeFilter = false,
    advancedHandler,
    onChange,
}: TSearchToolProps) => {
    return (
        <div className='flex gap-4 flex-wrap items-center select-none'>
            <ProductQueryField {...{ onChange, placeholder, className }} />
            {includeFilter && <ReusableFilterButton {...{ advancedHandler }} />}
        </div>
    );
};

export const ProductQueryField = ({
    className = 'bg-secondary border-primary',
    placeholder,
    onChange,
}: TQueryFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className='relative'>
            <Input
                className={cn(
                    'rounded-lg w-55 h-8 pl-10 outline-accent border border-accent focus:border-primary focus:outline-primary',
                    className
                )}
                {...{
                    onChange: (e) => onChange(e.currentTarget.value.trim()),
                    ref: inputRef,
                    placeholder,
                    type: 'text',
                }}
            />
            <SearchIcon
                className='absolute h-4 w-4 left-4 top-[calc(calc(100%-1rem)/2)] cursor-pointer stroke-gray-400'
                {...{
                    onClick: () => inputRef.current?.focus(),
                }}
            />
        </div>
    );
};

export const ReusableFilterButton = ({
    advancedHandler,
}: Partial<Pick<TSearchToolProps, 'advancedHandler'>>) => {
    return (
        <div className='border border-neutral-300 bg-neutral-100 py-1 px-3 flex gap-2 items-center rounded-xl w-28 select-none cursor-pointer h-8'>
            <ListFilter className='size-6' />
            <p className='font-medium text-sm leading-4 text-gray-600'>Filter</p>
            <Separator
                className='w-4 h-4 my-4 bg-gray-300'
                {...{
                    orientation: 'vertical',
                }}
            />
            <XIcon className='size-6' />
        </div>
    );
};