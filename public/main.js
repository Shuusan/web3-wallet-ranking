let web3;
let currentAccount;

async function connectWallet() {
    const provider = await detectEthereumProvider();

    if (provider) {
        startApp(provider); // Initialize your app
    } else {
        console.log('Please install MetaMask!');
    }
}

function startApp(provider) {
    if (provider !== window.ethereum) {
        console.error('Do you have multiple wallets installed?');
    }

    web3 = new Web3(provider);

    // Request account access if needed
    provider.request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        });

    // Listen for account changes
    provider.on('accountsChanged', handleAccountsChanged);
    // Listen for chain changes
    provider.on('chainChanged', handleChainChanged);
    // Listen for disconnect
    provider.on('disconnect', handleDisconnect);
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
        currentAccount = null;
        updateUI();
    } else {
        console.log('Connected account:', accounts[0]);
        currentAccount = accounts[0];
        await updateBalances();
        updateUI();
    }
}

function handleChainChanged(chainId) {
    console.log('Chain changed to:', chainId);
    // Reload the page or reinitialize your app
    window.location.reload();
}

function handleDisconnect(error) {
    console.log('MetaMask disconnected:', error);
    currentAccount = null;
    updateUI();
}

function disconnectWallet() {
    currentAccount = null;
    console.log('Disconnected');
    updateUI();
}

async function updateBalances() {
    if (currentAccount) {
        // Fetch ETH balance
        const balanceETH = await web3.eth.getBalance(currentAccount);
        const ethBalance = web3.utils.fromWei(balanceETH, 'ether');
        document.getElementById('balanceETHValue').innerText = ethBalance;
        document.getElementById('balanceETH').style.display = 'block';

        // Switch provider to Sepolia network and fetch balance
        const sepoliaProvider = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${window.infuraProjectId}`));
        const balanceSepolia = await sepoliaProvider.eth.getBalance(currentAccount);
        const sepoliaBalance = sepoliaProvider.utils.fromWei(balanceSepolia, 'ether');
        document.getElementById('balanceSepoliaValue').innerText = sepoliaBalance;
        document.getElementById('balanceSepolia').style.display = 'block';
    } else {
        document.getElementById('balanceETH').style.display = 'none';
        document.getElementById('balanceSepolia').style.display = 'none';
    }
}

function updateUI() {
    if (currentAccount) {
        document.getElementById('connectButton').style.display = 'none';
        document.getElementById('disconnectButton').style.display = 'block';
        document.getElementById('balanceETH').style.display = 'block';
        document.getElementById('balanceSepolia').style.display = 'block';
    } else {
        document.getElementById('connectButton').style.display = 'block';
        document.getElementById('disconnectButton').style.display = 'none';
        document.getElementById('balanceETH').style.display = 'none';
        document.getElementById('balanceSepolia').style.display = 'none';
    }
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('disconnectButton').addEventListener('click', disconnectWallet);

// Initialize UI on page load
updateUI();
