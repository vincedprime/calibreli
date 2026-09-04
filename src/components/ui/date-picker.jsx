import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className, displayFormat = "PPP", ...props }) {
  const [open, setOpen] = React.useState(false)

  const handleDateChange = (nextDate) => {
    onDateChange(nextDate)
    if (nextDate) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          {...props}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function MultiDatePicker({
  dates = [],
  onDatesChange,
  placeholder = "Select dates",
  className,
  maxDisplay = 3,
  ...props
}) {
  const displayRef = React.useRef(null)
  const measureRef = React.useRef(null)
  const [visibleDates, setVisibleDates] = React.useState(dates.length)
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState(() => dates[dates.length - 1] ?? new Date())

  React.useLayoutEffect(() => {
    if (!dates.length) return undefined

    const labelFor = count => {
      const labels = dates.slice(0, count).map(date => format(date, "MMM d"))
      return count === dates.length ? labels.join(", ") : `${labels.join(", ")} +${dates.length - count} more`
    }
    const fitDates = () => {
      const availableWidth = displayRef.current?.clientWidth ?? 0
      const measure = measureRef.current
      if (!availableWidth || !measure) return

      let count = dates.length
      while (count > 1) {
        measure.textContent = labelFor(count)
        if (measure.scrollWidth <= availableWidth) break
        count -= 1
      }
      setVisibleDates(count)
    }

    fitDates()
    const observer = new ResizeObserver(fitDates)
    observer.observe(displayRef.current)
    return () => observer.disconnect()
  }, [dates])

  const displayText = !dates.length
    ? placeholder
    : (() => {
      const labels = dates.slice(0, visibleDates).map(date => format(date, "MMM d"))
      return visibleDates === dates.length ? labels.join(", ") : `${labels.join(", ")} +${dates.length - visibleDates} more`
    })()

  const removeDate = (targetDate) => {
    onDatesChange(dates.filter(date => date.getTime() !== targetDate.getTime()))
  }

  const handleDatesChange = (nextDates) => {
    onDatesChange(nextDates ?? [])
  }

  const datePill = (date, index) => (
    <span
      key={`${date.getTime()}-${index}`}
      className="inline-flex items-center gap-1 rounded-md bg-primary/10 py-1 pl-2 pr-1 text-xs text-primary"
    >
      {format(date, "MMM d, yyyy")}
      <button
        type="button"
        className="rounded-sm p-0.5 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${format(date, "MMMM d, yyyy")}`}
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation()
          removeDate(date)
        }}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  )

  const fullListContent = (
    <div className="flex flex-wrap gap-1 max-w-[240px]">
      {dates.map(datePill)}
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              {...props}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                dates.length === 0 && "text-muted-foreground",
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span ref={displayRef} className="min-w-0 flex-1 truncate">{displayText}</span>
              <span ref={measureRef} aria-hidden="true" className="invisible fixed whitespace-nowrap text-sm" />
            </Button>
          </PopoverTrigger>
        </HoverCardTrigger>
        <HoverCardContent className="w-auto p-3" align="start">
          {dates.length > 0 ? fullListContent : <span className="text-sm text-muted-foreground">No dates selected</span>}
        </HoverCardContent>
      </HoverCard>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={handleDatesChange}
          month={month}
          onMonthChange={setMonth}
          initialFocus
        />
        <div className="h-32 border-t p-3">
          {dates.length > 0 ? (
            <>
            <div className="text-sm text-muted-foreground mb-2">
              Selected dates ({dates.length}):
            </div>
            <div className="flex max-h-8 flex-wrap gap-1 overflow-y-auto pr-1">
              {dates.slice(0, 3).map(datePill)}
              {dates.length > 3 && (
                <HoverCard openDelay={200}>
                  <HoverCardTrigger asChild>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs cursor-pointer hover:bg-muted/80 transition-colors">
                      +{dates.length - 3} more
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto p-3" align="start">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {dates.slice(3).map(datePill)}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onDatesChange([])}
            >
              Clear all
            </Button>
            </>
          ) : <p className="pt-8 text-center text-sm text-muted-foreground">Choose one or more holiday dates.</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}
