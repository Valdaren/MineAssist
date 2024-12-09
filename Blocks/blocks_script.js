document.addEventListener('DOMContentLoaded', () => {
    const blockSearch = document.getElementById('blockSearch');
    const suggestions = document.getElementById('suggestions');
    const infoBoxes = document.querySelectorAll('.info-content');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('query-results');
    const resultsList = document.getElementById('results-list');
    let blockNames = [];
    let selectedBlockData = {};

    // Fetch block names from the server
    fetch('get_block_names.php')
        .then(response => response.json())
        .then(data => {
            blockNames = data;
        });

    // Function to reset all info boxes and hide error messages/results
    function resetAll() {
        infoBoxes.forEach(box => {
            box.textContent = '';
            box.setAttribute('data-state', 'initial');
            box.classList.remove('up-arrow', 'down-arrow', 'green', 'yellow', 'red');
        });
        errorMessage.style.display = 'none';
        resultsSection.style.display = 'none';
    }

    // Handle block suggestion clicks
    blockSearch.addEventListener('input', () => {
        const query = blockSearch.value.toLowerCase();
        suggestions.innerHTML = '';
        if (query) {
            blockNames.forEach(block => {
                if (block.toLowerCase().startsWith(query)) {
                    const suggestion = document.createElement('div');
                    suggestion.textContent = block.charAt(0).toUpperCase() + block.slice(1);
                    suggestion.addEventListener('click', () => {
                        blockSearch.value = suggestion.textContent;
                        fetchBlockData(block);
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

    // Fetch block data on selection
    function fetchBlockData(blockName) {
        fetch('get_block_data.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `blockName=${blockName}`
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    selectedBlockData = data;
                    displayBlockInfo(data);
                }
            });
    }

    // Display block info
    function displayBlockInfo(blockData) {
        document.getElementById('version-content').textContent = blockData.release;
        document.getElementById('stack-size-content').textContent = blockData.stack_size;
        document.getElementById('tools-content').textContent = blockData.tools;
        document.getElementById('blast-resistance-content').textContent = blockData.blast_resistance;
        document.getElementById('hardness-content').textContent = blockData.hardness;
        document.getElementById('flammable-content').textContent = blockData.flammable;
        document.getElementById('full-block-content').textContent = blockData.full_block;
    }

    // Handle state toggling for numeric and string fields
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
            if (['release', 'stack-size', 'blast-resistance', 'hardness'].includes(box.parentElement.id)) {
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
                value = selectedBlockData['release_version_number'];
            } else {
                value = selectedBlockData[category.replace('-', '_')]; // Adjust category to match keys
            }

            if (state === 'initial') {
                isValid = false;
            } else {
                if (!['release', 'stack-size', 'blast-resistance', 'hardness'].includes(category)) {
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
            fetch('query_blocks.php', {
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
                        data.forEach(block => {
                            const listItem = document.createElement('li');
                            listItem.textContent = block;
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