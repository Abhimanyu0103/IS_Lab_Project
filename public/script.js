// Send Message Functionality
document
    .getElementById("sendMessageForm")
    .addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const message = document.getElementById("message").value; // Get the message value
        const recipient = document.getElementById("recipient").value; // Get the recipient value
        const expiry = document.getElementById("expiry").value; // Get the expiry time

        try {
            const response = await fetch("/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Set content type to JSON
                },
                body: JSON.stringify({
                    message,
                    recipient,
                    expiryMinutes: expiry,
                }), // Send data as JSON
            });

            const data = await response.json(); // Parse the JSON response

            // Check if the message was sent successfully
            if (data.success) {
                document.getElementById("response").innerHTML =
                    `Message sent! Expiry Time: ${data.expiryTime}, Encrypted Message: ${data.encryptedMessage}`;
            } else {
                document.getElementById("response").innerHTML =
                    `Error: ${data.error}`; // Display any errors
            }
        } catch (error) {
            console.error("Error during fetch:", error); // Log any fetch errors
            document.getElementById("response").innerHTML =
                `Error: ${error.message}`; // Display the error
        }
    });

// Decrypt Message Functionality
document
    .getElementById("decryptMessageForm")
    .addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const encryptedMessage =
            document.getElementById("encryptedMessage").value; // Get the encrypted message

        try {
            const response = await fetch("/decryptMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Set content type to JSON
                },
                body: JSON.stringify({ encryptedMessage }), // Send data as JSON
            });

            const data = await response.json(); // Parse the JSON response

            // Check if the message was decrypted successfully
            if (data.success) {
                document.getElementById("decryptionResponse").innerHTML =
                    `Decrypted Message: ${data.decryptedMessage}`;
            } else {
                document.getElementById("decryptionResponse").innerHTML =
                    `Error: ${data.message}`; // Display any errors
            }
        } catch (error) {
            console.error("Error during fetch:", error); // Log any fetch errors
            document.getElementById("decryptionResponse").innerHTML =
                `Error: ${error.message}`; // Display the error
        }
    });

// Fetch and display messages
async function fetchMessages() {
    try {
        const response = await fetch("/getMessages");
        const data = await response.json();

        if (data.messages) {
            const messagesList = document.getElementById("messagesList");
            messagesList.innerHTML = ""; // Clear previous messages

            // Iterate over messages and append them to the list
            data.messages.forEach((msg) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Recipient:</strong> ${msg.recipient} <br>
                    <strong>Encrypted Message:</strong> ${msg.message} <br>
                    <strong>Expiry Time:</strong> ${msg.expiryTime.toLocaleString()} <br>
                `;
                messagesList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Call fetchMessages when the page loads
document.addEventListener("DOMContentLoaded", fetchMessages);
