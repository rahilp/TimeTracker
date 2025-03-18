# TimeTracker

A modern web application for tracking time spent on work projects. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🕒 Real-time time tracking
- 📱 Responsive design for desktop and mobile
- 📊 Project management
- 📁 Project categorization
- 📈 Weekly time export
- 🎨 Modern and sleek UI

## Architecture

The application is built using:

- **Frontend Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **State Management**: React Context API
- **Data Storage**: Local storage for offline capability
- **Data Export**: CSV format for weekly reports

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # Reusable UI components
├── contexts/        # React Context providers
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
