export type UserRole = 'owner' | 'psychologist' | 'assistant';

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    role: UserRole;
}
