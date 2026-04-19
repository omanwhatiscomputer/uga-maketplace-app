import React, { createContext, useContext, useState } from "react";

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    dateJoined: string;
    wishlist: { id: string }[];
    subscriptions: { id: string }[];
};

type AppUser = User & { token: string };

type AppContextType = {
    user: AppUser | null;
    setUser: (user: AppUser | null) => void;
    isAuthenticated: boolean;
    wishlisted: Set<string>;
    setWishlisted: React.Dispatch<React.SetStateAction<Set<string>>>;
    subscribed: Set<string>;
    setSubscribed: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const AppContext = createContext<AppContextType>({
    user: null,
    setUser: () => {},
    isAuthenticated: false,
    wishlisted: new Set(),
    setWishlisted: () => {},
    subscribed: new Set(),
    setSubscribed: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
    const [subscribed, setSubscribed] = useState<Set<string>>(new Set());

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated: user !== null,
                wishlisted,
                setWishlisted,
                subscribed,
                setSubscribed,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}

export type { AppUser, User };
