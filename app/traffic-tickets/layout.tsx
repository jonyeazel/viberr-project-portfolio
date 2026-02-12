import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("traffic-tickets");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
