const res = require("express/lib/response");

let socket = io();

let email = document.getElementById('email');
let password = document.getElementById('password');

let btn_login = document.getElementById('btn_login');
let btn_signup = document.getElementById('btn_signup');

btn_login.addEventListener('click', function () {
    socket.emit('signIn', {email: email.value, password: password.value});
});

socket.on('SignInResponse', function (data) {
    if(data.success){
        alert("Sign in successful");
        return res.redirect('/level_1.html');
    } else {
        alert("Sign in unsuccessful");
    }
});