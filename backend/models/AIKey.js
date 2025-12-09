import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const aiKeySchema = mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            // We'll handle encryption manually in controller or pre-save if needed, 
            // but for now let's just use the utils explicitly in the service layer 
            // to avoid mongoose middleware complexity if we want to query by raw key (which we shouldn't do anyway).
            // Actually, let's encrypt on save for safety.
        },
        label: {
            type: String, // e.g. "Personal Key", "Pro Account"
            required: true,
        },
        provider: {
            type: String,
            default: 'google',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isGlobal: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ['active', 'quota_exceeded', 'revoked', 'rate_limited', 'testing'],
            default: 'testing',
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        lastUsedAt: {
            type: Date,
        },
        errorCount: {
            type: Number,
            default: 0,
        },
        lastError: {
            type: String,
        },
        resetAt: {
            type: Date, // When the quota is expected to reset
        }
    },
    {
        timestamps: true,
    }
);

// Encrypt key before saving
aiKeySchema.pre('save', function (next) {
    if (this.isModified('key')) {
        this.key = encrypt(this.key);
    }
    next();
});

// Decrypt helper method
aiKeySchema.methods.getDecryptedKey = function () {
    return decrypt(this.key);
};

const AIKey = mongoose.model('AIKey', aiKeySchema);

export default AIKey;
