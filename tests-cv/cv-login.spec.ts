import { expect, test } from '@playwright/test';

import {
  CV_MARKERS,
  CV_TEST_PASSWORD,
  expectCvContent,
  expectLoginScreen,
  expectNoCvContent,
  expectNoHorizontalOverflow,
  login,
} from './cv-helpers';

// End-to-end coverage of the /cv password gate in a real browser. Pure request/response logic is
// already covered by tests/cv-auth.test.mjs (node:test); everything here needs a live DOM — the
// inline toggle script executing under the hashed CSP, keyboard operation, cookie round-trips,
// and layout. Run with: npm run test:e2e:cv

test.describe('Login screen', () => {
  test('anonymous visit renders the login screen and no CV content', async ({ page }) => {
    const response = await page.goto('/cv');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Private CV access/);
    await expectLoginScreen(page);
    await expect(page.getByRole('button', { name: 'Open private CV' })).toBeVisible();
    await expectNoCvContent(page);
  });

  test('password field starts masked, and does not steal focus', async ({ page }) => {
    await page.goto('/cv');

    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    // No autofocus on a clean load: it would skip a screen reader past the h1 and the sentence
    // explaining where to get the password. Focus IS moved on the error render (see login flow).
    await expect(page.locator('#password')).not.toBeFocused();
  });
});

test.describe('Show/hide password toggle', () => {
  test('is revealed by script, flips the field, and reverts', async ({ page }) => {
    await page.goto('/cv');

    const toggle = page.locator('#toggle-password');
    const field = page.locator('#password');

    // Visible at all only because the inline script ran, which in turn only happens if the CSP
    // hash in api/cv.js still matches the script it ships. A drift there fails right here.
    await expect(toggle).toBeVisible();
    // No aria-pressed by design: a changing accessible name plus a pressed state announces
    // "Hide password, pressed", which reads as the opposite of the real state. State is carried
    // by the #password-status live region instead.
    await expect(toggle).not.toHaveAttribute('aria-pressed', /.*/);
    await expect(toggle).toHaveAttribute('aria-label', 'Show password');
    await expect(toggle).toHaveAttribute('aria-controls', 'password');
    await expect(field).toHaveAttribute('type', 'password');

    await toggle.click();
    await expect(field).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-label', 'Hide password');
    await expect(page.locator('#password-status')).toHaveText('Your password is visible');

    await toggle.click();
    await expect(field).toHaveAttribute('type', 'password');
    await expect(page.locator('#password-status')).toHaveText('Your password is hidden');
    await expect(toggle).toHaveAttribute('aria-label', 'Show password');
  });

  test('reveals the typed password rather than clearing it', async ({ page }) => {
    await page.goto('/cv');

    await page.locator('#password').fill('hunter2');
    await page.locator('#toggle-password').click();

    await expect(page.locator('#password')).toHaveValue('hunter2');
  });

  // Regression guard. This was briefly broken: the script used `icon.hidden = reveal`, but `hidden`
  // is an IDL attribute of HTMLElement and these icons are SVGElements, so the assignment created a
  // JS expando and never reflected to the `hidden` content attribute — the eye icon stayed visible
  // in both states. api/cv.js now uses toggleAttribute. Asserting computed visibility rather than
  // the property keeps this honest whichever way it is implemented.
  test('swaps the eye / eye-off icon with the field state', async ({ page }) => {
    await page.goto('/cv');

    const eye = page.locator('#toggle-password [data-icon="eye"]');
    const eyeOff = page.locator('#toggle-password [data-icon="eye-off"]');

    await expect(eye).toBeVisible();
    await expect(eyeOff).toBeHidden();

    await page.locator('#toggle-password').click();

    await expect(eye).toBeHidden();
    await expect(eyeOff).toBeVisible();

    await page.locator('#toggle-password').click();

    await expect(eye).toBeVisible();
    await expect(eyeOff).toBeHidden();
  });
});

test.describe('Keyboard accessibility', () => {
  test('toggle is reachable by Tab and activates with Enter and Space', async ({ page }) => {
    await page.goto('/cv');

    const toggle = page.locator('#toggle-password');
    const field = page.locator('#password');

    await field.fill('hunter2');
    await expect(field).toBeFocused();

    // One Tab from the field lands on the toggle: no keyboard trap, no skipped stop.
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(field).toHaveAttribute('type', 'text');
    // The handler deliberately returns focus to the field so typing can continue. The point of the
    // assertion is that focus lands somewhere useful rather than being dropped to <body>.
    await expect(field).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();

    await page.keyboard.press('Space');
    await expect(field).toHaveAttribute('type', 'password');
    await expect(field).toBeFocused();

    // Value survived both activations.
    await expect(field).toHaveValue('hunter2');
  });

  test('the form can be submitted entirely from the keyboard', async ({ page }) => {
    await page.goto('/cv');

    await page.locator('#password').fill(CV_TEST_PASSWORD);
    // Implicit submission from within the field.
    await page.keyboard.press('Enter');

    await expectCvContent(page);
  });
});

