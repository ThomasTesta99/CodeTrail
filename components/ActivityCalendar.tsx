'use client'

import { createActivityMap, getMonthsForYear } from '@/lib/utils/activityUtils';
import { getUserActivity } from '@/lib/user-actions/activity';

import { Activity } from '@/types/types';
import React, { useEffect, useState } from 'react';
import ActivityYearSelector from './ActivityHelpers/ActivityYearSelector';
import ActivityMonth from './ActivityHelpers/ActivityMonth';
import ActivityLegend from './ActivityHelpers/ActivityLegend';


const ActivityCalendar = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        const fetchActivity = async () => {
            try {
                setIsLoading(true);

                const result = await getUserActivity(selectedYear);

                if (ignore) return;

                if (result.success) {
                    setActivity(result.activity);
                } else {
                    setActivity([]);
                }

            } catch (error) {
                if (ignore) return;

                console.error(
                    'Failed to fetch activity:',
                    error
                );

                setActivity([]);

            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        };

        fetchActivity();

        return () => {
            ignore = true;
        };
    }, [selectedYear]);

    const activityMap =
        createActivityMap(activity);

    const months =
        getMonthsForYear(selectedYear);

    return (
        <div>
            <ActivityYearSelector
                selectedYear={selectedYear}
                currentYear={currentYear}
                onPrevious={() =>
                    setSelectedYear(
                        (year) => year - 1
                    )
                }
                onNext={() =>
                    setSelectedYear(
                        (year) => year + 1
                    )
                }
            />

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
                <>
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {months.map((month) => (
                            <ActivityMonth
                                key={`${selectedYear}-${month.getMonth()}`}
                                month={month}
                                activityMap={activityMap}
                            />
                        ))}
                    </div>

                    <ActivityLegend />
                </>
            )}
        </div>
    );
};

export default ActivityCalendar;