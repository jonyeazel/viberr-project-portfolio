import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("donation-workflow");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
