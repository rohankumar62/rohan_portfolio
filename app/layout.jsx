import './globals.css';
export const metadata = {
  title: 'Rohan Kumar — Full Stack Java Developer',
  description: 'Rohan Kumar: full-stack Java developer. Explore projects, skills, GitHub activity and an interactive 3D studio.',
  icons: {
    icon: '/assets/rohan-portrait.png',
    shortcut: '/assets/rohan-portrait.png',
    apple: '/assets/rohan-portrait.png'
  }
};
export default function RootLayout({children}) {
  return <html lang="en"><body>{children}</body></html>;
}
