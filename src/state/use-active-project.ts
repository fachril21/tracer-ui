import { useParams } from "react-router";
import type { InstallationStatus, MockProject } from "@/mock/types";
import { useAuth } from "@/state/auth-context";
import { useDemo } from "@/state/demo-context";

type ActiveProject = {
  project: MockProject | null;
  // Status pemasangan yang tampil, sudah memperhitungkan skenario demo
  installation: InstallationStatus;
};

function useActiveProject(): ActiveProject {
  const { projectId } = useParams();
  const { overviewScenario } = useDemo();
  const { projects } = useAuth();
  const project = projects.find((item) => item.id === projectId) ?? null;
  const installation: InstallationStatus =
    overviewScenario === "menunggu" ? "waiting" : (project?.installation ?? "waiting");
  return { project, installation };
}

export { useActiveProject };
