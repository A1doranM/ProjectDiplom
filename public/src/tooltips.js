function showTooltip(text, elem) {
    var tooltipElem = document.createElement('div');
    tooltipElem.className = 'tooltip';
    tooltipElem.innerHTML = text;
    document.body.appendChild(tooltipElem);

    var coords = elem.getBoundingClientRect();

    var left = coords.left + (elem.offsetWidth - tooltipElem.offsetWidth) / 2;
    if (left < 0) left = 0; // не вылезать за левую границу экрана

    // не вылезать за верхнюю границу окна
    var top = coords.top - tooltipElem.offsetHeight - 5;
    if (top < 0) {
        top = coords.top + elem.offsetHeight + 5;
    }

    tooltipElem.style.width = 600 + 'px';
    tooltipElem.style.height = 'auto';
    tooltipElem.style.left = 50 + 'px';
    tooltipElem.style.top = 50 + 'px';

    tooltipElem.addEventListener('click', function () {
        document.body.removeChild(showingTooltip);
    });

    return tooltipElem;
}