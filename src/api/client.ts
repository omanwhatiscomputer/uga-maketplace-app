import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://10.0.2.2:5274/api",
    headers: {
        "Content-Type": "application/json",
    },
});
