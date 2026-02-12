import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("mental-health");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
