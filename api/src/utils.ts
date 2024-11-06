const todayFilter = "today";
const yesterdayFilter = "yesterday";

const getDateByDayString = (dayString: string): string => {
    const today = new Date(new Date().toISOString().split('T')[0]);
    if (dayString === todayFilter) {
        return today.toISOString().split('T')[0];
    } else if (dayString === yesterdayFilter) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
    return "";
};

const getRelativeDate = (relativeTimeExpression: string): string => {
    const now = new Date(new Date().toISOString());
    const match = relativeTimeExpression.match(/(\d+)([a-z]+)/);
    if (!match) {
        return "";
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'h':
            now.setHours(now.getHours() - value);
            break;
        case 'min':
            now.setMinutes(now.getMinutes() - value);
            break;
        default:
            return "";
    }

    return now.toISOString().replace('T', ' ').replace('Z', '');
};

export {
    getDateByDayString,
    getRelativeDate
}