import React from 'react';
import Calendar from 'react-calendar';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import 'react-calendar/dist/Calendar.css';
import 'react-tooltip/dist/react-tooltip.css';
import './CalendarStyles.css';

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

function CalendarView({ habits = [], selectedDate, onDateClick }) {
  const today = new Date();

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div>
      <Calendar
        onClickDay={onDateClick}
        value={selectedDate}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null;

          const dateStr = formatDateLocal(date);

          // 找出該日期有打卡的習慣
          const habitsOnDate = habits.filter(habit =>
            habit.records.includes(dateStr)
          );

          if (habitsOnDate.length === 0) return null;

          return (
            <div className="dots-wrapper">
              {habitsOnDate.map((habit, i) => (
                <React.Fragment key={i}>
                  <span
                    className="habit-dot"
                    data-tooltip-id={`tooltip-${dateStr}-${i}`}
                    data-tooltip-content={habit.name}
                    style={{
                      backgroundColor: habit.color || '#3182CE',
                      left: `${i * 10}px`,
                    }}
                  />
                  <ReactTooltip
                    id={`tooltip-${dateStr}-${i}`}
                    place="top"
                    effect="solid"
                  />
                </React.Fragment>
              ))}
            </div>
          );
        }}
        tileClassName={({ date }) => {
          const classes = [];

          if (isSameDay(date, today)) {
            classes.push('today');
          }

          if (isSameDay(date, selectedDate)) {
            classes.push('selected-day');
          }

          return classes.join(' ');
        }}
      />
    </div>
  );
}

export default CalendarView;
