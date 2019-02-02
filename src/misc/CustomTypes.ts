import UserDetails from "../security/UserDetails";

export interface Class<T> {
    new (...args: any[]): T,
    length: number,
    name: string,
}

export interface UserProvider extends Function { (username: string): UserDetails };
export const AsyncFunction = (async () => {}).constructor;