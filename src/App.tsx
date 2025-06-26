
import { Toaster as Sonner } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Details from "./pages/Details";
import NotFound from "./pages/NotFound";


const App = () => (
    <TooltipProvider>
      <Sonner />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/details/:category" element={<Details />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
);

export default App;
