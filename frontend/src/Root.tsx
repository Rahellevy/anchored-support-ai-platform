import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { App } from './App'
import {AxiosError} from "axios";
import {authKeys} from "./hooks/useAuth.ts";

/**
 * App-wide providers. Anything every page needs access to is wrapped here:
 *  - BrowserRouter: URL-based navigation (react-router)
 *  - AuthProvider:  who is signed in (read it anywhere with useAuthData())
 *
 * Routes themselves live in App.tsx.
 */

const queryClient = new QueryClient({
    
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof AxiosError && error.status === 401){
                queryClient.setQueryData(authKeys.me, null);
            }
        }
    })
})

export function Root() {
    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </StrictMode>
    )
}
