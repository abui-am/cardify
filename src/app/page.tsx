import { SignedIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
	return <SignedIn>{redirect("/sets")}</SignedIn>;
}
