import UserDetails from "../security/UserDetails";

export interface Class<T> extends Function { new (...args: any[]): T; }
export interface UserProvider extends Function { (username: string): UserDetails };