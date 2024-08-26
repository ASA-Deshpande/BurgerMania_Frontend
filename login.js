function setCookie(name, value, days) {

    let expires = "";

    if (days){
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + (value || "") + ";" + expires + ";path=/"

    console.log("Name: ", name);
    console.log("Value: ", value);
    console.log(document.cookie); // This should now show the cookie
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


async function fetchAllUsersTrial() {
    try {
        const token = getCookie('access_token');
        console.log("here again: ", token);

        const response = await fetch('https://localhost:7242/api/User', {
            method: 'GET',
            // credentials: 'include' // Include cookies in the request
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get the error response body if needed
            throw new Error(`Network response not okay: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Protected Resource Data: ", data);
    } catch (error) {
        console.error("Error: ", error);
    }
}

async function callSignupAPI(phnNumber, Password) {
    try {
        const response = await fetch('https://localhost:7242/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "name": "string",
                "phnNumber": phnNumber,
                "password": Password
              }),
        });

        if (!response.ok) {
            // const errorData = await response.json();
            if (response.status === 409) { // Conflict
                // User already exists
                alert('User already exists with this phone number. Logging you in...');
                await callLoginAPI(phnNumber, Password); // Call the login API
                return; // Exit the signup function
            }
            throw new Error(`Signup failed: ${errorData.message}`);
        }

        const data = await response.json();
        console.log('Signup Success: ', data);
        alert('Signup successful! Welcome!');

        // Optionally, you can log in the user automatically after signup
        await callLoginAPI(phnNumber, Password); // Automatically log in after signup
    } catch (error) {
        console.log("Error during signup: ", error);
        alert('Signup failed. Please try again.');
    }
}

async function callLoginAPI(phnNumber, Password) {
    try {
        const response = await fetch('https://localhost:7242/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phnNumber, Password }),
        });

        if (!response.ok) {
            throw new Error('Login failed: ' + response.statusText);
        }

        const data = await response.json();
        console.log('Login Success: ', data);

        // Example usage after receiving the token from the backend
        const token = data.token; // Replace with the actual token
        console.log(token);
        setCookie("access_token", token, 7); // Set cookie for 7 days

        const userId = data.userDTO.id;
        console.log(userId);
        setCookie("userID", userId, 7);

        console.log("here: ", document.cookie);

        alert('Welcome back!'); // Alert for returning user
        window.location.href = "http://127.0.0.1:5500/menuNcart.html";
    } catch (error) {
        console.log("Error during login: ", error);
        alert('Login Failed. Please try again.');
    }

    document.getElementById('login-phn').value = "";
    document.getElementById('login-password').value = "";
}

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const phnNumber = document.getElementById('login-phn').value;
    const Password = document.getElementById('login-password').value;

    // Call your signup API first
    console.log('Attempting Signup/Login:', { phnNumber, Password });
    await callSignupAPI(phnNumber, Password);
});

// async function callLoginAPI(phnNumber, Password)
// {
//     try{
//         const response = await fetch('https://localhost:7242/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({phnNumber, Password}),
//         });

//         if(!response.ok){
//             throw new Error('Login failed: ', response.Error);
//         }

//         const data = await response.json();
//         console.log('Login Success: ', data);
        

//         // Example usage after receiving the token from the backend
//         const token = data.token; // Replace with the actual token
//         console.log(token);
//         setCookie("access_token", token, 7); // Set cookie for 7 days

//         const userid = data.userDTO.id;
//         console.log(userid);
//         setCookie("userID", userid, 7);

//         console.log("here: ", document.cookie);

//         window.location.href = "http://127.0.0.1:5500/menuNcart.html";
//         //await fetchAllUsersTrial();
//     }
//     catch (error){
//         console.log("error: ", error);
//         alert('Login Failed. Please try again.');
//     }

//     document.getElementById('login-phn').value = "";
//     document.getElementById('login-password').value = "";

// }


// document.getElementById('login-form').addEventListener('submit', async function(event) {
//     event.preventDefault(); 
//     const phnNumber = document.getElementById('login-phn').value;
//     const Password = document.getElementById('login-password').value;

//     // Call your login API here
//     console.log('Login:', { phnNumber, Password });
//     await callLoginAPI(phnNumber, Password);
// });

// document.getElementById('signup-form').addEventListener('submit', function(event) {
//     event.preventDefault(); 
//     const email = document.getElementById('signup-phn').value;
//     const password = document.getElementById('signup-password').value;

//     // Call your signup API here
//     console.log('Signup:', { email, password });
//     // Example: callSignupAPI(email, password);
// });