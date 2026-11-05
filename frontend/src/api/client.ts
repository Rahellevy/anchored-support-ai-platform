import axios from "axios"

export const httpClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
    timeout: 15 * 1000,
})

httpClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401){
            console.error(`Unauthorized: ${error.response?.status}`)
        }
        if (error.response?.status === 404){
            console.error(`Not Found: ${error.response?.status}`)
        }
        return Promise.reject(error);
    }
)