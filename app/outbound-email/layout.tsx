import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("outbound-email");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
