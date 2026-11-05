/* Раздел 07: заявка открывается письмом с заполненными полями. На сервер ничего не уходит. */
(function () {
  'use strict';

  var form = document.getElementById('pilot-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var lines = Array.prototype.map.call(form.querySelectorAll('input[name]'), function (input) {
      return input.name + ': ' + input.value.trim();
    });
    window.location.href = 'mailto:limen.perm@gmail.com' +
      '?subject=' + encodeURIComponent('Бесплатный пилот') +
      '&body=' + encodeURIComponent(lines.join('\n'));
  });
})();
