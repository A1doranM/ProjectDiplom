if(getCookie('isAuthorized') === undefined){
    window.location.replace('http://localhost:3002/login')
}