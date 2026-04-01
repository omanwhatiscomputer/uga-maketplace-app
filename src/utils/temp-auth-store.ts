// Holds the Google idToken in memory during the sign-up flow.
// Avoids passing a long JWT string through route params.
let pendingIdToken: string | null = null;

export const setPendingIdToken = (token: string) => {
    pendingIdToken = token;
};

export const getPendingIdToken = () => pendingIdToken;

export const clearPendingIdToken = () => {
    pendingIdToken = null;
};
