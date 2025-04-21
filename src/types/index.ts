import type { Tables } from "../../database.types";

export interface Flashcard extends Tables<"cards"> {}

export interface Set extends Tables<"sets"> {}
