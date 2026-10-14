import '../styles/globals.css';
import Navbar from '../components/Navbar.jsx';

export const metadata = {
  title: 'PayPilot AI - Smart Invoicing & Payments',
  description: 'AI-assisted invoicing and PayPal payment platform for freelancers and small businesses.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-content">
          <div className="container">{children}</div>
        </main>
        <footer className="footer">
          <div className="container">
            PayPilot AI Architecture Foundation • Built for Modular Open-Source Team Collaboration
          </div>
        </footer>
      </body>
    </html>
  );
}
