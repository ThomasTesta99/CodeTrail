
import { formatActivityDate, getDaysInMonth, getFirstDayOfMonth } from '@/lib/activityUtils';
import ActivityDay from './ActivityDay';

const ActivityMonth = ({
    month,
    activityMap,
}: {
    month: Date;
    activityMap: Map<string, number>;
}) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const daysInMonth = getDaysInMonth(
        year,
        monthIndex
    );

    const firstDay = getFirstDayOfMonth(
        year,
        monthIndex
    );

    const monthName = month.toLocaleDateString(
        'en-US',
        {
            month: 'long',
        }
    );

    return (
        <div>
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
                    length: firstDay,
                }).map((_, index) => (
                    <div key={`empty-${index}`} />
                ))}

                {Array.from(
                    {
                        length: daysInMonth,
                    },
                    (_, index) => {
                        const day = index + 1;

                        const date = formatActivityDate(
                            year,
                            monthIndex,
                            day
                        );

                        const attempts =
                            activityMap.get(date) ?? 0;

                        return (
                            <ActivityDay
                                key={date}
                                day={day}
                                attempts={attempts}
                            />
                        );
                    }
                )}
            </div>
        </div>
    );
};

export default ActivityMonth;