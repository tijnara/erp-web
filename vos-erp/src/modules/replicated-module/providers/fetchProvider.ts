import { apiUrl } from "@/config/api";

export function fetchProvider() {
    const apiUrlBase = apiUrl("replicated");

    async function fetchReplicated(page: number) {
        const response = await fetch(`${apiUrlBase}?page=${page}&limit=20`);
        if (!response.ok) {
            throw new Error("Failed to fetch replicated data");
        }
        return response.json();
    }

    async function registerReplicated(data: any) {
        const response = await fetch(apiUrlBase, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to register replicated data");
        }
    }

    return { fetchReplicated, registerReplicated };
}
