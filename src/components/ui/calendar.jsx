import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  mode = "single",
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get days to show (including previous/next month days for full weeks)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())
  
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const isSelected = (day) => {
    if (mode === "single") {
      return selected && isSameDay(day, selected)
    } else if (mode === "multiple") {
      return selected && selected.some(date => isSameDay(day, date))
    }
    return false
  }

  const handleDayClick = (day) => {
    if (mode === "single") {
      onSelect?.(day)
    } else if (mode === "multiple") {
      const currentSelected = selected || []
      const isAlreadySelected = currentSelected.some(date => isSameDay(day, date))
      
      if (isAlreadySelected) {
        // Remove the date
        onSelect?.(currentSelected.filter(date => !isSameDay(day, date)))
      } else {
        // Add the date
        onSelect?.([...currentSelected, day])
      }
    }
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        
        <button
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-8 w-8 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isDaySelected = isSelected(day)
          const isDayToday = isToday(day)

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={cn(
                "h-8 w-8 text-center text-sm relative rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isDaySelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isDayToday && !isDaySelected && "bg-accent text-accent-foreground",
                !showOutsideDays && !isCurrentMonth && "invisible"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
