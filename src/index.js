document.addEventListener('DOMContentLoaded', () => {
    const quoteList = document.getElementById('quote-list');
    const newQuoteForm = document.getElementById('new-quote-form');
    const newQuoteInput = document.getElementById('new-quote');
    const newAuthorInput = document.getElementById('author');

    const apiUrl = 'http://localhost:3000/quotes';

    // my fetch quote function
    fetchQuotes();

    async function fetchQuotes() {
        try {
            const response = await fetch(`${apiUrl}?_embed=likes`);
            const quotes = await response.json();

            renderQuotes(quotes);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    }

    //render quote function
    function renderQuotes(quotes) {
        quoteList.innerHTML = ''; 

        // Sort quotes by author name if the sort is active
        if (localStorage.getItem('sortActive') === 'true') {
            quotes.sort((a, b) => a.author.localeCompare(b.author));
        }

        // Render each quote in the list
        quotes.forEach(quote => {
            const quoteCard = document.createElement('li');
            quoteCard.classList.add('quote-card');
            quoteCard.innerHTML = `
                <blockquote class="blockquote">
                    <p class="mb-0">${quote.quote}</p>
                    <footer class="blockquote-footer">${quote.author}</footer>
                    <br>
                    <button class='btn btn-success' data-id="${quote.id}">Likes: <span>${quote.likes.length}</span></button>
                    <button class='btn btn-danger' data-id="${quote.id}">Delete</button>
                    <button class='btn btn-warning' data-id="${quote.id}">Edit</button>
                </blockquote>
            `;
            quoteList.appendChild(quoteCard);

            // Attach event listeners for like, delete, and edit
            quoteCard.querySelector('.btn-success').addEventListener('click', handleLike);
            quoteCard.querySelector('.btn-danger').addEventListener('click', handleDelete);
            quoteCard.querySelector('.btn-warning').addEventListener('click', handleEdit);
        });
    }

    // Handle the like button
    async function handleLike(event) {
        const quoteId = event.target.getAttribute('data-id');
        try {
            // Create a new like
            await fetch('http://localhost:3000/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quoteId })
            });

            // Update the likes count in the DOM
            const likesSpan = event.target.querySelector('span');
            likesSpan.textContent = parseInt(likesSpan.textContent) + 1;
        } catch (error) {
            console.error('Error liking quote:', error);
        }
    }

    // Handle the delete button
    async function handleDelete(event) {
        const quoteId = event.target.getAttribute('data-id');
        try {
            // Delete the quote from the API
            await fetch(`${apiUrl}/${quoteId}`, {
                method: 'DELETE'
            });

            // Remove the quote from the DOM
            event.target.closest('.quote-card').remove();
        } catch (error) {
            console.error('Error deleting quote:', error);
        }
    }

    // Handle the edit button
    function handleEdit(event) {
        const quoteId = event.target.getAttribute('data-id');
        const quoteCard = event.target.closest('.quote-card');
        const quoteText = quoteCard.querySelector('.mb-0').textContent;
        const authorText = quoteCard.querySelector('.blockquote-footer').textContent;

        // Fill the form with existing quote data
        newQuoteInput.value = quoteText;
        newAuthorInput.value = authorText;

        // Change form submission behavior to update the quote
        newQuoteForm.onsubmit = async (e) => {
            e.preventDefault();

            const updatedQuote = {
                quote: newQuoteInput.value,
                author: newAuthorInput.value
            };

            try {
                // Update the quote in the API
                await fetch(`${apiUrl}/${quoteId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedQuote)
                });

                // Re-fetch and re-render quotes to reflect the updated quote
                fetchQuotes();

                // Clear the form and reset submit behavior
                newQuoteForm.reset();
                newQuoteForm.onsubmit = handleNewQuote;
            } catch (error) {
                console.error('Error updating quote:', error);
            }
        };
    }

    // Handle new quote form submission
    newQuoteForm.onsubmit = async (event) => {
        event.preventDefault();

        const newQuote = {
            quote: newQuoteInput.value,
            author: newAuthorInput.value
        };

        try {
            // Create the new quote in the API
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newQuote)
            });

            // Re-fetch and re-render quotes
            fetchQuotes();

            // Clear the form
            newQuoteForm.reset();
        } catch (error) {
            console.error('Error adding new quote:', error);
        }
    };

    // Sort quotes by author name
    const sortButton = document.createElement('button');
    sortButton.textContent = 'Sort by Author';
    sortButton.classList.add('btn', 'btn-secondary');
    sortButton.addEventListener('click', () => {
        const sortActive = localStorage.getItem('sortActive') === 'true';
        localStorage.setItem('sortActive', !sortActive);
        fetchQuotes();
    });
    document.body.appendChild(sortButton);
});
