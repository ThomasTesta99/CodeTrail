const ActivityLegend = () => {
    return (
        <div className="mt-8 flex items-center justify-end gap-2 text-xs text-gray-400">
            <span>Less</span>

            <div className="size-3 rounded-full bg-gray-700" />
            <div className="size-3 rounded-full bg-blue-300" />
            <div className="size-3 rounded-full bg-blue-500" />
            <div className="size-3 rounded-full bg-blue-700" />
            <div className="size-3 rounded-full bg-blue-900" />

            <span>More</span>
        </div>
    );
};

export default ActivityLegend;