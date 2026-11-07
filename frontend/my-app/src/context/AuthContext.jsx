"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore the session when the application loads.
    const refreshUser = useCallback(async () => {
        try {
            const result = await api("/auth/me");
            const currentUser = result?.data?.user || null;

            setUser(currentUser);
            return currentUser;
        } catch {
            // A missing or expired session means the user is logged out.
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Log in and update the shared user state.
    const login = async (credentials) => {
        const result = await api("/auth/login", {
            method: "POST",
            body: credentials,
        });

        const loggedInUser = result?.data?.user;

        if (!loggedInUser) {
            throw new Error("Login succeeded, but user data was not returned.");
        }

        setUser(loggedInUser);
        return loggedInUser;
    };

    // Register and update the shared user state.
    const register = async (userData) => {
        const result = await api("/auth/register", {
            method: "POST",
            body: userData,
        });

        const registeredUser = result?.data?.user;

        if (!registeredUser) {
            throw new Error(
                "Registration succeeded, but user data was not returned."
            );
        }

        setUser(registeredUser);
        return registeredUser;
    };

    // Log out and clear the shared user state.
    const logout = async () => {
        try {
            await api("/auth/logout", {
                method: "POST",
            });
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: Boolean(user),
                login,
                register,
                logout,
                refreshUser,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }

    return context;
}