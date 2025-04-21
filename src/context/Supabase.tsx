"use client";

import useCreateClerkSupabaseClient from "@/hooks/useCreateClerkSupabaseClient";
import { useAuth } from "@clerk/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

export const SupabaseContext = createContext<{
	supabase: SupabaseClient | undefined;
	loading: boolean;
	error: Error | undefined;
}>({
	supabase: undefined,
	loading: false,
	error: undefined,
});

export const SupabaseProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { getToken } = useAuth();

	const [supabase, setSupabase] = useState<SupabaseClient>();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();

	useEffect(() => {
		const fetchTokenAndInitializeClient = async () => {
			try {
				const token = await getToken({ template: "supabase" });
				if (!token) {
					throw new Error("No token found");
				}
				const supabase = useCreateClerkSupabaseClient(token);
				setSupabase(supabase);
			} catch (err) {
				setError(err as any);
			} finally {
				setLoading(false);
			}
		};

		fetchTokenAndInitializeClient();
	}, [getToken]);

	return (
		<SupabaseContext.Provider value={{ supabase, loading, error }}>
			{loading ? <div>Loading...</div> : children}
		</SupabaseContext.Provider>
	);
};
