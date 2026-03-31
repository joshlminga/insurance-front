/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TActionColumnGenProps } from "@/types/types";
import { ColumnDef } from "@tanstack/table-core";
import { ChevronDownCircle } from "lucide-react";
import React from "react";
import { ReusableDropDownComponent } from "../core";

export const ActionColumn = <T,>({
	ActionsHandlerMapping,
}: TActionColumnGenProps<T>): ColumnDef<T> => {
	return {
		enableHiding: false,
		header: 'Action(s)',
		accessorKey: 'id',
		cell: ({ row }) => {
			const data: T = row.original;
			return (
				<React.Fragment>
					<ReusableDropDownComponent<T>
						{...{
							triggerEl: (
								<ChevronDownCircle className='h-6 w-6 opacity-85 select-none' />
							),
							ActionsHandlerMapping: ActionsHandlerMapping.filter(
								({ conditional }) => (conditional ? conditional(data) : true)
							).map(({ label, onSelect, value }) => ({
								onSelect: (_: any) => onSelect(data),
								value: data,
								label,
							})),

							includeSearch: true,
							selectedOption: '',
						}}
					/>
				</React.Fragment>
			);
		},
	};
};
