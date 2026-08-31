/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner"
import React from "react"
import type { ToastOptions } from "@/types/types"

export const ShowToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      position: options?.position || "bottom-right",
      duration: options?.duration,
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      position: options?.position || "bottom-right",
      duration: options?.duration,
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },
  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      position: options?.position || "bottom-right",
      duration: options?.duration,
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },
  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      position: options?.position || "bottom-right",
      duration: options?.duration,
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },
  custom: (title: string, description: string, options?: ToastOptions) => {
    return toast(title, {
      description: description,
      position: options?.position || "bottom-right",
      duration: options?.duration,
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },

  json: (title: string, data: any, options?: ToastOptions) => {
    return toast(title, {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: options?.position || "bottom-right",
      duration: options?.duration,
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: options?.position || "bottom-right",
      duration: options?.duration,
      style: {
        "--border-radius": "calc(var(--radius) + 4px)",
      } as React.CSSProperties,
    })
  },
}

export const invalidSelectClassName = "data-[invalid=true]:[&_[data-slot=select-trigger]]:border-red-500 data-[invalid=true]:[&_[data-slot=select-trigger]]:focus:ring-red-500"
export const SIDEBAR_LAYOUT_QUERY = '(min-width: 1280px)'