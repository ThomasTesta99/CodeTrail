'use client'

import { getUserActivity } from '@/lib/user-actions/activity'
import { Activity } from '@/types/types'
import React, { useEffect, useState } from 'react'

const ActivityCalendar = ({ userId }: { userId: string | undefined }) => {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setActivity([]);
            setIsLoading(false);
            return;
        }

        const fetchActivity = async () => {
            try {
                setIsLoading(true);

                const result = await getUserActivity(
                    userId,
                    selectedYear
                );

                if (result.success) {
                    setActivity(result.activity);
                } else {
                    setActivity([]);
                }
            } catch (error) {
                console.error('Failed to fetch activity:', error);
                setActivity([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, [userId, selectedYear]);

    const activityMap = new Map(
        activity.map((item) => [
            item.date,
            item.attempts
        ])
    );

    const months = Array.from(
        { length: 12 },
        (_, index) => new Date(selectedYear, index, 1)
    );

    const getActivityColor = (attempts: number) => {
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

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() =>
                        setSelectedYear((year) => year - 1)
                    }
                    className="cursor-pointer rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800"
                >
                    Previous
                </button>

                <h2 className="text-xl font-semibold text-white">
                    {selectedYear}
                </h2>

                <button
                    type="button"
                    onClick={() =>
                        setSelectedYear((year) => year + 1)
                    }
                    disabled={selectedYear >= currentYear}
                    className="cursor-pointer rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-400">
                    Loading activity...
                </p>
            ) : activity.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-base font-medium text-gray-300">
                        No activity recorded for {selectedYear}.
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Attempts completed during this year will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
                    {months.map((month) => {
                        const year = month.getFullYear();
                        const monthIndex = month.getMonth();

                        const daysInMonth = new Date(
                            year,
                            monthIndex + 1,
                            0
                        ).getDate();

                        const firstDay = new Date(
                            year,
                            monthIndex,
                            1
                        ).getDay();

                        const monthName = month.toLocaleDateString(
                            'en-US',
                            {
                                month: 'long',
                            }
                        );

                        return (
                            <div key={`${year}-${monthIndex}`}>
                                <h3 className="mb-4 text-base font-semibold text-white">
                                    {monthName}
                                </h3>

                                <div className="mb-2 grid grid-cols-7 text-center text-xs text-gray-400">
                                    <span>Sun</span>
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {Array.from({
                                        length: firstDay
                                    }).map((_, index) => (
                                        <div key={`empty-${index}`} />
                                    ))}

                                    {Array.from(
                                        {
                                            length: daysInMonth
                                        },
                                        (_, index) => {
                                            const day = index + 1;

                                            const date =
                                                `${year}-` +
                                                `${String(monthIndex + 1).padStart(2, '0')}-` +
                                                `${String(day).padStart(2, '0')}`;

                                            const attempts =
                                                activityMap.get(date) ?? 0;

                                            return (
                                                <div
                                                    key={date}
                                                    className="flex justify-center cursor-default"
                                                    title={`${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`}
                                                >
                                                    <div
                                                        className={`
                                                            flex size-8 items-center justify-center
                                                            rounded-full text-xs font-medium
                                                            transition
                                                            ${getActivityColor(attempts)}
                                                        `}
                                                    >
                                                        {day}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-2 text-xs text-gray-400">
                <span>Less</span>

                <div className="size-3 rounded-full bg-gray-700" />
                <div className="size-3 rounded-full bg-blue-300" />
                <div className="size-3 rounded-full bg-blue-500" />
                <div className="size-3 rounded-full bg-blue-700" />
                <div className="size-3 rounded-full bg-blue-900" />

                <span>More</span>
            </div>
        </div>
    );
};

export default ActivityCalendar;