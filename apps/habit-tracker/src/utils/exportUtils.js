import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';


// 匯出 PDF
export async function exportHabitsToPDF(habits, dateRangeText, userName = 'Anonymous') {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const page = pdfDoc.addPage([600, 750]);
    const { height } = page.getSize();

    const fontUrl = (import.meta.env.BASE_URL || '/') + 'fonts/NotoSansTC-Regular.ttf';
    const fontBytes = await fetch(fontUrl).then(res => {
        if (!res.ok) throw new Error(`無法載入字型檔，狀態碼：${res.status}`);
        return res.arrayBuffer();
    });
    const customFont = await pdfDoc.embedFont(fontBytes);

    const fontSizeTitle = 24;
    const fontSizeContent = 14;
    const marginLeft = 50;

    page.drawText('習慣統計報告', {
        x: marginLeft,
        y: height - 50,
        size: fontSizeTitle,
        font: customFont,
        color: rgb(0, 0.53, 0.24),
    });

    page.drawText(`姓名：${userName}`, {
        x: marginLeft,
        y: height - 80,
        size: fontSizeContent,
        font: customFont,
    });

    page.drawText(`統計範圍：${dateRangeText}`, {
        x: marginLeft,
        y: height - 110,
        size: fontSizeContent,
        font: customFont,
    });

    let yPosition = height - 140;

    habits.forEach((habit, idx) => {
        if (yPosition < 50) {
            // 換頁
            page = pdfDoc.addPage([600, 750]);
            yPosition = height - 50;
        }
        const habitTitle = `${idx + 1}. 習慣名稱：${habit.name} - 打卡次數：${habit.records.length}`;
        page.drawText(habitTitle, {
            x: marginLeft,
            y: yPosition,
            size: 12,
            font: customFont,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        if (habit.records.length > 0) {
            const datesText = `打卡日期：${habit.records.map(r => formatDate(r)).join(', ')}`;
            page.drawText(datesText, {
                x: marginLeft + 10,
                y: yPosition,
                size: 10,
                font: customFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= 30;
        }
    });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `習慣統計_${dateRangeText}.pdf`;
    link.click();
}

// 匯出 CSV
export function exportHabitsToCSV(habits, dateRangeText) {
    let csvContent = '名稱,打卡次數,打卡日期\n';

    habits.forEach(habit => {
        const dates = `"${habit.records.map(r => formatDate(r)).join(', ')}"`;
        csvContent += `${habit.name},${habit.records.length},${dates}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `習慣統計_${dateRangeText}.csv`;
    link.click();
}

// 日期格式工具
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('zh-TW');
}
