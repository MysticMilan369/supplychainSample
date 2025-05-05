import { useState, useCallback } from "react";
import { useSupplyChainContract } from "../blockchain/useSupplyChainContract";
import { IBatch } from "../../types/interface";
// import { IProduct } from "../../types/interface";

export const useBatchManagement = () => {
  const contract = useSupplyChainContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateContract = useCallback((): boolean => {
    if (!contract) {
      setError(
        "Please switch to the correct network and connect your wallet. Contract not found."
      );
      return false;
    }
    setError(null);
    return true;
  }, [contract]);

  const createBatch = useCallback(
    async (
      name: string,
      description: string
    ): Promise<{ batchId: number; name: string } | null> => {
      if (!validateContract()) return null;

      if (!name.trim() || !description.trim()) {
        setError("Name and description are required.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contract!.createBatch(name, description);
        const receipt = await tx.wait();

        for (const log of receipt.logs) {
          if (log.transactionHash !== receipt.hash) continue;

          try {
            const parsedLog = contract?.interface.parseLog(log);
            if (parsedLog?.name === "BatchCreated") {
              const [batchId, batchName] = parsedLog.args;
              return {
                batchId: Number(batchId),
                name: batchName,
              };
            }
          } catch (error) {
            setError("Failed to parse event log.");
          }
        }

        setError("Batch created successfully, but no event found in logs.");
        return null;
      } catch (err: any) {
        setError(
          "Error creating batch: " +
            (err?.reason ||
              err?.revert?.args?.[0] ||
              err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
              "Unknown error")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, validateContract]
  );

  const getBatchDetails = useCallback(
    async (batchId: number): Promise<IBatch | null> => {
      if (!validateContract()) return null;

      try {
        const batch = await contract!.batches(batchId);
        return {
          name: batch.name,
          description: batch.description,
        } as IBatch;
      } catch (err: any) {
        setError(
          "Error fetching batch details: " +
            (err?.reason ||
              err?.revert?.args?.[0] ||
              err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
              "Unknown error")
        );
        return null;
      }
    },
    [contract, validateContract]
  );

  // const getAllProductsPerBatch = useCallback(
  //   async (batchNo: number): Promise<IProduct[]> => {
  //     if (!validateContract()) return [];

  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const products = await contract!.getAllProductsPerBatch(batchNo);
  //       if (!products || products.length === 0) {
  //         setError("No products found for this batch.");
  //         return [];
  //       }
  //       return products.map((p: any) => ({
  //         name: p.name,
  //         batchNo: Number(p.batchNo),
  //         stage: Number(p.stage),
  //         productType: p.productType,
  //         description: p.description,
  //         manufacturedDate: new Date(Number(p.manufacturedDate) * 1000),
  //         expiryDate: new Date(Number(p.expiryDate) * 1000),
  //         price: Number(p.price),
  //       }));
  //     } catch (err: any) {
  //       setError(
  //         "Error fetching products: " +
  //           (err?.reason ||
  //             err?.revert?.args?.[0] ||
  //             err?.toString()?.match(/: (.*?)(?=\s*\()/)?.[1] ||
  //             "Unknown error")
  //       );
  //       return [];
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [contract, validateContract]
  // );

  return {
    createBatch,
    getBatchDetails,
    // getAllProductsPerBatch,
    loading,
    error,
  };
};
