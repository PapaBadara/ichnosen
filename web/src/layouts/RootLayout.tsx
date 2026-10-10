import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { FilterFab } from "../components/FilterFab";

export function RootLayout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <FilterFab />
    </div>
  );
}
