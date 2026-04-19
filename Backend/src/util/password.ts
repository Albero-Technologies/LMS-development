import bcrypt from 'bcrypt'
import config from '../config/config'

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, config.BCRYPT_ROUNDS)

export const comparePassword = (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash)

// Simple policy — at least 8 chars, 1 letter, 1 digit.
export const isStrongPassword = (pw: string): boolean => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw)
