/* ============================================
   ABUNDIA.IO - Contact Form Handler
   Submits to Web3Forms (https://web3forms.com) via fetch,
   keeping the site fully static with no backend of its own.
   Compatible with a strict CSP (no inline scripts).
   ============================================ */

(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('form-submit-btn');
  var submitLabel = submitBtn ? submitBtn.querySelector('.form-submit-label') : null;

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status form-status--' + type;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (submitLabel) {
      submitLabel.textContent = isLoading ? 'Enviando…' : 'Enviar Solicitud';
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);
    setStatus('', '');

    var formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        return response.text().then(function (text) {
          var data = {};
          try { data = text ? JSON.parse(text) : {}; } catch (e) {
            data = { success: false, message: 'Respuesta no JSON del servicio de formularios.' };
          }
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        setLoading(false);
        if (result.ok && result.data && result.data.success) {
          window.location.replace('/gracias/');
          return;
        }
        setStatus(
          'No pudimos enviar tu solicitud. Por favor, intenta de nuevo o escríbenos directamente a info@abundia.io.',
          'error'
        );
      })
      .catch(function () {
        setLoading(false);
        setStatus(
          'Hubo un problema de conexión. Por favor, intenta de nuevo o escríbenos directamente a info@abundia.io.',
          'error'
        );
      });
  });
})();
