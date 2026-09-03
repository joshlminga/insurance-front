/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TActionColumnGenProps } from "@/types/types";
import { ColumnDef } from "@tanstack/table-core";
import { Check, Copy, Ellipsis, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Button, ReusableDropDownComponent } from "../core";

export const ActionColumn = <T,>({
	ActionsHandlerMapping,
	layout = 'dropdown',
	isRowLoading,
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
			const rowIsLoading = Boolean(isRowLoading?.(data));
			if (layout === 'horizontal') {
                return (
                    <div className="flex items-center gap-2">
                        {availableActions.map(({ label, onSelect, icon: Icon }, index) => (
                            <Button
							variant="ghost"
                                key={index}
                                onClick={() => onSelect(data)}
                                disabled={rowIsLoading}
                                className="text-[#BF162E] hover:text-[#BF162E]/80 bg-none "
                                title={label}
                                aria-label={label}>
                                {rowIsLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : Icon ? (
                                    <Icon className="h-5 w-5" />
                                ) : (
                                    <span>{label}</span>
                                )}
                            </Button>
                        ))}
                    </div>
                );
            }
			if (rowIsLoading) {
				return (
					<div
						className="flex h-8 w-8 items-center justify-center rounded-full border border-primary"
						aria-label="Loading"
						aria-busy="true">
						<Loader2 className="h-5 w-5 animate-spin" />
					</div>
				);
			}
			return (
				<React.Fragment>
					<ReusableDropDownComponent<T>
						{...{
							triggerEl: (
                                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-primary transition-colors hover:bg-primary/50">
                                    <Ellipsis className="h-5 w-5 opacity-85 select-none hover:text-accent" />
                                </div>
							),
							ActionsHandlerMapping: ActionsHandlerMapping.filter(
								({ conditional }) => (conditional ? conditional(data) : true)
							).map(({ label, onSelect }) => ({
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