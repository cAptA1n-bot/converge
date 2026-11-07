const getBaseUrl = () => {
    const raw = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
    ).trim().replace(/\/+$/, "");

    // If the configured URL already ends with /api/v1 (or /api), use as is.
    // Otherwise, append /api/v1 so endpoints like /auth/login route properly.
    if (raw.endsWith("/api/v1")) {
        return raw;
    }
    if (raw.endsWith("/api")) {
        return `${raw}/v1`;
    }
    return `${raw}/api/v1`;
};

const API_URL = getBaseUrl();

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