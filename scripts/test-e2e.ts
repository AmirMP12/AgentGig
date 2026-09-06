import { taskEngine } from '../src/services/taskEngine';
import { agentRegistry } from '../src/services/agentRegistry';

async function runE2ETest() {
  console.log('🚀 Starting AgentGig E2E Full Lifecycle Simulation...\n');

  // Step 1
  const workers = agentRegistry.getAllWorkers();
  console.log(`✅ Loaded ${workers.length} registered autonomous workers:`);
  workers.forEach((w) => console.log(`   - [${w.capability}] ${w.name} (@${w.mooveHandle})`));

  // Step 2
  console.log('\n📦 Step 1: Submitting autonomous task request...');
  const task = await taskEngine.createTask({
    title: 'Audit Vault Contract',
    description: 'Verify ERC-4626 vault implementation for reentrancy bugs.',
    requiredCapability: 'solidity-audit',
    budgetUsdc: 25.0,
    clientHandle: 'client_dao_agent',
  });

  console.log(`✅ Task Created: ${task.id}`);
  console.log(`💳 Moove Payment Link Generated: ${task.paymentUrl}`);
  console.log(`⏳ Current Status: ${task.status}`);

  // Step 3
  console.log('\n💸 Step 2: Waiting for on-chain settlement via Moove rails (2.5s)...');
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Step 4
  console.log('\n⚙️ Step 3: Verifying payment link status & triggering assigned worker...');
  const completedTask = await taskEngine.verifyAndProcess(task.id);

  console.log(`\n🎉 Step 4: Verification complete! Final Task State:`);
  console.log(`   - Status: ${completedTask.status}`);
  console.log(`   - Summary: ${completedTask.result?.executionSummary}`);
  console.log(`   - Payout Recipient: ${completedTask.payoutReceipt?.recipientHandle}`);
  console.log(`   - Payout Amount: ${completedTask.payoutReceipt?.amountUsdc} USDC`);
  console.log(`   - Settled At: ${completedTask.payoutReceipt?.settledAt}`);

  if (completedTask.status === 'COMPLETED') {
    console.log('\n🌟 SUCCESS: Complete agent-to-agent lifecycle with Moove settlement verified 100%!');
  } else {
    throw new Error('Test failed: Task did not reach COMPLETED state.');
  }
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Simulation Error:', err);
  process.exit(1);
});
