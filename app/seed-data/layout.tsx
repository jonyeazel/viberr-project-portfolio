import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("seed-data");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
