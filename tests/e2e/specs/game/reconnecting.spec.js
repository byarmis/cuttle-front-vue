import { setupGameAsP0, setupGameAsP1, validEmail, validPassword, assertGameState, Card } from '../../support/helpers';

function reconnect() {
	cy.get('#reauthenticate-dialog')
		.should('be.visible');
	cy.get('[data-cy=username]').type(validEmail);
	cy.get('[data-cy=password]').type(validPassword);
	cy.get('[data-cy=login]').click();
	cy.get('#reauthenticate-dialog')
		.should('not.be.visible');
	cy.log('Reauthenticated');
}

describe('Reconnecting to a game', () => {
	it('Reconnects after refreshing the page', () => {
		setupGameAsP0();

		cy.loadGameFixture({
			p0Hand: [Card.ACE_OF_CLUBS],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
		cy.get('[data-player-hand-card]')
			.should('have.length', 1);
		cy.log('Fixture loaded');

		// Reload page, relogin
		cy.reload();
		reconnect();

		// // Play Ace of Clubs for points
		cy.get('[data-player-hand-card=1-0]').click();
		cy.get('#player-field')
			.should('have.class', 'valid-move')
			.click()
			.should('not.have.class', 'valid-move');
        
		assertGameState(0, {
			p0Hand: [],
			p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.ACE_OF_CLUBS],
			p0FaceCards: [],
			p1Hand: [],
			p1Points: [],
			p1FaceCards: [],
		});
	});

	describe('Reconnecting into Cannot Counter Dialog', () => {
		it('oneOff - Reconnect into cannot counter dialog', () => {
			setupGameAsP1();

			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_DIAMONDS],
				p1Points: [Card.SIX_OF_CLUBS],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]')
				.should('have.length', 1);
			cy.log('Fixture loaded');

			cy.playOneOffOpponent(Card.ACE_OF_CLUBS);

			cy.get('#cannot-counter-dialog')
				.should('be.visible');
			
			// Reload page
			cy.reload();
			// Reauthenticate
			reconnect();

			// Cannot counter dialog appears again
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();

			assertGameState(1, {
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [Card.ACE_OF_DIAMONDS],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.SIX_OF_CLUBS],
			});
		});

		it('targetedOneOff -- reconnect into cannot counter dialog', () => {
			setupGameAsP1();

			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [Card.KING_OF_CLUBS],
				p1Hand: [Card.TWO_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]')
				.should('have.length', 1);
			cy.log('Fixture loaded');

			cy.playTargetedOneOffOpponent('playTargetedOneOffOpponent', Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS, 'rune');

			cy.get('#cannot-counter-dialog')
				.should('be.visible');
			
			// Reload page
			cy.reload();
			// Reauthenticate
			reconnect();

			// Cannot counter dialog appears again
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();
			
			assertGameState(1, {
				p0Hand: [Card.ACE_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS],
			});
		});
		it('counter -- Reconnect into cannot counter dialog', () => {
			setupGameAsP0();
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [Card.KING_OF_CLUBS],
				p1Hand: [Card.TWO_OF_CLUBS],
				p1Points: [],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]')
				.should('have.length', 1);
			cy.log('Fixture loaded');

			// Play ace of clubs
			cy.get('[data-player-hand-card=1-0]').click();
			cy.get('#scrap')
				.should('have.class', 'valid-move')
				.click();
			// Opponent counters
			cy.counterOpponent(Card.TWO_OF_CLUBS);
			// Reconnect & proceed
			cy.reload();
			reconnect();

			// Cannot counter - resolve
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();
			
			assertGameState(0, {
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [
					Card.ACE_OF_CLUBS,
					Card.TWO_OF_CLUBS,
					Card.KING_OF_CLUBS,
					Card.SEVEN_OF_DIAMONDS,
					Card.SEVEN_OF_HEARTS
				],
			});
		});

		it('sevenOneOff -- Reconnect into cannot counter dialog', () => {
			setupGameAsP1();
			cy.loadGameFixture({
				p0Hand: [Card.SEVEN_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [Card.KING_OF_CLUBS],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				topCard: Card.ACE_OF_CLUBS,
			});
			cy.get('[data-player-hand-card]')
				.should('have.length', 0);
			cy.log('Fixture loaded');

			// Opponent plays seven of clubs and player resolves
			cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();
			// Opponent plays Ace of clubs from seven
			cy.playOneOffFromSevenOpponent(Card.ACE_OF_CLUBS);

			// Player reconnects and cannot counter
			cy.reload();
			reconnect();
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();

			assertGameState(1, {
				p0Hand: [],
				p0Points: [],
				p0FaceCards: [Card.KING_OF_CLUBS],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [Card.ACE_OF_CLUBS, Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS, Card.SEVEN_OF_CLUBS]
			});
		});

		it('sevenTargetedOneOff -- Reconnect into cannot counter dialog', () => {
			setupGameAsP1();
			cy.loadGameFixture({
				p0Hand: [Card.SEVEN_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [Card.KING_OF_CLUBS],
				topCard: Card.TWO_OF_CLUBS,
			});
			cy.get('[data-player-hand-card]')
				.should('have.length', 0);
			cy.log('Fixture loaded');

			cy.playOneOffOpponent(Card.SEVEN_OF_CLUBS);
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();
			// Opponent plays two of clubs
			cy.playTargetedOneOffFromSevenOpponent(Card.TWO_OF_CLUBS, Card.KING_OF_CLUBS, 'rune');
			// Player reconnects and cannot counter
			cy.reload();
			reconnect();
			cy.get('#cannot-counter-dialog')
				.should('be.visible')
				.get('[data-cy=cannot-counter-resolve]')
				.click();

			assertGameState(1, {
				p0Hand: [],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [],
				p1FaceCards: [],
				scrap: [
					Card.KING_OF_CLUBS,
					Card.TWO_OF_CLUBS,
					Card.SEVEN_OF_CLUBS,
				],
			});
		});
	}); // End cannot counter dialog describe

	describe('Reconnecting into Counter Dialog', () => {

		it('oneOff -- Reconnect into Counter Dialog', () => {
			setupGameAsP1();
		
			cy.loadGameFixture({
				p0Hand: [Card.ACE_OF_CLUBS],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [Card.TWO_OF_CLUBS],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
			});
			cy.get('[data-player-hand-card]')
				.should('have.length', 1);
			cy.log('Fixture loaded');
		
			cy.playOneOffOpponent(Card.ACE_OF_CLUBS);
		
			cy.get('#counter-dialog')
				.should('be.visible');
			
			cy.reload();
			reconnect();
		
			cy.get('#counter-dialog')
				.should('be.visible')
				.get('[data-cy=counter]')
				.click();
			
			cy.resolveOpponent();
			assertGameState(1, {
				p0Hand: [],
				p0Points: [Card.SEVEN_OF_DIAMONDS, Card.SEVEN_OF_HEARTS],
				p0FaceCards: [],
				p1Hand: [],
				p1Points: [Card.ACE_OF_DIAMONDS],
				p1FaceCards: [],
				scrap: [Card.ACE_OF_CLUBS, Card.TWO_OF_CLUBS],
			});
		});
		it('targetedOneOff -- reconnect into counter dialog', () => {
			expect(true).to.eq(false);
		});
		it('counter -- Reconnect into counter dialog', () => {
			expect(true).to.eq(false);
		});
		it('sevenOneOff -- Reconnect into counter dialog', () => {
			expect(true).to.eq(false);
		});
		it('sevenTargetedOneOff -- Reconnect into counter dialog', () => {
			expect(true).to.eq(false);
		});
	}); // End counter dialog describe


	describe('Reconnecting into One-Off resolutions', () => {
		it('Resolve 3 after reconnect', () => {
			expect(true).to.eq(false);
		});
		it('Resolve 4 after reconnect', () => {
			expect(true).to.eq(false);
		});
		it('Resolve 7 after reconnect', () => {
			expect(true).to.eq(false);
		});
	});
});
