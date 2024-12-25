import { Types } from "mongoose";

// types/user.d.ts
export interface User {
    userId: Types.ObjectId;
    username: string;
    email: string;

}
