export const checkConsecutiveDays = (records: string[], x: number): boolean => {
    const sortedDates = [...new Set(records)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let streak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
            streak++;
            if (streak >= x) return true;
        } else if (diff > 1) {
            streak = 1;
        }
    }
    return false;
};


export const checkWeeklyCount = (records: string[], x: number): boolean => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    const count = records.filter(dateStr => {
        const d = new Date(dateStr);
        return d >= weekAgo && d <= today;
    }).length;

    return count >= x;
};
