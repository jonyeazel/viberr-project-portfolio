import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("time-tracking");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
