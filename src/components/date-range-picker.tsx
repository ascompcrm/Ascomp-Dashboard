"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"



function formatDateForInput(date: Date | undefined): string {
  if (!date) {
    return ""
  }
  return date.toISOString().split("T")[0] as string
}


interface DatePickerProps {
  label: string
  value: string // YYYY-MM-DD format
  onChange: (value: string) => void
  min?: string // YYYY-MM-DD format
  placeholder?: string
}

export function DatePicker({ label, value, onChange, min, placeholder = "Select date" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const date = React.useMemo(() => {
    return value ? new Date(value + "T00:00:00") : undefined
  }, [value])
  const [month, setMonth] = React.useState<Date | undefined>(date || new Date())


  React.useEffect(() => {
    if (date) {
      setMonth(date)
    }
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setMonth(selectedDate)
      onChange(formatDateForInput(selectedDate))
      setOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    if (inputVal) {
      onChange(inputVal)
    } else {
      onChange("")
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`date-picker-${label}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id={`date-picker-${label}`}
          type="date"
          value={value}
          placeholder={placeholder}
          className="bg-background text-sm pr-10"
          onChange={handleInputChange}
          min={min}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
              disabled={min ? (date) => {
                if (!min) return false
                const minDate = new Date(min + "T00:00:00")
                minDate.setHours(0, 0, 0, 0)
                const compareDate = new Date(date)
                compareDate.setHours(0, 0, 0, 0)
                return compareDate < minDate
              } : undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

