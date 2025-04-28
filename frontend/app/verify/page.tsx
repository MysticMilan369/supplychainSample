'use client';

import { useState } from "react";
import Navbar from "../components/Navbar";
import { useProductManagement } from "../hooks/domin/useProductManagement";
import { IBatch, IProduct, IStageDetails } from "../types/interface";
import { Role , Stage } from "../types/enums";

export default function VerifyPage() {
    const [productId, setProductId] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState<{
        product: IProduct;
        batch: IBatch;
        stages: IStageDetails[];
    } | null>(null);

    const { getProductDetails } = useProductManagement();

    const handleVerify = async () => {
        setError(null);
        setLoading(true);
        setProductData(null);

        try {
            const parsedId = parseInt(productId);
            if (isNaN(parsedId) || parsedId < 0) {
                setError("Please enter a valid product ID.");
                setLoading(false);
                return;
            }

            const details = await getProductDetails(parsedId);
            if (!details) {
                setError("No product found with this ID.");
                setLoading(false);
                return;
            }

            setProductData(details);
        } catch (err: any) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-3xl mx-auto mt-10 px-4">
                <h1 className="text-3xl font-semibold mb-4 text-green-700">
                    Verify Your Tea Product
                </h1>

                <div className="flex gap-2 mb-6">
                    <input
                        type="number"
                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none"
                        placeholder="Enter Product ID"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                    />
                    <button
                        onClick={handleVerify}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {productData && (
                    <>
                        <div className="bg-gray-100 p-4 rounded shadow-sm mb-6">
                            <h2 className="text-xl font-semibold text-green-800">
                                Product Info
                            </h2>
                            <p><strong>Name:</strong> {productData.product.name}</p>
                            <p><strong>Description:</strong> {productData.product.description}</p>
                            <p><strong>Type:</strong> {productData.product.productType}</p>
                            <p><strong>Batch No:</strong> {productData.product.batchNo}</p>
                            <p><strong>Batch Name:</strong> {productData.batch.name}</p>
                            <p><strong>Batch Description:</strong> {productData.batch.description}</p>
                            <p><strong>Price:</strong> ₹{productData.product.price}</p>
                            <p><strong>Manufactured:</strong> {productData.product.manufacturedDate.toLocaleDateString()}</p>
                            <p><strong>Expiry:</strong> {productData.product.expiryDate.toLocaleDateString()}</p>
                            <p><strong>Current Stage:</strong> {Stage[productData.product.stage]}</p>
                        </div>

                        {productData.stages.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded shadow-sm">
                                <h2 className="text-xl font-semibold text-green-800 mb-2">Tracking History</h2>
                                <ul className="space-y-2">
                                    {productData.stages.map((entry, i) => (
                                        <li key={i} className="border-b pb-2">
                                            <p><strong>Handler:</strong> {entry.user.name} ({Role[entry.user.role]})</p>
                                            <p><strong>Place:</strong> {entry.user.place}</p>
                                            <p><strong>Stage:</strong> {Stage[entry.stage]}</p>
                                            <p><strong>Entered:</strong> {entry.entryTime.toLocaleString()}</p>
                                            <p><strong>Exited:</strong> {entry.exitTime && entry.exitTime.toISOString() !== new Date(0).toISOString() ? entry.exitTime.toLocaleString() : "Still there"}</p>
                                            <p><strong>Remark:</strong> {entry.remark}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
