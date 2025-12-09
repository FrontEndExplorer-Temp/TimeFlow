import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        company: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
            default: 'Wishlist',
        },
        location: {
            type: String,
        },
        link: {
            type: String,
        },
        dateApplied: {
            type: Date,
        },
        notes: {
            type: String,
        },
        skills: [{
            type: String,
        }],
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
