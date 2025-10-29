// Mock video database
const videoDatabase = {
    "earthquake": ["G3hfugS_6vU", "eXyVp3m5jB4"],
    "flood": ["jyQ2At24T5I", "4ACa_g_dAO4"],
    "safety": ["QUcatA-d2yM", "xsc-j8yqK2s"],
    "disaster": ["xsc-j8yqK2s", "LdbS1V8vG5k"]
};

// Export the API object directly
export const api = {
    async registerUser(userInfo) {
        // Mock API call
        return new Promise(resolve => setTimeout(() => resolve({ success: true, userId: `user_${Date.now()}` }), 500));
    },
    async sendSOS(sosData) {
        // Mock API call
        console.log("SOS Data Sent to Server:", sosData);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
    },
    async getAIResponse(query) {
        // Mock AI response
        return new Promise(resolve => {
            setTimeout(() => {
                let responsePoints = ["I provide general safety info. How can I help?"];
                let videoIds = null;
                const lowerInput = query.toLowerCase();

                for (const key in videoDatabase) {
                    if (lowerInput.includes(key)) {
                        videoIds = videoDatabase[key];
                        break;
                    }
                }
                if (lowerInput.includes("shelter")) {
                    responsePoints = ["Emergency shelters are at Green Park Stadium and Kanpur University."];
                }
                resolve({ success: true, text: responsePoints, videos: videoIds });
            }, 1000);
        });
    },
    async saveContacts(userId, contacts) {
        // Mock API call
        console.log(`Saving contacts for ${userId}:`, contacts);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400));
    }
};