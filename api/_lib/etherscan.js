const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_API_BASE = process.env.ETHERSCAN_API_BASE || 'https://api.etherscan.io/api';

if (!ETHERSCAN_API_KEY) {
  console.warn('ETHERSCAN_API_KEY is not set; token lookups will fail.');
}

async function callEtherscan(params) {
  const searchParams = new URLSearchParams({ ...params, apikey: ETHERSCAN_API_KEY ?? '' });
  const response = await fetch(`${ETHERSCAN_API_BASE}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Etherscan HTTP ${response.status}`);
  }
  const json = await response.json();
  if (json.status !== '1') {
    const message = json.message || 'Unknown Etherscan error';
    throw new Error(`Etherscan error: ${message}`);
  }
  return json.result;
}

export async function getTokenSupply(contractAddress) {
  return callEtherscan({
    module: 'stats',
    action: 'tokensupply',
    contractaddress: contractAddress,
  });
}

export async function getTokenInfo(contractAddress) {
  return callEtherscan({
    module: 'token',
    action: 'tokeninfo',
    contractaddress: contractAddress,
  });
}

export async function getTokenHolderList(contractAddress, page = 1, offset = 50) {
  return callEtherscan({
    module: 'token',
    action: 'tokenholderlist',
    contractaddress: contractAddress,
    page,
    offset,
  });
}

export async function resolveAddressFromSymbol(symbol) {
  try {
    const matches = await callEtherscan({
      module: 'account',
      action: 'addresstokenbalance',
      address: symbol,
    });
    return matches;
  } catch (error) {
    throw new Error('Resolving symbols is not supported via this endpoint.');
  }
}
