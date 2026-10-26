import { Navigate, RouterProvider, createBrowserRouter } from "react-router";
import { RedirectIfAuthed, RequireAuth } from "@/components/auth/route-guards";
import { AppShell } from "@/components/shell/app-shell";
import { ClickMapPage } from "@/pages/click-map-page";
import { InstallationPage } from "@/pages/installation-page";
import { InvitationsPage } from "@/pages/invitations-page";
import { LoginCodePage } from "@/pages/login-code-page";
import { LoginPage } from "@/pages/login-page";
import { OverviewPage } from "@/pages/overview-page";
import { PlaceholderPage } from "@/pages/placeholder-page";
import { RootPage } from "@/pages/root-page";
import { RouteErrorPage } from "@/pages/route-error-page";
import { ScrollMapPage } from "@/pages/scroll-map-page";
import { SessionDetailPage } from "@/pages/session-detail-page";
import { SettingsPage } from "@/pages/settings-page";
import { SessionsPage } from "@/pages/sessions-page";

const router = createBrowserRouter([
  {
    path: "/login",
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: (
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        ),
      },
      {
        path: "code",
        element: (
          <RedirectIfAuthed>
            <LoginCodePage />
          </RedirectIfAuthed>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <RootPage /> },
          { path: "undangan", element: <InvitationsPage /> },
          { path: "p/:projectId", element: <OverviewPage /> },
          { path: "p/:projectId/sessions", element: <SessionsPage /> },
          { path: "p/:projectId/sessions/:sessionId", element: <SessionDetailPage /> },
          { path: "p/:projectId/click-map", element: <ClickMapPage /> },
          { path: "p/:projectId/scroll-map", element: <ScrollMapPage /> },
          { path: "p/:projectId/installation", element: <InstallationPage /> },
          { path: "p/:projectId/settings", element: <SettingsPage /> },
          {
            path: "admin/projects",
            element: (
              <PlaceholderPage
                adminOnly
                title="Semua project"
                summary="Daftar semua project beserta pemilik dan status pemasangan."
                plan={["Tabel standar dengan pencarian", "Batas project global"]}
              />
            ),
          },
          {
            path: "allowlist",
            element: (
              <PlaceholderPage
                adminOnly
                title="Allowlist Email"
                summary="Kelola email yang boleh masuk, peran, dan batas project."
                plan={["Tabel dengan dialog tambah dan ubah", "Konfirmasi hapus dengan status proses"]}
              />
            ),
          },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export { AppRouter };
