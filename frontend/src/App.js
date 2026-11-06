import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { AegisProvider } from "@/context/AegisContext";
import Landing from "@/pages/Landing";
import AppShell from "@/components/AppShell";
import Console from "@/pages/Console";
import Policy from "@/pages/Policy";
import Audit from "@/pages/Audit";
import Identity from "@/pages/Identity";

const Routed = () => {
  const location = useLocation();
  const top = location.pathname.startsWith("/app") ? "app" : "site";
  return (
    <AnimatePresence mode="wait">
      <motion.div key={top} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }} transition={{ duration: 0.5 }}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Console />} />
            <Route path="policy" element={<Policy />} />
            <Route path="audit" element={<Audit />} />
            <Route path="identity" element={<Identity />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AegisProvider>
      <BrowserRouter>
        <Routed />
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: "rgba(10,13,26,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", color: "#E2E8F0" } }} />
    </AegisProvider>
  );
}
