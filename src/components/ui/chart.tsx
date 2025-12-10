"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DefaultLegendContent, Legend, type LegendProps, Tooltip, type TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

export type ChartConfig = Record<
  string,
  {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
>

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => {
    const style = React.useMemo<React.CSSProperties>(() => {
      const css: React.CSSProperties & Record<string, string> = {}
      Object.entries(config).forEach(([key, value], index) => {
        const color = value.color ?? `hsl(var(--chart-${index + 1}))`
        css[`--color-${key}`] = color
      })
      return css
    }, [config])

    return (
      <div
        ref={ref}
        style={style}
        className={cn("relative flex w-full flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = Tooltip

export function ChartTooltipContent(
  props: TooltipProps<ValueType, NameType> & { hideLabel?: boolean; indicator?: "dot" | "line" }
) {
  const { active, payload, label, hideLabel, indicator = "dot" } = props as any
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-sm text-sm">
      {!hideLabel && <div className="mb-1 text-xs text-muted-foreground">{label}</div>}
      <div className="grid gap-1">
        {payload.map((item: any, idx: number) => {
          const key = item.dataKey?.toString() ?? idx.toString()
          const color = item.color ?? `hsl(var(--chart-${idx + 1}))`
          return (
            <div key={key} className="flex items-center gap-2 text-foreground">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  indicator === "line" && "h-0.5 w-3 rounded-sm"
                )}
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
              <span className="text-xs font-medium">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const ChartLegend = Legend

export function ChartLegendContent(props: LegendProps) {
  return (
    <DefaultLegendContent
      {...props}
      content={(legendProps) => {
        const { payload } = legendProps
        if (!payload?.length) return null
        return (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {payload.map((item, idx) => (
              <div key={item.value ?? idx} className="inline-flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color ?? `hsl(var(--chart-${idx + 1}))` }}
                />
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      }}
    />
  )
}
