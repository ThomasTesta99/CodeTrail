import { MIN_PASSWORD_LENGTH } from "@/constants";
import { z } from "zod";

export const passwordSchema = z
    .string()
    .min(
        MIN_PASSWORD_LENGTH, 
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    )