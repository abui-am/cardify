"use client";

import { useSession } from "@clerk/nextjs";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type SupabaseContext = {
	supabase: SupabaseClient | null;
	isLoaded: boolean;
};

export const SupabaseContext = createContext<SupabaseContext>({
	supabase: null,
	isLoaded: false,
});

export const useSupabase = () => {
	const context = useContext(SupabaseContext);
	if (context === undefined) {
		throw new Error("useSupabase must be used within a SupabaseProvider");
	}
	return {
		supabase: context.supabase,
		isLoaded: context.isLoaded,
	};
};
export const SupabaseProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { session } = useSession();
	const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (!session) {
			setIsLoaded(true);
			return;
		}

		const client = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_KEY!,
			{
				accessToken: () =>
					session?.getToken({
						template: "supabase",
					}),
			},
		);

		setSupabase(client);
		setIsLoaded(true);
	}, [session]);
	return (
		<SupabaseContext.Provider value={{ supabase, isLoaded }}>
			{!isLoaded ? <div className="loading-overlay">Loading...</div> : children}
		</SupabaseContext.Provider>
	);
};
