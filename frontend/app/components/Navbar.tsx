import Image from "next/image";
import { useMetamask } from "../hooks/blockchain/useMetamask";
import { useState, useEffect } from "react";
import Link from "next/link"; // Import Link from Next.js

export default function Navbar() {
    const { userAddress, connect, disconnect, networkError, connectionStatus } = useMetamask();

    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Show toast when connectionStatus is set
        if (connectionStatus) {
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000); // Hide toast after 3 seconds
        }
    }, [connectionStatus]);

    return (
        <>
            <nav className="w-full px-6 py-4 bg-green-100 flex justify-between items-center shadow-md">
                <Link href="/" passHref>
                    <div className="flex items-center gap-2">


                        <div className="flex items-center justify-center cursor-pointer">
                            <Image
                                src="/assets/logo.svg"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>

                        <div className="flex items-center justify-center cursor-pointer">
                            <Image
                                src="/assets/logoname.svg"
                                alt="ChiyaChain"
                                width={120}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </Link>

                {/* Wallet Connect Section */}
                <div className="flex items-center gap-4">
                    {userAddress && (
                        <>
                            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">
                                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                            </p>
                        </>
                    )}

                    {/* Display Network Error */}
                    {networkError && (
                        <p className="text-sm text-red-500">
                            {networkError}
                        </p>
                    )}

                    {/* Show Connect / Disconnect button */}
                    {userAddress ? (
                        <button
                            onClick={disconnect}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={connect}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </nav>

            {/* Display Toast in the top-right corner */}
            {showToast && connectionStatus && !networkError && (
                <div className="fixed top-16 right-4 bg-green-500 text-white text-sm py-2 px-4 rounded-lg shadow-lg transition-all opacity-100 animate-fadeInOut">
                    {connectionStatus}
                </div>
            )}

            {/* Inline CSS for toast animation */}
            <style jsx>{`
                @keyframes fadeInOut {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    50% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }

                .animate-fadeInOut {
                    animation: fadeInOut 4s ease-in-out forwards;
                }
            `}</style>
        </>
    );
}
