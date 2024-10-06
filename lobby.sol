// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract TicTacToe {
    struct Game {
        address player1;
        address player2;
        address currentTurn;
        uint8[9] board;
        bool isFinished;
        address winner;
        uint256 stake;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameCounter;

    event GameCreated(uint256 gameId, address player1, uint256 stake);
    event PlayerJoined(uint256 gameId, address player2);
    event MoveMade(uint256 gameId, address player, uint8 position);
    event GameFinished(uint256 gameId, address winner, uint256 prize);

    function createGame() external payable {
        require(msg.value > 0, "Stake must be greater than 0");
        gameCounter++;
        games[gameCounter] = Game({
            player1: msg.sender,
            player2: address(0),
            currentTurn: address(0),
            board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            isFinished: false,
            winner: address(0),
            stake: msg.value
        });
        emit GameCreated(gameCounter, msg.sender, msg.value);
    }

    function joinGame(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game is full");
        require(msg.sender != game.player1, "You can't join your own game");
        require(msg.value == game.stake, "You must match the stake");

        game.player2 = msg.sender;
        game.currentTurn = game.player1;
        emit PlayerJoined(_gameId, msg.sender);
    }

    function makeMove(uint256 _gameId, uint8 _position) external {
        Game storage game = games[_gameId];
        require(!game.isFinished, "Game is finished");
        require(msg.sender == game.currentTurn, "It's not your turn");
        require(_position < 9, "Invalid position");
        require(game.board[_position] == 0, "Position already occupied");

        uint8 symbol = (msg.sender == game.player1) ? 1 : 2;
        game.board[_position] = symbol;
        emit MoveMade(_gameId, msg.sender, _position);

        if (checkWin(game.board, symbol)) {
            game.isFinished = true;
            game.winner = msg.sender;
            uint256 prize = game.stake * 2;
            payable(msg.sender).transfer(prize);
            emit GameFinished(_gameId, msg.sender, prize);
        } else if (checkDraw(game.board)) {
            game.isFinished = true;
            uint256 refund = game.stake;
            payable(game.player1).transfer(refund);
            payable(game.player2).transfer(refund);
            emit GameFinished(_gameId, address(0), 0);
        } else {
            game.currentTurn = (game.currentTurn == game.player1) ? game.player2 : game.player1;
        }
    }

    function checkWin(uint8[9] memory board, uint8 symbol) internal pure returns (bool) {
        uint8[3][8] memory winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (uint i = 0; i < 8; i++) {
            if (board[winPatterns[i][0]] == symbol &&
                board[winPatterns[i][1]] == symbol &&
                board[winPatterns[i][2]] == symbol) {
                return true;
            }
        }
        return false;
    }

    function checkDraw(uint8[9] memory board) internal pure returns (bool) {
        for (uint i = 0; i < 9; i++) {
            if (board[i] == 0) {
                return false;
            }
        }
        return true;
    }

    function getGameState(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getAvailableGames() external view returns (uint256[] memory) {
        uint256[] memory availableGames = new uint256[](gameCounter);
        uint256 count = 0;

        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].player2 == address(0) && !games[i].isFinished) {
                availableGames[count] = i;
                count++;
            }
        }

        // Resize the array to remove empty slots
        assembly {
            mstore(availableGames, count)
        }

        return availableGames;
    }
}