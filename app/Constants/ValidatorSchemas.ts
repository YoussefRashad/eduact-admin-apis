import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { phoneNumberRegEx } from 'App/Constants/Regex'

export const passwordSchema = schema.string({ trim: true }, [rules.minLength(8), rules.maxLength(20)])
export const genderSchema = schema.enum(['male', 'female'])
export const phoneSchema = schema.string({ trim: true }, [rules.regex(phoneNumberRegEx)])
export const uuidSchema = schema.string({ trim: true })
