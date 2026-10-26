import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PROJECTS } from "@/mock/data";
import { PROJECT_LIMIT, accountFor, seededInvitations, seededProjectIds } from "@/mock/accounts";
import type { Account, Invitation } from "@/mock/accounts";
import type { MockProject } from "@/mock/types";
import { useDemo } from "@/state/demo-context";
import { saveProjectConfig } from "@/state/use-project-config";

type AuthStatus = "loading" | "authenticated" | "guest";
// Alasan terakhir pengguna tidak lagi masuk, dipakai untuk pemberitahuan di layar masuk
type LastExit = "keluar" | "berakhir" | null;

type Workspace = {
  createdProjects: MockProject[];
  acceptedIds: string[];
  handledIds: string[];
  removedIds: string[];
};

type NewProjectInput = { name: string; origin: string };

const SESSION_KEY = "tracer-uiux:auth";
const RESTORE_MS = 500;
const EMPTY_WORKSPACE: Workspace = { createdProjects: [], acceptedIds: [], handledIds: [], removedIds: [] };

function workspaceKey(email: string): string {
  return `tracer-uiux:workspace:${email}`;
}

function readStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    // Penyimpanan bisa kosong atau diblokir, status kembali ke keadaan awal
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Diabaikan: sesi demo hanya kenyamanan
  }
}

function readEmail(): string | null {
  const stored = readStorage(SESSION_KEY);
  if (typeof stored !== "object" || stored === null) return null;
  const email = (stored as { email?: unknown }).email;
  return typeof email === "string" && email !== "" ? email : null;
}

function readWorkspace(email: string): Workspace {
  const stored = readStorage(workspaceKey(email));
  if (typeof stored !== "object" || stored === null) return EMPTY_WORKSPACE;
  return { ...EMPTY_WORKSPACE, ...(stored as Partial<Workspace>) };
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "project" : slug;
}

function hostOf(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

type AuthValue = {
  status: AuthStatus;
  user: Account | null;
  lastExit: LastExit;
  projects: MockProject[];
  invitations: Invitation[];
  // Admin tanpa batas, pengguna lain dibatasi PROJECT_LIMIT
  canCreateProject: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
  expire: () => void;
  createProject: (input: NewProjectInput) => MockProject;
  removeProject: (projectId: string) => void;
  acceptInvitation: (invitationId: string) => Invitation | null;
  declineInvitation: (invitationId: string) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const { setRole } = useDemo();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<Account | null>(null);
  const [lastExit, setLastExit] = useState<LastExit>(null);
  const [workspace, setWorkspace] = useState<Workspace>(EMPTY_WORKSPACE);

  // Memulihkan sesi dibuat tidak instan supaya keadaan "memeriksa sesi" terlihat seperti aslinya
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const email = readEmail();
      if (email === null) {
        setStatus("guest");
        return;
      }
      const account = accountFor(email);
      setUser(account);
      setWorkspace(readWorkspace(account.email));
      setRole(account.role);
      setStatus("authenticated");
    }, RESTORE_MS);
    return () => window.clearTimeout(timer);
  }, [setRole]);

  const signIn = useCallback(
    (email: string) => {
      const account = accountFor(email);
      writeStorage(SESSION_KEY, { email: account.email });
      setUser(account);
      setWorkspace(readWorkspace(account.email));
      setRole(account.role);
      setLastExit(null);
      setStatus("authenticated");
    },
    [setRole],
  );

  const leave = useCallback((reason: Exclude<LastExit, null>) => {
    writeStorage(SESSION_KEY, null);
    setUser(null);
    setWorkspace(EMPTY_WORKSPACE);
    setLastExit(reason);
    setStatus("guest");
  }, []);

  const signOut = useCallback(() => leave("keluar"), [leave]);
  const expire = useCallback(() => leave("berakhir"), [leave]);

  const patchWorkspace = useCallback(
    (update: (current: Workspace) => Workspace) => {
      if (user === null) return;
      const next = update(workspace);
      setWorkspace(next);
      writeStorage(workspaceKey(user.email), next);
    },
    [user, workspace],
  );

  const kind = user?.kind ?? "standar";

  const allInvitations = useMemo(() => seededInvitations(kind), [kind]);

  const invitations = useMemo(
    () => allInvitations.filter((item) => !workspace.handledIds.includes(item.id)),
    [allInvitations, workspace.handledIds],
  );

  const projects = useMemo(() => {
    if (user === null) return [];
    const seededIds = new Set(seededProjectIds(kind, PROJECTS.map((item) => item.id)));
    for (const invitation of allInvitations) {
      if (workspace.acceptedIds.includes(invitation.id)) seededIds.add(invitation.projectId);
    }
    const known = PROJECTS.filter((item) => seededIds.has(item.id));
    return [...known, ...workspace.createdProjects].filter((item) => !workspace.removedIds.includes(item.id));
  }, [user, kind, allInvitations, workspace]);

  const canCreateProject = user?.role === "admin" || projects.length < PROJECT_LIMIT;

  const createProject = useCallback(
    ({ name, origin }: NewProjectInput): MockProject => {
      const suffix = Math.random().toString(36).slice(2, 6);
      const project: MockProject = {
        id: `${slugify(name)}-${suffix}`,
        name,
        siteUrl: hostOf(origin),
        installation: "waiting",
      };
      saveProjectConfig(project.id, {
        name,
        origins: [origin],
        imageOrigins: [],
        members: [
          {
            id: "m-self",
            name: user?.name ?? "Anda",
            email: user?.email ?? "",
            role: "pemilik",
            isPending: false,
          },
        ],
      });
      patchWorkspace((current) => ({ ...current, createdProjects: [...current.createdProjects, project] }));
      return project;
    },
    [user, patchWorkspace],
  );

  const removeProject = useCallback(
    (projectId: string) => {
      patchWorkspace((current) => ({
        ...current,
        createdProjects: current.createdProjects.filter((item) => item.id !== projectId),
        removedIds: [...current.removedIds, projectId],
      }));
    },
    [patchWorkspace],
  );

  const acceptInvitation = useCallback(
    (invitationId: string): Invitation | null => {
      const invitation = allInvitations.find((item) => item.id === invitationId) ?? null;
      if (invitation === null) return null;
      patchWorkspace((current) => ({
        ...current,
        acceptedIds: [...current.acceptedIds, invitationId],
        handledIds: [...current.handledIds, invitationId],
      }));
      setRole("anggota");
      return invitation;
    },
    [allInvitations, patchWorkspace, setRole],
  );

  const declineInvitation = useCallback(
    (invitationId: string) => {
      patchWorkspace((current) => ({ ...current, handledIds: [...current.handledIds, invitationId] }));
    },
    [patchWorkspace],
  );

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      lastExit,
      projects,
      invitations,
      canCreateProject,
      signIn,
      signOut,
      expire,
      createProject,
      removeProject,
      acceptInvitation,
      declineInvitation,
    }),
    [
      status,
      user,
      lastExit,
      projects,
      invitations,
      canCreateProject,
      signIn,
      signOut,
      expire,
      createProject,
      removeProject,
      acceptInvitation,
      declineInvitation,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (context === null) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
export type { AuthStatus, LastExit };
