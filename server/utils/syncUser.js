// utils/syncUser.js (backend)
import User from '../models/User.js';

export const syncUserFromClerk = async (clerkUserId) => {
    try {
        console.log('Syncing user from Clerk:', clerkUserId);
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findById(clerkUserId);
        if (existingUser) {
            console.log('User already exists:', existingUser);
            return existingUser;
        }

        // Ici, normalement vous devriez appeler l'API Clerk pour obtenir les détails de l'utilisateur
        // Mais pour l'instant, créons un utilisateur avec des données par défaut
        const tempUser = {
            _id: clerkUserId,
            email: `${clerkUserId}@example.com`,
            username: `user_${Date.now()}`,
            full_name: 'Utilisateur',
            profile_picture: '',
            cover_photo: '',
            bio: '',
            location: '',
            following: [],
            followers: [],
            connections: [],
            created_at: new Date()
        };

        const newUser = await User.create(tempUser);
        console.log('User created:', newUser);
        return newUser;
    } catch (error) {
        console.error('Error syncing user:', error);
        throw error;
    }
};