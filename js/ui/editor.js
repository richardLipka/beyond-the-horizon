/**
 * editor.js - editor datoveho souboru objects.json primo v prohlizeci.
 * In-browser editor for the objects.json data file.
 *
 * Editor pracuje na vlastni kopii dat. Kazda zmena se hned promitne do
 * diagramu (applyData), ale na disk/do prohlizece se uklada az na tlacitko.
 * The editor works on its own copy; every change is previewed immediately,
 * but storing it is an explicit action.
 *
 * (c) 2026 Richard Lipka <lipka@fav.zcu.cz> - MIT license
 */
(function (HL) {
  'use strict';

  const el = HL.dom.el;

  function mount(container, app) {
    const refs = {};
    let working = null;
    let selectedId = null;
    let applying = false;
    let signature = null;
    let rawOpen = false;

    // ---- pomocne prvky formulare / form building blocks -------------------

    function textInput(value, oninput, attrs) {
      return el('input', Object.assign({ type: 'text', class: 'text-input', value: value || '', oninput }, attrs || {}));
    }

    function numberInput(value, oninput, attrs) {
      return el(
        'input',
        Object.assign({ type: 'number', class: 'num-input', value: value, oninput }, attrs || {})
      );
    }

    function row(labelKey, control, hintKey) {
      return el('div', { class: 'form-row' }, [
        el('label', { class: 'field-label', text: HL.i18n.t(labelKey) }),
        control,
        hintKey ? el('p', { class: 'hint', text: HL.i18n.t(hintKey) }) : null,
      ]);
    }

    // ---- prace s daty / data plumbing ------------------------------------

    function setErrors(errors) {
      HL.dom.clear(refs.errors);
      if (!errors || !errors.length) {
        refs.errors.style.display = 'none';
        return;
      }
      refs.errors.style.display = '';
      refs.errors.appendChild(el('strong', { text: HL.i18n.t('editor.invalid') }));
      const list = el('ul');
      for (const error of errors) {
        list.appendChild(el('li', { text: HL.i18n.t(error.key, error.params) }));
      }
      refs.errors.appendChild(list);
    }

    function apply() {
      const check = HL.data.validate(working);
      setErrors(check.errors);
      if (!check.ok) return false;
      applying = true;
      app.applyData(working);
      applying = false;
      // Zmena prisla od nas, takze si rovnou srovname podpis - jinak by se
      // editor pri pristim prekresleni zbytecne cely postavil znovu
      // (a zahodil by rozepsany formular i hlasku "Uloženo").
      signature = `${HL.i18n.lang()}|${app.state().dataStamp}`;
      return true;
    }

    function status(message, tone) {
      refs.status.textContent = message || '';
      refs.status.className = 'editor-status' + (tone ? ' is-' + tone : '');
    }

    function selected() {
      return working.objects.find((o) => o.id === selectedId) || null;
    }

    function uniqueId(base) {
      let candidate = base;
      let n = 2;
      while (working.objects.some((o) => o.id === candidate)) candidate = `${base}-${n++}`;
      return candidate;
    }

    // ---- seznam objektu / object list ------------------------------------

    function renderList() {
      HL.dom.clear(refs.list);
      for (const item of working.objects) {
        refs.list.appendChild(
          el(
            'button',
            {
              type: 'button',
              class: 'editor-item' + (item.id === selectedId ? ' is-active' : ''),
              onclick: () => {
                selectedId = item.id;
                renderList();
                renderForm();
              },
            },
            [
              el('span', { class: 'editor-item-thumb' }, [
                item.image ? el('img', { src: item.image, alt: '' }) : el('span', { text: '❓' }),
              ]),
              el('span', { class: 'editor-item-text' }, [
                el('strong', { text: HL.i18n.pick(item.name, item.id) }),
                el('span', { text: HL.format.height(item.height, HL.i18n.lang()) }),
              ]),
            ]
          )
        );
      }
      refs.count.textContent = HL.i18n.t('editor.count', { n: working.objects.length });
    }

    // ---- formular / the form ---------------------------------------------

    function renderForm() {
      HL.dom.clear(refs.form);
      const item = selected();
      if (!item) {
        refs.form.appendChild(el('p', { class: 'editor-empty', text: HL.i18n.t('editor.empty') }));
        return;
      }
      const t = HL.i18n.t;
      item.name = item.name || {};
      item.fact = item.fact || {};

      // --- zakladni udaje ---
      const categorySelect = el(
        'select',
        {
          class: 'text-input',
          onchange: (e) => {
            item.category = e.target.value;
            apply();
          },
        },
        (working.categories || []).map((category) =>
          el('option', {
            value: category.id,
            selected: category.id === item.category,
            text: `${category.icon || ''} ${HL.i18n.pick(category.name, category.id)}`.trim(),
          })
        )
      );
      if (!(working.categories || []).some((c) => c.id === item.category)) {
        categorySelect.appendChild(el('option', { value: item.category, selected: true, text: item.category }));
      }

      const baselineSelect = el(
        'select',
        {
          class: 'text-input',
          onchange: (e) => {
            item.baseline = e.target.value;
            apply();
          },
        },
        [
          el('option', { value: 'ground', selected: item.baseline !== 'sea', text: t('editor.baseline.ground') }),
          el('option', { value: 'sea', selected: item.baseline === 'sea', text: t('editor.baseline.sea') }),
        ]
      );

      refs.form.appendChild(
        el('section', { class: 'form-section' }, [
          el('h4', { text: t('editor.section.basics') }),
          el('div', { class: 'form-grid' }, [
            row(
              'editor.field.id',
              textInput(item.id, null, {
                onchange: (e) => {
                  const next = String(e.target.value).trim().replace(/\s+/g, '-').toLowerCase();
                  if (!next) {
                    e.target.value = item.id;
                    return;
                  }
                  if (next !== item.id && working.objects.some((o) => o.id === next)) {
                    e.target.value = item.id;
                    return;
                  }
                  const wasSelected = selectedId === item.id;
                  item.id = next;
                  if (wasSelected) selectedId = next;
                  if (apply()) {
                    renderList();
                    e.target.value = next;
                  }
                },
              })
            ),
            row('editor.field.category', categorySelect),
            row(
              'editor.field.nameCs',
              textInput(item.name.cs, (e) => {
                item.name.cs = e.target.value;
                if (apply()) renderList();
              })
            ),
            row(
              'editor.field.nameEn',
              textInput(item.name.en, (e) => {
                item.name.en = e.target.value;
                if (apply()) renderList();
              })
            ),
            row(
              'editor.field.height',
              numberInput(
                item.height,
                (e) => {
                  const value = parseFloat(e.target.value);
                  item.height = isFinite(value) ? value : 0;
                  if (apply()) renderList();
                },
                { min: 0.1, step: 0.1 }
              )
            ),
            row('editor.field.baseline', baselineSelect),
            row(
              'editor.field.defaultDistance',
              numberInput(
                item.defaultDistance ? item.defaultDistance / 1000 : '',
                (e) => {
                  const value = parseFloat(e.target.value);
                  item.defaultDistance = isFinite(value) && value > 0 ? value * 1000 : null;
                  apply();
                },
                { min: 0.1, step: 0.5 }
              )
            ),
            row(
              'editor.field.aspect',
              numberInput(
                item.aspect,
                (e) => {
                  const value = parseFloat(e.target.value);
                  item.aspect = isFinite(value) && value > 0 ? value : 1;
                  apply();
                  updatePreview(item);
                },
                { min: 0.05, step: 0.05 }
              )
            ),
          ]),
        ])
      );

      // --- texty ---
      refs.form.appendChild(
        el('section', { class: 'form-section' }, [
          el('h4', { text: t('editor.section.texts') }),
          row(
            'editor.field.factCs',
            el('textarea', {
              class: 'text-input',
              rows: 2,
              text: item.fact.cs || '',
              oninput: (e) => {
                item.fact.cs = e.target.value;
                apply();
              },
            })
          ),
          row(
            'editor.field.factEn',
            el('textarea', {
              class: 'text-input',
              rows: 2,
              text: item.fact.en || '',
              oninput: (e) => {
                item.fact.en = e.target.value;
                apply();
              },
            })
          ),
        ])
      );

      // --- obrazek ---
      refs.preview = el('div', { class: 'image-preview' });
      const fileInput = el('input', {
        type: 'file',
        accept: 'image/*',
        class: 'visually-hidden',
        onchange: async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          try {
            const dataUri = await HL.data.readImageAsDataUri(file);
            item.image = dataUri;
            const detected = await detectAspect(dataUri);
            if (detected) item.aspect = detected;
            if (apply()) {
              renderList();
              renderForm();
            }
          } catch (error) {
            status(HL.i18n.t('data.readError', { error: error.message }), 'error');
          }
          e.target.value = '';
        },
      });

      refs.form.appendChild(
        el('section', { class: 'form-section' }, [
          el('h4', { text: t('editor.section.image') }),
          el('div', { class: 'image-editor' }, [
            refs.preview,
            el('div', { class: 'image-actions' }, [
              fileInput,
              el('button', {
                type: 'button',
                class: 'btn btn-secondary',
                text: t('editor.image.choose'),
                onclick: () => fileInput.click(),
              }),
              item.image
                ? el('button', {
                    type: 'button',
                    class: 'btn btn-ghost',
                    text: t('editor.image.clear'),
                    onclick: () => {
                      item.image = null;
                      if (apply()) {
                        renderList();
                        renderForm();
                      }
                    },
                  })
                : null,
              el('p', { class: 'hint', text: t('editor.image.hint') }),
            ]),
          ]),
        ])
      );
      updatePreview(item);

      // --- akce s objektem ---
      refs.form.appendChild(
        el('div', { class: 'form-actions' }, [
          el('button', {
            type: 'button',
            class: 'btn btn-secondary',
            text: t('editor.duplicate'),
            onclick: () => {
              const copy = HL.data.clone(item);
              copy.id = uniqueId(item.id + '-copy');
              working.objects.splice(working.objects.indexOf(item) + 1, 0, copy);
              selectedId = copy.id;
              if (apply()) {
                renderList();
                renderForm();
              }
            },
          }),
          el('button', {
            type: 'button',
            class: 'btn btn-danger',
            text: t('editor.delete'),
            onclick: () => {
              const name = HL.i18n.pick(item.name, item.id);
              if (!window.confirm(t('editor.deleteConfirm', { name }))) return;
              working.objects = working.objects.filter((o) => o !== item);
              selectedId = working.objects.length ? working.objects[0].id : null;
              if (apply()) {
                renderList();
                renderForm();
              }
            },
          }),
        ])
      );
    }

    function updatePreview(item) {
      if (!refs.preview) return;
      HL.dom.clear(refs.preview);
      const height = 150;
      if (item.image) {
        refs.preview.appendChild(
          el('img', {
            src: item.image,
            alt: '',
            style: { height: height + 'px', width: height * (item.aspect || 1) + 'px' },
          })
        );
      } else {
        refs.preview.appendChild(el('span', { class: 'hint', text: HL.i18n.t('editor.image.none') }));
      }
      refs.preview.appendChild(
        el('span', { class: 'image-preview-caption', text: HL.i18n.t('editor.previewNote') })
      );
    }

    /** Zjisti pomer stran nahraneho obrazku. */
    function detectAspect(dataUri) {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          if (image.naturalWidth > 0 && image.naturalHeight > 0) {
            resolve(Math.round((image.naturalWidth / image.naturalHeight) * 1000) / 1000);
          } else {
            resolve(null);
          }
        };
        image.onerror = () => resolve(null);
        image.src = dataUri;
      });
    }

    // ---- surovy JSON / raw JSON ------------------------------------------

    function renderRaw() {
      refs.rawWrap.style.display = rawOpen ? '' : 'none';
      refs.rawToggle.textContent = HL.i18n.t(rawOpen ? 'editor.rawHide' : 'editor.raw');
      if (rawOpen) refs.rawText.value = JSON.stringify(working, null, 2);
    }

    // ---- sestaveni obalu / build the shell -------------------------------

    function build() {
      HL.dom.clear(container);
      const t = HL.i18n.t;

      refs.status = el('span', { class: 'editor-status' });
      refs.count = el('span', { class: 'editor-count' });
      refs.errors = el('div', { class: 'editor-errors', style: { display: 'none' } });

      const loadInput = el('input', {
        type: 'file',
        accept: 'application/json,.json',
        class: 'visually-hidden',
        onchange: async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          try {
            const text = await HL.data.readFile(file);
            const parsed = HL.data.parse(text);
            if (!parsed.ok) {
              setErrors(parsed.errors);
              return;
            }
            const check = HL.data.validate(parsed.data);
            setErrors(check.errors);
            if (!check.ok) return;
            working = HL.data.normalise(parsed.data);
            selectedId = working.objects.length ? working.objects[0].id : null;
            if (apply()) {
              renderList();
              renderForm();
              renderRaw();
              status(t('editor.saved'), 'ok');
            }
          } catch (error) {
            status(t('data.readError', { error: error.message }), 'error');
          }
          e.target.value = '';
        },
      });

      refs.rawToggle = el('button', {
        type: 'button',
        class: 'btn btn-ghost',
        text: t('editor.raw'),
        onclick: () => {
          rawOpen = !rawOpen;
          renderRaw();
        },
      });

      const toolbar = el('div', { class: 'editor-toolbar' }, [
        el('button', {
          type: 'button',
          class: 'btn btn-primary',
          text: t('editor.save'),
          onclick: () => {
            if (!apply()) return;
            status(HL.data.saveLocal(working) ? t('editor.saved') : 'localStorage ✕', 'ok');
            app.refreshDataBadge();
          },
        }),
        el('button', {
          type: 'button',
          class: 'btn btn-secondary',
          text: t('editor.download'),
          onclick: () => HL.data.download(working),
        }),
        el('button', {
          type: 'button',
          class: 'btn btn-secondary',
          text: t('editor.load'),
          onclick: () => loadInput.click(),
        }),
        el('button', {
          type: 'button',
          class: 'btn btn-ghost',
          text: t('editor.factory'),
          onclick: () => {
            if (!window.confirm(t('editor.factoryConfirm'))) return;
            HL.data.clearLocal();
            working = HL.data.normalise(HL.data.factory());
            selectedId = working.objects.length ? working.objects[0].id : null;
            if (apply()) {
              renderList();
              renderForm();
              renderRaw();
              status('', null);
              app.refreshDataBadge();
            }
          },
        }),
        refs.rawToggle,
        loadInput,
        refs.status,
      ]);

      refs.list = el('div', { class: 'editor-list' });
      refs.form = el('div', { class: 'editor-form' });

      refs.rawText = el('textarea', { class: 'raw-json', rows: 18, spellcheck: 'false' });
      refs.rawWrap = el('div', { class: 'card raw-wrap', style: { display: 'none' } }, [
        refs.rawText,
        el('button', {
          type: 'button',
          class: 'btn btn-primary',
          text: t('editor.rawApply'),
          onclick: () => {
            const parsed = HL.data.parse(refs.rawText.value);
            if (!parsed.ok) {
              setErrors(parsed.errors);
              return;
            }
            const check = HL.data.validate(parsed.data);
            setErrors(check.errors);
            if (!check.ok) return;
            working = HL.data.normalise(parsed.data);
            if (!working.objects.some((o) => o.id === selectedId)) {
              selectedId = working.objects.length ? working.objects[0].id : null;
            }
            if (apply()) {
              renderList();
              renderForm();
            }
          },
        }),
      ]);

      container.appendChild(
        el('header', { class: 'panel-head' }, [
          el('h2', { text: t('editor.heading') }),
          el('p', { class: 'panel-sub', text: t('editor.intro') }),
        ])
      );
      container.appendChild(toolbar);
      container.appendChild(el('p', { class: 'hint editor-note', text: t('editor.storageNote') }));
      container.appendChild(refs.errors);
      container.appendChild(
        el('div', { class: 'editor-body' }, [
          el('div', { class: 'editor-side' }, [
            el('div', { class: 'editor-side-head' }, [
              el('h3', { text: t('editor.list') }),
              refs.count,
            ]),
            el('button', {
              type: 'button',
              class: 'btn btn-secondary btn-block',
              text: t('editor.add'),
              onclick: () => {
                const fresh = {
                  id: uniqueId('novy-objekt'),
                  category: (working.categories[0] || { id: 'other' }).id,
                  name: { cs: HL.i18n.t('editor.newObject'), en: 'New object' },
                  height: 50,
                  aspect: 0.6,
                  baseline: 'ground',
                  defaultDistance: 25000,
                  fact: { cs: '', en: '' },
                  image: null,
                };
                working.objects.push(fresh);
                selectedId = fresh.id;
                if (apply()) {
                  renderList();
                  renderForm();
                }
              },
            }),
            refs.list,
          ]),
          refs.form,
        ])
      );
      container.appendChild(refs.rawWrap);
    }

    function update(state) {
      if (applying) return;
      const nextSignature = `${HL.i18n.lang()}|${state.dataStamp}`;
      const needsData = working === null || signature === null || signature.split('|')[1] !== String(state.dataStamp);
      if (needsData) working = HL.data.clone(state.data);
      if (nextSignature === signature) return;
      signature = nextSignature;

      if (!working.objects.some((o) => o.id === selectedId)) {
        // rovnou nabidneme objekt, ktery uzivatel prave zkouma
        const preferred = working.objects.find((o) => o.id === state.objectId);
        selectedId = preferred ? preferred.id : working.objects.length ? working.objects[0].id : null;
      }
      build();
      renderList();
      renderForm();
      renderRaw();
    }

    return { update };
  }

  HL.Editor = { mount };
})((window.HorizonLab = window.HorizonLab || {}));
