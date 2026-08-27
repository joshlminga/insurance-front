/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    useReactTable,
    type Table as TableType
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
import type {
    TQueryFieldProps,
    TSearchToolProps,
    TTableReusableComponent
} from '@/types/types';

export const DataTable = ({
    title,
    OtherTools,
    OtherToolsProps,
    showPagination,
    onPageChange = () => undefined,
    pageCount = 1,
    isLoading,
    pageSize,
    onClick,
    isError,
    table,
    page = 1,
}: { table: TableType<any> } & Pick<
    TTableReusableComponent,
    | 'title'
    | 'OtherTools'
    | 'OtherToolsProps'
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
        <div className='w-full overflow-hidden rounded-xl shadow-none border bg-white hover:bg-white/80 px-2 dark:bg-white/10 dark:hover:bg-white/30'>
            {(title || OtherTools) && (
                <TableComponentHeadings>
                    <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
                        {title && (
                            <div className='py-1 text-md font-semibold leading-7 tracking-[-.5%] text-label-text capitalize md:text-md'>
                                {title}
                            </div>
                        )}
                        <div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end'>
                            {OtherTools && (
                                <div className='w-full sm:w-auto'>
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
            <Table className='min-w-180 px-3 py-2 sm:px-4 md:min-w-full md:px-6'>
                <TableHeader className='select-none rounded-xl'>
                    {table.getHeaderGroups().map((headerGroup, index) => (
                        <TableRow
                            key={`table-R-${index}`}
                            className='h-11 overflow-auto font-medium text-[12px] leading-5'>
                            <TableHead
                                className="w-14 px-2 text-left font-bold"
                                align="left">
                                #
                            </TableHead>
                            {headerGroup.headers.map((header, index) => (
                                <TableHead
                                    key={`tableH-${index}`}
                                    className={cn('text-left px-2 font-bold')}
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
                                className='h-24 justify-center text-center py-5'>
                                <CustomLoader
                                    {...{
                                        ...(isError ? { title: 'Error fetching data.' } : {}),
                                    }}
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
                                        className='h-14 overflow-auto pb-1 border-b-1px border-table-border-color px-6 py-4'
                                        data-state={row.getIsSelected() && 'selected'}>

                                        <TableCell
                                            className="w-14 px-2 font-medium text-gray-500"
                                            align="left"
                                        >
                                            {(page - 1) * pageSize + index + 1}
                                        </TableCell>

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
            {showPagination && table.getRowModel().rows?.length > 0 ? (
                <div className='flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-4 md:p-5'>
                    <Button
                        className='flex w-full items-center justify-center gap-2 sm:w-auto'
                        {...{
                            onClick: () => onPageChange(page > 1 ? page - 1 : page),
                            ...(page <= 1 ? { disabled: true } : {}),
                            variant: 'outline',
                        }}>
                        <ArrowRightIcon className='h-5 w-5 rotate-180 stroke-black' />
                        <p className='text-sm font-semibold leading-5 text-filter-stroke-color'>
                            Previous
                        </p>
                    </Button>

                    <TReusablePagination {...{ onPageChange, page, pageCount }} />

                    <Button
                        className='flex w-full items-center justify-center gap-2 sm:w-auto'
                        {...{
                            onClick: () => onPageChange(page < pageCount ? page + 1 : page),
                            variant: 'outline',
                            ...(page >= pageCount ? { disabled: true } : {}),
                        }}>
                        <p className='text-sm font-semibold leading-5 text-filter-stroke-color'>
                            Next
                        </p>
                        <ArrowRightIcon className='h-5 w-5 stroke-black' />
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export const CustomBaseTable = <T,>({
    onRowSelectionChange,
    showPagination = false,
    OtherToolsProps,
    onPageChange,
    rowSelection,
    OtherTools,
    pageCount,
    isLoading,
    pageSize = 10,
    columns,
    isError,
    onClick,
    page = 1,
    data,
    title,

    // table expansion
    expanded,
    onExpandedChange,
    getSubRows,
}: TTableReusableComponent<T> & {
    expanded?: Record<string, boolean>;
    onExpandedChange?: any;
    getSubRows?: (row: T) => T[] | undefined;
}) => {
    const table = useReactTable({
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        // ...(onRowSelectionChange
        //     ? {
        //         onRowSelectionChange,
        //     }
        //     : {}),
        ...(onRowSelectionChange ? { onRowSelectionChange } : {}),
        columns,
        data,
        ...(getSubRows ? { getSubRows } : {}),
        ...(onExpandedChange ? { onExpandedChange } : {}),
        state: {
            ...(rowSelection ? { rowSelection } : {}),
            ...(expanded ? { expanded } : {}),
        },
    });
    return (
        <div className='md:col-span-6 min-w-0'>
            <DataTable
                {...{
                    title,
                    OtherTools,
                    OtherToolsProps,
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

export const SearchTools = ({
    className = 'border-brand',
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
                    'rounded-lg w-55 h-8 pl-10 outline-accent border border-accent focus:border-primary focus:outline-primary dark:text-white',
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
                className='absolute h-4 w-4 left-4 top-[calc(calc(100%-1rem)/2)] cursor-pointer stroke-gray-400 '
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
        <div className='border border-gray-300 bg-gray-100 dark:bg-white/10 py-1 px-3 flex gap-2 items-center rounded-xl w-28 select-none cursor-pointer h-8'>
            <ListFilter className='size-6' />
            <p className='font-medium text-sm leading-4 text-gray-600 dark:text-white'>Filter</p>
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