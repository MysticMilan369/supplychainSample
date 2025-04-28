'use client';

import React from 'react';

interface DoneDialogProps {
    message: string;
    onDone: () => void;
}

export default function DoneDialog({ message, onDone }: DoneDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

            {/* Popup Card */}
            <div className="relative bg-white p-10 rounded-2xl shadow-2xl w-full max-w-xl mx-auto text-center">
                <p className="mb-6 text-gray-700 text-lg whitespace-pre-line">{message}</p>
                <button
                    onClick={onDone}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
