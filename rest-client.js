const vue = Vue.createApp({
    data() {
        return {
            gameInModal: {name: null},
            games: [],
            newGame: {name: '', price: 0},
            sortKey: 'name',
            sortOrder: 'asc'
        }
    },
    async created() {
        this.fetchGames();
    },
    computed: {
        sortedGames() {
            return this.games.slice().sort((a, b) => {
                let result = 0;
                if (this.sortKey === 'price') {
                    result = a.price - b.price;
                } else {
                    result = a.name.localeCompare(b.name);
                }

                return this.sortOrder === 'asc' ? result : -result;
            });
        },
    },
    methods: {
        async fetchGames() {
            this.games = await (await fetch('http://localhost:8080/games')).json();
        },
        getGame: async function(id) {
            this.gameInModal = await (await fetch(`http://localhost:8080/games/${id}`)).json();
            let gameInfoModal = new bootstrap.Modal(document.getElementById('gameInfoModal'), {});
            gameInfoModal.show();
        },
        closeModal() {
            let modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => bootstrap.Modal.getInstance(modal).hide());
        },
        showAddGameModal() {
            let addGameModal = new bootstrap.Modal(document.getElementById('addGameModal'), {});
            addGameModal.show();
        },
        showEditGameModal(game) {
            this.gameInModal = {...game};
            let editGameModal = new bootstrap.Modal(document.getElementById('editGameModal'), {});
            editGameModal.show();
        },
        async updateGame(id) {
            const updatedGame = {
                name: this.gameInModal.name,
                price: this.gameInModal.price
            };
            try {
                const response = await fetch(`http://localhost:8080/games/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedGame)
                });
                console.log('Response Status:', response.status);
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Ошибка обновления игры:', errorData);
                    alert(`Ошибка обновления игры: ${errorData.error || errorData.message || 'Неизвестная ошибка'}`);
                    return;
                }
                this.fetchGames();
                this.closeModal();
            } catch (error) {
                console.error('Произошла ошибка:', error);
                alert('Произошла ошибка при обновлении игры. Пожалуйста, попробуйте снова.');
            }
        },
        async addGame() {
            await fetch('http://localhost:8080/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.newGame)
            });
            this.newGame = {name: '', price: 0};
            this.fetchGames();
            this.closeModal();
        },
        sortBy(field) {
            if (this.sortKey === field) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = field;
                this.sortOrder = 'asc';
            }
        },
        async deleteGame(id) {
            await fetch(`http://localhost:8080/games/${id}`, {
                method: 'DELETE'
            });
            this.fetchGames();
        }
    }
}).mount('#app');