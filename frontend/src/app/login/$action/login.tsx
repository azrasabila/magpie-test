export const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Login failed");

    return result.token;
};
