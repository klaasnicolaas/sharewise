import { SharewiseDashboard } from "@/components/dashboard/sharewise-dashboard";
import { STEP_IDS, type StepId } from "@/lib/dashboard-types";

function isStepId(value: string | string[] | undefined): value is StepId {
  return typeof value === "string" && STEP_IDS.includes(value as StepId);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialStep = isStepId(resolvedSearchParams.step)
    ? resolvedSearchParams.step
    : "participants";

  return <SharewiseDashboard initialStep={initialStep} />;
}
