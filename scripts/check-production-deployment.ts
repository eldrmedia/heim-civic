import { verifyProductionDeployment } from "../src/domain/operations/deployment-verification";

const deploymentUrl = process.env.DEPLOYMENT_CHECK_URL ?? "";
const report = await verifyProductionDeployment({ deploymentUrl });

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (report.status !== "ready") process.exitCode = 1;
