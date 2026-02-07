// middlewares/auth.js
export const protect = async (req, res, next) => {
    try {
        console.log('Protect middleware called');
        console.log('Headers:', req.headers);
        console.log('Authorization header:', req.headers.authorization);
        
        // Clerk Express require auth
        const authResult = await req.auth();
        console.log('Auth result:', authResult);
        
        if (!authResult || !authResult.userId) {
            console.log('No userId found in auth');
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated",
                error: "No user ID found in auth token"
            });
        }
        
        console.log('User authenticated, userId:', authResult.userId);
        next();
    } catch (error) {
        console.error('Auth error in protect middleware:', error);
        console.error('Error stack:', error.stack);
        res.status(401).json({ 
            success: false, 
            message: error.message || "Authentication failed",
            error: error.name 
        });
    }
}