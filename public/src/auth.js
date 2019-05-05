
let socket = io();

let email = document.getElementById('signin_email');
let password = document.getElementById('signin_password');

let btn_login = document.getElementById('btn_login');
let btn_signup = document.getElementById('btn_signup');

/*=================================*/
/*           Authorization         */
/*=================================*/

btn_login.addEventListener('click', function () {
    socket.emit('signIn', {email: email.value, password: password.value});
});

btn_signup.addEventListener('click', function () {
    let authFrom = document.getElementById('authForm');
    authFrom.style.zIndex = '20';
});

socket.on('SignInResponse', function (data) {
    if(data.success){
        setCookie('isAuthorized', true, {path : '/'});
        window.location.replace('http://localhost:3002/')
    } else {
        alert("Invalid login or password")
    }
});

/*=================================*/
/*           Registration          */
/*=================================*/

let reg_email = document.getElementById('reg_email');
let reg_login = document.getElementById('reg_login');
let reg_password = document.getElementById('reg_password');

let reg_btn_signup = document.getElementById('reg_btn_signup');
let reg_btn_signin = document.getElementById('reg_btn_signin');

reg_btn_signup.addEventListener('click', function () {
    socket.emit('signUp', {email: reg_email.value,  login: reg_login.value, password: reg_password.value});
});

reg_btn_signin.addEventListener('click', function () {
    let authFrom = document.getElementById('authForm');
    authFrom.style.zIndex = '22';
});

socket.on('SignUnResponse', function (data) {
    if(data.success){
        window.location.replace('http://localhost:3002/')
    } else {
        alert("Invalid login or path")
    }
});