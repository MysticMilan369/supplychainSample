'use client';

import { useState } from 'react';
import { Role, UserStatus } from '../types/enums';
import { useUserManagement } from '../hooks/domin/useUserManagement';
import DoneDialog from '../components/DoneDialog';

const roles = Object.keys(Role).filter((r) => isNaN(Number(r)));

export default function AddUserForm() {
    const { addUser, getAllUsers, loading, error } = useUserManagement();

    const [wallet, setWallet] = useState('');
    const [name, setName] = useState('');
    const [place, setPlace] = useState('');
    const [role, setRole] = useState<Role>(Role.Manufacturer);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        const result = await addUser(wallet, name, place, role);

        if (result) {
            setSuccessMessage(
                `Wallet: ${result.wallet}\nName: ${result.name}\nRole: ${Role[result.role]}\nStatus: ${UserStatus[result.status]}`
            );

            setWallet('');
            setName('');
            setPlace('');
            setRole(Role.Manufacturer);

            await getAllUsers();
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-semibold mb-4 text-green-800">Add New User</h2>

                {error && (
                    <p className="text-red-600 mb-2 font-medium">{error}</p>
                )}

                <fieldset disabled={loading} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Wallet Address"
                        className="w-full border p-2 rounded"
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full border p-2 rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Place"
                        className="w-full border p-2 rounded"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        required
                    />
                    <select
                        className="w-full border p-2 rounded"
                        value={role}
                        onChange={(e) => setRole(Number(e.target.value))}
                    >
                        {roles.map((r, idx) => (
                            <option key={r} value={idx}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                    >
                        {loading ? 'Adding User...' : 'Add User'}
                    </button>
                </fieldset>
            </form>

            {successMessage && (
                <DoneDialog
                    message={`User Added Successfully!\n\n${successMessage}`}
                    onDone={() => setSuccessMessage(null)}
                />
            )}
        </>
    );
}
