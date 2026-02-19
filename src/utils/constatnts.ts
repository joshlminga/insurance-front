/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TActionType, TFilterOptions } from "@/types/types";
import { SORT_ORDER } from "./enums";

// export 

export const EMETHODS = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
} as const

export const ORGANIZATIONTYPES = [
  { label: "Agent", value: "Agent" },
  { label: "Insurer", value: "Insurer" },
  { label: "Partner", value: "Partner" },
  { label: "Company", value: "Company" },
]

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

export type EMETHODS = typeof EMETHODS[keyof typeof EMETHODS]

export const baseFactoryReducer = <S>(state: S, action: TActionType<S>): S => ({
  ...state,
  ...action.payload,
});

export function ReusableReducer<T = TFilterOptions>(
  state: T,
  action: TActionType<T>
): T {
  return { ...state, ...action.payload };
}

export const FILTERS_DEFAULTS: TFilterOptions & Record<string, any> = {
  order: { direction: SORT_ORDER.Ascending, orderField: '' },
  date: [],
  term: '',
};

export const FILTEROPTIONS: TFilterOptions & Record<string, any> = {
	order: { direction: SORT_ORDER.Ascending, orderField: '' },
	date: [],
	term: '',
};

export const PAYMENTPLANS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
]