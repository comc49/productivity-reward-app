const fs = require('fs');

const firebaseConfig = `
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ''}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}',
  },`;

const clientEnv = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || ''}',${firebaseConfig}
  youtubeApiKey: '${process.env.YOUTUBE_API_KEY || ''}',
};
`;

const budgetEnv = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || ''}',${firebaseConfig}
};
`;

fs.writeFileSync('budget-dashboard/src/environments/environment.ts', budgetEnv);
fs.writeFileSync('budget-dashboard/src/environments/environment.prod.ts', budgetEnv);
fs.writeFileSync('productivity-rewards/src/environments/environment.ts', env);
fs.writeFileSync('productivity-rewards/src/environments/environment.prod.ts', env);
console.log('Generated environment files for client and budget-dashboard');
