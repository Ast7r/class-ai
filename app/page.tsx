import StudyView from './StudyView';

export default function Home() {
  // Bypassing the broken route checks to force you directly into your interface
  const mockUser = { id: 'ast7r', name: 'Ast7r' };
  
  // Use your actual Gemini Key here or let your classmates paste theirs via the UI
  const geminiApiKey = process.env.GEMINI_API_KEY || ""; 

  return (
    <main className="min-h-screen bg-[#030712] py-12 selection:bg-indigo-500/30">
      <StudyView apiKey={geminiApiKey} user={mockUser} />
    </main>
  );
}
