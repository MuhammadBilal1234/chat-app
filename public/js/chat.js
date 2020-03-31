const socket = io();

// ELements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Optoins

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.scrollHeight;

    const containeerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containeerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.on("message", message => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("locationMessage", location => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.text,
        createdAt: moment(location.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    console.log(users);
    document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", e => {
    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;

    socket.emit("sendMessage", message, error => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log("Message Deliverd !!");
    });
});

$sendLocationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(position => {
        $sendLocationButton.setAttribute("disabled", "disabled");
        socket.emit(
            "sendLocation",
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            () => {
                $sendLocationButton.removeAttribute("disabled");
                console.log("Location Shared");
            }
        );
    });
});

socket.emit("join", { username, room }, error => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
