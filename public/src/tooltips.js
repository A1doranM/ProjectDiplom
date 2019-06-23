// function showTooltip(text, elem) {
//     let tooltipElem = document.createElement('div');
//     tooltipElem.className = 'tooltip';
//     tooltipElem.innerHTML = text;
//     document.body.appendChild(tooltipElem);
//
//     let tooltipElem1 = document.createElement('div');
//     tooltipElem1.className = 'tooltip btnTooltip controls';
//     tooltipElem1.innerHTML = 'NEXT';
//     document.body.appendChild(tooltipElem);
//
//     let tooltipElem2 = document.createElement('div');
//     tooltipElem2.className = 'tooltip btnTooltip controls';
//     tooltipElem2.innerHTML = 'BACK';
//     document.body.appendChild(tooltipElem);
//
//     let coords = elem.getBoundingClientRect();
//
//     let left = coords.left + (elem.offsetWidth - tooltipElem.offsetWidth) / 2;
//     if (left < 0) left = 0; // не вылезать за левую границу экрана
//
//     // не вылезать за верхнюю границу окна
//     let top = coords.top - tooltipElem.offsetHeight - 5;
//     if (top < 0) {
//         top = coords.top + elem.offsetHeight + 5;
//     }
//
//     tooltipElem.style.font = 'left';
//     tooltipElem.style.width = 900 + 'px';
//     tooltipElem.style.height = 'auto';
//     tooltipElem.style.left = 25 + '%';
//     tooltipElem.style.top = 25 + '%';
//     tooltipElem.style.zIndex = '50';
//     tooltipElem1.style.marginTop = 50 + 'px';
//
//     tooltipElem.addEventListener('click', function () {
//         document.body.removeChild(showingTooltip);
//     });
//
//     return tooltipElem;
// }
function showTooltip(text) {
    document.getElementById('tooltip').value = text;
    // document.getElementById('tooltip').style.display = 'none';
}