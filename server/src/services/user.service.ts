import prisma from "../config/db"

export const getAllUser = () => {
    return prisma.user.findMany();
}

export const getUserById = (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } });
}

export const updateUser = (userId: string, data: object) => {
    return prisma.user.update({ where: { id: userId }, data })
}

export const deleteUser = (userId: string) => {
    return prisma.user.delete({ where: { id: userId } })
}