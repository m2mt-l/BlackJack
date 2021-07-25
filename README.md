# Black Jack
Recursion Project5 Black Jack

## URL
https://m2mt-l.github.io/BlackJack/

## Description
This is a web application for Recursion(https://recursionist.io).<br>

## Feature
The rule is based on basic black jack rules. <br>
The cards, Jack, Queen and King count as 10 and ace on player's hand counts as 1 or 11. The ace on dealer's hand only counts as 11.<br>

The game divided into the following phases.<br>

1. Bet<br>
Players can bet money. The minimum bet is $5.

2. Hand cards<br>
Each players and can get 2 cards. The dealer's second card is face down.

3. Action<br>
Players can choose the following actions. The dealer only choose stand or hit. The dealer keep hitting until the hand score reaches 17.<p>

    - Surrender<br>
    End the hand immediately. Reimburse half the bet.

    - Stand<br>
    Stop taking cards. If cards are black jack or score is 21, automatically choose stand.

    - Hit<br>
    Take another card. If the score is greater than 21, the player status changes "bust".

    - Double<br>
    The bet will be double and take only one more card.

    - Insurance<br>
    If the dealer's first card is 'A', the player can take insurance. If dealer's cards are black jack, the player can get double insurance money.

    - Even Bet<br>
    If player's card is black jack and the dealer's first card is 'A', the player can take even bet. This is an insurance for black jack. If dealer's cards are black jack, the player can get double insurance money.

    - Split<br>
    If player's both cards are the same rank, the player can take split. If next card is also the same, the player can keep splitting. The bet will be on each split card. If the split card is 'A', the player only take one card.

4. Evaluate<br>
After all players and dealer's actions are finished, evaluate the game.


## Limitation
- AI cannot choose Insurance, Even Bet and Split.
- If the dealer's first card is 'A' and player's cards are split, you choose insurance at first. If you take insurance, you will lose split.

## Future Enhancement
The following Features are planned in the future.
- Optimize Smartphone
- Poker game

## Installation
```
$ git clone https://github.com/m2mt-l/BlackJack.git 
$ cd BlackJack
```