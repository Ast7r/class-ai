import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata = {
  title: 'Class AI Study Assistant',
  description: 'Classroom Textbook & Math AI Helper',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">{children}</body>
    </html>
  );
}
