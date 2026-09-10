import { initializeDatabase } from '../src/database/database';
import { agentRegistry } from '../src/services/agentRegistry';
import { taskEngine } from '../src/services/taskEngine';
import { paymentPoller } from '../src/services/paymentPoller';
import { taskRepository } from '../src/database/taskRepository';

async function runMilestone3Verification() {
  console.log('🚀 Initiating Milestone 3 Verification (Ecosystem & SDK Onboarding)...\n');

  initializeDatabase();
  paymentPoller.start();

  // 1. Onboard a 3rd-party developer agent
  console.log('🤖 Step 1: Onboarding 3rd-Party Agent: "NeuralTranslate AI"...');
  const externalWorker = agentRegistry.registerThirdPartyWorker({
    name: 'NeuralTranslate-AI',
    capability: 'code-translation',
    mooveHandle: 'neural_trans',
  });
  console.log(`✅ Worker Registered Successfully: ${externalWorker.name} (@${externalWorker.mooveHandle})`);

  // 2. Submit task requiring the new capability
  console.log('\n📦 Step 2: Creating task requiring new 3rd-party capability: "code-translation"...');
  const task = await taskEngine.createTask({
    title: 'Solidity to Rust Anchor Transpilation',
    description: 'Transpile Uniswap V2 pair logic into Solana Anchor framework.',
    requiredCapability: 'code-translation' as any,
    budgetUsdc: 45.0,
    clientHandle: 'cross_chain_bot',
  });

  console.log(`✅ Task Dispatched: ID ${task.id} -> Assigned to Worker: ${task.assignedWorkerId}`);

  // 3. Wait for Background Poller to complete execution
  console.log('\n⏳ Step 3: Waiting for Autonomous Settlement & Execution (~3.5s)...');
  await new Promise((resolve) => setTimeout(resolve, 3500));

  // 4. Verify results
  const finalized = taskRepository.getTaskById(task.id);
  console.log('\n🔍 Step 4: Verifying Execution Outcome:');
  console.log(`   - Status: ${finalized?.status}`);
  console.log(`   - Deliverable: ${finalized?.result?.executionSummary}`);
  console.log(`   - Settled Payout To: ${finalized?.payoutReceipt?.recipientHandle}`);

  paymentPoller.stop();

  if (finalized?.status === 'COMPLETED' && finalized?.payoutReceipt?.recipientHandle === '@neural_trans') {
    console.log('\n🌟 MILESTONE 3 VERIFIED: 3rd-Party Agent Ecosystem & Dynamic Settlement 100% Operational!\n');
  } else {
    throw new Error('Milestone 3 verification failed.');
  }
}

runMilestone3Verification().catch((err) => {
  console.error('❌ M3 Verification Error:', err);
  paymentPoller.stop();
  process.exit(1);
});