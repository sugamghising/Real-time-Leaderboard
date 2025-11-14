import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}


export const comparePassword = async (password: string, passwordHash: string): Promise<boolean> => {
    const result = await bcrypt.compare(password, passwordHash);
    return result;
}