import { AppRouter } from "@/app-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/state/auth-context";
import { DemoProvider } from "@/state/demo-context";

function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={300}>
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </DemoProvider>
  );
}

export default App;
