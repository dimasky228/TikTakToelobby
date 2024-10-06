(function() {
    let web3;
    let contract;
    let userAccount;
    let gameActive = false;
    let currentGameId;

    // Глобальные переменные для DOM-элементов
    let statusEl;
    let balanceEl;
    let connectWalletBtn;
    let createGameBtn;
    let gamesList;
    let gameBoard;

    const SONIC_TESTNET_PARAMS = {
        chainId: '0xFAA5',
        chainName: 'Sonic Testnet',
        nativeCurrency: {
            name: 'S',
            symbol: 'S',
            decimals: 18
        },
        rpcUrls: ['https://rpc.testnet.soniclabs.com'],
        blockExplorerUrls: ['https://testnet.soniclabs.com']
    };

    const contractAddress = '0xd29e7889343a9e9261b424444da1e5b397155f89';
    const contractABI = [
        {
            "inputs": [],
            "name": "createGame",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "player1",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "stake",
                    "type": "uint256"
                }
            ],
            "name": "GameCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "winner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "prize",
                    "type": "uint256"
                }
            ],
            "name": "GameFinished",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_gameId",
                    "type": "uint256"
                }
            ],
            "name": "joinGame",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_gameId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "_position",
                    "type": "uint8"
                }
            ],
            "name": "makeMove",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "player",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint8",
                    "name": "position",
                    "type": "uint8"
                }
            ],
            "name": "MoveMade",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "gameId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "player2",
                    "type": "address"
                }
            ],
            "name": "PlayerJoined",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "gameCounter",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "games",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "player1",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "player2",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "currentTurn",
                    "type": "address"
                },
                {
                    "internalType": "bool",
                    "name": "isFinished",
                    "type": "bool"
                },
                {
                    "internalType": "address",
                    "name": "winner",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "stake",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getAvailableGames",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_gameId",
                    "type": "uint256"
                }
            ],
            "name": "getGameState",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "player1",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "player2",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "currentTurn",
                            "type": "address"
                        },
                        {
                            "internalType": "uint8[9]",
                            "name": "board",
                            "type": "uint8[9]"
                        },
                        {
                            "internalType": "bool",
                            "name": "isFinished",
                            "type": "bool"
                        },
                        {
                            "internalType": "address",
                            "name": "winner",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "stake",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct TicTacToe.Game",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    function init() {
        statusEl = document.getElementById('status');
        balanceEl = document.getElementById('balance');
        connectWalletBtn = document.getElementById('connectWallet');
        createGameBtn = document.getElementById('createGame');
        gamesList = document.getElementById('gamesList');
        gameBoard = document.getElementById('gameBoard');

        connectWalletBtn.addEventListener('click', connectWallet);
        createGameBtn.addEventListener('click', createGame);
    }

    function getWeb3Provider() {
        if (typeof window.ethereum !== 'undefined') {
            return window.ethereum;
        } else if (typeof window.web3 !== 'undefined') {
            return window.web3.currentProvider;
        }
        return null;
    }

    async function connectWallet() {
        statusEl.textContent = "Attempting to connect wallet...";
        
        const provider = getWeb3Provider();
        if (provider) {
            try {
                await provider.request({ method: 'eth_requestAccounts' });
                web3 = new Web3(provider);
                const accounts = await web3.eth.getAccounts();
                userAccount = accounts[0];
                
                await switchToSonicTestnet(provider);
                
                contract = new web3.eth.Contract(contractABI, contractAddress);
                
                statusEl.textContent = `Connected: ${userAccount}`;
                connectWalletBtn.disabled = true;
                createGameBtn.disabled = false;

                await updateBalance();
                await getAvailableGames();
                listenToEvents();
            } catch (error) {
                console.error("Error connecting wallet:", error);
                statusEl.textContent = 'Failed to connect wallet: ' + error.message;
            }
        } else {
            statusEl.textContent = "No Web3 provider found. Please install MetaMask.";
        }
    }

    async function switchToSonicTestnet(provider) {
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SONIC_TESTNET_PARAMS.chainId }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [SONIC_TESTNET_PARAMS],
                    });
                } catch (addError) {
                    throw new Error("Failed to add Sonic Testnet: " + addError.message);
                }
            } else {
                throw new Error("Failed to switch to Sonic Testnet: " + switchError.message);
            }
        }
    }

    async function updateBalance() {
        try {
            const balance = await web3.eth.getBalance(userAccount);
            const balanceInS = web3.utils.fromWei(balance, 'ether');
            balanceEl.textContent = `Balance: ${parseFloat(balanceInS).toFixed(4)} S`;
        } catch (error) {
            console.error("Error updating balance:", error);
            balanceEl.textContent = "Error fetching balance";
        }
    }

    async function createGame() {
        try {
            const stake = prompt("Enter stake amount (in S):");
            const stakeInWei = web3.utils.toWei(stake, 'ether');
            await contract.methods.createGame().send({ from: userAccount, value: stakeInWei });
            statusEl.textContent = "Game created successfully!";
            await getAvailableGames();
        } catch (error) {
            console.error("Error creating game:", error);
            statusEl.textContent = 'Failed to create game: ' + error.message;
        }
    }

    async function getAvailableGames() {
        try {
            const games = await contract.methods.getAvailableGames().call();
            gamesList.innerHTML = '<h3>Available Games:</h3>';
            for (let gameId of games) {
                const game = await contract.methods.getGameState(gameId).call();
                const gameElement = document.createElement('div');
                gameElement.innerHTML = `Game ${gameId} - Stake: ${web3.utils.fromWei(game.stake, 'ether')} S 
                                         <button onclick="window.joinGame(${gameId})">Join</button>`;
                gamesList.appendChild(gameElement);
            }
        } catch (error) {
            console.error("Error getting available games:", error);
        }
    }

    async function joinGame(gameId) {
        try {
            const game = await contract.methods.getGameState(gameId).call();
            await contract.methods.joinGame(gameId).send({ from: userAccount, value: game.stake });
            currentGameId = gameId;
            statusEl.textContent = "Joined the game successfully!";
            await updateBoard();
        } catch (error) {
            console.error("Error joining game:", error);
            statusEl.textContent = 'Failed to join game: ' + error.message;
        }
    }

    async function makeMove(position) {
        if (!gameActive) return;
        
        try {
            await contract.methods.makeMove(currentGameId, position).send({ from: userAccount });
            await updateBoard();
        } catch (error) {
            console.error("Error making move:", error);
            statusEl.textContent = 'Failed to make move: ' + error.message;
        }
    }

    async function updateBoard() {
        const game = await contract.methods.getGameState(currentGameId).call();
        const cells = gameBoard.getElementsByClassName('cell');
        for (let i = 0; i < 9; i++) {
            cells[i].textContent = game.board[i] == 1 ? 'X' : game.board[i] == 2 ? 'O' : '';
        }

        if (game.isFinished) {
            gameActive = false;
            statusEl.textContent = game.winner === userAccount ? "You won!" : "You lost!";
        } else {
            gameActive = true;
            statusEl.textContent = game.currentTurn === userAccount ? "Your turn" : "Opponent's turn";
        }
    }

    function listenToEvents() {
        contract.events.GameCreated()
            .on('data', async (event) => {
                console.log("New game created:", event.returnValues);
                await getAvailableGames();
            });

        contract.events.PlayerJoined()
            .on('data', async (event) => {
                console.log("Player joined game:", event.returnValues);
                if (event.returnValues.player2 === userAccount) {
                    currentGameId = event.returnValues.gameId;
                    await updateBoard();
                }
            });

        contract.events.MoveMade()
            .on('data', async (event) => {
                console.log("Move made:", event.returnValues);
                if (event.returnValues.gameId === currentGameId) {
                    await updateBoard();
                }
            });

        contract.events.GameFinished()
            .on('data', async (event) => {
                console.log("Game finished:", event.returnValues);
                if (event.returnValues.gameId === currentGameId) {
                    await updateBoard();
                    await updateBalance();
                }
            });
    }

    // Делаем функцию joinGame доступной глобально
    window.joinGame = joinGame;

    // Инициализация после загрузки DOM
    document.addEventListener('DOMContentLoaded', init);
})();
