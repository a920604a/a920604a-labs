import React, { useState, useEffect } from 'react';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function HeatmapChart({ habits }) {
  const [sizeConfig, setSizeConfig] = useState({
    cellSize: 16,
    gap: 2,
    fontSize: 10,
    habitNameFontSize: 12,
    padding: '4px',
  });

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;

      if (width < 480) {
        // 手機
        setSizeConfig({
          cellSize: 12,
          gap: 1,
          fontSize: 8,
          habitNameFontSize: 10,
          padding: '2px',
        });
      } else if (width < 768) {
        // 平板
        setSizeConfig({
          cellSize: 14,
          gap: 2,
          fontSize: 9,
          habitNameFontSize: 11,
          padding: '3px',
        });
      } else {
        // 桌機
        setSizeConfig({
          cellSize: 16,
          gap: 2,
          fontSize: 10,
          habitNameFontSize: 12,
          padding: '4px',
        });
      }
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!habits.length) return <div>無資料顯示</div>;

  // 產生最近 30 天日期陣列
  const today = new Date();
  const allDates = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    allDates.push(d.toISOString().split('T')[0]);
  }

  const habitsRecordsSet = habits.map(habit => new Set(habit.records));

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>多習慣每日打卡熱力圖（最近30天）</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${allDates.length}, ${sizeConfig.cellSize}px)`,
          gap: `${sizeConfig.gap}px`,
          overflowX: 'auto',
          padding: sizeConfig.padding,
          border: '1px solid #ccc',
          borderRadius: '8px',
          userSelect: 'none',
        }}
      >
        {/* 第一列: 空格 + 日期標題 */}
        <div style={{ fontWeight: 'bold', padding: `4px 8px`, fontSize: sizeConfig.habitNameFontSize }}>
          習慣 / 日期
        </div>
        {allDates.map(date => (
          <div
            key={date}
            style={{ fontSize: sizeConfig.fontSize, textAlign: 'center', padding: '2px 0' }}
            title={date}
          >
            {formatDate(date)}
          </div>
        ))}

        {/* 習慣列 */}
        {habits.map((habit, habitIndex) => (
          <React.Fragment key={habit.name}>
            {/* 習慣名稱 */}
            <div
              style={{
                fontWeight: 'bold',
                padding: `4px 8px`,
                backgroundColor: habit.color || '#ddd',
                color: '#222',
                borderRadius: '4px',
                fontSize: sizeConfig.habitNameFontSize,
              }}
              title={habit.name}
            >
              {habit.name}
            </div>

            {/* 打卡格子 */}
            {allDates.map(date => {
              const hasRecord = habitsRecordsSet[habitIndex].has(date);
              return (
                <div
                  key={`${habit.name}-${date}`}
                  title={hasRecord ? `${habit.name} 有打卡` : ''}
                  style={{
                    width: sizeConfig.cellSize,
                    height: sizeConfig.cellSize,
                    borderRadius: 3,
                    backgroundColor: hasRecord ? habit.color || '#4caf50' : '#eee',
                    border: '1px solid #ccc',
                    transition: 'background-color 0.3s',
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
