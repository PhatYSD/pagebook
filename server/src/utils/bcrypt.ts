import bcrypt, { genSalt } from "bcryptjs";

export async function hash(password: string): Promise<string> {
    const salt = await genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    return hashPassword;
}

export async function compare(password: string, hashPassword: string): Promise<boolean> {
    const result = await bcrypt.compare(password, hashPassword);

    return result;
}