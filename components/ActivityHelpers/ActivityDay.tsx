import { getActivityColor } from "@/lib/utils/activityUtils";

const ActivityDay = ({
    day,
    attempts,
}: {
    day: number;
    attempts: number;
}) => {
    return (
        <div
            className="flex cursor-default justify-center"
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
};

export default ActivityDay;