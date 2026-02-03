/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type T = {
  [key: string]: any;
  ReactNode?: ReactNode;
}

export type TNodeChildrentType<T = ReactNode> = {
    children: T;
};

export type TReusablePageProps = {
    description?: string;
    title: string;
} & Partial<TNodeChildrentType>;

export interface PageHeaderAction {
    label: string
    icon?: LucideIcon
    href?: string
    onClick?: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
}

export interface PageHeaderProps {
    title: string
    description?: string
    actions?: PageHeaderAction[]
    children?: React.ReactNode
}
export interface Tuser {
    name: string
    email: string
    avatar?: string
}