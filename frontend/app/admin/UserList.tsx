'use client';

import { useEffect, useState, useCallback } from 'react';
import { IUser } from '../types/interface';
import { Role, UserStatus } from '../types/enums';
import { useUserManagement } from '../hooks/domin/useUserManagement';
import ConfirmDialog from '../components/ConfirmDialog';
import DoneDialog from '../components/DoneDialog';

export default function UserList() {
    const { getAllUsers, updateUserStatus, error } = useUserManagement();
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');

    const [doneMessage, setDoneMessage] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getAllUsers();
            setUsers(all);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    }, [getAllUsers]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdateStatus = async (wallet: string, newStatus: UserStatus) => {
        const result = await updateUserStatus(wallet, newStatus);
        if (result) {
            setDoneMessage(
                `User ${result.wallet} updated from ${UserStatus[result.oldStatus]} to ${UserStatus[result.newStatus]}.`
            );
            fetchUsers();
        }
    };

    const confirmAndUpdateStatus = (wallet: string, newStatus: UserStatus) => {
        const warning = newStatus === UserStatus.Blocked
            ? "⚠️ Warning: You cannot unblock the user after blocking.\nAre you sure you want to block this user?"
            : `Are you sure you want to change user status to ${UserStatus[newStatus]}?`;

        setConfirmMessage(warning);
        setConfirmAction(() => () => {
            handleUpdateStatus(wallet, newStatus);
            setConfirmAction(null);
        });
    };

    const renderActions = (status: UserStatus, wallet: string) => {
        if (status === UserStatus.Blocked) {
            return <span className="text-red-700 font-semibold text-sm">Blocked</span>;
        }

        if (status === UserStatus.Rejected) {
            return <span className="text-orange-600 font-semibold text-sm">Rejected</span>;
        }

        const actions = [
            <button
                key="block"
                onClick={() => confirmAndUpdateStatus(wallet, UserStatus.Blocked)}
                className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-900"
            >
                Block
            </button>
        ];

        if (status === UserStatus.Pending) {
            actions.push(
                <button
                    key="verify"
                    onClick={() => confirmAndUpdateStatus(wallet, UserStatus.Active)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                >
                    Verify
                </button>,
                <button
                    key="reject"
                    onClick={() => confirmAndUpdateStatus(wallet, UserStatus.Rejected)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                >
                    Reject
                </button>
            );
        }

        if (status === UserStatus.Active) {
            actions.push(
                <button
                    key="deactivate"
                    onClick={() => confirmAndUpdateStatus(wallet, UserStatus.Deactivated)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                >
                    Deactivate
                </button>
            );
        }

        if (status === UserStatus.Deactivated) {
            actions.push(
                <button
                    key="activate"
                    onClick={() => confirmAndUpdateStatus(wallet, UserStatus.Active)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                >
                    Activate
                </button>
            );
        }

        return <div className="flex flex-wrap gap-2">{actions}</div>;
    };

    return (
        <div className="bg-white p-6 rounded shadow-md relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-800">Registered Users</h2>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <div className="overflow-x-auto">
                <table className="w-full text-left border">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-2 border">SN</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Place</th>
                            <th className="p-2 border">Wallet</th>
                            <th className="p-2 border">Role</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-4 text-gray-500">
                                    {loading ? 'Loading users...' : 'No users found.'}
                                </td>
                            </tr>
                        ) : (
                            users.map((user, idx) => (
                                <tr key={user.wallet} className="border-t hover:bg-gray-50">
                                    <td className="p-2 border">{idx + 1}</td>
                                    <td className="p-2 border">{user.name}</td>
                                    <td className="p-2 border">{user.place}</td>
                                    <td className="p-2 border font-mono text-xs break-all">{user.wallet}</td>
                                    <td className="p-2 border">{Role[user.role]}</td>
                                    <td className="p-2 border">{UserStatus[user.status]}</td>
                                    <td className="p-2 border">{renderActions(user.status, user.wallet)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {confirmAction && (
                <ConfirmDialog
                    message={confirmMessage}
                    onConfirm={confirmAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            {doneMessage && (
                <DoneDialog
                    message={doneMessage}
                    onDone={() => setDoneMessage(null)}
                />
            )}
        </div>
    );
}
