/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TActionColumnGenProps } from "@/types/types";
import { ColumnDef } from "@tanstack/table-core";
import { Check, ChevronDownCircle, Copy } from "lucide-react";
import React, { useState } from "react";
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

export const CopyCell = ({ value }: { value: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };
    return (
        <div className="flex items-center gap-2 group">
            <span className="font-mono">{value}</span>
            <button
                onClick={handleCopy}
                className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 opacity-80 group-hover:opacity-100 focus:opacity-100"
                title="Copy"
                aria-label="Copy">
                {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </button>
        </div>
    );
};