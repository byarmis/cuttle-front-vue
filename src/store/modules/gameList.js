import { io } from '../../plugins/sails.js';

export default {
	state: {
		games: [],
	},
	mutations: {
		refreshGames(state, newList) {
			state.games = newList;
		}
	},
	actions: {
		requestGameList(context) {
			console.log('Requesting game list');
			return new Promise((resolve, reject) => {
				io.socket.get('/game/getList', function handleResponse(resData, jwres) {
					console.log(resData);
					console.log(jwres);
					if (jwres.statusCode === 200) {
						context.commit('refreshGames', resData);
						return resolve(resData.games);
					}
					return reject(new Error('Could not retrieve list of games'))
				});
			});
		}
	}
}