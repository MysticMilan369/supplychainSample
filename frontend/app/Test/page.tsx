"use client"
import React, { use, useState } from "react";

const TestPage = () => {
    const [inputDate, setInputDate] = useState<string>("");
    const [unixTimestamp, setUnixTimestamp] = useState<number | null>(null);
    const [convertedDate, setConvertedDate] = useState<Date | null>(null);

    // Function to handle the conversion from Date to Unix timestamp
    const convertDateToTimestamp = (date: Date): number => {
        return Math.floor(date.getTime() / 1000); // Convert to Unix timestamp (seconds)
    };

    // Function to handle the conversion from Unix timestamp to Date
    const convertTimestampToDate = (timestamp: number): Date => {
        return new Date(timestamp * 1000); // Convert Unix timestamp to Date object
    };

    // Handle form submission
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Convert input date string to Date object
        const date = new Date(inputDate);

        if (isNaN(date.getTime())) {
            alert("Invalid Date!");
            return;
        }

        // Convert Date to Unix timestamp and then back to Date
        const timestamp = convertDateToTimestamp(date);
        const backToDate = convertTimestampToDate(timestamp);

        setUnixTimestamp(timestamp);
        setConvertedDate(backToDate);
    };

    return (
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h1 className="text-xl font-bold text-center">Date to Unix and Back</h1>

            <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium">
                        Enter Date:
                    </label>
                    <input
                        type="date"
                        id="date"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Convert
                </button>
            </form>

            {unixTimestamp !== null && (
                <div className="mt-4">
                    <h2 className="font-semibold">Converted Results:</h2>
                    <p>
                        <strong>Unix Timestamp:</strong> {unixTimestamp}
                    </p>
                    <p>
                        <strong>Converted Date:</strong> {convertedDate?.toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TestPage;
