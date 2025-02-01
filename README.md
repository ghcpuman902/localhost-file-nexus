# Localhost File Nexus

A lightweight local network file sharing and text sync hub, perfect for cross-platform collaboration and troubleshooting sessions.

## Use Cases

- 🔄 Share files between Windows, macOS, and Linux machines on your local network
- 📋 Sync clipboard content, terminal outputs, and commands across devices
- 🛠️ Perfect for remote troubleshooting sessions where you need to share files and outputs
- 💻 Run on one machine and access from any device's browser using your LAN IP

## Features

- 📤 Quick File Exchange: Upload and download files between devices
- 📋 Real-time Text Sync: Share command outputs, logs, and snippets instantly
- 🔄 Diff Tracking: Copy only the latest changes in synced text
- 🎯 Clean UI: Modern interface with dark/light mode support

## Getting Started

1. Clone the repository and install dependencies:

```bash
pnpm install
# or
yarn install
# or
npm install
```

2.A. Run the development server:
```bash
pnpm run dev
# or
yarn run dev
# or
npm run dev
```

2.B. Alternatively, build and start the production server:
```bash
pnpm run build && pnpm run start
# or
yarn run build && yarn run start
# or
npm run build && npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Real-time**: Server-Sent Events (SSE)
- **File System**: Node.js fs/promises API

## Project Structure

- `/app` - Next.js application routes and API endpoints
- `/components` - Reusable UI components
- `/public/uploads` - Directory for uploaded files
- `/lib` - Utility functions and shared logic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Usage Tips

1. Run the app on your main machine (e.g., macOS)
2. Find your local IP address:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet "
   # On Windows
   ipconfig
   ```
3. Access the app from other devices using:
   ```
   http://[YOUR-LOCAL-IP]:3000
   ```
   you can see this during development in the terminal

## Security Note

This app is designed for local network use only. Do not expose it to the internet without implementing proper security measures.

## GitHub Discoverability

**Search Keywords**:  
🔍 Local network file sharing • Cross-platform collaboration tool • LAN clipboard sync • Intranet file transfer • Real-time text synchronization • Localhost file exchange • Secure LAN sharing • Device-to-device file transfer • Terminal output sharing • Troubleshooting file share

**Key Phrases**:  
- "Share files between Windows macOS Linux on same network"  
- "Sync clipboard content across devices locally"  
- "Local network file sharing without internet"  
- "Real-time terminal output sharing tool"  
- "Cross-platform file transfer over WiFi"  
- "Secure intranet file sharing solution"  
- "Collaborative troubleshooting file exchange"  
- "Lightweight LAN file sharing web app"  
- "Self-hosted alternative to WeTransfer for local network"  
- "Open source local file sync hub"

**Technology Tags**:  
Next.js file sharing • Tailwind CSS UI • shadcn/ui components • SSE real-time updates • Node.js file system API • Local network web app • MIT licensed file share • Geist font interface

**Alternative Naming**:  
LAN File Bridge • Intranet Nexus • LocalSync Hub • Neighborhood File Share • Proximity File Transfer • Nearby File Nexus • Home Network Sync