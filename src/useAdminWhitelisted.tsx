import { useState, useEffect } from "react";
import { db } from "./firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

export const useIsAdminWhitelisted = (userEmail: string | null | undefined) => {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWhitelist = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "adminWhitelist"),
        where("email", "==", userEmail),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setIsWhitelisted(false);
      } else {
        setIsWhitelisted(true);
      }
      setLoading(false);
    };

    fetchWhitelist();
  }, [userEmail]);

  return { isWhitelisted, loading };
};
