function showTooltip(text, elem) {
    let tooltipElem = document.createElement('div');
    tooltipElem.className = 'tooltip';
    tooltipElem.innerHTML = text;
    document.body.appendChild(tooltipElem);

    let coords = elem.getBoundingClientRect();

    let left = coords.left + (elem.offsetWidth - tooltipElem.offsetWidth) / 2;
    if (left < 0) left = 0; // не вылезать за левую границу экрана

    // не вылезать за верхнюю границу окна
    let top = coords.top - tooltipElem.offsetHeight - 5;
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