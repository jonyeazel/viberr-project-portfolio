import { getProjectMetadata } from "../project-metadata";

export const metadata = getProjectMetadata("voucher-fulfillment");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
