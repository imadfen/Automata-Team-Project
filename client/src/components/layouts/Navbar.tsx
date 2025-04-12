import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-8 shadow-sm">
      <div className="text-2xl font-bold text-black font-mono tracking-widest">
        AUTOMATA
      </div>
      <div className="flex items-center gap-4 text-white">
        <Button
          variant="ghost"
          onClick={logout}
          className="text-sm font-medium hover:bg-slate-100"
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
}
