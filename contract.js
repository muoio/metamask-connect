const onboardButton = document.getElementById('connectWallet');
const sendEthButton = document.querySelector('#send');
const amount_to_send = document.getElementById("amount");
const balance = document.getElementById("balance");
const disconect  = document.getElementById("disconect");

window.addEventListener('DOMContentLoaded', MetaMaskClientCheck)



async function MetaMaskClientCheck() {

	if (!isMetaMaskInstalled()) 
		onboardButton.innerText = 'Please install MetaMask!';
	else {
		ethereum.on('chainChanged', handleNewChain);
		ethereum.on('networkChanged', handleNewNetwork);
		ethereum.on('accountsChanged', handleNewAccounts);

		let isConnected = await isMetaMaskConnected();
		if (isConnected) {
			if (localStorage.getItem('displayConnect') == 'display'){
				await display_account();	
			}
			else hide_account();
		}
		else{
			onboardButton.innerText = 'Connect';
			onboardButton.onclick = onClickConnect;
			onboardButton.disabled = false;			

		}
	}
}
disconect.addEventListener('click', async function() {
	localStorage.setItem('displayConnect', 'hide');
	hide_account();
});

function hide_account(){
	onboardButton.innerText = 'Connect';
	balance.innerText = '';
	disconect.style.display = 'none';
	onboardButton.disabled = false;		
	sendEthButton.style.display  = 'none';
	amount_to_send.style.display = 'none';
	onboardButton.onclick = function(){
		localStorage.setItem('displayConnect', 'display');
		display_account();
	}
}

async function display_account(){
	onboardButton.innerText = ethereum.selectedAddress;
	balance.innerText = await get_balance();
	disconect.style.display = 'block';
	onboardButton.disabled = true;			
	sendEthButton.style.display  = 'inline-block';
	amount_to_send.style.display = 'inline-block';
}

function isMetaMaskInstalled(){
	//Have to check the ethereum binding on the window object to see if it's installed
	try{
		const { ethereum } = window;
		return Boolean(ethereum && ethereum.isMetaMask);
	}catch{
		return false;
	}

};
async function isMetaMaskConnected(){
	let address_arr = await ethereum.request({method:'eth_accounts'});
	return address_arr.length > 0;
}


async function onClickConnect(){
	try {
		await ethereum.request({ method: 'eth_requestAccounts',
		params: [
		  {
			eth_accounts: {}
		  }
		]});		
	}catch (error) {
		console.error(error);
	}
}
//Sending Ethereum to an address
sendEthButton.addEventListener('click', () => {
	let amount_send = parseFloat(amount_to_send.value);
	send(amount_send,'0xF800AE8AD7CD99F2E5d4ECd4f592771d28450A61');
});

function get_balance(){
	return ethereum
	.request({
		method: 'eth_getBalance',
		params: [
			window.ethereum.selectedAddress,
			'latest'
		]
		}).then(hex => parseInt(hex,16)*(1e-18));
}

function send(amount, receive_address){
	function toHex(d) {
		return  Number(d).toString(16);
	}
	ethereum
	.request({
		method: 'eth_sendTransaction',
		params: [
		{
			from: window.ethereum.selectedAddress,
			to: receive_address,
			value: toHex(1000000000000000000*amount),
			gas: toHex(30400),
		},
		],
	})
	.then((txHash) => console.log(txHash))
	.catch((error) => console.log(error));
}






async function handleNewAccounts (newAccounts) {
	if (newAccounts.length == 0) {
		balance.innerText = '';
		MetaMaskClientCheck();
		disconect.style.display = 'none';
	}
	else{
		onboardButton.innerText = ethereum.selectedAddress;
		balance.innerText = await get_balance();
		disconect.style.display = 'block';
		onboardButton.disabled = true;		
	}
}
function handleNewChain(newChainId) {
	chainId = newChainId;
}
async function check_network(){
    let networkId = await ethereum.request({
      method: 'net_version',
    });
	if (networkId != 56){
		ask_to_change_network();
		return false;
	}
	return true;
}

async function ask_to_change_network(){
	try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
				chainId: '0x38',
				chainName: 'Binance Smart Chain',
				nativeCurrency: {
					name: 'Binance Coin',
					symbol: 'BNB',
					decimals: 18
				},
				rpcUrls: ['https://bsc-dataseed.binance.org/'],
				blockExplorerUrls: ['https://bscscan.com']
				}],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
}

function handleNewNetwork(networkdId){
	if (networkdId != 56){
		ask_to_change_network();
		return false;
	}
	return true;
}
