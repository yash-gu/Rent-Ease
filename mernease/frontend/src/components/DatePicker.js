import React, { useState, useRef, useEffect } from 'react';

const DatePicker = ({ placeholder = 'Select dates', onDateChange, checkIn, checkOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState(checkIn || null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(checkOut || null);
  const [hoverDate, setHoverDate] = useState(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection
      setSelectedCheckIn(clickedDate);
      setSelectedCheckOut(null);
    } else {
      // Complete selection
      if (clickedDate > selectedCheckIn) {
        setSelectedCheckOut(clickedDate);
        if (onDateChange) {
          onDateChange({ checkIn: selectedCheckIn, checkOut: clickedDate });
        }
        setTimeout(() => setIsOpen(false), 300);
      } else {
        // If clicked date is before check-in, restart selection
        setSelectedCheckIn(clickedDate);
        setSelectedCheckOut(null);
      }
    }
  };

  const isDateInRange = (day) => {
    if (!selectedCheckIn) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (selectedCheckOut) {
      return date >= selectedCheckIn && date <= selectedCheckOut;
    } else if (hoverDate) {
      return date >= selectedCheckIn && date <= hoverDate;
    }
    return false;
  };

  const isCheckIn = (day) => {
    if (!selectedCheckIn) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedCheckIn.toDateString();
  };

  const isCheckOut = (day) => {
    if (!selectedCheckOut) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedCheckOut.toDateString();
  };

  const isPastDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDateRange = () => {
    if (!selectedCheckIn) return placeholder;
    const checkInStr = selectedCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!selectedCheckOut) return checkInStr;
    const checkOutStr = selectedCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${checkInStr} - ${checkOutStr}`;
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isDisabled = isPastDate(day);
      const inRange = isDateInRange(day);
      const isStart = isCheckIn(day);
      const isEnd = isCheckOut(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateClick(day)}
          onMouseEnter={() => {
            if (selectedCheckIn && !selectedCheckOut && !isDisabled) {
              setHoverDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
            }
          }}
          onMouseLeave={() => setHoverDate(null)}
          disabled={isDisabled}
          className={`
            h-10 rounded-lg text-sm font-medium transition-all relative
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}
            ${inRange && !isStart && !isEnd ? 'bg-primary/20' : ''}
            ${isStart || isEnd ? 'bg-primary text-white hover:bg-primary' : ''}
            ${isStart ? 'rounded-l-full' : ''}
            ${isEnd ? 'rounded-r-full' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative" ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-transparent border-none p-0 focus:ring-0 text-on-surface font-medium cursor-pointer"
      >
        {formatDateRange()}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-outline-variant z-50 p-6 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-surface-container rounded-lg transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="font-bold text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-surface-container rounded-lg transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-secondary h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-outline-variant text-xs text-secondary">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-primary rounded-full"></div>
              <span>Check-in / Check-out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded"></div>
              <span>Selected range</span>
            </div>
          </div>

          {/* Clear Button */}
          {(selectedCheckIn || selectedCheckOut) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCheckIn(null);
                setSelectedCheckOut(null);
                if (onDateChange) {
                  onDateChange({ checkIn: null, checkOut: null });
                }
              }}
              className="w-full mt-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
