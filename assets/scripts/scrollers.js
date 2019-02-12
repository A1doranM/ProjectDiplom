
document.onmousemove = function(e) {

    let evt = e||window.event,
        x2 =  document.documentElement.clientWidth,
        x1 = 0,
        zone = 100;

    if( evt.clientX > (x2 - zone)) {
        window.scrollBy(20,0);
    }
    if( evt.clientX < (x1 + zone)) {
        window.scrollBy( -20,0);
    }

}