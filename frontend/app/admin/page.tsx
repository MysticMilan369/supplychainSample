'use client';

import Navbar from '../components/Navbar';
import AddUserForm from './AddUserForm';
import UserList from './UserList';

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-green-800 mb-6">Admin Dashboard</h1>
                <AddUserForm />
                <UserList />
            </main>
        </div>
    );
}
