import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("collectables");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
