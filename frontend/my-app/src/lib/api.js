const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1";

export const api = async (endpoint, options = {}) => {
    const { body, ...rest } = options;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...rest,

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },

        credentials: "include",

        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};