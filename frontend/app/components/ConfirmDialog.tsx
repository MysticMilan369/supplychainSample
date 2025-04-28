'use client';

import React from 'react';

interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

            {/* Popup Card */}
            <div className="relative bg-white p-10 rounded-2xl shadow-2xl w-full max-w-xl mx-auto text-center">
                <p className="mb-6 text-gray-700 text-lg whitespace-pre-line">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}
