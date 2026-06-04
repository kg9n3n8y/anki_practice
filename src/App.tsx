import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PracticeMainPage } from "./pages/PracticeMainPage";
import { PracticeStartPage } from "./pages/PracticeStartPage";
import { PositionEditPage } from "./pages/PositionEditPage";
import { TopPage } from "./pages/TopPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TopPage />} />
        <Route path="practice/start" element={<PracticeStartPage />} />
        <Route path="practice/main" element={<PracticeMainPage />} />
        <Route path="position" element={<PositionEditPage />} />
        <Route path="teigi" element={<Navigate to="/position" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
