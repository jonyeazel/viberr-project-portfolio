import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("sustainability-review");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
