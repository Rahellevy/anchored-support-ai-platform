import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getCurrentUser, login, logout} from "../api/auth.ts";
import type {LoginRequest, User} from "../types/auth.ts";


export const authKeys = { me: ["auth", "me"] as const }
export const useAuth = () => {
    const queryClient = useQueryClient();
    
    const { data: user = null, isPending } = useQuery({
       queryKey: authKeys.me,
       queryFn: async () => await getCurrentUser(), // returns User, or null on 401
        staleTime: 5 * 60_000,
        retry: false,
    });
    
    const loginMutation = useMutation({
        mutationFn: ({loginRequest}: {loginRequest: LoginRequest}) => login(loginRequest),
        onSuccess: (data: User) => {
            queryClient.setQueryData(authKeys.me, data);
            console.log("Successfully logged in");
        },
        onError: (error: Error) => {
            console.error(`Error occurred attempting to log in ${error}`)
        }
    });
    
    const logoutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
            queryClient.setQueryData(authKeys.me, null);
            console.log("Successfully logged out");
        },
        onError: (error: Error) => {
            console.error(`Error occurred attempting to log out: ${error}`);
        }
    });
    
    return {
        user,
        isLoading: isPending,
        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        logout: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending
    }
}