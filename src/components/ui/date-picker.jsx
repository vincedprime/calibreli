import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
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
  maxDisplay = 3 
}) {
  const displayText = React.useMemo(() => {
    if (dates.length === 0) return placeholder
    
    if (dates.length <= maxDisplay) {
      return dates.map(date => format(date, "MMM d")).join(", ")
    } else {
      const displayed = dates.slice(0, maxDisplay).map(date => format(date, "MMM d")).join(", ")
      return `${displayed} +${dates.length - maxDisplay} more`
    }
  }, [dates, placeholder, maxDisplay])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            dates.length === 0 && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={onDatesChange}
          initialFocus
        />
        {dates.length > 0 && (
          <div className="p-3 border-t">
            <div className="text-sm text-muted-foreground mb-2">
              Selected dates ({dates.length}):
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {dates.map((date, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                >
                  {format(date, "MMM d, yyyy")}
                </span>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onDatesChange([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