test.describe('Without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the toggle stays hidden and the form still logs in', async ({ page }) => {
    await page.goto('/cv');

    // Progressive enhancement: the button ships with the `hidden` attribute and is only revealed by
    // the script, so a no-JS visitor never sees a control that cannot work.
    await expect(page.locator('#toggle-password')).toBeHidden();
    await expectLoginScreen(page);

    await page.locator('#password').fill(CV_TEST_PASSWORD);
    await page.getByRole('button', { name: 'Open private CV' }).click();

    await expectCvContent(page);
  });
});

test.describe('Login flow', () => {
  test('a wrong password shows an announced error and no CV content', async ({ page }) => {
    await page.goto('/cv');
    await page.locator('#password').fill('not-the-password');

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/cv') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Open private CV' }).click(),
    ]);

    expect(response.status()).toBe(401);

    // role="alert" is what makes this reach a screen reader rather than only sighted users.
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/could not verify/i);

    // Still on the login screen, still able to retry, and nothing leaked.
    await expectLoginScreen(page);
    await expectNoCvContent(page);
  });

  test('the correct password logs in and renders the CV', async ({ page }) => {
    await login(page);

    await expectCvContent(page);
    await expect(page).toHaveTitle(/Don Listwin CV/);
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });

  test('the source-faithful two-page preview uses Letter proportions', async ({ page }) => {
    await login(page);

    const pages = page.locator('.page');
    await expect(pages).toHaveCount(2);
    for (const preview of await pages.all()) {
      await expect(preview).toHaveAttribute('width', '1224');
      await expect(preview).toHaveAttribute('height', '1584');
      await expect(preview).toHaveJSProperty('naturalWidth', 1224);
      await expect(preview).toHaveJSProperty('naturalHeight', 1584);
    }
  });

  test('printing keeps only the clean Letter pages', async ({ page }) => {
    await login(page);
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('.header')).toBeHidden();
    await expect(page.locator('.fallback')).toBeHidden();
    await expect(page.locator('.page').first()).toHaveCSS('width', '816px');
    await expect(page.locator('.page').first()).toHaveCSS('height', '1056px');
  });

  test('authenticated Word download and PDF preview stay private and usable', async ({ page }) => {
    await login(page);

    const documents = await page.evaluate(async () => {
      const inspect = async (url: string) => {
        const response = await fetch(url);
        const body = new Uint8Array(await response.arrayBuffer());
        return {
          status: response.status,
          contentType: response.headers.get('content-type'),
          disposition: response.headers.get('content-disposition'),
          length: body.length,
          prefix: new TextDecoder().decode(body.slice(0, 5)),
        };
      };

      return {
        word: await inspect('/cv/download.doc'),
        pdf: await inspect('/cv/document.pdf'),
      };
    });

    expect(documents.word.status).toBe(200);
    expect(documents.word.contentType).toBe('application/msword');
    expect(documents.word.disposition).toMatch(/^attachment;/);
    expect(documents.word.length).toBe(44032);

    expect(documents.pdf.status).toBe(200);
    expect(documents.pdf.contentType).toBe('application/pdf');
    expect(documents.pdf.disposition).toMatch(/^inline;/);
    expect(documents.pdf.prefix).toBe('%PDF-');
  });

  test('the session survives a reload', async ({ page }) => {
    await login(page);
    await expectCvContent(page);

    await page.reload();

    await expectCvContent(page);
  });

  test('sign out returns to the login screen and re-gates the CV', async ({ page }) => {
    await login(page);
    await expectCvContent(page);

    await page.getByRole('button', { name: 'Sign out' }).click();

    await expectLoginScreen(page);
    await expectNoCvContent(page);

    // The cookie is really gone, not just navigated away from.
    await page.goto('/cv');
    await expectLoginScreen(page);
    await expectNoCvContent(page);
  });
});

test.describe('Responsive', () => {
  for (const width of [360, 390]) {
    test(`login screen has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/cv');

      await expectLoginScreen(page);
      await expectNoHorizontalOverflow(page);

      // The toggle must stay inside the field rather than being pushed off the edge.
      const toggle = await page.locator('#toggle-password').boundingBox();
      expect(toggle).not.toBeNull();
      expect(toggle!.x + toggle!.width).toBeLessThanOrEqual(width);
    });

    test(`CV renders with no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await login(page);

      await expectCvContent(page);
      await expectNoHorizontalOverflow(page);
    });
  }
});

