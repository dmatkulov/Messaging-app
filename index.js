const preloader = document.getElementById('preloader');
const messagesContainer = document.getElementById('all-messages');
const form = document.getElementById('messageForm');
const authorInput = document.getElementById('authorName');
const messageInput = document.getElementById('messageText');


// Переменные
const BASE_URL = 'http://146.185.154.90:8000/messages';
const READ_MSG = 'bg-dark py-2 my-1 px-3 m-0 bg-opacity-10 rounded';
const UNREAD_MSG = 'bg-primary bg-opacity-10 text-dark py-2 my-1 px-3 m-0 rounded';
let datetime = ''

// Функции
const request = async (url) => {
    const response = await fetch(url);

    if (response.ok) {
        return response.json();
    }
    throw new Error('Network error: ' + response.status)
};
const createMessageCard = (author, message, datetime, style) => {
    const newDate = new Date(datetime);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const getMonth = months[newDate.getMonth()];
    const getMinutes = (newDate.getMinutes() < 10 ? '0' : '') + newDate.getMinutes()
    const dateString = `${newDate.getDate()} ${getMonth}, ${newDate.getHours()}:${getMinutes}`;

    const card = document.createElement('div');
    card.className = 'd-flex flex-column align-items-end mt-4';
    card.innerHTML = `  <p class="card-header border-0 fw-semibold" id="author" style="font-size: 14px">${author}</p>
                        <p class="${style}" id="message">${message}</p>
                        <small class="text-body-secondary text-secondary fw-light" id="date" style="font-size: 12px">${dateString}</small>`;
    messagesContainer.prepend(card);
};
const requestMessages = async (url, style) => {
    const messages = await request(url)
    messages.forEach((message) => {
        const author = message.author;
        const messageBody = message.message;
        const date = new Date(message.datetime)
        createMessageCard(author, messageBody, date, style);
    });
    return messages;
};
const loadMessages = async () => {
        preloader.classList.remove('d-none');
        messagesContainer.innerHTML = '';
        const messages = await requestMessages(`${BASE_URL}`, READ_MSG);
        datetime = messages[messages.length - 1].datetime;
        preloader.classList.add('d-none');
        return datetime;
};
const receiveNewMessages = (datetime) => {
    setInterval(async () => {
        const newMessages = await requestMessages(`${BASE_URL}?datetime=${datetime}`, UNREAD_MSG);
        if (newMessages.length > 0) {
            datetime = newMessages[newMessages.length - 1].datetime;
            console.log(`${newMessages.length} new message(s)`)
            return datetime;
        } else {
            console.log('No new messages after 3 seconds')
        }
    }, 3000);
};

// Программа
const displayMessages = async () => {
    try {
        await loadMessages();
        await receiveNewMessages(datetime);
    } catch (error) {
        console.error('Something went wrong!', error);
    }
};

displayMessages().catch(e => console.log('IN CATCH ', e));

// Отправка сообщения
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const author = authorInput.value;
    const message = messageInput.value;
    const body = new URLSearchParams();
    body.append('author', author);
    body.append('message', message);

    await fetch('http://146.185.154.90:8000/messages', {method: 'POST', body});
    authorInput.value = '';
    messageInput.value = '';
});
