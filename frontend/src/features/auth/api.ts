import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authApi = {
    async getProfiles(): Promise<UserProfile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateProfile(id: string, updates: Partial<UserProfile>): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    },

    async createUser(payload: { email: string; password: string; full_name: string; role: UserRole }): Promise<any> {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Error creating user');
        }
        return response.json();
    },

    async deleteUser(userId: string): Promise<void> {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Error deleting user');
        }
    }
};
