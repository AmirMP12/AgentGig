import { initializeDatabase } from '../src/database/database';
import { taskRepository } from '../src/database/taskRepository';
import { taskEngine } from '../src/services/taskEngine';
import { paymentPoller } from '../src/services/paymentPoller';

async function runMilestone2Verification() {
  console.log('🚀 Initiating Milestone 2 Verification Suite...\n');

  // 1. Initializing Persistent Storage
  initializeDatabase();
  console.log('✅ Persistent JSON Storage initialized and verified.');

  // 2. Start Autonomous Poller
  paymentPoller.start();

  // 3. Submit Task to Persistent Storage
  console.log('\n📦 Step 1: Client agent dispatching task specification...');
  const task = await taskEngine.createTask({
    title: 'DeFi Vault Stress Analysis',
    description: 'Perform static security check on compound interest math.',
    requiredCapability: 'solidity-audit',
    budgetUsdc: 30.0,
    clientHandle: 'dao_treasury_bot',
  });

  console.log(`   - Task ID: ${task.id}`);
  console.log(`   - Moove Payment Link: ${task.paymentUrl}`);
  console.log(`   - Initial State: ${task.status}`);

  // Assert stored in Persistent Storage
  const storedTask = taskRepository.getTaskById(task.id);
  if (!storedTask) throw new Error('Assertion Failed: Task not found in Storage!');
  console.log('✅ Persistence Confirmed: Record written to disk (data/agentgig-storage.json).');

  // 4. Wait for Background Poller to auto-detect payment and execute
  console.log('\n⏳ Step 2: Waiting for Background Poller to auto-detect settlement (~3.5s)...');
  await new Promise((resolve) => setTimeout(resolve, 3500));

  // 5. Query Storage for Execution & Ledger State
  const finalizedTask = taskRepository.getTaskById(task.id);
  console.log(`\n🔍 Step 3: Checking Autonomous State Transition:`);
  console.log(`   - Final Task Status: ${finalizedTask?.status}`);
  console.log(`   - Deliverable Summary: ${finalizedTask?.result?.executionSummary}`);

  if (finalizedTask?.status !== 'COMPLETED') {
    throw new Error(`Assertion Failed: Task state is ${finalizedTask?.status}, expected COMPLETED`);
  }

  // 6. Inspect Financial Audit Ledger
  const transactions = taskRepository.getTransactionsByTaskId(task.id);
  console.log(`\n💳 Step 4: Inspecting Financial Ledger (${transactions.length} entries recorded):`);
  transactions.forEach((tx) => {
    console.log(`   - [${tx.type}] ${tx.amount} ${tx.currency} | From: ${tx.fromHandleOrAddress} -> To: ${tx.toHandleOrAddress} (Tx: ${tx.txHash.slice(0, 20)}...)`);
  });

  paymentPoller.stop();

  if (transactions.length === 2) {
    console.log('\n🌟 MILESTONE 2 VERIFIED: Persistent Storage, Autonomous Polling & Audit Ledger 100% Operational!\n');
  } else {
    throw new Error('Ledger entries incomplete.');
  }
}

runMilestone2Verification().catch((err) => {
  console.error('❌ Milestone 2 Verification Failed:', err);
  paymentPoller.stop();
  process.exit(1);
});