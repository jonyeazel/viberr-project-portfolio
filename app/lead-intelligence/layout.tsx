import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("lead-intelligence");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
