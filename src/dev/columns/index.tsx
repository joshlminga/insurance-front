/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TActionColumnGenProps } from "@/types/types";
import { ColumnDef } from "@tanstack/table-core";
import { ChevronDownCircle } from "lucide-react";
import React from "react";
import { Button, ReusableDropDownComponent } from "../core";

export const ActionColumn = <T,>({
	ActionsHandlerMapping,
	layout = 'dropdown',
}: TActionColumnGenProps<T>): ColumnDef<T> => {
	return {
		enableHiding: false,
		header: 'Action(s)',
		accessorKey: 'id',
		cell: ({ row }) => {
			const data: T = row.original;
			const availableActions = ActionsHandlerMapping.filter(
                ({ conditional }) => (conditional ? conditional(data) : true)
            );
			if (layout === 'horizontal') {
                return (
                    <div className="flex items-center gap-2">
                        {availableActions.map(({ label, onSelect, icon: Icon }, index) => (
                            <Button
							variant="ghost"
                                key={index}
                                onClick={() => onSelect(data)}
                                className="text-[#BF162E] hover:text-[#BF162E]/80 bg-none "
                                title={label}
                                aria-label={label}>
                                {Icon ? <Icon className="h-5 w-5" /> : <span>{label}</span>}
                            </Button>
                        ))}
                    </div>
                );
            }
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
