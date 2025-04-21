"use client";
import Link from "next/link";
import type React from "react";
import type { Set } from "../types";

interface SetListProps {
	sets: Set[];
}

const SetList: React.FC<SetListProps> = ({ sets }) => {
	if (sets.length === 0) {
		return (
			<div className="bg-gray-100 rounded-lg p-8 text-center">
				<p className="text-gray-600">
					No flashcard sets yet. Create your first one!
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
			{sets.map((set) => (
				<div
					key={set.id}
					className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
				>
					<Link href={`/sets/${set.id}`} className="block p-5 h-full">
						<h3 className="text-xl font-medium text-gray-800 mb-2">
							{set.name}
						</h3>
						<span className="text-sm text-gray-500 block">
							Created: {new Date(set.created_at).toLocaleDateString()}
						</span>
					</Link>
				</div>
			))}
		</div>
	);
};

export default SetList;
