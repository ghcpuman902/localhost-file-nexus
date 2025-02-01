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
npm install
# or
yarn install
# or
pnpm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
BASE_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
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

## Security Note

This app is designed for local network use only. Do not expose it to the internet without implementing proper security measures.

------------------
additional info:

remember to change file limit in next.config.ts
```
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
```

and update the base url in .env
```
BASE_URL=http://localhost:3000
```