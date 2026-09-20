import { Activity } from '@/types/types';

export const getActivityColor = (attempts: number) => {
    if (attempts === 0) {
        return 'bg-gray-700 text-gray-300';
    }

    if (attempts === 1) {
        return 'bg-blue-300 text-black';
    }

    if (attempts <= 3) {
        return 'bg-blue-500 text-white';
    }

    if (attempts <= 5) {
        return 'bg-blue-700 text-white';
    }

    return 'bg-blue-900 text-white';
};

export const createActivityMap = (activity: Activity[]) => {
    return new Map(
        activity.map((item) => [
            item.date,
            item.attempts,
        ])
    );
};

export const getMonthsForYear = (year: number) => {
    return Array.from(
        { length: 12 },
        (_, index) => new Date(year, index, 1)
    );
};

export const getDaysInMonth = (
    year: number,
    month: number
) => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (
    year: number,
    month: number
) => {
    return new Date(year, month, 1).getDay();
};

export const formatActivityDate = (
    year: number,
    month: number,
    day: number
) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};