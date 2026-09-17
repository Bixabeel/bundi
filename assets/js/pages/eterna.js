/* ============================================
   ABUNDIA.IO - Eterna Project Page
   Multi-step form wizard behavior.
   Extracted from an inline <script> block to comply
   with a script-src CSP that does not allow
   'unsafe-inline' (see legal/ and site-wide hardening).
   No functional changes vs. the original inline script.
   ============================================ */

    (function() {
        'use strict';

        var form = document.getElementById('eterna-form');
        var wrapper = document.getElementById('eterna-form-wrapper');
        var successEl = document.getElementById('form-success');
        var progressFill = document.getElementById('progress-fill');
        var submitBtn = document.getElementById('btn-submit');
        var agreeCheckbox = document.getElementById('f-agree');
        var indicators = document.querySelectorAll('.e-step-indicator');
        var panels = document.querySelectorAll('.e-step-panel');
        var nextButtons = document.querySelectorAll('[data-goto]');
        var otherDomainField = document.getElementById('other-domain-field');
        var domainRadios = document.querySelectorAll('input[name="domain"]');

        var currentStep = 1;
        var totalSteps = 4;

        // Progress bar width calculation
        function getProgressWidth(step) {
            // 0% at step 1, 33% at step 2, 66% at step 3, 100% at step 4
            if (step <= 1) return '0%';
            return ((step - 1) / (totalSteps - 1) * 100) + '%';
        }

        // Navigate to a step
        function goToStep(step) {
            if (step < 1 || step > totalSteps) return;

            // Validate current step before moving forward
            if (step > currentStep && !validateStep(currentStep)) return;

            currentStep = step;

            // Update indicators
            indicators.forEach(function(ind) {
                var s = parseInt(ind.getAttribute('data-step'));
                ind.classList.remove('active', 'completed');
                if (s === currentStep) ind.classList.add('active');
                else if (s < currentStep) ind.classList.add('completed');
            });

            // Update panels
            panels.forEach(function(p) {
                var s = parseInt(p.getAttribute('data-panel'));
                p.classList.toggle('active', s === currentStep);
            });

            // Update progress fill
            progressFill.style.width = getProgressWidth(currentStep);

            // If review step, populate review
            if (currentStep === 4) populateReview();

            // Scroll form into view smoothly
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Validate a step
        function validateStep(step) {
            if (step === 1) {
                var name = document.getElementById('f-name').value.trim();
                var email = document.getElementById('f-email').value.trim();
                if (!name) { shakeField('f-name'); return false; }
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { shakeField('f-email'); return false; }
                return true;
            }
            if (step === 2) {
                var checked = document.querySelector('input[name="domain"]:checked');
                if (!checked) {
                    var group = document.getElementById('domain-group');
                    group.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    setTimeout(function() { group.style.borderColor = ''; }, 1500);
                    return false;
                }
                return true;
            }
            return true; // Steps 3 and 4 don't require validation to proceed
        }

        // Shake animation for invalid fields
        function shakeField(id) {
            var el = document.getElementById(id);
            el.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            el.style.animation = 'none';
            el.offsetHeight; // reflow
            el.style.animation = 'eShake 0.4s ease';
            setTimeout(function() {
                el.style.borderColor = '';
                el.style.animation = '';
            }, 1500);
        }

        // Add shake keyframes dynamically
        var shakeStyle = document.createElement('style');
        shakeStyle.textContent = '@keyframes eShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }';
        document.head.appendChild(shakeStyle);

        // Populate review
        function populateReview() {
            var name = document.getElementById('f-name').value.trim();
            var email = document.getElementById('f-email').value.trim();
            var link = document.getElementById('f-link').value.trim();

            var domainRadio = document.querySelector('input[name="domain"]:checked');
            var domainValue = domainRadio ? domainRadio.value : '';
            var domainLabels = {
                engineering: 'Engineering',
                research: 'Research',
                design: 'Design',
                strategy: 'Strategy & Leadership',
                other: document.getElementById('f-other-domain').value.trim() || 'Other'
            };

            var interestChecks = document.querySelectorAll('input[name="interests"]:checked');
            var interests = [];
            var interestLabels = {
                memory: 'Organizational Memory Systems',
                agents: 'Autonomous Agent Networks',
                twin: 'Digital Organizational Twin',
                governance: 'AI Governance & Safety',
                architecture: 'Platform Architecture & Infrastructure',
                evaluation: 'Evaluation & Benchmarking Frameworks'
            };
            interestChecks.forEach(function(c) {
                interests.push(interestLabels[c.value] || c.value);
            });

            var experience = document.getElementById('f-experience').value.trim();
            var motivation = document.getElementById('f-motivation').value.trim();

            var html = '';

            html += '<div class="e-review-block">';
            html += '<div class="e-review-label">Identity</div>';
            html += '<div class="e-review-value">' + escapeHtml(name) + '<br><span style="color:var(--color-gray-500);font-size:0.8125rem;">' + escapeHtml(email) + '</span>';
            if (link) html += '<br><span style="color:var(--color-gray-500);font-size:0.8125rem;">' + escapeHtml(link) + '</span>';
            html += '</div></div>';

            html += '<div class="e-review-block">';
            html += '<div class="e-review-label">Domain</div>';
            html += '<div class="e-review-value">' + escapeHtml(domainLabels[domainValue] || domainValue) + '</div>';
            html += '</div>';

            if (interests.length > 0) {
                html += '<div class="e-review-block">';
                html += '<div class="e-review-label">Interests</div>';
                html += '<div class="e-review-value">' + interests.map(escapeHtml).join(', ') + '</div>';
                html += '</div>';
            }

            if (experience) {
                html += '<div class="e-review-block">';
                html += '<div class="e-review-label">Relevant experience</div>';
                html += '<div class="e-review-value">' + escapeHtml(experience) + '</div>';
                html += '</div>';
            }

            if (motivation) {
                html += '<div class="e-review-block">';
                html += '<div class="e-review-label">Motivation</div>';
                html += '<div class="e-review-value">' + escapeHtml(motivation) + '</div>';
                html += '</div>';
            }

            document.getElementById('review-content').innerHTML = html;
        }

        // Escape HTML
        function escapeHtml(str) {
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }

        // Bind navigation buttons
        nextButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var target = parseInt(this.getAttribute('data-goto'));
                goToStep(target);
            });
        });

        // Show/hide "Other" field
        domainRadios.forEach(function(radio) {
            radio.addEventListener('change', function() {
                otherDomainField.style.display = this.value === 'other' ? 'block' : 'none';
            });
        });

        // Agreement checkbox enables submit
        agreeCheckbox.addEventListener('change', function() {
            submitBtn.disabled = !this.checked;
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!agreeCheckbox.checked) return;

            // Simulate submission
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:0.5rem;"><span class="e-mono" style="font-size:0.75rem;">Sending...</span></span>';

            setTimeout(function() {
                form.style.display = 'none';
                document.querySelector('.e-form-progress').style.display = 'none';
                successEl.classList.add('active');
            }, 1200);
        });

    })();
