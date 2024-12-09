document.addEventListener('DOMContentLoaded', () => {
    const mobSearch = document.getElementById('mobSearch');
    const suggestions = document.getElementById('suggestions');
    const infoBoxes = document.querySelectorAll('.info-content');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('query-results');
    const resultsList = document.getElementById('results-list');
    let mobNames = [];
    let selectedMobData = {};

    fetch('get_mob_names.php')
        .then(response => response.json())
        .then(data => {
            mobNames = data;
        });

    function resetAll() {
        infoBoxes.forEach(box => {
            box.textContent = '';
            box.setAttribute('data-state', 'initial');
            box.classList.remove('up-arrow', 'down-arrow', 'green', 'yellow', 'red');
        });
        errorMessage.style.display = 'none';
        resultsSection.style.display = 'none';
    }

    mobSearch.addEventListener('input', () => {
        const query = mobSearch.value.toLowerCase();
        suggestions.innerHTML = '';
        if (query) {
            mobNames.forEach(mob => {
                if (mob.toLowerCase().startsWith(query)) {
                    const suggestion = document.createElement('div');
                    suggestion.textContent = mob.charAt(0).toUpperCase() + mob.slice(1);
                    suggestion.addEventListener('click', () => {
                        mobSearch.value = suggestion.textContent;
                        fetchMobData(mob);
                        suggestions.innerHTML = '';
                        resetAll();
                    });
                    suggestions.appendChild(suggestion);
                }
            });
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    });

    function fetchMobData(mobName){
        fetch('get_mob_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `mobName=${mobName}`
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    selectedMobData = data;
                    displayMobInfo(data);
                }
            });
    }

    function displayMobInfo(mobData) {
        document.getElementById('version-content').textContent = mobData.release_version;
        document.getElementById('health-content').textContent = mobData.health;
        document.getElementById('height-content').textContent = mobData.height;
        document.getElementById('behavior-content').textContent = mobData.behavior;
        document.getElementById('spawn-content').textContent = mobData.spawn;
        document.getElementById('classification-content').textContent = mobData.classification;
    }

    function toggleArrow(box) {
        const states = ['⬆', '⬇', 'green'];
        const comparisons = ['>', '<', '='];
        let currentState = box.getAttribute('data-state');
        let newStateIndex = (states.indexOf(currentState) + 1) % states.length;

        box.setAttribute('data-state', states[newStateIndex]);
        box.setAttribute('data-comparison', comparisons[newStateIndex]);
        box.classList.remove('up-arrow', 'down-arrow', 'green');

        if (newStateIndex === 0) {
            box.classList.add('up-arrow');
            box.textContent = '⬆';
        } else if (newStateIndex === 1) {
            box.classList.add('down-arrow');
            box.textContent = '⬇';
        } else {
            box.classList.add('green');
            box.textContent = '';
        }
    }

    function toggleColor(box) {
        const states = ['green', 'yellow', 'red'];
        const comparisons = ['=', '>=', '!='];
        let currentState = box.getAttribute('data-state');
        let newStateIndex = (states.indexOf(currentState) + 1) % states.length;

        box.setAttribute('data-state', states[newStateIndex]);
        box.setAttribute('data-comparison', comparisons[newStateIndex]);
        box.classList.remove('green', 'yellow', 'red');
        box.classList.add(states[newStateIndex]);
    }

    infoBoxes.forEach(box => {
        box.addEventListener('click', () => {
            if (['release', 'health', 'height'].includes(box.parentElement.id)) {
                toggleArrow(box);
            } else {
                toggleColor(box);
            }
        });
    });

    submitBtn.addEventListener('click', () => {
        let isValid = true;
        let queryData = {};

        infoBoxes.forEach(box => {
            const category = box.parentElement.id;
            const state = box.getAttribute('data-state');
            const comparison = box.getAttribute('data-comparison') || '';
            let value;

            if (category === 'release') {
                value = selectedMobData['release_version_number'];
            } else {
                value = selectedMobData[category];
            }

            if (state === 'initial') {
                isValid = false;
            } else {
                if (!['release', 'health', 'height'].includes(category)) {
                    value = box.textContent || box.getAttribute('data-value');
                }
                value = parseFloat(value) || value;
                queryData[category] = { comparison, value };
            }
        });

        if (!isValid) {
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
            fetch('query_mobs.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryData)
            })
                .then(response => response.json())
                .then(data => {
                    resultsList.innerHTML = '';

                    if (data.length > 0) {
                        data.forEach(mob => {
                            const listItem = document.createElement('li');
                            listItem.textContent = mob;
                            resultsList.appendChild(listItem);
                        });
                        resultsSection.style.display = 'block';
                    } else {
                        resultsSection.style.display = 'none';
                        alert('No results found for the given criteria.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
});