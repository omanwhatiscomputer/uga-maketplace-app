import React, { createContext, useContext, useState } from "react";

type UserDTO = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    dateJoined: string;
};

type AppUser = UserDTO & { token: string };

type AppContextType = {
    user: AppUser | null;
    setUser: (user: AppUser | null) => void;
    isAuthenticated: boolean;
};

const AppContext = createContext<AppContextType>({
    user: null,
    setUser: () => {},
    isAuthenticated: false,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated: user !== null,
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

export type { AppUser, UserDTO };
