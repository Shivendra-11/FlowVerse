const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["easy", "medium", "hard"]
    },
    tags: {
        type: String,
        required: true,
        enum: ["arrays", "strings", "math", "dynamic programming", "graphs", "trees", "sorting", "searching"]
    },

    starterCode: [
        {
            language: {
                type: String,
                required: true,
                enum: ['java', 'c++', 'javascript', 'python', 'perl', 'c']
            },
            InitialCode: {
                type: String,
                required: true,
                default: "//write your code here"
            }
        }
    ],
    referenceCode:[
        {
            language: {
                type: String,
                required: true,
                enum: ['java', 'c++', 'javascript', 'python', 'perl', 'c']
            },
            CompleteCode: {
                type: String,
                required: true,
                default: "//write your code here"
            }
        }
    ],
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            }
        }
    ],
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    problemCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Problem", problemSchema);
