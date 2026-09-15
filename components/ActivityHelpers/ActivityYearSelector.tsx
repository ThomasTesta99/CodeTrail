const ActivityYearSelector = ({
    selectedYear,
    currentYear,
    onPrevious,
    onNext,
}: {
    selectedYear: number;
    currentYear: number;
    onPrevious: () => void;
    onNext: () => void;
}) => {
    return (
        <div className="mb-8 flex items-center justify-between">
            <button
                type="button"
                onClick={onPrevious}
                className="cursor-pointer rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800"
            >
                Previous
            </button>

            <h2 className="text-xl font-semibold text-white">
                {selectedYear}
            </h2>

            <button
                type="button"
                onClick={onNext}
                disabled={selectedYear >= currentYear}
                className="cursor-pointer rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
};

export default ActivityYearSelector;