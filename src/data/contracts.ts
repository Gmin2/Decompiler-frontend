export interface Contract {
  name: string;
  size: string;
  bytes: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export const CONTRACTS: Contract[] = [
  { name: 'soroban_hello_world_contract', size: '660B', bytes: 660, complexity: 'simple' },
  { name: 'soroban_increment_contract', size: '682B', bytes: 682, complexity: 'simple' },
  { name: 'soroban_auth_contract', size: '1.1KB', bytes: 1126, complexity: 'simple' },
  { name: 'soroban_errors_contract', size: '794B', bytes: 794, complexity: 'simple' },
  { name: 'soroban_events_contract', size: '977B', bytes: 977, complexity: 'simple' },
  { name: 'soroban_custom_types_contract', size: '1.3KB', bytes: 1331, complexity: 'medium' },
  { name: 'soroban_cross_contract_a_contract', size: '527B', bytes: 527, complexity: 'simple' },
  { name: 'soroban_cross_contract_b_contract', size: '754B', bytes: 754, complexity: 'medium' },
  { name: 'soroban_atomic_swap_contract', size: '1.9KB', bytes: 1945, complexity: 'medium' },
  { name: 'soroban_atomic_multiswap_contract', size: '2.0KB', bytes: 2048, complexity: 'medium' },
  { name: 'soroban_deployer_contract', size: '2.2KB', bytes: 2253, complexity: 'medium' },
  { name: 'soroban_liquidity_pool_contract', size: '10.6KB', bytes: 10854, complexity: 'complex' },
  { name: 'soroban_account_contract', size: '5.4KB', bytes: 5530, complexity: 'complex' },
  { name: 'soroban_bls_signature', size: '2.6KB', bytes: 2662, complexity: 'complex' },
  { name: 'soroban_fuzzing_contract', size: '4.1KB', bytes: 4198, complexity: 'medium' },
  { name: 'soroban_groth16_verifier_contract', size: '5.2KB', bytes: 5325, complexity: 'complex' },
  { name: 'soroban_alloc_contract', size: '2.5KB', bytes: 2560, complexity: 'medium' },
  { name: 'soroban_eth_abi', size: '6.8KB', bytes: 6963, complexity: 'complex' },
  { name: 'privacy_pools', size: '34.8KB', bytes: 35635, complexity: 'complex' },
];

export const NETWORKS = [
  { value: 'testnet', label: 'Testnet', rpc: 'https://soroban-testnet.stellar.org' },
  { value: 'mainnet', label: 'Mainnet', rpc: 'https://soroban-rpc.mainnet.stellar.gateway.fm' },
  { value: 'futurenet', label: 'Futurenet', rpc: 'https://rpc-futurenet.stellar.org' },
];

export const formatName = (name: string) =>
  name.replace(/^soroban_/, '').replace(/_contract$/, '');

export const COMPLEXITY_COLOR = {
  simple: 'text-[var(--color-complexity-simple)]',
  medium: 'text-[var(--color-score-green)]',
  complex: 'text-[var(--color-accent-alt)]',
} as const;

export const GALLERY_SCORES: Record<string, { overall: number; types: number; signatures: number; bodies: number; functions: string[] }> = {
  soroban_hello_world_contract: { overall: 0.97, types: 1.0, signatures: 1.0, bodies: 0.95, functions: ['hello'] },
  soroban_increment_contract: { overall: 0.95, types: 1.0, signatures: 1.0, bodies: 0.92, functions: ['increment', 'get_current_value'] },
  soroban_auth_contract: { overall: 0.93, types: 1.0, signatures: 1.0, bodies: 0.89, functions: ['increment'] },
  soroban_errors_contract: { overall: 0.96, types: 1.0, signatures: 1.0, bodies: 0.94, functions: ['hello'] },
  soroban_events_contract: { overall: 0.94, types: 1.0, signatures: 1.0, bodies: 0.91, functions: ['increment'] },
  soroban_custom_types_contract: { overall: 0.91, types: 0.95, signatures: 1.0, bodies: 0.85, functions: ['set', 'get'] },
  soroban_cross_contract_a_contract: { overall: 0.98, types: 1.0, signatures: 1.0, bodies: 0.97, functions: ['add'] },
  soroban_cross_contract_b_contract: { overall: 0.89, types: 1.0, signatures: 0.95, bodies: 0.82, functions: ['add_with'] },
  soroban_atomic_swap_contract: { overall: 0.86, types: 0.90, signatures: 1.0, bodies: 0.78, functions: ['swap'] },
  soroban_atomic_multiswap_contract: { overall: 0.84, types: 0.90, signatures: 1.0, bodies: 0.75, functions: ['multi_swap'] },
  soroban_deployer_contract: { overall: 0.88, types: 0.95, signatures: 1.0, bodies: 0.80, functions: ['deploy'] },
  soroban_liquidity_pool_contract: { overall: 0.72, types: 0.85, signatures: 0.90, bodies: 0.60, functions: ['deposit', 'swap', 'withdraw', 'get_rsrvs'] },
  soroban_account_contract: { overall: 0.76, types: 0.80, signatures: 0.90, bodies: 0.68, functions: ['init', '__check_auth'] },
  soroban_bls_signature: { overall: 0.74, types: 0.85, signatures: 0.85, bodies: 0.65, functions: ['verify'] },
  soroban_fuzzing_contract: { overall: 0.82, types: 0.90, signatures: 1.0, bodies: 0.73, functions: ['fuzz_target'] },
  soroban_groth16_verifier_contract: { overall: 0.71, types: 0.80, signatures: 0.85, bodies: 0.62, functions: ['verify_proof'] },
  soroban_alloc_contract: { overall: 0.87, types: 0.95, signatures: 1.0, bodies: 0.79, functions: ['alloc_test'] },
  soroban_eth_abi: { overall: 0.69, types: 0.75, signatures: 0.80, bodies: 0.60, functions: ['decode', 'encode'] },
  privacy_pools: { overall: 0.65, types: 0.70, signatures: 0.75, bodies: 0.58, functions: ['deposit', 'withdraw', 'verify'] },
};

export interface Pattern {
  name: string;
  module: string;
  category: string;
  args: string;
  returnType: string;
  sdk: string;
  status: 'handled' | 'partial' | 'unhandled';
}

export const PATTERN_CATEGORIES = ['Storage', 'Authentication', 'Context', 'Collections', 'Types', 'Crypto', 'Ledger', 'Cross-contract'];

export const PATTERNS: Pattern[] = [
  { name: 'get_contract_data', module: 'ledger', category: 'Storage', args: 'Val, StorageType', returnType: 'Val', sdk: 'env.storage().instance().get(&key)', status: 'handled' },
  { name: 'put_contract_data', module: 'ledger', category: 'Storage', args: 'Val, Val, StorageType', returnType: 'Void', sdk: 'env.storage().instance().set(&key, &value)', status: 'handled' },
  { name: 'has_contract_data', module: 'ledger', category: 'Storage', args: 'Val, StorageType', returnType: 'Bool', sdk: 'env.storage().instance().has(&key)', status: 'handled' },
  { name: 'del_contract_data', module: 'ledger', category: 'Storage', args: 'Val, StorageType', returnType: 'Void', sdk: 'env.storage().instance().remove(&key)', status: 'handled' },
  { name: 'require_auth', module: 'auth', category: 'Authentication', args: 'Address', returnType: 'Void', sdk: 'address.require_auth()', status: 'handled' },
  { name: 'require_auth_for_args', module: 'auth', category: 'Authentication', args: 'Address, Vec<Val>', returnType: 'Void', sdk: 'address.require_auth_for_args(args)', status: 'handled' },
  { name: 'get_current_contract_address', module: 'context', category: 'Context', args: '', returnType: 'Address', sdk: 'env.current_contract_address()', status: 'handled' },
  { name: 'contract_event', module: 'events', category: 'Context', args: 'Vec<Val>, Val', returnType: 'Void', sdk: 'env.events().publish(topics, data)', status: 'handled' },
  { name: 'get_ledger_timestamp', module: 'ledger', category: 'Context', args: '', returnType: 'u64', sdk: 'env.ledger().timestamp()', status: 'handled' },
  { name: 'vec_new', module: 'collections', category: 'Collections', args: 'Val', returnType: 'Vec', sdk: 'Vec::new(&env)', status: 'handled' },
  { name: 'vec_push_back', module: 'collections', category: 'Collections', args: 'Vec, Val', returnType: 'Vec', sdk: 'vec.push_back(value)', status: 'handled' },
  { name: 'vec_get', module: 'collections', category: 'Collections', args: 'Vec, u32', returnType: 'Val', sdk: 'vec.get(index)', status: 'handled' },
  { name: 'vec_len', module: 'collections', category: 'Collections', args: 'Vec', returnType: 'u32', sdk: 'vec.len()', status: 'handled' },
  { name: 'map_new', module: 'collections', category: 'Collections', args: '', returnType: 'Map', sdk: 'Map::new(&env)', status: 'handled' },
  { name: 'map_put', module: 'collections', category: 'Collections', args: 'Map, Val, Val', returnType: 'Map', sdk: 'map.set(key, value)', status: 'handled' },
  { name: 'map_get', module: 'collections', category: 'Collections', args: 'Map, Val', returnType: 'Val', sdk: 'map.get(key)', status: 'handled' },
  { name: 'symbol_new_from_linear_memory', module: 'types', category: 'Types', args: 'u32, u32', returnType: 'Symbol', sdk: 'symbol_short!("name")', status: 'handled' },
  { name: 'string_new_from_linear_memory', module: 'types', category: 'Types', args: 'u32, u32', returnType: 'String', sdk: 'String::from_str(&env, "value")', status: 'handled' },
  { name: 'verify_sig_ed25519', module: 'crypto', category: 'Crypto', args: 'BytesN<32>, Bytes, BytesN<64>', returnType: 'Void', sdk: 'env.crypto().ed25519_verify(&pk, &msg, &sig)', status: 'handled' },
  { name: 'bls12_381_g1_add', module: 'crypto', category: 'Crypto', args: 'BytesN<96>, BytesN<96>', returnType: 'BytesN<96>', sdk: 'env.crypto().bls12_381().g1_add(&p1, &p2)', status: 'partial' },
  { name: 'bls12_381_multi_pairing_check', module: 'crypto', category: 'Crypto', args: 'Vec<BytesN<96>>, Vec<BytesN<192>>', returnType: 'Bool', sdk: 'env.crypto().bls12_381().multi_pairing_check(vp1, vp2)', status: 'partial' },
  { name: 'extend_ttl', module: 'ledger', category: 'Ledger', args: 'u32, u32', returnType: 'Void', sdk: 'env.storage().instance().extend_ttl(threshold, extend_to)', status: 'handled' },
  { name: 'get_ledger_sequence', module: 'ledger', category: 'Ledger', args: '', returnType: 'u32', sdk: 'env.ledger().sequence()', status: 'handled' },
  { name: 'call', module: 'cross_contract', category: 'Cross-contract', args: 'Address, Symbol, Vec<Val>', returnType: 'Val', sdk: 'env.invoke_contract(&contract_id, &fn_name, args)', status: 'handled' },
];