// No automated axe pass: @axe-core/playwright is not a dependency of this project and these tests
// do not add one. The checks below are the hand-written equivalent of the axe rules that actually
// apply to this page (html-has-lang, label, button-name, page-has-heading-one, duplicate-id,
// meta-viewport). Colour contrast is not asserted — it cannot be computed reliably in-test without
// axe. If you do want the real thing: npm i -D @axe-core/playwright, then replace this block.
test.describe('Accessibility', () => {
  test('login screen passes the core a11y checks', async ({ page }) => {
    await page.goto('/cv');

    // html-has-lang
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // page-has-heading-one: exactly one h1, and it is not empty.
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(/\S/);

    // document-title
    await expect(page).toHaveTitle(/\S/);

    // label: the input is reachable by its visible label text, which also proves for/id association.
    await expect(page.getByLabel('Access password')).toHaveAttribute('id', 'password');
    await expect(page.locator('label[for="password"]')).toBeVisible();

    // button-name: both buttons expose an accessible name.
    await expect(page.getByRole('button', { name: 'Show password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open private CV' })).toBeVisible();

    // The icons are decorative and must not pollute the button's accessible name.
    for (const icon of ['eye', 'eye-off']) {
      await expect(page.locator(`[data-icon="${icon}"]`)).toHaveAttribute('aria-hidden', 'true');
    }

    // The toggle is a real button, so it is keyboard-operable and announced as pressable.
    await expect(page.locator('#toggle-password')).toHaveAttribute('type', 'button');

    // meta-viewport: zooming must not be disabled.
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no/i);
    expect(viewport).not.toMatch(/maximum-scale\s*=\s*1/i);

    // duplicate-id
    const duplicateIds = await page.evaluate(() => {
      const seen = new Map<string, number>();
      for (const el of document.querySelectorAll('[id]')) {
        seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      }
      return [...seen].filter(([, count]) => count > 1).map(([id]) => id);
    });
    expect(duplicateIds).toEqual([]);

    // Every form control that is EXPOSED to assistive tech has an accessible name. Controls that
    // are not in the accessibility tree (the password-manager username field is display:none) are
    // legitimately unnamed — naming them would be meaningless, since nothing can reach them.
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('input, select, textarea')]
      .filter((el) => {
        const exposed =
          (el as HTMLElement).offsetParent !== null
          && el.getAttribute('aria-hidden') !== 'true'
          && (el as HTMLInputElement).type !== 'hidden';
        if (!exposed) return false;
        const id = el.getAttribute('id');
        return !(
          (id && document.querySelector(`label[for="${id}"]`))
          || el.getAttribute('aria-label')
          || el.getAttribute('aria-labelledby')
          || el.closest('label')
        );
      })
      .map((el) => el.outerHTML));
    expect(unnamed).toEqual([]);
  });

  // The username field exists purely so password managers can label the saved credential, and so
  // Safari does not interrupt with "enter the username for this account".
  //
  // It is deliberately CSS-clipped rather than display:none. Chromium and Firefox both EXCLUDE
  // type="hidden" inputs from password parsing outright, and display:none makes Chromium classify
  // the field as invisible — clipping keeps it in the parse as a superset. So the invariant is not
  // "the browser cannot see it" (the browser must) but "a human cannot reach or perceive it".
  test('the password-manager username field is inert for real users', async ({ page }) => {
    await page.goto('/cv');

    const username = page.locator('#username');
    await expect(username).toHaveCount(1);
    await expect(username).toHaveAttribute('autocomplete', 'username');
    await expect(username).toHaveAttribute('aria-hidden', 'true');
    await expect(username).toHaveAttribute('tabindex', '-1');
    await expect(username).toHaveJSProperty('readOnly', true);

    // Must be a real text input: type="hidden" is excluded by Chromium and Firefox.
    await expect(username).toHaveAttribute('type', 'text');

    // Imperceptible: no more than a clipped pixel.
    const box = await username.boundingBox();
    expect(box === null || (box.width <= 1 && box.height <= 1)).toBe(true);

    // Not in the tab order — focus goes from the password field straight to the toggle.
    await page.locator('#password').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#toggle-password')).toBeFocused();

    // It carries a human-readable label for the vault entry — never the secret itself.
    await expect(username).toHaveValue('Don Listwin CV');
    await expect(username).not.toHaveValue(CV_TEST_PASSWORD);
  });

  test('the toggle keeps a visible focus indicator', async ({ page }) => {
    await page.goto('/cv');

    await page.locator('#password').focus();
    await page.keyboard.press('Tab');

    const outlineWidth = await page.locator('#toggle-password').evaluate(
      (el) => getComputedStyle(el).outlineWidth,
    );
    expect(parseFloat(outlineWidth)).toBeGreaterThan(0);
  });

  test('CV page passes the core a11y checks', async ({ page }) => {
    await login(page);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/\S/);
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download Word CV' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open printable PDF' })).toBeVisible();
  });
});

// Guard rail: the markers really do appear once logged in, so every "must not contain" assertion
// above is testing something real rather than passing vacuously.
test('CV markers are present once authenticated', async ({ page }) => {
  await login(page);

  expect(await page.content()).toMatch(CV_MARKERS);
});
