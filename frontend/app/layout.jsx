import './globals.css';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import { AppProvider } from '../src/context/AppContext';
import { ThemeProvider } from "../src/theme-provider"

export const metadata = {
  title: 'MediVision AI',
  description: 'Medical image analysis and reporting',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AppProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
