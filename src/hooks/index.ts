import type { 
	TCustomDialogPropsContextProps, 
	TDebounceprops, 
	TKeyValueAnyType 
} from "@/types/types";
import { baseFactoryReducer } from "@/utils/constatnts";
import { useReducer, useRef, useState } from "react";

export const useCustomDialogContextFactory = <T = TKeyValueAnyType>() => {
	const [dialogOpen, toggleDialogState] = useState<boolean>(false);

	const [dialogContent, dialogContentDispatcher] = useReducer(
		baseFactoryReducer<TCustomDialogPropsContextProps<T>>,
		{}
	);

	const toggleDialog = (state?: boolean) =>
		toggleDialogState((prev) => state ?? !prev);

	const handleDialogContextSwitch = ({
		componentProps,
		Component,
		state,
	}: TCustomDialogPropsContextProps<T>) => {
		Component
			? dialogContentDispatcher({
				payload: {
					...(componentProps ? { componentProps } : {}),
					Component,
				},
				type: 'componentProps',
			})
			: null;

		toggleDialog(state);
	};
	return {
		handleDialogContextSwitch,
		dialogContent,
		toggleDialog,
		dialogOpen,
	};
};


export const useDebounce = <TDebounceCallBackArgs>({
	debounceTimeOut = 500,
	debounceCallback,
}: TDebounceprops<TDebounceCallBackArgs>) => {
	const timeOutId = useRef<NodeJS.Timeout | null>(null);

	return (args: TDebounceCallBackArgs) => {
		if (timeOutId.current) clearTimeout(timeOutId.current);

		timeOutId.current = setTimeout(
			() => debounceCallback(args),
			debounceTimeOut
		);
	};
};
