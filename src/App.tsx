import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PracticeMainPage } from "./pages/PracticeMainPage";
import { PracticeStartPage } from "./pages/PracticeStartPage";
import { TeigiEditPage } from "./pages/TeigiEditPage";
import { TopPage } from "./pages/TopPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TopPage />} />
        <Route path="practice/start" element={<PracticeStartPage />} />
        <Route path="practice/main" element={<PracticeMainPage />} />
        <Route path="teigi" element={<TeigiEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
