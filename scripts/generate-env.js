const fs = require('fs');

const env = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || ''}',
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ''}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}',
  },
  youtubeApiKey: '${process.env.YOUTUBE_API_KEY || ''}',
};
`;

fs.writeFileSync('productivity-rewards/src/environments/environment.ts', env);
fs.writeFileSync('productivity-rewards/src/environments/environment.prod.ts', env);
console.log('Generated environment.ts');
