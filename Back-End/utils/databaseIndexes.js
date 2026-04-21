const User = require('../model/userModel');
// const PasswordResetToken = require('../models/PasswordResetToken');

// Ensure all indexes are created
const createIndexes = async () => {
    try {
        console.log('Creating database indexes...');

        // Create User indexes
        await User.createIndexes();
        console.log('✅ User indexes created');

        // Create PasswordResetToken indexes
        // await PasswordResetToken.createIndexes();
        // console.log('✅ PasswordResetToken indexes created');

        console.log('🚀 All database indexes created successfully');
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
    }
};

// Function to check existing indexes
const checkIndexes = async () => {
    try {
        console.log('Checking existing indexes...');

        const userIndexes = await User.collection.getIndexes();
        console.log('User indexes:', Object.keys(userIndexes));

        const tokenIndexes = await PasswordResetToken.collection.getIndexes();
        console.log('PasswordResetToken indexes:', Object.keys(tokenIndexes));

        return { userIndexes, tokenIndexes };
    } catch (error) {
        console.error('Error checking indexes:', error);
        return null;
    }
};

module.exports = { createIndexes, checkIndexes };
