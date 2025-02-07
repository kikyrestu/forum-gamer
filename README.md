# 🎮 Forum Gamer

Forum chat realtime untuk komunitas gamers Indonesia dengan fitur role-based matchmaking dan live chat.

![Forum Gamer Preview](preview.png)

## 🌟 Fitur Utama

### 🔐 Sistem Autentikasi
- Login dengan Google
- Mode Guest dengan custom username
- Persistent user preferences
- Profile management

### 💬 Live Chat
- Real-time messaging
- Role & rank display
- Game-specific badges
- Online status indicators
- Emoji support
- Message timestamps

### 🎯 Game Preferences
- Support multiple games:
  - Valorant (Duelist, Controller, dll)
  - Mobile Legends (Tank, Marksman, dll)
  - Genshin Impact (DPS, Support, dll)
- Custom roles per game
- Rank selection
- Editable game preferences

### 🎨 Modern UI/UX
- Gaming-inspired design
- Responsive layout
- Interactive animations
- Loading states & spinners
- Error handling
- Toast notifications
- Modal dialogs

## 🚀 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React Hooks
- TailwindCSS
- Date-fns

### Backend & Services
- Firebase Authentication
- Cloud Firestore
- Real-time Listeners

### State Management
- React Context
- Custom Hooks

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn
- Firebase account
- Git

### Installation

1. Clone repository
```bash
git clone https://github.com/username/forum-gamer.git
cd forum-gamer
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
```

4. Update `.env.local` dengan credentials Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

5. Run development server
```bash
npm run dev
```

## 🔒 Firebase Configuration

### Authentication Setup
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication methods:
   - Google Sign-in
   - Anonymous Authentication

### Firestore Setup
1. Create Firestore database
2. Setup security rules:

```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read
    match /{document=**} {
      allow read: if request.auth != null;
    }

    // Users collection
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Messages collection
    match /messages/{messageId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 📁 Project Structure

```
forum-gamer/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── LoadingSpinner.js
│   │   ├── ProfileModal.js
│   │   ├── SignInModal.js
│   │   └── Toast.js
│   └── lib/                 # Utilities & hooks
│       ├── firebase.js
│       ├── AuthContext.js
│       ├── useChat.js
│       └── useOnlineUsers.js
├── public/                  # Static files
└── ...config files
```

## 🌐 Deployment

### Vercel Deployment
1. Push ke GitHub repository
2. Connect repository di [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Post-deployment
1. Add Vercel domain ke Firebase Auth authorized domains
2. Test semua fitur di production
3. Setup monitoring

## 🐛 Troubleshooting

### Common Issues
1. Firebase permissions error
   - Check Firestore rules
   - Verify auth state
   - Check environment variables

2. Real-time updates not working
   - Check Firebase connection
   - Verify Firestore listeners
   - Check browser console

3. Auth errors
   - Verify Firebase config
   - Check authorized domains
   - Clear browser cache

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Workflow
1. Fork repository
2. Create feature branch
3. Commit changes
4. Open pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- [@kikyrestu](https://github.com/kikyrestu) - Initial work & maintenance

## 🙏 Acknowledgments

- Next.js team
- Firebase team
- TailwindCSS community
- All contributors
